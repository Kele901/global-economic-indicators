import { NextResponse } from 'next/server';

const PASSPORT_INDEX_CSV_URL =
  'https://cdn.jsdelivr.net/gh/ilyankou/passport-index-dataset@master/passport-index-tidy-iso2.csv';

const MIRROR_URL =
  'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso2.csv';

export type RawVisaType =
  | 'visa-free'
  | 'visa-on-arrival'
  | 'e-visa'
  | 'eta'
  | 'visa-required'
  | 'no-admission'
  | 'same-country';

export interface PassportIndexCell {
  type: RawVisaType;
  days: number | null;
}

export interface PassportIndexResponse {
  passports: Record<string, Record<string, PassportIndexCell>>;
  updatedAt: string;
  sourceUrl: string;
  passportCount: number;
  destinationCount: number;
}

function normalizeRequirement(raw: string): PassportIndexCell {
  const value = raw.trim();
  if (value === '-1') {
    return { type: 'same-country', days: null };
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return { type: 'visa-free', days: numeric };
  }
  const v = value.toLowerCase();
  if (v.includes('visa free') || v === 'vf' || v === 'visafree') {
    return { type: 'visa-free', days: null };
  }
  if (v.includes('visa on arrival') || v === 'voa') {
    return { type: 'visa-on-arrival', days: null };
  }
  if (v.includes('e-visa') || v.includes('evisa') || v === 'ev') {
    return { type: 'e-visa', days: null };
  }
  if (v.includes('eta')) {
    return { type: 'eta', days: null };
  }
  if (v.includes('no admission')) {
    return { type: 'no-admission', days: null };
  }
  return { type: 'visa-required', days: null };
}

function parseCsv(text: string): { passports: Record<string, Record<string, PassportIndexCell>>; passportSet: Set<string>; destinationSet: Set<string> } {
  const passports: Record<string, Record<string, PassportIndexCell>> = {};
  const passportSet = new Set<string>();
  const destinationSet = new Set<string>();

  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 3) continue;

    const passport = parts[0].trim();
    const destination = parts[1].trim();
    const requirement = parts.slice(2).join(',').trim();
    if (!passport || !destination) continue;

    const cell = normalizeRequirement(requirement);
    if (!passports[passport]) passports[passport] = {};
    passports[passport][destination] = cell;
    passportSet.add(passport);
    destinationSet.add(destination);
  }

  return { passports, passportSet, destinationSet };
}

export async function GET() {
  try {
    let csvText = '';
    let sourceUsed = PASSPORT_INDEX_CSV_URL;

    try {
      const response = await fetch(PASSPORT_INDEX_CSV_URL, {
        next: { revalidate: 60 * 60 * 24 },
        headers: { Accept: 'text/csv,*/*' },
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      csvText = await response.text();
    } catch (primaryError) {
      console.warn('[Passport Index] Primary CDN failed, trying mirror:', primaryError);
      const mirror = await fetch(MIRROR_URL, {
        next: { revalidate: 60 * 60 * 24 },
        headers: { Accept: 'text/csv,*/*' },
      });
      if (!mirror.ok) throw new Error(`Mirror status ${mirror.status}`);
      csvText = await mirror.text();
      sourceUsed = MIRROR_URL;
    }

    if (!csvText || csvText.length < 100) {
      throw new Error('Empty passport index CSV');
    }

    const { passports, passportSet, destinationSet } = parseCsv(csvText);

    const payload: PassportIndexResponse = {
      passports,
      updatedAt: new Date().toISOString(),
      sourceUrl: sourceUsed,
      passportCount: passportSet.size,
      destinationCount: destinationSet.size,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    console.error('[Passport Index API] Failed:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch Passport Index dataset', details: error?.message || String(error) },
      { status: 502 }
    );
  }
}
