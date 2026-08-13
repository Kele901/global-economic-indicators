'use client';

// Landing hero for the /learn page. Big friendly headline, one-sentence
// pitch, "Start learning" scroll button, and a "welcome back" recap
// when returning after some lessons are done.

interface Props {
  isDarkMode: boolean;
  completed: number;
  total: number;
  studentName?: string;
}

export default function LearnHero({ isDarkMode, completed, total, studentName }: Props) {
  const heroBg = isDarkMode
    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-blue-900/30 border-gray-700'
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-blue-100';

  const scrollToStart = () => {
    const target = document.getElementById('module-1');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className={`rounded-2xl border p-6 sm:p-8 mb-10 ${heroBg}`}>
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
        Learn — Ages 13+
      </div>
      <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        A Beginner&apos;s Guide to the Global Economy
      </h1>
      <p className={`text-base sm:text-lg max-w-2xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Fifteen short lessons across four modules. Real-world analogies, quick
        interactive demos, and a mini quiz at the end of each lesson. Finish
        them all and you unlock a printable certificate.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={scrollToStart}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          {completed === 0 ? 'Start learning' : 'Continue learning'}
        </button>
        {completed > 0 && (
          <div
            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            aria-live="polite"
          >
            {studentName ? <>Welcome back, <span className="font-semibold">{studentName}</span>! </> : 'Welcome back! '}
            You&apos;ve completed <span className="font-semibold">{completed}</span> of{' '}
            <span className="font-semibold">{total}</span> lessons.
          </div>
        )}
      </div>

      <div className={`mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2"><span aria-hidden>💡</span> Plain-English lessons</div>
        <div className="flex items-center gap-2"><span aria-hidden>🎮</span> Interactive demos</div>
        <div className="flex items-center gap-2"><span aria-hidden>✅</span> Quick quizzes</div>
        <div className="flex items-center gap-2"><span aria-hidden>🏆</span> Printable certificate</div>
      </div>
    </section>
  );
}
