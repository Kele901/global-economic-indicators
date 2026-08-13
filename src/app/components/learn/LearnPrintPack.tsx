'use client';

// Print-only view of every lesson body. Hidden on screen (max-h-0
// + hidden print:block), fully expanded when the user hits print
// so the whole 15-lesson curriculum comes out in a single PDF /
// paper pack. The button lives on the /learn page and calls
// window.print().

import type { Lesson, Module } from '../../learn/lessons';

interface Props {
  modules: Module[];
  lessonsByModule: (id: Module['id']) => Lesson[];
}

export default function LearnPrintPack({ modules, lessonsByModule }: Props) {
  return (
    <div className="hidden print:block text-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Learn: A Beginner&apos;s Guide to the Global Economy</h1>
        <p className="text-sm mt-2">Printable lesson pack · Global Economic Indicators</p>
      </div>

      {modules.map((mod, i) => {
        const lessons = lessonsByModule(mod.id);
        return (
          <section key={mod.id} className="mb-10 break-inside-avoid">
            <h2 className="text-2xl font-semibold mb-2">
              Module {i + 1}: {mod.label}
            </h2>
            <p className="text-sm italic mb-4">{mod.blurb}</p>

            {lessons.map(lesson => (
              <article key={lesson.id} className="mb-6 break-inside-avoid">
                <h3 className="text-lg font-semibold mb-1">
                  {lesson.order}. {lesson.title}
                  <span className="ml-2 text-xs font-normal">({lesson.minutes} min)</span>
                </h3>
                <p className="text-sm italic mb-2">Analogy: {lesson.analogy}</p>
                {lesson.body.map((para, k) => (
                  <p key={k} className="text-sm mb-2 leading-relaxed">{para}</p>
                ))}
                <ul className="text-sm list-disc ml-5 mt-1 mb-2">
                  {lesson.bigIdeas.map((idea, k) => (
                    <li key={k}><strong>Big idea:</strong> {idea}</li>
                  ))}
                </ul>
                {lesson.jargonBox && lesson.jargonBox.length > 0 && (
                  <dl className="text-sm mt-2 border-l-2 border-gray-400 pl-3">
                    {lesson.jargonBox.map((j, k) => (
                      <div key={k} className="mb-1">
                        <dt className="inline font-semibold">{j.term}: </dt>
                        <dd className="inline">{j.plain}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            ))}
          </section>
        );
      })}

      <footer className="text-xs mt-12 pt-4 border-t border-gray-400">
        © Global Economic Indicators · globaleconindicators.info · Free to print for classroom use.
      </footer>
    </div>
  );
}
