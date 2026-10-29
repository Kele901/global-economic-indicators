'use client';

import { memo, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  REGIME_ORDER,
  GOVERNMENT_FORM_LABELS,
  type PoliticalProfile,
  type GovernmentForm,
} from '../services/politicsCurated';
import { COUNTRY_ISO_NUMERIC, COUNTRY_KEY_TO_SLUG, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import {
  FORM_COLORS,
  INDEX_METRIC_LABELS,
  formatMetric,
  metricScore,
  scoreColor,
  type IndexMetric,
} from '../utils/politicsColors';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type MapMode = 'regime' | 'form' | IndexMetric;

const MODE_LABELS: Record<MapMode, string> = {
  regime: 'Regime type',
  form: 'System of government',
  ...INDEX_METRIC_LABELS,
};

interface Props {
  isDarkMode: boolean;
}

function RegimeWorldMap({ isDarkMode }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<MapMode>('regime');
  const [hover, setHover] = useState<{ p: PoliticalProfile; x: number; y: number } | null>(null);

  const byIso = useMemo(() => {
    const m: Record<string, PoliticalProfile> = {};
    for (const p of POLITICS_PROFILES) m[COUNTRY_ISO_NUMERIC[p.key]] = p;
    return m;
  }, []);

  const fillFor = (p: PoliticalProfile | undefined): string => {
    if (!p) return isDarkMode ? '#374151' : '#e5e7eb';
    if (mode === 'regime') return REGIME_COLORS[p.system.regime];
    if (mode === 'form') return FORM_COLORS[p.system.form];
    return scoreColor(metricScore(p, mode));
  };

  const formsPresent = useMemo(
    () => Array.from(new Set(POLITICS_PROFILES.map((p) => p.system.form))) as GovernmentForm[],
    [],
  );

  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
      active
        ? isDarkMode ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
        : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-1.5 mb-3" role="tablist" aria-label="Map layer">
        {(Object.keys(MODE_LABELS) as MapMode[]).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={btn(mode === m)} onClick={() => setMode(m)}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="w-full h-[320px] sm:h-[460px]">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130, center: [10, 30] }} style={{ width: '100%', height: '100%' }}>
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const p = byIso[String(geo.id)];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillFor(p)}
                      stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                      strokeWidth={0.5}
                      onMouseEnter={(e) => p && setHover({ p, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e) => p && setHover({ p, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => p && router.push(`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`)}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', opacity: p ? 0.8 : 1, cursor: p ? 'pointer' : 'default' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {hover && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg text-xs shadow-lg pointer-events-none max-w-xs ${
            isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}
          style={{ left: hover.x + 12, top: hover.y - 60 }}
        >
          <div className="font-semibold text-sm">{COUNTRY_DISPLAY_NAMES[hover.p.key]}</div>
          <div>{REGIME_LABELS[hover.p.system.regime]} · {GOVERNMENT_FORM_LABELS[hover.p.system.form]}</div>
          <div className="opacity-80">
            {hover.p.leadership.headOfGovernment?.name ?? hover.p.leadership.headOfState.name}
            {' '}({(hover.p.leadership.headOfGovernment ?? hover.p.leadership.headOfState).party ?? 'non-party'})
          </div>
          {mode !== 'regime' && mode !== 'form' && (
            <div className="mt-1 font-medium">{MODE_LABELS[mode]}: {formatMetric(hover.p, mode)}</div>
          )}
          <div className="mt-1 opacity-60">Click for full profile</div>
        </div>
      )}

      <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {mode === 'regime' &&
          REGIME_ORDER.map((r) => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: REGIME_COLORS[r] }} />
              {REGIME_LABELS[r]}
            </span>
          ))}
        {mode === 'form' &&
          formsPresent.map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: FORM_COLORS[f] }} />
              {GOVERNMENT_FORM_LABELS[f]}
            </span>
          ))}
        {mode !== 'regime' && mode !== 'form' && (
          <span className="flex items-center gap-2">
            <span>{mode === 'rsf' ? 'Least free' : 'Lower'}</span>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <span key={t} className="w-8 h-3 rounded-sm" style={{ backgroundColor: scoreColor(t) }} />
            ))}
            <span>{mode === 'rsf' ? 'Most free' : 'Higher'}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(RegimeWorldMap);
