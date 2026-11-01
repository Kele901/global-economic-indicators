import { CITY_PROFILES, type PriceRow } from '../../data/costOfLiving';
import type { CityId } from '../../data/cities';

// A price series addressed by section and key, since some keys (water, beer)
// appear in more than one section.
export interface CityItem {
  id: string;
  section: string;
  key: string;
  label: string;
}

export const FIRST_CITY_YEAR = 2011;
export const LAST_CITY_YEAR = 2024;

export function sectionRows(city: CityId, section: string): PriceRow[] {
  return CITY_PROFILES[city].sections.find((s) => s.id === section)?.data ?? [];
}

export function itemPrice(city: CityId, item: Pick<CityItem, 'section' | 'key'>, year: number): number | null {
  const v = sectionRows(city, item.section).find((r) => r.year === year)?.[item.key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export function salary(city: CityId, year: number): number | null {
  return itemPrice(city, { section: 'salary', key: 'salary' }, year);
}

export function hasItem(city: CityId, item: Pick<CityItem, 'section' | 'key'>): boolean {
  return sectionRows(city, item.section).some((r) => typeof r[item.key] === 'number');
}

// Everyday items for the hours-of-work comparison.
export const WORK_ITEMS: CityItem[] = [
  { id: 'rent', section: 'rent', key: 'apt1city', label: 'Monthly rent, 1-bed centre' },
  { id: 'utilities', section: 'utilities', key: 'basic', label: 'Monthly utilities' },
  { id: 'cappuccino', section: 'beverages', key: 'cappuccino', label: 'Cappuccino' },
  { id: 'milk', section: 'essential-goods', key: 'milk', label: 'Milk, 1 litre' },
  { id: 'cinema', section: 'sports-leisure', key: 'cinema', label: 'Cinema ticket' },
  { id: 'ticket', section: 'transportation', key: 'ticket', label: 'One-way transit ticket' },
  { id: 'jeans', section: 'clothing-shoes', key: 'jeans', label: 'Pair of jeans' },
];

// A fixed weekly-shop-style basket, one of each, for the basket time machine and city vs city.
export const BASKET: CityItem[] = [
  { id: 'milk', section: 'essential-goods', key: 'milk', label: 'Milk (1L)' },
  { id: 'bread', section: 'essential-goods', key: 'bread', label: 'Bread (500g)' },
  { id: 'eggs', section: 'essential-goods', key: 'eggs', label: 'Eggs (12)' },
  { id: 'apples', section: 'produce', key: 'apples', label: 'Apples (1kg)' },
  { id: 'potato', section: 'produce', key: 'potato', label: 'Potatoes (1kg)' },
  { id: 'chicken', section: 'protein', key: 'chicken', label: 'Chicken fillets (1kg)' },
  { id: 'cheese', section: 'protein', key: 'cheese', label: 'Local cheese (1kg)' },
  { id: 'wine', section: 'protein', key: 'wine', label: 'Bottle of wine' },
  { id: 'ticket', section: 'transportation', key: 'ticket', label: 'Transit ticket' },
  { id: 'cinema', section: 'sports-leisure', key: 'cinema', label: 'Cinema ticket' },
];

// Spending categories for the personal inflation calculator.
export const CATEGORIES: { id: string; label: string; items: Pick<CityItem, 'section' | 'key'>[]; defaultWeight: number }[] = [
  { id: 'housing', label: 'Housing', defaultWeight: 35, items: [{ section: 'rent', key: 'apt1city' }, { section: 'rent', key: 'apt1out' }] },
  {
    id: 'food',
    label: 'Food & drink',
    defaultWeight: 20,
    items: [
      ...['milk', 'bread', 'eggs', 'water'].map((key) => ({ section: 'essential-goods', key })),
      ...['apples', 'oranges', 'potato', 'lettuce', 'tomato', 'banana', 'onion', 'rice'].map((key) => ({ section: 'produce', key })),
      ...['cheese', 'chicken', 'beef'].map((key) => ({ section: 'protein', key })),
    ],
  },
  { id: 'utilities', label: 'Utilities & internet', defaultWeight: 10, items: [{ section: 'utilities', key: 'basic' }, { section: 'utilities', key: 'internet' }] },
  { id: 'transport', label: 'Transport', defaultWeight: 12, items: [{ section: 'transportation', key: 'ticket' }, { section: 'transportation', key: 'gasoline' }] },
  {
    id: 'leisure',
    label: 'Leisure',
    defaultWeight: 13,
    items: [
      { section: 'sports-leisure', key: 'fitness' },
      { section: 'sports-leisure', key: 'cinema' },
      { section: 'protein', key: 'wine' },
    ],
  },
  { id: 'clothing', label: 'Clothing', defaultWeight: 10, items: ['jeans', 'dress', 'nike', 'leather'].map((key) => ({ section: 'clothing-shoes', key })) },
];
