'use client';

import React, { useState } from 'react';
import CountryFlag from '../CountryFlag';
import { COMMODITIES, KIND_COLOR, type NetworkDataset, type TechCategory, type TechCompany } from '../../services/network/types';
import {
  RELATION_GROUP_LABELS,
  countryLabel,
  formatUsdBn,
  groupRelations,
  type Relation,
  type RelationGroup,
} from '../../utils/aiNetwork/network';

const GROUP_ORDER: RelationGroup[] = ['buysFrom', 'suppliesTo', 'computeFrom', 'computeFor', 'backedBy', 'investedIn', 'partners'];
const COLLAPSED = 6;
const COMMODITY_LABEL = Object.fromEntries(COMMODITIES.map((c) => [c.id, c.label]));

interface Props {
  isDarkMode: boolean;
  dataset: NetworkDataset;
  company: TechCompany;
  hubId: string;
  onSelect: (id: string) => void;
  onRecentre: (id: string) => void;
  onClose?: () => void;
}

function RelationList({
  isDarkMode, label, color, relations, companiesById, categoryById, onSelect,
}: {
  isDarkMode: boolean;
  label: string;
  color: string;
  relations: Relation[];
  companiesById: Record<string, TechCompany>;
  categoryById: Record<string, TechCategory>;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? relations : relations.slice(0, COLLAPSED);
  return (
    <div>
      <h5 className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="w-3 h-0.5 rounded" style={{ background: color }} />
        {label} <span className="font-normal">({relations.length})</span>
      </h5>
      <ul className="space-y-1.5">
        {shown.map((r) => {
          const other = companiesById[r.id];
          if (!other) return null;
          return (
            <li key={`${r.id}-${r.kind}-${r.direction}`} className="text-sm leading-snug">
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                className={`inline-flex items-center gap-1.5 font-semibold hover:underline ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: categoryById[other.category].color }} />
                {other.name}
              </button>
              {r.commodity && (
                <span className={`ml-1.5 px-1.5 py-px rounded text-[10px] font-medium align-middle ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {COMMODITY_LABEL[r.commodity]}
                </span>
              )}
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}> · {r.note}</span>
            </li>
          );
        })}
      </ul>
      {relations.length > COLLAPSED && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`mt-1.5 text-xs font-medium ${isDarkMode ? 'text-violet-300' : 'text-violet-700'}`}
        >
          {open ? 'Show fewer' : `Show all ${relations.length}`}
        </button>
      )}
    </div>
  );
}

export default function CompanyProfile({
  isDarkMode, dataset, company, hubId, onSelect, onRecentre, onClose,
}: Props) {
  const { links, companyById: companiesById, categoryById } = dataset;
  const cat = categoryById[company.category];
  const brief = company.tier === 'brief';
  const groups = groupRelations(links, company.id);
  const totalLinks = Object.values(groups).reduce((s, g) => s + g.length, 0);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const tile = isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-50 border-gray-200';
  const heading = `text-xs uppercase tracking-wider font-semibold mb-2 ${muted}`;

  const facts: { label: string; value: string; note?: string }[] = [
    { label: 'Founded', value: String(company.founded) },
    { label: 'Leader', value: company.leader ?? 'n/a' },
    { label: 'Revenue', value: formatUsdBn(company.revenueUsdBn), note: company.revenueBasis },
    { label: company.listed ? 'Market value' : 'Valuation', value: formatUsdBn(company.valueUsdBn), note: company.valueBasis },
    { label: 'Employees', value: company.employees ? company.employees.toLocaleString('en-US') : 'n/a' },
    { label: 'Listing', value: company.listed ? company.ticker ?? 'Listed' : 'Private' },
  ];

  return (
    <article className={`rounded-xl border p-4 sm:p-6 ${card}`} aria-label={`${company.name} profile`}>
      <header className="flex flex-wrap items-start gap-3 mb-4">
        <CountryFlag countryKey={company.hqCountry} className="w-8 h-5 mt-1.5 rounded-sm shadow-sm" title={countryLabel(company.hqCountry)} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>{company.name}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: cat.color, background: `${cat.color}22`, border: `1px solid ${cat.color}55` }}
            >
              {cat.label}
            </span>
            {brief && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                title="A shorter profile: one-paragraph summary, key figures and sources"
              >
                Brief profile
              </span>
            )}
          </div>
          <p className={`text-sm mt-0.5 ${muted}`}>
            {company.hqCity}, {countryLabel(company.hqCountry)} · {totalLinks} link{totalLinks === 1 ? '' : 's'} in this network
          </p>
        </div>
        <div className="flex items-center gap-2">
          {company.id !== hubId && (
            <button
              type="button"
              onClick={() => onRecentre(company.id)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
            >
              Centre on this company
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className={`px-2 py-1 rounded-md text-sm ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <p className={`text-base font-medium mb-4 ${textPrimary}`}>{company.oneLiner}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
        {facts.map((f) => (
          <div key={f.label} className={`rounded-lg border p-2.5 ${tile}`}>
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>{f.label}</div>
            <div className={`text-sm font-semibold tabular-nums mt-0.5 ${textPrimary}`}>{f.value}</div>
            {f.note && <div className={`text-[10px] leading-tight mt-0.5 ${muted}`}>{f.note}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <section>
            <h4 className={heading}>What it does</h4>
            <div className={`space-y-2 text-sm leading-relaxed ${textSec}`}>
              {company.summary.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>

          <section className={`rounded-lg border-l-4 p-3 ${isDarkMode ? 'bg-violet-950/30' : 'bg-violet-50'}`} style={{ borderColor: cat.color }}>
            <h4 className={heading}>{dataset.roleLabel}</h4>
            <p className={`text-sm leading-relaxed ${textSec}`}>{company.role}</p>
          </section>

          {company.contributions.length > 0 && (
            <section>
              <h4 className={heading}>Major contributions</h4>
              <ul className={`space-y-1.5 text-sm leading-relaxed ${textSec}`}>
                {company.contributions.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {company.keyProducts.length > 0 && (
            <section>
              <h4 className={heading}>Key products</h4>
              <div className="flex flex-wrap gap-1.5">
                {company.keyProducts.map((p) => (
                  <span key={p} className={`px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>{p}</span>
                ))}
              </div>
            </section>
          )}

          {company.chokepoint && (
            <section className={`rounded-lg border p-3 ${isDarkMode ? 'border-amber-700/60 bg-amber-950/30' : 'border-amber-300 bg-amber-50'}`}>
              <h4 className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                Chokepoint
              </h4>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>{company.chokepoint}</p>
            </section>
          )}

          <section>
            <h4 className={heading}>Sources</h4>
            <ul className="space-y-1 text-xs">
              {company.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 ${isDarkMode ? 'text-sky-300' : 'text-sky-700'}`}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-2">
          <h4 className={heading}>Connections</h4>
          <div className="space-y-4">
            {GROUP_ORDER.filter((g) => groups[g].length > 0).map((g) => (
              <RelationList
                key={`${company.id}-${g}`}
                isDarkMode={isDarkMode}
                label={RELATION_GROUP_LABELS[g]}
                color={KIND_COLOR[groups[g][0].kind]}
                relations={groups[g]}
                companiesById={companiesById}
                categoryById={categoryById}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
