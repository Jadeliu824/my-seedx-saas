import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Footer } from './Footer';
import { legalData } from '../data/legal';

type LegalType = 'terms' | 'privacy' | 'refund';

export function LegalPage({ type }: { type: LegalType }) {
  const [language, setLanguage] = useState<'EN' | 'CN'>('EN');
  
  if (!legalData[type]) {
    return <Navigate to="/" />;
  }

  const data = legalData[type][language.toLowerCase() as 'en' | 'cn'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem 3rem',
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, color: 'var(--text-primary)' }}
          >
            <path
              d="M4,4 L12,18 L20,4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4,21 L20,21"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            SeedX
          </div>
        </Link>

        {/* Language switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-hover)',
          padding: '2px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <button
            onClick={() => setLanguage('CN')}
            style={{
              padding: '0.25rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 2px)',
              backgroundColor: language === 'CN' ? 'var(--accent-primary)' : 'transparent',
              color: language === 'CN' ? '#000' : 'var(--text-secondary)',
              transition: 'var(--transition)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            CN
          </button>
          <button
            onClick={() => setLanguage('EN')}
            style={{
              padding: '0.25rem 1rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--radius-md) - 2px)',
              backgroundColor: language === 'EN' ? 'var(--accent-primary)' : 'transparent',
              color: language === 'EN' ? '#000' : 'var(--text-secondary)',
              transition: 'var(--transition)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            EN
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '4rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '3rem',
          color: 'var(--text-primary)'
        }}>
          {data.title}
        </h1>
        
        <div style={{ 
          color: 'var(--text-secondary)', 
          lineHeight: 1.8,
          fontSize: '1.05rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {data.content.split('\n\n').map((paragraph, index) => {
            // Handle bold/heading text natively or just split by new lines
            const isHeading = paragraph.match(/^\d+\./) || paragraph.startsWith('Last updated:') || paragraph.startsWith('最后更新：');
            return (
              <div key={index} style={{
                color: isHeading ? 'var(--text-primary)' : 'inherit',
                fontWeight: isHeading ? 600 : 400,
                marginTop: isHeading && index > 0 ? '1.5rem' : '0'
              }}>
                {paragraph.split('\n').map((line, i) => (
                  <div key={i} style={{ 
                    marginBottom: i < paragraph.split('\n').length - 1 ? '0.5rem' : '0',
                    paddingLeft: line.trim().startsWith('-') ? '1.5rem' : '0'
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
