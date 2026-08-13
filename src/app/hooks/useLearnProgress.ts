'use client';

// Progress tracker for the /learn starter guide. Persists lesson
// completion, quiz scores, and (optional) student name into
// localStorage under a versioned key so that later curriculum bumps
// can invalidate stale entries. SSR-guarded, forgiving JSON parser,
// no throws on quota issues.

import { useCallback, useEffect, useState } from 'react';

export interface QuizScore {
  score: number;
  total: number;
  ts: string;   // ISO timestamp
}

export interface LearnProgressState {
  version: 1;
  completedLessons: string[];
  quizScores: Record<string, QuizScore>;
  studentName?: string;
  startedAt: string;
  lastVisitedAt: string;
}

const STORAGE_KEY = 'learn_progress_v1';
const CURRENT_VERSION = 1 as const;

function emptyState(): LearnProgressState {
  const nowIso = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    completedLessons: [],
    quizScores: {},
    startedAt: nowIso,
    lastVisitedAt: nowIso,
  };
}

function readInitial(): LearnProgressState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as LearnProgressState;
    if (parsed.version !== CURRENT_VERSION) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
    };
  } catch (err) {
    console.warn('[useLearnProgress] failed to parse stored state', err);
    return emptyState();
  }
}

export function useLearnProgress() {
  const [state, setState] = useState<LearnProgressState>(readInitial);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastVisitedAt: new Date().toISOString() }));
    } catch (err) {
      console.warn('[useLearnProgress] failed to persist state', err);
    }
    // Intentionally omit lastVisitedAt update from deps loop; we snapshot on write only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const markComplete = useCallback((lessonId: string, score?: number, total?: number) => {
    setState(prev => {
      const nextCompleted = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];
      const nextScores = { ...prev.quizScores };
      if (score !== undefined && total !== undefined) {
        nextScores[lessonId] = { score, total, ts: new Date().toISOString() };
      }
      return { ...prev, completedLessons: nextCompleted, quizScores: nextScores };
    });
  }, []);

  const setName = useCallback((name: string) => {
    setState(prev => ({ ...prev, studentName: name }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(emptyState());
  }, []);

  return {
    state,
    markComplete,
    setName,
    resetProgress,
  };
}
