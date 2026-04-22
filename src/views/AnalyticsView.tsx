import { useWorkflow } from '../context/WorkflowContext';
import { TrendingUp, FileText, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';

export function AnalyticsView({ language = 'EN', isMobile }: { language?: 'CN' | 'EN', isMobile?: boolean }) {
  const t = translations[language];
  const { ideas } = useWorkflow();

  const publishedIdeas = ideas.filter(i => i.status === 'published');
  const draftingIdeas = ideas.filter(i => i.status === 'drafting');
  const inboxIdeas = ideas.filter(i => i.status === 'inbox');

  const stats = [
    { label: t.analytics.publishedContent, value: publishedIdeas.length, icon: CheckCircle2 },
    { label: t.analytics.toExpand, value: draftingIdeas.length, icon: FileText },
    { label: t.analytics.inbox, value: inboxIdeas.length, icon: TrendingUp }
  ];

  return (
    <div style={{ padding: '1rem 0' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{t.analytics.title}</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>{t.analytics.subtitle}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>{stat.label}</span>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '50%' }}>
                  <Icon size={20} color="var(--text-primary)" />
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>{t.analytics.recentlyPublished}</h3>
        {publishedIdeas.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            {t.analytics.noPublished}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {publishedIdeas.map(idea => (
              <div key={idea.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{idea.content.slice(0, 40)}{idea.content.length > 40 ? '...' : ''}</h4>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{t.analytics.publishedAt}{new Date().toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.analytics.views}<strong style={{ color: 'var(--text-primary)'}}>12.4k</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.analytics.likes}<strong style={{ color: 'var(--text-primary)'}}>842</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
