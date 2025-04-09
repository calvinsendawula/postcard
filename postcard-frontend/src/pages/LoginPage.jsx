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
      alert('Check your email for the confirmation link!');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      
      <div className="flex w-full flex-col justify-center space-y-6 sm:w-[500px] px-8">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Postcard</h1>
          <p className="text-sm text-muted-foreground">Sign in or create an account to continue</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form id="login-form" onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-5">
                <div className="space-y-2">
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
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
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
                    className="h-12 text-base"
                  />
                </div>
                
                {error && (
                  <div className="bg-destructive/10 rounded-md p-3">
                    <p className="text-sm text-destructive text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 p-6 pt-2">
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