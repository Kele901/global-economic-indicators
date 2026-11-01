'use client';

import { STORIES, type Story } from '../../utils/heatmap/stories';
import { heatmapTheme } from './theme';

interface Props {
  active: { story: Story; step: number } | null;
  isDarkMode: boolean;
  onStart: (id: string) => void;
  onStep: (step: number) => void;
  onExit: () => void;
}

export default function StoryTours({ active, isDarkMode, onStart, onStep, onExit }: Props) {
  const tc = heatmapTheme(isDarkMode);

  if (active) {
    const { story, step } = active;
    const s = story.steps[step];
    const last = step === story.steps.length - 1;
    return (
      <section aria-label="Story tour" className={`rounded-xl border-2 p-4 sm:p-5 mb-4 ${isDarkMode ? 'bg-indigo-950/40 border-indigo-500/60' : 'bg-indigo-50 border-indigo-300'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              Story tour &middot; {story.title} &middot; {step + 1} of {story.steps.length}
            </p>
            <h2 className="text-lg sm:text-xl font-bold mt-0.5">{s.title}</h2>
          </div>
          <button onClick={onExit} className={`text-xs px-2.5 py-1 rounded-md border shrink-0 ${tc.chip}`}>Exit tour</button>
        </div>
        <p className={`text-sm sm:text-base leading-relaxed mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{s.caption}</p>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5" role="tablist" aria-label="Tour steps">
            {story.steps.map((st, i) => (
              <button key={i} role="tab" aria-selected={i === step} aria-label={`Step ${i + 1}: ${st.title}`} onClick={() => onStep(i)}
                className={`h-2.5 rounded-full transition-all ${i === step ? 'w-8 bg-indigo-600' : `w-2.5 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-indigo-200 hover:bg-indigo-300'}`}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onStep(step - 1)} disabled={step === 0}
              className={`px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 ${tc.selectBg}`}>&larr; Back</button>
            <button onClick={() => (last ? onExit() : onStep(step + 1))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white">
              {last ? 'Finish' : 'Next \u2192'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Story tours" className="mb-4">
      <h2 className={`text-xs uppercase tracking-wider mb-2 ${tc.textSec}`}>Guided story tours</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STORIES.map(story => (
          <button key={story.id} onClick={() => onStart(story.id)}
            className={`text-left rounded-xl border p-4 transition-colors ${tc.card} ${isDarkMode ? 'hover:border-indigo-500' : 'hover:border-indigo-400'}`}>
            <span className="block font-semibold mb-1">{story.title}</span>
            <span className={`block text-xs leading-relaxed mb-2 ${tc.textSec}`}>{story.blurb}</span>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{story.steps.length} steps &rarr;</span>
          </button>
        ))}
      </div>
    </section>
  );
}
