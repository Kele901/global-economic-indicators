'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Breadcrumbs from '../components/Breadcrumbs';

interface EmbedRecipe {
  id: string;
  title: string;
  description: string;
  metric: string;
  countries: string[];
  period: string;
  theme: 'light' | 'dark';
  width: number;
  height: number;
}

const RECIPES: EmbedRecipe[] = [
  {
    id: 'g7-gdp-growth',
    title: 'G7 GDP growth',
    description: 'Ten-year line chart of real GDP growth across the G7. Solid all-rounder for economics blogs.',
    metric: 'gdpGrowth',
    countries: ['USA', 'UK', 'JAPAN', 'GERMANY', 'FRANCE', 'ITALY', 'CANADA'],
    period: '10',
    theme: 'light',
    width: 640,
    height: 400,
  },
  {
    id: 'inflation-emerging',
    title: 'EM inflation',
    description: 'Inflation trajectories for the largest emerging economies. Useful for macro newsrooms.',
    metric: 'inflation',
    countries: ['BRAZIL', 'INDIA', 'CHINA', 'MEXICO', 'TURKEY', 'INDONESIA'],
    period: '15',
    theme: 'light',
    width: 640,
    height: 400,
  },
  {
    id: 'unemployment-eu',
    title: 'EU unemployment',
    description: 'Unemployment rate across the four biggest euro-area economies. Ideal for policy briefs.',
    metric: 'unemployment',
    countries: ['GERMANY', 'FRANCE', 'ITALY', 'SPAIN'],
    period: '20',
    theme: 'light',
    width: 640,
    height: 400,
  },
  {
    id: 'interest-superpowers',
    title: 'Superpower policy rates',
    description: 'Fed, ECB and PBOC benchmark rates side-by-side. Ships in dark mode by default.',
    metric: 'interestRates',
    countries: ['USA', 'EU', 'CHINA'],
    period: '10',
    theme: 'dark',
    width: 640,
    height: 420,
  },
  {
    id: 'debt-heavy-hitters',
    title: 'Debt heavy-hitters',
    description: 'Government-debt-to-GDP for Japan, Italy, USA, France and Spain. High-contrast dark theme.',
    metric: 'governmentDebt',
    countries: ['JAPAN', 'ITALY', 'USA', 'FRANCE', 'SPAIN'],
    period: '20',
    theme: 'dark',
    width: 640,
    height: 420,
  },
  {
    id: 'currency-basket',
    title: 'Reserve currencies',
    description: 'FX index for the four largest global reserve currencies. Great for FX and treasury dashboards.',
    metric: 'currencyStrength',
    countries: ['USA', 'EU', 'JAPAN', 'CHINA'],
    period: '5',
    theme: 'light',
    width: 640,
    height: 400,
  },
];

export default function EmbedGalleryPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [origin, setOrigin] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const cards = useMemo(() => RECIPES.map(r => {
    const params = new URLSearchParams({
      metric: r.metric,
      countries: r.countries.join(','),
      period: r.period,
      theme: r.theme,
    });
    const url = `${origin}/embed/chart?${params.toString()}`;
    const iframe = `<iframe src="${url}" width="${r.width}" height="${r.height}" frameborder="0" style="border-radius: 8px; border: 1px solid ${r.theme === 'dark' ? '#374151' : '#e5e7eb'};"></iframe>`;
    return { ...r, url, iframe };
  }), [origin]);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1600);
    });
  };

  const bg = isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900';
  const card = isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200';
  const code = isDarkMode ? 'bg-gray-950 border-gray-800 text-emerald-300' : 'bg-gray-50 border-gray-200 text-emerald-700';

  return (
    <div className={`min-h-screen transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Embed gallery</h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Six ready-to-paste chart embeds. Each ships as an iframe that inherits your host page&apos;s width where possible. All embeds are ad-free, cache-friendly (ISR 1h), and update automatically as underlying data refreshes.
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Want something custom? Head to the <a className="text-blue-500 hover:underline" href="/embed-builder">Embed Builder</a>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(c => (
            <article key={c.id} className={`rounded-xl border overflow-hidden ${card}`}>
              <div className={`aspect-[16/10] w-full ${c.theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
                {origin && (
                  <iframe
                    src={c.url}
                    title={c.title}
                    className="w-full h-full"
                    loading="lazy"
                    style={{ border: 0 }}
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{c.title}</h2>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{c.description}</p>
                <pre className={`text-[11px] p-2 rounded border overflow-auto whitespace-pre-wrap break-words max-h-24 ${code}`}>
{c.iframe}
                </pre>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => copy(c.id, c.iframe)}
                    className={`text-xs px-2.5 py-1 rounded border ${isDarkMode ? 'border-gray-700 text-gray-200 hover:border-gray-500' : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
                  >
                    {copiedId === c.id ? 'Copied!' : 'Copy iframe'}
                  </button>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Open preview →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
