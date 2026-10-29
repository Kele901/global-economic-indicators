import type { HistoryMap } from './helpers';
import { NORTH_AMERICA_HISTORY } from './northAmerica';
import { LATIN_AMERICA_HISTORY } from './latinAmerica';
import { EUROPE_WEST_HISTORY } from './europeWest';
import { EUROPE_NORTH_SOUTH_HISTORY } from './europeNorthSouth';
import { EURASIA_HISTORY } from './eurasia';
import { MIDDLE_EAST_HISTORY } from './middleEast';
import { AFRICA_HISTORY } from './africa';
import { ASIA_EAST_HISTORY } from './asiaEast';
import { ASIA_SOUTH_HISTORY } from './asiaSouth';

export const POLITICS_HISTORY: HistoryMap = {
  ...NORTH_AMERICA_HISTORY,
  ...LATIN_AMERICA_HISTORY,
  ...EUROPE_WEST_HISTORY,
  ...EUROPE_NORTH_SOUTH_HISTORY,
  ...EURASIA_HISTORY,
  ...MIDDLE_EAST_HISTORY,
  ...AFRICA_HISTORY,
  ...ASIA_EAST_HISTORY,
  ...ASIA_SOUTH_HISTORY,
};
