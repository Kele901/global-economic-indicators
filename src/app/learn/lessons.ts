// Curated curriculum for the /learn starter guide (ages 13+).
// Twenty-three lessons across five modules, plus a ten-question
// wrap-up quiz. Every paragraph is intentionally short (2-3
// sentences), every technical term is either avoided or explained
// inline, and every lesson opens with a real-world analogy so a
// teenager has something concrete to hang the idea on. Nothing here
// is data-driven — the interactive demos use hardcoded illustrative
// numbers so the guide always renders even if upstream APIs are down.

export type ModuleId = 'money' | 'economy' | 'countries' | 'themes' | 'analyst';

export type DemoKey =
  | 'inflation'
  | 'interest'
  | 'gdp'
  | 'trade'
  | 'debt'
  | 'currency'
  | 'banking'
  | 'cycle'
  | 'energyMix'
  | 'chartTricks'
  | 'correlation'
  // Workshops: longer, multi-lever pieces attached to a lesson via
  // `workshopKey` rather than `demoKey`, so a lesson can carry both a
  // quick demo and a proper sandbox.
  | 'buildIndex'
  | 'balanceBudget'
  | 'centralBanker'
  | 'chartGame';

export interface QuizQuestion {
  q: string;
  options: string[];
  answerIdx: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  module: ModuleId;
  order: number;
  title: string;
  emoji: string;
  minutes: number;
  analogy: string;
  body: string[];
  bigIdeas: string[];
  jargonBox?: { term: string; plain: string }[];
  demoKey?: DemoKey;
  // A bigger interactive sandbox rendered under its own heading after the
  // quick demo. Kept separate so the short demos stay short.
  workshopKey?: DemoKey;
  workshopTitle?: string;
  linksTo: { label: string; href: string }[];
  quiz: QuizQuestion[];
}

export interface Module {
  id: ModuleId;
  label: string;
  emoji: string;
  blurb: string;
}

export const MODULES: Module[] = [
  { id: 'money',     label: 'Money & Prices',     emoji: '💵', blurb: 'What money is, why prices change, and what interest rates actually do.' },
  { id: 'economy',   label: 'The Economy',        emoji: '🏗️', blurb: 'How we measure a country: jobs, growth, debt and fairness.' },
  { id: 'countries', label: 'Countries Together', emoji: '🌐', blurb: 'Trade, people moving around, and the "soft power" of culture.' },
  { id: 'themes',    label: 'Big Global Themes',  emoji: '🚀', blurb: 'Climate, energy, resources, health, defense and the AI boom.' },
  { id: 'analyst',   label: 'Think Like an Analyst', emoji: '🔍', blurb: 'How to read a chart, spot a misleading stat, and know where numbers come from.' },
];

