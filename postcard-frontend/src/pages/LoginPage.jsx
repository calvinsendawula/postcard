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
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="shadow-xl border">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-3xl font-bold text-center">Welcome to Postcard</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-6 px-6">
            <form id="login-form" onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-6">
                <div className="flex flex-col space-y-2.5">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base px-4"
                  />
                </div>
                
                <div className="flex flex-col space-y-2.5">
                  <Label htmlFor="password" className="text-base font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base px-4"
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-destructive text-center font-medium mt-2 p-2 bg-destructive/10 rounded-md">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 px-6 pb-8 pt-2">
            <Button 
              className="w-full h-12 text-base font-medium" 
              type="submit" 
              form="login-form" 
              disabled={loading || !email || !password}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </Button>
            
            <Button 
              className="w-full h-12 text-base font-medium" 
              variant="outline" 
              onClick={handleSignUp} 
              disabled={loading || !email || !password}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 