import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
// Middleware to parse JSON bodies. Increased limit for potentially large AI responses.
app.use(express.json({ limit: '10mb' }));

const GEMINI_MODEL_TEXT = "gemini-2.0-flash";
const GEMINI_MODEL_EMBEDDING = "text-embedding-001";
const EMBEDDING_DIMENSIONS = 384;
const MATCH_THRESHOLD = 0.7; // Similarity threshold for RAG
const MATCH_COUNT = 5; // Number of context results to fetch

// --- Initialize Clients --- 
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
    console.error("CRITICAL: Missing required environment variables (Supabase URL/Service Key or Gemini Key).");
    // Don't start the server if essential config is missing
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

// --- Helper Function for Query Handling --- 
async function handleQuery(req, res) {
    try {
        const { query, userId } = req.body;

        if (!query || !userId) {
            return res.status(400).json({ error: "Missing 'query' or 'userId' in request body." });
        }
        console.log(`Handling query for user ${userId}: "${query}"`);

        // 1. Generate embedding for the user query
        console.log("Generating query embedding...");
        let queryEmbedding;
        try {
            const embeddingResponse = await genAI.models.embedContent({
                model: GEMINI_MODEL_EMBEDDING,
                content: query,
                taskType: "RETRIEVAL_QUERY" // Specify task type for query embedding
            });
            if (embeddingResponse?.embedding?.values?.length === EMBEDDING_DIMENSIONS) {
                queryEmbedding = embeddingResponse.embedding.values;
            } else {
                throw new Error("Invalid query embedding structure received.");
            }
        } catch (embeddingError) {
             console.error(`Error generating query embedding:`, embeddingError);
             return res.status(500).json({ error: `Failed to generate query embedding: ${embeddingError.message}` });
        }
        console.log("Query embedding generated.");

        // 2. Retrieve relevant entries from Supabase
        console.log("Retrieving relevant documents...");
        const { data: documents, error: rpcError } = await supabase.rpc('match_entries', {
            query_embedding: queryEmbedding,
            requesting_user_id: userId,
            match_threshold: MATCH_THRESHOLD,
            match_count: MATCH_COUNT
        });

        if (rpcError) {
            console.error("Error calling match_entries RPC:", rpcError);
            return res.status(500).json({ error: `Failed to retrieve documents: ${rpcError.message}` });
        }
        console.log(`Retrieved ${documents?.length || 0} documents.`);

        // 3. Construct prompt for synthesis
        const contextText = documents && documents.length > 0
            ? documents.map((doc, index) => `Document ${index + 1} (Similarity: ${doc.similarity.toFixed(4)}):\n${doc.content}`).join("\n\n")
            : "No relevant documents found.";
        
        const synthesisPrompt = `Based on the following context documents retrieved from a personal knowledge base, answer the user's query.\nSynthesize the information from the documents to provide a concise and relevant answer. Do not simply list the documents. If the documents don't provide a sufficient answer, say so.\n\nContext Documents:\n---\n${contextText}\n---\n\nUser Query:\n${query}\n\nAnswer:`;

        // 4. Call Gemini for synthesis
        console.log("Synthesizing answer...");
        let synthesizedAnswer = "Sorry, I couldn't generate an answer."; // Default fallback
        try {
            const generationResponse = await genAI.models.generateContent({
                model: GEMINI_MODEL_TEXT,
                contents: synthesisPrompt,
                // generationConfig: { // Optional config like temperature
                //     temperature: 0.7 
                // }, 
            });
            const responseText = generationResponse?.candidates?.[0]?.content?.parts?.[0]?.text || generationResponse?.text;
            if (responseText) {
                 synthesizedAnswer = responseText;
            } else {
                console.warn("Received no text response from Gemini for synthesis.");
            }
        } catch (synthesisError) {
             console.error("Error during synthesis:", synthesisError);
             synthesizedAnswer = "An error occurred while synthesizing the answer.";
        }

        console.log("Synthesis complete.");
        // 5. Return the synthesized answer
        return res.status(200).json({ answer: synthesizedAnswer });

    } catch (error) {
        console.error("Unhandled error in query handler:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

// --- Main Webhook Handler (from previous steps) --- 
// Renamed to handleWebhook for clarity
async function handleWebhook(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    // Optional: Add webhook secret verification here if you set one
    // const webhookSecret = process.env.WEBHOOK_SECRET;
    // if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
    //     console.warn("Unauthorized webhook attempt - invalid secret.");
    //     return res.status(401).send("Unauthorized");
    // }

    try {
        console.log("Webhook received");
        const payload = req.body;
        // Supabase webhook payload structure for INSERT
        const record = payload?.record;
        const entryId = record?.id;

        if (!entryId) {
            console.warn("Webhook received without entry ID in payload.record.id:", payload);
            // Acknowledge receipt but indicate no action taken
            return res.status(200).json({ message: "Payload received, but no entry ID found.", receivedPayload: payload });
        }
        console.log(`Processing entry ID from webhook: ${entryId}`);

        // Fetch raw_text - redundant if it's already in the payload.record, but safer.
        const { data: entryData, error: fetchError } = await supabase
            .from('entries')
            .select('id, raw_text')
            .eq('id', entryId)
            .single();

        if (fetchError) {
            console.error(`Error fetching entry ${entryId}:`, fetchError);
            // Respond with server error if DB fetch fails
            return res.status(500).json({ error: `Failed to fetch entry: ${fetchError.message}` });
        }
        if (!entryData) {
             console.warn(`Entry ${entryId} not found in DB.`);
             // Acknowledge receipt but indicate entry missing
             return res.status(200).json({ message: `Entry ${entryId} not found.` });
        }
        const rawText = entryData.raw_text;
        if (!rawText || rawText.trim() === "") {
            console.log(`Entry ${entryId} has empty raw_text, skipping AI processing.`);
            return res.status(200).json({ message: `Skipped empty entry ${entryId}` });
        }
        console.log(`Fetched raw text for ${entryId}: "${rawText.substring(0, 100)}..."`);

        // --- Generate Embedding --- 
        console.log(`Generating embedding for ${entryId}...`);
        let embedding;
        try {
            const embeddingResponse = await genAI.models.embedContent({
                model: GEMINI_MODEL_EMBEDDING,
                content: rawText,
            });
            if (embeddingResponse?.embedding?.values?.length === EMBEDDING_DIMENSIONS) {
                embedding = embeddingResponse.embedding.values;
            } else {
                throw new Error("Invalid embedding structure received.");
            }
            console.log(`Generated embedding for ${entryId}.`);
        } catch (embeddingError) {
            console.error(`Error generating embedding for ${entryId}:`, embeddingError);
            // Decide how to handle: stop processing or continue without embedding?
            // For now, let's stop and report error
            return res.status(500).json({ error: `Failed to generate embedding: ${embeddingError.message}` });
        }

        // --- Generate Structured Data (Refined Text, Entities) --- 
        console.log(`Generating structured data for ${entryId}...`);
        const prompt = `Analyze the following developer note:\n\"\"\"\n${rawText}\n\"\"\"\n\nBased ONLY on the text provided, perform the following tasks:\n1.  **Refine Text:** Rewrite the note into clear, structured documentation suitable for a knowledge base. Use markdown formatting (like headings, lists, code blocks if appropriate). If the input is already well-structured, just return it.\n2.  **Extract Entities:** Identify key entities (projects, technologies, components, concepts, people, bug IDs, etc.) mentioned. For each entity, provide its name and a general type (e.g., 'project', 'technology', 'concept', 'person', 'bug_id').\n\nFormat the output STRICTLY as a JSON object with the following keys:\n- \"processed_text\": (string) The refined documentation text.\n- \"entities\": (array of objects) Each object should have \"name\" (string) and \"type\" (string).\n\nExample output format:\n{\n  \"processed_text\": \"### Authentication Flow Bug Fix\\n\\n- **Issue:** Annoying bug in the authentication flow.\\n- **Solution:** Added proper error handling to the login form component.\\n- **Details:** Ensured all edge cases return user-friendly messages.\",\n  \"entities\": [\n    { \"name\": \"authentication flow\", \"type\": \"concept\" },\n    { \"name\": \"login form\", \"type\": \"component\" },\n    { \"name\": \"error handling\", \"type\": \"concept\" }\n  ]\n}\n\nIf no entities or relationships can be reliably extracted from the text, return empty arrays for those keys. Provide only the JSON object in your response.`;

        let processed_text = rawText; // Default fallback
        let extractedEntities = [];
        try {
            const generationResponse = await genAI.models.generateContent({
                model: GEMINI_MODEL_TEXT,
                contents: prompt,
                generationConfig: { responseMimeType: "application/json" },
            });
            const responseText = generationResponse?.candidates?.[0]?.content?.parts?.[0]?.text || generationResponse?.text;
            if (responseText) {
                const structuredData = JSON.parse(responseText);
                processed_text = structuredData.processed_text || rawText;
                extractedEntities = structuredData.entities || [];
            } else {
                 console.warn(`Received no text response from Gemini for ${entryId}. Falling back to raw text.`);
            }
            console.log(`Generated structured data for ${entryId}. Entities: ${extractedEntities.length}`);
        } catch (generationError) {
            console.error(`Error during Gemini text generation/parsing for ${entryId}:`, generationError);
            // Fallback to raw text, continue processing without entities
            processed_text = rawText;
            extractedEntities = [];
        }

        // --- Update Database Entry --- 
        console.log(`Updating entry ${entryId}...`);
        const { error: updateError } = await supabase
            .from('entries')
            .update({ processed_text, embedding })
            .eq('id', entryId);

        if (updateError) {
            console.error(`Error updating entry ${entryId}:`, updateError);
            // If update fails, we probably should return an error
            return res.status(500).json({ error: `Failed to update entry: ${updateError.message}` });
        }
        console.log(`Successfully updated entry ${entryId}.`);

        // --- Upsert Entities and Relationships --- 
        if (extractedEntities.length > 0) {
             console.log(`Processing ${extractedEntities.length} entities for ${entryId}...`);
             const entityMap = new Map();
             for (const entity of extractedEntities) {
                if (!entity.name || typeof entity.name !== 'string' || !entity.type || typeof entity.type !== 'string' || entity.name.trim() === "") {
                    console.warn(`Skipping invalid entity format for ${entryId}:`, entity);
                    continue;
                }
                const cleanName = entity.name.trim();
                const cleanType = entity.type.trim();
                try {
                    const { data: upsertedEntityData, error: entityUpsertError } = await supabase
                        .from('entities')
                        .upsert({ name: cleanName, type: cleanType }, { onConflict: 'name' })
                        .select('id, name')
                        .single();
                    if (entityUpsertError) throw entityUpsertError;
                    if (upsertedEntityData?.id && upsertedEntityData?.name) {
                        entityMap.set(upsertedEntityData.name, upsertedEntityData.id);
                    }
                } catch(entityError) {
                    console.error(`Error upserting entity '${cleanName}' for ${entryId}:`, entityError);
                    // Continue processing other entities
                }
            }

            if (entityMap.size > 0) {
                const relationshipInserts = [];
                for (const entityId of entityMap.values()) {
                    relationshipInserts.push({ entry_id: entryId, entity_id: entityId, relationship_type: 'mentions' });
                }
                console.log(`Attempting to insert/upsert ${relationshipInserts.length} relationships for ${entryId}...`);
                const { error: relationshipError } = await supabase
                    .from('relationships')
                    .insert(relationshipInserts, { upsert: true, onConflict: 'entry_id,entity_id,relationship_type' });
                if (relationshipError && relationshipError.code !== '23505') {
                    console.error(`Error inserting/upserting relationships for ${entryId}:`, relationshipError);
                    // Log error but don't fail the whole request just for relationships
                } else {
                    console.log(`Relationships processed for ${entryId}.`);
                }
            }
        }

        console.log(`Processing complete for ${entryId}.`);
        // Send success response back to Supabase webhook
        return res.status(200).json({ success: true, entryId });

    } catch (error) {
        console.error("Unhandled error in webhook handler:", error);
        // Generic error response for unexpected issues
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

// --- Vercel Serverless Function Router --- 
export default function handler(req, res) {
    // Route requests based on URL path
    if (req.url.startsWith('/api/query')) {
        // Handle query requests
        return handleQuery(req, res);
    } else {
        // Assume other POST requests are webhooks (or root path)
        // GET requests to root handled by app.get below
        if (req.method === 'POST') {
             return handleWebhook(req, res);
        } else {
            // Handle other methods or paths if needed, or return 404
             res.setHeader('Allow', 'POST, GET');
             return res.status(404).send('Not Found');
        }
    }
}

// Add a simple root route for health checks or Vercel default behavior
app.get('/', (req, res) => {
  res.status(200).send('Postcard Backend AI Processor is running.');
});

// Start server locally (for testing, Vercel uses the export default handler)
// const PORT = process.env.PORT || 3001;
// if (process.env.NODE_ENV !== 'production') { // Simple check to avoid running locally on Vercel
//     app.listen(PORT, () => {
//         console.log(`Server listening locally on port ${PORT}`);
//     });
// } 