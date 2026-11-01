'use client';

// Every price chart for one city, in local currency or converted to US dollars.

import { useMemo } from 'react';
import CityPriceChart from './CityPriceChart';
import { CITY_PROFILES } from '../../data/costOfLiving';
import type { CityId } from '../../data/cities';
import type { CountryData } from '../../services/worldbank';
import { CITY_COUNTRY, rowsToUsd } from '../../utils/inflation/cityUsd';
import { theme } from './ui';

interface CityCostPanelProps {
  city: CityId;
  isDarkMode: boolean;
  currency?: 'local' | 'usd';
  /** World Bank LCU-per-USD rows, required for the USD view. */
  fxRows?: CountryData[];
}

export default function CityCostPanel({ city, isDarkMode, currency = 'local', fxRows }: CityCostPanelProps) {
  const t = theme(isDarkMode);
  const profile = CITY_PROFILES[city];
  const usd = currency === 'usd' && profile.currencyCode !== 'USD' && !!fxRows?.length;
  const sections = useMemo(
    () => (usd ? profile.sections.map((s) => ({ ...s, data: rowsToUsd(s.data, fxRows, CITY_COUNTRY[city]) })) : profile.sections),
    [usd, profile, fxRows, city],
  );

  return (
    <section id={`city-${profile.id}`} aria-labelledby={`city-${profile.id}-heading`}>
      <h3 id={`city-${profile.id}-heading`} className={`text-xl font-bold mb-1 ${t.text}`}>
        <span aria-hidden="true">{profile.flag}</span> {profile.name} prices
      </h3>
      <p className={`text-sm mb-4 ${t.textSec}`}>
        Groceries, housing, utilities, leisure and transport in {profile.name}, 2011 to 2024, in{' '}
        <span className="font-semibold">{usd ? 'US dollars ($)' : `${profile.currencyCode} (${profile.currencySymbol})`}</span>. Market
        averages, not inflation-adjusted.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => (
          <CityPriceChart
            key={section.id}
            section={section}
            cityName={profile.name}
            currencySymbol={usd ? '$' : profile.currencySymbol}
            decimals={usd ? 2 : profile.decimals}
            isDarkMode={isDarkMode}
            currencyNote={usd ? `Converted to US dollars at each year's average ${profile.currencyCode} rate.` : undefined}
          />
        ))}
      </div>
    </section>
  );
}
