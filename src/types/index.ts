export type ContentStatus = 'inbox' | 'drafting' | 'published';

export interface Idea {
  id: string;
  content: string;
  createdAt: number;
  status: ContentStatus;
}

export type MaterialType = 'core_concept' | 'golden_quote' | 'published_note' | 'methodology';

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  content: string; // Markdown or raw text
  tags?: string[];
}

export interface PlatformDraft {
  platform: 'twitter' | 'xiaohongshu' | 'youtube' | 'instagram' | 'twitter_cn' | 'twitter_en';
  content: string; // the generated content
  metadata?: any;  // e.g. title options, cover suggestions
}

export interface Draft {
  id: string;
  ideaId: string;
  title: string;
  drafts: Record<string, PlatformDraft>; 
  createdAt: number;
}

export interface AnalyticsRecord {
  id: string;
  draftId: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: number;
  reflection: string;
}
