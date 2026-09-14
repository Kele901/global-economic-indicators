'use client';

// Every price chart for one city. Dynamically imported by /inflation so the
// recharts work for four cities is not in the first load of a page most
// readers open for the headline inflation series alone.

import CityPriceChart from './CityPriceChart';
import { CITY_PROFILES } from '../../data/costOfLiving';
import type { CityId } from '../../data/cities';

interface CityCostPanelProps {
  city: CityId;
  isDarkMode: boolean;
  /** Set on the Cost of Living tab, where the city name is already a heading. */
  compact?: boolean;
}

export default function CityCostPanel({ city, isDarkMode, compact = false }: CityCostPanelProps) {
  const profile = CITY_PROFILES[city];

  return (
    <section
      id={`city-${profile.id}`}
      aria-labelledby={`city-${profile.id}-heading`}
      className={
        compact
          ? `rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`
          : `rounded-xl shadow-lg p-6 mt-10 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`
      }
    >
      <h2 id={`city-${profile.id}-heading`} className="text-2xl font-bold mb-2">
        <span aria-hidden="true">{profile.flag}</span> {profile.name} Prices
      </h2>
      <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
        Price trends for groceries, housing, utilities, leisure and transport in {profile.name},
        2011 to 2024. All values are in{' '}
        <span className="font-semibold">
          {profile.currencyCode} ({profile.currencySymbol})
        </span>{' '}
        and are market averages, not inflation-adjusted.
      </p>

      {profile.sections.map(section => (
        <CityPriceChart
          key={section.id}
          section={section}
          cityName={profile.name}
          currencySymbol={profile.currencySymbol}
          decimals={profile.decimals}
          isDarkMode={isDarkMode}
        />
      ))}
    </section>
  );
}
