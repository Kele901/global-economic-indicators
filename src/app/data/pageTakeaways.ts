// Editor-written summaries shown under each dashboard hero. Every figure here is
// taken from the page's own curated tables; rewrite the entry and bump
// TAKEAWAYS_REVIEWED whenever the underlying snapshot is refreshed.

export const TAKEAWAYS_REVIEWED = '2026-10-30';

export interface PageTakeaway {
  /** Which data editions the figures come from. */
  dataNote: string;
  whatItShows: string;
  whyItMatters: string[];
  whatChanged: string[];
}

export type TakeawayPage =
  | 'politics'
  | 'development'
  | 'inequality'
  | 'defense'
  | 'climate'
  | 'trade'
  | 'migration'
  | 'ai'
  | 'health'
  | 'energy'
  | 'labor'
  | 'debt'
  | 'inflation'
  | 'technology'
  | 'economic-cycles'
  | 'currency-hierarchy'
  | 'monetary-policy'
  | 'outlook';

export const PAGE_TAKEAWAYS: Record<TakeawayPage, PageTakeaway> = {
  politics: {
    dataNote: 'Leadership checked 29 October 2026; EIU 2024, Freedom House 2025, V-Dem v15',
    whatItShows:
      'Who holds power in 47 countries, how their constitutions distribute it, and how free and accountable each system is on six independent indices.',
    whyItMatters: [
      'Only about 30% of the people in these 47 countries live in a democracy; electoral autocracies alone hold 46%, largely because India is now classed as one by V-Dem.',
      'Eleven governments rule without a lower-house majority, which tends to mean slower legislation, more budget brinkmanship and earlier elections.',
      'The governance composite runs from 93 (Norway) to 12 (Iran). Investors watch rule-of-law and corruption scores because weak institutions raise the risk premium on a country\u2019s debt.',
    ],
    whatChanged: [
      'Eight countries have a new leader in the past year, including Morocco\u2019s first woman head of government and Lula\u2019s fourth term in Brazil.',
      'Israel\u2019s October Knesset vote left no bloc with 61 seats, and Sweden is under a caretaker government after Parliament rejected Magdalena Andersson as prime minister.',
    ],
  },
  development: {
    dataNote: 'UNDP HDR 2025 (2023 data); World Bank PIP 2022',
    whatItShows:
      'How well lives are going beyond GDP: health, schooling, income, poverty, gender gaps and inequality, from the UNDP Human Development Report 2025 (2023 data) and the World Bank.',
    whyItMatters: [
      'Switzerland and Norway (HDI 0.970) and Ethiopia (0.497) sit 178 places apart in the world ranking, a gap that shows up in life expectancy, years of schooling and income alike.',
      'Inequality erases a median 12% of HDI across these countries, and as much as 36.5% in Ghana. Averages hide a lot.',
      'Average income is about $20 a day worldwide (2022, PPP), so most of the world lives on far less than rich-country poverty lines.',
    ],
    whatChanged: [
      'China has gained more HDI since 1990 than any other country here (+0.306), with Bangladesh close behind (+0.288).',
      'This edition adds country profiles, a global income calculator and a Gender Inequality Index view, where Norway (0.004) and Nigeria (0.677) mark the extremes.',
    ],
  },
  inequality: {
    dataNote: 'World Inequality Database and Piketty series to 2022',
    whatItShows:
      'How income and wealth are shared within countries, and how that has shifted over a century of wars, tax changes and globalisation.',
    whyItMatters: [
      'The top 1% in the United States took 21% of national income in 2022, against 8% in 1975; the bottom half took 13%.',
      'Wealth is far more concentrated than income: the top 10% hold 72% of US wealth and 57% of French wealth.',
      'Private wealth equals five to six years of national income in France, the UK and the US, so inheritance matters more for life chances than it did in the 1970s.',
    ],
    whatChanged: [
      'The top US marginal income-tax rate has fallen from 94% (1944) to 37%, a shift economists such as Piketty and Saez link to the post-1980 rise in top shares.',
      'Gini-over-time, quintile shares, the Palma ratio and the Great Gatsby curve now live on this page, moved here from the Development Ledger.',
    ],
  },
  defense: {
    dataNote: 'SIPRI 2025 release (2024 data), NATO June 2025, UCDP v25.1',
    whatItShows:
      'Military spending, arsenals, arms producers and armed conflict, from SIPRI, NATO, the Federation of American Scientists and the Uppsala Conflict Data Program.',
    whyItMatters: [
      'The United States spent $997bn in 2024, more than the next several countries combined; China spent $314bn and Russia $149bn.',
      'Russia now devotes 7.1% of GDP to defense and Ukraine 34.5%, levels that crowd out civilian investment for years.',
      'Defense budgets are among the fastest-growing items in many fiscal plans, which feeds directly into debt and bond-supply outlooks.',
    ],
    whatChanged: [
      'Germany raised spending from $67bn to $89bn in 2024, and Israel nearly doubled its outlay to 8.8% of GDP.',
      'There were 61 active state-based conflicts in 2024, the highest count in the UCDP series and up from 38 in 1989.',
    ],
  },
  climate: {
    dataNote: 'NASA GISS and EM-DAT to 2024; NDC submissions to mid-2025',
    whatItShows:
      'Where emissions come from, which pledges are on the table, how much climate finance flows, and how often climate disasters strike.',
    whyItMatters: [
      'The world was 1.28\u00b0C warmer in 2024 than the 1951\u20131980 average, up from 1.17\u00b0C a year earlier.',
      'China still runs 1,170 GW of coal capacity with 95 GW more under construction, while the UK has closed its last coal plant.',
      'EM-DAT recorded 745 climate-related disasters in 2024, more than three times the 1990 count, with knock-on effects for insurers, food prices and public budgets.',
    ],
    whatChanged: [
      'Rich countries first met the $100bn-a-year climate-finance goal in 2022 ($115.9bn), two years late.',
      'New 2035 targets range from an 81% cut on 1990 levels (UK) to intensity-only goals (China, Saudi Arabia).',
    ],
  },
  trade: {
    dataNote: 'Tariff timeline to August 2025; freight indices to June 2025; WTO 2024',
    whatItShows:
      'Tariffs, freight costs, chokepoints and supply-chain concentration: the plumbing of world trade.',
    whyItMatters: [
      'US tariffs on Chinese goods averaged 51% after the August 2025 pause, against 3% in 2018. That is a wholesale re-pricing of the world\u2019s largest bilateral trade relationship.',
      'China mines 69% of rare earths and refines 90%; Taiwan makes 92% of the most advanced chips. A single disruption can stall whole industries.',
      'About a fifth of global oil passes through the Strait of Hormuz each day, so regional tensions show up quickly in energy and shipping prices.',
    ],
    whatChanged: [
      'The 2025 tariff spiral peaked at 145% (US on China) and 125% (China on US) in April before the Geneva de-escalation in May.',
      'Container freight has eased to about $3,500 per 40-foot box, a third of the 2021 peak.',
    ],
  },
  migration: {
    dataNote: 'UNHCR mid-2025; World Bank/KNOMAD 2024; UN DESA 2024; Eurostat 2024',
    whatItShows:
      'Who moves, where to, and what they send home: refugee stocks, migrant populations, asylum claims, remittances and brain drain.',
    whyItMatters: [
      'US-to-Mexico remittances reached $64.7bn in 2024, the largest corridor in the world and a major source of household income in Mexico.',
      'Migrants make up 88% of the UAE\u2019s population and 15% of the United States\u2019. Labour markets and public finances in both depend on them.',
      'Ireland has a third of its tertiary-educated people living abroad, a reminder that emigration of skills can be as consequential as immigration.',
    ],
    whatChanged: [
      'EU asylum applications fell from 1.13m in 2023 to 912k in 2024, the first drop since 2020.',
      'Syria (6.2m), Venezuela (6.1m), Ukraine (6.0m) and Afghanistan (5.9m) remain the largest refugee populations.',
    ],
  },
  ai: {
    dataNote: 'Stanford AI Index 2025; Epoch AI to September 2025; IEA Electricity 2025',
    whatItShows:
      'The race to build and govern artificial intelligence: private investment, frontier models, chip capacity, data-centre power and talent flows.',
    whyItMatters: [
      'US private AI investment hit $109bn in 2024, more than ten times China\u2019s ($9.3bn) or the EU\u2019s ($8.9bn).',
      'TSMC produces 68% of the world\u2019s leading-edge (sub-7nm) wafers, a single point of failure for the whole industry.',
      'Data centres used 545 TWh of electricity in 2024; the IEA base case nearly triples that by 2030, with direct consequences for power prices and grids.',
    ],
    whatChanged: [
      'US investment rose from $67bn to $109bn in one year, and eight frontier models have been released since January 2025.',
      'China trains almost half of top AI researchers but hosts only 12% of them; the US hosts 60%.',
    ],
  },
  health: {
    dataNote: 'WHO GHED and GBD to 2023; WHO Mental Health Atlas 2020',
    whatItShows:
      'What countries spend on health, what they get for it, and the disease, readiness and pharmaceutical landscape behind those outcomes.',
    whyItMatters: [
      'The US spends $12,555 per person (17% of GDP) for a life expectancy of 77.5; Japan spends $4,700 and reaches 84.5. More spending does not guarantee better outcomes.',
      'Life expectancy in low-income countries rose from 51 to 65 years between 1990 and 2023, one of the largest gains in human welfare on record.',
      'More than nine in ten people with mental-health conditions in Nigeria, India and South Africa receive no treatment.',
    ],
    whatChanged: [
      'High-income life expectancy has recovered to 81.1 years after dipping to 80.0 in 2021 during the pandemic.',
      'The disease burden from communicable illness has more than halved since 1990, shifting health budgets toward chronic conditions such as obesity.',
    ],
  },
  energy: {
    dataNote: 'Electricity mix 2023; IAEA PRIS September 2025; reserves 2024',
    whatItShows:
      'How countries make electricity, what they import, what lies in the ground, and how fast storage and nuclear are being built.',
    whyItMatters: [
      'India still generates 74% of its power from coal and Qatar nearly all from gas, while France runs on 65% nuclear and Norway on 88% hydro.',
      'Germany now gets 47% of its electricity from wind and solar, with no nuclear plants left in operation.',
      'Venezuela holds the largest oil reserves (303bn barrels) yet produces a fraction of Saudi Arabia\u2019s output, a reminder that reserves are not supply.',
    ],
    whatChanged: [
      'Global battery storage is on track to grow from 220 GWh (2024) to 1,550 GWh by 2030, led by China.',
      'China has 30 nuclear reactors under construction and 40 more planned, the largest build-out anywhere.',
    ],
  },
  labor: {
    dataNote: 'ILO Global Wage Report 2024\u201325; UN WPP 2024; ILO modelled estimates 2025',
    whatItShows:
      'Wages, informality, unions, gender gaps, youth jobs and the shrinking or swelling of working-age populations.',
    whyItMatters: [
      'China\u2019s working-age population is projected to fall by 275 million between 2020 and 2050, while India\u2019s rises past 1 billion and Nigeria\u2019s nearly quintuples on 2000.',
      'Over 90% of Nigerian workers and 87% of Indian workers are informal, outside labour law and the tax base.',
      'Median hourly pay ranges from $32.5 (Switzerland) to $1.4 (Nigeria) at purchasing-power parity.',
    ],
    whatChanged: [
      'Real wages in Turkey fell 15% between 2019 and 2023, and in Germany by 3%, as inflation outran pay.',
      'World youth unemployment has eased from its 2020 peak of 17.1% to 13.4% in 2025.',
    ],
  },
  debt: {
    dataNote: 'IMF WEO October 2024 projections; CDS September 2025; BIS Q4 2024',
    whatItShows:
      'How much governments, households and central banks owe, how markets price that risk, and where defaults have happened.',
    whyItMatters: [
      'Japan\u2019s government debt is about 250% of GDP and the IMF expects it to stay there; US debt is projected to rise from 121% to 134% by 2029.',
      'China\u2019s public debt has climbed from 57% of GDP in 2019 to 90% in 2024, on course for 117% by 2029.',
      'Higher debt combined with higher interest rates means a growing share of tax revenue goes on interest rather than services.',
    ],
    whatChanged: [
      'Only Argentina and Nigeria have five-year CDS spreads above 400 basis points (September 2025), though Argentina\u2019s has narrowed by 420 bp this year.',
      'Ten sovereign defaults or restructurings since 2020, including Sri Lanka, Ghana and Ethiopia. The Fed has shrunk its balance sheet from $8.9tn to $6.7tn.',
    ],
  },
  inflation: {
    dataNote: 'World Bank CPI (live); Numbeo cost-of-living index; city prices to 2024',
    whatItShows:
      'Consumer-price inflation across major economies from World Bank data, plus a city-level cost-of-living comparison.',
    whyItMatters: [
      'Inflation decides how fast real incomes grow or shrink, and is the main thing central banks set interest rates against.',
      'Zurich is about 18% more expensive than New York on the cost-of-living index, while Tokyo is roughly half as expensive and Mumbai about a quarter.',
      'A one-bedroom flat in central New York costs about $4,050 a month, roughly 73% of the average net salary there.',
    ],
    whatChanged: [
      'The 2021\u20132023 surge was the sharpest in four decades for most advanced economies; the country chart shows how unevenly each has come back down since.',
      'City price series run to 2024. Use the country tabs to compare the latest annual CPI readings.',
    ],
  },
  technology: {
    dataNote: 'World Bank and WIPO (live, with 2024\u201325 fallbacks); curated VC and unicorn counts',
    whatItShows:
      'Research spending, patents, venture capital, unicorns and digital access across major economies.',
    whyItMatters: [
      'South Korea spends 5.4% of GDP on R&D, the highest share of any major economy; Japan spends 3.4%.',
      'China filed nearly twice as many AI patent applications as the US in 2024 (98,765 against 52,340), but the US raised about five times as much venture capital ($185bn against $39bn).',
      'The US is home to 728 unicorns (private start-ups worth over $1bn), against 325 in China and 78 in India.',
    ],
    whatChanged: [
      'US venture funding rose again in 2025 to about $196bn while China\u2019s slipped to $36bn.',
      'AI patent filings kept climbing in both countries in 2025.',
    ],
  },
  'economic-cycles': {
    dataNote: 'Curated crisis and cycle tables; market indicators to 2025',
    whatItShows:
      'Long and short economic cycles: the rise and fall of reserve powers, debt super-cycles, financial crises and Kondratiev waves.',
    whyItMatters: [
      'The site maps 35 major financial crises. Most were preceded by rapid credit growth and asset-price booms, patterns worth watching today.',
      'US government debt (about 123% of GDP) sits just above the 120% danger threshold used in the debt-cycle indicators here.',
      'Stock valuations are stretched: the CAPE ratio is about 32, nearly double its historical average of 17.',
    ],
    whatChanged: [
      'The long-term debt cycle is classed as being in a rate-normalisation phase (2022\u20132026) after a decade of near-zero rates.',
      'The fifth Kondratiev wave (digital and AI, from 2000) is placed in its "autumn" phase, 2020\u20132035.',
    ],
  },
  'currency-hierarchy': {
    dataNote: 'IMF COFER 2025; BIS Triennial Survey; REER to 2025 Q4',
    whatItShows:
      'Why a few currencies dominate world finance, how much they trade, what share of reserves they make up, and which ones look over- or under-valued.',
    whyItMatters: [
      'The US dollar is on one side of about $6.6tn of foreign-exchange trading every day, nearly three times the euro.',
      'Being the reserve currency lets the US borrow more cheaply and spreads its interest-rate decisions to every other economy.',
      'In real terms the yen is about 23% below its long-run average and the Swiss franc about 30% above it, which matters for trade competitiveness.',
    ],
    whatChanged: [
      'The dollar\u2019s share of global reserves has slipped from 71% in 2000 to 57% in 2025, but no rival is close: the euro holds 20% and the renminbi 2%.',
      'Live exchange rates refresh on the hierarchy tab, so you can see how today\u2019s moves compare with the long-run valuations.',
    ],
  },
  'monetary-policy': {
    dataNote: 'Central-bank announcements (live where available); decision log from September 2024',
    whatItShows:
      'What the major central banks have decided, where policy rates stand, and what they have signalled for the months ahead.',
    whyItMatters: [
      'Policy rates set the floor for mortgage, business-loan and government-borrowing costs across each economy.',
      'When banks move in opposite directions, as Brazil (hiking) and much of the advanced world (cutting) did through 2025, exchange rates and capital flows react.',
      'Forward guidance often moves markets more than the decision itself, which is why the page tracks what each bank says it will do next.',
    ],
    whatChanged: [
      'The 2024\u20132026 easing cycle began with the Fed\u2019s 50 bp cut in September 2024, while Japan has been moving the other way and raising rates.',
      'Rates shown are refreshed from central-bank sources when available and fall back to the last confirmed decision otherwise.',
    ],
  },
  outlook: {
    dataNote: 'IMF World Economic Outlook, October 2025 edition',
    whatItShows:
      'IMF World Economic Outlook projections for growth and inflation, compared against each country\u2019s recent track record.',
    whyItMatters: [
      'The IMF expects world growth of about 3.3% in 2025 and 2026, below the 2000\u20132019 average of roughly 3.7%.',
      'Emerging markets are projected to grow more than twice as fast as advanced economies (about 4.2% against 1.8%), led by India at around 6.5%.',
      'Uncertainty grows with the horizon: the error bands on the charts widen from about one percentage point for next year to around two points three years out.',
    ],
    whatChanged: [
      'World inflation is projected to ease from 4.2% in 2025 to 3.6% in 2026.',
      'China\u2019s growth is expected to slow from 4.5% to 4.0%, and Japan\u2019s from 1.0% to 0.7%.',
    ],
  },
};
