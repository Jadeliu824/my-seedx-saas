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
    <div style={{ padding: isMobile ? '0.5rem 0' : '1rem 0' }}>
      <header style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>{t.analytics.title}</h2>
        <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>{t.analytics.subtitle}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="section-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</span>
                <div style={{ padding: '0.4rem', backgroundColor: 'rgba(255, 183, 235, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="section-card" style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', fontWeight: 600 }}>{t.analytics.recentlyPublished}</h3>
        {publishedIdeas.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
            {t.analytics.noPublished}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {publishedIdeas.map(idea => (
              <div key={idea.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingBottom: '1rem', 
                borderBottom: '1px solid var(--border-color)', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: isMobile ? '0.75rem' : '0', 
                alignItems: isMobile ? 'flex-start' : 'center' 
              }}>
                <div>
                  <h4 style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{idea.content.slice(0, 40)}{idea.content.length > 40 ? '...' : ''}</h4>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t.analytics.publishedAt}{new Date().toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.analytics.views}<strong style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>12.4k</strong></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.analytics.likes}<strong style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>842</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
