import type { CountryKey } from '../utils/countryMappings';

// Annotated inflation episodes for the /inflation history chapter, plus
// hyperinflation case studies. Episode years and countries are editorial;
// case-study series are annual-average CPI inflation compiled from IMF WEO and
// national statistics, rounded, and flagged `curated` wherever they are shown.

export interface InflationEpisode {
  id: string;
  label: string;
  from: number;
  to: number;
  countries: CountryKey[];
  summary: string;
}

export const INFLATION_EPISODES: InflationEpisode[] = [
  {
    id: 'oil-shock-1973',
    label: 'First oil shock',
    from: 1973,
    to: 1976,
    countries: ['USA', 'UK', 'Japan', 'Italy', 'France', 'Germany'],
    summary: 'The OPEC embargo quadrupled oil prices. Japan hit 23% in 1974 and the UK 24% in 1975; Germany, with a hawkish Bundesbank, peaked near 7%.',
  },
  {
    id: 'volcker-1979',
    label: 'Second oil shock and Volcker',
    from: 1979,
    to: 1983,
    countries: ['USA', 'UK', 'Italy', 'Canada', 'France'],
    summary: 'The Iranian revolution doubled oil prices again. The Fed under Paul Volcker pushed rates near 20%, ending double-digit US inflation at the cost of two recessions.',
  },
  {
    id: 'latam-1980s',
    label: 'Latin American hyperinflations',
    from: 1985,
    to: 1994,
    countries: ['Argentina', 'Brazil', 'Mexico'],
    summary: 'After the debt crisis, money printing to finance deficits drove Argentina above 3,000% in 1989 and Brazil above 2,000% in 1990 and 1993, until currency boards and the Plano Real broke the cycle.',
  },
  {
    id: 'post-soviet-1992',
    label: 'Post-Soviet price liberalisation',
    from: 1992,
    to: 1996,
    countries: ['Russia', 'Ukraine', 'Poland'],
    summary: 'Freeing prices after central planning released years of monetary overhang. Ukraine passed 4,700% in 1993 and Russia 2,500% in 1992.',
  },
  {
    id: 'asian-crisis-1997',
    label: 'Asian financial crisis',
    from: 1997,
    to: 1999,
    countries: ['Indonesia', 'Thailand', 'SouthKorea', 'Philippines'],
    summary: 'Collapsing currencies pushed import prices up fast. Indonesian inflation hit 58% in 1998 as the rupiah lost about 80% of its value.',
  },
  {
    id: 'argentina-2002',
    label: 'Convertibility collapse',
    from: 2001,
    to: 2003,
    countries: ['Argentina', 'Turkey'],
    summary: 'Argentina’s 1:1 dollar peg broke in early 2002 and the peso lost two-thirds of its value. Türkiye’s 2001 banking crisis kept inflation above 50%.',
  },
  {
    id: 'gfc-2008',
    label: 'Commodity spike and crash',
    from: 2007,
    to: 2009,
    countries: ['USA', 'China', 'India', 'Russia', 'Vietnam'],
    summary: 'Oil reached $147 in mid-2008 and food prices doubled, then the financial crisis sent many advanced economies briefly into deflation in 2009.',
  },
  {
    id: 'em-fx-2014',
    label: 'Commodity bust and devaluations',
    from: 2014,
    to: 2017,
    countries: ['Russia', 'Ukraine', 'Egypt', 'Nigeria', 'Brazil'],
    summary: 'Falling oil and conflict crushed several currencies. Ukraine reached 49% in 2015; Egypt’s 2016 float lifted inflation near 30% the following year.',
  },
  {
    id: 'turkey-2018',
    label: 'Lira crisis',
    from: 2018,
    to: 2024,
    countries: ['Turkey'],
    summary: 'Rate cuts in the face of rising prices sent the lira tumbling. Annual inflation peaked at 85% in October 2022 before an orthodox turn in 2023.',
  },
  {
    id: 'post-pandemic-2021',
    label: 'Post-pandemic surge',
    from: 2021,
    to: 2023,
    countries: ['USA', 'UK', 'Germany', 'Italy', 'Poland', 'Brazil'],
    summary: 'Reopening demand, supply bottlenecks and the 2022 energy shock produced the highest inflation in four decades across most advanced economies.',
  },
  {
    id: 'frontier-2022',
    label: 'Frontier-market squeeze',
    from: 2022,
    to: 2024,
    countries: ['Argentina', 'Egypt', 'Ghana', 'Nigeria', 'Pakistan'],
    summary: 'A strong dollar and food and fuel import bills hit economies with thin reserves. Argentina passed 200% in 2024 and Ghana, Egypt, Nigeria and Pakistan all exceeded 25%.',
  },
];

