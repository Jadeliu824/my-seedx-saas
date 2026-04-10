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
你是一位写作经验超过10年的资深编辑。
你的工作是把想法写成让人停下来读完的内容。
不写励志口号，不堆砌形容词，不用「首先/其次/最后」。
禁止使用：深度/赋能/破局/内卷/颠覆/干货/划重点/建议收藏。
不加❗🔥✅这类符号。
短句。像人在说话。有逻辑但不学术。

根据以下想法，生成三个版本：

【版本一：小红书笔记】

结构要求：
- 从一个具体的词、场景或触发时刻开始，不要开门见山讲道理
- 用「我」的视角，讲自己真实观察到的事情
- 中间可以有对比（以前怎么想/现在怎么理解）
- 有1-2句可以单独截图传播的金句，短、有力
- 结尾问一个真实的问题，不是「你有同感吗」这种废话
- 500-600字，自然分段，不加粗标题
- 3个备选标题，不超过18字，不用感叹号
- 5个话题标签

参考风格（只参考节奏和结构，不要抄内容）：
「前两天刷到一个词：Productive Procrastination。
说的是：你一直在做事，但做的都不是最重要的事。
看到这个词的时候，我愣了一下。」

【版本二：中文X推文串】

写一组5-7条的推文串（Thread）：
- 第一条：用一句话或一个概念钩住人，让人想继续看
- 中间几条：展开这个概念，用对比或具体例子
- 可以有「绑定思维 vs XX思维」这样的对比结构
- 每条推文独立成立，也能串联阅读
- 最后一条：金句收尾，简短有力
- 每条不超过140字
- 格式：1/ 2/ 3/ 依此类推

【版本三：英文X推文串】

同上，英文版本：
- 同样5-7条Thread结构
- 语气自然，不要翻译腔
- 第一条要让英文母语用户也想继续读
- 每条不超过140字
- 格式：1/ 2/ 3/ 依此类推

想法是："""${currentIdea.content}"""

三个版本之间用「---」分隔。
直接输出内容，不要任何解释。`;

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
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '';

      // Split by "---" separator
      const parts = text.split(/---/).map((part: string) => part.trim());

      // Ensure we have exactly 3 parts, if not, handle gracefully
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

    } catch (err) {
      console.error(err);
      alert("生成失败，请检查网络或 API Key");
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
