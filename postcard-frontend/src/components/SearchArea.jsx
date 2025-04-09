import { useState, useRef } from 'react';
import { Search, History, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export function SearchArea() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const searchInputRef = useRef(null);

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
      position: 'relative'
    },
    searchForm: {
      width: '100%',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      height: '44px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '0 16px 0 42px',
      fontSize: '15px',
      color: 'white',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '12px',
      color: 'rgba(255, 255, 255, 0.5)',
      pointerEvents: 'none'
    },
    searchButton: {
      position: 'absolute',
      right: '8px',
      top: '8px',
      height: '28px',
      padding: '0 12px',
      fontSize: '13px',
      borderRadius: '6px',
      background: '#7c3aed',
      color: 'white',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    resultsContainer: {
      marginTop: '12px'
    },
    loadingIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0',
      color: 'rgba(255, 255, 255, 0.7)',
      gap: '8px'
    },
    errorMessage: {
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: 'rgb(239, 68, 68)',
      fontSize: '14px',
      marginTop: '12px'
    },
    resultsTitle: {
      fontSize: '15px',
      fontWeight: '500',
      marginBottom: '8px',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    resultsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    resultItem: {
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    resultContent: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '8px'
    },
    resultDate: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    emptyMessage: {
      textAlign: 'center',
      padding: '24px 0',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <Search size={18} style={styles.searchIcon} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search your journal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button 
          type="submit" 
          disabled={isLoading || !searchQuery.trim()} 
          style={{
            ...styles.searchButton,
            opacity: isLoading || !searchQuery.trim() ? 0.6 : 1,
            cursor: isLoading || !searchQuery.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Searching</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Search Results */}
      {(isLoading || searchResults.length > 0 || errorMessage) && (
        <div style={styles.resultsContainer}>
          {isLoading && (
            <div style={styles.loadingIndicator}>
              <Loader2 size={18} className="animate-spin" />
              <span>Searching your journal...</span>
            </div>
          )}

          {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}

          {!isLoading && searchResults.length > 0 && (
            <>
              <div style={styles.resultsTitle}>
                Found {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'}
              </div>
              <div style={styles.resultsList}>
                {searchResults.map((entry) => (
                  <div key={entry.id} style={styles.resultItem}>
                    <div style={styles.resultContent}>
                      {entry.content.length > 200
                        ? `${entry.content.substring(0, 200)}...`
                        : entry.content}
                    </div>
                    <div style={styles.resultDate}>
                      <History size={12} />
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isLoading && searchResults.length === 0 && searchQuery && !errorMessage && (
            <div style={styles.emptyMessage}>
              No entries found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 