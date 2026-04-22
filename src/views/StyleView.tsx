import { useState, useEffect } from 'react';
import { Trash2, PenTool } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';

export function StyleView({ language = 'EN', isMobile }: { language?: Language; isMobile?: boolean }) {
  const t = translations[language];
  const [userStyle, setUserStyle] = useState(() => localStorage.getItem('seedx_user_style') || '');

  // Save style to localStorage
  useEffect(() => {
    localStorage.setItem('seedx_user_style', userStyle);
  }, [userStyle]);

  // Listen for storage updates from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'seedx_user_style' && e.newValue !== userStyle) {
        setUserStyle(e.newValue || '');
      }
    };
    const handleCustomStyleUpdate = (e: CustomEvent) => {
      if (e.detail !== userStyle) {
        setUserStyle(e.detail || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('seedx_style_updated', handleCustomStyleUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('seedx_style_updated', handleCustomStyleUpdate as EventListener);
    };
  }, [userStyle]);

  return (
    <div style={{ padding: '1rem 0' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 183, 235, 0.1)', 
            padding: '0.5rem', 
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-primary)'
          }}>
            <PenTool size={24} />
          </div>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>{t.style.title}</h2>
        </div>
        <p className="text-muted" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>{t.style.subtitle}</p>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{t.drafts.myStyle}</h3>
          {userStyle && (
            <button 
              onClick={() => {
                if (window.confirm(t.common.confirm)) {
                  setUserStyle('');
                }
              }}
              style={{ 
                fontSize: '0.875rem', 
                color: '#ef4444', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Trash2 size={16} />
              {t.drafts.clear}
            </button>
          )}
        </div>

        <textarea
          value={userStyle}
          onChange={(e) => setUserStyle(e.target.value)}
          placeholder={t.drafts.stylePlaceholder}
          style={{
            width: '100%',
            minHeight: '400px',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            fontSize: '1rem',
            lineHeight: 1.6,
            resize: 'vertical',
            color: 'var(--text-primary)'
          }}
        />
        
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-surface-hover)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--accent-primary)'
        }}>
          {t.drafts.styleDescription}
        </div>

        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(255, 183, 235, 0.05)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--accent-primary)'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
            {language === 'CN' ? '如何提供有效的风格样本？' : 'How to provide effective style samples?'}
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>{language === 'CN' ? '粘贴 2-3 篇你过去写过的完整内容' : 'Paste 2-3 complete pieces you\'ve written in the past'}</li>
            <li>{language === 'CN' ? '包含不同情绪和主题的内容效果更好' : 'Include content with different emotions and topics for better results'}</li>
            <li>{language === 'CN' ? '使用「添加到写作风格样本」按钮持续丰富你的风格库' : 'Use the "Add to writing style samples" button to continuously enrich your style library'}</li>
            <li>{language === 'CN' ? 'SeedX 会随着时间学习你的声音、风格和品味' : 'SeedX will learn your voice, style, and taste over time'}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
