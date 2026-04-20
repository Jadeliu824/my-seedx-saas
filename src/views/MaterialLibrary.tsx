import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { BookOpen, Quote, Target, Lightbulb, Plus, Trash2, X, Check } from 'lucide-react';
import { translations } from '../i18n/translations';
import type { MaterialType } from '../types';

export function MaterialLibrary({ language = 'CN', isMobile }: { language?: 'CN' | 'EN', isMobile?: boolean }) {
  const t = translations[language];
  const { materials, addMaterial, deleteMaterial } = useWorkflow();
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMatId, setDeletingMatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'core_concept' as MaterialType,
    content: '',
    tags: ''
  });

  const tabs = [
    { id: 'all', label: t.materials.tabs.all },
    { id: 'core_concept', label: t.materials.tabs.core_concept, icon: BookOpen },
    { id: 'golden_quote', label: t.materials.tabs.golden_quote, icon: Quote },
    { id: 'published_note', label: t.materials.tabs.published_note, icon: Target },
    { id: 'methodology', label: t.materials.tabs.methodology, icon: Lightbulb },
  ];

  const filteredMaterials = activeTab === 'all' 
    ? materials 
    : materials.filter(m => m.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert(t.materials.fillRequired);
      return;
    }
    addMaterial({
      title: formData.title,
      type: formData.type,
      content: formData.content,
      tags: formData.tags.split(/[,，]/).map(t => t.trim()).filter(t => t)
    });
    setIsModalOpen(false);
    setFormData({ title: '', type: 'core_concept', content: '', tags: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '2rem', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '0' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{t.materials.title}</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>{t.materials.subtitle}</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="btn-primary"
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <Plus size={18} />
          {t.materials.addMaterial}
        </button>
      </header>

      {/* Add Material Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>{t.materials.addNew}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.type}</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as MaterialType})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {tabs.filter(t => t.id !== 'all').map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.titleField}</label>
                <input
                  type="text"
                  placeholder={t.materials.titleField + '...'}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.content}</label>
                <textarea
                  rows={5}
                  placeholder={t.materials.content + '...'}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.tags}</label>
                <input
                  type="text"
                  placeholder={t.materials.tagsPlaceholder}
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {t.common.cancel}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t.materials.saveMaterial}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {tabs.find(t => t.id === mat.type)?.label}
              </span>
              {mat.tags && mat.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {mat.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{mat.title}</h3>
              {deletingMatId === mat.id ? (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMaterial(mat.id);
                      setDeletingMatId(null);
                    }}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title={t.common.confirm}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingMatId(null);
                    }}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    title={t.common.cancel}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingMatId(mat.id);
                  }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title={t.materials.deleteMaterial}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>
              {mat.content}
            </p>
          </div>
        ))}
        {filteredMaterials.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            {t.materials.noMaterials}
          </div>
        )}
      </div>
    </div>
  );
}

