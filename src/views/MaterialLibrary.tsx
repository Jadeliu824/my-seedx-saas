import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { BookOpen, Quote, Target, Lightbulb, Plus } from 'lucide-react';

export function MaterialLibrary({ isMobile }: { isMobile?: boolean }) {
  const { materials } = useWorkflow();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '全部素材' },
    { id: 'core_concept', label: '核心概念库', icon: BookOpen },
    { id: 'golden_quote', label: '金句库', icon: Quote },
    { id: 'published_note', label: '爆款文稿库', icon: Target },
    { id: 'methodology', label: '方法论沉淀', icon: Lightbulb },
  ];

  const filteredMaterials = activeTab === 'all' 
    ? materials 
    : materials.filter(m => m.type === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>内容素材库</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>从碰运气到系统化，你的创作地基。</p>
        </div>
        <button
          className="btn-primary"
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <Plus size={18} />
          添加素材
        </button>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                transition: 'var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              {Icon && <Icon size={16} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Materials */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
        {filteredMaterials.map(mat => (
          <div key={mat.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {tabs.find(t => t.id === mat.type)?.label.replace('库', '')}
              </span>
              {mat.tags && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {mat.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{mat.title}</h3>
            
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>
              {mat.content}
            </p>
          </div>
        ))}
        {filteredMaterials.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            没有找到相关素材
          </div>
        )}
      </div>
    </div>
  );
}
