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

export function IdeaInbox({ language = 'EN', isMobile }: { language?: Language, isMobile?: boolean }) {
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
            minHeight: isMobile ? '140px' : '160px',
            padding: '1.25rem',
            paddingBottom: '3.5rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            resize: 'none'
          }}
          className="glass-panel"
        />
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={toggleRecording}
            title={t.inbox.voiceInput}
            style={{
              backgroundColor: isRecording ? '#ef4444' : 'rgba(255,255,255,0.05)',
              color: isRecording ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              backgroundColor: inputText.trim() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
              color: '#000000',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              opacity: inputText.trim() ? 1 : 0.3,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              border: 'none'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{t.inbox.pendingIdeas} ({inboxIdeas.length})</h3>
        
        {inboxIdeas.length === 0 ? (
          <div className="section-card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <p className="text-muted">{t.inbox.emptyState}</p>
          </div>
        ) : (
          inboxIdeas.map(idea => (
            <div key={idea.id} className="section-card" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: 'var(--bg-base)'
            }}>
              <div className="section-card-header">
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {new Date(idea.createdAt).toLocaleDateString(language === 'EN' ? 'en-US' : 'zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <div className="section-card-actions">
                  {deletingIdeaId === idea.id ? (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteIdea(idea.id);
                          setDeletingIdeaId(null);
                        }}
                        className="action-btn"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                        }}
                      >
                        <Check size={14} /> {t.common.confirm}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingIdeaId(null);
                        }}
                        className="action-btn"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                        }}
                      >
                        <X size={14} /> {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingIdeaId(idea.id);
                        }}
                        className="action-btn action-btn-ghost"
                        title={t.common.delete}
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDeepen(idea.id, idea.content)}
                        className="action-btn action-btn-accent"
                        style={{ fontWeight: 600 }}
                      >
                        {t.inbox.expand}
                        <ArrowRight size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <p style={{ whiteSpace: 'pre-wrap', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>{idea.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

