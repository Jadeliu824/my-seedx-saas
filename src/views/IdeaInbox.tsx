import { useState, useRef, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Send, ArrowRight, Mic, MicOff, Trash2, X, Check } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
}

export function IdeaInbox({ language = 'CN', isMobile }: { language?: Language, isMobile?: boolean }) {
  const t = translations[language];
  const { ideas, addIdea, updateIdeaStatus, addDraft, deleteIdea } = useWorkflow();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'EN' ? 'en-US' : 'zh-CN'; // Set language

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append final results to the current text
        if (finalTranscript) {
           setInputText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert(t.inbox.voiceNotSupported);
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      addIdea(inputText.trim());
      setInputText('');
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleDeepen = (ideaId: string, content: string) => {
    updateIdeaStatus(ideaId, 'drafting');
    addDraft(ideaId, content.slice(0, 30) + '...');
  };

  const inboxIdeas = ideas.filter(idea => idea.status === 'inbox');

  return (
    <div style={{ padding: '1rem 0' }}>
      <header style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>{t.inbox.title}</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>{t.inbox.subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '3rem' }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.inbox.placeholder}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '1rem',
            paddingRight: '6rem', // Extra space for both buttons
            fontSize: '1rem',
            resize: 'vertical'
          }}
          className="glass-panel"
        />
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={toggleRecording}
            title={t.inbox.voiceInput}
            style={{
              backgroundColor: isRecording ? '#ef4444' : 'var(--bg-surface-hover)',
              color: isRecording ? 'white' : 'var(--text-primary)',
              border: isRecording ? 'none' : '1px solid var(--border-color)',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              backgroundColor: inputText.trim() ? 'var(--accent-primary)' : 'var(--border-color)',
              color: '#000000',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              opacity: inputText.trim() ? 1 : 0.5,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t.inbox.pendingIdeas} ({inboxIdeas.length})</h3>
        
        {inboxIdeas.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">{t.inbox.emptyState}</p>
          </div>
        ) : (
          inboxIdeas.map(idea => (
            <div key={idea.id} className="glass-panel" style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'stretch' : 'flex-start',
              gap: '1rem'
            }}>
              <div>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem', fontWeight: 500 }}>{idea.content}</p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {new Date(idea.createdAt).toLocaleString(language === 'EN' ? 'en-US' : 'zh-CN')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignSelf: isMobile ? 'flex-end' : 'flex-start' }}>
                {deletingIdeaId === idea.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIdea(idea.id);
                        setDeletingIdeaId(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <Check size={14} /> {t.common.confirm}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingIdeaId(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <X size={14} /> {t.common.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingIdeaId(idea.id);
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      transition: 'var(--transition)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <button
                  onClick={() => handleDeepen(idea.id, idea.content)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--accent-primary)',
                    color: 'var(--accent-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                >
                  {t.inbox.expand}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

