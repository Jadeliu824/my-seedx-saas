import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'' | 'loading' | 'success' | 'error'>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPricing, setShowPricing] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setShowPricing(false)}>
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
          <div 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800,
              color: showPricing ? 'var(--text-secondary)' : 'var(--text-primary)',
              transition: 'var(--transition)'
            }}
          >
            SeedX
          </div>
        </div>

        {/* Centered Pricing Button */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '2rem'
        }}>
          <button
            onClick={() => setShowPricing(!showPricing)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: showPricing ? 'var(--accent-primary)' : 'var(--text-secondary)',
              backgroundColor: 'transparent',
              transition: 'var(--transition)'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => {
              if (!showPricing) e.currentTarget.style.color = 'var(--text-secondary)';
              else e.currentTarget.style.color = 'var(--accent-primary)';
            }}
          >
            Pricing
          </button>
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

      {/* Content Switch */}
      {!showPricing ? (
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
      ) : (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>选择最适合你的方案</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>让你的每一颗灵感种子都有发芽的机会</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem', 
            maxWidth: '1100px', 
            width: '100%' 
          }}>
            {/* Seed Plan */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Seed</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>适合个人灵感探索</p>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$0</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ forever</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 每日 3 次 AI 深化</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 基础素材库存储</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 简单的选题记录</li>
              </ul>
              <button onClick={() => setIsModalOpen(true)} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>开始免费使用</button>
            </div>

            {/* Sprout Plan */}
            <div className="glass-panel" style={{ 
              padding: '2.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              border: '2px solid var(--accent-primary)',
              position: 'relative',
              backgroundColor: 'rgba(52, 211, 153, 0.05)',
              transition: 'var(--transition)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '-12px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--accent-primary)',
                color: '#000',
                padding: '2px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                MOST POPULAR
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sprout</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>针对深度创作者设计</p>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$19</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 无限次 AI 深度解析</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 多平台文风自动适配</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 深度数据复盘分析</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 优先体验 AI 新功能</li>
              </ul>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                立即订阅 Sprout
              </button>
            </div>

            {/* Forest Plan */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Forest</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>多账号与团队协作</p>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$49</span>
                <span style={{ color: 'var(--text-secondary)' }}>/ month</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 包含 5 个子账号</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 团队灵感共享素材库</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ 专属客户成效经理</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>✓ API 调用限额开放</li>
              </ul>
              <button onClick={() => setIsModalOpen(true)} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>联系团队方案</button>
            </div>
          </div>
        </main>
      )}

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
