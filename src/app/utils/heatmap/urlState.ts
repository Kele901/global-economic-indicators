export interface HeatmapUrlState {
  metric?: string;
  year?: number;
  view?: string;
  mode?: string;
  base?: number;
  compare?: string;
  country?: string;
  group?: string;
  palette?: string;
  story?: string;
  step?: number;
}

const NUMERIC = new Set<keyof HeatmapUrlState>(['year', 'base', 'step']);
const ORDER: (keyof HeatmapUrlState)[] = ['metric', 'year', 'view', 'mode', 'base', 'compare', 'country', 'group', 'palette', 'story', 'step'];
const SAFE = /^[A-Za-z0-9_-]{1,40}$/;

export function parseHeatmapState(search: string): HeatmapUrlState {
  const params = new URLSearchParams(search);
  const out: HeatmapUrlState = {};
  for (const key of ORDER) {
    const raw = params.get(key);
    if (raw === null || raw === '') continue;
    if (NUMERIC.has(key)) {
      const n = Number(raw);
      if (Number.isInteger(n)) (out as Record<string, unknown>)[key] = n;
    } else if (SAFE.test(raw)) {
      (out as Record<string, unknown>)[key] = raw;
    }
  }
  return out;
}

export function serializeHeatmapState(state: HeatmapUrlState): string {
  const params = new URLSearchParams();
  for (const key of ORDER) {
    const v = state[key];
    if (v === undefined || v === null || v === '') continue;
    params.set(key, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}
