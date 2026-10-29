'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  REGIME_ORDER,
  governmentCompass,
  seatWeightedCompass,
  type PoliticalProfile,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../utils/countryMappings';

interface Props {
  isDarkMode: boolean;
  /** When set, plots this country's parties instead of one dot per government. */
  profile?: PoliticalProfile;
  height?: number;
  /** Extra "you are here" marker, e.g. from the political match quiz. */
  userPoint?: { econ: number; social: number; label?: string };
  /** Point ids (country keys, or party abbreviations in profile mode) to emphasise; others fade. */
  highlight?: string[];
}

interface Point {
  id: string;
  label: string;
  econ: number;
  social: number;
  size: number;
  color: string;
  detail: string;
  slug?: string;
}

export default function GovernmentCompassChart({ isDarkMode, profile, height = 460, userPoint, highlight }: Props) {
  const router = useRouter();
  const [basis, setBasis] = useState<'government' | 'legislature'>('government');

  const points: Point[] = useMemo(() => {
    if (profile) {
      return profile.parties
        .filter((x) => x.seats > 0)
        .map((x) => ({
          id: x.abbr,
          label: x.abbr,
          econ: x.econ,
          social: x.social,
          size: x.seats,
          color: x.color,
          detail: `${x.name} · ${x.seats} seats · ${x.role} · ${x.ideology.join(', ')}`,
        }));
    }
    return POLITICS_PROFILES.map((p) => {
      const c = basis === 'government' ? governmentCompass(p) : seatWeightedCompass(p);
      return {
        id: p.key,
        label: COUNTRY_DISPLAY_NAMES[p.key],
        econ: Math.round(c.econ * 100) / 100,
        social: Math.round(c.social * 100) / 100,
        size: p.populationM,
        color: REGIME_COLORS[p.system.regime],
        detail: `${REGIME_LABELS[p.system.regime]} · ${p.leadership.rulingCoalition}`,
        slug: COUNTRY_KEY_TO_SLUG[p.key],
      };
    });
  }, [profile, basis]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const quadrant = (txt: string, pos: string) => (
    <div className={`absolute text-[10px] uppercase tracking-wider pointer-events-none ${pos} ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>{txt}</div>
  );

  return (
    <div>
      {!profile && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {(['government', 'legislature'] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBasis(b)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                basis === b
                  ? isDarkMode ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
                  : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {b === 'government' ? 'Governing parties' : 'Whole legislature'}
            </button>
          ))}
          <span className={`text-[11px] ml-1 ${textSec}`}>Seat-weighted. Bubble size = population.</span>
        </div>
      )}

      <div className="relative" style={{ height }}>
        {quadrant('Authoritarian left', 'top-3 left-14')}
        {quadrant('Authoritarian right', 'top-3 right-4')}
        {quadrant('Libertarian left', 'bottom-12 left-14')}
        {quadrant('Libertarian right', 'bottom-12 right-4')}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="econ"
              domain={[-5, 5]}
              ticks={[-5, -2.5, 0, 2.5, 5]}
              stroke={axis}
              tick={{ fontSize: 11 }}
              label={{ value: '← State-led economy · Market economy →', position: 'insideBottom', offset: -16, fill: axis, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="social"
              domain={[-5, 5]}
              ticks={[-5, -2.5, 0, 2.5, 5]}
              stroke={axis}
              tick={{ fontSize: 11 }}
              width={40}
              label={{ value: 'Liberal ↔ Authoritarian', angle: -90, position: 'insideLeft', offset: 12, fill: axis, fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="size" range={profile ? [60, 900] : [40, 700]} />
            <ReferenceLine x={0} stroke={axis} strokeOpacity={0.5} />
            <ReferenceLine y={0} stroke={axis} strokeOpacity={0.5} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0].payload as Point;
                return (
                  <div className={`px-3 py-2 rounded-lg text-xs shadow-lg max-w-xs ${isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
                    <div className="font-semibold text-sm">{pt.label}</div>
                    <div className="opacity-80">{pt.detail}</div>
                    <div className="mt-1 tabular-nums">Economic {pt.econ.toFixed(1)} · Social {pt.social.toFixed(1)}</div>
                  </div>
                );
              }}
            />
            <Scatter
              data={points}
              onClick={(d: unknown) => {
                const slug = (d as { payload?: Point })?.payload?.slug ?? (d as Point)?.slug;
                if (slug) router.push(`/politics-ledger/${slug}`);
              }}
              cursor={profile ? 'default' : 'pointer'}
            >
              {points.map((pt) => {
                const faded = highlight?.length ? !highlight.includes(pt.id) : false;
                return <Cell key={pt.id} fill={pt.color} fillOpacity={faded ? 0.18 : 0.75} stroke={isDarkMode ? '#111827' : '#ffffff'} />;
              })}
              {profile && <LabelList dataKey="label" position="top" style={{ fontSize: 10, fill: axis }} />}
            </Scatter>
            {userPoint && (
              <Scatter
                data={[{ id: 'you', label: userPoint.label ?? 'You', econ: userPoint.econ, social: userPoint.social, size: 400, color: '#111827', detail: 'Your position from the quiz' }]}
                shape="star"
                fill={isDarkMode ? '#facc15' : '#111827'}
              >
                <LabelList dataKey="label" position="top" style={{ fontSize: 11, fontWeight: 700, fill: isDarkMode ? '#facc15' : '#111827' }} />
              </Scatter>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {!profile && (
        <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-xs ${textSec}`}>
          {REGIME_ORDER.map((r) => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[r] }} />
              {REGIME_LABELS[r]}
            </span>
          ))}
        </div>
      )}
      <p className={`text-[11px] mt-2 ${textSec}`}>
        Party placements are editorial estimates on a -5 to +5 scale, informed by expert surveys such as CHES and V-Party; they show relative positions, not precise measurements.
      </p>
    </div>
  );
}
