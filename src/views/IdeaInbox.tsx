import { useState, useRef, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Send, ArrowRight, Mic, MicOff } from 'lucide-react';

// Declare Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function IdeaInbox({ isMobile }: { isMobile?: boolean }) {
  const { ideas, addIdea, updateIdeaStatus, addDraft } = useWorkflow();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN'; // Set language

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append final results to the current text
        if (finalTranscript) {
           setInputText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
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
  }, []);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input.");
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
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>选题记录</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>你的想法收集箱，所有碎片想法都先扔进来。</p>
      </header>

      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '3rem' }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="记录选题：今天有个想法... (点击麦克风可语音输入)"
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
            title="Voice Input"
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
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>待处理的想法 ({inboxIdeas.length})</h3>
        
        {inboxIdeas.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">想法收集箱空空如也</p>
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
                  {new Date(idea.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
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
                深化
                <ArrowRight size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
