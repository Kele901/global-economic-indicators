import { getCategoryForMetric } from '../metricCategories';

export interface MetricExplainer {
  what: string;
  high: string;
  low: string;
  caveat: string;
  link: { href: string; label: string };
}

const CATEGORY: Record<string, MetricExplainer> = {
  core: {
    what: 'Headline measures of how fast an economy is growing, how stable its prices are and how many people have work.',
    high: 'Depends on the measure: high growth and employment are usually good news, high inflation and unemployment are not.',
    low: 'Low readings can signal slack or recession for growth, or price stability for inflation.',
    caveat: 'Single-year readings are noisy. Look at the trend in the country panel before drawing conclusions.',
    link: { href: '/guides/reading-economic-data', label: 'How to read economic data' },
  },
  fiscal: {
    what: 'How much governments tax, spend and borrow, measured against the size of the economy.',
    high: 'High debt or deficits leave less room to respond to the next shock, especially when interest rates rise.',
    low: 'Low debt gives fiscal space, though very low spending can mean under-investment in public services.',
    caveat: 'Countries borrowing in their own currency from domestic savers (Japan, for example) can sustain much higher debt than others.',
    link: { href: '/guides/government-debt-explained', label: 'Government debt explained' },
  },
  trade: {
    what: 'How open an economy is to the rest of the world: trade flows, investment and the external balance.',
    high: 'High trade shares are typical of small, open economies and trading hubs.',
    low: 'Large economies trade less relative to their size because so much of their demand is met at home.',
    caveat: 'Re-exports inflate trade figures for hubs such as Singapore and the Netherlands.',
    link: { href: '/guides/global-trade-explained', label: 'Global trade explained' },
  },
  social: {
    what: 'Living standards beyond GDP: health, education, poverty, inequality and who takes part in the workforce.',
    high: 'High life expectancy and participation generally track richer, healthier societies; a high Gini or poverty rate means wider deprivation.',
    low: 'Low poverty and inequality readings indicate gains are widely shared.',
    caveat: 'Household surveys behind poverty and inequality data are infrequent, so the latest year may be several years old.',
    link: { href: '/guides/development-inequality', label: 'Development and inequality' },
  },
  technology: {
    what: 'Investment in research and the spread of digital technology.',
    high: 'High R&D and patenting signal an innovation-led economy.',
    low: 'Low readings often reflect an economy still catching up, where adopting existing technology matters more than inventing new ones.',
    caveat: 'Patent counts favour large economies; compare R&D as a share of GDP for a fairer view.',
    link: { href: '/guides/technology-innovation-metrics', label: 'Technology and innovation metrics' },
  },
  environment: {
    what: 'How much energy an economy uses, where it comes from and how much carbon it emits per person.',
    high: 'High emissions per person usually mean a fossil-heavy energy mix, a cold climate or energy-intensive industry.',
    low: 'Low readings can reflect clean power, or simply low incomes and energy use.',
    caveat: 'These are territorial figures: emissions from imported goods are counted where they are made, not where they are consumed.',
    link: { href: '/energy-ledger', label: 'Energy Ledger' },
  },
  climate: {
    what: 'Total greenhouse emissions, the power mix and the state of land and air.',
    high: 'High totals are dominated by large economies; high coal or fossil shares mean a harder path to net zero.',
    low: 'Low readings in fossil share or PM2.5 mean cleaner energy and air.',
    caveat: 'Totals scale with population. Switch to per-person emissions for a like-for-like comparison.',
    link: { href: '/climate-ledger', label: 'Climate Ledger' },
  },
  financial: {
    what: 'The depth of a country\u2019s financial system: credit, stock markets and business formation.',
    high: 'Deep markets make it easier for firms to raise money, but very high credit can also signal a borrowing boom.',
    low: 'Shallow financial systems can hold back investment.',
    caveat: 'Market capitalisation swings with share prices, so a single year can mislead.',
    link: { href: '/guides/market-cycle-indicators', label: 'Market cycle indicators' },
  },
  industry: {
    what: 'What an economy produces: the shares of agriculture, manufacturing and services, and output per worker.',
    high: 'A high services share is typical of rich economies; high manufacturing marks industrial exporters.',
    low: 'A shrinking agricultural share is one of the clearest signs of development.',
    caveat: 'Shares can move because other sectors grow, not because a sector itself shrinks.',
    link: { href: '/guides/gdp-and-national-accounts', label: 'GDP and national accounts' },
  },
  defense: {
    what: 'Military spending, personnel and the arms trade.',
    high: 'High shares of GDP usually reflect active conflict or a tense neighbourhood.',
    low: 'Low readings are common among countries sheltered by alliances.',
    caveat: 'Arms trade figures use SIPRI trend-indicator values, which measure volume rather than sale prices.',
    link: { href: '/defense-ledger', label: 'Defense Ledger' },
  },
  resources: {
    what: 'How much an economy earns from oil, gas, minerals and forests, and its energy independence.',
    high: 'High resource rents bring revenue but also exposure to commodity price swings (the "resource curse").',
    low: 'Low rents mean a more diversified economy, or simply few resources.',
    caveat: 'Rents move with world commodity prices, so they can halve or double in a single year.',
    link: { href: '/resources', label: 'Resources Ledger' },
  },
};

