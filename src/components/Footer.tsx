import { Link } from 'react-router-dom';
import { type Language } from '../i18n/translations';

export function Footer({ language = 'EN' }: { language?: Language }) {
  const isEN = language === 'EN';
  
  return (
    <footer style={{
      padding: '2rem',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)'
    }}>
      <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        {isEN ? 'Terms' : '服务条款'}
      </Link>
      <span>·</span>
      <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        {isEN ? 'Privacy' : '隐私政策'}
      </Link>
      <span>·</span>
      <Link to="/refund" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        {isEN ? 'Refund' : '退款政策'}
      </Link>
    </footer>
  );
}
