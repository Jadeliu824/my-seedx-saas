import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';

interface WaitlistEntry {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
}

export function AdminView() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isEN = localStorage.getItem('seedx_language') === 'EN';
  const t = isEN ? translations.EN : translations.CN;

  useEffect(() => {
    async function fetchWaitlist() {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching waitlist:', error);
      } else {
        setWaitlist(data || []);
      }
      setLoading(false);
    }

    fetchWaitlist();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>{t.common.loading}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t.admin.title}</h1>
          <p className="text-muted">{t.admin.waitlistEntries}</p>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t.admin.total(waitlist.length)}
        </div>
      </header>
      
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t.admin.name}</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t.admin.email}</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{t.admin.joinedAt}</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {t.admin.noEntries}
                </td>
              </tr>
            ) : (
              waitlist.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{entry.name || '-'}</td>
                  <td style={{ padding: '1rem' }}>{entry.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {new Date(entry.created_at).toLocaleString(isEN ? 'en-US' : 'zh-CN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
