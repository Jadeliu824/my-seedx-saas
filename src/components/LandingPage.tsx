import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase
      .from('waitlist')
      .insert([{ name: name || null, email }]);

    if (error) {
      console.error(error);
      setStatus('error');
      alert('提交失败，请重试');
    } else {
      setStatus('success');
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            {/* Left grass blade - grows from ground center to top-left */}
            <path
              d="M12,22 Q10,14 5,6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.3 0.8"
            />
            {/* Right grass blade - grows from ground center to top-right */}
            <path
              d="M12,22 Q14,14 19,6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.3 0.8"
            />
            {/* Ground line with slight irregularity */}
            <path
              d="M3,22 L8,21.5 L12,22 L16,21.5 L21,22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="0.3 0.8"
            />
          </svg>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>SeedX</div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/app" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500, transition: 'var(--transition)' }} 
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            产品演示
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            加入等待列表
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
          让想法落地
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '3rem' }}>
          你只需要一个模糊的念头。SeedX 帮你问对问题、找到角度、生成可以直接写的内容框架。
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            加入Waitlist →
          </button>
          <Link to="/app" className="btn-outline" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.125rem' }}>
            看看怎么用
          </Link>
        </div>
      </main>

      {/* Waitlist Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', backgroundColor: 'var(--bg-base)' }}>
            <button 
              onClick={() => { setIsModalOpen(false); setStatus(''); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>加入等待列表</h2>
            
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ color: '#10b981', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <p style={{ fontWeight: 600 }}>已收到！</p>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>SeedX 准备好后会第一时间通知你。</p>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>姓名 (选填)</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} 
                    placeholder="你怎么称呼？"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>邮箱 (必填)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} 
                    placeholder="hi@example.com"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? '提交中...' : '提交'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
