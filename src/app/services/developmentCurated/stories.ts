import type { DevelopmentStory } from './types';

// Narrative case studies drawn only from roster countries so every chart can be
// rendered from live World Bank series. Events are well-documented turning
// points, not claims of sole causation.
export const DEVELOPMENT_STORIES: DevelopmentStory[] = [
  {
    id: 'korea-ghana',
    title: 'Korea and Ghana: same start, different paths',
    countries: ['SouthKorea', 'Ghana'],
    metric: 'gdpPcConst',
    from: 1960,
    summary: 'In 1960 the two had similar incomes per person. Six decades later Korea is roughly ten times richer.',
    paragraphs: [
      'At independence-era starting points both economies were mostly agricultural, with low literacy and little industry. Korea bet on export manufacturing, mass schooling and land reform; Ghana went through import-substitution, coups and a debt crisis before stabilising in the 1980s.',
      'The comparison is popular because it is stark, and it is easy to over-read. Korea also had Cold War aid, a large US security guarantee and a coherent state bureaucracy. Ghana has grown steadily since the 1990s and its democracy is one of the most durable in West Africa.',
    ],
    events: [
      { year: 1962, label: 'Korea: first five-year plan' },
      { year: 1966, label: 'Ghana: Nkrumah overthrown' },
      { year: 1983, label: 'Ghana: Economic Recovery Programme' },
      { year: 1997, label: 'Asian financial crisis' },
      { year: 2010, label: 'Ghana: oil production begins' },
    ],
  },
  {
    id: 'china-poverty',
    title: 'China: the largest fall in poverty ever recorded',
    countries: ['China', 'India'],
    metric: 'poverty300',
    from: 1990,
    summary: 'Extreme poverty in China fell from about two-thirds of the population to near zero in a generation.',
    paragraphs: [
      'Rural decollectivisation in the late 1970s raised farm incomes first; coastal special economic zones then pulled hundreds of millions into factory jobs. Poverty fell fastest when growth was fastest.',
      'India set off later and more slowly, with liberalisation in 1991, but its poverty decline has also been large. Both series rest on household surveys taken years apart, so the lines between survey points are interpolations.',
    ],
    events: [
      { year: 1992, label: "China: Deng's southern tour" },
      { year: 2001, label: 'China joins the WTO' },
      { year: 1991, label: 'India: liberalisation' },
      { year: 2020, label: 'COVID-19' },
    ],
  },
  {
    id: 'vietnam-doi-moi',
    title: 'Vietnam: Doi Moi and the export economy',
    countries: ['Vietnam', 'Philippines'],
    metric: 'gdpPcConst',
    from: 1985,
    summary: 'Market reforms from 1986 turned one of the poorest countries in Asia into a manufacturing hub.',
    paragraphs: [
      'The 1986 Doi Moi reforms let farmers sell their surplus, opened the door to foreign investment and normalised trade. Vietnam overtook the Philippines on income per person around 2020, having started at roughly a third of its level.',
      'Growth has been unusually broad: under-five mortality, electrification and schooling all improved fast. Political liberalisation has not followed; Vietnam remains a one-party state.',
    ],
    events: [
      { year: 1986, label: 'Doi Moi reforms' },
      { year: 1995, label: 'US normalises relations' },
      { year: 2007, label: 'Vietnam joins the WTO' },
    ],
  },
  {
    id: 'bangladesh-pakistan',
    title: 'Bangladesh and Pakistan since 1971',
    countries: ['Bangladesh', 'Pakistan'],
    metric: 'gdpPcConst',
    from: 1971,
    summary: 'Once the poorer half of a single country, Bangladesh now has higher income per person and longer lives than Pakistan.',
    paragraphs: [
      'At separation in 1971 Bangladesh was devastated by war and famine. Garment exports, microfinance, a dense NGO sector and a steep fall in fertility drove steady progress.',
      'Pakistan has had more volatile growth with repeated balance-of-payments crises and IMF programmes. The crossover in income per person around 2020 was widely noted in both countries.',
    ],
    events: [
      { year: 1971, label: 'Bangladesh independence' },
      { year: 1974, label: 'Bangladesh famine' },
      { year: 2005, label: 'End of the Multi-Fibre Arrangement' },
      { year: 2022, label: 'Pakistan floods' },
    ],
  },
  {
    id: 'argentina-decline',
    title: 'Argentina: a rich country that slipped',
    countries: ['Argentina', 'Spain', 'Australia'],
    metric: 'gdpPcConst',
    from: 1960,
    summary: 'Argentina was richer than Spain in 1960. Repeated crises left it well behind.',
    paragraphs: [
      'Argentina in the early twentieth century had incomes comparable to Western Europe. Long cycles of inflation, default and policy reversal followed: hyperinflation in 1989, the 2001 default and currency board collapse, and further crises after 2018.',
      'Australia, with a similar commodity-exporting, settler-economy profile, shows the road not taken.',
    ],
    events: [
      { year: 1976, label: 'Military coup' },
      { year: 1989, label: 'Hyperinflation' },
      { year: 2001, label: 'Default and corralito' },
      { year: 2018, label: 'IMF programme' },
    ],
  },
  {
    id: 'nigeria-oil',
    title: 'Nigeria: oil wealth and the resource curse',
    countries: ['Nigeria', 'Indonesia'],
    metric: 'gdpPcConst',
    from: 1960,
    summary: 'Both are large, populous oil exporters. Indonesia diversified; Nigeria largely did not.',
    paragraphs: [
      'Oil booms in the 1970s lifted both economies. Indonesia used the windfall for rice self-sufficiency, roads and schooling and later shifted into manufacturing; Nigeria saw the naira appreciate, agriculture shrink and public revenue swing with the oil price.',
      'Income per person in Nigeria in the 2020s is only modestly above its early-1980s peak, while Indonesia is several times richer than it was then.',
    ],
    events: [
      { year: 1973, label: 'First oil shock' },
      { year: 1986, label: 'Oil price collapse' },
      { year: 1999, label: 'Nigeria returns to civilian rule' },
      { year: 2016, label: 'Nigeria recession' },
    ],
  },
  {
    id: 'poland-transition',
    title: "Poland: Europe's transition success",
    countries: ['Poland', 'Ukraine', 'Russia'],
    metric: 'gdpPcConst',
    from: 1990,
    summary: 'Three post-communist economies started the 1990s at similar incomes. Poland is now roughly three times richer than Ukraine.',
    paragraphs: [
      'Poland chose rapid stabilisation in 1990, then anchored reforms in EU accession in 2004. It was the only EU economy to avoid recession in 2009.',
      'Ukraine and Russia had deeper output collapses in the 1990s, weaker institutions and, for Ukraine, war since 2014 and full-scale invasion since 2022.',
    ],
    events: [
      { year: 1990, label: 'Poland: Balcerowicz plan' },
      { year: 1998, label: 'Russian default' },
      { year: 2004, label: 'Poland joins the EU' },
      { year: 2014, label: 'Crimea annexed' },
      { year: 2022, label: 'Full-scale invasion of Ukraine' },
    ],
  },
  {
    id: 'ethiopia-health',
    title: 'Ethiopia: child survival before prosperity',
    countries: ['Ethiopia', 'Nigeria'],
    metric: 'under5Mortality',
    from: 1990,
    summary: 'Ethiopia cut child deaths by about three-quarters while still one of the poorest countries in the world.',
    paragraphs: [
      'A community Health Extension Programme from 2003 put tens of thousands of salaried health workers in villages, delivering vaccines, bed nets and basic care.',
      'It shows that health outcomes can run ahead of income. Nigeria, several times richer per person for much of the period, saw a slower decline. Conflict in Tigray from 2020 has reversed some gains.',
    ],
    events: [
      { year: 1991, label: 'End of the Derg' },
      { year: 2003, label: 'Health Extension Programme' },
      { year: 2020, label: 'Tigray war' },
    ],
  },
];
