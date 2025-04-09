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
      gap: '12px',
      marginTop: '16px'
    },
    entryItem: {
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    entryItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    entryContent: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    entryMeta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    entryDate: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    deleteButton: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    deleteButtonHover: {
      color: 'rgba(239, 68, 68, 0.8)',
      background: 'rgba(239, 68, 68, 0.1)'
    },
    loadingMessage: {
      padding: '24px 0',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '14px'
    },
    errorMessage: {
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: 'rgb(239, 68, 68)',
      fontSize: '14px',
      textAlign: 'center'
    },
    emptyMessage: {
      padding: '32px 0',
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      fontSize: '14px'
    }
  };

  if (isLoading) {
    return <div style={styles.loadingMessage}>Loading entries...</div>;
  }

  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  if (entries.length === 0) {
    return <div style={styles.emptyMessage}>No journal entries yet. Start writing!</div>;
  }

  return (
    <div style={styles.container}>
      {entries.map((entry) => {
        const truncatedContent = entry.content.length > 280
          ? `${entry.content.substring(0, 280)}...`
          : entry.content;

        return (
          <div
            key={entry.id}
            onClick={() => onEntryClick(entry)}
            style={styles.entryItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.entryItemHover.backgroundColor;
              e.currentTarget.style.borderColor = styles.entryItemHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.entryItem.backgroundColor;
              e.currentTarget.style.borderColor = styles.entryItem.borderColor;
            }}
          >
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
        );
      })}
    </div>
  );
} 