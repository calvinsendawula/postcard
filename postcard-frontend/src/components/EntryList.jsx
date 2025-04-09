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
import { Loader2 } from "lucide-react"; // Import loader icon

// import { Skeleton } from "./ui/skeleton"; // Relative path if used

export function EntryList() {
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
    return (
      <div className="bg-card rounded-lg border shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4 border shadow-sm">
        <AlertTitle className="font-semibold">Error Loading Entries</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <Alert className="border shadow-sm p-6">
        <AlertTitle className="font-semibold mb-2">No Entries Found</AlertTitle>
        <AlertDescription>You haven't added any entries yet. Use the form above to get started!</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Your Entries</h2>
        <span className="text-sm text-muted-foreground">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      
      <div className="grid gap-6">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-2 bg-muted/40">
              <CardDescription className="text-sm font-medium">
                {new Date(entry.created_at).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {entry.processed_text || entry.raw_text}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 