import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

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

      // TODO: Trigger AI processing pipeline here
      // This would likely involve calling a Supabase Edge Function or another backend service
      // For now, we just store the raw text.

    } catch (err) {
      console.error('Error submitting entry:', err);
      setError(err.message || 'Failed to submit entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="What did you work on today? What problems did you solve?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5} // Start with a reasonable number of rows
        className="resize-y" // Allow vertical resizing
        disabled={isLoading}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading || !text.trim()}>
        {isLoading ? 'Processing...' : 'Add Entry'}
      </Button>
    </form>
  );
} 