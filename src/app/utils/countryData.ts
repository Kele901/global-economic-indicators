// Shared safe accessors for the CountryData[] shape used across the app.
//
// A CountryData row looks like `{ year: number, [countryName: string]: number }`
// (see the `CountryData` interface in ../services/worldbank.ts). Almost every
// dashboard component needs to read "the latest value for country X" or
// "aggregate the latest year's numbers across all tracked countries", and
// most of them had reinvented these helpers inline — usually with an unsafe
// `arr[arr.length - 1][country]` pattern that crashes on an empty upstream
// array. This module centralises the safe versions so no consumer has to
// reason about missing rows, empty arrays, or absent country keys.

import type { CountryData } from '../services/worldbank';

// Return the most recent (year, value) pair for a country. Iterates from the
// tail so it tolerates arrays whose latest row has no entry for the country
// (common with intermittently-reported indicators). Returns null when no
// non-zero value exists anywhere in the series.
export function latestEntry(
  series: CountryData[] | undefined,
  country: string,
): { year: number; value: number } | null {
  if (!Array.isArray(series) || series.length === 0) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const row = series[i];
    if (!row) continue;
    const v = Number(row[country]);
    if (!Number.isNaN(v) && v > 0) return { year: Number(row.year), value: v };
  }
  return null;
}

// Convenience wrapper that returns just the numeric value (or a fallback).
// This is the direct replacement for `Number(arr[arr.length - 1][country]) || 0`
// — same intent, safe against every empty / partial upstream case.
export function latest(
  series: CountryData[] | undefined,
  country: string,
  fallback: number = 0,
): number {
  const entry = latestEntry(series, country);
  return entry ? entry.value : fallback;
}

export interface WorldSumResult {
  total: number;
  count: number;
  year: number;
}

// Aggregate the most recent non-null value across every country present in
// the series. `maxPlausible` filters out values above a physical/logical
// ceiling — the defense-ledger page uses `30` for % of GDP to catch
// units-mismatch outliers like a stray dollar amount rendered as a percent.
export function worldSum(
  series: CountryData[] | undefined,
  opts: { maxPlausible?: number } = {},
): WorldSumResult {
  if (!Array.isArray(series) || series.length === 0) return { total: 0, count: 0, year: 0 };
  const cap = opts.maxPlausible ?? Infinity;
  const countries = new Set<string>();
  series.forEach(row => {
    Object.keys(row).forEach(k => { if (k !== 'year') countries.add(k); });
  });
  let total = 0;
  let count = 0;
  let maxYear = 0;
  countries.forEach(c => {
    const e = latestEntry(series, c);
    if (e && e.value <= cap) {
      total += e.value;
      count += 1;
      if (e.year > maxYear) maxYear = e.year;
    }
  });
  return { total, count, year: maxYear };
}

export interface TopEntry {
  country: string;
  value: number;
  year: number;
}

// Rank the top-N countries by their most recent value. Same `maxPlausible`
// guard as worldSum so downstream KPIs never surface a units-mismatch outlier.
export function topNCountries(
  series: CountryData[] | undefined,
  n: number,
  opts: { maxPlausible?: number } = {},
): TopEntry[] {
  if (!Array.isArray(series) || series.length === 0) return [];
  const cap = opts.maxPlausible ?? Infinity;
  const countries = new Set<string>();
  series.forEach(row => {
    Object.keys(row).forEach(k => { if (k !== 'year') countries.add(k); });
  });
  const items: TopEntry[] = [];
  countries.forEach(c => {
    const e = latestEntry(series, c);
    if (e && e.value <= cap) items.push({ country: c, value: e.value, year: e.year });
  });
  return items.sort((a, b) => b.value - a.value).slice(0, n);
}

// Combined share of the top-N countries in the latest-year total.
export function topNShare(
  series: CountryData[] | undefined,
  n: number,
): number {
  if (!Array.isArray(series) || series.length === 0) return 0;
  const countries = new Set<string>();
  series.forEach(row => {
    Object.keys(row).forEach(k => { if (k !== 'year') countries.add(k); });
  });
  const vals: number[] = [];
  countries.forEach(c => {
    const e = latestEntry(series, c);
    if (e) vals.push(e.value);
  });
  const total = vals.reduce((s, v) => s + v, 0);
  if (total <= 0) return 0;
  const topSum = vals.sort((a, b) => b - a).slice(0, n).reduce((s, v) => s + v, 0);
  return (topSum / total) * 100;
}

// Year-over-year % change of the world total. Returns null when either the
// latest or prior year lacks any positive rows (avoids divide-by-zero and
// spurious 100% jumps from a single-row series).
export function worldYoY(series: CountryData[] | undefined): number | null {
  if (!Array.isArray(series) || series.length < 2) return null;
  const yearList = series.map(r => Number(r.year));
  const maxYear = Math.max(...yearList);
  let totalLatest = 0;
  let totalPrior = 0;
  let latestYear = 0;
  for (let y = maxYear; y >= maxYear - 5; y--) {
    const row = series.find(r => Number(r.year) === y);
    if (!row) continue;
    const rowTotal = Object.keys(row)
      .filter(k => k !== 'year')
      .reduce((s, k) => {
        const v = Number(row[k]);
        return !Number.isNaN(v) && v > 0 ? s + v : s;
      }, 0);
    if (rowTotal > 0) {
      if (!totalLatest) { totalLatest = rowTotal; latestYear = y; }
      else if (y < latestYear) { totalPrior = rowTotal; break; }
    }
  }
  if (!totalLatest || !totalPrior) return null;
  return ((totalLatest - totalPrior) / totalPrior) * 100;
}
