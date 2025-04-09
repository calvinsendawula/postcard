import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ModeToggle } from "../components/ModeToggle";
import { motion } from "framer-motion";

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-muted/30 flex items-center justify-center px-4 py-12">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-50 bg-grid-pattern"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5 dark:bg-primary/10"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Theme toggle positioned absolutely */}
      <div className="absolute top-5 right-5 z-50">
        <ModeToggle />
      </div>

      {/* Main content area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and welcome text */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">P</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            Welcome to Postcard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground"
          >
            Sign in or create an account to continue
          </motion.p>
        </div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-card/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-border/50"
        >
          <div className="p-8">
            <form id="login-form" onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium inline-block">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-background/50 border-input/50 focus:border-primary focus:ring focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium inline-block">
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
                    className="h-12 rounded-xl bg-background/50 border-input/50 focus:border-primary focus:ring focus:ring-primary/20"
                  />
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-destructive/10 rounded-xl p-4"
                  >
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <Button 
                  type="submit" 
                  form="login-form"
                  disabled={loading || !email || !password}
                  className="w-full h-12 rounded-xl relative overflow-hidden group transition-all"
                >
                  <span className="relative z-10">
                    {loading ? 'Processing...' : 'Sign In'}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleSignUp} 
                  disabled={loading || !email || !password}
                  className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5"
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 