export interface CaseMilestone {
  date: string;
  text: string;
}

export interface HyperinflationCase {
  id: string;
  country: string;
  /** Present when the country is on the live roster, so the card can merge live World Bank data. */
  countryKey?: CountryKey;
  title: string;
  peak: string;
  summary: string;
  series: { year: number; value: number }[];
  seriesNote?: string;
  milestones: CaseMilestone[];
}

export const HYPERINFLATION_CASES: HyperinflationCase[] = [
  {
    id: 'zimbabwe',
    country: 'Zimbabwe',
    title: 'Zimbabwe, 2000-2009',
    peak: 'Est. 79.6 billion % month-on-month (Nov 2008)',
    summary: 'Land seizures cut farm output while the central bank printed money to fund the state. Prices doubled every day at the peak, and the currency was abandoned in 2009.',
    series: [
      { year: 2000, value: 55.9 },
      { year: 2001, value: 76.7 },
      { year: 2002, value: 140.1 },
      { year: 2003, value: 431.7 },
      { year: 2004, value: 282.4 },
      { year: 2005, value: 302.1 },
      { year: 2006, value: 1096.7 },
      { year: 2007, value: 24411.0 },
      { year: 2008, value: 231000000 },
    ],
    seriesNote: '2008 is the July year-on-year reading, the last official figure before publication stopped.',
    milestones: [
      { date: 'Aug 2006', text: 'Three zeros removed from the Zimbabwe dollar.' },
      { date: 'Jul 2008', text: 'Official annual inflation published at 231 million percent, the last official figure.' },
      { date: 'Aug 2008', text: 'Ten more zeros removed.' },
      { date: 'Jan 2009', text: 'Z$100 trillion banknote issued.' },
      { date: 'Apr 2009', text: 'Zimbabwe dollar suspended; US dollar and rand used instead.' },
    ],
  },
  {
    id: 'venezuela',
    country: 'Venezuela',
    title: 'Venezuela, 2014-2023',
    peak: 'About 65,000% annual average (2018)',
    summary: 'Oil revenue collapsed after 2014 and deficits were monetised. Output fell by roughly three-quarters and the bolívar was redenominated twice.',
    series: [
      { year: 2012, value: 21.1 },
      { year: 2013, value: 40.6 },
      { year: 2014, value: 62.2 },
      { year: 2015, value: 121.7 },
      { year: 2016, value: 254.9 },
      { year: 2017, value: 438.1 },
      { year: 2018, value: 65374.1 },
      { year: 2019, value: 19906.0 },
      { year: 2020, value: 2355.1 },
      { year: 2021, value: 1588.5 },
      { year: 2022, value: 186.5 },
      { year: 2023, value: 337.5 },
    ],
    milestones: [
      { date: 'Jan 2008', text: 'Bolívar fuerte introduced, removing three zeros.' },
      { date: 'Aug 2018', text: 'Bolívar soberano introduced, removing five zeros.' },
      { date: 'May 2019', text: 'Central bank publishes inflation data for the first time in three years.' },
      { date: 'Oct 2021', text: 'Bolívar digital introduced, removing six more zeros: 14 in total since 2008.' },
    ],
  },
  {
    id: 'argentina',
    country: 'Argentina',
    countryKey: 'Argentina',
    title: 'Argentina, 1989 and 2023',
    peak: '3,080% annual average (1989)',
    summary: 'Argentina has had two hyperinflationary bouts in one lifetime. A dollar peg ended the first in 1991; the second followed years of deficit monetisation and a 2023 devaluation.',
    series: [
      { year: 1985, value: 672.2 },
      { year: 1986, value: 90.1 },
      { year: 1987, value: 131.3 },
      { year: 1988, value: 343.0 },
      { year: 1989, value: 3079.5 },
      { year: 1990, value: 2314.0 },
      { year: 1991, value: 171.7 },
      { year: 1992, value: 24.9 },
      { year: 1993, value: 10.6 },
      { year: 2002, value: 25.9 },
      { year: 2014, value: 38.0 },
      { year: 2018, value: 34.3 },
      { year: 2019, value: 53.5 },
      { year: 2020, value: 42.0 },
      { year: 2021, value: 48.4 },
      { year: 2022, value: 72.4 },
      { year: 2023, value: 133.5 },
      { year: 2024, value: 219.9 },
    ],
    milestones: [
      { date: 'Jul 1989', text: 'Monthly inflation near 200%.' },
      { date: 'Apr 1991', text: 'Convertibility law pegs the peso 1:1 to the US dollar.' },
      { date: 'Jan 2002', text: 'Peg abandoned; the peso loses two-thirds of its value within months.' },
      { date: 'Dec 2023', text: 'Peso devalued by 54% overnight.' },
      { date: 'Apr 2024', text: 'Annual inflation peaks near 290% before falling sharply.' },
    ],
  },
  {
    id: 'turkey',
    country: 'Türkiye',
    countryKey: 'Turkey',
    title: 'Türkiye, 1990s and 2021-2024',
    peak: '105% (1994) and 85.5% y/y (Oct 2022)',
    summary: 'Chronic high inflation through the 1990s ended with a 2001 reform programme. It returned when rates were cut into rising prices from 2021.',
    series: [
      { year: 1994, value: 105.2 },
      { year: 1995, value: 89.1 },
      { year: 1996, value: 80.4 },
      { year: 1997, value: 85.7 },
      { year: 1998, value: 84.6 },
      { year: 1999, value: 64.9 },
      { year: 2000, value: 54.9 },
      { year: 2001, value: 54.4 },
      { year: 2002, value: 45.0 },
      { year: 2003, value: 21.6 },
      { year: 2004, value: 8.6 },
      { year: 2018, value: 16.3 },
      { year: 2019, value: 15.2 },
      { year: 2020, value: 12.3 },
      { year: 2021, value: 19.6 },
      { year: 2022, value: 72.3 },
      { year: 2023, value: 53.9 },
      { year: 2024, value: 58.5 },
    ],
    milestones: [
      { date: 'Jan 2005', text: 'Six zeros removed; the new Turkish lira replaces the old one.' },
      { date: 'Aug 2018', text: 'Lira loses about 30% against the dollar in a month.' },
      { date: 'Oct 2022', text: 'Annual inflation peaks at 85.5%.' },
      { date: 'Jun 2023', text: 'Policy rate raised from 8.5%, reaching 50% by March 2024.' },
    ],
  },
  {
    id: 'weimar',
    country: 'Germany',
    title: 'Weimar Germany, 1923',
    peak: 'About 29,500% month-on-month (Oct 1923)',
    summary: 'War debts and reparations were paid by printing marks. The classic "price of bread" record of a hyperinflation comes from Berlin.',
    series: [],
    milestones: [
      { date: '1918', text: 'A loaf of bread costs 0.63 marks.' },
      { date: 'Jan 1923', text: 'Bread costs 250 marks.' },
      { date: 'Jul 1923', text: 'Bread costs 3,465 marks.' },
      { date: 'Sep 1923', text: 'Bread costs 1.5 million marks.' },
      { date: 'Nov 1923', text: 'Bread costs 200 billion marks; the Rentenmark replaces the paper mark.' },
    ],
  },
];
