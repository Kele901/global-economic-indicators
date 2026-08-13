// Curated curriculum for the /learn starter guide (ages 13+). Fifteen
// lessons across four modules, plus a ten-question wrap-up quiz. Every
// paragraph is intentionally short (2-3 sentences), every technical
// term is either avoided or explained inline, and every lesson opens
// with a real-world analogy so a teenager has something concrete to
// hang the idea on. Nothing here is data-driven — the interactive
// demos use hardcoded illustrative numbers so the guide always
// renders even if upstream APIs are down.

export type ModuleId = 'money' | 'economy' | 'countries' | 'themes';

export type DemoKey =
  | 'inflation'
  | 'interest'
  | 'gdp'
  | 'trade'
  | 'debt'
  | 'currency';

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
  { id: 'themes',    label: 'Big Global Themes',  emoji: '🚀', blurb: 'Climate, defense, natural resources and the AI boom.' },
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
    id: 'currency',
    module: 'money',
    order: 4,
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
    order: 5,
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
    order: 6,
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
    id: 'debt',
    module: 'economy',
    order: 7,
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
    id: 'development',
    module: 'economy',
    order: 8,
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
    order: 9,
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
    order: 10,
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
    order: 11,
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
    order: 12,
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
    id: 'defense',
    module: 'themes',
    order: 13,
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
    order: 14,
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
    id: 'ai',
    module: 'themes',
    order: 15,
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
    q: 'Who counts as unemployed?',
    options: [
      'Anyone without a job',
      'Anyone wanting a job and actively looking',
      'Only kids in school',
    ],
    answerIdx: 1,
    explanation: 'Only active job-seekers count as unemployed.',
  },
  {
    q: 'What is a bond?',
    options: [
      'A promise to pay money back later, sold by a government or company',
      'A type of stock',
      'A tax on savings',
    ],
    answerIdx: 0,
    explanation: 'A bond is a formal IOU that pays back the money plus interest.',
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
    q: 'What is a remittance?',
    options: [
      'A birthday gift',
      'Money migrants send home to their family',
      'A visa document',
    ],
    answerIdx: 1,
    explanation: 'Remittances are money migrants send back home.',
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
