'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

const LONG_WAVES = [
  {
    name: '1st Wave (1780\u20131842): Steam & Textiles',
    desc: "Centered on Britain's Industrial Revolution: factory production, coal and steam power, and textile mechanization. Long-term price and output swings reflected the diffusion of a new production paradigm and the first truly global commodity linkages.",
  },
  {
    name: '2nd Wave (1842\u20131897): Railways & Steel',
    desc: 'Rail networks and steel-intensive infrastructure connected continents and lowered trade costs. The Gilded Age and late Victorian boom saw massive capital formation, periodic financial panics, and accelerating global trade.',
  },
  {
    name: '3rd Wave (1897\u20131949): Electricity & Chemicals',
    desc: 'Mass production, scientific management, electrical grids, and chemical industries scaled output. Two world wars and the interwar debt-deflation episode sit inside this wave, showing how geopolitics can dominate medium-term outcomes.',
  },
  {
    name: '4th Wave (1949\u20132000): Oil, Autos & Electronics',
    desc: 'Post-war reconstruction, suburbanization, consumer durables, petrochemicals, and later semiconductors defined growth. Stagflation in the 1970s and the shift toward services and IT foreshadowed the transition to the next wave.',
  },
  {
    name: '5th Wave (2000\u2013present): Digital & AI',
    desc: "The internet, mobile computing, platforms, cloud infrastructure, and now generative AI characterize the current long-wave narrative. Debates focus on whether digital technologies lift trend productivity the way electricity or oil did, and how finance cycles around those bets.",
  },
] as const;

