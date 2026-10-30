// Dated editorial pieces. Newest first; each one draws only on figures already
// published in the ledgers so readers can check every number on the site.

export type InsightBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] };

export interface Insight {
  slug: string;
  title: string;
  /** ISO publication date. */
  date: string;
  /** ISO date of the last substantive revision, if any. */
  updated?: string;
  summary: string;
  topic: string;
  minutes: number;
  body: InsightBlock[];
  related: { href: string; label: string }[];
  sources: string[];
}

export const INSIGHTS: Insight[] = [
  {
    slug: 'october-2026-elections-roundup',
    title: 'Elections roundup: what changed in October 2026, and the votes still to come',
    date: '2026-10-30',
    summary:
      'Brazil re-elected Lula, Israel\u2019s Knesset vote produced no majority and Sweden is still without a confirmed prime minister. Here is what the month changed, and which votes to watch next.',
    topic: 'Politics',
    minutes: 6,
    body: [
      {
        type: 'p',
        text:
          'October was the busiest month of the political year across the 47 countries tracked in the Politics Ledger. Three results stand out: a narrow incumbent win in Brazil, a hung Knesset in Israel and a parliamentary deadlock in Sweden. Together they show how much of the world\u2019s politics now runs through close, fragmented contests rather than landslides.',
      },
      { type: 'h2', text: 'Brazil: a fourth term for Lula, by less than four points' },
      {
        type: 'p',
        text:
          'Luiz In\u00e1cio Lula da Silva won the 25 October runoff with 51.8% against Fl\u00e1vio Bolsonaro\u2019s 48.2%, after trailing in the first round on 4 October. The margin is wider than his razor-thin 2022 win over Jair Bolsonaro, but it still leaves the country split almost down the middle. For markets the question is fiscal: Lula\u2019s government has to keep spending commitments within the fiscal framework while Brazil\u2019s central bank keeps policy rates among the highest in the G20 (see the Monetary Policy dashboard).',
      },
      { type: 'h2', text: 'Israel: no bloc reaches 61' },
      {
        type: 'p',
        text:
          'The 27 October Knesset election left no bloc with the 61 seats needed to govern. Likud finished first with 27 seats, and Arab-led lists took 18 to 19, which makes them pivotal to any arithmetic that excludes the right-wing bloc. Israel has now held six national elections since 2019. Each round of coalition-building delays budgets and leaves defense spending, which reached 8.8% of GDP in 2024 according to SIPRI data in the Defense Ledger, to be set by caretaker governments.',
      },
      { type: 'h2', text: 'Sweden: a caretaker government after a failed vote' },
      {
        type: 'p',
        text:
          'The Social Democrats finished first in the 13 September election with 99 seats, but neither bloc won a majority. On 15 October the Riksdag rejected Magdalena Andersson as prime minister by 248 votes to 99, leaving Ulf Kristersson in office as caretaker. Sweden\u2019s rules allow four failed votes before a fresh election is forced, so the next few weeks matter.',
      },
      { type: 'h2', text: 'The wider pattern' },
      {
        type: 'p',
        text:
          'Across the 47 countries, eleven governments now rule without a majority in the lower house, and eight countries have had a change of leader in the past twelve months. That list includes Morocco, where Fatima Ezzahra El Mansouri became the first woman to lead a government after her party, PAM, won 97 seats on 23 September; Colombia, where Abelardo de la Espriella replaced Gustavo Petro in August; and the United Kingdom, where Andy Burnham became prime minister in July after Keir Starmer resigned.',
      },
      {
        type: 'p',
        text:
          'Not every vote was competitive. Russia\u2019s September Duma election gave United Russia 349 of 450 seats on an official turnout of 59.8%, amid reports of pervasive irregularities and online-voting manipulation. Contests like these are flagged as not free or fair in the ledger\u2019s results charts, so their headline numbers should not be compared directly with those from competitive elections.',
      },
      { type: 'h2', text: 'What to watch next' },
      {
        type: 'ul',
        items: [
          'United States, 3 November 2026: midterm elections for all 435 House seats and 35 Senate seats. Republicans currently hold the House 218 to 214, so a handful of races decide control.',
          'South Africa, 4 November 2026: local government elections, the first big test for the parties in the national unity government.',
          'Spain, 29 November 2026: a snap general election after Pedro S\u00e1nchez dissolved the Cortes on 6 October.',
          'Nigeria, 16 January 2027: presidential and National Assembly elections in Africa\u2019s most populous country.',
          'France, April 2027: the first round of the presidential election, with Emmanuel Macron unable to stand again.',
        ],
      },
      {
        type: 'p',
        text:
          'Each of these countries has a political profile with its current leadership, seat counts and history. The election calendar in the Politics Ledger updates as dates are confirmed.',
      },
    ],
    related: [
      { href: '/politics-ledger', label: 'Politics Ledger' },
      { href: '/politics-ledger/brazil', label: 'Brazil political profile' },
      { href: '/politics-ledger/israel', label: 'Israel political profile' },
      { href: '/politics-ledger/sweden', label: 'Sweden political profile' },
      { href: '/guides/geopolitical-cycles', label: 'Guide: geopolitical cycles and the global economy' },
    ],
    sources: [
      'National election commissions and parliaments, results checked 29 October 2026',
      'SIPRI Military Expenditure Database, 2025 release',
      'V-Dem Institute, Democracy Report 2025',
    ],
  },
  {
    slug: 'human-development-2026',
    title: 'Where the world stands on human development',
    date: '2026-10-30',
    summary:
      'The UNDP\u2019s latest Human Development Report shows huge gains since 1990, persistent gaps between rich and poor countries, and a large hidden cost from inequality. Five things the numbers tell us.',
    topic: 'Development',
    minutes: 7,
    body: [
      {
        type: 'p',
        text:
          'GDP tells you how much an economy produces. It does not tell you whether people live long lives, go to school or can afford a decent standard of living. The UN Development Programme\u2019s Human Development Index (HDI) tries to capture all three, and its 2025 report, covering 2023 data, is now in the Development Ledger for all 47 countries on this site. Here are five things it shows.',
      },
      { type: 'h2', text: '1. The top and the bottom are still far apart' },
      {
        type: 'p',
        text:
          'Switzerland and Norway share second place in the world with an HDI of 0.970. Ethiopia, the lowest-ranked country in our set, scores 0.497 and ranks 180th of 193. Pakistan (0.544, rank 168) and Nigeria (0.560, rank 164) are not far above. Behind those numbers is a gap of roughly 30 years in life expectancy: Nigerians can expect to live 54.5 years on average, compared with 84.7 in Japan.',
      },
      { type: 'h2', text: '2. The fastest progress has come from Asia' },
      {
        type: 'p',
        text:
          'China has gained more HDI than any other country in our set since 1990, rising from 0.491 to 0.797, an increase of 0.306. Bangladesh is close behind at 0.288. Both were in the UNDP\u2019s low human development group in 1990; China is now in the high group and Bangladesh in the medium group. Bangladesh is a useful reminder that income is only part of the story: it now shares rank 130 with India despite slightly lower income per person ($8,498 against $9,047 in 2021 PPP), largely because Bangladeshis live longer, at 74.7 years compared with 72.0.',
      },
      { type: 'h2', text: '3. Inequality hides a lot' },
      {
        type: 'p',
        text:
          'The HDI is an average. The inequality-adjusted version (IHDI) discounts it for how unevenly health, schooling and income are shared. Across our 47 countries the median loss is about 12%, but it ranges from 6.3% in Belgium to 36.5% in Ghana. India loses 30.7% of its HDI to inequality and Brazil 24.4%. In practice that means the typical Brazilian or Indian is a good deal worse off than the national average suggests.',
      },
      { type: 'h2', text: '4. Gender gaps remain wide in some places, and close to zero in others' },
      {
        type: 'p',
        text:
          'The Gender Inequality Index measures gaps in reproductive health, political representation and labour-force participation, where 0 is perfect equality. Norway scores 0.004, the lowest in our set; Nigeria scores 0.677, among the highest in the world. The biggest drivers at the bottom are maternal mortality and adolescent births, both of which also hold back schooling for girls.',
      },
      { type: 'h2', text: '5. Most of the world is still poor by rich-country standards' },
      {
        type: 'p',
        text:
          'Average income across the world was about $20.49 a day per person in 2022, at purchasing-power parity. Because the distribution is skewed, the typical person lives on far less than that. Multidimensional poverty, which counts deprivations in health, education and living standards, still affects 68.7% of Ethiopians (2019 survey) and 16.4% of Indians (2021).',
      },
      {
        type: 'p',
        text:
          'The Development Ledger\u2019s global income calculator lets you see where any income falls in that distribution.',
      },
      { type: 'h2', text: 'Reading the numbers carefully' },
      {
        type: 'ul',
        items: [
          'HDI data has a lag. The 2025 report describes 2023, so it does not yet capture recent shocks.',
          'Income is measured per person at 2021 purchasing-power parity, which adjusts for price differences but not for how income is shared.',
          'Ranks can tie. India and Bangladesh share 130th place, and small changes in the third decimal place move countries several places.',
        ],
      },
    ],
    related: [
      { href: '/development', label: 'Development Ledger' },
      { href: '/development/where-do-you-stand', label: 'Where do you stand? Global income calculator' },
      { href: '/inequality', label: 'Inequality Ledger' },
      { href: '/guides/development-inequality', label: 'Guide: human development and inequality' },
    ],
    sources: [
      'UNDP Human Development Report 2025 (2023 data), composite-indices time series',
      'World Bank Poverty and Inequality Platform, 2022 global distribution',
      'Oxford Poverty and Human Development Initiative, Global MPI',
    ],
  },
];

export const INSIGHT_BY_SLUG: Record<string, Insight> = Object.fromEntries(INSIGHTS.map((a) => [a.slug, a]));
