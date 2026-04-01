'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function BusinessCycleIndicatorsGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Real-Time Business Cycle Indicators</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How policymakers, investors, and businesses use forward-looking data&mdash;from the yield curve to PMIs&mdash;to gauge where the economy is headed before official recession calls arrive.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Tracking the Business Cycle</h2>
            <p className="mb-4 text-base leading-relaxed">
              Real-time cycle assessment matters because decisions on rates, capital allocation, and hiring
              are made in the present, while official business-cycle dating is retrospective. The National
              Bureau of Economic Research (NBER) declares recessions months after they begin, using a broad
              set of coincident indicators. Leading indicators fill the gap: they do not replace NBER
              dating, but they offer timely signals for policy calibration, portfolio risk, and operational
              planning.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The practical goal is not to predict the exact month of a turning point, but to tilt
              expectations and stress-test plans before stress appears in payrolls and GDP. Markets and
              survey-based data move first; hard activity data confirm later.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Yield Curve</h2>
            <p className="mb-4 text-base leading-relaxed">
              The yield curve plots interest rates on government bonds of different maturities. It shows the
              relationship between short-term and long-term rates. A normal curve slopes upward: investors
              demand extra yield to lock up money for longer. A flat curve suggests similar compensation
              across maturities. An inverted curve means long-term yields sit below short-term yields.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Inversion matters because it embeds a market judgment that the central bank will need to cut
              policy rates later, often in response to slowing growth or recession. The 10-year minus
              2-year Treasury spread has preceded every U.S. recession since 1955 with a lead time often
              cited in the six-to-eighteen-month range, though timing varies. The 2022&ndash;2024 inversion
              was among the deepest since the early 1980s, underscoring how seriously fixed-income
              participants were pricing macro risk. Researchers debate the precise mechanism&mdash;expected
              future short rates, term premia, and bank lending margins all feature in the literature&mdash;but
              for risk management the stable historical association with downturns is often what matters
              most alongside other corroborating data.
            </p>
            <div className="space-y-4">
              {[
                { name: 'Normal (upward)', desc: 'Long rates exceed short rates; typical late-cycle or healthy-growth pricing when markets expect stable or higher future rates.' },
                { name: 'Flat', desc: 'Little spread between maturities; can signal late-cycle uncertainty or transition as growth and inflation expectations converge.' },
                { name: 'Inverted', desc: 'Short rates above long rates; associated with elevated recession risk as markets price future easing and weaker outcomes.' }
              ].map((item) => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Recession Probability Models</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Federal Reserve Bank of New York publishes a recession probability derived from work by
              Estrella and Mishkin: it relates the slope of the yield curve, specifically the spread between
              the 10-year Treasury yield and the 3-month Treasury bill rate, to the likelihood of a
              recession twelve months ahead. When the spread is wide and positive, implied probabilities tend
              to be low; when it inverts, probabilities rise. The model has a strong historical record
              around U.S. downturns but, like all single-factor tools, it can misfire or overstate calm
              when other risks dominate.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The series updates with market data; for the latest reading, use the New York Fed&apos;s
              published probability chart. In essence, the model translates the level and sign of the
              10-year minus 3-month spread into an estimated probability using historical relationships
              between the curve and subsequent recessions. Other institutions and private-sector models
              blend curve slopes, financial conditions, labor-market momentum, and credit variables to
              produce alternative forecasts&mdash;comparing several approaches reduces over-reliance on one
              signal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Credit Spreads</h2>
            <p className="mb-4 text-base leading-relaxed">
              Credit spreads measure the extra yield investors demand on corporate bonds over comparable
              Treasury securities. They compensate for default risk and liquidity. High-yield (&ldquo;junk&rdquo;)
              spreads in particular act as a fear gauge: when risk appetite collapses, spreads widen sharply.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              In severe stress, junk spreads have spiked to extraordinary levels&mdash;for example, very wide
              readings during 2008 and elevated but shorter-lived blowouts in 2020. By the time spreads
              reach crisis territory, recession is often already underway or imminent. Rule-of-thumb
              context: many practitioners watch a rough &ldquo;normal&rdquo; band near three to four percent over
              Treasuries, treat sustained moves above five percent as a warning, and view eight percent or
              more as signaling deep distress (exact levels shift with the cycle and issuer mix).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Leading Economic Indicators</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Conference Board&apos;s Leading Economic Index (LEI) combines components that tend to turn
              before the broader economy. The composite includes average weekly hours in manufacturing,
              initial claims for unemployment insurance, manufacturers&apos; new orders for consumer goods
              and materials, the ISM new orders index, building permits, stock prices, a leading credit
              index, interest-rate spreads (10-year less fed funds), and manufacturers&apos; new orders for
              nondefense capital goods excluding aircraft. Consumer expectations and other series also feed
              the methodology over time as the index is revised.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Because it aggregates timely inputs, the LEI often leads the business cycle by roughly six to
              twelve months in principle&mdash;though the lead can shorten or lengthen around shocks and
              policy regimes. That lag structure reflects how the real economy unfolds: new orders move
              before production, weekly hours adjust before headline employment, and equity prices discount
              future profits ahead of reported earnings. Persistent month-over-month declines in the LEI
              warrant attention alongside market-based indicators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">PMI (Purchasing Managers&apos; Index)</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Institute for Supply Management (ISM) Manufacturing and Services PMIs summarize monthly
              surveys of purchasing managers. The headline index is constructed so that 50 is the dividing
              line: readings above 50 generally indicate expansion in the sector versus the prior month;
              below 50 suggests contraction. PMIs are among the earliest real-time windows on orders,
              production, employment, and supplier delivery times.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Comparing manufacturing versus services PMIs shows sector rotation; comparing U.S. PMIs with
              global counterparts (for example S&amp;P Global or national surveys) helps distinguish a
              domestic soft patch from a synchronized global slowdown. Sudden drops below 50 after a long
              expansion often coincide with the first phase of turning-point debates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitations and False Signals</h2>
            <p className="mb-4 text-base leading-relaxed">
              The 2019 yield curve inversion is a textbook case of a long lead: a recession did not arrive
              on a typical timetable; the COVID-19 shock then dominated 2020 outcomes. That episode
              illustrates the &ldquo;long lead time problem&rdquo;: indicators can flash red well before a downturn,
              tempting dismissal or the belief that &ldquo;this time is different.&rdquo; Structural changes,
              unconventional monetary policy, and global capital flows can alter how curves and spreads
              behave compared with past cycles.
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>No single indicator is sufficient; combine curve-based, credit, survey, and composite leading data.</li>
              <li>Watch persistence and breadth: one-month spikes matter less than sustained deterioration across series.</li>
              <li>External shocks can invalidate slow-moving signals overnight; scenario planning still matters.</li>
            </ul>
          </section>

          <section className={`rounded-lg p-4 sm:p-5 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
            <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>&bull; Real-time indicators bridge the gap between today&apos;s decisions and NBER&apos;s backward-looking recession dates.</li>
              <li>&bull; The yield curve, especially 10Y&ndash;2Y and 10Y&ndash;3M, encodes growth expectations; deep inversions deserve attention but come with variable lags.</li>
              <li>&bull; The New York Fed&apos;s probability model and other forecasts translate curve slopes into quantitative recession odds&mdash;check official releases for current values.</li>
              <li>&bull; Credit spreads and high-yield markets flag stress; very wide spreads usually align with recessions or panics.</li>
              <li>&bull; The Conference Board LEI and ISM PMIs provide timely survey-based leads; use them together with market prices.</li>
              <li>&bull; False signals and long leads happen; a diversified dashboard beats betting on any one metric.</li>
            </ul>
          </section>

          <section className={`mt-2 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore on the platform</h2>
            <p className={`mb-4 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Our <a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles</a> page
              ties together cycle concepts, indicators, and interactive views so you can relate spreads, surveys, and narratives in one place.
            </p>
            <a
              href="/economic-cycles"
              className="inline-block text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Open Economic Cycles &rarr;
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
