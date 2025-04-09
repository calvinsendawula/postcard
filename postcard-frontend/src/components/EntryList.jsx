import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, Clock, CalendarDays, BookText } from "lucide-react";
import { motion } from "framer-motion";

export function EntryList() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('id, created_at, raw_text, processed_text')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

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

    const channel = supabase.channel('entries-changes')
      .on(
        'postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime INSERT received:', payload);
          setEntries(currentEntries => [payload.new, ...currentEntries]);
        }
      )
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

    return () => {
      supabase.removeChannel(channel);
      console.log('Realtime channel unsubscribed for entries');
    };

  }, [user]);

  if (loading) {
    return (
      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground">Loading your journal entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl border shadow-sm bg-card/60 backdrop-blur-sm">
        <AlertTitle className="font-medium">Error Loading Entries</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm p-8 text-center">
        <BookText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/70" />
        <h3 className="text-lg font-medium mb-2">No Entries Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start adding journal entries to keep track of your work and make it searchable with AI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid gap-4"
      >
        {entries.map((entry, index) => (
          <EntryCard key={entry.id} entry={entry} index={index} />
        ))}
      </motion.div>
    </div>
  );
}

function EntryCard({ entry, index }) {
  // Format the date nicely
  const date = new Date(entry.created_at);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-card/50 hover:bg-card/80 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm overflow-hidden transition-all duration-300 hover:shadow"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{formattedTime}</span>
          </div>
        </div>
        
        <div className="prose dark:prose-invert prose-sm max-w-none text-foreground/90 line-clamp-4 group-hover:line-clamp-none transition-all">
          {entry.processed_text || entry.raw_text}
        </div>
      </div>
    </motion.div>
  );
} 