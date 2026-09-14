// City identity for the /inflation cost-of-living panels.
//
// Deliberately separate from costOfLiving.ts: the page needs the ids and
// labels to render its tab bar, but the price tables next door are ~900
// lines of static data that only the lazily loaded panels should pull in.

export type CityId = 'london' | 'paris' | 'tokyo' | 'newYork';

export const CITY_ORDER: CityId[] = ['london', 'paris', 'tokyo', 'newYork'];

export const CITY_LABELS: Record<CityId, { name: string; flag: string }> = {
  london: { name: 'London', flag: '🇬🇧' },
  paris: { name: 'Paris', flag: '🇫🇷' },
  tokyo: { name: 'Tokyo', flag: '🇯🇵' },
  newYork: { name: 'New York', flag: '🇺🇸' },
};
