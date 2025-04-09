import React from 'react';
import { Search, History, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function SearchArea() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState('');
  const [searchResult, setSearchResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const searchInputRef = React.useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setIsLoading(true);
    setSearchResult(null);
    setErrorMessage('');

    try {
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
        throw new Error(errorData.error || `Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResult(data.answer);

    } catch (error) {
      console.error('Error searching entries:', error);
      setErrorMessage(error.message || 'Failed to perform search. Please try again.');
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResult(null);
    setErrorMessage('');
    searchInputRef.current?.focus();
  };

  // Inline styles
  const styles = {
    container: {
      width: '100%',
      position: 'relative',
      marginBottom: '32px'
    },
    searchForm: {
      width: '100%',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      height: '48px',
      background: 'rgba(10, 10, 10, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '0 100px 0 48px',
      fontSize: '16px',
      color: 'white',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    searchInputFocus: {
      borderColor: 'rgba(124, 58, 237, 0.5)',
      boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.15)'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '14px',
      color: 'rgba(255, 255, 255, 0.5)',
      pointerEvents: 'none'
    },
    clearButton: {
      position: 'absolute',
      right: '88px',
      top: '12px',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.6)',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      opacity: 0,
      transform: 'scale(0.8)',
      transition: 'all 0.2s ease',
      pointerEvents: 'none'
    },
    clearButtonVisible: {
      opacity: 1,
      transform: 'scale(1)',
      pointerEvents: 'auto'
    },
    searchButton: {
      position: 'absolute',
      right: '8px',
      top: '8px',
      height: '32px',
      padding: '0 14px',
      fontSize: '14px',
      borderRadius: '8px',
      background: '#7c3aed',
      color: 'white',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'background-color 0.2s ease'
    },
    searchButtonHover: {
      background: '#6d28d9'
    },
    resultsContainer: {
      marginTop: '24px',
      background: 'rgba(255, 255, 255, 0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '20px'
    },
    resultsTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '12px'
    },
    resultContent: {
      fontSize: '15px',
      lineHeight: '1.7',
      color: 'rgba(255, 255, 255, 0.9)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    loadingIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 0',
      color: 'rgba(255, 255, 255, 0.7)',
      gap: '10px'
    },
    errorMessage: {
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: '#f87171',
      fontSize: '14px',
      margin: '16px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
  };

  // Add keyframes animation for spin
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
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <Search size={20} style={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Ask about your entries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => {
            e.target.style.borderColor = styles.searchInputFocus.borderColor;
            e.target.style.boxShadow = styles.searchInputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = styles.searchInput.borderColor;
            e.target.style.boxShadow = 'none';
          }}
        />
        
        <button 
          type="button" 
          onClick={clearSearch}
          style={{
            ...styles.clearButton,
            ...(query ? styles.clearButtonVisible : {})
          }}
          title="Clear search"
        >
          <X size={14} />
        </button>
        
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          style={styles.searchButton}
          onMouseEnter={(e) => { if (!isLoading && query.trim()) e.target.style.background = styles.searchButtonHover.background }}
          onMouseLeave={(e) => { if (!isLoading && query.trim()) e.target.style.background = styles.searchButton.background }}
        >
           {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16}/> }
          <span>{isLoading ? 'Asking...' : 'Search'}</span>
        </button>
      </form>

      {/* Display Area */}
      <div style={{ marginTop: '16px' }}>
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Thinking...</span>
          </div>
        )}
        {errorMessage && (
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             style={styles.errorMessage}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             <span>{errorMessage}</span>
           </motion.div>
        )}
        {searchResult && !isLoading && (
            <motion.div 
                style={styles.resultsContainer}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div style={styles.resultsTitle}>Answer</div>
                <div style={styles.resultContent}>{searchResult}</div>
            </motion.div>
        )}
      </div>
    </div>
  );
} 