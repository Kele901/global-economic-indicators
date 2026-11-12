'use client';

import React from 'react';
import CountryFlag from '../CountryFlag';
import type { NetworkDataset } from '../../services/network/types';
import { countryLabel, shortName } from '../../utils/aiNetwork/network';

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  onSelect: (id: string) => void;
}

export default function ChokepointMap({ isDarkMode, dataset, onSelect }: Props) {
  const { chokepoints, companyById: companiesById, categoryById } = dataset;
  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const track = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const pill = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${
    isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'
  }`;

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${card}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Chokepoints</h3>
      <p className={`text-xs mb-4 ${muted}`}>
        Steps in the supply chain where one or two companies, or one country, hold most of the world&apos;s capacity. A
        disruption at any of them would ripple through every company downstream.
      </p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {chokepoints.map((cp) => {
          const holders = cp.holders.map((id) => companiesById[id]).filter(Boolean);
          const color = holders[0] ? categoryById[holders[0].category].color : '#f59e0b';
          return (
            <section key={cp.id} className={`rounded-lg border p-3 flex flex-col ${isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold ${text}`}>{cp.title}</h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tabular-nums" style={{ color }}>{cp.sharePct}%</span>
                <span className={`text-xs ${muted}`}>{cp.shareLabel}</span>
              </div>
              <div className={`h-1.5 rounded-full mt-1.5 mb-2 ${track}`} role="presentation">
                <div className="h-full rounded-full" style={{ width: `${cp.sharePct}%`, background: color }} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cp.holderCountry && (
                  <span className={pill} title={`Held by ${countryLabel(cp.holderCountry)}`}>
                    <CountryFlag countryKey={cp.holderCountry} className="w-4 h-3 rounded-sm" />
                    {countryLabel(cp.holderCountry)}
                  </span>
                )}
                {holders.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onSelect(h.id)}
                    title={`${h.name}, ${countryLabel(h.hqCountry)}`}
                    className={`${pill} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}
                  >
                    <CountryFlag countryKey={h.hqCountry} className="w-4 h-3 rounded-sm" />
                    {shortName(h)}
                  </button>
                ))}
              </div>
              <p className={`text-xs leading-relaxed flex-1 ${textSec}`}>{cp.dependency}</p>
              <div className={`mt-2 pt-2 border-t text-[11px] ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={muted}>Depends on it: </span>
                {cp.dependents.filter((id) => companiesById[id]).map((id, i) => (
                  <React.Fragment key={id}>
                    {i > 0 && <span className={muted}>, </span>}
                    <button type="button" onClick={() => onSelect(id)} className={`hover:underline ${textSec}`}>
                      {shortName(companiesById[id])}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <p className={`text-[10px] mt-1 ${muted}`}>Source: {cp.source}</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
