import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, SearchIcon, Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function SearchArea() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Using full Vercel URL for clarity, ensure this matches your deployment
      const response = await fetch('https://postcard-git-main-calvins-projects-5a83f765.vercel.app/api/query', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          userId: user.id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.answer); // Store the synthesized answer

    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to perform search.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-6">
        <Bot size={20} className="text-primary" />
        <h2 className="text-xl font-semibold">Ask Your Journal</h2>
      </div>
      
      <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <form onSubmit={handleSearch} className="p-4">
          <div className="flex w-full gap-3">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. 'What did I work on last week?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
                className="pl-9 h-10 bg-background/50 rounded-lg border-input/30 focus:border-primary/50"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="rounded-lg h-10 px-4 flex gap-2 items-center bg-primary text-primary-foreground shrink-0 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Asking...' : 'Ask'}</span>
            </Button>
          </div>
        </form>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 pb-4"
          >
            <div className="w-full rounded-lg bg-muted/40 border border-border/30 p-6 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10 mb-3" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Searching your journal entries...</p>
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 pb-4"
          >
            <Alert variant="destructive" className="border rounded-lg shadow-sm">
              <AlertTitle className="flex items-center gap-2 font-medium">
                <span>Search Error</span>
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {result && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 pb-4"
          >
            <div className="w-full rounded-lg bg-background border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">Journal Response</h3>
              </div>
              <div className="pl-6 border-l-2 border-primary/20 py-1">
                <div className="prose dark:prose-invert text-foreground/90 max-w-none prose-p:leading-relaxed prose-p:my-3">
                  {result}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 