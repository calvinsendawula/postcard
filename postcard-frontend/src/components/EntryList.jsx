import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Relative path
import { useAuth } from '../context/AuthContext'; // Relative path
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"; // Relative path
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Relative path

// import { Skeleton } from "./ui/skeleton"; // Relative path if used

export function EntryList() {
  // ... rest of component code remains the same ...
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return; // Don't fetch if no user

    const fetchEntries = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('id, created_at, raw_text, processed_text') // Select needed fields
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }); // Show newest first

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError(err.message || 'Failed to fetch entries.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();

    // --- Set up Realtime Subscription --- 
    const channel = supabase.channel('entries-changes')
      .on(
        'postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${user.id}` // Only listen for inserts for the current user
        },
        (payload) => {
          console.log('Realtime INSERT received:', payload);
          // Add the new entry to the beginning of the list
          setEntries(currentEntries => [payload.new, ...currentEntries]);
        }
      )
       // TODO: Add listener for UPDATE events if needed to update processed_text/embedding display
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime channel subscribed for entries');
        } 
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error:', err);
          setError('Realtime connection failed. Try refreshing.');
        }
        if (status === 'TIMED_OUT') {
            console.warn('Realtime connection timed out.');
        }
      });

    // Cleanup function to unsubscribe when component unmounts or user changes
    return () => {
      supabase.removeChannel(channel);
      console.log('Realtime channel unsubscribed for entries');
    };

  }, [user]); // Re-run effect if user changes

  if (loading) {
    return <Alert><AlertTitle>Loading entries...</AlertTitle></Alert>; 
    // Replace with Skeleton loaders for better UX later
  }

  if (error) {
    return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (entries.length === 0) {
    return <Alert><AlertDescription>No entries yet. Add one above!</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Your Entries</h2>
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            {entry.processed_text ? (
              <CardTitle className="text-lg">Processed Entry</CardTitle> 
            ) : (
              <CardTitle className="text-lg">Raw Entry</CardTitle>
            )}
            <CardDescription>{new Date(entry.created_at).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap"> 
              {entry.processed_text || entry.raw_text}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 