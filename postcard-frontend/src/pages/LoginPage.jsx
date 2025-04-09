import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ModeToggle } from "../components/ModeToggle";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithPassword, signUp } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithPassword(email, password);
      if (error) throw error;
      // Navigation happens automatically via AuthProvider listening to state changes
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      alert('Check your email for the confirmation link!'); // Supabase sends a confirmation email by default
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">Welcome to Postcard</CardTitle>
          <CardDescription className="text-center text-base">Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form id="login-form" onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>
              {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2 pb-6 px-6">
          <Button 
            className="w-full sm:w-auto text-base py-5" 
            variant="outline" 
            onClick={handleSignUp} 
            disabled={loading || !email || !password}
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </Button>
          <Button 
            className="w-full sm:w-auto text-base py-5" 
            type="submit" 
            form="login-form" 
            disabled={loading || !email || !password}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 