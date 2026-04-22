import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Sparkles, Copy, CheckCircle2, Trash2, X, Check } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';


export function DraftGenerator({ language = 'EN', isMobile }: { language?: Language; isMobile?: boolean }) {
  const t = translations[language];
  const isEN = language === 'EN';
  const { drafts, ideas, updatePlatformDraft, deleteDraft } = useWorkflow();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  
  // Local state for the generated results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    xiaohongshu?: string;
    chineseTweet?: string;
    douyinScript?: string;
    englishTweet?: string;
    linkedinPost?: string;
    youtubeScript?: string;
  } | null>(null);
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  
  // Usage limit state
  const [usageCount, setUsageCount] = useState(0);

  // Regeneration state
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [sectionFeedback, setSectionFeedback] = useState<Record<string, string>>({});
  const [styleRefinements, setStyleRefinements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('seedx_style_refinements');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

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

  // Save style refinements to localStorage
  useEffect(() => {
    localStorage.setItem('seedx_style_refinements', JSON.stringify(styleRefinements));
  }, [styleRefinements]);

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
      const douyin = currentDraft.drafts['douyin']?.content || '';
      const enTweet = currentDraft.drafts['twitter_en']?.content || '';
      const linkedin = currentDraft.drafts['linkedin']?.content || '';
      const youtube = currentDraft.drafts['youtube']?.content || '';

      if (xhs || cnTweet || douyin || enTweet || linkedin || youtube) {
        setGeneratedResults({
          xiaohongshu: xhs,
          chineseTweet: cnTweet,
          douyinScript: douyin,
          englishTweet: enTweet,
          linkedinPost: linkedin,
          youtubeScript: youtube
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
      alert(t.drafts.limitAlert);
      return;
    }

    const draftId = currentDraft.id;
    
    if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
      alert(t.drafts.apiKeyMissing);
      return;
    }

    setIsGenerating(true);
    setGeneratedResults(null);

    const currentStyle = localStorage.getItem('seedx_user_style') || '';
    const stylePrompt = currentStyle.trim()
      ? language === 'CN'
        ? `## 创作者的个人写作风格（请严格模仿）
以下是这位创作者过去写过的内容，请仔细分析以下特征：
1. **语气**：是正式、随意、幽默、严肃、亲切还是其他？
2. **句子长度**：长句多还是短句多？平均句子长度是多少？
3. **用词习惯**：喜欢用哪些特定词汇？避免用哪些词汇？
4. **情感温度**：文字给人的感觉是温暖、冷静、理性、感性？
5. **段落结构**：段落长短如何？如何过渡？
6. **修辞手法**：常用比喻、排比、反问等手法吗？
7. **节奏感**：文字的阅读节奏是快是慢？
8. **人称使用**：多用"我"、"我们"还是"你"？

请基于以上分析，用完全相同的风格生成新内容。请优先模仿以下风格，而不是参考后面的通用样本：

${currentStyle}

--- 风格模仿结束 ---
现在根据以上风格，处理这个选题：`
        : `## Creator's Personal Writing Style (Strict Imitation Required)
Here are pieces this creator has written in the past. Please analyze the following characteristics:
1. **Tone**: Is it formal, casual, humorous, serious,亲切, or something else?
2. **Sentence length**: Mostly long sentences or short sentences? What's the average sentence length?
3. **Word choice**: What specific vocabulary do they prefer? What words do they avoid?
4. **Emotional temperature**: Does the writing feel warm,冷静, rational, emotional?
5. **Paragraph structure**: How long are paragraphs? How are transitions handled?
6. **Rhetorical devices**: Do they常用比喻, parallelism, rhetorical questions, etc.?
7. **Rhythm**: Is the reading pace fast or slow?
8. **Pronoun usage**: Do they use "I", "we", or "you" more often?

Based on this analysis, generate new content in the exact same style. Prioritize imitating the style below over referencing the generic samples later:

${currentStyle}

--- End of Style Imitation ---
Now, based on the above style, process this topic:`
      : '';

    const prompt = `${stylePrompt}
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
${currentStyle.trim() ? '（已提供个人写作风格，请优先模仿上方风格；以下样本仅作通用参考）' : '请严格参考以下两个样本当中的文字节奏、留白感和细节描写：'}

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

${language === 'CN' ? `输出三个版本，版本间用「---」分隔：
1. **小红书笔记**：500字左右，自然分段，包含3个备选标题和5个标签。标题要克制，不要标题党。
2. **中文推文**：1条，100字以内，说清一个核心观察/观点，说完就停。
3. **抖音视频脚本**：针对同一选题，提供一个适合短视频的文案脚本，长度控制在1分钟以内，包含画面视觉建议和口播文案。这是真人出镜风格。` : `输出三个英文版本（请基于英语母语者的直觉进行写下随感，追求地道自然，这不是生硬的翻译），版本间用「---」分隔：
1. **英文推文 (Twitter/X)**：1条，不带标签，自然表达一个观察，一语中的。
2. **LinkedIn 贴文**：专业但真诚的职场感悟，富有共鸣，字数150-200字，带有个人反思。
3. **YouTube 短视频脚本**：包含 Hook（开场）、主体口播和画面建议的简短脚本大纲。`}

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
        throw new Error(isEN ? `API request failed (status code: ${response.status}): ${errorData.error?.message || response.statusText}` : `API 请求失败 (状态码: ${response.status}): ${errorData.error?.message || response.statusText}`);
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
      const part1 = parts.length > 0 ? parts[0] : t.drafts.generationFailed;
      const part2 = parts.length > 1 ? parts[1] : t.drafts.generationFailed;
      const part3 = parts.length > 2 ? parts[2] : t.drafts.generationFailed;

      if (language === 'CN') {
        setGeneratedResults(prev => ({
          ...prev,
          xiaohongshu: part1,
          chineseTweet: part2,
          douyinScript: part3
        }));
      } else {
        setGeneratedResults(prev => ({
          ...prev,
          englishTweet: part1,
          linkedinPost: part2,
          youtubeScript: part3
        }));
      }

      // Save all content back to context if draft still exists
      const draftExists = drafts.find(d => d.id === draftId);
      if (draftExists) {
        if (language === 'CN') {
          if (part1 && part1 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'xiaohongshu', part1);
          if (part2 && part2 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'twitter_cn', part2);
          if (part3 && part3 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'douyin', part3);
        } else {
          if (part1 && part1 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'twitter_en', part1);
          if (part2 && part2 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'linkedin', part2);
          if (part3 && part3 !== t.drafts.generationFailed) updatePlatformDraft(draftId, 'youtube', part3);
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
      alert(t.drafts.generationFailed + ': ' + (message || t.drafts.checkNetwork));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const addToStyle = (text: string) => {
    const currentStyle = localStorage.getItem('seedx_user_style') || '';
    const separator = currentStyle ? '\n\n---\n\n' : '';
    const newStyle = currentStyle + separator + text;
    localStorage.setItem('seedx_user_style', newStyle);
    // Update state if StyleView is mounted elsewhere
    window.dispatchEvent(new StorageEvent('storage', { key: 'seedx_user_style', newValue: newStyle }));
    // Also dispatch a custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('seedx_style_updated', { detail: newStyle }));
    alert(t.drafts.styleAdded);
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    if (!currentIdea || !currentDraft) return;
    if (usageCount >= DAILY_LIMIT) {
      alert(t.drafts.limitAlert);
      return;
    }

    if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
      alert(t.drafts.apiKeyMissing);
      return;
    }

    const feedback = (sectionFeedback[sectionKey] || '').trim();
    const draftId = currentDraft.id;

    setIsGenerating(true);

    const currentStyle = localStorage.getItem('seedx_user_style') || '';

    const refinementsText = styleRefinements.length > 0
      ? `\n\n### ${language === 'CN' ? '用户的历史风格反馈（请重点参考）' : 'User\'s historical style feedback (prioritize these)'}\n${styleRefinements.map(r => `- ${r}`).join('\n')}`
      : '';

    const feedbackText = feedback
      ? `\n\n### ${language === 'CN' ? '用户对本次生成的具体要求' : 'User\'s specific request for this generation'}\n${feedback}`
      : '';

    const sectionNames: Record<string, string> = {
      xiaohongshu: language === 'CN' ? '小红书笔记' : 'RED Note',
      chineseTweet: language === 'CN' ? '中文推文' : 'Chinese Tweet',
      douyinScript: language === 'CN' ? '抖音视频脚本' : 'Douyin Script',
      englishTweet: 'Twitter Post',
      linkedinPost: 'LinkedIn Post',
      youtubeScript: 'YouTube Script',
    };

    const sectionInstructions: Record<string, string> = {
      xiaohongshu: language === 'CN' ? '500字左右，自然分段，包含3个备选标题和5个标签。标题要克制，不要标题党。' : 'Around 500 words, natural paragraphs, with 3 alternative titles and 5 tags.',
      chineseTweet: language === 'CN' ? '1条，100字以内，说清一个核心观察/观点，说完就停。' : '1 post, under 100 words, one clear observation. Stop when done.',
      douyinScript: language === 'CN' ? '适合短视频的文案脚本，长度控制在1分钟以内，包含画面视觉建议和口播文案。真人出镜风格。' : 'Short video script under 1 minute, with visual suggestions and narration. Talking head style.',
      englishTweet: '1 post, no hashtags, one sharp observation. Make it punchy.',
      linkedinPost: 'Professional but sincere, 150-200 words, personal reflection with resonance.',
      youtubeScript: 'Short script outline with Hook, body narration, and visual suggestions.',
    };

    const styleSection = currentStyle.trim()
      ? (language === 'CN'
        ? `## 创作者的个人写作风格（请严格模仿）
分析以下内容的语气、句子长度、用词习惯、情感温度、段落结构、修辞手法、节奏感和人称使用，然后用完全相同的风格生成：

${currentStyle}`
        : `## Creator's Personal Writing Style (Strict Imitation Required)
Analyze the tone, sentence length, word choice, emotional temperature, paragraph structure, rhetorical devices, rhythm, and pronoun usage. Then generate in the exact same style:

${currentStyle}`)
      : '';

    const prompt = `${styleSection}

${refinementsText}
${feedbackText}

${language === 'CN'
      ? `### 核心原则
1. **用具体代替抽象**：禁用形容词，改用数字、动作和场景。
2. **不解释，只描述**：不要告诉读者这意味着什么，让他们自己得出结论。
3. **说一件事就够了**：找到那一个最真实的感受，把它说清楚，停下来。
4. **结尾不要总结**：不要「所以我觉得」「希望大家」。
5. **禁止使用**：赋能/破局/内卷/干货/划重点/本质上/维度；首先/其次/最后/总结一下；「我们」开头句式；任何符号装饰或 Markdown 语法。`
      : `### Core Principles
1. **Be specific**: Use numbers, actions, and scenes.
2. **Show, don't tell**: Let readers draw conclusions.
3. **One thing is enough**: Find one authentic feeling.
4. **No summaries**: No "I think" or "in conclusion".
5. **No buzzwords**: No emojis, Markdown symbols, or clichés.`}

### 任务
选题："""${currentIdea.content}"""

请只生成「${sectionNames[sectionKey]}」版本。
${sectionInstructions[sectionKey] || ''}

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
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${language === 'CN' ? 'API 请求失败' : 'API request failed'} (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      let text = data.choices[0]?.message?.content || '';

      text = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+ /g, '').trim();

      setGeneratedResults(prev => ({
        ...prev,
        [sectionKey]: text
      }));

      const platformMap: Record<string, 'xiaohongshu' | 'twitter_cn' | 'douyin' | 'twitter_en' | 'linkedin' | 'youtube'> = {
        xiaohongshu: 'xiaohongshu',
        chineseTweet: 'twitter_cn',
        douyinScript: 'douyin',
        englishTweet: 'twitter_en',
        linkedinPost: 'linkedin',
        youtubeScript: 'youtube'
      };

      if (platformMap[sectionKey]) {
        updatePlatformDraft(draftId, platformMap[sectionKey] as any, text);
      }

      if (feedback) {
        setStyleRefinements(prev => [...prev, feedback]);
      }

      const today = new Date().toLocaleDateString();
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: newCount }));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Regeneration error:', err);
      alert(t.drafts.generationFailed + ': ' + (message || t.drafts.checkNetwork));
    } finally {
      setIsGenerating(false);
      setRegeneratingSection(null);
      setSectionFeedback(prev => ({ ...prev, [sectionKey]: '' }));
    }
  };

  const renderFeedbackArea = (sectionKey: string) => {
    if (regeneratingSection !== sectionKey) return null;
    return (
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 183, 235, 0.05)'
      }}>
        <textarea
          value={sectionFeedback[sectionKey] || ''}
          onChange={(e) => setSectionFeedback(prev => ({ ...prev, [sectionKey]: e.target.value }))}
          placeholder={t.drafts.feedbackPlaceholder}
          rows={2}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            resize: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setRegeneratingSection(null);
              setSectionFeedback(prev => ({ ...prev, [sectionKey]: '' }));
            }}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem'
            }}
          >
            {t.common.cancel}
          </button>
          <button
            onClick={() => handleRegenerateSection(sectionKey)}
            disabled={isGenerating}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#000',
              fontSize: '0.8rem',
              fontWeight: 600,
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? t.drafts.aiThinking : (sectionFeedback[sectionKey]?.trim() ? t.drafts.feedbackSubmit : t.drafts.regenerate)}
          </button>
        </div>
      </div>
    );
  };

  const renderSectionButtons = (sectionKey: string, content: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        onClick={() => addToStyle(content)}
        title={t.drafts.styleAdded}
        style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
      >
        <Sparkles size={16} />
        {t.drafts.styleAdded}
      </button>
      <button
        onClick={() => copyToClipboard(content, sectionKey)}
        style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
      >
        {copiedSection === sectionKey ? <><CheckCircle2 size={16} color="#10b981"/> {t.common.copied}</> : <><Copy size={16} /> {t.common.copy}</>}
      </button>
      <button
        onClick={() => setRegeneratingSection(sectionKey)}
        disabled={isGenerating}
        style={{
          color: 'var(--accent-primary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent-primary)',
          opacity: isGenerating ? 0.5 : 1,
          cursor: isGenerating ? 'not-allowed' : 'pointer'
        }}
      >
        {t.drafts.regenerate}
      </button>
    </div>
  );

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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t.drafts.title}</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>{t.drafts.totalDrafts(drafts.length)}</p>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {drafts.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>{t.drafts.noDrafts}</p>
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
                    {draft.title || t.common.untitled}
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
                      title={t.drafts.confirmDelete}
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
                      title={t.common.cancel}
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
                    title={t.drafts.deleteDraft}
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.drafts.originalIdea}</h3>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.125rem' }}>
                {currentIdea ? currentIdea.content : t.drafts.unableToFindOriginalIdea}
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
                {isGenerating ? t.drafts.aiThinking : usageCount >= DAILY_LIMIT ? t.drafts.dailyLimitReached : t.drafts.aiExpand}
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
                <span>{t.drafts.usageLimit(usageCount, DAILY_LIMIT)}</span>
              </div>

              {!localStorage.getItem('seedx_user_style')?.trim() && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-primary)',
                  backgroundColor: 'rgba(255, 183, 235, 0.1)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 183, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Sparkles size={12} />
                  <span>
                    {language === 'CN'
                      ? '设置写作风格可获得更个性化的内容 →'
                      : 'Set writing style for more personalized content →'}
                  </span>
                  <button
                    onClick={() => {
                      // Navigate to style view
                      window.dispatchEvent(new CustomEvent('seedx_navigate_to_style'));
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'CN' ? '去设置' : 'Go to settings'}
                  </button>
                </div>
              )}
            </div>

            {/* AI Results */}
            {generatedResults && language === 'CN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {generatedResults.xiaohongshu && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.xiaohongshu}</h4>
                      {renderSectionButtons('xiaohongshu', generatedResults.xiaohongshu)}
                    </div>
                    {renderFeedbackArea('xiaohongshu')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.xiaohongshu}
                    </div>
                  </div>
                )}

                {generatedResults.chineseTweet && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.twitter_cn}</h4>
                      {renderSectionButtons('chineseTweet', generatedResults.chineseTweet)}
                    </div>
                    {renderFeedbackArea('chineseTweet')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.chineseTweet}
                    </div>
                  </div>
                )}

                {generatedResults.douyinScript && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.douyin}</h4>
                      {renderSectionButtons('douyinScript', generatedResults.douyinScript)}
                    </div>
                    {renderFeedbackArea('douyinScript')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.douyinScript}
                    </div>
                  </div>
                )}

              </div>
            )}

            {generatedResults && language === 'EN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {generatedResults.englishTweet && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.twitter_en}</h4>
                      {renderSectionButtons('englishTweet', generatedResults.englishTweet)}
                    </div>
                    {renderFeedbackArea('englishTweet')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.englishTweet}
                    </div>
                  </div>
                )}

                {generatedResults.linkedinPost && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.linkedin}</h4>
                      {renderSectionButtons('linkedinPost', generatedResults.linkedinPost)}
                    </div>
                    {renderFeedbackArea('linkedinPost')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.linkedinPost}
                    </div>
                  </div>
                )}

                {generatedResults.youtubeScript && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                      <h4 style={{ fontWeight: 600 }}>{t.drafts.platforms.youtube}</h4>
                      {renderSectionButtons('youtubeScript', generatedResults.youtubeScript)}
                    </div>
                    {renderFeedbackArea('youtubeScript')}
                    <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {generatedResults.youtubeScript}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            {t.drafts.selectDraft}
          </div>
        )}
      </div>

    </div>
  );
}