// ─────────────────────────────────────────────────────────────────────
// Module 1 — Money & Prices
// ─────────────────────────────────────────────────────────────────────
export const LESSONS: Lesson[] = [
  {
    id: 'money',
    module: 'money',
    order: 1,
    title: 'What is Money?',
    emoji: '🪙',
    minutes: 3,
    analogy: 'Imagine trying to trade a pizza slice for a haircut. Awkward, right? Money is the middle-man that makes trades easy.',
    body: [
      'Money is anything a lot of people agree to accept in exchange for stuff. Long ago it was salt, cows, shells or gold. Today it is mostly numbers in a bank app.',
      'Money does three jobs: it lets you trade (pay for a game), it stores value (save it for later), and it measures value (this shirt costs $20).',
      'Because everyone trusts the same money, you can walk into any shop and know exactly what a bar of chocolate costs. Without money, we would have to swap physical things every single time.',
    ],
    bigIdeas: [
      'Money is a shared way to trade.',
      'Money only works because we all trust it.',
      'Modern money is mostly digital numbers.',
    ],
    jargonBox: [
      { term: 'Currency', plain: 'The type of money a country uses (dollars, euros, yen).' },
      { term: 'Central bank', plain: 'The government-linked bank that controls a country\u2019s money.' },
    ],
    linksTo: [
      { label: 'Explore world currencies', href: '/currency-hierarchy' },
    ],
    quiz: [
      {
        q: 'What are the three main jobs of money?',
        options: [
          'Trade, store value, measure value',
          'Save, spend, invest',
          'Print, borrow, spend',
        ],
        answerIdx: 0,
        explanation: 'Money helps us trade things easily, keep value for later, and measure how much things cost.',
      },
      {
        q: 'Why does modern money have value?',
        options: [
          'Because it is made of gold',
          'Because people trust it and accept it',
          'Because the government secretly backs each note with a diamond',
        ],
        answerIdx: 1,
        explanation: 'Modern money is mostly digital or paper. It works because people agree to accept it.',
      },
    ],
  },
  {
    id: 'inflation',
    module: 'money',
    order: 2,
    title: 'Why Prices Go Up: Inflation',
    emoji: '🍕',
    minutes: 4,
    analogy: 'A pizza slice that cost £2 when you were in Year 7 might cost £3 by the time you finish school. That climb is inflation.',
    body: [
      'Inflation means prices going up over time. If inflation is 3% a year, something that costs £100 today will cost about £103 next year.',
      'Inflation happens when there is more demand for stuff than supply, or when the government prints too much money, or when things like oil get more expensive.',
      'A little bit of inflation (about 2%) is normal. A lot of inflation — like 20% or more — is a big problem because your savings buy less every month.',
    ],
    bigIdeas: [
      'Inflation is prices rising over time.',
      'A small amount is normal; a lot is dangerous.',
      'Inflation quietly eats the value of savings.',
    ],
    jargonBox: [
      { term: 'CPI', plain: 'Consumer Price Index — a basket of things people buy, tracked over time to measure inflation.' },
      { term: 'Deflation', plain: 'The opposite of inflation — prices falling. Sounds nice but can freeze the economy.' },
    ],
    demoKey: 'inflation',
    linksTo: [
      { label: 'See real inflation charts', href: '/inflation' },
    ],
    quiz: [
      {
        q: 'What does 5% inflation mean?',
        options: [
          'Prices are 5% lower than last year',
          'Prices are on average 5% higher than last year',
          'Only food prices rise',
        ],
        answerIdx: 1,
        explanation: 'Inflation of 5% means the average basket of goods costs 5% more than it did a year ago.',
      },
      {
        q: 'Why is very high inflation bad?',
        options: [
          'It makes savings and wages worth less quickly',
          'It always creates jobs',
          'It has no real effect on people',
        ],
        answerIdx: 0,
        explanation: 'When prices race up, the money you saved buys less and less each month.',
      },
      {
        q: 'What does CPI stand for?',
        options: [
          'Central Price Index',
          'Consumer Price Index',
          'Country Product Index',
        ],
        answerIdx: 1,
        explanation: 'CPI = Consumer Price Index. It is a basket of things regular people buy.',
      },
    ],
  },
  {
    id: 'interest',
    module: 'money',
    order: 3,
    title: 'The Cost of Borrowing: Interest Rates',
    emoji: '📈',
    minutes: 4,
    analogy: 'If a friend lends you £10 and asks for £11 back next week, that extra £1 is interest — the price of borrowing.',
    body: [
      'When banks lend money, they charge extra on top. That extra is called interest, and how much extra is the interest rate.',
      'A country\u2019s central bank (like the Federal Reserve in the US or the Bank of England in the UK) sets a main interest rate. Everyone else copies it: mortgages, savings accounts, business loans.',
      'When inflation is too high, central banks raise interest rates. This makes borrowing more expensive, so people spend less, so prices stop racing up. When the economy is weak, they cut rates to encourage spending.',
    ],
    bigIdeas: [
      'Interest is the price of borrowing money.',
      'Central banks use rates to control inflation.',
      'Higher rates cool the economy; lower rates heat it up.',
    ],
    jargonBox: [
      { term: 'Federal Funds Rate', plain: 'The main US interest rate set by the Federal Reserve.' },
      { term: 'Real rate', plain: 'The interest rate after subtracting inflation. It tells you if you\u2019re truly earning or losing.' },
    ],
    demoKey: 'interest',
    workshopKey: 'centralBanker',
    workshopTitle: 'Workshop: be the central banker',
    linksTo: [
      { label: 'See real central bank rates', href: '/monetary-policy' },
      { label: 'See the main dashboard', href: '/' },
    ],
    quiz: [
      {
        q: 'What is an interest rate?',
        options: [
          'The price of borrowing money',
          'A type of tax',
          'The number of coins in a bank',
        ],
        answerIdx: 0,
        explanation: 'The interest rate is what you pay on top when you borrow, or what you earn when you lend.',
      },
      {
        q: 'Why do central banks raise interest rates?',
        options: [
          'To fight high inflation',
          'To lower unemployment',
          'To print more money',
        ],
        answerIdx: 0,
        explanation: 'Higher rates make borrowing pricier, which cools spending and slows down inflation.',
      },
    ],
  },
  {
    id: 'banks',
    module: 'money',
    order: 4,
    title: 'How Banks Work',
    emoji: '🏛️',
    minutes: 4,
    analogy: 'Your money in a bank app is not sitting in a box with your name on it. The bank has lent most of it to someone buying a house.',
    body: [
      'A bank takes deposits from savers and lends that money out to borrowers. It pays savers a small amount of interest and charges borrowers a bigger amount. The gap is how it makes money.',
      'Banks only keep a slice of deposits as cash — the reserve. Because everyone rarely withdraws at once, a £100 deposit can end up supporting several hundred pounds of loans across the banking system. That ripple is called the money multiplier.',
      'The system works on confidence. If enough people panic and demand their cash at the same time, even a healthy bank runs out — a bank run. That is what happened in 2008, and why governments now guarantee deposits up to a limit.',
    ],
    bigIdeas: [
      'Banks turn deposits into loans and earn the gap.',
      'Only a fraction of deposits is kept as cash.',
      'Banking runs on confidence — lose it and the bank fails.',
    ],
    jargonBox: [
      { term: 'Reserve ratio', plain: 'The share of deposits a bank must keep on hand instead of lending out.' },
      { term: 'Bank run', plain: 'When lots of customers withdraw at once and the bank runs out of cash.' },
      { term: 'Deposit insurance', plain: 'A government promise to repay your savings (up to a limit) if your bank fails.' },
    ],
    demoKey: 'banking',
    linksTo: [
      { label: 'See what central banks are doing', href: '/monetary-policy' },
    ],
    quiz: [
      {
        q: 'How does a bank mainly make money?',
        options: [
          'By charging borrowers more interest than it pays savers',
          'By printing its own banknotes',
          'By keeping every deposit locked in a vault',
        ],
        answerIdx: 0,
        explanation: 'The gap between the interest it charges and the interest it pays is the bank\u2019s core profit.',
      },
      {
        q: 'What causes a bank run?',
        options: [
          'Interest rates being cut',
          'Too many customers demanding their cash at the same time',
          'The bank lending too little',
        ],
        answerIdx: 1,
        explanation: 'Banks hold only a fraction of deposits as cash, so a sudden rush of withdrawals drains them.',
      },
      {
        q: 'What does the reserve ratio control?',
        options: [
          'How much of each deposit a bank must keep rather than lend',
          'The exchange rate',
          'How many branches a bank can open',
        ],
        answerIdx: 0,
        explanation: 'A higher reserve ratio means less lending from each deposit, so less money ripples through the system.',
      },
    ],
  },
  {
    id: 'currency',
    module: 'money',
    order: 5,
    title: 'Currencies & Exchange Rates',
    emoji: '💱',
    minutes: 4,
    analogy: 'Going on holiday abroad? Your money has to be swapped for the local money first. The swap rate is called the exchange rate.',
    body: [
      'Different countries use different money. £1 might buy $1.25 today and $1.30 tomorrow. That changing swap rate is the exchange rate.',
      'Exchange rates move because of trade, interest rates, politics and how much investors trust a country. A strong currency buys more of others.',
      'When a currency gets weaker, foreign holidays and imported gadgets get more expensive at home. When it gets stronger, they get cheaper.',
    ],
    bigIdeas: [
      'Exchange rates are the price of one money in another.',
      'Rates change all the time based on trust and interest rates.',
      'A stronger currency = cheaper imports and holidays.',
    ],
    jargonBox: [
      { term: 'FX', plain: 'Short for "foreign exchange" — the market where currencies are swapped.' },
      { term: 'Reserve currency', plain: 'A currency (like the US dollar) that many countries hold in their savings.' },
    ],
    demoKey: 'currency',
    linksTo: [
      { label: 'See the currency hierarchy', href: '/currency-hierarchy' },
      { label: 'Compare currencies over time', href: '/trading-places' },
    ],
    quiz: [
      {
        q: 'What is an exchange rate?',
        options: [
          'The price of one currency in another',
          'The bank\u2019s profit on a loan',
          'A country\u2019s inflation number',
        ],
        answerIdx: 0,
        explanation: 'An exchange rate tells you how much of currency B you get for one unit of currency A.',
      },
      {
        q: 'If the pound weakens against the dollar, what happens to iPhones (priced in dollars) in the UK?',
        options: [
          'They get cheaper',
          'They get more expensive',
          'The price stays the same',
        ],
        answerIdx: 1,
        explanation: 'A weaker pound buys fewer dollars, so dollar-priced goods cost more in pounds.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // Module 2 — The Economy
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'gdp',
    module: 'economy',
    order: 6,
    title: 'GDP: How Big Is a Country\u2019s Economy?',
    emoji: '🏭',
    minutes: 4,
    analogy: 'Imagine every lemonade stand, barber shop, factory and Netflix subscription in your country added together in one year. That total is GDP.',
    body: [
      'GDP stands for Gross Domestic Product. It is the total value of all the goods and services a country produces in a year.',
      'A bigger GDP does not always mean people are richer. If a country has a huge population, you divide GDP by the number of people to get GDP per person. That is a better measure of how the average person lives.',
      'GDP grows when the economy is doing well and shrinks in a recession. Fast growth like 6-8% is common for developing countries; rich countries usually grow 1-3% a year.',
    ],
    bigIdeas: [
      'GDP measures a country\u2019s total output.',
      'GDP per person shows how rich the average person is.',
      'Growth means the economy is expanding.',
    ],
    jargonBox: [
      { term: 'Recession', plain: 'When GDP shrinks for two three-month periods in a row.' },
      { term: 'Nominal vs real', plain: 'Nominal GDP counts today\u2019s prices; real GDP strips out inflation for a fair comparison.' },
    ],
    demoKey: 'gdp',
    linksTo: [
      { label: 'See the Development Index', href: '/development' },
    ],
    quiz: [
      {
        q: 'What does GDP measure?',
        options: [
          'How much a country spends on the army',
          'The total value of goods and services a country makes',
          'How much money is in the bank',
        ],
        answerIdx: 1,
        explanation: 'GDP is the total value of everything a country produces in a year.',
      },
      {
        q: 'Why do we look at GDP per person?',
        options: [
          'It ignores small countries',
          'It shows how well the average person lives',
          'It is the only fair way to compare inflation',
        ],
        answerIdx: 1,
        explanation: 'GDP per person divides output by population — a better sense of individual living standards.',
      },
    ],
  },
  {
    id: 'jobs',
    module: 'economy',
    order: 7,
    title: 'Jobs & Unemployment',
    emoji: '💼',
    minutes: 3,
    analogy: 'If every adult in your school year could either have a job or be looking for one, unemployment is the share who are looking but haven\u2019t found one yet.',
    body: [
      'The unemployment rate is the percentage of people who want a job but do not have one. A low rate (about 3-5%) is healthy; above 8% is a warning sign.',
      'Not everyone counts. Kids in school, retirees and stay-at-home parents who are not looking for work are outside the "labour force". Only those actively looking count as unemployed.',
      'Youth unemployment is often higher than the general rate because young people are new to the workforce and get hit hardest by economic downturns.',
    ],
    bigIdeas: [
      'Unemployment counts people who want but lack a job.',
      'A low rate is healthy; a high rate signals trouble.',
      'Young people usually face higher unemployment.',
    ],
    jargonBox: [
      { term: 'Labour force', plain: 'People who have a job OR are actively looking for one.' },
      { term: 'Participation rate', plain: 'The share of working-age people in the labour force.' },
    ],
    linksTo: [
      { label: 'See employment on the dashboard', href: '/' },
    ],
    quiz: [
      {
        q: 'Who counts as unemployed?',
        options: [
          'Anyone without a job',
          'Anyone who wants a job and is actively looking',
          'Only people over 30',
        ],
        answerIdx: 1,
        explanation: 'To count as unemployed you must want a job and be actively searching for one.',
      },
      {
        q: 'What does a very high unemployment rate usually mean?',
        options: [
          'The economy is struggling',
          'The economy is doing great',
          'Nothing — it is a random number',
        ],
        answerIdx: 0,
        explanation: 'Persistent high unemployment means the economy isn\u2019t creating enough jobs.',
      },
    ],
  },
  {
    id: 'cycles',
    module: 'economy',
    order: 8,
    title: 'Booms & Busts: The Business Cycle',
    emoji: '🎢',
    minutes: 4,
    analogy: 'Economies breathe. They expand until they are stretched too thin, fall back, catch their breath, and expand again. Nobody has ever found the off switch.',
    body: [
      'The business cycle has four phases. In an expansion, companies hire, wages rise and shops are busy. At the peak, the economy is running hot: inflation climbs and firms struggle to find workers.',
      'Then comes the recession. Spending drops, companies cut jobs, GDP shrinks. Unemployment is the slow one here — it keeps rising for months after the economy has technically stopped falling.',
      'Recovery follows. Central banks cut interest rates and governments often spend more to speed it up. Cycles typically last several years, but no two are the same length, and nobody can reliably call the turning point in advance.',
    ],
    bigIdeas: [
      'Economies move through expansion, peak, recession and recovery.',
      'GDP and unemployment move in opposite directions.',
      'Unemployment lags — it keeps rising after the bottom.',
    ],
    jargonBox: [
      { term: 'Expansion', plain: 'A stretch where the economy is growing and jobs are being created.' },
      { term: 'Soft landing', plain: 'Cooling inflation with higher rates without tipping into recession. Rare and hard.' },
      { term: 'Lagging indicator', plain: 'A number that reacts late, like unemployment, so it confirms rather than predicts.' },
    ],
    demoKey: 'cycle',
    linksTo: [
      { label: 'Explore economic cycles', href: '/economic-cycles' },
    ],
    quiz: [
      {
        q: 'What are the four phases of the business cycle?',
        options: [
          'Expansion, peak, recession, recovery',
          'Inflation, deflation, tariffs, trade',
          'Borrow, spend, save, invest',
        ],
        answerIdx: 0,
        explanation: 'Economies expand, hit a peak, contract into recession, then recover and start again.',
      },
      {
        q: 'What typically happens to unemployment during a recession?',
        options: [
          'It falls',
          'It rises, and keeps rising even after GDP bottoms out',
          'It stays perfectly flat',
        ],
        answerIdx: 1,
        explanation: 'Unemployment is a lagging indicator — firms keep cutting jobs for a while after the worst has passed.',
      },
    ],
  },
  {
    id: 'debt',
    module: 'economy',
    order: 9,
    title: 'Government Debt',
    emoji: '🏦',
    minutes: 4,
    analogy: 'You promise to pay your friend back £5 next week for a snack. Governments do the same — but with billions, and for decades.',
    body: [
      'Governments spend more than they collect in taxes almost every year. To cover the gap they borrow money by selling "bonds" (a fancy IOU) to investors.',
      'The total amount owed is the national debt. We compare it to GDP to see if it is a lot: 60% of GDP is normal, above 100% is worrying, above 200% is extraordinary (Japan sits around 250%).',
      'Debt is not automatically bad. If it pays for schools, roads and hospitals, it can help the economy grow. If it just covers day-to-day spending forever, it becomes risky.',
    ],
    bigIdeas: [
      'Governments borrow by selling bonds.',
      'Debt-to-GDP shows how heavy the debt really is.',
      'Borrowing to invest is different from borrowing to survive.',
    ],
    jargonBox: [
      { term: 'Bond', plain: 'An IOU sold by a government or company, paid back with interest.' },
      { term: 'Default', plain: 'When a government cannot pay its debt back on time. Very rare for big rich countries.' },
    ],
    demoKey: 'debt',
    linksTo: [
      { label: 'Open the Debt Ledger', href: '/debt' },
    ],
    quiz: [
      {
        q: 'How do governments usually borrow money?',
        options: [
          'By taking loans from other people\u2019s piggy banks',
          'By selling bonds to investors',
          'By printing exactly the right amount of cash',
        ],
        answerIdx: 1,
        explanation: 'Governments sell bonds — promises to pay the money back with interest.',
      },
      {
        q: 'What does "debt-to-GDP" tell you?',
        options: [
          'How much debt a country has compared to the size of its economy',
          'How fast prices are rising',
          'The number of banks in a country',
        ],
        answerIdx: 0,
        explanation: 'Debt-to-GDP compares what a country owes with what it produces. It shows how big the debt really is.',
      },
    ],
  },
  {
    id: 'taxes',
    module: 'economy',
    order: 10,
    title: 'Taxes & Government Spending',
    emoji: '🧾',
    minutes: 4,
    analogy: 'A country runs on a household budget, just with a lot more zeroes. Money comes in from taxes and goes out on the things everyone shares.',
    body: [
      'Most government income comes from three places: income tax on what people earn, sales taxes like VAT on what people buy, and taxes on company profits. Rich countries typically collect 30-45% of GDP in tax; many poorer countries collect under 15%.',
      'It goes out on health, pensions, education, defense and interest on past borrowing. In most developed countries health and pensions alone eat over half the budget, and both grow as populations age.',
      'Here is the distinction people mix up constantly. The deficit is the gap in a single year — spending minus income. The debt is every past deficit piled up. You can cut the deficit and still watch the debt grow, as long as the gap is above zero.',
    ],
    bigIdeas: [
      'Tax comes mainly from income, spending and company profits.',
      'Health and pensions dominate spending in rich countries.',
      'Deficit is one year\u2019s gap; debt is all of them added together.',
    ],
    jargonBox: [
      { term: 'Deficit', plain: 'How much more a government spends than it collects in a single year.' },
      { term: 'Surplus', plain: 'The opposite — collecting more than you spend. Uncommon.' },
      { term: 'Progressive tax', plain: 'A tax where higher earners pay a higher percentage, not just a bigger amount.' },
    ],
    workshopKey: 'balanceBudget',
    workshopTitle: 'Workshop: balance the budget',
    linksTo: [
      { label: 'Open the Debt Ledger', href: '/debt' },
    ],
    quiz: [
      {
        q: 'What is the difference between the deficit and the debt?',
        options: [
          'They are two words for the same thing',
          'The deficit is one year\u2019s shortfall; the debt is all past shortfalls added up',
          'The debt is yearly and the deficit is total',
        ],
        answerIdx: 1,
        explanation: 'Run a deficit every year and the debt keeps climbing, even if each year\u2019s deficit is getting smaller.',
      },
      {
        q: 'What does a progressive tax mean?',
        options: [
          'Everyone pays the same percentage',
          'Higher earners pay a higher percentage of their income',
          'The tax rate rises a little every year',
        ],
        answerIdx: 1,
        explanation: 'Progressive means the rate itself climbs with income, not just the amount paid.',
      },
    ],
  },
  {
    id: 'development',
    module: 'economy',
    order: 11,
    title: 'Rich vs Poor: Development & Inequality',
    emoji: '⚖️',
    minutes: 4,
    analogy: 'If two friends share £100 and one takes £90, that\u2019s huge inequality. Countries have the same issue on a much bigger scale.',
    body: [
      'Some countries are much richer than others. We measure development with a few numbers: GDP per person, life expectancy, and how many people have gone to school.',
      'Inequality is about how evenly wealth is spread inside a country. Even a rich country can have big inequality if a tiny group holds most of the money.',
      'One popular measure is the Gini coefficient (0 = perfectly equal, 100 = one person owns everything). Nordic countries score around 25; deeply unequal countries score above 50.',
    ],
    bigIdeas: [
      'Development combines income, health and education.',
      'Inequality is about how wealth is shared.',
      'Two countries with the same GDP can feel very different to live in.',
    ],
    jargonBox: [
      { term: 'HDI', plain: 'Human Development Index — combines income, life expectancy and education into one score.' },
      { term: 'Gini', plain: 'A 0-to-100 number showing how unequal a country is.' },
    ],
    workshopKey: 'buildIndex',
    workshopTitle: 'Workshop: build your own development index',
    linksTo: [
      { label: 'Open the Development Index', href: '/development' },
      { label: 'See Inequality data', href: '/inequality' },
    ],
    quiz: [
      {
        q: 'What does HDI measure?',
        options: [
          'Only income',
          'Income + health + education combined',
          'Population size',
        ],
        answerIdx: 1,
        explanation: 'HDI blends three things: how rich, how healthy and how educated people are.',
      },
      {
        q: 'A Gini coefficient of 25 means...',
        options: [
          'Wealth is fairly evenly shared',
          'A few people own almost everything',
          'The country is very poor',
        ],
        answerIdx: 0,
        explanation: 'Low Gini = fair sharing. High Gini = a few people hold most of the money.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // Module 3 — Countries Together
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'trade',
    module: 'countries',
    order: 12,
    title: 'Trade Between Countries',
    emoji: '🚢',
    minutes: 4,
    analogy: 'You have loads of chocolate; your friend has loads of crisps. You swap. Everyone gets both. That\u2019s trade.',
    body: [
      'Countries trade because no country makes everything well. Japan makes great cars, Brazil grows lots of coffee, Saudi Arabia has oil. Everyone benefits by swapping.',
      'Exports are things sold to other countries. Imports are things bought from other countries. The difference is the "trade balance".',
      'Sometimes countries add extra fees called tariffs on imports. This makes foreign goods more expensive, protecting local businesses but making things costlier for shoppers.',
    ],
    bigIdeas: [
      'Trade lets each country focus on what it does best.',
      'Exports go out, imports come in.',
      'Tariffs make imports pricier and can start trade wars.',
    ],
    jargonBox: [
      { term: 'Tariff', plain: 'A tax a government adds to imported goods.' },
      { term: 'Free trade', plain: 'When two countries agree not to add tariffs between them.' },
    ],
    demoKey: 'trade',
    linksTo: [
      { label: 'Open the Trade Ledger', href: '/trade-ledger' },
      { label: 'See the Trade Network map', href: '/trade-network' },
    ],
    quiz: [
      {
        q: 'What are exports?',
        options: [
          'Goods sold to other countries',
          'Goods bought from other countries',
          'Taxes on foreign goods',
        ],
        answerIdx: 0,
        explanation: 'Exports leave a country to be sold abroad. Imports come in.',
      },
      {
        q: 'What is a tariff?',
        options: [
          'A friendly trade agreement',
          'A tax on imports',
          'The exchange rate',
        ],
        answerIdx: 1,
        explanation: 'A tariff is an extra fee on imports. It protects local firms but makes goods pricier.',
      },
    ],
  },
  {
    id: 'migration',
    module: 'countries',
    order: 13,
    title: 'People on the Move: Migration',
    emoji: '🧳',
    minutes: 3,
    analogy: 'You might move from one town to another for a new school. Millions of people move between countries every year, for the same kinds of reasons: work, safety, family.',
    body: [
      'Migration is people moving from one country to another to live. Some come for jobs, some to study, some to escape war (they are called refugees).',
      'Countries that welcome migrants often get younger workers, new cultures and new businesses. But it can also strain housing, schools and healthcare if not planned well.',
      'When migrants send money back home to their families it is called a "remittance". For many countries this is a bigger money flow than any single industry.',
    ],
    bigIdeas: [
      'People move for work, safety, family and study.',
      'Migration can grow the economy but needs planning.',
      'Remittances are money migrants send home — often huge.',
    ],
    jargonBox: [
      { term: 'Refugee', plain: 'Someone forced to leave their country because of war or persecution.' },
      { term: 'Remittance', plain: 'Money migrants send home to family.' },
    ],
    linksTo: [
      { label: 'Open the Migration Ledger', href: '/migration-ledger' },
    ],
    quiz: [
      {
        q: 'What is a remittance?',
        options: [
          'A visa document',
          'Money migrants send home to family',
          'A tax on foreign workers',
        ],
        answerIdx: 1,
        explanation: 'Remittances are the money migrants send back to their family in their home country.',
      },
      {
        q: 'Who is a refugee?',
        options: [
          'Any migrant',
          'Someone forced to leave their country because of danger',
          'A tourist',
        ],
        answerIdx: 1,
        explanation: 'A refugee is someone fleeing war, violence or persecution, not just moving for work.',
      },
    ],
  },
  {
    id: 'culture',
    module: 'countries',
    order: 14,
    title: 'Culture, Passports & Soft Power',
    emoji: '🎭',
    minutes: 3,
    analogy: 'Think about how many countries you can name from their music, movies or football teams. That influence is called soft power.',
    body: [
      'Soft power is a country\u2019s ability to shape the world through culture, ideas and diplomacy — not through armies or money.',
      'K-pop, Hollywood films, French cooking, Nigerian Afrobeats, British Premier League football — these all give their countries a global voice.',
      'Passport strength is another quiet form of power. A strong passport (like Japan\u2019s or Germany\u2019s) lets you visit 190+ countries without a visa. A weak one may allow only 30-40.',
    ],
    bigIdeas: [
      'Soft power comes from culture and ideas.',
      'Music, film, sport and food shape how the world sees a country.',
      'Passport strength quietly reflects a country\u2019s standing.',
    ],
    jargonBox: [
      { term: 'Soft power', plain: 'Influence through culture and ideas, not force.' },
      { term: 'Visa', plain: 'Official permission to enter another country.' },
    ],
    linksTo: [
      { label: 'Open the Cultural Capital page', href: '/cultural-capital' },
    ],
    quiz: [
      {
        q: 'What is soft power?',
        options: [
          'Cultural influence and appeal',
          'A weak army',
          'A low interest rate',
        ],
        answerIdx: 0,
        explanation: 'Soft power is influence through culture, ideas and reputation — not force.',
      },
      {
        q: 'What does a strong passport give you?',
        options: [
          'Access to more countries without needing a visa',
          'A higher salary',
          'Free flights',
        ],
        answerIdx: 0,
        explanation: 'Strong passports open the door to more countries with fewer visa requirements.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // Module 4 — Big Global Themes
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'climate',
    module: 'themes',
    order: 15,
    title: 'The Planet\u2019s Weather: Climate & Emissions',
    emoji: '🌍',
    minutes: 4,
    analogy: 'Leave a car engine running in a closed garage — the air gets thick and hot. Earth\u2019s atmosphere works a bit like that when we release too many greenhouse gases.',
    body: [
      'Burning coal, oil and gas releases carbon dioxide (CO₂). This gas traps heat in the atmosphere — the "greenhouse effect" — and slowly warms the planet.',
      'Some countries release far more CO₂ than others. China and the US emit the most in total; countries like Qatar and Australia emit the most per person.',
      'The world agreed in Paris (2015) to try to keep warming below 1.5°C. That means switching to clean energy — solar, wind, nuclear, batteries.',
    ],
    bigIdeas: [
      'CO₂ traps heat and warms the planet.',
      'Big emitters differ if you measure by country or per person.',
      'Clean energy is the main tool to slow warming.',
    ],
    jargonBox: [
      { term: 'Greenhouse gas', plain: 'Gas that traps heat in the atmosphere (mainly CO₂ and methane).' },
      { term: 'Net zero', plain: 'Balancing every tonne of CO₂ released with a tonne removed.' },
    ],
    linksTo: [
      { label: 'Open the Climate Ledger', href: '/climate-ledger' },
    ],
    quiz: [
      {
        q: 'Which is a greenhouse gas?',
        options: [
          'Oxygen',
          'Carbon dioxide',
          'Nitrogen',
        ],
        answerIdx: 1,
        explanation: 'Carbon dioxide is the main greenhouse gas from burning fossil fuels.',
      },
      {
        q: 'What does "net zero" mean?',
        options: [
          'No CO₂ ever released',
          'Any CO₂ released is balanced by an equal amount removed',
          'Zero interest rates',
        ],
        answerIdx: 1,
        explanation: 'Net zero means the total balance is zero — release some, remove the same amount.',
      },
    ],
  },
  {
    id: 'energy',
    module: 'themes',
    order: 16,
    title: 'Powering the World: Energy & Electricity',
    emoji: '⚡',
    minutes: 4,
    analogy: 'Flick a light switch and something, somewhere, has to be generating that exact moment. There is no big battery holding the nation\u2019s electricity in reserve.',
    body: [
      'Electricity comes from a mix of sources, and every country\u2019s mix is different. France runs mostly on nuclear, Norway on hydro, Poland still largely on coal, and the UK on a blend of gas, wind and imports.',
      'Each source trades off three things: cost, carbon, and reliability. Solar and wind are now the cheapest to build but only produce when the sun shines or the wind blows. Gas is flexible and can be turned up on demand, but it emits. Nuclear is steady and low-carbon but slow and expensive to build.',
      'That is why no country runs on one source. A grid needs something that can fill the gap at 6pm on a still winter evening, which is the single hardest problem in the energy transition.',
    ],
    bigIdeas: [
      'Every country has a different electricity mix.',
      'Sources trade off cost, carbon and reliability.',
      'Intermittent renewables need something to fill the gaps.',
    ],
    jargonBox: [
      { term: 'Grid', plain: 'The network of wires connecting power stations to homes and businesses.' },
      { term: 'Intermittent', plain: 'Only generating some of the time — solar at night produces nothing.' },
      { term: 'Baseload', plain: 'Steady, always-on generation like nuclear or hydro.' },
    ],
    demoKey: 'energyMix',
    linksTo: [
      { label: 'Open the Energy Ledger', href: '/energy-ledger' },
      { label: 'See the Climate Ledger', href: '/climate-ledger' },
    ],
    quiz: [
      {
        q: 'Why can a country not run purely on solar and wind today?',
        options: [
          'They are too expensive to build',
          'They only generate when the sun shines or wind blows',
          'They are illegal in most countries',
        ],
        answerIdx: 1,
        explanation: 'Solar and wind are cheap but intermittent, so the grid needs something else for calm, dark hours.',
      },
      {
        q: 'Which country generates most of its electricity from nuclear power?',
        options: [
          'France',
          'Poland',
          'Norway',
        ],
        answerIdx: 0,
        explanation: 'France gets roughly two-thirds of its electricity from nuclear — the highest share of any large economy.',
      },
    ],
  },
  {
    id: 'defense',
    module: 'themes',
    order: 19,
    title: 'Who Spends on Defense?',
    emoji: '🛡️',
    minutes: 3,
    analogy: 'Some countries spend a big chunk of their budget on the army — a bit like a family spending most of its money on the biggest lock in the neighbourhood.',
    body: [
      'Defense spending is the money a government spends on its military — soldiers, ships, planes, missiles.',
      'The US spends by far the most in absolute terms (around $900bn a year). But smaller countries surrounded by threats, like Israel or Ukraine, spend a much larger share of their economy.',
      'NATO members promise to spend at least 2% of GDP on defense. That target used to be missed by many; since the Ukraine war most now meet it.',
    ],
    bigIdeas: [
      'Defense spending funds militaries.',
      'Absolute size and % of GDP tell different stories.',
      'NATO\u2019s 2% target is a widely watched benchmark.',
    ],
    jargonBox: [
      { term: 'NATO', plain: 'Military alliance of 32 countries in Europe and North America.' },
      { term: 'Arms race', plain: 'When countries race to build more weapons than their rivals.' },
    ],
    linksTo: [
      { label: 'Open the Defense Ledger', href: '/defense-ledger' },
    ],
    quiz: [
      {
        q: 'What is the NATO defense spending target?',
        options: [
          '1% of GDP',
          '2% of GDP',
          '10% of GDP',
        ],
        answerIdx: 1,
        explanation: 'NATO members aim to spend at least 2% of their GDP on defense.',
      },
      {
        q: 'Which country spends the most on defense in absolute dollars?',
        options: [
          'United States',
          'China',
          'Russia',
        ],
        answerIdx: 0,
        explanation: 'The US spends around $900bn a year, more than the next several countries combined.',
      },
    ],
  },
  {
    id: 'resources',
    module: 'themes',
    order: 17,
    title: 'Oil, Metals & the Stuff We Use',
    emoji: '⛽',
    minutes: 3,
    analogy: 'Everything you use — your phone, the bus you take, the electricity in your house — needed raw materials pulled out of the ground somewhere in the world.',
    body: [
      'Some countries got lucky with natural resources: oil in Saudi Arabia, lithium in Chile, copper in Zambia, cobalt in the Democratic Republic of Congo.',
      'These raw materials matter because modern tech needs them. Every electric car battery, every laptop, every wind turbine uses metals from a small handful of countries.',
      'When one country controls most of a critical resource, it holds serious power. That is why "resource security" is now a topic that shows up in the news alongside AI and defense.',
    ],
    bigIdeas: [
      'Raw materials come from a few key countries.',
      'Modern tech depends on specific metals.',
      'Resource control = geopolitical power.',
    ],
    jargonBox: [
      { term: 'Critical mineral', plain: 'A metal or element that a country decides is vital for its economy or security.' },
      { term: 'OPEC', plain: 'A group of big oil-producing countries that coordinate how much oil to pump.' },
    ],
    linksTo: [
      { label: 'Open the Resource Atlas', href: '/resources' },
    ],
    quiz: [
      {
        q: 'Which country is famous for oil exports?',
        options: [
          'Switzerland',
          'Saudi Arabia',
          'Nepal',
        ],
        answerIdx: 1,
        explanation: 'Saudi Arabia has huge oil reserves and is one of the world\u2019s top oil exporters.',
      },
      {
        q: 'Why do critical minerals matter?',
        options: [
          'They are used to make jewellery only',
          'They power modern tech like batteries and chips',
          'They have no real use anymore',
        ],
        answerIdx: 1,
        explanation: 'Batteries, phones and chips need specific metals from a small group of countries.',
      },
    ],
  },
  {
    id: 'health',
    module: 'themes',
    order: 18,
    title: 'Health & Wealth',
    emoji: '🩺',
    minutes: 4,
    analogy: 'If money bought years of life at a fixed exchange rate, the biggest spender would always live longest. It does not work that way.',
    body: [
      'Richer countries do live longer — but only up to a point. Below roughly $10,000 per person a year, extra income buys big jumps in life expectancy: clean water, vaccines, doctors. Past that, the curve flattens hard.',
      'The United States is the clearest example. It spends far more per person on health than any other country, roughly double the rich-country average, and still has a lower life expectancy than Spain, Japan or Italy, which spend a fraction as much.',
      'What explains the gap is not how much you spend but what you spend it on, and what happens outside the hospital: diet, smoking, road safety, inequality, and whether everyone can actually afford to see a doctor early rather than late.',
    ],
    bigIdeas: [
      'Money buys health, but with sharply diminishing returns.',
      'The US spends the most per person and does not live the longest.',
      'Prevention and access matter more than total spending.',
    ],
    jargonBox: [
      { term: 'Life expectancy', plain: 'How long a baby born today would live on average if current conditions held.' },
      { term: 'Universal coverage', plain: 'A system where everyone can get healthcare without being ruined by the bill.' },
      { term: 'Diminishing returns', plain: 'When each extra pound spent buys less benefit than the last one did.' },
    ],
    linksTo: [
      { label: 'Open the Health Ledger', href: '/health-ledger' },
      { label: 'See the Development Index', href: '/development' },
    ],
    quiz: [
      {
        q: 'What happens to the link between income and life expectancy as countries get rich?',
        options: [
          'It stays equally strong forever',
          'It flattens — extra income buys fewer extra years',
          'It reverses completely',
        ],
        answerIdx: 1,
        explanation: 'The gains are huge at low incomes and then level off sharply once basic health needs are met.',
      },
      {
        q: 'Which country spends the most per person on healthcare?',
        options: [
          'Japan',
          'The United States',
          'Spain',
        ],
        answerIdx: 1,
        explanation: 'The US spends roughly double the rich-country average per person, without the longest lifespans to show for it.',
      },
    ],
  },
  {
    id: 'ai',
    module: 'themes',
    order: 20,
    title: 'The AI Boom',
    emoji: '🤖',
    minutes: 3,
    analogy: 'Imagine having a super-smart study buddy that answers any question, writes essays with you and remembers everything. That\u2019s what modern AI tools try to be.',
    body: [
      'Artificial intelligence (AI) is software that can learn patterns from huge amounts of data. Modern AI models like ChatGPT, Claude and Gemini can chat, write code and analyse images.',
      'Training the biggest AI models is really expensive — billions of dollars and thousands of specialised chips. Only a few companies (mostly in the US and China) can afford it.',
      'AI is already changing school, work and the economy. New laws are trying to keep it safe: the EU AI Act, US executive orders, and safety institutes in the UK and US.',
    ],
    bigIdeas: [
      'AI learns patterns from massive data.',
      'Training the biggest models costs billions.',
      'Governments are writing new rules to keep AI safe.',
    ],
    jargonBox: [
      { term: 'LLM', plain: 'Large Language Model — an AI trained on tons of text to chat and write.' },
      { term: 'GPU', plain: 'A powerful chip originally made for gaming, now used to train AI.' },
    ],
    linksTo: [
      { label: 'Open the AI Ledger', href: '/ai-ledger' },
    ],
    quiz: [
      {
        q: 'What does LLM stand for?',
        options: [
          'Long Language Method',
          'Large Language Model',
          'Learn Language Machine',
        ],
        answerIdx: 1,
        explanation: 'LLM = Large Language Model. Examples: ChatGPT, Claude, Gemini.',
      },
      {
        q: 'Why are only a few companies building the biggest AI models?',
        options: [
          'It requires billions of dollars and specialised chips',
          'AI is illegal in most countries',
          'It is a secret only three people know',
        ],
        answerIdx: 0,
        explanation: 'Training the biggest models needs huge amounts of money and specialised chips (GPUs).',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  // Module 5 — Think Like an Analyst
  // ───────────────────────────────────────────────────────────────────
  {
    id: 'charts',
    module: 'analyst',
    order: 21,
    title: 'Reading a Chart Without Being Fooled',
    emoji: '📊',
    minutes: 4,
    analogy: 'A chart is an argument someone is making with numbers. Most of the persuading happens before you look at a single data point — in the choices about what to show you.',
    body: [
      'The oldest trick is the truncated axis. Start the y-axis at 95 instead of 0 and a 2% wobble becomes a cliff. The numbers are completely honest; the picture is not. Always check where the bottom of the axis sits.',
      'Second is the cherry-picked window. Pick a start date at the lowest point and everything after it looks like a boom. Pick the peak instead and the same series looks like a collapse. If a chart starts at an oddly specific year, ask what the year before looked like.',
      'Third is totals versus per person. China emits more CO₂ than any other country and also has 1.4 billion people. Per person, Qatar emits several times more. Neither number is wrong, but they answer different questions — so notice which one you are being shown.',
    ],
    bigIdeas: [
      'A truncated y-axis makes small changes look dramatic.',
      'The start date can flip a story from boom to bust.',
      'Totals and per-person figures answer different questions.',
    ],
    jargonBox: [
      { term: 'Truncated axis', plain: 'A chart whose axis does not start at zero, exaggerating the ups and downs.' },
      { term: 'Cherry-picking', plain: 'Choosing the time window that best supports the point you already wanted to make.' },
      { term: 'Per capita', plain: 'Per person — the total divided by the population.' },
    ],
    demoKey: 'chartTricks',
    workshopKey: 'chartGame',
    workshopTitle: 'Workshop: spot the misleading chart',
    linksTo: [
      { label: 'Read our methodology', href: '/methodology' },
    ],
    quiz: [
      {
        q: 'A line chart makes a 2% change look enormous. What should you check first?',
        options: [
          'Whether the y-axis starts at zero',
          'The colour of the line',
          'How many data points there are',
        ],
        answerIdx: 0,
        explanation: 'A truncated axis zooms in on a tiny range, turning small wobbles into dramatic cliffs.',
      },
      {
        q: 'Why do totals and per-person figures often rank countries differently?',
        options: [
          'One of them is always wrong',
          'Big populations produce big totals even with modest per-person figures',
          'Per-person numbers exclude poor countries',
        ],
        answerIdx: 1,
        explanation: 'Population size drives totals, so large countries top total rankings while small, intensive ones top per-person ones.',
      },
      {
        q: 'A chart of house prices starts in 2009. Why might that be suspicious?',
        options: [
          'No data existed before 2009',
          '2009 was near the bottom of a crash, which makes everything after look like a boom',
          'Charts always have to start in 2000',
        ],
        answerIdx: 1,
        explanation: 'Starting at a trough flatters the trend. Always ask what the years just before the window looked like.',
      },
    ],
  },
  {
    id: 'correlation',
    module: 'analyst',
    order: 22,
    title: 'Correlation vs Causation',
    emoji: '🔗',
    minutes: 4,
    analogy: 'Ice cream sales and drowning deaths rise together every summer. Ice cream does not cause drowning. Hot weather causes both.',
    body: [
      'Correlation means two things move together. It is measured with r, a number from -1 to +1. An r of +1 means they move in perfect lockstep, -1 means perfectly opposite, and 0 means no linear relationship at all.',
      'Causation means one thing actually makes the other happen. Correlation is evidence for causation but never proof, because three other explanations exist: coincidence, reverse causation (B actually causes A), or a lurking third factor driving both — like the hot weather above.',
      'With enough datasets you can always find a strong-looking correlation between nonsense pairs. Cheese consumption tracks bedsheet-tangling deaths at r = 0.95. The fix is to ask for a plausible mechanism before you believe the number, not after.',
    ],
    bigIdeas: [
      'r measures how tightly two series move together, from -1 to +1.',
      'A third factor can drive both without either causing the other.',
      'Search enough data and strong spurious correlations are guaranteed.',
    ],
    jargonBox: [
      { term: 'r', plain: 'The correlation coefficient: -1 (perfect opposites) to +1 (perfect lockstep), 0 = no link.' },
      { term: 'Confounder', plain: 'A hidden third factor that causes both things you are comparing.' },
      { term: 'Spurious correlation', plain: 'Two unrelated series that happen to move together by chance.' },
    ],
    demoKey: 'correlation',
    linksTo: [
      { label: 'Try the Correlation Lab', href: '/correlation-lab' },
    ],
    quiz: [
      {
        q: 'What does a correlation of r = 0 mean?',
        options: [
          'The two series have no linear relationship',
          'The two series are identical',
          'One series causes the other',
        ],
        answerIdx: 0,
        explanation: 'r = 0 means knowing one value tells you nothing about the other, at least in a straight-line sense.',
      },
      {
        q: 'Ice cream sales and drowning deaths both peak in summer. What is going on?',
        options: [
          'Ice cream causes drowning',
          'Hot weather is a third factor driving both',
          'Drowning causes ice cream sales',
        ],
        answerIdx: 1,
        explanation: 'This is a confounder: heat independently drives both swimming and ice cream buying.',
      },
      {
        q: 'You find r = 0.95 between two unrelated datasets. What should you conclude?',
        options: [
          'You have discovered a hidden law of nature',
          'Probably a coincidence — check for a plausible mechanism before believing it',
          'One definitely causes the other because r is so high',
        ],
        answerIdx: 1,
        explanation: 'Test enough pairs and high correlations appear by chance. A believable mechanism is what separates signal from noise.',
      },
    ],
  },
  {
    id: 'provenance',
    module: 'analyst',
    order: 23,
    title: 'Where Does Data Come From?',
    emoji: '🗂️',
    minutes: 4,
    analogy: 'Every number on this site has a backstory: someone decided what to count, how to count it, and what to do about the bits they could not reach.',
    body: [
      'Numbers come in three flavours and they are not equal. Measured data is counted directly, like a central bank\u2019s own interest rate. Estimated data is inferred from samples or models, like the GDP of a country with a large cash economy. Projected data is a forecast — a guess with maths attached.',
      'Data also gets revised. A first GDP estimate is published weeks after the quarter ends and is routinely corrected by a few tenths of a percent months later. Headlines are written off the first number; the truth arrives quietly afterwards.',
      'That is why two reputable sources can publish different figures for the same thing. The IMF, World Bank and OECD use different methods, different exchange-rate conversions and different vintages. The right response is not to pick the one you like — it is to check the definition and the date.',
    ],
    bigIdeas: [
      'Measured, estimated and projected are three very different things.',
      'Early figures get revised; the first print is rarely the final one.',
      'Sources disagree because their methods and vintages differ.',
    ],
    jargonBox: [
      { term: 'Vintage', plain: 'Which release of a number you are looking at — first estimate, revised, or final.' },
      { term: 'PPP', plain: 'Purchasing power parity — adjusting for the fact that the same money buys more in some countries.' },
      { term: 'Provenance', plain: 'The documented trail of where a number came from and how it was produced.' },
    ],
    linksTo: [
      { label: 'See every data source we use', href: '/data-sources' },
      { label: 'Read our methodology', href: '/methodology' },
    ],
    quiz: [
      {
        q: 'What is the difference between measured and estimated data?',
        options: [
          'Measured is counted directly; estimated is inferred from samples or models',
          'Estimated data is always wrong',
          'They mean the same thing',
        ],
        answerIdx: 0,
        explanation: 'Estimated figures are not worthless, but they carry more uncertainty than something counted directly.',
      },
      {
        q: 'Why might the IMF and the World Bank publish different GDP figures for the same country?',
        options: [
          'One of them is not checking its work',
          'They use different methods, conversions and release dates',
          'GDP is impossible to measure',
        ],
        answerIdx: 1,
        explanation: 'Different methodology and different vintages produce different numbers from the same underlying reality.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Wrap-up quiz — 10 questions drawn across all modules for the
// end-of-course assessment. Passing threshold defined in the wrap-up
// component (70%).
// ─────────────────────────────────────────────────────────────────────
export const WRAP_UP_QUIZ: QuizQuestion[] = [
  {
    q: 'What are the three jobs of money?',
    options: [
      'Trade, store value, measure value',
      'Print, borrow, spend',
      'Save, invest, tax',
    ],
    answerIdx: 0,
    explanation: 'Money helps us trade, keeps value for later, and measures how much things cost.',
  },
  {
    q: 'Inflation of 5% means...',
    options: [
      'Prices are 5% lower than last year',
      'Prices are on average 5% higher than last year',
      'The economy shrank by 5%',
    ],
    answerIdx: 1,
    explanation: 'Inflation is the average rise in prices. 5% means things cost about 5% more.',
  },
  {
    q: 'Why do central banks raise interest rates?',
    options: [
      'To slow high inflation',
      'To weaken the currency',
      'To pay off debt',
    ],
    answerIdx: 0,
    explanation: 'Higher rates cool spending and slow price rises.',
  },
  {
    q: 'What does GDP measure?',
    options: [
      'How much a country owes',
      'The value of all goods and services a country produces',
      'The number of billionaires in a country',
    ],
    answerIdx: 1,
    explanation: 'GDP = total value of everything produced in a country in a year.',
  },
  {
    q: 'During a recession, what does unemployment typically do?',
    options: [
      'Falls immediately',
      'Keeps rising even after GDP has stopped falling',
      'Stays completely flat',
    ],
    answerIdx: 1,
    explanation: 'Unemployment is a lagging indicator — firms keep cutting jobs after the economy has bottomed out.',
  },
  {
    q: 'How does a bank mainly make money?',
    options: [
      'By charging borrowers more interest than it pays savers',
      'By printing its own banknotes',
      'By keeping every deposit locked in a vault',
    ],
    answerIdx: 0,
    explanation: 'The gap between interest charged on loans and interest paid on deposits is a bank\u2019s core profit.',
  },
  {
    q: 'What is a tariff?',
    options: [
      'A discount at customs',
      'A tax on imported goods',
      'A currency exchange fee',
    ],
    answerIdx: 1,
    explanation: 'Tariffs are taxes on imports.',
  },
  {
    q: 'Ice cream sales and drowning deaths rise together every summer. Why?',
    options: [
      'Ice cream causes drowning',
      'Hot weather is a third factor driving both',
      'It proves correlation equals causation',
    ],
    answerIdx: 1,
    explanation: 'A confounder — heat independently drives both swimming and ice cream buying. Correlation is not causation.',
  },
  {
    q: 'What does "net zero" mean?',
    options: [
      'Zero people employed',
      'Any CO₂ released is balanced by CO₂ removed',
      'No banks left in a country',
    ],
    answerIdx: 1,
    explanation: 'Net zero balances CO₂ emissions with removals.',
  },
  {
    q: 'What does LLM stand for?',
    options: [
      'Local Loan Manager',
      'Large Language Model',
      'Long Loop Machine',
    ],
    answerIdx: 1,
    explanation: 'LLM = Large Language Model — the class of AI behind ChatGPT / Claude / Gemini.',
  },
];

export function lessonsByModule(id: ModuleId): Lesson[] {
  return LESSONS.filter(l => l.module === id).sort((a, b) => a.order - b.order);
}

export const TOTAL_LESSONS = LESSONS.length;
