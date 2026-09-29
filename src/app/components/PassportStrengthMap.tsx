'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import {
  PassportProfile,
  getMobilityTier,
  getAdvisoryTier,
} from '../services/passport';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export type MapMetric = 'mobility' | 'avgStay' | 'visaFree' | 'eVisa' | 'advisory';

interface PassportStrengthMapProps {
  isDarkMode: boolean;
  passportData: Record<string, PassportProfile>; // keyed by ISO2
}

const METRIC_LABELS: Record<MapMetric, { label: string; description: string }> = {
  mobility: {
    label: 'Mobility Score',
    description: 'Visa-free + visa-on-arrival + ETA destinations',
  },
  avgStay: {
    label: 'Avg Length of Stay',
    description: 'Average permitted stay in days across accessible destinations',
  },
  visaFree: {
    label: 'Visa-Free Count',
    description: 'Number of destinations with full visa-free access',
  },
  eVisa: {
    label: 'eVisa Count',
    description: 'Number of destinations requiring an eVisa application',
  },
  advisory: {
    label: 'Avg Travel Advisory',
    description: 'Average advisory score of accessible destinations (0 safest, 5 highest risk)',
  },
};

// ISO 3166-1 numeric (used by world-atlas geo.id) → ISO 3166-1 alpha-2 (used by Passport Index).
const NUMERIC_TO_ISO2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '016': 'AS', '020': 'AD', '024': 'AO',
  '028': 'AG', '031': 'AZ', '032': 'AR', '036': 'AU', '040': 'AT', '044': 'BS',
  '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB', '056': 'BE', '060': 'BM',
  '064': 'BT', '068': 'BO', '070': 'BA', '072': 'BW', '076': 'BR', '084': 'BZ',
  '090': 'SB', '092': 'VG', '096': 'BN', '100': 'BG', '104': 'MM', '108': 'BI',
  '112': 'BY', '116': 'KH', '120': 'CM', '124': 'CA', '132': 'CV', '136': 'KY',
  '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN', '158': 'TW',
  '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD', '188': 'CR', '191': 'HR',
  '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM',
  '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER',
  '233': 'EE', '242': 'FJ', '246': 'FI', '250': 'FR', '254': 'GF', '258': 'PF',
  '260': 'TF', '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM', '275': 'PS',
  '276': 'DE', '288': 'GH', '292': 'GI', '296': 'KI', '300': 'GR', '304': 'GL',
  '308': 'GD', '312': 'GP', '316': 'GU', '320': 'GT', '324': 'GN', '328': 'GY',
  '332': 'HT', '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT',
  '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE',
  '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB',
  '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT',
  '442': 'LU', '446': 'MO', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV',
  '466': 'ML', '470': 'MT', '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC',
  '496': 'MN', '498': 'MD', '499': 'ME', '504': 'MA', '508': 'MZ', '512': 'OM',
  '516': 'NA', '520': 'NR', '524': 'NP', '528': 'NL', '540': 'NC', '548': 'VU',
  '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG', '578': 'NO', '580': 'MP',
  '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK', '591': 'PA', '598': 'PG',
  '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT', '624': 'GW',
  '626': 'TL', '630': 'PR', '634': 'QA', '638': 'RE', '642': 'RO', '643': 'RU',
  '646': 'RW', '654': 'SH', '659': 'KN', '660': 'AI', '662': 'LC', '666': 'PM',
  '670': 'VC', '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS',
  '690': 'SC', '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI',
  '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD',
  '732': 'EH', '736': 'SD', '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK', '776': 'TO',
  '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM', '796': 'TC',
  '798': 'TV', '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB',
  '834': 'TZ', '840': 'US', '850': 'VI', '854': 'BF', '858': 'UY', '860': 'UZ',
  '862': 'VE', '876': 'WF', '882': 'WS', '887': 'YE', '894': 'ZM',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerpHex(a: string, b: string, t: number): string {
  const an = parseInt(a.slice(1), 16);
  const bn = parseInt(b.slice(1), 16);
  const ar = (an >> 16) & 255;
  const ag = (an >> 8) & 255;
  const ab = an & 255;
  const br = (bn >> 16) & 255;
  const bg = (bn >> 8) & 255;
  const bb = bn & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

interface ScaleConfig {
  min: number;
  max: number;
  colorLow: string;
  colorHigh: string;
  invert: boolean;
  format: (v: number) => string;
}

function getScaleConfig(metric: MapMetric, isDarkMode: boolean): ScaleConfig {
  switch (metric) {
    case 'mobility':
      return {
        min: 0, max: 195,
        colorLow: isDarkMode ? '#7F1D1D' : '#FECACA',
        colorHigh: isDarkMode ? '#15803D' : '#166534',
        invert: false,
        format: (v) => `${Math.round(v)}`,
      };
    case 'avgStay':
      return {
        min: 0, max: 90,
        colorLow: isDarkMode ? '#1E40AF' : '#DBEAFE',
        colorHigh: isDarkMode ? '#7C3AED' : '#5B21B6',
        invert: false,
        format: (v) => `${Math.round(v)} days`,
      };
    case 'visaFree':
      return {
        min: 0, max: 150,
        colorLow: isDarkMode ? '#7C2D12' : '#FED7AA',
        colorHigh: isDarkMode ? '#059669' : '#047857',
        invert: false,
        format: (v) => `${Math.round(v)}`,
      };
    case 'eVisa':
      return {
        min: 0, max: 60,
        colorLow: isDarkMode ? '#374151' : '#F3F4F6',
        colorHigh: isDarkMode ? '#D97706' : '#B45309',
        invert: false,
        format: (v) => `${Math.round(v)}`,
      };
    case 'advisory':
      return {
        min: 0, max: 5,
        colorLow: isDarkMode ? '#15803D' : '#166534',
        colorHigh: isDarkMode ? '#B91C1C' : '#7F1D1D',
        invert: true,
        format: (v) => v.toFixed(1),
      };
  }
}

function metricValue(profile: PassportProfile | undefined, metric: MapMetric): number | null {
  if (!profile) return null;
  switch (metric) {
    case 'mobility': return profile.totals.mobility;
    case 'avgStay': return profile.stay.avgDays || null;
    case 'visaFree': return profile.totals.visaFree;
    case 'eVisa': return profile.totals.eVisa;
    case 'advisory': return profile.avgAdvisory;
  }
}

const PassportStrengthMap: React.FC<PassportStrengthMapProps> = memo(({ isDarkMode, passportData }) => {
  const [metric, setMetric] = useState<MapMetric>('mobility');
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 30],
    zoom: 1,
  });

  const scale = useMemo(() => getScaleConfig(metric, isDarkMode), [metric, isDarkMode]);

  const getColor = (value: number | null): string => {
    if (value === null || value === undefined) {
      return isDarkMode ? '#1E293B' : '#E2E8F0';
    }
    const t = clamp((value - scale.min) / (scale.max - scale.min), 0, 1);
    const adjusted = scale.invert ? 1 - t : t;
    return lerpHex(scale.colorLow, scale.colorHigh, adjusted);
  };

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 30], zoom: 1 });
  };

  const handleMoveEnd = (pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  };

  return (
    <div className="relative w-full">
      <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 ${
        isDarkMode ? 'bg-gray-900/50 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
      }`}>
        <div>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {METRIC_LABELS[metric].label}
          </div>
          <div className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {METRIC_LABELS[metric].description}
          </div>
        </div>
        <div className={`flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {(Object.keys(METRIC_LABELS) as MapMetric[]).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                metric === m
                  ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {METRIC_LABELS[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className={`absolute top-14 right-3 z-10 flex flex-col gap-1 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}>
        <button onClick={handleZoomIn} disabled={position.zoom >= 8}
          className={`px-2.5 py-1.5 text-lg font-bold leading-none rounded-t-lg transition-colors disabled:opacity-30 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom in"
        >+</button>
        <button onClick={handleZoomOut} disabled={position.zoom <= 1}
          className={`px-2.5 py-1.5 text-lg font-bold leading-none transition-colors disabled:opacity-30 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Zoom out"
        >&minus;</button>
        <button onClick={handleReset}
          className={`px-2.5 py-1.5 text-xs font-medium leading-none rounded-b-lg border-t transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-gray-100 text-gray-600 border-gray-200'
          }`}
          title="Reset view"
        >Reset</button>
      </div>

      <div className={`absolute bottom-14 left-3 z-10 text-[10px] px-2 py-1 rounded ${
        isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-white/80 text-gray-500'
      }`}>
        Drag to pan &middot; Scroll to zoom
      </div>

      <div className="w-full h-[320px] sm:h-[450px]" style={{ cursor: position.zoom > 1 ? 'grab' : 'default' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 30] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            translateExtent={[[-200, -200], [1200, 600]]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo: any) => {
                  const numericId = String(geo.id).padStart(3, '0');
                  const iso2 = NUMERIC_TO_ISO2[numericId];
                  const profile = iso2 ? passportData[iso2] : undefined;
                  const value = metricValue(profile, metric);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(value)}
                      stroke={isDarkMode ? '#1F2937' : '#FFFFFF'}
                      strokeWidth={0.5}
                      onMouseEnter={(e) => {
                        const name = profile?.name || geo.properties?.name || 'Unknown';
                        if (profile && value !== null) {
                          const lines: string[] = [
                            `${profile.flag} ${name} — Rank #${profile.rank}`,
                            `${METRIC_LABELS[metric].label}: ${scale.format(value)}`,
                          ];
                          if (metric !== 'mobility') {
                            const tier = getMobilityTier(profile.totals.mobility);
                            lines.push(`Mobility: ${profile.totals.mobility} · ${tier.label}`);
                          }
                          if (metric !== 'advisory' && profile.avgAdvisory !== null) {
                            const adv = getAdvisoryTier(profile.avgAdvisory);
                            lines.push(`Avg Advisory: ${profile.avgAdvisory.toFixed(1)} · ${adv.label}`);
                          }
                          setTooltipContent(lines.join(' · '));
                        } else {
                          setTooltipContent(`${name}: No data`);
                        }
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setTooltipContent('')}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', fill: isDarkMode ? '#8B5CF6' : '#7C3AED', cursor: 'pointer' },
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

      {tooltipContent && (
        <div
          className={`fixed z-50 px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none max-w-sm ${
            isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 40 }}
        >
          {tooltipContent}
        </div>
      )}

      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {scale.format(scale.invert ? scale.max : scale.min)}
          </span>
          <div className="w-48 h-3 rounded-sm"
            style={{ background: `linear-gradient(to right, ${scale.colorLow}, ${scale.colorHigh})` }} />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {scale.format(scale.invert ? scale.min : scale.max)}
          </span>
        </div>
        <div className={`text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {scale.invert ? 'Lower is better' : 'Higher is better'} · No data shown in muted grey
        </div>
      </div>
    </div>
  );
});

PassportStrengthMap.displayName = 'PassportStrengthMap';

export default PassportStrengthMap;
