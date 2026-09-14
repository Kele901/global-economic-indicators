import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useLearnProgress } from '../useLearnProgress';

const STORAGE_KEY = 'learn_progress_v1';

function stored() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

describe('useLearnProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('starts empty when nothing has been saved', async () => {
    const { result } = renderHook(() => useLearnProgress());
    expect(result.current.state.completedLessons).toEqual([]);
    expect(result.current.state.quizScores).toEqual({});
    expect(result.current.state.version).toBe(1);
    await waitFor(() => expect(stored()).not.toBeNull());
  });

  it('restores saved progress after mount', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completedLessons: ['inflation', 'interest'],
        quizScores: { inflation: { score: 3, total: 4, ts: '2026-01-01T00:00:00.000Z' } },
        studentName: 'Ada',
        startedAt: '2026-01-01T00:00:00.000Z',
        lastVisitedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(result.current.state.completedLessons).toEqual(['inflation', 'interest']));
    expect(result.current.state.studentName).toBe('Ada');
    expect(result.current.state.quizScores.inflation.score).toBe(3);
  });

  it('records a completed lesson and its quiz score', async () => {
    const { result } = renderHook(() => useLearnProgress());

    act(() => result.current.markComplete('inflation', 4, 5));

    expect(result.current.state.completedLessons).toEqual(['inflation']);
    expect(result.current.state.quizScores.inflation).toMatchObject({ score: 4, total: 5 });
    await waitFor(() => expect(stored().completedLessons).toEqual(['inflation']));
  });

  it('does not duplicate a lesson marked complete twice', () => {
    const { result } = renderHook(() => useLearnProgress());

    act(() => result.current.markComplete('inflation', 3, 5));
    act(() => result.current.markComplete('inflation', 5, 5));

    expect(result.current.state.completedLessons).toEqual(['inflation']);
    // The later attempt still overwrites the score, so retaking a quiz counts.
    expect(result.current.state.quizScores.inflation.score).toBe(5);
  });

  it('marks completion without a score when none is supplied', () => {
    const { result } = renderHook(() => useLearnProgress());

    act(() => result.current.markComplete('charts'));

    expect(result.current.state.completedLessons).toEqual(['charts']);
    expect(result.current.state.quizScores).toEqual({});
  });

  it('stores the student name for the certificate', async () => {
    const { result } = renderHook(() => useLearnProgress());

    act(() => result.current.setName('Grace'));

    expect(result.current.state.studentName).toBe('Grace');
    await waitFor(() => expect(stored().studentName).toBe('Grace'));
  });

  it('clears everything on reset', async () => {
    const { result } = renderHook(() => useLearnProgress());

    act(() => result.current.markComplete('inflation', 4, 5));
    act(() => result.current.setName('Grace'));
    act(() => result.current.resetProgress());

    expect(result.current.state.completedLessons).toEqual([]);
    expect(result.current.state.quizScores).toEqual({});
    expect(result.current.state.studentName).toBeUndefined();
    await waitFor(() => expect(stored().completedLessons).toEqual([]));
  });

  it('discards progress written by an older curriculum version', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 0, completedLessons: ['stale'], quizScores: {} }),
    );

    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(stored().version).toBe(1));
    expect(result.current.state.completedLessons).toEqual([]);
  });

  it('falls back to an empty state when the stored JSON is corrupt', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(STORAGE_KEY, '{not json');

    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(stored()).not.toBeNull());
    expect(result.current.state.completedLessons).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('repairs a stored entry whose fields have the wrong shape', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        completedLessons: 'inflation',
        quizScores: null,
        startedAt: '2026-01-01T00:00:00.000Z',
        lastVisitedAt: '2026-01-01T00:00:00.000Z',
      }),
    );

    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(stored().quizScores).toEqual({}));
    expect(result.current.state.completedLessons).toEqual([]);
    expect(result.current.state.quizScores).toEqual({});
  });

  it('does not overwrite saved progress with the empty placeholder on mount', async () => {
    const saved = {
      version: 1,
      completedLessons: ['inflation'],
      quizScores: {},
      startedAt: '2026-01-01T00:00:00.000Z',
      lastVisitedAt: '2026-01-01T00:00:00.000Z',
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    renderHook(() => useLearnProgress());

    // The persist effect runs on mount too; it must wait for the read.
    await waitFor(() => expect(stored().completedLessons).toEqual(['inflation']));
  });

  it('survives a storage quota failure without throwing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const { result } = renderHook(() => useLearnProgress());
    expect(() => act(() => result.current.markComplete('inflation', 1, 2))).not.toThrow();
    expect(result.current.state.completedLessons).toEqual(['inflation']);
  });
});
