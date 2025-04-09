import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { TextInputArea } from './components/TextInputArea';
import { EntryList } from './components/EntryList';
import { SearchArea } from './components/SearchArea';
import { Loader2, LogOut } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const handleSignOut = async () => {
    await signOut();
  };

  const styles = {
    '@global': {
      body: {
        margin: 0,
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        color: '#f0f0f0',
        minHeight: '100vh',
      },
      '*': {
        boxSizing: 'border-box'
      },
      '::selection': {
        background: 'rgba(124, 58, 237, 0.3)',
        color: '#fff'
      }
    },
    loadingOverlay: {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      color: 'white'
    },
    loadingText: {
      marginTop: '16px',
      fontSize: '16px',
      opacity: 0.8
    },
    appContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 24px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'white'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    signOutButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: 'rgba(255, 255, 255, 0.8)',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    },
    signOutButtonHover: {
        background: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white'
    },
    mainContent: {
      flexGrow: 1
    },
    footer: {
      marginTop: '48px',
      paddingTop: '24px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.5)'
    }
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    let cssText = '';
    if (styles['@global']) {
      for (const selector in styles['@global']) {
        if (Object.hasOwnProperty.call(styles['@global'], selector)) {
          cssText += `${selector} { ${Object.entries(styles['@global'][selector]).map(([prop, val]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val};`).join('')} }\n`;
        }
      }
    }
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
    return () => {
        if (styleElement.parentNode === document.head) {
             document.head.removeChild(styleElement);
        }
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingOverlay}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={styles.loadingText}>Initializing...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.headerContainer}>
        <h1 style={styles.headerTitle}>Postcard</h1>
        <div style={styles.headerActions}>
          <button 
            onClick={handleSignOut} 
            style={styles.signOutButton}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.signOutButtonHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.signOutButton)}
          >
             <LogOut size={16} />
             <span>Sign Out</span>
          </button>
        </div>
      </div>

      <main style={styles.mainContent}>
        <TextInputArea /> 
        <SearchArea /> 
        <EntryList />
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Postcard App
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
