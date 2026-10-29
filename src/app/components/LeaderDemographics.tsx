'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_ORDER,
  currentLeaders,
  womenLeaders,
  yearsInPower,
  type RouteToPower,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';

interface Props {
  isDarkMode: boolean;
}

const ROUTE_LABELS: Record<RouteToPower, string> = {
  election: 'Won a popular election',
  'parliamentary-vote': 'Elected by parliament',
  'party-selection': 'Chosen by their party',
  appointment: 'Appointed',
  succession: 'Constitutional succession',
  hereditary: 'Inherited the throne',
  coup: 'Coup or revolution',
};

const AGE_BUCKETS = [
  { label: 'Under 50', min: 0, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70-79', min: 70, max: 79 },
  { label: '80+', min: 80, max: 200 },
];

const TENURE_BUCKETS = [
  { label: 'Under 1 yr', max: 1 },
  { label: '1-3 yrs', max: 3 },
  { label: '3-5 yrs', max: 5 },
  { label: '5-10 yrs', max: 10 },
  { label: '10-20 yrs', max: 20 },
  { label: '20+ yrs', max: Infinity },
];

export default function LeaderDemographics({ isDarkMode }: Props) {
  const stats = useMemo(() => {
    const rows = currentLeaders().filter((r) => r.leader.born);
    const women = womenLeaders();
    const ages = rows.map((r) => r.age!).sort((a, b) => a - b);
    const median = ages.length ? ages[Math.floor(ages.length / 2)] : 0;
    const oldest = [...rows].sort((a, b) => b.age! - a.age!).slice(0, 3);
    const youngest = [...rows].sort((a, b) => a.age! - b.age!).slice(0, 3);
    const byAge = AGE_BUCKETS.map((b) => ({
      ...b,
      rows: rows.filter((r) => r.age! >= b.min && r.age! <= b.max),
    }));
    const routeCounts = new Map<RouteToPower, number>();
    for (const r of currentLeaders()) if (r.leader.route) routeCounts.set(r.leader.route, (routeCounts.get(r.leader.route) ?? 0) + 1);
    const routes = [...routeCounts.entries()].sort((a, b) => b[1] - a[1]);
    const tenures = currentLeaders().map((r) => ({ r, yrs: yearsInPower(r.leader.since) }));
    let lo = 0;
    const byTenure = TENURE_BUCKETS.map((b) => {
      const inB = tenures.filter((t) => t.yrs >= lo && t.yrs < b.max);
      lo = b.max;
      return { label: b.label, rows: inB };
    });
    return { rows, women, median, oldest, youngest, byAge, routes, byTenure };
  }, []);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const card = `rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  const track = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const total = POLITICS_PROFILES.length;
  const maxAge = Math.max(...stats.byAge.map((b) => b.rows.length), 1);
  const maxTenure = Math.max(...stats.byTenure.map((b) => b.rows.length), 1);
  const maxRoute = Math.max(...stats.routes.map(([, n]) => n), 1);

  const leaderLink = (key: keyof typeof COUNTRY_KEY_TO_SLUG, text: string) => (
    <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[key]}`} className="hover:underline">{text}</Link>
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className={card}>
        <div className="text-[11px] uppercase tracking-wider text-gray-500">Women at the top</div>
        <div className={`text-3xl font-bold tabular-nums ${textPrimary}`}>
          {stats.women.effective.length}<span className="text-base font-medium text-gray-500"> of {total}</span>
        </div>
        <p className={`text-xs mb-2 ${textSec}`}>
          effective leaders are women; {stats.women.anyOffice.length} women hold a head-of-state or head-of-government post.
        </p>
        <ul className="text-xs space-y-1">
          {stats.women.anyOffice.map(({ key, leader }) => (
            <li key={`${key}-${leader.name}`} className={textSec}>
              <span className={`font-medium ${textPrimary}`}>{leaderLink(key, leader.name)}</span>, {leader.title}, {COUNTRY_DISPLAY_NAMES[key]}
              {stats.women.effective.some((w) => w.leader.name === leader.name) && <span className="ml-1 text-[10px] text-emerald-500">holds executive power</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className={card}>
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Age of effective leaders</div>
          <div className={`text-xs ${textSec}`}>median <span className={`font-semibold ${textPrimary}`}>{stats.median}</span></div>
        </div>
        <div className="flex items-end gap-2 h-28 mt-3">
          {stats.byAge.map((b) => (
            <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full" title={b.rows.map((r) => `${r.leader.name} (${r.age})`).join(', ')}>
              <span className={`text-[11px] tabular-nums ${textPrimary}`}>{b.rows.length}</span>
              <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(b.rows.length / maxAge) * 80}%` }} />
              <span className={`text-[10px] mt-1 ${textSec}`}>{b.label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Oldest</div>
            {stats.oldest.map((r) => <div key={r.key} className={textSec}>{leaderLink(r.key, r.leader.name)} <span className="tabular-nums">{r.age}</span></div>)}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Youngest</div>
            {stats.youngest.map((r) => <div key={r.key} className={textSec}>{leaderLink(r.key, r.leader.name)} <span className="tabular-nums">{r.age}</span></div>)}
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">How they got there</div>
        <ul className="space-y-1.5">
          {stats.routes.map(([route, n]) => (
            <li key={route} className="text-xs">
              <div className="flex justify-between mb-0.5">
                <span className={textPrimary}>{ROUTE_LABELS[route]}</span>
                <span className={`tabular-nums ${textSec}`}>{n}</span>
              </div>
              <div className={`h-2 rounded-full ${track}`}>
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${(n / maxRoute) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className={`text-[11px] mt-2 ${textSec}`}>How each effective leader first won their current office.</p>
      </div>

      <div className={card}>
        <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Time in office</div>
        <ul className="space-y-1.5">
          {stats.byTenure.map((b) => (
            <li key={b.label} className="text-xs" title={b.rows.map((t) => t.r.leader.name).join(', ')}>
              <div className="flex justify-between mb-0.5">
                <span className={textPrimary}>{b.label}</span>
                <span className={`tabular-nums ${textSec}`}>{b.rows.length}</span>
              </div>
              <div className={`h-2 rounded-full flex overflow-hidden ${track}`} style={{ width: `${Math.max(4, (b.rows.length / maxTenure) * 100)}%` }}>
                {REGIME_ORDER.map((rg) => {
                  const n = b.rows.filter((t) => t.r.regime === rg).length;
                  return n ? <div key={rg} className="h-full" style={{ width: `${(n / b.rows.length) * 100}%`, backgroundColor: REGIME_COLORS[rg] }} /> : null;
                })}
              </div>
            </li>
          ))}
        </ul>
        <p className={`text-[11px] mt-2 ${textSec}`}>Bars are split by regime type: long tenures cluster in autocracies.</p>
      </div>
    </div>
  );
}
