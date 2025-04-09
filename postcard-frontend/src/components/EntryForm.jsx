import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send } from 'lucide-react';

export function EntryForm({ onEntryAdded }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content for your journal entry.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{ content: content.trim() }])
        .select();

      if (error) throw error;

      setContent('');
      if (onEntryAdded && data) {
        onEntryAdded(data[0]);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    // Auto-resize the textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Inline styles
  const styles = {
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    textareaContainer: {
      position: 'relative',
      width: '100%'
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '16px',
      paddingBottom: '48px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      color: 'white',
      fontSize: '15px',
      lineHeight: '1.6',
      resize: 'none',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    textareaFocus: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    submitButton: {
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(147, 51, 234, 0.7)',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    submitButtonHover: {
      backgroundColor: 'rgba(147, 51, 234, 0.9)'
    },
    submitButtonDisabled: {
      backgroundColor: 'rgba(147, 51, 234, 0.3)',
      cursor: 'not-allowed'
    },
    errorMessage: {
      padding: '10px',
      borderRadius: '6px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: 'rgb(239, 68, 68)',
      fontSize: '14px'
    },
    characterCount: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.4)',
      textAlign: 'right',
      marginTop: '4px'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.errorMessage}>{error}</div>}
      
      <div style={styles.textareaContainer}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          placeholder="Write your journal entry here..."
          style={styles.textarea}
          onFocus={(e) => {
            e.target.style.borderColor = styles.textareaFocus.borderColor;
            e.target.style.backgroundColor = styles.textareaFocus.backgroundColor;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = styles.textarea.borderColor;
            e.target.style.backgroundColor = styles.textarea.backgroundColor;
          }}
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          style={{
            ...styles.submitButton,
            ...(isSubmitting || !content.trim() 
              ? styles.submitButtonDisabled 
              : {})
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && content.trim()) {
              e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && content.trim()) {
              e.target.style.backgroundColor = styles.submitButton.backgroundColor;
            }
          }}
        >
          <Send size={18} />
        </button>
      </div>
      
      <div style={styles.characterCount}>
        {content.length} characters
      </div>
    </form>
  );
} 