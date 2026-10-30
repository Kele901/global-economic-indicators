'use client';

import { useMemo } from 'react';
import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';

export function useQuintileShares() {
  const { data, loading } = useDevSeries([
    'incomeShareLow20', 'incomeShareSecond20', 'incomeShareThird20', 'incomeShareFourth20', 'incomeShareHigh20', 'incomeShareTop10',
  ]);
  const rows = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const q1 = latestObs(data.incomeShareLow20, k);
        const q2 = latestObs(data.incomeShareSecond20, k);
        const q3 = latestObs(data.incomeShareThird20, k);
        const q4 = latestObs(data.incomeShareFourth20, k);
        const q5 = latestObs(data.incomeShareHigh20, k);
        const top10 = latestObs(data.incomeShareTop10, k);
        if (!q1 || !q2 || !q3 || !q4 || !q5) return null;
        const palma = top10 ? top10.value / (q1.value + q2.value) : null;
        return { key: k, year: q1.year, Q1: q1.value, Q2: q2.value, Q3: q3.value, Q4: q4.value, Q5: q5.value, palma, ratio: q5.value / q1.value };
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [data]
  );
  return { rows, loading };
}
