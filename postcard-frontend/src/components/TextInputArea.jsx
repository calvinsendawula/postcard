import React, { useState } from 'react';
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { PenLine, SendIcon, Loader2 } from "lucide-react";

export function TextInputArea() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('entries')
        .insert([{
          raw_text: text,
          user_id: user.id
        }])
        .select();

      if (insertError) throw insertError;

      console.log('Inserted entry:', data);
      setText('');

    } catch (err) {
      console.error('Error submitting entry:', err);
      setError(err.message || 'Failed to submit entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-6">
        <PenLine size={20} className="text-primary" />
        <h2 className="text-xl font-semibold">Add Journal Entry</h2>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <Textarea
              placeholder="What did you work on today? What problems did you solve?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="resize-y w-full p-3 bg-background/50 rounded-lg border-input/30 focus:border-primary/50 text-sm leading-relaxed focus:ring focus:ring-primary/10"
              disabled={isLoading}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-destructive/10 rounded-lg p-3"
              >
                <p className="text-sm text-destructive font-medium">
                  {error}
                </p>
              </motion.div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || !text.trim()}
                className="rounded-lg px-4 py-2 flex gap-2 items-center bg-primary text-primary-foreground shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Entry'}</span>
              </Button>
            </div>
          </div>
        </form>
        
        <div className="bg-muted/50 p-3 border-t border-border/30">
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">
              Your entries are processed with AI to make them searchable
            </span>
            <div className="ml-auto flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></span>
              <span className="text-xs text-muted-foreground">AI-powered</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 