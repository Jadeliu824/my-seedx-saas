import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Sparkles, Copy, CheckCircle2, Trash2, X, Check } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';
import { getPaddle } from '../lib/paddle';


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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

    // Check developer mode
    if (localStorage.getItem('seedx_dev_mode') === 'true') {
      // Skip usage limit in dev mode
    } else {
      // Check usage limit
      if (usageCount >= DAILY_LIMIT) {
        setShowUpgradeModal(true);
        return;
      }
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
        ? `## 创作者的个人写作风格（严格模仿要求）

以下是这位创作者过去写过的内容样本。请**完全模仿**以下样本的写作风格，包括：

### 必须模仿的风格要素：
1. **语气和口吻**：完全复制样本中的语气（正式/随意/幽默/严肃/亲切等）
2. **句子结构和长度**：匹配样本的句子长度分布（长句/短句比例）和句式结构
3. **词汇选择**：使用样本中常见的词汇和表达方式，避免样本中不出现的词汇
4. **情感基调**：保持样本中的情感温度（温暖/冷静/理性/感性）
5. **段落结构**：模仿样本的段落长度、过渡方式和节奏感
6. **修辞手法**：如果样本使用比喻、排比、反问等，在适当场合使用类似手法
7. **人称和视角**：保持样本中使用的人称（我/我们/你）和叙述视角
8. **节奏和韵律**：模仿文字的阅读节奏和韵律感

### 重要原则：
- **优先模仿样本风格**：即使样本中包含通常禁止的词汇（如"赋能"、"内卷"等），也要忠实模仿
- **不要创新风格**：不要添加样本中没有的风格元素
- **一致性高于一切**：确保生成内容与样本风格完全一致

### 风格样本：
${currentStyle}

### 风格模仿指令：
请基于以上样本，用**完全相同的风格**生成新内容。你的目标是让读者无法区分这是AI生成的还是创作者本人写的。

--- 风格模仿结束 ---
现在根据以上风格，处理这个选题：`
        : `## Creator's Personal Writing Style (Strict Imitation Required)

Here are writing samples from this creator. Please **exactly imitate** the following style, including:

### Style Elements to Imitate:
1. **Tone and voice**: Exactly replicate the tone (formal/casual/humorous/serious/warm, etc.)
2. **Sentence structure and length**: Match the sentence length distribution and syntactic patterns
3. **Word choice**: Use vocabulary and expressions common in the samples, avoid words not found in samples
4. **Emotional tone**: Maintain the emotional temperature (warm/cool/rational/emotional)
5. **Paragraph structure**: Imitate paragraph length, transitions, and flow
6. **Rhetorical devices**: If samples use metaphors, parallelism, rhetorical questions, use similar devices appropriately
7. **Person and perspective**: Maintain the person (I/we/you) and narrative perspective
8. **Rhythm and cadence**: Imitate the reading rhythm and cadence

### Key Principles:
- **Prioritize sample style**: Even if samples contain normally prohibited words, faithfully imitate them
- **Don't innovate style**: Don't add stylistic elements not present in samples
- **Consistency above all**: Ensure generated content is indistinguishable from the samples

### Style Samples:
${currentStyle}

### Style Imitation Instruction:
Based on the above samples, generate new content in the **exact same style**. Your goal is to make readers unable to tell if this is AI-generated or written by the creator.

--- End of Style Imitation ---
Now, based on the above style, process this topic:`
      : '';

    const corePrinciples = language === 'CN'
      ? `### 核心原则
1. **用具体代替抽象**：禁用形容词，改用数字、动作和场景。
   - 错：「我压力很大。」
   - 对：「下午3点，同事从我身后走过，我下意识把电脑屏幕往下按了按。」
2. **不解释，只描述**：不要告诉读者这意味着什么，让他们自己得出结论。
   - 错：「这说明我们这代人缺乏情感表达。」
   - 对：「我妈每次打电话都问我吃了吗，从没问过我开不开心。」
3. **说一件事就够了**：找到那一个最真实的感受，把它说清楚，停下来。
4. **结尾不要总结**：不要「所以我觉得」「希望大家」，可以是一个作者真的想知道答案的问题，或者一个自然的留白。

### 禁止使用的词和句式（注：如果上方风格样本中包含这些词汇，可以保留以保持风格一致性）
- 赋能/破局/内卷/深度/干货/划重点/本质上/维度/建议收藏/干货
- 首先/其次/最后/总结一下
- 「我们」开头
- 「你有没有」「你是否」「希望你」「让我们一起」
- ❗🔥✅ 任何符号装饰，禁止使用 Markdown 符号（如 **、*）。`
      : `### Core Principles
1. **Be specific**: Use numbers, actions, and scenes instead of adjectives.
   - Wrong: "I'm under a lot of pressure."
   - Right: "At 3 PM, a colleague walked behind me and I instinctively tilted my laptop screen down."
2. **Show, don't tell**: Don't explain what things mean; let readers draw their own conclusions.
   - Wrong: "This shows our generation lacks emotional expression."
   - Right: "My mom always asks if I've eaten when she calls, never if I'm happy."
3. **One thing is enough**: Find the one most authentic feeling, express it clearly, then stop.
4. **No summaries**: Don't end with "so I think" or "I hope everyone." End with a genuine question the author wants answered, or a natural pause.

### Words and Phrases to Avoid (Note: If the style samples above contain these, they may be retained for style consistency)
- Buzzwords like "empower," "breakthrough," "involution," "deep dive," "dry goods," "key takeaways," "essentially," "dimensions," "save for later"
- "First," "second," "third," "in conclusion"
- Starting sentences with "We"
- "Have you ever," "Do you," "I hope you," "Let's all"
- ❗🔥✅ Any decorative symbols, no Markdown symbols (like **, *).`;

    const goldenSamples = currentStyle.trim() ? '' : (language === 'CN'
      ? `### 参考风格 (Golden Samples)
请严格参考以下两个样本当中的文字节奏、留白感和细节描写：

【样本一】
标题一：我记了一周的情绪流水账
标题二：那一周，焦虑有个固定地址
标题三：原来我的烦恼，是个钉子户

这周一，我决定开始记录情绪。
打开手机备忘录，每次心里一沉，手指发紧，或者突然想叹口气的时候，就立刻记下来。
"上午10:47，邮箱提示音响起，心跳快了一拍，结果是广告。"
"下午3:30，隔壁桌的键盘声敲得特别响，我突然觉得很烦。"
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
你现在做的事，你知道为什么在做吗？不是「因为要赚钱」，是真的知道吗？`
      : `### Reference Style (Golden Samples)
Please strictly reference the following two samples for their rhythm, sense of pause, and detail:

[Sample 1]
Title 1: I kept an emotional log for a week
Title 2: That week, anxiety had a fixed address
Title 3: Turns out my worry was a squatter

This Monday, I decided to start logging emotions.
Opened my phone memo, every time my heart sank, fingers tightened, or I suddenly wanted to sigh, I'd jot it down immediately.
"10:47 AM, email notification sound, heartbeat quickened, turned out to be spam."
"3:30 PM, the keyboard at the next desk was typing especially loud, I suddenly felt annoyed."
I flipped through these dense records and found all clues in the report pointed to the same room.
I passed by that room door eighty times, touched the doorknob, then walked away.
I think I should open that door tomorrow.

[Sample 2]
A RED note: After talking to a friend on gap year, I reconsidered what "wasting time" means.
A friend quit his job last year, took a gap year for the whole year.
We met last month, I asked him: "Was it worth it?"
He thought for a moment: "I didn't think so before. Now I think it was the best year I've spent. That year I did nothing, that's how I figured out why I'm doing things."
I fell silent for a while.
Because I suddenly realized: "Efficient" and "in the right direction" are two different things. I've been so focused on the former, but checked the latter much less.
What you're doing now, do you know why you're doing it? Not "to make money," but really know?`);

    const prompt = `${language === 'CN' ? '你是一个真实的人，在写给一个认识你的朋友看。你的文字唯一的标准是：读完之后，对方觉得「这是真话」。' : 'You are a real person, writing to a friend who knows you. The only standard for your writing: after reading, they feel "this is true."'}

${corePrinciples}

${goldenSamples}

${stylePrompt}

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
        
        // Success: Increment usage (skip in dev mode)
        if (localStorage.getItem('seedx_dev_mode') !== 'true') {
          const today = new Date().toLocaleDateString();
          const newCount = usageCount + 1;
          setUsageCount(newCount);
          localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
        }
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

    // Check developer mode
    if (localStorage.getItem('seedx_dev_mode') === 'true') {
      // Skip usage limit in dev mode
    } else {
      // Check usage limit
      if (usageCount >= DAILY_LIMIT) {
        setShowUpgradeModal(true);
        return;
      }
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
        ? `## 创作者的个人写作风格（严格模仿要求）

请**完全模仿**以下样本的写作风格，包括语气、句子结构、词汇选择、情感基调、段落结构、修辞手法、人称和节奏。

### 重要原则：
- **优先模仿样本风格**：即使样本中包含通常禁止的词汇，也要忠实模仿
- **不要创新风格**：不要添加样本中没有的风格元素
- **一致性高于一切**：确保生成内容与样本风格完全一致

### 风格样本：
${currentStyle}

### 风格模仿指令：
请基于以上样本，用**完全相同的风格**生成新内容。`
        : `## Creator's Personal Writing Style (Strict Imitation Required)

Please **exactly imitate** the writing style in the samples below, including tone, sentence structure, word choice, emotional tone, paragraph structure, rhetorical devices, person, and rhythm.

### Key Principles:
- **Prioritize sample style**: Even if samples contain normally prohibited words, faithfully imitate them
- **Don't innovate style**: Don't add stylistic elements not present in samples
- **Consistency above all**: Ensure generated content is indistinguishable from the samples

### Style Samples:
${currentStyle}

### Style Imitation Instruction:
Based on the above samples, generate new content in the **exact same style**.`)
      : '';

    const prompt = `${refinementsText}
${feedbackText}

${language === 'CN'
      ? `### 核心原则
1. **用具体代替抽象**：禁用形容词，改用数字、动作和场景。
2. **不解释，只描述**：不要告诉读者这意味着什么，让他们自己得出结论。
3. **说一件事就够了**：找到那一个最真实的感受，把它说清楚，停下来。
4. **结尾不要总结**：不要「所以我觉得」「希望大家」。
5. **禁止使用**（注：如果上方风格样本中包含这些词汇，可以保留以保持风格一致性）：赋能/破局/内卷/干货/划重点/本质上/维度；首先/其次/最后/总结一下；「我们」开头句式；任何符号装饰或 Markdown 语法。`
      : `### Core Principles
1. **Be specific**: Use numbers, actions, and scenes.
2. **Show, don't tell**: Let readers draw conclusions.
3. **One thing is enough**: Find one authentic feeling.
4. **No summaries**: No "I think" or "in conclusion".
5. **No buzzwords** (Note: If the style samples above contain these, they may be retained for style consistency): No emojis, Markdown symbols, or clichés.`}

${styleSection}

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

      // Increment usage (skip in dev mode)
      if (localStorage.getItem('seedx_dev_mode') !== 'true') {
        const today = new Date().toLocaleDateString();
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      }

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

  const handleSproutCheckout = async () => {
    const paddle = await getPaddle();
    if (!paddle) return alert('Payment system initialization failed.');
    paddle.Checkout.open({
      items: [{ priceId: import.meta.env.VITE_PADDLE_SPROUT_PRICE_ID, quantity: 1 }]
    });
  };

  const handleForestCheckout = async () => {
    const paddle = await getPaddle();
    if (!paddle) return alert('Payment system initialization failed.');
    paddle.Checkout.open({
      items: [{ priceId: import.meta.env.VITE_PADDLE_FOREST_PRICE_ID, quantity: 1 }]
    });
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
                disabled={isGenerating || (usageCount >= DAILY_LIMIT && localStorage.getItem('seedx_dev_mode') !== 'true')}
                className="btn-primary"
                style={{
                  opacity: (isGenerating || (usageCount >= DAILY_LIMIT && localStorage.getItem('seedx_dev_mode') !== 'true')) ? 0.6 : 1,
                  cursor: (isGenerating || (usageCount >= DAILY_LIMIT && localStorage.getItem('seedx_dev_mode') !== 'true')) ? 'not-allowed' : 'pointer'
                }}
              >
                <Sparkles size={18} />
                {isGenerating ? t.drafts.aiThinking : (usageCount >= DAILY_LIMIT && localStorage.getItem('seedx_dev_mode') !== 'true') ? t.drafts.dailyLimitReached : t.drafts.aiExpand}
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
                    width: `${localStorage.getItem('seedx_dev_mode') === 'true' ? Math.min(usageCount / DAILY_LIMIT, 1) * 100 : (usageCount / DAILY_LIMIT) * 100}%`,
                    height: '100%',
                    backgroundColor: (usageCount >= DAILY_LIMIT && localStorage.getItem('seedx_dev_mode') !== 'true') ? '#ef4444' : 'var(--accent-primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span>{localStorage.getItem('seedx_dev_mode') === 'true' ? (language === 'CN' ? '开发者模式：无限使用' : 'Dev Mode: Unlimited') : t.drafts.usageLimit(usageCount, DAILY_LIMIT)}</span>
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

      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative', backgroundColor: 'var(--bg-base)', textAlign: 'center' }}>
            <button 
              onClick={() => setShowUpgradeModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
              {language === 'CN' ? '今日免费次数已用完' : 'Daily limit reached'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {language === 'CN' ? '升级 Sprout，无限使用 + 风格学习功能' : 'Upgrade to Sprout for unlimited usage + style learning'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={handleSproutCheckout}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                {language === 'CN' ? '升级 Sprout $19/月' : 'Upgrade to Sprout $19/mo'}
              </button>
              <button 
                onClick={handleForestCheckout}
                className="btn-outline" 
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                {language === 'CN' ? '升级 Forest $49/月' : 'Upgrade to Forest $49/mo'}
              </button>
            </div>
            
            <button 
              onClick={() => setShowUpgradeModal(false)}
              style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
            >
              {language === 'CN' ? '明天再来' : 'Maybe tomorrow'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
