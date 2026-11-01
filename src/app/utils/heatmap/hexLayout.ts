import type { CountryKey } from '../countryMappings';

// Hand-placed [column, row] positions on an odd-row-offset hex grid, laid out
// roughly geographically so neighbours on the map stay neighbours here.
export const HEX_LAYOUT: Record<CountryKey, [number, number]> = {
  Canada: [1, 0], Norway: [9, 0], Sweden: [10, 0], Russia: [13, 0],

  USA: [1, 1], UK: [8, 1], Belgium: [9, 1], Netherlands: [10, 1], Germany: [11, 1],
  Poland: [12, 1], Ukraine: [13, 1], China: [15, 1], SouthKorea: [16, 1], Japan: [17, 1],

  Mexico: [1, 2], Portugal: [7, 2], Spain: [8, 2], France: [9, 2], Switzerland: [10, 2],
  Italy: [11, 2], Greece: [12, 2], Turkey: [13, 2], Iran: [14, 2], Pakistan: [15, 2],
  India: [16, 2], Bangladesh: [17, 2],

  Colombia: [2, 3], Morocco: [8, 3], Egypt: [11, 3], Israel: [12, 3], SaudiArabia: [13, 3],
  Qatar: [14, 3], UAE: [15, 3], Thailand: [17, 3], Vietnam: [18, 3], Philippines: [19, 3],

  Brazil: [3, 4], Ghana: [8, 4], Nigeria: [9, 4], Ethiopia: [12, 4], Kenya: [13, 4],
  Singapore: [17, 4], Indonesia: [18, 4],

  Chile: [2, 5], Argentina: [3, 5], SouthAfrica: [11, 5], Australia: [18, 5],
};

export const HEX_COLUMNS = 20;
export const HEX_ROWS = 6;

// Centre of a pointy-top hexagon of the given radius.
export function hexCenter(col: number, row: number, r: number): [number, number] {
  const w = Math.sqrt(3) * r;
  return [w * (col + (row % 2 ? 0.5 : 0)) + w / 2, r * 1.5 * row + r];
}

export function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}
