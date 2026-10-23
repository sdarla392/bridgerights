import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CasesState } from '@/features/cases/types/case';
import { generateTasks } from '@/features/cases/utils/tasks';
import { zustandStorage } from '@/lib/storage';

const now = () => new Date().toISOString();

export const useCasesStore = create<CasesState>()(
  persist(
    (set) => ({
      cases: [],
      createCase: (facts) => {
        const id = `case-${Date.now()}`;
        set((s) => ({
          cases: [{ id, createdAt: now(), updatedAt: now(), facts, notice: null, tasks: generateTasks(facts) }, ...s.cases],
        }));
        return id;
      },
      updateFacts: (id, facts) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === id ? { ...c, facts, updatedAt: now(), tasks: generateTasks(facts, c.tasks) } : c)),
        })),
      saveNotice: (id, notice) =>
        set((s) => ({ cases: s.cases.map((c) => (c.id === id ? { ...c, notice, updatedAt: now() } : c)) })),
      toggleTask: (id, taskId) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id ? { ...c, updatedAt: now(), tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) } : c,
          ),
        })),
      deleteCase: (id) => set((s) => ({ cases: s.cases.filter((c) => c.id !== id) })),
    }),
    { name: 'bridgerights-cases', storage: createJSONStorage(() => zustandStorage) },
  ),
);
