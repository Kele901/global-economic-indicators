'use client';

import { useMemo, useState } from 'react';
import type { PoliticalProfile, Party } from '../services/politicsCurated';
import { contrastSafeColors } from '../utils/politicsColors';

interface Props {
  isDarkMode: boolean;
  profile: PoliticalProfile;
}

const MAX_DOTS = 650;
const INNER = 0.38;

interface Dot {
  x: number;
  y: number;
  party: Party;
}

function layout(parties: Party[], total: number): { dots: Dot[]; r: number; unit: number } {
  const unit = Math.max(1, Math.ceil(total / MAX_DOTS));
  const counts = parties.map((p) => Math.round(p.seats / unit));
  const n = counts.reduce((s, c) => s + c, 0);
  if (!n) return { dots: [], r: 0, unit };

  const rows = Math.max(2, Math.ceil(Math.sqrt(n / 3.2)));
  const radii = Array.from({ length: rows }, (_, i) => INNER + ((1 - INNER) * (i + 0.5)) / rows);
  const sumR = radii.reduce((s, r) => s + r, 0);
  const perRow = radii.map((r) => Math.max(1, Math.round((n * r) / sumR)));
  let diff = n - perRow.reduce((s, c) => s + c, 0);
  for (let i = rows - 1; diff !== 0; i = (i - 1 + rows) % rows) {
    perRow[i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }

  const slots: { x: number; y: number; angle: number }[] = [];
  radii.forEach((r, i) => {
    const k = perRow[i];
    for (let j = 0; j < k; j++) {
      const angle = k === 1 ? Math.PI / 2 : Math.PI - (Math.PI * j) / (k - 1);
      slots.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), angle });
    }
  });
  slots.sort((a, b) => b.angle - a.angle);

  const dots: Dot[] = [];
  let idx = 0;
  parties.forEach((p, pi) => {
    for (let c = 0; c < counts[pi] && idx < slots.length; c++, idx++) {
      dots.push({ x: slots[idx].x, y: slots[idx].y, party: p });
    }
  });
  const r = Math.min(((1 - INNER) / rows) * 0.42, (Math.PI * INNER) / Math.max(1, perRow[0]) * 0.45);
  return { dots, r, unit };
}

export default function ParliamentHemicycle({ isDarkMode, profile }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const total = profile.system.legislature.seats;

  const ordered = useMemo(() => {
    const sorted = [...profile.parties].filter((p) => p.seats > 0).sort((a, b) => a.econ - b.econ || a.social - b.social);
    const colors = contrastSafeColors(sorted.map((p) => p.color));
    return sorted.map((p, i) => (colors[i] === p.color ? p : { ...p, color: colors[i] }));
  }, [profile]);
  const { dots, r, unit } = useMemo(() => layout(ordered, total), [ordered, total]);
  const filled = ordered.reduce((s, p) => s + p.seats, 0);
  const majority = Math.floor(total / 2) + 1;
  const govSeats = ordered.filter((p) => p.role === 'governing' || p.role === 'coalition').reduce((s, p) => s + p.seats, 0);
  const supportSeats = ordered.filter((p) => p.role === 'confidence').reduce((s, p) => s + p.seats, 0);

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div>
      <svg viewBox="-1.05 -1.08 2.1 1.16" className="w-full max-w-2xl mx-auto block" role="img" aria-label={`${profile.system.legislature.lowerHouse} seat chart`}>
        <g transform="scale(1,-1)">
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={r}
              fill={d.party.color}
              opacity={active && active !== d.party.abbr ? 0.2 : 1}
              onMouseEnter={() => setActive(d.party.abbr)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </g>
        <text x={0} y={-0.12} textAnchor="middle" fontSize={0.16} fontWeight={700} fill={isDarkMode ? '#fff' : '#111827'}>{total.toLocaleString()}</text>
        <text x={0} y={-0.02} textAnchor="middle" fontSize={0.055} fill={isDarkMode ? '#9ca3af' : '#6b7280'}>seats · majority {majority.toLocaleString()}</text>
      </svg>

      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mt-2 text-center">
        <div>
          <div className={`text-lg font-semibold tabular-nums ${govSeats >= majority ? 'text-emerald-500' : 'text-amber-500'}`}>{govSeats.toLocaleString()}</div>
          <div className={`text-[11px] ${textSec}`}>government</div>
        </div>
        <div>
          <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{supportSeats.toLocaleString()}</div>
          <div className={`text-[11px] ${textSec}`}>support / confidence</div>
        </div>
        <div>
          <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{(filled - govSeats - supportSeats).toLocaleString()}</div>
          <div className={`text-[11px] ${textSec}`}>opposition and others</div>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-4">
        {ordered.map((p) => (
          <li
            key={p.abbr}
            className={`flex items-center gap-1.5 text-xs cursor-default ${active && active !== p.abbr ? 'opacity-40' : ''} ${textSec}`}
            onMouseEnter={() => setActive(p.abbr)}
            onMouseLeave={() => setActive(null)}
            title={`${p.name}: ${p.ideology.join(', ')}`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className={textPrimary}>{p.abbr}</span>
            <span className="tabular-nums">{p.seats.toLocaleString()}</span>
            {(p.role === 'governing' || p.role === 'coalition') && <span className="text-[10px] text-emerald-500">gov</span>}
            {p.role === 'confidence' && <span className="text-[10px] text-sky-500">supp</span>}
          </li>
        ))}
      </ul>
      <p className={`text-[11px] mt-3 text-center ${textSec}`}>
        {profile.system.legislature.lowerHouse}, {profile.system.legislature.seatsAsOf}.
        {filled < total && ` ${total - filled} seats vacant or unassigned.`}
        {unit > 1 && ` Each dot represents ${unit} seats.`} Parties ordered left to right by economic position.
      </p>
    </div>
  );
}
