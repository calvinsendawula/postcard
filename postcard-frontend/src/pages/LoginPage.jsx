import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

  // Simple CSS styles directly in the JSX
  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      position: 'relative'
    },
    themeToggle: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 10
    },
    card: {
      width: '360px',
      maxWidth: '90%',
      backgroundColor: '#242424',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    header: {
      padding: '24px',
      textAlign: 'center'
    },
    logo: {
      width: '50px',
      height: '50px',
      margin: '0 auto 16px',
      backgroundColor: '#7c3aed',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px'
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0
    },
    form: {
      padding: '0 24px 24px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      fontSize: '14px',
      color: 'white',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    error: {
      padding: '12px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#f87171',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '16px'
    },
    buttonPrimary: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#7c3aed',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginBottom: '12px',
      transition: 'background-color 0.2s'
    },
    buttonSecondary: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    footer: {
      padding: '12px 24px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.4)',
      margin: 0
    }
  };

  return (
    <div style={styles.container}>
      {/* Theme toggle */}
      <div style={styles.themeToggle}>
        <ModeToggle />
      </div>

      {/* Login card */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>P</div>
          <h1 style={styles.title}>Welcome to Postcard</h1>
          <p style={styles.subtitle}>Sign in or create an account to continue</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            style={styles.buttonPrimary}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          
          <button 
            type="button"
            onClick={handleSignUp}
            disabled={loading || !email || !password}
            style={styles.buttonSecondary}
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 