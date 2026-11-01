import type { CountryKey } from '../countryMappings';
import type { ValueMode } from './values';
import type { HeatmapView } from './views';

export interface StoryStep {
  title: string;
  caption: string;
  metric: string;
  year: number;
  view: HeatmapView;
  mode?: ValueMode;
  baseYear?: number;
  compare?: string;
  center?: [number, number];
  zoom?: number;
  highlight?: CountryKey[];
}

export interface Story {
  id: string;
  title: string;
  blurb: string;
  steps: StoryStep[];
}

const WORLD: Pick<StoryStep, 'center' | 'zoom'> = { center: [0, 20], zoom: 1 };
const EUROPE: Pick<StoryStep, 'center' | 'zoom'> = { center: [12, 48], zoom: 3 };

// Captions are deliberately qualitative: exact figures come from the live
// data in the insights strip, so the text cannot drift out of date.
export const STORIES: Story[] = [
  {
    id: 'crisis-2008',
    title: 'The 2008 crisis',
    blurb: 'From boom to the Great Recession and back, in five frames.',
    steps: [
      {
        title: 'Before the fall',
        caption: 'In 2007 almost every tracked economy was growing, many of them quickly. Credit was cheap and housing markets in the US, UK and Spain were booming.',
        metric: 'gdpGrowth', year: 2007, view: 'choropleth', ...WORLD,
      },
      {
        title: 'The Great Recession',
        caption: 'After Lehman Brothers collapsed in September 2008, output shrank across most advanced economies in 2009. China and India kept growing, cushioned by huge stimulus.',
        metric: 'gdpGrowth', year: 2009, view: 'choropleth', ...WORLD,
        highlight: ['USA', 'UK', 'Germany', 'Japan', 'Italy', 'Mexico', 'Russia', 'China', 'India'],
      },
      {
        title: 'Jobs disappear',
        caption: 'Unemployment rose almost everywhere between 2007 and 2010. Spain, where a construction bubble burst, saw one of the sharpest increases.',
        metric: 'unemploymentRates', year: 2010, view: 'ranked', mode: 'change', baseYear: 2007,
        highlight: ['Spain', 'USA', 'Greece'],
      },
      {
        title: 'Governments absorb the shock',
        caption: 'Bank rescues, stimulus and falling tax revenue pushed public debt ratios up steeply. This is the change in debt as a share of GDP from 2007 to 2012.',
        metric: 'governmentDebt', year: 2012, view: 'ranked', mode: 'change', baseYear: 2007,
        highlight: ['Greece', 'Spain', 'UK', 'USA', 'Japan', 'Portugal'],
      },
      {
        title: 'The rebound',
        caption: 'Growth returned to most economies in 2010, led by emerging Asia. In the euro area the recovery would soon stall again as the sovereign debt crisis took hold.',
        metric: 'gdpGrowth', year: 2010, view: 'choropleth', ...WORLD,
        highlight: ['China', 'India', 'Turkey', 'Argentina'],
      },
    ],
  },
  {
    id: 'inflation-2021',
    title: 'The 2021-23 inflation shock',
    blurb: 'How prices broke loose after the pandemic, and how central banks fought back.',
    steps: [
      {
        title: 'The calm before',
        caption: 'Before the pandemic, inflation in most advanced economies sat near or below the 2% target that central banks aim for. Japan was still fighting deflation.',
        metric: 'inflationRates', year: 2019, view: 'choropleth', ...WORLD,
        highlight: ['USA', 'Germany', 'Japan', 'UK', 'France'],
      },
      {
        title: 'Reopening meets broken supply chains',
        caption: 'In 2021 demand came roaring back while factories, ports and shipping were still snarled. Prices started climbing, first in the Americas.',
        metric: 'inflationRates', year: 2021, view: 'choropleth', ...WORLD,
        highlight: ['USA', 'Brazil', 'Mexico', 'Chile'],
      },
      {
        title: 'The energy shock',
        caption: "Russia's invasion of Ukraine in February 2022 sent energy and food prices soaring. Europe, heavily dependent on Russian gas, saw inflation hit multi-decade highs.",
        metric: 'inflationRates', year: 2022, view: 'choropleth', ...EUROPE,
        highlight: ['UK', 'Germany', 'Netherlands', 'Poland', 'Ukraine', 'Italy'],
      },
      {
        title: 'Central banks strike back',
        caption: 'Policymakers responded with the fastest run of rate rises in a generation. This shows how far interest rates moved between 2021 and 2023.',
        metric: 'interestRates', year: 2023, view: 'ranked', mode: 'change', baseYear: 2021,
        highlight: ['USA', 'UK', 'Brazil'],
      },
      {
        title: 'Cooling, with outliers',
        caption: 'By 2024 inflation was easing in most economies. A few, including Turkey, Argentina and Egypt, were still dealing with very high inflation for reasons closer to home.',
        metric: 'inflationRates', year: 2024, view: 'ranked',
        highlight: ['Turkey', 'Argentina', 'Egypt'],
      },
    ],
  },
  {
    id: 'china-rise',
    title: "China's 40-year rise",
    blurb: 'The fastest sustained climb in incomes the modern world has seen.',
    steps: [
      {
        title: 'Starting point',
        caption: "In 1990 China's income per person was a small fraction of the advanced economies'. Market reforms had begun a decade earlier.",
        metric: 'gdpPerCapitaPPP', year: 1990, view: 'choropleth', ...WORLD,
        highlight: ['China'],
      },
      {
        title: 'Double-digit decades',
        caption: 'Growth ran close to or above 10% a year for most of three decades, peaking just before the global financial crisis.',
        metric: 'gdpGrowth', year: 2007, view: 'ranked',
        highlight: ['China'],
      },
      {
        title: "The world's factory",
        caption: 'Manufacturing makes up a far bigger slice of the economy in China than in most rich countries, where services dominate.',
        metric: 'manufacturingValueAdded', year: 2015, view: 'ranked',
        highlight: ['China', 'Germany', 'USA', 'SouthKorea'],
      },
      {
        title: 'The emissions cost',
        caption: "Industrial growth powered by coal made China the world's largest emitter of CO2 in total terms, though emissions per person remain below the US.",
        metric: 'co2EmissionsKt', year: 2020, view: 'bubble', ...WORLD,
        highlight: ['China', 'USA', 'India'],
      },
      {
        title: 'Incomes multiplied',
        caption: 'Measured as percentage change since 1990, China shows one of the largest relative gains in income per person of any tracked economy.',
        metric: 'gdpPerCapitaPPP', year: 2023, view: 'ranked', mode: 'pctChange', baseYear: 1990,
        highlight: ['China', 'Vietnam', 'India'],
      },
    ],
  },
  {
    id: 'debt',
    title: 'The debt build-up',
    blurb: 'How government borrowing climbed through two crises.',
    steps: [
      {
        title: 'The turn of the millennium',
        caption: 'In 2000, very high public debt was the exception rather than the rule. Japan was already the standout after its lost decade.',
        metric: 'governmentDebt', year: 2000, view: 'choropleth', ...WORLD,
        highlight: ['Japan', 'Italy', 'Belgium'],
      },
      {
        title: 'The euro crisis',
        caption: 'By 2012 markets were questioning whether several euro members could repay. Greece needed repeated bailouts; Italy, Portugal and Spain came under heavy pressure.',
        metric: 'governmentDebt', year: 2012, view: 'choropleth', ...EUROPE,
        highlight: ['Greece', 'Italy', 'Portugal', 'Spain'],
      },
      {
        title: 'The pandemic',
        caption: 'In 2020 governments borrowed heavily to support incomes and businesses through lockdowns. Debt ratios jumped in a single year almost everywhere.',
        metric: 'governmentDebt', year: 2020, view: 'ranked', mode: 'change', baseYear: 2019,
        highlight: ['UK', 'USA', 'Spain', 'Japan'],
      },
      {
        title: 'Debt and borrowing costs',
        caption: 'Debt matters more when it is expensive to carry. This scatter plots debt against interest rates: countries in the top right face the heaviest burden.',
        metric: 'governmentDebt', year: 2023, view: 'scatter', compare: 'interestRates',
        highlight: ['USA', 'UK', 'Italy', 'Japan', 'Brazil'],
      },
    ],
  },
];

export function getStory(id: string | null | undefined): Story | undefined {
  return id ? STORIES.find(s => s.id === id) : undefined;
}
