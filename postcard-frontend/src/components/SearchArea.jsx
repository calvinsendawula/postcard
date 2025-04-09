import React from 'react';
import { Search, History, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

export function SearchArea() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const searchInputRef = React.useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResults([]);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, content, created_at')
        .textSearch('content', searchQuery, { type: 'websearch' })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching entries:', error);
      setErrorMessage('Failed to search entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
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
      marginTop: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      overflow: 'hidden'
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
    resultsHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    resultsTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    resultsList: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '400px',
      overflowY: 'auto'
    },
    resultItem: {
      padding: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      background: 'transparent',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    resultItemHover: {
      background: 'rgba(255, 255, 255, 0.05)'
    },
    resultContent: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '10px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    resultDate: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    emptyMessage: {
      textAlign: 'center',
      padding: '28px 0',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '14px'
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <Search size={20} style={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search your entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            ...(searchQuery ? styles.clearButtonVisible : {})
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
        
        <button 
          type="submit" 
          disabled={isLoading || !searchQuery.trim()} 
          style={{
            ...styles.searchButton,
            opacity: isLoading || !searchQuery.trim() ? 0.6 : 1,
            cursor: isLoading || !searchQuery.trim() ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && searchQuery.trim()) {
              e.target.style.backgroundColor = styles.searchButtonHover.background;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && searchQuery.trim()) {
              e.target.style.backgroundColor = styles.searchButton.background;
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Searching</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Search Results */}
      {(isLoading || searchResults.length > 0 || errorMessage) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {errorMessage && (
            <div style={styles.errorMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading && (
            <div style={styles.loadingIndicator}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Searching your entries...</span>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div style={styles.resultsContainer}>
              <div style={styles.resultsHeader}>
                <div style={styles.resultsTitle}>
                  Found {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'}
                </div>
              </div>
              
              <div style={styles.resultsList}>
                {searchResults.map((entry) => (
                  <div
                    key={entry.id}
                    style={styles.resultItem}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.resultItemHover.background}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.resultItem.background}
                  >
                    <div style={styles.resultContent}>
                      {entry.content?.substring(0, 200)}
                      {(entry.content?.length > 200) ? '...' : ''}
                    </div>
                    <div style={styles.resultDate}>
                      <History size={14} />
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && searchResults.length === 0 && searchQuery && !errorMessage && (
            <div style={styles.emptyMessage}>
              No entries found matching your search
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
} 