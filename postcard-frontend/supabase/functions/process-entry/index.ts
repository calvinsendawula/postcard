// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@^2';
// Import directly from esm.sh URL for online editor compatibility
import { GoogleGenAI } from "npm:@google/genai@^0.17.0"; // Use npm: specifier

console.log("Initializing process-entry function v5 - using @google/genai from URL");

const GEMINI_MODEL_TEXT = "gemini-2.0-flash";
const GEMINI_MODEL_EMBEDDING = "text-embedding-001";
const EMBEDDING_DIMENSIONS = 384; // Ensure this matches the DB column ('vector(384)')

// Define the expected structure for relationship inserts
interface RelationshipInsert {
  entry_id: string;
  entity_id: string;
  relationship_type: string;
}

// Safety settings structure might be different or applied differently in @google/genai
// Relying on defaults or API-level settings if needed.

Deno.serve(async (req) => {
  try {
    console.log("Function invoked");
    const payload = await req.json();
    // Handle both direct invocation ({ record: ... }) and webhook ({ type: 'INSERT', record: ... })
    const record = payload?.record ?? (payload?.type === 'INSERT' ? payload.record : null);
    const entryId = record?.id;

    if (!entryId) {
        console.error("Missing entry ID in payload:", payload);
        throw new Error("Missing entry ID in payload");
    }
    console.log(`Processing entry ID: ${entryId}`);

    // --- Get Environment Variables ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      console.error("Missing environment variables:", { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey, geminiApiKey: !!geminiApiKey });
      throw new Error("Missing required environment variables.");
    }
    console.log("Environment variables loaded");

    // --- Initialize Clients ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("Clients initialized");

    // --- Fetch Raw Text ---
    const { data: entryData, error: fetchError } = await supabase
      .from('entries')
      .select('id, raw_text')
      .eq('id', entryId)
      .single();

    if (fetchError) {
      console.error(`Error fetching entry ${entryId}:`, fetchError);
      throw fetchError;
    }
    if (!entryData) {
        console.warn(`Entry not found for ID: ${entryId}`);
        // Return success as there's nothing to process
        return new Response(JSON.stringify({ success: true, entryId, message: "Entry not found, nothing to process." }), {
            headers: { "Content-Type": "application/json" }, status: 200
        });
    }
    const rawText = entryData.raw_text;
    if (!rawText || rawText.trim() === "") {
        console.log(`Entry ${entryId} has empty raw_text, skipping AI processing.`);
        // Optionally update the entry state or just return success
        return new Response(JSON.stringify({ success: true, entryId, message: "Skipped empty entry" }), {
          headers: { "Content-Type": "application/json" }, status: 200
        });
    }
    console.log(`Fetched raw text for ${entryId}: "${rawText.substring(0, 100)}..."`);

    // --- Generate Embedding ---
    console.log(`Generating embedding for ${entryId} using ${GEMINI_MODEL_EMBEDDING}...`);
    let embedding: number[] = [];
    try {
        const embeddingResponse = await genAI.models.embedContent({
            model: GEMINI_MODEL_EMBEDDING,
            content: rawText,
            // taskType: "RETRIEVAL_DOCUMENT" // Consider adding if appropriate for use case
        });
        // Validate embedding structure from response
        if (embeddingResponse?.embedding?.values && embeddingResponse.embedding.values.length === EMBEDDING_DIMENSIONS) {
             embedding = embeddingResponse.embedding.values;
        } else {
            console.error("Embedding generation failed or returned unexpected structure/dimension.", embeddingResponse);
            throw new Error(`Failed to generate valid embedding of dimension ${EMBEDDING_DIMENSIONS}`);
        }
        console.log(`Generated embedding for ${entryId}: [${embedding.slice(0, 3)}...]`);
    } catch (embeddingError) {
         console.error(`Error generating embedding for entry ${entryId}:`, embeddingError);
         throw embeddingError; // Re-throw to report failure
    }


    // --- Generate Refined Text, Entities, and Relationships ---
    console.log(`Generating structured data for ${entryId} using ${GEMINI_MODEL_TEXT}...`);
    const prompt = `Analyze the following developer note:\\n\\\"\\\"\\\"\\n${rawText}\\n\\\"\\\"\\\"\\n\\nBased ONLY on the text provided, perform the following tasks:\\n1.  **Refine Text:** Rewrite the note into clear, structured documentation suitable for a knowledge base. Use markdown formatting (like headings, lists, code blocks if appropriate). If the input is already well-structured, just return it.\\n2.  **Extract Entities:** Identify key entities (projects, technologies, components, concepts, people, bug IDs, etc.) mentioned. For each entity, provide its name and a general type (e.g., \'project\', \'technology\', \'concept\', \'person\', \'bug_id\').\\n3.  **Extract Relationships:** Describe the relationships between the identified entities *within the context of this note*. For example: \\\"Entity A uses Technology B\\\", \\\"Entity C fixes Bug D\\\".\\n\\nFormat the output STRICTLY as a JSON object with the following keys:\\n- \\\"processed_text\\\": (string) The refined documentation text.\\n- \\\"entities\\\": (array of objects) Each object should have \\\"name\\\" (string) and \\\"type\\\" (string).\\n- \\\"relationships\\\": (array of objects) Each object should have \\\"subject_entity\\\" (string), \\\"relationship_type\\\" (string), and \\\"object_entity\\\" (string).\\n\\nExample output format:\\n{\\n  \\\"processed_text\\\": \\\"### Authentication Flow Bug Fix\\\\n\\\\n- **Issue:** Annoying bug in the authentication flow.\\\\n- **Solution:** Added proper error handling to the login form component.\\\\n- **Details:** Ensured all edge cases return user-friendly messages.\\\",\\n  \\\"entities\\\": [\\n    { \\\"name\\\": \\\"authentication flow\\\", \\\"type\\\": \\\"concept\\\" },\\n    { \\\"name\\\": \\\"login form\\\", \\\"type\\\": \\\"component\\\" },\\n    { \\\"name\\\": \\\"error handling\\\", \\\"type\\\": \\\"concept\\\" }\\n  ],\\n  \\\"relationships\\\": [\\n    { \\\"subject_entity\\\": \\\"login form\\\", \\\"relationship_type\\\": \\\"received\\\", \\\"object_entity\\\": \\\"error handling\\\" },\\n    { \\\"subject_entity\\\": \\\"error handling\\\", \\\"relationship_type\\\": \\\"fixed\\\", \\\"object_entity\\\": \\\"authentication flow\\\" }\\n  ]\\n}\\n\\nIf no entities or relationships can be reliably extracted from the text, return empty arrays for those keys. Provide only the JSON object in your response.`;

    let structuredData: any = {}; // Initialize structuredData
    try {
        const generationResponse = await genAI.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt,
            generationConfig: {
                responseMimeType: "application/json",
            },
            // safetySettings: safetySettings // Add safety settings if needed and supported by this API structure
        });

        // Accessing the response text - adjust based on actual response structure if needed
        const responseText = generationResponse?.candidates?.[0]?.content?.parts?.[0]?.text || generationResponse?.text;
        if (!responseText) {
            console.error("Failed to get text from Gemini response:", JSON.stringify(generationResponse));
            throw new Error("Failed to extract text from AI response.");
        }

        structuredData = JSON.parse(responseText);

    } catch (generationError) {
        console.error(`Error during Gemini text generation/parsing for entry ${entryId}:`, generationError);
        // Decide how to handle: fallback, re-throw, or update with partial data?
        // For now, we'll fallback processed_text to rawText and skip entity/relationship processing
        structuredData = { processed_text: rawText, entities: [], relationships: [] };
        // Consider re-throwing if failure is critical: throw generationError;
    }

    const processed_text = structuredData.processed_text || rawText; // Fallback
    const extractedEntities = structuredData.entities || [];
    // Relationships currently unused, but keep extraction for future use:
    // const extractedRelationships = structuredData.relationships || [];

    console.log(`Processed text generated for ${entryId}: "${processed_text.substring(0, 100)}..."`);
    console.log(`Extracted entities for ${entryId}:`, extractedEntities.length);

    // --- Update Database Entry ---
    console.log(`Updating entry ${entryId} with processed text and embedding...`);
    const { error: updateError } = await supabase
      .from('entries')
      .update({ processed_text, embedding }) // Use the generated embedding
      .eq('id', entryId);

    if (updateError) {
      console.error(`Error updating entry ${entryId}:`, updateError);
      // Don't necessarily throw here, maybe relationship processing can still proceed?
      // Or log and return failure? For now, log and continue to relationship processing.
    } else {
        console.log(`Successfully updated entry ${entryId} with AI results.`);
    }


    // --- Upsert Entities and Create Simplified 'Mentions' Relationships ---
    console.log(`Processing entities and relationships for ${entryId}...`);
    const entityMap = new Map<string, string>(); // Map entity name to DB ID

    if (extractedEntities.length > 0) {
      for (const entity of extractedEntities) {
        // Validate entity data from AI
        if (!entity.name || typeof entity.name !== 'string' || !entity.type || typeof entity.type !== 'string' || entity.name.trim() === "") {
            console.warn(`Skipping invalid or empty entity format from AI for entry ${entryId}:`, entity);
            continue;
        }
        const cleanName = entity.name.trim();
        const cleanType = entity.type.trim();

        try {
            const { data: upsertedEntityData, error: entityUpsertError } = await supabase
                .from('entities')
                .upsert({ name: cleanName, type: cleanType }, { onConflict: 'name' }) // Use cleaned name/type
                .select('id, name')
                .single();

            if (entityUpsertError) {
                console.error(`Error upserting entity '${cleanName}' for entry ${entryId}:`, entityUpsertError);
                continue; // Skip this entity if upsert fails
            }
            console.log(`Upserted entity: ${upsertedEntityData?.name} with ID: ${upsertedEntityData?.id}`);
            if (upsertedEntityData?.id && upsertedEntityData?.name) {
                entityMap.set(upsertedEntityData.name, upsertedEntityData.id);
            }
        } catch (upsertCatchError) {
            console.error(`Caught exception during upsert for entity '${cleanName}' for entry ${entryId}:`, upsertCatchError);
            // Continue to next entity even if one fails unexpectedly
        }
      }
    }

    // Create relationships using the IDs from entityMap
    if (entityMap.size > 0) {
        const relationshipInserts: RelationshipInsert[] = [];
        for (const entityId of entityMap.values()) {
            relationshipInserts.push({
                entry_id: entryId,
                entity_id: entityId,
                relationship_type: 'mentions' // Simplified relationship type
            });
        }

        if (relationshipInserts.length > 0) {
            console.log(`Inserting/upserting ${relationshipInserts.length} 'mentions' relationships for entry ${entryId}...`);
            const { error: relationshipError } = await supabase
                .from('relationships')
                 // Use upsert to prevent errors if the relationship already exists (idempotent)
                .insert(relationshipInserts, { upsert: true, onConflict: 'entry_id,entity_id,relationship_type' });

            if (relationshipError) {
                 // Log non-duplicate errors - '23505' is unique_violation, ignored by upsert
                 if (relationshipError.code !== '23505') {
                     console.error(`Error inserting/upserting relationships for entry ${entryId}:`, relationshipError);
                 } else {
                    // This case shouldn't happen with upsert=true, but log if it does
                    console.log(`Relationship upsert handled potential duplicates for entry ${entryId}.`);
                 }
            } else {
                console.log(`Successfully inserted/upserted relationships for entry ${entryId}.`);
            }
        }
    }


    console.log(`Processing complete for entry ${entryId}.`);
    return new Response(JSON.stringify({ success: true, entryId }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // Catch all errors during processing
    console.error("Critical Error in process-entry function:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { "Content-Type": "application/json" },
      status: 500, // Return 500 for internal errors
    });
  }
});