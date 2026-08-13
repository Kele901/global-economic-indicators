'use client';

// Module card for the /learn page. Groups its child LessonPanels under
// a coloured header, tracks completion inside the module, and lives at
// a stable id (module-1, module-2...) so the hero button can scroll to
// it. Collapsible only in the sense that each child lesson expands on
// click — the module header itself is always visible.

import type { Lesson, Module } from '../../learn/lessons';
import type { QuizScore } from '../../hooks/useLearnProgress';
import LessonPanel from './LessonPanel';

interface Props {
  module: Module;
  index: number;
  lessons: Lesson[];
  isDarkMode: boolean;
  completedLessons: string[];
  quizScores: Record<string, QuizScore>;
  onComplete: (id: string, score?: number, total?: number) => void;
}

const MODULE_COLOR: Record<string, { fg: string; bar: string }> = {
  money:     { fg: 'text-amber-500',   bar: '#f59e0b' },
  economy:   { fg: 'text-emerald-500', bar: '#10b981' },
  countries: { fg: 'text-sky-500',     bar: '#0ea5e9' },
  themes:    { fg: 'text-violet-500',  bar: '#8b5cf6' },
};

export default function ModuleCard({ module, index, lessons, isDarkMode, completedLessons, quizScores, onComplete }: Props) {
  const doneInModule = lessons.filter(l => completedLessons.includes(l.id)).length;
  const c = MODULE_COLOR[module.id] ?? MODULE_COLOR.money;

  return (
    <section id={`module-${index}`} className="mb-12">
      <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: c.bar }} aria-hidden />
        <div className="flex-1">
          <div className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${c.fg}`}>
            Module {index}
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-2" aria-hidden>{module.emoji}</span>
            {module.label}
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{module.blurb}</p>
        </div>
        <div
          className={`text-xs tabular-nums shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          aria-label={`${doneInModule} of ${lessons.length} lessons complete in this module`}
        >
          {doneInModule}/{lessons.length}
        </div>
      </div>

      <div className="space-y-3">
        {lessons.map(lesson => (
          <LessonPanel
            key={lesson.id}
            lesson={lesson}
            isDarkMode={isDarkMode}
            isComplete={completedLessons.includes(lesson.id)}
            quizScore={quizScores[lesson.id]}
            onComplete={onComplete}
          />
        ))}
      </div>
    </section>
  );
}
