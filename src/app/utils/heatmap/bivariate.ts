export function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  const pos = (sortedAsc.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (pos - lo);
}

export function terciles(values: number[]): [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  return [quantile(sorted, 1 / 3), quantile(sorted, 2 / 3)];
}

export function tercileIndex(v: number, cuts: [number, number]): 0 | 1 | 2 {
  return v <= cuts[0] ? 0 : v <= cuts[1] ? 1 : 2;
}

export function bivariateClass(x: number, y: number, xCuts: [number, number], yCuts: [number, number]): [0 | 1 | 2, 0 | 1 | 2] {
  return [tercileIndex(x, xCuts), tercileIndex(y, yCuts)];
}

// Joshua Stevens' 3x3 scheme, indexed [y][x]: x runs low to high in red,
// y runs low to high in blue, and the dark corner means high on both.
const LIGHT = [
  ['#e8e8e8', '#e4acac', '#c85a5a'],
  ['#b0d5df', '#ad9ea5', '#985356'],
  ['#64acbe', '#627f8c', '#574249'],
];

const DARK = [
  ['#4b5563', '#a86a6a', '#c85a5a'],
  ['#5f8b97', '#7f6f78', '#985356'],
  ['#64acbe', '#627f8c', '#3b2d32'],
];

export function bivariateColor(xi: number, yi: number, isDark: boolean): string {
  return (isDark ? DARK : LIGHT)[yi][xi];
}
