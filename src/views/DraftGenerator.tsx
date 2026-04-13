import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Sparkles, Copy, CheckCircle2, Trash2, X, Check } from 'lucide-react';

export function DraftGenerator({ isMobile }: { isMobile?: boolean }) {
  const { drafts, ideas, updatePlatformDraft, deleteDraft } = useWorkflow();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  
  // Local state for the generated results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    xiaohongshu: string;
    chineseTweet: string;
    englishTweet: string;
  } | null>(null);
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  
  // Usage limit state
  const [usageCount, setUsageCount] = useState(0);

  // Constants
  const DAILY_LIMIT = 3;
  const USAGE_KEY = 'seedx_deepen_usage';

  // Load and refresh usage data
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const stored = localStorage.getItem(USAGE_KEY);
    
    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setUsageCount(count);
      } else {
        // New day, reset
        setUsageCount(0);
        localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
    }
  }, []);
  const currentDraft = drafts.find(d => d.id === selectedDraftId);
  const currentIdea = currentDraft ? ideas.find(i => i.id === currentDraft.ideaId) : null;

  // Handle Draft Selection Change
  const handleSelectDraft = (id: string) => {
    setSelectedDraftId(id);
  };

  // Sync state with currentDraft data
  useEffect(() => {
    if (currentDraft && !isGenerating) {
      const xhs = currentDraft.drafts['xiaohongshu']?.content || '';
      const cnTweet = currentDraft.drafts['twitter_cn']?.content || '';
      const enTweet = currentDraft.drafts['twitter_en']?.content || '';

      if (xhs || cnTweet || enTweet) {
        setGeneratedResults({
          xiaohongshu: xhs,
          chineseTweet: cnTweet,
          englishTweet: enTweet
        });
      } else {
        setGeneratedResults(null);
      }
    } else if (!currentDraft && !isGenerating) {
      // Clear results if no draft is selected (e.g., after deletion)
      setGeneratedResults(null);
    }
  }, [selectedDraftId, drafts, isGenerating, currentDraft]);

  const handleDeepen = async () => {
    if (!currentIdea || !currentDraft) return;
    
    // Check usage limit
    if (usageCount >= DAILY_LIMIT) {
      alert("今日 3 次 AI 深化额度已用完，请明天再试。");
      return;
    }

    const draftId = currentDraft.id;
    
    if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
      alert("请在 .env.local 中配置 VITE_DEEPSEEK_API_KEY");
      return;
    }

    setIsGenerating(true);
    setGeneratedResults(null);

    const prompt = `
你是一个真实的人，在写给一个认识你的朋友看。你的文字唯一的标准是：读完之后，对方觉得「这是真话」。

### 核心原则
1. **用具体代替抽象**：禁用形容词，改用数字、动作和场景。
   - 错：「我压力很大。」
   - 对：「下午3点，同事从我身后走过，我下意识把电脑屏幕往下按了按。」
2. **不解释，只描述**：不要告诉读者这意味着什么，让他们自己得出结论。
   - 错：「这说明我们这代人缺乏情感表达。」
   - 对：「我妈每次打电话都问我吃了吗，从没问过我开不开心。」
3. **说一件事就够了**：找到那一个最真实的感受，把它说清楚，停下来。
4. **结尾不要总结**：不要「所以我觉得」「希望大家」，可以是一个作者真的想知道答案的问题，或者一个自然的留白。

### 禁止使用的词和句式
- 赋能/破局/内卷/深度/干货/划重点/本质上/维度/建议收藏/干货
- 首先/其次/最后/总结一下
- 「我们」开头
- 「你有没有」「你是否」「希望你」「让我们一起」
- ❗🔥✅ 任何符号装饰，禁止使用 Markdown 符号（如 **、*）。

### 参考风格 (Golden Samples)
请严格参考以下两个样本当中的文字节奏、留白感和细节描写：

【样本一】
标题一：我记了一周的情绪流水账
标题二：那一周，焦虑有个固定地址
标题三：原来我的烦恼，是个钉子户

这周一，我决定开始记录情绪。
打开手机备忘录，每次心里一沉，手指发紧，或者突然想叹口气的时候，就立刻记下来。
“上午10:47，邮箱提示音响起，心跳快了一拍，结果是广告。”
“下午3:30，隔壁桌的键盘声敲得特别响，我突然觉得很烦。”
我翻看这些密密麻麻的记录，发现报告里所有的线索，都指向同一个房间。
我站在那个房间门口路过八十次，摸一摸门把手，又走开。
我觉得那个房间明天该推门进去了。

【样本二】
一个小红书笔记：和一个gap year的朋友聊完，我重新想了一下「浪费时间」是什么意思。
有个朋友去年辞掉工作，gap year了一整年。
我们上个月见面，我问他：「这一年你觉得值吗？」
他想了一下说：「我之前觉得不值。现在觉得是我花得最好的一年。那一年什么都没做，我才想明白了我在为什么做事。」
我听完沉默了一会儿。
因为我突然想到：「高效」和「在正确的方向上」，是两件事。我一直很在意前者，对后者的检查，少得多。
你现在做的事，你知道为什么在做吗？不是「因为要赚钱」，是真的知道吗？

### 任务详情
选题："""${currentIdea.content}"""

输出三个版本，版本间用「---」分隔：
1. **小红书笔记**：500字左右，自然分段，包含3个备选标题和5个标签。标题要克制，不要标题党。
2. **中文推文**：1条，100字以内，说清一个核心观察/观点，说完就停。
3. **英文推文 (English Insight)**：1条，100字以内。**这不是翻译**，是针对同一个选题，用英语母语者的直觉（Native Instinct）写下的随感，追求地道和呼吸感。

直接输出内容，不要任何开场白或解释。`;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API 请求失败 (状态码: ${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '';

      // Split by robust separator
      const parts = text.split(/---/).map((part: string) => {
        // Clean up common AI headings if they were hallucinated into the content
        // Also strip any remaining markdown symbols to ensure plain text
        return part.trim()
          .replace(/^【版本[一二三]：[^】]+】\n?/i, '')
          .replace(/^#+ [^ \n]+\n?/i, '')
          .replace(/\*\*/g, '') // Remove bold
          .replace(/\*/g, '')   // Remove italic/bullets
          .replace(/#+ /g, '')  // Remove headers
          .trim();
      });

      // Ensure we have results, fallback to failed text if needed
      const xiaohongshu = parts.length > 0 ? parts[0] : '生成失败';
      const chineseTweet = parts.length > 1 ? parts[1] : '生成失败';
      const englishTweet = parts.length > 2 ? parts[2] : '生成失败';

      setGeneratedResults({
        xiaohongshu,
        chineseTweet,
        englishTweet
      });

      // Save all content back to context if draft still exists
      const draftExists = drafts.find(d => d.id === draftId);
      if (draftExists) {
        if (xiaohongshu && xiaohongshu !== '生成失败') {
          updatePlatformDraft(draftId, 'xiaohongshu', xiaohongshu);
        }
        if (chineseTweet && chineseTweet !== '生成失败') {
          updatePlatformDraft(draftId, 'twitter_cn', chineseTweet);
        }
        if (englishTweet && englishTweet !== '生成失败') {
          updatePlatformDraft(draftId, 'twitter_en', englishTweet);
        }
        
        // Success: Increment usage
        const today = new Date().toLocaleDateString();
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      } else {
        console.warn('Draft was deleted during generation, skipping save.');
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('AI Generation Error:', err);
      alert(`生成失败: ${message || "请检查网络连接或 API Key"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1rem' : '2rem', height: '100%' }}>
      {/* Left Sidebar: List of Drafts */}
      <div style={{ 
        width: isMobile ? '100%' : '300px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        borderRight: isMobile ? 'none' : '1px solid var(--border-color)', 
        borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
        paddingRight: isMobile ? '0' : '1rem',
        paddingBottom: isMobile ? '1rem' : '0'
      }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>待深化选题</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>共有 {drafts.length} 个草稿</p>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {drafts.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>暂无草稿</p>
          ) : (
            drafts.map(draft => (
              <div 
                key={draft.id} 
                onClick={() => handleSelectDraft(draft.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedDraftId === draft.id ? 'var(--bg-surface-hover)' : 'transparent',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedDraftId === draft.id ? 'var(--accent-primary)' : 'var(--border-color)',
                  marginBottom: '0.5rem',
                  transition: 'var(--transition)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {draft.title || '无标题'}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {deletingDraftId === draft.id ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id);
                        if (selectedDraftId === draft.id) {
                          setSelectedDraftId(null);
                        }
                        setDeletingDraftId(null);
                      }}
                      style={{
                        padding: '0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="确认删除"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingDraftId(null);
                      }}
                      style={{
                        padding: '0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="取消"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingDraftId(draft.id);
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
                    title="删除草稿"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content Area: Deepen Workflow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: isMobile ? 'visible' : 'auto', paddingLeft: isMobile ? '0' : '1rem' }}>
        {currentDraft ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Original Idea */}
            <section style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-hover)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>原始想法</h3>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.125rem' }}>
                {currentIdea ? currentIdea.content : '无法找到原始想法内容'}
              </p>
            </section>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
              <button
                onClick={handleDeepen}
                disabled={isGenerating || usageCount >= DAILY_LIMIT}
                className="btn-primary"
                style={{
                  opacity: (isGenerating || usageCount >= DAILY_LIMIT) ? 0.6 : 1,
                  cursor: (isGenerating || usageCount >= DAILY_LIMIT) ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={18} />
                {isGenerating ? 'AI 正在深度思考...' : usageCount >= DAILY_LIMIT ? '今日次数已用完' : 'AI 深化'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <div style={{ 
                  width: '100px', 
                  height: '4px', 
                  backgroundColor: 'var(--border-color)', 
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${(usageCount / DAILY_LIMIT) * 100}%`, 
                    height: '100%', 
                    backgroundColor: usageCount >= DAILY_LIMIT ? '#ef4444' : 'var(--accent-primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span>今日使用：{usageCount}/{DAILY_LIMIT} 次</span>
              </div>
            </div>

            {/* AI Results */}
            {generatedResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* 小红书笔记 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <h4 style={{ fontWeight: 600 }}>小红书笔记</h4>
                    <button
                      onClick={() => copyToClipboard(generatedResults.xiaohongshu, 'xiaohongshu')}
                      style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                    >
                      {copiedSection === 'xiaohongshu' ? <><CheckCircle2 size={16} color="#10b981"/> 已复制</> : <><Copy size={16} /> 复制</>}
                    </button>
                  </div>
                  <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {generatedResults.xiaohongshu}
                  </div>
                </div>

                {/* 中文推文串 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <h4 style={{ fontWeight: 600 }}>中文推文串</h4>
                    <button
                      onClick={() => copyToClipboard(generatedResults.chineseTweet, 'chineseTweet')}
                      style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                    >
                      {copiedSection === 'chineseTweet' ? <><CheckCircle2 size={16} color="#10b981"/> 已复制</> : <><Copy size={16} /> 复制</>}
                    </button>
                  </div>
                  <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {generatedResults.chineseTweet}
                  </div>
                </div>

                {/* 英文推文串 */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                    <h4 style={{ fontWeight: 600 }}>英文推文串</h4>
                    <button
                      onClick={() => copyToClipboard(generatedResults.englishTweet, 'englishTweet')}
                      style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                    >
                      {copiedSection === 'englishTweet' ? <><CheckCircle2 size={16} color="#10b981"/> 已复制</> : <><Copy size={16} /> 复制</>}
                    </button>
                  </div>
                  <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {generatedResults.englishTweet}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            请在左侧选择一个待深化的草稿
          </div>
        )}
      </div>

    </div>
  );
}