export default function KondratievLongWavesGuide() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);

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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="mb-4">
          <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; All Guides</a>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Kondratiev Long Waves</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          A guide to multi-decade &ldquo;super-cycles&rdquo; of technology and finance: Nikolai Kondratiev&apos;s original idea, the five long waves, seasonal metaphors, Carlota Perez&apos;s refinement, and why the framework still sparks debate today.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Kondratiev proposed roughly 50&ndash;60 year swings in prices, interest rates, and wages driven by clusters of innovation and capital deepening, not by year-to-year noise.</li>
            <li>&bull; Each long wave is often tied to a general-purpose technology (steam, rail, electricity, oil and electronics, digital systems) and to distinct financial booms and busts.</li>
            <li>&bull; The &ldquo;four seasons&rdquo; metaphor maps recovery, prosperity, speculative excess, and painful adjustment to Schumpeterian creative destruction.</li>
            <li>&bull; Carlota Perez adds installation versus deployment phases and a turning point where a financial crash redirects capital from speculation toward productive deployment.</li>
            <li>&bull; Long-wave dating is contested: small historical sample, fuzzy boundaries, and hindsight bias make real-time use risky despite intuitive appeal.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Kondratiev Waves?</h2>
            <p className="mb-4 text-base leading-relaxed">
              In 1925 the Soviet economist Nikolai Kondratiev published work arguing that major capitalist economies exhibit long swings in activity lasting roughly half a century. He inferred these patterns from historical series on commodity prices, interest rates, wages, and related aggregates across Britain, France, Germany, and the United States. His claim was structural: deep investment in new technologies and infrastructure creates extended upswings; saturation, misallocation, and financial stress produce prolonged corrections.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Later readers sometimes treat Kondratiev as a prophet of technology cycles; his own writing stayed closer to empirical macro history. He emphasized moving averages, relative prices, and the interaction between the real economy and credit conditions long before national accounts were standardized. That empirical spirit is why his name survives even though modern econometrics remains skeptical of fixed periodicity.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Kondratiev&apos;s empirical ambition made him politically vulnerable in Stalin&apos;s USSR. He was arrested, convicted in a show trial, and executed in 1938. Popular accounts often connect his fate to the implication that capitalism might exhibit self-correcting long rhythms&mdash;an uncomfortable idea for a regime committed to its inevitable collapse. Whatever the exact charge sheet, his life and death remind us that long-wave theory emerged from serious data work under extraordinary political pressure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Five Long Waves</h2>
            <p className="mb-4 text-base leading-relaxed">
              Long-wave chronologies are approximate; different scholars shift start and end dates by several years. The scheme below matches the common pedagogical partition: five waves from the late eighteenth century to the present, each named for its dominant technological and industrial backbone.
            </p>
            <div className="space-y-4">
              {LONG_WAVES.map((wave) => (
                <div key={wave.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{wave.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{wave.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Four Seasons</h2>
            <p className="mb-4 text-base leading-relaxed">
              Long-wave storytelling often divides each cycle into four phases: <strong>spring</strong> (recovery as a new technological system proves itself), <strong>summer</strong> (broad prosperity and rising inflationary pressure as adoption spreads), <strong>autumn</strong> (financialization and speculative excess as returns in the &ldquo;real&rdquo; economy moderate), and <strong>winter</strong> (debt deflation, restructuring, and creative destruction as outdated capital is written off).
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The link to Joseph Schumpeter is conceptual rather than mathematical. Schumpeter emphasized how innovation periodically destroys old industries and business models while creating new ones. A Kondratiev &ldquo;winter&rdquo; is one narrative wrapper for concentrated episodes of that process&mdash;bankruptcies, unemployment, and institutional redesign that clear the ground for the next upswing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Carlota Perez&apos;s Framework</h2>
            <p className="mb-4 text-base leading-relaxed">
              In <em>Technological Revolutions and Financial Capital</em> (2002), Carlota Perez reframed long waves around the co-evolution of production capital and finance. A new technological revolution begins with an <strong>installation</strong> phase: heavy investment, asset bubbles, and speculative finance chasing the new paradigm. A <strong>turning point</strong>&mdash;often a major financial crash&mdash;exposes overextension and forces a social and regulatory reckoning.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The subsequent <strong>deployment</strong> phase redirects financial capital toward spreading the technology across the economy, raising productivity and wages in a more sustainable way. Perez&apos;s language helps explain why the same breakthrough can first inflate markets and only later transform everyday work&mdash;a pattern observers invoke when comparing dot-com busts, housing cycles, and today&apos;s AI investment surge.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              She also stresses that institutions must catch up: regulation, education, and social safety nets shape whether deployment is inclusive or polarizing. That sociotechnical layer complements the pure price-and-investment reading of Kondratiev and helps bridge abstract &ldquo;waves&rdquo; to policy choices about competition, infrastructure, and labor markets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Long Waves Matter Today</h2>
            <p className="mb-4 text-base leading-relaxed">
              If the fifth wave began around the turn of the millennium, we may be living through its mature or transitional phase: digital platforms are entrenched, compute and data infrastructure are global, and artificial intelligence is pitched as a new general-purpose technology comparable to electricity. Parallels with past waves include euphoric capital inflows into frontier sectors, concentration of wealth in winners, and policy debates over monopoly, labor displacement, and industrial strategy.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Long-wave thinking does not predict dates. It offers a vocabulary for connecting technological possibility, financial cycles, and institutional adaptation&mdash;useful for scenario planning even when exact phase labels remain uncertain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Criticisms and Limitations</h2>
            <p className="mb-4 text-base leading-relaxed">
              Statistically, the evidence is fragile. We have only a handful of complete long-wave intervals in modern data; that small sample makes it hard to distinguish genuine periodicity from storytelling fitted after the fact. Critics warn of data mining: flexible dating and indicator choice can make almost any major innovation fit a 50&ndash;60 year grid.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Real-time identification is especially difficult. Business cycles and geopolitical shocks dominate high-frequency outcomes; long-wave labels assigned today may look wrong with twenty years of hindsight. Multipolar trade, climate transition, and demographic aging also mean the next cycle may not rhyme with the British-centric or American-centric templates of the past.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Finally, long-wave narratives can seduce investors into false precision: naming a &ldquo;winter&rdquo; does not replace stress tests, balance-sheet analysis, or macro scenarios. The honest use of the framework is as an organizing metaphor and historical comparator, not as a calendar for timing markets.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles</a> &mdash; Interactive dashboards, timelines, and cycle-related visualizations</li>
              <li><a href="/guides/economic-cycles-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles Explained</a> &mdash; Business cycles, debt cycles, and crisis patterns</li>
              <li><a href="/guides/digital-economy-and-ai" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Economy and AI</a> &mdash; How technology reshapes growth and work</li>
              <li><a href="/guides/technology-innovation-metrics" className="text-blue-600 dark:text-blue-400 hover:underline">Technology and Innovation Metrics</a> &mdash; R&amp;D, patents, and diffusion indicators</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
