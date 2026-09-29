'use client';

// CountryBrief — cross-ledger stitched summary card for a country
// dossier. Pulls credit rating from debtCurated, defense-spending rank
// from military WB series, electricity mix from energyCurated, remittance
// %GDP from migrationCurated, and life-expectancy from healthCurated.
// Also renders a "Print country brief" button that reuses the /learn
// certificate print pattern.

import { useMemo } from 'react';
import { SOVEREIGN_RATINGS_2025 } from '../services/debtCurated';
import { ELECTRICITY_MIX_2023 } from '../services/energyCurated';
import { SPEND_OUTCOME_2023 } from '../services/healthCurated';
import { WAGES_2023 } from '../services/laborCurated';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const KEY_TO_ISO3: Record<string, string> = {
  USA: 'USA', Canada: 'CAN', UK: 'GBR', France: 'FRA', Germany: 'DEU', Italy: 'ITA',
  Japan: 'JPN', Australia: 'AUS', Mexico: 'MEX', SouthKorea: 'KOR', Spain: 'ESP',
  Sweden: 'SWE', Switzerland: 'CHE', Turkey: 'TUR', Nigeria: 'NGA', China: 'CHN',
  Russia: 'RUS', Brazil: 'BRA', Chile: 'CHL', Argentina: 'ARG', India: 'IND',
  Norway: 'NOR', Netherlands: 'NLD', Portugal: 'PRT', Belgium: 'BEL', Indonesia: 'IDN',
  SouthAfrica: 'ZAF', Poland: 'POL', SaudiArabia: 'SAU', Egypt: 'EGY',
};

interface Props {
  countryKey: string;
  displayName: string;
  isDarkMode: boolean;
}

export default function CountryBrief({ countryKey, displayName, isDarkMode }: Props) {
  const iso3 = KEY_TO_ISO3[countryKey];

  const rating = useMemo(() => SOVEREIGN_RATINGS_2025.find(r => r.iso3 === iso3), [iso3]);
  const elecMix = useMemo(() => ELECTRICITY_MIX_2023.find(r => r.code === iso3), [iso3]);
  const healthOutcome = useMemo(() => SPEND_OUTCOME_2023.find(r => r.code === iso3), [iso3]);
  const wageRow = useMemo(() => WAGES_2023.find(r => r.code === iso3), [iso3]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const greenShare = elecMix ? (elecMix.windSolar + elecMix.hydro + elecMix.otherRenew + elecMix.nuclear).toFixed(0) : null;

  const stats: { label: string; value: string; sub: string; link: string }[] = [];
  if (rating) stats.push({
    label: 'Credit rating (S&P)',
    value: rating.sp,
    sub: `${rating.moodys} · ${rating.fitch} · ${rating.outlookSp}`,
    link: '/debt',
  });
  if (elecMix && greenShare) stats.push({
    label: 'Low-carbon electricity',
    value: `${greenShare}%`,
    sub: `Wind+solar+hydro+nuclear (IEA 2023)`,
    link: '/energy-ledger',
  });
  if (healthOutcome) stats.push({
    label: 'Life expectancy',
    value: `${healthOutcome.lifeExpectancy.toFixed(1)} yr`,
    sub: `Health spend: $${healthOutcome.healthSpendPerCapUsd.toLocaleString()}/cap`,
    link: '/health-ledger',
  });
  if (wageRow) stats.push({
    label: 'Median hourly wage',
    value: `$${wageRow.medianHourlyUsdPpp.toFixed(1)}`,
    sub: `${wageRow.realWageGrowth2019to2023Pct > 0 ? '+' : ''}${wageRow.realWageGrowth2019to2023Pct.toFixed(1)}% real 2019-23`,
    link: '/labor-ledger',
  });

  if (stats.length === 0) return null;

  const title = `${displayName} across the ledgers`;

  return (
    <div id={slugify(title)} className={`rounded-xl border p-4 sm:p-6 mb-8 ${cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-4">
        <div>
          <div className={`text-[11px] uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>At a glance</div>
          <h2 className={`text-xl font-bold ${text}`}>{title}</h2>
          <p className={`text-xs mt-1 ${muted}`}>Curated cross-ledger snapshots. Click a card to open its full ledger.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => window.print()}
            className="text-xs font-semibold px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors print:hidden"
          >
            Print country brief
          </button>
          <SocialShareMenu title={title} isDarkMode={isDarkMode} className="print:hidden" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <a
            key={s.label}
            href={s.link}
            className={`block p-3 rounded-lg border transition-colors ${
              isDarkMode ? 'bg-gray-900 border-gray-700 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className={`text-[11px] uppercase tracking-wider ${muted}`}>{s.label}</div>
            <div className={`text-xl font-bold tabular-nums mt-0.5 ${text}`}>{s.value}</div>
            <div className={`text-[11px] mt-0.5 ${muted}`}>{s.sub}</div>
          </a>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          nav, header, footer, button, .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
