import type { CountryKey } from '../countryMappings';
import { entries, smartDefaultYear, valuesForYear, type HeatmapData } from './values';

// Metrics with broad coverage and intuitive meaning, so questions are fair.
export const QUIZ_METRICS = [
  'gdpGrowth', 'inflationRates', 'unemploymentRates', 'gdpPerCapitaPPP', 'lifeExpectancy',
  'co2Emissions', 'internetUsers', 'renewableEnergy', 'urbanPopulation', 'populationGrowth',
  'militaryExpenditure', 'exports', 'forestAreaPct', 'governmentDebt',
];

export interface QuizQuestion {
  metric: string;
  year: number;
  direction: 'highest' | 'lowest';
  options: CountryKey[];
  answer: CountryKey;
  values: Partial<Record<CountryKey, number>>;
}

// mulberry32: tiny, fast and good enough for shuffling quiz options.
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateSeed(date: Date): number {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function sample<T>(arr: T[], k: number, rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, k);
}

export function generateQuestion(data: HeatmapData, rng: () => number, metrics = QUIZ_METRICS): QuizQuestion | null {
  const available = metrics.filter(m => data[m]?.length);
  for (let attempt = 0; attempt < 12 && available.length; attempt++) {
    const metric = pick(available, rng);
    const year = smartDefaultYear(data, metric);
    if (year === null) continue;
    const values = valuesForYear(data, metric, year);
    const rows = entries(values);
    const size = rng() < 0.4 ? 2 : 4;
    if (rows.length < size) continue;
    const chosen = sample(rows, size, rng);
    if (new Set(chosen.map(r => r[1])).size < chosen.length) continue;
    const direction = rng() < 0.5 ? 'highest' : 'lowest';
    const best = [...chosen].sort((a, b) => (direction === 'highest' ? b[1] - a[1] : a[1] - b[1]))[0];
    return {
      metric,
      year,
      direction,
      options: chosen.map(r => r[0]),
      answer: best[0],
      values: Object.fromEntries(chosen) as Partial<Record<CountryKey, number>>,
    };
  }
  return null;
}

export function generateQuiz(data: HeatmapData, seed: number, count = 5): QuizQuestion[] {
  const rng = seededRandom(seed);
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < count * 4 && out.length < count; i++) {
    const q = generateQuestion(data, rng);
    if (!q) break;
    const key = `${q.metric}:${[...q.options].sort().join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}
