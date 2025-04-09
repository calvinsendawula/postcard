import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { PenLine, SendIcon, Loader2 } from "lucide-react";

export function TextInputArea() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('entries')
        .insert([{
          raw_text: text,
          user_id: user.id
        }])
        .select();

      if (insertError) throw insertError;

      console.log('Inserted entry:', data);
      setText('');

    } catch (err) {
      console.error('Error submitting entry:', err);
      setError(err.message || 'Failed to submit entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Inline styles for the UI
  const styles = {
    container: {
      marginBottom: '32px'
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px',
      color: 'white',
      fontSize: '20px',
      fontWeight: '600'
    },
    headingIcon: {
      color: '#7c3aed'
    },
    formCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    form: {
      padding: '20px'
    },
    textareaContainer: {
      marginBottom: '16px',
      position: 'relative'
    },
    textarea: {
      width: '100%',
      minHeight: '150px',
      padding: '16px',
      backgroundColor: 'rgba(10, 10, 10, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '16px',
      lineHeight: '1.6',
      fontFamily: 'inherit',
      resize: 'vertical',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    textareaFocus: {
      borderColor: 'rgba(124, 58, 237, 0.5)',
      boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.15)'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '16px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: '#7c3aed',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    buttonDisabled: {
      backgroundColor: 'rgba(124, 58, 237, 0.5)',
      cursor: 'not-allowed'
    },
    buttonHover: {
      backgroundColor: '#6d28d9'
    },
    error: {
      padding: '12px 16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      color: '#f87171',
      fontSize: '14px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    footer: {
      padding: '12px 20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    footerText: {
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.5)'
    },
    aiIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    aiDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: 'rgba(124, 58, 237, 0.7)',
      animation: 'pulse 1.5s infinite'
    },
    '@keyframes pulse': {
      '0%': { opacity: 0.4 },
      '50%': { opacity: 1 },
      '100%': { opacity: 0.4 }
    }
  };

  // Add keyframes for the pulse animation
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.heading}>
        <PenLine size={22} style={styles.headingIcon} />
        <h2>Add New Entry</h2>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.formCard}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.textareaContainer}>
            <textarea
              placeholder="What did you work on today? What problems did you solve?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = styles.textareaFocus.borderColor;
                e.target.style.boxShadow = styles.textareaFocus.boxShadow;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = styles.textarea.borderColor;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
            
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={styles.error}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
            
          <div style={styles.buttonContainer}>
            <button 
              type="submit" 
              disabled={isLoading || !text.trim()}
              style={{
                ...styles.button,
                ...(isLoading || !text.trim() ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!isLoading && text.trim()) {
                  e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && text.trim()) {
                  e.target.style.backgroundColor = styles.button.backgroundColor;
                }
              }}
            >
              {isLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <SendIcon size={18} />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
        
        <div style={styles.footer}>
          <span style={styles.footerText}>
            Your entries are processed with AI to make them searchable
          </span>
          <div style={styles.aiIndicator}>
            <div style={styles.aiDot}></div>
            <span style={styles.footerText}>AI-powered</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 