import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import { SearchIcon } from "lucide-react";

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
    <div className="bg-card rounded-lg shadow-sm p-6 border space-y-5">
      <h2 className="text-xl font-semibold">Ask Your Knowledge Base</h2>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-3">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="What did I work on last week?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="pl-10 h-11 text-base"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="px-6 h-11"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Asking...' : 'Ask'}
        </Button>
      </form>

      {/* Display Results or Errors */} 
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Searching your entries...</p>
          </div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4 border shadow-sm">
          <AlertTitle className="font-medium">Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && !isLoading && (
        <Card className="mt-4 bg-card border shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg font-medium">Answer</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-base">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 