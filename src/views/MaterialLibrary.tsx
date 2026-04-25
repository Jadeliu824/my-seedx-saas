import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { BookOpen, Quote, Target, Lightbulb, Plus, Trash2, X, Check } from 'lucide-react';
import { translations } from '../i18n/translations';
import type { MaterialType } from '../types';

export function MaterialLibrary({ language = 'EN', isMobile }: { language?: 'CN' | 'EN', isMobile?: boolean }) {
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
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: isMobile ? '1.5rem' : '2.5rem', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: isMobile ? '1rem' : '0' 
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.875rem', fontWeight: 700 }}>{t.materials.title}</h2>
          <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>{t.materials.subtitle}</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="btn-primary"
          style={{
            padding: '0.6rem 1.25rem',
            fontSize: '0.875rem',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
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
          <div className="section-card" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: isMobile ? '1.5rem' : '2rem', 
            position: 'relative',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>{t.materials.addNew}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.type}</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as MaterialType})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
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
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.content}</label>
                <textarea
                  rows={isMobile ? 4 : 6}
                  placeholder={t.materials.content + '...'}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.materials.tags}</label>
                <input
                  type="text"
                  placeholder={t.materials.tagsPlaceholder}
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {t.common.cancel}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '0.95rem', justifyContent: 'center' }}>
                  {t.materials.saveMaterial}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '0.75rem', 
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }} className="hide-scrollbar">
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
                  padding: '0.5rem 1.125rem',
                  borderRadius: '100px',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.8125rem'
                }}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Materials */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
        {filteredMaterials.map(mat => (
          <div key={mat.id} className="section-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '0.7rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 183, 235, 0.12)',
                padding: '0.25rem 0.625rem',
                borderRadius: '100px',
                border: '1px solid rgba(255, 183, 235, 0.1)'
              }}>
                {tabs.find(t => t.id === mat.type)?.label}
              </span>
              {mat.tags && mat.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {mat.tags.map(tag => (
                    <span key={tag} style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.125rem 0.5rem', 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '100px', 
                      color: 'var(--text-muted)' 
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <h3 style={{ 
                fontSize: '1.05rem', 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                lineHeight: 1.4,
                wordBreak: 'break-word'
              }}>{mat.title}</h3>
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
                      border: 'none'
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
                      border: 'none'
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
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title={t.materials.deleteMaterial}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            
            <p className="text-muted" style={{ 
              fontSize: '0.875rem', 
              lineHeight: 1.6, 
              flex: 1, 
              display: '-webkit-box', 
              WebkitLineClamp: 4, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
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