const METRIC: Record<string, Partial<MetricExplainer>> = {
  gdpGrowth: {
    what: 'The annual percentage change in real GDP: the total value of goods and services produced, adjusted for inflation.',
    high: 'Fast growth is typical of catching-up economies or a rebound after a slump.',
    low: 'Negative growth for two consecutive quarters is the common rule of thumb for a recession.',
    link: { href: '/guides/gdp-and-national-accounts', label: 'GDP and national accounts' },
  },
  inflationRates: {
    what: 'The annual rise in consumer prices: how much more a typical basket of goods costs than a year earlier.',
    high: 'Inflation well above 2-3% erodes savings and wages and usually prompts central banks to raise rates.',
    low: 'Very low or negative inflation (deflation) can be just as damaging, as people delay spending.',
    link: { href: '/guides/inflation-guide', label: 'Inflation guide' },
  },
  interestRates: {
    what: 'The price of borrowing money, shaped by central bank policy and inflation expectations.',
    high: 'High rates cool borrowing and inflation, and often signal past inflation problems.',
    low: 'Low rates support borrowing and growth but can inflate asset prices.',
    link: { href: '/guides/understanding-interest-rates', label: 'Understanding interest rates' },
  },
  unemploymentRates: {
    what: 'The share of the labour force that is looking for work but does not have a job.',
    high: 'High unemployment means wasted potential and usually weak demand.',
    low: 'Very low unemployment can push up wages and inflation.',
    caveat: 'It excludes people who have given up looking. Check labour force participation alongside it.',
    link: { href: '/guides/understanding-employment-data', label: 'Understanding employment data' },
  },
  youthUnemployment: { link: { href: '/guides/understanding-employment-data', label: 'Understanding employment data' } },
  gdpPerCapitaPPP: {
    what: 'Output per person, adjusted for differences in local prices (purchasing power parity). The best single gauge of average living standards.',
    high: 'High readings mark rich economies, though small resource exporters can rank high too.',
    low: 'Low readings mark developing economies with the most room to catch up.',
    caveat: 'An average says nothing about how income is shared. Compare with the Gini coefficient.',
  },
  governmentDebt: {
    what: 'What the government owes, as a percentage of a year of national output.',
    caveat: 'The World Bank series covers central government only, so it can differ from the general government figures often quoted in the news.',
  },
  budgetBalance: {
    what: 'Government revenue minus spending, as a share of GDP. Negative values are deficits.',
    high: 'Surpluses are rare and usually come from resource revenues or deliberate consolidation.',
    low: 'Large deficits add to debt, though they are a normal response to recessions.',
  },
  currentAccount: {
    what: 'The balance of trade in goods and services plus income flows with the rest of the world.',
    high: 'Surpluses mean a country saves more than it invests at home and lends the difference abroad.',
    low: 'Deficits mean it relies on foreign financing, which can reverse suddenly.',
  },
  lifeExpectancy: {
    what: 'How long a newborn would be expected to live if current death rates held throughout their life.',
    high: 'High readings reflect good healthcare, nutrition and safety.',
    low: 'Low readings are driven largely by child mortality and infectious disease.',
  },
  giniCoefficient: {
    what: 'Income inequality on a 0-100 scale, where 0 means everyone has the same income.',
    high: 'Above 40 is generally considered high inequality.',
    low: 'Nordic countries typically sit in the mid-20s.',
  },
  co2Emissions: {
    what: 'Carbon dioxide emitted per person each year, in tonnes.',
    caveat: 'Small oil and gas producers top this ranking because of energy-intensive extraction and small populations.',
  },
  renewableEnergy: {
    what: 'The share of final energy consumption that comes from renewable sources, including hydro and traditional biomass.',
    caveat: 'Poorer countries can score high because they still burn wood and charcoal, which counts as renewable.',
  },
  militaryExpenditure: {
    what: 'Military spending as a percentage of GDP.',
    high: 'NATO members commit to at least 2%; countries in active conflict spend far more.',
    link: { href: '/defense-ledger', label: 'Defense Ledger' },
  },
  internetUsers: {
    what: 'The share of the population that used the internet in the past three months.',
    low: 'Low readings mark the digital divide, usually tied to income, infrastructure and rural populations.',
  },
};

const FALLBACK: MetricExplainer = CATEGORY.core;

export function getExplainer(metric: string): MetricExplainer {
  const category = getCategoryForMetric(metric)?.id;
  const base = (category && CATEGORY[category]) || FALLBACK;
  return { ...base, ...METRIC[metric] };
}
