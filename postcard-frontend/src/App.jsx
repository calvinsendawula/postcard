import { useState, useEffect } from 'react';
import { EntryList } from './components/EntryList';
import { EntryForm } from './components/EntryForm';
import { supabase } from './lib/supabaseClient';
import { LoginPage } from './pages/LoginPage';
import { TextInputArea } from "./components/TextInputArea";
import { SearchArea } from "./components/SearchArea";
import { ModeToggle } from "./components/ModeToggle";
import { LogOut, Loader2 } from "lucide-react";

function App() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add animation to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  const handleEntryAdded = (newEntry) => {
    setEntries([newEntry, ...entries]);
  };

  const handleEntriesUpdate = (updatedEntries) => {
    setEntries(updatedEntries);
    // If the selected entry was deleted, clear the selection
    if (selectedEntry && !updatedEntries.find(e => e.id === selectedEntry.id)) {
      setSelectedEntry(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Simple inline styles for the app UI
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      background: '#1a1a1a',
      color: 'white'
    },
    loadingContainer: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      flexDirection: 'column',
      gap: '16px'
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 26, 26, 0.8)',
      backdropFilter: 'blur(10px)'
    },
    headerContent: {
      display: 'flex',
      height: '64px',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 20px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none'
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      background: '#7c3aed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px'
    },
    logoText: {
      fontWeight: '600',
      fontSize: '18px',
      color: 'white'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userEmail: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      padding: '6px 12px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    signOutButton: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.6)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '50%'
    },
    main: {
      flex: 1,
      width: '100%',
      position: 'relative',
      zIndex: 1
    },
    mainContent: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 20px'
    },
    mainContentInner: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    footer: {
      width: '100%',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px 0',
      marginTop: '32px',
      background: 'rgba(26, 26, 26, 0.5)',
      backdropFilter: 'blur(5px)'
    },
    footerContent: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '14px'
    },
    journalHeading: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: 'white'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <div>Loading your entries...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <a href="/" style={styles.logo}>
            <div style={styles.logoIcon}>P</div>
            <span style={styles.logoText}>Postcard</span>
          </a>
          
          <nav style={styles.nav}>
            <div style={styles.userEmail}>
              {user?.email}
            </div>
            
            <ModeToggle />
            
            <button 
              onClick={signOut} 
              style={styles.signOutButton}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.mainContent}>
          <div style={styles.mainContentInner}>
            <SearchArea />
            
            <TextInputArea />
            
            <div>
              <h2 style={styles.journalHeading}>Your Entries</h2>
              <EntryList 
                onEntryClick={handleEntryClick} 
                onUpdate={handleEntriesUpdate}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p>
            Built with AI-powered note taking
          </p>
          <p>
            © {new Date().getFullYear()} Postcard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
