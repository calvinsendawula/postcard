import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ModeToggle } from "../components/ModeToggle";
import { Loader2 } from 'lucide-react';

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

  // Updated modern CSS styles
  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background, #1a1a1a)',
      position: 'relative'
    },
    themeToggle: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 10
    },
    card: {
      width: '400px',
      maxWidth: '90%',
      backgroundColor: 'var(--card-background, #242424)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      overflow: 'hidden'
    },
    header: {
      padding: '32px 28px 24px',
      textAlign: 'center',
      backgroundImage: 'linear-gradient(to bottom, rgba(124, 58, 237, 0.1), transparent)'
    },
    logo: {
      width: '60px',
      height: '60px',
      margin: '0 auto 20px',
      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '28px',
      fontWeight: 'bold',
      boxShadow: '0 8px 16px rgba(109, 40, 217, 0.25)'
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: 'var(--text-primary, white)',
      margin: '0 0 8px'
    },
    subtitle: {
      fontSize: '15px',
      color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
      margin: 0
    },
    form: {
      padding: '0 28px 28px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--text-secondary, rgba(255, 255, 255, 0.8))'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      fontSize: '15px',
      color: 'var(--text-primary, white)',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    inputFocus: {
      borderColor: 'rgba(124, 58, 237, 0.5)',
      boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.15)'
    },
    error: {
      padding: '12px 16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#f87171',
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid rgba(239, 68, 68, 0.15)'
    },
    buttonPrimary: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#7c3aed',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      marginBottom: '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonPrimaryHover: {
      backgroundColor: '#6d28d9'
    },
    buttonPrimaryDisabled: {
      backgroundColor: 'rgba(124, 58, 237, 0.5)',
      cursor: 'not-allowed'
    },
    buttonSecondary: {
      width: '100%',
      padding: '14px',
      backgroundColor: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '10px',
      color: 'var(--text-primary, white)',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    buttonSecondaryHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.25)'
    },
    buttonSecondaryDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    footer: {
      padding: '16px 28px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      textAlign: 'center'
    },
    footerText: {
      fontSize: '13px',
      color: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
      margin: 0
    },
    loadingAnimation: {
      animation: 'spin 1s linear infinite'
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  };

  // Add this style definition to head for the animation
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
              onFocus={(e) => {
                e.target.style.borderColor = styles.inputFocus.borderColor;
                e.target.style.boxShadow = styles.inputFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.input.borderColor;
                e.target.style.boxShadow = 'none';
              }}
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
              onFocus={(e) => {
                e.target.style.borderColor = styles.inputFocus.borderColor;
                e.target.style.boxShadow = styles.inputFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.input.borderColor;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            style={{
              ...styles.buttonPrimary,
              ...(loading || !email || !password ? styles.buttonPrimaryDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading && email && password) {
                e.target.style.backgroundColor = styles.buttonPrimaryHover.backgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email && password) {
                e.target.style.backgroundColor = styles.buttonPrimary.backgroundColor;
              }
            }}
          >
            {loading && <Loader2 size={18} className="loader-icon" style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button 
            type="button"
            onClick={handleSignUp}
            disabled={loading || !email || !password}
            style={{
              ...styles.buttonSecondary,
              ...(loading || !email || !password ? styles.buttonSecondaryDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading && email && password) {
                e.target.style.backgroundColor = styles.buttonSecondaryHover.backgroundColor;
                e.target.style.borderColor = styles.buttonSecondaryHover.borderColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email && password) {
                e.target.style.backgroundColor = styles.buttonSecondary.backgroundColor;
                e.target.style.borderColor = styles.buttonSecondary.borderColor;
              }
            }}
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