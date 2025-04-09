import React, { useState } from 'react';
import { Input } from "./ui/input"; // Relative path
import { Button } from "./ui/button"; // Relative path
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Relative path
import { useAuth } from '../context/AuthContext'; // Relative path
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Relative path
import { Loader2 } from "lucide-react"; // Import loader icon

export function SearchArea() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // To store the synthesized answer

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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Ask Your Knowledge Base</h2>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="What did I work on last week?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Asking...' : 'Ask'}
        </Button>
      </form>

      {/* Display Results or Errors */} 
      {isLoading && (
         <div className="flex items-center justify-center pt-4">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
         </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {result && !isLoading && (
        <Card className="mt-4 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 