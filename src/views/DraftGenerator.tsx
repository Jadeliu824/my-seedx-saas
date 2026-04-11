import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Sparkles, Copy, CheckCircle2 } from 'lucide-react';

export function DraftGenerator({ isMobile }: { isMobile?: boolean }) {
  const { drafts, ideas, updatePlatformDraft } = useWorkflow();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  
  // Local state for the generated results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    xiaohongshu: string;
    chineseTweet: string;
    englishTweet: string;
  } | null>(null);
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const currentDraft = drafts.find(d => d.id === selectedDraftId);
  const currentIdea = currentDraft ? ideas.find(i => i.id === currentDraft.ideaId) : null;

  // Handle Draft Selection Change
  const handleSelectDraft = (id: string) => {
    setSelectedDraftId(id);
    setGeneratedResults(null); // Reset results when switching drafts
  };

  const handleDeepen = async () => {
    if (!currentIdea) return;
    
    if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
      alert("请在 .env.local 中配置 VITE_DEEPSEEK_API_KEY");
      return;
    }

    setIsGenerating(true);
    setGeneratedResults(null);

    const prompt = `
你是一位拥有10年写作经验的资深编辑，擅长捕捉生活细碎中的真理。
你的文字风格：清晰、有温度、像人在认真对谈，而不是AI在完成任务。

【全局要求】
- 绝对禁止使用：首先/其次/最后、深度/赋能/破局/内卷/干货/划重点/建议收藏/本质上/维度。
- 绝对禁止使用：❗🔥✅ 以及任何感叹号。
- 以短句为主，拒绝长难句。像人在说话，有呼吸感。
- 每一个词都要有分量，不写废话。

【版本一：小红书笔记】
目标：写出一篇让人读完后感觉「被击中了」或者「产生真实共鸣」的笔记。

要求：
- 开篇：从一个极其具体的词、场景或触发时刻开始。不要直接讲道理。
- 视角：必须用「我」的视角，讲述真实的观察或实验。
- 结构：自然分段。不要堆砌列表。中间可以有以前和现在的认知对比。
- 金句：包含1-2句可以单独截图传播的金句，短促、有力、直抵人心。
- 结尾：提一个真实的问题，引导读者思考（不要问「你有同感吗」这种套话）。
- 长度：500-600字左右。
- 标题：提供3个备选标题，每个不超过18字，克制、高级、不标题党。
- 标签：提供10个话题标签。

参考范例风格：
「上个月做了一个实验：每天睡前，把当天感到焦虑或烦躁的时刻写下来。坚持了一周之后，我发现几乎全部指向同一个原因：不确定性。我能解决『不知道』吗？大部分时候不能。但我发现，坐着焦虑和带着不确定性继续走，消耗的能量是一样的。甚至焦虑更耗。」

【版本二：中文推文】
- 3-5句话，说清一个核心观点或疑问。
- 必须独立成立，不需要背景也能读懂。
- 拒绝废话，拒绝说教。

【版本三：英文推文 (English Tweet)】
- 3-5 sentences. 
- Clear point or provocative question.
- Natural sounding (Native-like), absolutely no translationese.
- Within 150 words.

想法原文："""${currentIdea.content}"""

输出格式：
三个版本之间用唯一的「【PART_BREAK】」符号分隔。直接输出内容，不要任何开场白或解释。`;

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
      const parts = text.split(/【PART_BREAK】/).map((part: string) => {
        // Clean up common AI headings if they were hallucinated into the content
        return part.trim()
          .replace(/^【版本[一二三]：[^】]+】\n?/i, '')
          .replace(/^#+ [^ \n]+\n?/i, '')
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

      // Save the Xiaohongshu content back to context
      if (xiaohongshu && xiaohongshu !== '生成失败') {
         updatePlatformDraft(currentDraft!.id, 'xiaohongshu', xiaohongshu);
      }

    } catch (err: any) {
      console.error('AI Generation Error:', err);
      alert(`生成失败: ${err.message || "请检查网络连接或 API Key"}`);
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
                  transition: 'var(--transition)'
                }}
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {draft.title || '无标题'}
                </h4>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {new Date(draft.createdAt).toLocaleDateString()}
                </p>
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
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={handleDeepen}
                disabled={isGenerating}
                className="btn-primary"
              >
                <Sparkles size={18} />
                {isGenerating ? 'AI 正在深度思考...' : 'AI 深化'}
              </button>
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
