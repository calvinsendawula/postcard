import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, Clock, CalendarDays, BookText, History, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function EntryList() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, raw_text, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load entries. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();

      const channel = supabase
        .channel(`public:entries:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'entries', 
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New entry received via Realtime:', payload.new);
            setEntries((currentEntries) => {
              if (currentEntries.some(entry => entry.id === payload.new.id)) {
                return currentEntries;
              }
              return [payload.new, ...currentEntries];
            });
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime channel subscribed for user:', user.id);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime subscription error:', status, err);
            setError('Realtime connection issue. New entries might not appear automatically.');
          }
        });

      return () => {
        console.log('Removing Realtime channel subscription for user:', user.id);
        supabase.removeChannel(channel);
      };

    } else {
      setEntries([]);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const handleDelete = async (entryId) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      setEntries(currentEntries => currentEntries.filter(entry => entry.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid date';
    }
  };

  const styles = {
    container: {
      width: '100%',
      marginTop: '32px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
    },
    entryList: {
      maxHeight: '500px',
      overflowY: 'auto',
      padding: '8px 0',
    },
    entryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      background: 'transparent',
      transition: 'background-color 0.2s ease',
    },
    entryItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    entryContent: {
      flex: 1,
      marginRight: '16px',
    },
    entryText: {
      fontSize: '15px',
      lineHeight: '1.7',
      color: 'rgba(255, 255, 255, 0.9)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      marginBottom: '10px',
    },
    entryDate: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.5)',
      marginTop: '8px',
    },
    entryActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '4px',
    },
    actionButton: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      color: 'rgba(255, 255, 255, 0.5)',
      transition: 'color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
    },
    actionButtonHover: {
      color: 'rgba(255, 255, 255, 0.8)',
      background: 'rgba(255, 255, 255, 0.1)',
    },
    deleteButtonHover: {
      color: '#f87171',
      background: 'rgba(239, 68, 68, 0.15)',
    },
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.7)',
      gap: '10px',
      fontSize: '14px',
    },
    errorState: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      color: '#f87171',
      gap: '12px',
      textAlign: 'center',
      fontSize: '14px',
      background: 'rgba(239, 68, 68, 0.05)',
      borderTop: '1px solid rgba(239, 68, 68, 0.1)',
      borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '14px',
    }
  };

  useEffect(() => {
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
      <div style={styles.header}>
        <h2 style={styles.title}>Your Entries</h2>
      </div>

      {loading && (
        <div style={styles.loadingState}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading entries...</span>
        </div>
      )}

      {error && (
        <div style={styles.errorState}>
          <AlertTriangle size={24} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div style={styles.entryList}>
          <AnimatePresence initial={false}>
            {entries.length === 0 ? (
              <motion.div 
                style={styles.emptyState}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                You haven't added any entries yet.
              </motion.div>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={styles.entryItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.entryItemHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.entryItem.background}
                >
                  <div style={styles.entryContent}>
                    <div style={styles.entryText}>{entry.raw_text}</div>
                    <div style={styles.entryDate}>{formatDate(entry.created_at)}</div>
                  </div>
                  <div style={styles.entryActions}>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleDelete(entry.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = styles.deleteButtonHover.color;
                        e.currentTarget.style.background = styles.deleteButtonHover.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = styles.actionButton.color;
                        e.currentTarget.style.background = styles.actionButton.background;
                      }}
                      title="Delete Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
} 