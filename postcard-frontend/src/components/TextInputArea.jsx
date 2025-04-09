import React, { useState } from 'react';
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function TextInputArea() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get user info for associating the entry

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return; // Basic validation

    setIsLoading(true);
    setError('');

    try {
      // 1. Insert the raw text into the 'entries' table
      const { data, error: insertError } = await supabase
        .from('entries')
        .insert([{
          raw_text: text,
          user_id: user.id // Link entry to the logged-in user
          // processed_text and embedding will be added later by the AI pipeline
        }])
        .select(); // Select to get the inserted data back

      if (insertError) throw insertError;

      console.log('Inserted entry:', data);
      setText(''); // Clear the textarea after successful submission

      // Webhook handles the AI processing now

    } catch (err) {
      console.error('Error submitting entry:', err);
      setError(err.message || 'Failed to submit entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border">
      <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="What did you work on today? What problems did you solve?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="resize-y w-full p-3 text-base focus:ring-2 focus:ring-primary/50"
          disabled={isLoading}
        />
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading || !text.trim()}
            className="px-6 py-2"
          >
            {isLoading ? 'Processing...' : 'Add Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
} 