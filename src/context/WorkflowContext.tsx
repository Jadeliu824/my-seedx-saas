import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type { Idea, Material, Draft, AnalyticsRecord, ContentStatus, PlatformDraft } from '../types';

interface WorkflowContextType {
  ideas: Idea[];
  addIdea: (content: string) => void;
  updateIdeaStatus: (id: string, status: ContentStatus) => void;
  deleteIdea: (id: string) => void;

  materials: Material[];
  addMaterial: (material: Omit<Material, 'id'>) => void;
  deleteMaterial: (id: string) => void;

  drafts: Draft[];
  addDraft: (ideaId: string, title?: string) => string;
  updatePlatformDraft: (draftId: string, platform: PlatformDraft['platform'], content: string, metadata?: Record<string, unknown>) => void;
  deleteDraft: (id: string) => void;

  analytics: AnalyticsRecord[];
  addAnalyticsRecord: (record: Omit<AnalyticsRecord, 'id'>) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Seed materials for new users
const SEED_MATERIALS_CN: Omit<Material, 'id'>[] = [
  {
    type: 'core_concept',
    title: '生产型兴趣 (Productive Interest)',
    content: '不要只做消费者，要做生产者。将你的兴趣转化为可以输出、可以产生价值的产品或内容。',
    tags: ['思考', '生产力'],
  },
  {
    type: 'golden_quote',
    title: '重复造轮子 (Reinventing the wheel)',
    content: '这避免了重复造轮子，也保证了内容的一致性。',
    tags: ['系统化', '效率'],
  },
  {
    type: 'methodology',
    title: '小红书标题方法论',
    content: '制造悬念 + 明确收益 + 痛点共鸣。生成3个标题选项供选择。',
  },
];

const SEED_MATERIALS_EN: Omit<Material, 'id'>[] = [
  {
    type: 'core_concept',
    title: 'Productive Interest',
    content: 'Don\'t just be a consumer, be a producer. Transform your interests into products or content that can be output and create value.',
    tags: ['thinking', 'productivity'],
  },
  {
    type: 'golden_quote',
    title: 'Reinventing the wheel',
    content: 'This avoids reinventing the wheel and ensures consistency in content.',
    tags: ['systematization', 'efficiency'],
  },
  {
    type: 'methodology',
    title: 'RED Note Title Methodology',
    content: 'Create suspense + clarify benefits + resonate with pain points. Generate 3 title options for selection.',
  },
];

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);

  // Track whether seeding has run for this user session
  const seededRef = useRef(false);

  // Helper: user's sub-collections
  const col = (name: string) => {
    if (!user) {
      console.warn(`Attempted to access collection ${name} without authenticated user`);
      throw new Error('Not authenticated');
    }
    return collection(db, 'users', user.uid, name);
  };

  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        setIdeas(prev => prev.length === 0 ? prev : []);
        setMaterials(prev => prev.length === 0 ? prev : []);
        setDrafts(prev => prev.length === 0 ? prev : []);
        setAnalytics(prev => prev.length === 0 ? prev : []);
        seededRef.current = false;
      }, 0);
      return;
    }

    // Subscribe to all four collections in real-time
    const unsubs: Unsubscribe[] = [];

    unsubs.push(
      onSnapshot(col('ideas'), (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Idea, 'id'>), id: d.id }));
        setIdeas(list.sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Ideas listener error:', err)),
    );

    unsubs.push(
      onSnapshot(col('materials'), async (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Material, 'id'>), id: d.id }));
        setMaterials(list);

        // Seed default materials for brand-new users
        if (!seededRef.current && list.length === 0) {
          seededRef.current = true;
          const batch = writeBatch(db);
          const isEN = localStorage.getItem('seedx_language') !== 'CN';
          const seedMaterials = isEN ? SEED_MATERIALS_EN : SEED_MATERIALS_CN;
          seedMaterials.forEach((m) => {
            const ref = doc(col('materials'));
            batch.set(ref, { ...m });
          });
          await batch.commit();
        } else if (list.length > 0) {
          seededRef.current = true;
        }
      }),
    );

    unsubs.push(
      onSnapshot(col('drafts'), (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Draft, 'id'>), id: d.id }));
        setDrafts(list.sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => console.error('Drafts listener error:', err)),
    );

    unsubs.push(
      onSnapshot(col('analytics'), (snap) => {
        setAnalytics(snap.docs.map((d) => ({ ...(d.data() as Omit<AnalyticsRecord, 'id'>), id: d.id })));
      }),
    );

    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Ideas ──────────────────────────────────────────────────────────────────

  const addIdea = async (content: string) => {
    if (!user) return;
    const id = uuidv4();
    const newIdea: Idea = { id, content, createdAt: Date.now(), status: 'inbox' };
    
    // Optimistic Update
    setIdeas((prev) => [newIdea, ...prev]);
    
    try {
      await setDoc(doc(col('ideas'), id), { 
        content, 
        createdAt: newIdea.createdAt, 
        status: 'inbox' 
      });
      console.log('Idea saved successfully:', id);
    } catch (err) {
      console.error('Failed to add idea:', err);
      const isEN = localStorage.getItem('seedx_language') !== 'CN';
      alert(isEN ? 'Failed to save idea, please check network connection or login status.' : '想法保存失败，请检查网络连接或登录状态。');
      // Revert optimistic update
      setIdeas((prev) => prev.filter(i => i.id !== id));
    }
  };

  const updateIdeaStatus = async (id: string, status: ContentStatus) => {
    if (!user) return;
    const originalStatus = ideas.find(i => i.id === id)?.status;
    
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
    
    try {
      await setDoc(doc(col('ideas'), id), { status }, { merge: true });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert
      if (originalStatus) {
        setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status: originalStatus } : idea)));
      }
    }
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;
    try {
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      // Also cleanup associated drafts
      const toDelete = drafts.filter((d) => d.ideaId === id);
      setDrafts((prev) => prev.filter((d) => d.ideaId !== id));
      
      await deleteDoc(doc(col('ideas'), id));
      for (const d of toDelete) {
        await deleteDoc(doc(col('drafts'), d.id));
      }
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  // ── Materials ──────────────────────────────────────────────────────────────

  const addMaterial = (material: Omit<Material, 'id'>) => {
    if (!user) return;
    const id = uuidv4();
    setMaterials((prev) => [...prev, { ...material, id }]);
    setDoc(doc(col('materials'), id), material);
  };

  const deleteMaterial = async (id: string) => {
    if (!user) return;
    try {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      await deleteDoc(doc(col('materials'), id));
    } catch (error) {
      console.error('Failed to delete material:', error);
    }
  };

  // ── Drafts ─────────────────────────────────────────────────────────────────

  const addDraft = (ideaId: string, title: string = 'Untitled Draft') => {
    if (!user) return '';
    const id = uuidv4();
    const newDraft: Draft = { id, ideaId, title, drafts: {}, createdAt: Date.now() };
    setDrafts((prev) => [newDraft, ...prev]);
    setDoc(doc(col('drafts'), id), { ideaId, title, drafts: {}, createdAt: newDraft.createdAt });
    return id;
  };

  const updatePlatformDraft = (
    draftId: string,
    platform: PlatformDraft['platform'],
    content: string,
    metadata?: Record<string, unknown>,
  ) => {
    if (!user) return;
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        return {
          ...draft,
          drafts: { ...draft.drafts, [platform]: { platform, content, metadata } },
        };
      }),
    );
    setDoc(
      doc(col('drafts'), draftId),
      { drafts: { [platform]: { platform, content, metadata: metadata || {} } } },
      { merge: true },
    );
  };

  const deleteDraft = async (id: string) => {
    if (!user) return;
    try {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      await deleteDoc(doc(col('drafts'), id));
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  // ── Analytics ──────────────────────────────────────────────────────────────

  const addAnalyticsRecord = (record: Omit<AnalyticsRecord, 'id'>) => {
    if (!user) return;
    const id = uuidv4();
    setAnalytics((prev) => [...prev, { ...record, id }]);
    setDoc(doc(col('analytics'), id), record);
  };

  return (
    <WorkflowContext.Provider value={{
      ideas, addIdea, updateIdeaStatus, deleteIdea,
      materials, addMaterial, deleteMaterial,
      drafts, addDraft, updatePlatformDraft, deleteDraft,
      analytics, addAnalyticsRecord,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return context;
}
