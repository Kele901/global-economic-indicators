'use client';

// Learn: A Beginner\u2019s Guide to the Global Economy (Ages 13+).
// Scrollytelling page pattern (dark/light mode, sticky progress bar,
// module cards, per-lesson panels with quizzes and demos, final
// wrap-up quiz and printable certificate).

import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLearnProgress } from '../hooks/useLearnProgress';
import { MODULES, TOTAL_LESSONS, WRAP_UP_QUIZ, lessonsByModule } from './lessons';
import LearnHero from '../components/learn/LearnHero';
import ProgressBar from '../components/learn/ProgressBar';
import ModuleCard from '../components/learn/ModuleCard';
import WrapUpQuiz from '../components/learn/WrapUpQuiz';
import Certificate from '../components/learn/Certificate';
import LearnPrintPack from '../components/learn/LearnPrintPack';

const WRAP_UP_LESSON_ID = 'wrap-up';

export default function LearnPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const { state, markComplete, setName, resetProgress } = useLearnProgress();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const completedCount = state.completedLessons.filter(id => id !== WRAP_UP_LESSON_ID).length;
  const wrapUpDone = state.completedLessons.includes(WRAP_UP_LESSON_ID);
  const allLessonsDone = completedCount >= TOTAL_LESSONS;
  const courseComplete = allLessonsDone && wrapUpDone;

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg} ${textPrimary}`}>
      <ProgressBar
        completed={completedCount}
        total={TOTAL_LESSONS}
        wrapUpDone={wrapUpDone}
        isDarkMode={isDarkMode}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex justify-end mb-4 gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className={`text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
            aria-label="Download printable lesson pack"
          >
            Download printable lesson pack
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`text-xs px-3 py-2 rounded-md border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900'
            }`}
          >
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <LearnHero
          isDarkMode={isDarkMode}
          completed={completedCount}
          total={TOTAL_LESSONS}
          studentName={state.studentName}
        />

        {MODULES.map((mod, i) => (
          <div key={mod.id} className="print:hidden">
            <ModuleCard
              module={mod}
              index={i + 1}
              lessons={lessonsByModule(mod.id)}
              isDarkMode={isDarkMode}
              completedLessons={state.completedLessons}
              quizScores={state.quizScores}
              onComplete={markComplete}
            />
          </div>
        ))}

        <LearnPrintPack modules={MODULES} lessonsByModule={lessonsByModule} />

        {/* Wrap-up quiz gate */}
        <section id="wrap-up" className="mt-16 print:hidden">
          <WrapUpQuiz
            isDarkMode={isDarkMode}
            questions={WRAP_UP_QUIZ}
            unlocked={allLessonsDone}
            existingScore={state.quizScores[WRAP_UP_LESSON_ID]}
            onFinish={(score, total) => markComplete(WRAP_UP_LESSON_ID, score, total)}
          />
        </section>

        {courseComplete && (
          <section id="certificate" className="mt-12">
            <Certificate
              isDarkMode={isDarkMode}
              studentName={state.studentName}
              onSetName={setName}
              completionDate={state.quizScores[WRAP_UP_LESSON_ID]?.ts ?? new Date().toISOString()}
            />
          </section>
        )}

        <footer className={`mt-16 pt-6 border-t text-xs print:hidden ${
          isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'
        }`}>
          Learn is a plain-English starter guide. If you spot something confusing, tell us on the {' '}
          <a href="/contact" className="text-blue-500 hover:underline">contact page</a>.
          {' · '}
          <button
            onClick={() => { if (window.confirm('Reset all your learn progress? This can\u2019t be undone.')) resetProgress(); }}
            className="text-blue-500 hover:underline"
          >
            Reset progress
          </button>
        </footer>
      </div>
    </div>
  );
}
