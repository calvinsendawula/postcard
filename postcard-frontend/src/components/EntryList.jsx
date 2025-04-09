import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, Clock, CalendarDays, BookText, History, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export function EntryList({ onEntryClick, onUpdate }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Failed to load entries. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(entries.filter(entry => entry.id !== id));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Inline styles
  const styles = {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginTop: '16px'
    },
    entryItem: {
      padding: '20px',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      transform: 'translateY(0)'
    },
    entryItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)'
    },
    entryContent: {
      fontSize: '15px',
      lineHeight: '1.7',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '16px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      position: 'relative',
      zIndex: 1
    },
    entryMeta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 1
    },
    entryDate: {
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 10px',
      background: 'rgba(255, 255, 255, 0.06)',
      borderRadius: '20px'
    },
    deleteButton: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    deleteButtonHover: {
      color: 'rgba(239, 68, 68, 0.9)',
      background: 'rgba(239, 68, 68, 0.15)'
    },
    loadingMessage: {
      padding: '40px 0',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    errorMessage: {
      padding: '20px',
      borderRadius: '12px',
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      color: 'rgb(239, 68, 68)',
      fontSize: '15px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    },
    emptyMessage: {
      padding: '40px 0',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    },
    entryBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(79, 70, 229, 0.3) 100%)',
      pointerEvents: 'none',
      transition: 'opacity 0.3s ease'
    },
    entryBackgroundHover: {
      opacity: 0.06
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingMessage}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading your journal entries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorMessage}>
        <AlertTitle style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Error Loading Entries</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={styles.emptyMessage}>
        <BookText size={24} style={{ opacity: 0.6 }} />
        <span>No journal entries yet. Start writing!</span>
      </div>
    );
  }

  return (
    <motion.div 
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {entries.map((entry, index) => {
        const truncatedContent = entry.content.length > 280
          ? `${entry.content.substring(0, 280)}...`
          : entry.content;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div
              onClick={() => onEntryClick(entry)}
              style={styles.entryItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.entryItemHover.backgroundColor;
                e.currentTarget.style.borderColor = styles.entryItemHover.borderColor;
                e.currentTarget.style.boxShadow = styles.entryItemHover.boxShadow;
                e.currentTarget.style.transform = styles.entryItemHover.transform;
                e.currentTarget.querySelector('[data-bg]').style.opacity = styles.entryBackgroundHover.opacity;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = styles.entryItem.backgroundColor;
                e.currentTarget.style.borderColor = styles.entryItem.borderColor;
                e.currentTarget.style.boxShadow = styles.entryItem.boxShadow;
                e.currentTarget.style.transform = styles.entryItem.transform;
                e.currentTarget.querySelector('[data-bg]').style.opacity = styles.entryBackground.opacity;
              }}
            >
              <div data-bg style={styles.entryBackground}></div>
              <div style={styles.entryContent}>{truncatedContent}</div>
              <div style={styles.entryMeta}>
                <div style={styles.entryDate}>
                  <History size={14} />
                  <span>{formatDate(entry.created_at)}</span>
                </div>
                <button
                  onClick={(e) => deleteEntry(entry.id, e)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = styles.deleteButtonHover.color;
                    e.currentTarget.style.background = styles.deleteButtonHover.background;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = styles.deleteButton.color;
                    e.currentTarget.style.background = styles.deleteButton.background;
                  }}
                  aria-label="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 