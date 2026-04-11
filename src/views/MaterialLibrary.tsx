import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { BookOpen, Quote, Target, Lightbulb, Plus, Trash2 } from 'lucide-react';
import type { MaterialType } from '../types';

export function MaterialLibrary({ isMobile }: { isMobile?: boolean }) {
  const { materials, addMaterial, deleteMaterial } = useWorkflow();
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'core_concept' as MaterialType,
    content: '',
    tags: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
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
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>内容素材库</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>从碰运气到系统化，你的创作地基。</p>
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
          添加素材
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>添加新素材</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>素材类型</label>
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
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>标题</label>
                <input 
                  type="text" 
                  placeholder="输入素材标题..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>内容</label>
                <textarea 
                  rows={5}
                  placeholder="输入素材内容..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>标签 (用逗号分隔)</label>
                <input 
                  type="text" 
                  placeholder="如: 效率, 极简, 认知"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  取消
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  保存素材
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
                {tabs.find(t => t.id === mat.type)?.label.replace('库', '')}
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
              <button
                onClick={() => {
                  if (window.confirm('确定要删除这条素材吗？')) {
                    deleteMaterial(mat.id);
                  }
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
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title="删除素材"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
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

