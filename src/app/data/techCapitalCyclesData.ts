export interface GreatSurge {
  id: number;
  name: string;
  period: string;
  startYear: number;
  endYear: number;
  bigBang: string;
  bigBangYear: number;
  turningPoint: string;
  turningPointYear: number;
  keyTechnologies: string[];
  keyFinancialEvents: string[];
  installationPeriod: string;
  deploymentPeriod: string;
  description: string;
  goldenAge: string;
  color: string;
  societalImpact: SocietalImpact;
  institutionalResponse: InstitutionalResponse;
  keyFigures: KeyFigure[];
  paradigmShift: ParadigmShift;
}

export interface SocietalImpact {
  employmentShift: string;
  urbanisation: string;
  inequalityPattern: string;
  socialMovements: string[];
  livingStandards: string;
  culturalChange: string;
}

export interface InstitutionalResponse {
  regulations: string[];
  newInstitutions: string[];
  financialReforms: string[];
  keyLegislation: string;
}

export interface KeyFigure {
  name: string;
  role: string;
  contribution: string;
}

export interface ParadigmShift {
  oldParadigm: string;
  newParadigm: string;
  transportInfra: string;
  energySource: string;
  communicationMedium: string;
  organisationalForm: string;
  geographicScope: string;
}

export interface InequalityDataPoint {
  year: number;
  topSharePct: number;
  surgeId: number;
  phase: string;
}

export interface ContemporaryParallel {
  historicalEvent: string;
  historicalSurge: number;
  modernEquivalent: string;
  analysis: string;
  status: 'playing-out' | 'emerging' | 'potential' | 'debated';
}

export interface AdoptionCurve {
  technology: string;
  surgeId: number;
  color: string;
  data: { year: number; adoptionPct: number }[];
}

export interface FinancialBubble {
  name: string;
  surgeId: number;
  peakYear: number;
  crashYear: number;
  peakIndex: number;
  troughIndex: number;
  declinePct: number;
  recoveryYear: number;
  description: string;
}

export interface KondratievWave {
  decade: number;
  growthRate: number;
  innovationIntensity: number;
  waveName: string;
  phase: 'upswing' | 'downswing';
}

export interface CapitalFlowPoint {
  year: number;
  financialCapital: number;
  productionCapital: number;
  surgeId: number;
  phase: 'irruption' | 'frenzy' | 'turning' | 'synergy' | 'maturity' | 'between';
}

export interface AcademicSource {
  author: string;
  year: number;
  title: string;
  keyInsight: string;
  category: 'primary' | 'supporting';
}

export const GREAT_SURGES: GreatSurge[] = [
  {
    id: 1,
    name: 'The Industrial Revolution',
    period: '1771–1829',
    startYear: 1771,
    endYear: 1829,
    bigBang: "Arkwright's mill opens in Cromford",
    bigBangYear: 1771,
    turningPoint: 'Canal Mania collapse',
    turningPointYear: 1797,
    keyTechnologies: ['Mechanized cotton industry', 'Wrought iron', 'Water-powered machinery', 'Canals & waterways'],
    keyFinancialEvents: ['Canal Mania (1790s)', 'Country bank expansion', 'Crisis of 1797'],
    installationPeriod: '1771–1797',
    deploymentPeriod: '1798–1829',
    description: 'The first technological revolution was centred on the mechanisation of the cotton industry in Britain. Water power and iron enabled factory production, while canals provided the transport infrastructure. Financial capital poured into canal schemes, creating the first modern speculative bubble.',
    goldenAge: 'Stable growth of factory system, urbanisation begins, British industrial supremacy established.',
    color: '#8B4513',
    societalImpact: {
      employmentShift: 'Massive migration from agricultural labour to factory work. Hand-loom weavers displaced by power looms. Child labour widespread in early factories.',
      urbanisation: 'New industrial towns (Manchester, Birmingham, Leeds) grew from villages to cities. Manchester\'s population increased 600% between 1771 and 1831.',
      inequalityPattern: 'Sharp increase during installation as factory owners accumulated wealth while wages lagged. The "Engelsian pause" — real wages stagnated for decades while GDP grew.',
      socialMovements: ['Luddite movement (1811–1816)', 'Combination Acts restricting unions', 'Early cooperative movement', 'Sunday school movement'],
      livingStandards: 'Debated: GDP per capita rose but urban living conditions deteriorated. Life expectancy in industrial cities fell below rural areas until sanitary reforms.',
      culturalChange: 'The concept of "the factory" and industrial time discipline fundamentally altered the rhythm of daily life. Romantic movement emerged partly as a reaction to industrialisation.',
    },
    institutionalResponse: {
      regulations: ['Factory Acts (1802, 1819) — first limits on child labour', 'Corn Laws debate reshaping trade policy'],
      newInstitutions: ['Modern banking system expansion', 'Joint-stock company law reforms', 'Patent system formalised'],
      financialReforms: ['Bank of England\'s evolving role as lender of last resort', 'Country bank regulation after 1797 crisis'],
      keyLegislation: 'Combination Acts (1799–1800) banning worker organisation; later repealed 1824, beginning the long arc of labour rights.',
    },
    keyFigures: [
      { name: 'Richard Arkwright', role: 'Industrialist', contribution: 'Pioneered the factory system with water-powered spinning frames' },
      { name: 'James Watt', role: 'Engineer', contribution: 'Improved the steam engine, making it practical for industrial use' },
      { name: 'Adam Smith', role: 'Economist', contribution: 'Published "The Wealth of Nations" (1776), providing the intellectual framework for industrial capitalism' },
    ],
    paradigmShift: {
      oldParadigm: 'Agrarian/mercantile economy, guild-based craft production',
      newParadigm: 'Factory-based mass production of textiles and iron goods',
      transportInfra: 'Canals and turnpike roads',
      energySource: 'Water power (transitioning to coal)',
      communicationMedium: 'Printed press, postal system',
      organisationalForm: 'Owner-managed factories, partnerships',
      geographicScope: 'Regional (centred on British Midlands and North)',
    },
  },
  {
    id: 2,
    name: 'Age of Steam & Railways',
    period: '1829–1873',
    startYear: 1829,
    endYear: 1873,
    bigBang: 'Rocket steam locomotive trial at Rainhill',
    bigBangYear: 1829,
    turningPoint: 'Railway Mania collapse',
    turningPointYear: 1848,
    keyTechnologies: ['Steam engines', 'Railways', 'Iron & coal mining', 'Telegraph', 'Universal postal service'],
    keyFinancialEvents: ['Railway Mania (1840s)', 'Joint-stock company proliferation', 'Panic of 1847'],
    installationPeriod: '1829–1848',
    deploymentPeriod: '1849–1873',
    description: 'Steam power and railways transformed geography, enabling national markets. The telegraph provided the first instantaneous communication. Railway Mania saw massive speculative investment, followed by a crash that left behind valuable infrastructure.',
    goldenAge: 'Victorian prosperity, global trade expansion via railways and steamships, the Great Exhibition of 1851.',
    color: '#4A6741',
    societalImpact: {
      employmentShift: 'Railways created entirely new occupations (engineers, signalmen, porters) and destroyed coaching industry jobs. First large-scale employment of professional managers.',
      urbanisation: 'Railway towns like Crewe and Swindon built from nothing. London became a commuter city for the first time. "Railway suburbs" reshaped urban geography.',
      inequalityPattern: 'Railway investment initially concentrated wealth among promoters and speculators. After the crash, employment in railway operations spread prosperity more broadly during the golden age.',
      socialMovements: ['Chartist movement (1838–1857)', 'Ten Hours Movement', 'Cooperative movement expansion', 'Repeal of the Corn Laws (1846)'],
      livingStandards: 'Significant improvement during deployment. Cheap rail transport reduced food costs, expanded labour markets, and enabled seaside holidays for the working class for the first time.',
      culturalChange: 'Railways unified national time (Railway Time adopted 1847), created the daily newspaper, enabled the rise of professional sport, and fundamentally altered the human experience of speed and distance.',
    },
    institutionalResponse: {
      regulations: ['Railway Regulation Act (1844)', 'Companies Act (1844) — first modern corporate law', 'Limited Liability Act (1855)'],
      newInstitutions: ['Railway Clearing House (standardised inter-company operations)', 'Professional engineering institutions', 'Modern stock exchange regulation'],
      financialReforms: ['Bank Charter Act (1844) — reformed money supply', 'Development of modern auditing practices', 'Insurance industry regulation'],
      keyLegislation: 'Companies Act (1862) — established the modern limited liability company, enabling the pooling of capital from many small investors into large enterprises.',
    },
    keyFigures: [
      { name: 'George & Robert Stephenson', role: 'Engineers', contribution: 'Built the first inter-city railway (Liverpool & Manchester, 1830) and developed the standard gauge' },
      { name: 'Isambard Kingdom Brunel', role: 'Engineer', contribution: 'Built the Great Western Railway, bridges, tunnels, and steamships — epitomised the age of engineering ambition' },
      { name: 'George Hudson', role: 'Financier', contribution: '"The Railway King" — exemplified the speculative frenzy, eventually ruined in the crash' },
    ],
    paradigmShift: {
      oldParadigm: 'Local markets, horse-drawn transport, regional economies',
      newParadigm: 'National markets connected by railways and telegraph, mass migration of goods and people',
      transportInfra: 'Railways, steamships, improved harbours',
      energySource: 'Coal and steam',
      communicationMedium: 'Electric telegraph, penny post',
      organisationalForm: 'Joint-stock companies, professional management',
      geographicScope: 'National, with growing international trade',
    },
  },
  {
    id: 3,
    name: 'Age of Steel, Electricity & Engineering',
    period: '1875–1918',
    startYear: 1875,
    endYear: 1918,
    bigBang: 'Carnegie Bessemer steel plant in Pittsburgh',
    bigBangYear: 1875,
    turningPoint: 'Panic of 1893 & Argentine crisis',
    turningPointYear: 1893,
    keyTechnologies: ['Cheap steel', 'Electricity', 'Heavy chemistry', 'Civil engineering', 'Copper wire & cables', 'Telephone'],
    keyFinancialEvents: ['Gilded Age speculation', 'Trust formation', 'Panic of 1893', 'Banking concentration'],
    installationPeriod: '1875–1893',
    deploymentPeriod: '1894–1918',
    description: 'Cheap steel, electrification, and heavy engineering enabled the age of great infrastructure. Giant corporations and trusts emerged. The Gilded Age saw enormous wealth concentration and speculative excess before the Panic of 1893 forced restructuring.',
    goldenAge: 'Progressive Era reforms, electrification of cities, global submarine cable networks, Belle Époque prosperity.',
    color: '#B8860B',
    societalImpact: {
      employmentShift: 'Rise of the professional engineer and industrial scientist. Factory employment grew massively in steel, chemicals, and electrical equipment. First white-collar office workers appeared at scale.',
      urbanisation: 'Electric streetcars and elevators enabled vertical (skyscrapers) and horizontal (suburbs) urban expansion. Cities like Chicago rebuilt in steel and glass after fires.',
      inequalityPattern: 'Extreme inequality during the Gilded Age — Rockefeller, Carnegie, and Vanderbilt accumulated unprecedented fortunes. The top 1% held ~45% of national wealth by 1890. Progressive Era reforms reduced concentration.',
      socialMovements: ['Labour movement and early unions (Knights of Labor, AFL)', 'Progressive movement', 'Populist Party', 'Muckraking journalism', 'Women\'s suffrage movement gained momentum'],
      livingStandards: 'Electric lighting transformed urban life. Refrigeration improved food safety. But industrial workers faced dangerous conditions — Triangle Shirtwaist Fire (1911) symbolised the costs.',
      culturalChange: 'Electric light extended the day, transforming entertainment (theatre, cinema). The telephone created new social conventions. Department stores created modern consumer culture.',
    },
    institutionalResponse: {
      regulations: ['Sherman Antitrust Act (1890)', 'Interstate Commerce Act (1887)', 'Pure Food and Drug Act (1906)', 'Clayton Antitrust Act (1914)'],
      newInstitutions: ['Federal Reserve System (1913)', 'Federal Trade Commission (1914)', 'Bureau of Labor Statistics', 'Modern research university (Johns Hopkins model)'],
      financialReforms: ['Creation of the Federal Reserve as central bank', 'Federal income tax (16th Amendment, 1913)', 'Trust-busting under Roosevelt and Taft'],
      keyLegislation: 'Federal Reserve Act (1913) — created a central banking system to prevent the kind of financial panics that had punctuated the Gilded Age, establishing the institutional foundation for 20th-century monetary policy.',
    },
    keyFigures: [
      { name: 'Andrew Carnegie', role: 'Industrialist', contribution: 'Built the largest steel empire, pioneered vertical integration, later became history\'s greatest philanthropist' },
      { name: 'Thomas Edison', role: 'Inventor/Entrepreneur', contribution: 'Created the electric light and the first electricity distribution system — and the business model to commercialise them' },
      { name: 'J.P. Morgan', role: 'Financier', contribution: 'Personally organised bailouts of the financial system (1893, 1907), demonstrating the need for a central bank' },
      { name: 'Nikola Tesla', role: 'Inventor', contribution: 'Developed alternating current (AC) systems that won the "War of Currents" and enabled long-distance power transmission' },
    ],
    paradigmShift: {
      oldParadigm: 'Iron-based industry, gas lighting, individual entrepreneurship',
      newParadigm: 'Steel-framed construction, electrified production, corporate trusts and holding companies',
      transportInfra: 'Steel railways (transcontinental), electric streetcars, early automobiles',
      energySource: 'Electricity (coal-generated), early petroleum',
      communicationMedium: 'Telephone, submarine telegraph cables, mass-circulation newspapers',
      organisationalForm: 'Giant corporations, trusts, holding companies, professional management hierarchies',
      geographicScope: 'Continental (US transcontinental, European empires) and nascent global',
    },
  },
  {
    id: 4,
    name: 'Age of Oil, Automobiles & Mass Production',
    period: '1908–1974',
    startYear: 1908,
    endYear: 1974,
    bigBang: "Ford's Model T & assembly line",
    bigBangYear: 1908,
    turningPoint: '1929 Wall Street Crash',
    turningPointYear: 1929,
    keyTechnologies: ['Automobiles', 'Oil & petrochemicals', 'Mass production', 'Home electrical appliances', 'Highways & airports', 'Television'],
    keyFinancialEvents: ['Roaring Twenties speculation', '1929 Crash', 'Great Depression', 'Bretton Woods (1944)'],
    installationPeriod: '1908–1929',
    deploymentPeriod: '1930–1974',
    description: 'Ford\'s assembly line and cheap oil created mass production and mass consumption. The Roaring Twenties saw a spectacular financial bubble. After the 1929 crash and Great Depression, New Deal regulation and post-war Bretton Woods enabled the longest golden age in capitalist history.',
    goldenAge: 'Post-war boom (1945–1973): suburbanisation, middle-class expansion, welfare states, Keynesian full employment.',
    color: '#1E3A5F',
    societalImpact: {
      employmentShift: 'Assembly line created the high-wage industrial worker. Ford\'s $5/day wage (1914) was revolutionary. Post-war deployment created the mass middle class — manufacturing jobs with pensions, healthcare, and union protections.',
      urbanisation: 'Suburbanisation was THE defining spatial transformation. Levittown (1947) and the interstate highway system (1956) created the American suburb. Similar patterns in Europe (new towns, banlieues).',
      inequalityPattern: 'The "Great Compression" (1929–1970s): inequality fell dramatically after the crash. Top income shares halved. The golden age produced the most equal income distribution in modern capitalist history.',
      socialMovements: ['Labour movement (UAW, CIO)', 'New Deal coalition', 'Civil Rights Movement', 'Women entering the workforce (WWII)', 'Consumer rights movement', 'Environmental movement (late period)'],
      livingStandards: 'Dramatic improvement. Home ownership, automobile ownership, and household appliances became near-universal in developed nations. Life expectancy surged with antibiotics and public health systems.',
      culturalChange: 'Television created mass culture. The automobile created teenage culture, drive-in cinemas, shopping malls, and fast food. Rock and roll, Hollywood\'s golden age, and the space race defined cultural aspirations.',
    },
    institutionalResponse: {
      regulations: ['Glass-Steagall Act (1933) — separated commercial and investment banking', 'Securities Act (1933) & Exchange Act (1934)', 'Wagner Act (1935) — guaranteed union rights', 'Social Security Act (1935)'],
      newInstitutions: ['SEC (Securities and Exchange Commission)', 'FDIC (Federal Deposit Insurance)', 'Bretton Woods institutions (IMF, World Bank, 1944)', 'GATT (1947) — predecessor to WTO', 'NASA (1958)'],
      financialReforms: ['Bretton Woods fixed exchange rate system', 'Keynesian demand management', 'Marshall Plan (1948)', 'GI Bill (1944)'],
      keyLegislation: 'Glass-Steagall Act (1933) and Bretton Woods Agreement (1944) — together they created the regulatory framework for the most stable and broadly prosperous period in capitalist history, lasting until the 1970s.',
    },
    keyFigures: [
      { name: 'Henry Ford', role: 'Industrialist', contribution: 'Assembly line mass production and the $5 day — simultaneously created the product and the consumer who could afford it' },
      { name: 'John Maynard Keynes', role: 'Economist', contribution: 'Provided the intellectual framework (demand management, government intervention) that shaped the deployment golden age' },
      { name: 'Franklin D. Roosevelt', role: 'Political leader', contribution: 'New Deal regulations after the 1929 crash — the quintessential institutional response at the turning point' },
      { name: 'Alfred P. Sloan', role: 'Manager', contribution: 'Created the modern multi-divisional corporation at General Motors, the organisational form of the era' },
    ],
    paradigmShift: {
      oldParadigm: 'Craft production, local energy, rail-dependent logistics',
      newParadigm: 'Mass production, mass consumption, oil-based energy, highway-dependent suburbia',
      transportInfra: 'Highways, airports, containerised shipping',
      energySource: 'Petroleum and natural gas, hydroelectric and nuclear',
      communicationMedium: 'Radio, television, telephone networks',
      organisationalForm: 'Multi-divisional corporation (M-form), vertically integrated conglomerates',
      geographicScope: 'Global (Bretton Woods trade system, multinational corporations)',
    },
  },
  {
    id: 5,
    name: 'Age of Information & Telecommunications',
    period: '1971–present',
    startYear: 1971,
    endYear: 2030,
    bigBang: 'Intel microprocessor announced',
    bigBangYear: 1971,
    turningPoint: 'Dot-com crash & Enron scandal',
    turningPointYear: 2001,
    keyTechnologies: ['Microprocessors', 'Software', 'Internet', 'Mobile telecommunications', 'Cloud computing', 'Artificial Intelligence'],
    keyFinancialEvents: ['Dot-com bubble (1995–2000)', 'Dot-com crash (2000–2002)', '2008 Financial crisis', 'Crypto bubble (2017/2021)', 'AI investment surge (2023–)'],
    installationPeriod: '1971–2001',
    deploymentPeriod: '2002–present (ongoing)',
    description: 'The microprocessor launched the information revolution. The internet created a new paradigm for communication and commerce. The dot-com bubble was the classic frenzy of financial capital rushing into new technology. The question now is whether a true deployment golden age has begun or whether further institutional reform is needed.',
    goldenAge: 'Potential: green transition, AI-augmented productivity, platform-enabled services — depends on institutional alignment (Perez).',
    color: '#7C3AED',
    societalImpact: {
      employmentShift: 'Hollowing out of middle-skill jobs (manufacturing, clerical) as routine work is automated. Rise of "knowledge workers", gig economy, and platform labour. Growing polarisation between high-skill/high-pay and low-skill/low-pay employment.',
      urbanisation: 'Tech hubs (Silicon Valley, Shenzhen, Bangalore) became global cities. Remote work (accelerated by COVID-19) began to decouple work from location for the first time. "Superstar cities" vs. declining industrial regions.',
      inequalityPattern: 'Sharp rise in inequality since the 1980s, mirroring the frenzy phase pattern. Tech billionaires (Bezos, Zuckerberg, Musk) echo the wealth concentration of the Gilded Age. The question: will the deployment period produce another Great Compression?',
      socialMovements: ['Open Source movement', 'Occupy Wall Street (2011)', 'Platform worker organising', 'Data privacy and digital rights movement', 'Climate movement (Fridays for Future)', 'AI ethics and alignment movement'],
      livingStandards: 'Information access democratised globally via smartphones. But housing costs, healthcare costs, and student debt have risen sharply in developed nations. The paradox of abundant information alongside growing economic insecurity.',
      culturalChange: 'Social media transformed public discourse, identity formation, and political mobilisation. Streaming replaced broadcast media. The attention economy became a defining feature of daily life. AI is beginning to reshape creative professions.',
    },
    institutionalResponse: {
      regulations: ['Sarbanes-Oxley Act (2002) — post-Enron corporate governance', 'Dodd-Frank Act (2010) — post-2008 financial reform', 'GDPR (2018) — data privacy', 'EU AI Act (2024)', 'Antitrust actions against Big Tech (ongoing)'],
      newInstitutions: ['World Wide Web Consortium (W3C)', 'ICANN (internet governance)', 'Various fintech regulators', 'AI safety institutes (UK, US, 2023–24)'],
      financialReforms: ['Quantitative easing programs (2008–)', 'Crypto/DeFi regulatory frameworks (emerging)', 'Central bank digital currency research', 'ESG/sustainable finance frameworks'],
      keyLegislation: 'Still in formation. Perez argues the 5th surge\'s institutional turning point is incomplete — unlike the New Deal after 1929, there has been no comprehensive regulatory reset to channel the ICT revolution toward broadly shared prosperity. The 2008 crisis and AI disruption may be catalysts.',
    },
    keyFigures: [
      { name: 'Gordon Moore', role: 'Semiconductor pioneer', contribution: 'Moore\'s Law predicted the exponential trajectory of computing power that has driven the entire surge' },
      { name: 'Tim Berners-Lee', role: 'Inventor', contribution: 'Created the World Wide Web (1989) — the "big bang" application that turned the internet from a research tool into a universal platform' },
      { name: 'Steve Jobs', role: 'Entrepreneur', contribution: 'Personal computer (Apple II, Mac), then smartphone (iPhone 2007) — made digital technology a consumer and cultural phenomenon' },
      { name: 'Jeff Bezos', role: 'Entrepreneur', contribution: 'Amazon exemplified the platform business model that defines the deployment period\'s organisational form' },
    ],
    paradigmShift: {
      oldParadigm: 'Mass production, centralised hierarchies, oil-based energy, broadcast media',
      newParadigm: 'Flexible production, network organisations, digital platforms, renewable energy (emerging)',
      transportInfra: 'Internet backbone, cloud data centres, 5G networks, potentially autonomous vehicles',
      energySource: 'Transitioning: oil/gas → solar, wind, batteries (the "green" extension of the ICT paradigm)',
      communicationMedium: 'Internet, mobile, social media, AI assistants',
      organisationalForm: 'Platform companies, network enterprises, open-source communities, gig economy',
      geographicScope: 'Truly global — digital services cross borders instantly; but also fragmenting (tech sovereignty, splinternet)',
    },
  },
];

export const CAPITAL_FLOW_PHASES: CapitalFlowPoint[] = [
  // 1st Surge: Industrial Revolution
  { year: 1771, financialCapital: 25, productionCapital: 75, surgeId: 1, phase: 'irruption' },
  { year: 1780, financialCapital: 40, productionCapital: 60, surgeId: 1, phase: 'irruption' },
  { year: 1790, financialCapital: 70, productionCapital: 30, surgeId: 1, phase: 'frenzy' },
  { year: 1795, financialCapital: 80, productionCapital: 20, surgeId: 1, phase: 'frenzy' },
  { year: 1797, financialCapital: 55, productionCapital: 45, surgeId: 1, phase: 'turning' },
  { year: 1805, financialCapital: 30, productionCapital: 70, surgeId: 1, phase: 'synergy' },
  { year: 1815, financialCapital: 25, productionCapital: 75, surgeId: 1, phase: 'synergy' },
  { year: 1825, financialCapital: 30, productionCapital: 70, surgeId: 1, phase: 'maturity' },
  // 2nd Surge: Steam & Railways
  { year: 1829, financialCapital: 30, productionCapital: 70, surgeId: 2, phase: 'irruption' },
  { year: 1835, financialCapital: 50, productionCapital: 50, surgeId: 2, phase: 'irruption' },
  { year: 1840, financialCapital: 70, productionCapital: 30, surgeId: 2, phase: 'frenzy' },
  { year: 1845, financialCapital: 85, productionCapital: 15, surgeId: 2, phase: 'frenzy' },
  { year: 1848, financialCapital: 50, productionCapital: 50, surgeId: 2, phase: 'turning' },
  { year: 1855, financialCapital: 30, productionCapital: 70, surgeId: 2, phase: 'synergy' },
  { year: 1865, financialCapital: 25, productionCapital: 75, surgeId: 2, phase: 'synergy' },
  { year: 1873, financialCapital: 35, productionCapital: 65, surgeId: 2, phase: 'maturity' },
  // 3rd Surge: Steel & Electricity
  { year: 1875, financialCapital: 35, productionCapital: 65, surgeId: 3, phase: 'irruption' },
  { year: 1882, financialCapital: 55, productionCapital: 45, surgeId: 3, phase: 'irruption' },
  { year: 1888, financialCapital: 75, productionCapital: 25, surgeId: 3, phase: 'frenzy' },
  { year: 1892, financialCapital: 82, productionCapital: 18, surgeId: 3, phase: 'frenzy' },
  { year: 1893, financialCapital: 50, productionCapital: 50, surgeId: 3, phase: 'turning' },
  { year: 1900, financialCapital: 30, productionCapital: 70, surgeId: 3, phase: 'synergy' },
  { year: 1910, financialCapital: 25, productionCapital: 75, surgeId: 3, phase: 'synergy' },
  { year: 1918, financialCapital: 35, productionCapital: 65, surgeId: 3, phase: 'maturity' },
  // 4th Surge: Oil & Mass Production
  { year: 1908, financialCapital: 30, productionCapital: 70, surgeId: 4, phase: 'irruption' },
  { year: 1915, financialCapital: 45, productionCapital: 55, surgeId: 4, phase: 'irruption' },
  { year: 1920, financialCapital: 65, productionCapital: 35, surgeId: 4, phase: 'frenzy' },
  { year: 1927, financialCapital: 85, productionCapital: 15, surgeId: 4, phase: 'frenzy' },
  { year: 1929, financialCapital: 45, productionCapital: 55, surgeId: 4, phase: 'turning' },
  { year: 1945, financialCapital: 20, productionCapital: 80, surgeId: 4, phase: 'synergy' },
  { year: 1960, financialCapital: 25, productionCapital: 75, surgeId: 4, phase: 'synergy' },
  { year: 1974, financialCapital: 40, productionCapital: 60, surgeId: 4, phase: 'maturity' },
  // 5th Surge: ICT & Digital
  { year: 1971, financialCapital: 30, productionCapital: 70, surgeId: 5, phase: 'irruption' },
  { year: 1980, financialCapital: 45, productionCapital: 55, surgeId: 5, phase: 'irruption' },
  { year: 1990, financialCapital: 65, productionCapital: 35, surgeId: 5, phase: 'frenzy' },
  { year: 1999, financialCapital: 88, productionCapital: 12, surgeId: 5, phase: 'frenzy' },
  { year: 2001, financialCapital: 50, productionCapital: 50, surgeId: 5, phase: 'turning' },
  { year: 2010, financialCapital: 40, productionCapital: 60, surgeId: 5, phase: 'synergy' },
  { year: 2020, financialCapital: 45, productionCapital: 55, surgeId: 5, phase: 'synergy' },
  { year: 2025, financialCapital: 50, productionCapital: 50, surgeId: 5, phase: 'synergy' },
];

export const ADOPTION_CURVES: AdoptionCurve[] = [
  {
    technology: 'Canals',
    surgeId: 1,
    color: '#8B4513',
    data: [
      { year: 1760, adoptionPct: 2 }, { year: 1770, adoptionPct: 5 }, { year: 1780, adoptionPct: 15 },
      { year: 1790, adoptionPct: 40 }, { year: 1800, adoptionPct: 65 }, { year: 1810, adoptionPct: 80 },
      { year: 1820, adoptionPct: 90 }, { year: 1830, adoptionPct: 92 }, { year: 1840, adoptionPct: 85 },
    ],
  },
  {
    technology: 'Railways',
    surgeId: 2,
    color: '#4A6741',
    data: [
      { year: 1825, adoptionPct: 1 }, { year: 1835, adoptionPct: 5 }, { year: 1845, adoptionPct: 20 },
      { year: 1855, adoptionPct: 45 }, { year: 1865, adoptionPct: 65 }, { year: 1875, adoptionPct: 80 },
      { year: 1885, adoptionPct: 90 }, { year: 1895, adoptionPct: 95 }, { year: 1905, adoptionPct: 97 },
    ],
  },
  {
    technology: 'Telegraph',
    surgeId: 2,
    color: '#2E8B57',
    data: [
      { year: 1845, adoptionPct: 1 }, { year: 1855, adoptionPct: 8 }, { year: 1865, adoptionPct: 25 },
      { year: 1875, adoptionPct: 50 }, { year: 1885, adoptionPct: 72 }, { year: 1895, adoptionPct: 85 },
      { year: 1905, adoptionPct: 90 },
    ],
  },
  {
    technology: 'Electricity',
    surgeId: 3,
    color: '#B8860B',
    data: [
      { year: 1882, adoptionPct: 1 }, { year: 1890, adoptionPct: 3 }, { year: 1900, adoptionPct: 10 },
      { year: 1910, adoptionPct: 25 }, { year: 1920, adoptionPct: 50 }, { year: 1930, adoptionPct: 70 },
      { year: 1940, adoptionPct: 85 }, { year: 1950, adoptionPct: 95 },
    ],
  },
  {
    technology: 'Telephone',
    surgeId: 3,
    color: '#CD853F',
    data: [
      { year: 1880, adoptionPct: 0 }, { year: 1890, adoptionPct: 1 }, { year: 1900, adoptionPct: 5 },
      { year: 1910, adoptionPct: 12 }, { year: 1920, adoptionPct: 35 }, { year: 1930, adoptionPct: 42 },
      { year: 1940, adoptionPct: 45 }, { year: 1950, adoptionPct: 62 }, { year: 1960, adoptionPct: 78 },
      { year: 1970, adoptionPct: 90 },
    ],
  },
  {
    technology: 'Automobile',
    surgeId: 4,
    color: '#1E3A5F',
    data: [
      { year: 1900, adoptionPct: 0 }, { year: 1910, adoptionPct: 2 }, { year: 1920, adoptionPct: 15 },
      { year: 1930, adoptionPct: 30 }, { year: 1940, adoptionPct: 35 }, { year: 1950, adoptionPct: 55 },
      { year: 1960, adoptionPct: 75 }, { year: 1970, adoptionPct: 85 }, { year: 1980, adoptionPct: 90 },
    ],
  },
  {
    technology: 'Television',
    surgeId: 4,
    color: '#4169E1',
    data: [
      { year: 1930, adoptionPct: 0 }, { year: 1940, adoptionPct: 1 }, { year: 1950, adoptionPct: 25 },
      { year: 1955, adoptionPct: 55 }, { year: 1960, adoptionPct: 85 }, { year: 1965, adoptionPct: 92 },
      { year: 1970, adoptionPct: 96 },
    ],
  },
  {
    technology: 'Personal Computer',
    surgeId: 5,
    color: '#7C3AED',
    data: [
      { year: 1975, adoptionPct: 0 }, { year: 1980, adoptionPct: 1 }, { year: 1985, adoptionPct: 8 },
      { year: 1990, adoptionPct: 20 }, { year: 1995, adoptionPct: 35 }, { year: 2000, adoptionPct: 55 },
      { year: 2005, adoptionPct: 70 }, { year: 2010, adoptionPct: 78 }, { year: 2015, adoptionPct: 80 },
    ],
  },
  {
    technology: 'Internet',
    surgeId: 5,
    color: '#EC4899',
    data: [
      { year: 1990, adoptionPct: 0 }, { year: 1995, adoptionPct: 5 }, { year: 2000, adoptionPct: 30 },
      { year: 2005, adoptionPct: 50 }, { year: 2010, adoptionPct: 65 }, { year: 2015, adoptionPct: 78 },
      { year: 2020, adoptionPct: 88 }, { year: 2025, adoptionPct: 92 },
    ],
  },
  {
    technology: 'Smartphone',
    surgeId: 5,
    color: '#06B6D4',
    data: [
      { year: 2005, adoptionPct: 1 }, { year: 2008, adoptionPct: 5 }, { year: 2010, adoptionPct: 15 },
      { year: 2012, adoptionPct: 35 }, { year: 2014, adoptionPct: 55 }, { year: 2016, adoptionPct: 70 },
      { year: 2018, adoptionPct: 80 }, { year: 2020, adoptionPct: 85 }, { year: 2025, adoptionPct: 90 },
    ],
  },
  {
    technology: 'Cloud Computing',
    surgeId: 5,
    color: '#10B981',
    data: [
      { year: 2006, adoptionPct: 1 }, { year: 2010, adoptionPct: 8 }, { year: 2013, adoptionPct: 20 },
      { year: 2016, adoptionPct: 38 }, { year: 2019, adoptionPct: 55 }, { year: 2022, adoptionPct: 68 },
      { year: 2025, adoptionPct: 78 },
    ],
  },
  {
    technology: 'AI/ML',
    surgeId: 5,
    color: '#F59E0B',
    data: [
      { year: 2012, adoptionPct: 1 }, { year: 2015, adoptionPct: 3 }, { year: 2018, adoptionPct: 10 },
      { year: 2020, adoptionPct: 18 }, { year: 2022, adoptionPct: 28 }, { year: 2024, adoptionPct: 42 },
      { year: 2025, adoptionPct: 50 },
    ],
  },
];

export const FINANCIAL_BUBBLES: FinancialBubble[] = [
  {
    name: 'Canal Mania',
    surgeId: 1,
    peakYear: 1793,
    crashYear: 1797,
    peakIndex: 100,
    troughIndex: 40,
    declinePct: 60,
    recoveryYear: 1810,
    description: 'Speculative investment in canal building schemes across Britain. Over 100 canal acts passed in a few years before the bubble burst.',
  },
  {
    name: 'Railway Mania',
    surgeId: 2,
    peakYear: 1845,
    crashYear: 1847,
    peakIndex: 100,
    troughIndex: 33,
    declinePct: 67,
    recoveryYear: 1855,
    description: 'Massive speculation in railway company shares. At its peak, over 1,000 railway companies were proposed. The crash wiped out many investors but left Britain with a world-class rail network.',
  },
  {
    name: 'Gilded Age Bubble',
    surgeId: 3,
    peakYear: 1890,
    crashYear: 1893,
    peakIndex: 100,
    troughIndex: 52,
    declinePct: 48,
    recoveryYear: 1898,
    description: 'Speculation in steel, electricity, and railroad trusts during America\'s Gilded Age. The Panic of 1893 triggered the worst depression until the 1930s.',
  },
  {
    name: 'Roaring Twenties',
    surgeId: 4,
    peakYear: 1929,
    crashYear: 1932,
    peakIndex: 100,
    troughIndex: 11,
    declinePct: 89,
    recoveryYear: 1954,
    description: 'Speculative euphoria around automobiles, radio, and consumer credit. The Dow fell 89% peak-to-trough. Recovery to the 1929 peak took 25 years.',
  },
  {
    name: 'Dot-com Bubble',
    surgeId: 5,
    peakYear: 2000,
    crashYear: 2002,
    peakIndex: 100,
    troughIndex: 22,
    declinePct: 78,
    recoveryYear: 2015,
    description: 'Internet and telecom stocks soared on visions of a "new economy". The NASDAQ lost 78% of its value. But the crash left behind fibre-optic networks and internet infrastructure that powered the next wave.',
  },
];

export const KONDRATIEV_WAVES: KondratievWave[] = [
  // 1st Wave: Industrial Revolution
  { decade: 1780, growthRate: 2.5, innovationIntensity: 70, waveName: '1st Wave: Cotton & Iron', phase: 'upswing' },
  { decade: 1790, growthRate: 3.0, innovationIntensity: 80, waveName: '1st Wave: Cotton & Iron', phase: 'upswing' },
  { decade: 1800, growthRate: 2.8, innovationIntensity: 75, waveName: '1st Wave: Cotton & Iron', phase: 'upswing' },
  { decade: 1810, growthRate: 2.0, innovationIntensity: 50, waveName: '1st Wave: Cotton & Iron', phase: 'downswing' },
  { decade: 1820, growthRate: 1.5, innovationIntensity: 35, waveName: '1st Wave: Cotton & Iron', phase: 'downswing' },
  // 2nd Wave: Railways
  { decade: 1830, growthRate: 2.5, innovationIntensity: 65, waveName: '2nd Wave: Railways & Steam', phase: 'upswing' },
  { decade: 1840, growthRate: 3.5, innovationIntensity: 85, waveName: '2nd Wave: Railways & Steam', phase: 'upswing' },
  { decade: 1850, growthRate: 3.8, innovationIntensity: 90, waveName: '2nd Wave: Railways & Steam', phase: 'upswing' },
  { decade: 1860, growthRate: 3.0, innovationIntensity: 70, waveName: '2nd Wave: Railways & Steam', phase: 'upswing' },
  { decade: 1870, growthRate: 1.8, innovationIntensity: 40, waveName: '2nd Wave: Railways & Steam', phase: 'downswing' },
  { decade: 1880, growthRate: 1.5, innovationIntensity: 35, waveName: '2nd Wave: Railways & Steam', phase: 'downswing' },
  // 3rd Wave: Steel & Electricity
  { decade: 1890, growthRate: 3.0, innovationIntensity: 75, waveName: '3rd Wave: Steel & Electricity', phase: 'upswing' },
  { decade: 1900, growthRate: 3.5, innovationIntensity: 85, waveName: '3rd Wave: Steel & Electricity', phase: 'upswing' },
  { decade: 1910, growthRate: 2.8, innovationIntensity: 70, waveName: '3rd Wave: Steel & Electricity', phase: 'upswing' },
  { decade: 1920, growthRate: 2.0, innovationIntensity: 50, waveName: '3rd Wave: Steel & Electricity', phase: 'downswing' },
  { decade: 1930, growthRate: 0.5, innovationIntensity: 30, waveName: '3rd Wave: Steel & Electricity', phase: 'downswing' },
  // 4th Wave: Oil & Mass Production
  { decade: 1940, growthRate: 4.0, innovationIntensity: 80, waveName: '4th Wave: Oil & Mass Production', phase: 'upswing' },
  { decade: 1950, growthRate: 5.0, innovationIntensity: 90, waveName: '4th Wave: Oil & Mass Production', phase: 'upswing' },
  { decade: 1960, growthRate: 4.5, innovationIntensity: 85, waveName: '4th Wave: Oil & Mass Production', phase: 'upswing' },
  { decade: 1970, growthRate: 2.5, innovationIntensity: 50, waveName: '4th Wave: Oil & Mass Production', phase: 'downswing' },
  { decade: 1980, growthRate: 2.0, innovationIntensity: 40, waveName: '4th Wave: Oil & Mass Production', phase: 'downswing' },
  // 5th Wave: ICT & Digital
  { decade: 1990, growthRate: 3.5, innovationIntensity: 80, waveName: '5th Wave: ICT & Digital', phase: 'upswing' },
  { decade: 2000, growthRate: 3.0, innovationIntensity: 85, waveName: '5th Wave: ICT & Digital', phase: 'upswing' },
  { decade: 2010, growthRate: 3.2, innovationIntensity: 90, waveName: '5th Wave: ICT & Digital', phase: 'upswing' },
  { decade: 2020, growthRate: 2.8, innovationIntensity: 95, waveName: '5th Wave: ICT & Digital', phase: 'upswing' },
];

export const ACADEMIC_SOURCES: AcademicSource[] = [
  {
    author: 'Carlota Perez',
    year: 2002,
    title: 'Technological Revolutions and Financial Capital: The Dynamics of Bubbles and Golden Ages',
    keyInsight: 'Each technological revolution follows a recurring pattern: financial capital funds the installation of new infrastructure through speculative bubbles, crashes force institutional reform, and the subsequent deployment period produces a "golden age" of broadly shared prosperity.',
    category: 'primary',
  },
  {
    author: 'Christopher Freeman & Francisco Louçã',
    year: 2001,
    title: 'As Time Goes By: From the Industrial Revolutions to the Information Revolution',
    keyInsight: 'Long waves of economic development are driven by successive techno-economic paradigm shifts. Each new paradigm requires not just technological change but a matching transformation of institutions, education, regulation, and social norms.',
    category: 'primary',
  },
  {
    author: 'Joseph Schumpeter',
    year: 1942,
    title: 'Capitalism, Socialism and Democracy',
    keyInsight: '"Creative destruction" is the essential fact about capitalism. Innovation by entrepreneurs disrupts existing industries, creating new ones. This process is inherently cyclical and turbulent.',
    category: 'supporting',
  },
  {
    author: 'Nikolai Kondratiev',
    year: 1925,
    title: 'The Major Economic Cycles',
    keyInsight: 'Capitalist economies exhibit long waves of approximately 40-60 years, driven by clusters of technological innovation that reshape the economic structure.',
    category: 'supporting',
  },
  {
    author: 'Hyman Minsky',
    year: 1986,
    title: 'Stabilizing an Unstable Economy',
    keyInsight: 'Financial systems are inherently prone to instability. Periods of stability encourage increasingly speculative finance, leading inevitably to crises — a pattern that maps directly onto the frenzy phases of technological revolutions.',
    category: 'supporting',
  },
  {
    author: 'William Janeway',
    year: 2012,
    title: 'Doing Capitalism in the Innovation Economy',
    keyInsight: 'Speculative bubbles, while destructive, serve an essential function: they mobilise the risk capital needed to fund the exploration and installation of revolutionary new technologies that cautious investors would never back.',
    category: 'supporting',
  },
  {
    author: 'Vaclav Smil',
    year: 2005,
    title: 'Creating the Twentieth Century: Technical Innovations of 1867–1914 and Their Lasting Impact',
    keyInsight: 'The most transformative cluster of innovations in history occurred between 1867 and 1914 — electricity, internal combustion, telecommunications, synthetic chemistry — creating the technical foundations of modern civilisation.',
    category: 'supporting',
  },
];

export const SURGE_COLORS: Record<number, { installation: string; deployment: string; bg: string }> = {
  1: { installation: '#D97706', deployment: '#059669', bg: '#8B451320' },
  2: { installation: '#DC2626', deployment: '#2563EB', bg: '#4A674120' },
  3: { installation: '#EA580C', deployment: '#0891B2', bg: '#B8860B20' },
  4: { installation: '#E11D48', deployment: '#4F46E5', bg: '#1E3A5F20' },
  5: { installation: '#DB2777', deployment: '#7C3AED', bg: '#7C3AED20' },
};

export const INEQUALITY_DATA: InequalityDataPoint[] = [
  // Top 10% income share proxy (inspired by Piketty, Saez, Zucman data)
  { year: 1780, topSharePct: 42, surgeId: 1, phase: 'irruption' },
  { year: 1790, topSharePct: 48, surgeId: 1, phase: 'frenzy' },
  { year: 1800, topSharePct: 44, surgeId: 1, phase: 'synergy' },
  { year: 1815, topSharePct: 40, surgeId: 1, phase: 'synergy' },
  { year: 1825, topSharePct: 42, surgeId: 1, phase: 'maturity' },
  { year: 1835, topSharePct: 43, surgeId: 2, phase: 'irruption' },
  { year: 1845, topSharePct: 50, surgeId: 2, phase: 'frenzy' },
  { year: 1850, topSharePct: 44, surgeId: 2, phase: 'synergy' },
  { year: 1860, topSharePct: 41, surgeId: 2, phase: 'synergy' },
  { year: 1870, topSharePct: 43, surgeId: 2, phase: 'maturity' },
  { year: 1880, topSharePct: 46, surgeId: 3, phase: 'irruption' },
  { year: 1890, topSharePct: 52, surgeId: 3, phase: 'frenzy' },
  { year: 1895, topSharePct: 47, surgeId: 3, phase: 'turning' },
  { year: 1900, topSharePct: 44, surgeId: 3, phase: 'synergy' },
  { year: 1910, topSharePct: 43, surgeId: 3, phase: 'synergy' },
  { year: 1920, topSharePct: 44, surgeId: 4, phase: 'irruption' },
  { year: 1928, topSharePct: 50, surgeId: 4, phase: 'frenzy' },
  { year: 1932, topSharePct: 46, surgeId: 4, phase: 'turning' },
  { year: 1940, topSharePct: 40, surgeId: 4, phase: 'synergy' },
  { year: 1950, topSharePct: 33, surgeId: 4, phase: 'synergy' },
  { year: 1960, topSharePct: 32, surgeId: 4, phase: 'synergy' },
  { year: 1970, topSharePct: 33, surgeId: 4, phase: 'maturity' },
  { year: 1980, topSharePct: 35, surgeId: 5, phase: 'irruption' },
  { year: 1990, topSharePct: 42, surgeId: 5, phase: 'frenzy' },
  { year: 2000, topSharePct: 50, surgeId: 5, phase: 'frenzy' },
  { year: 2007, topSharePct: 50, surgeId: 5, phase: 'turning' },
  { year: 2010, topSharePct: 48, surgeId: 5, phase: 'synergy' },
  { year: 2020, topSharePct: 49, surgeId: 5, phase: 'synergy' },
  { year: 2025, topSharePct: 50, surgeId: 5, phase: 'synergy' },
];

export const CONTEMPORARY_PARALLELS: ContemporaryParallel[] = [
  {
    historicalEvent: 'Railway Mania speculation and crash (1845–1847)',
    historicalSurge: 2,
    modernEquivalent: 'Dot-com bubble (1995–2000) and AI investment surge (2023–)',
    analysis: 'Both Railway Mania and the dot-com bubble saw massive capital deployed into transformative infrastructure. Railway Mania left behind a rail network; the dot-com crash left behind fibre-optic cables and data centres. Today\'s AI investment surge shows similar patterns — enormous capital allocation based on future potential, with questions about near-term profitability.',
    status: 'playing-out',
  },
  {
    historicalEvent: 'Gilded Age wealth concentration (1880s–1890s)',
    historicalSurge: 3,
    modernEquivalent: 'Tech billionaire wealth concentration (2010s–2020s)',
    analysis: 'The Gilded Age saw Rockefeller, Carnegie, and Vanderbilt accumulate historically unprecedented fortunes. Today\'s tech billionaires (Bezos, Musk, Zuckerberg) have reached similar levels of wealth concentration relative to the economy. In both eras, the dominant technology\'s network effects and economies of scale naturally produce monopolistic or oligopolistic market structures.',
    status: 'playing-out',
  },
  {
    historicalEvent: 'Progressive Era antitrust (Sherman Act 1890, trust-busting 1901–1914)',
    historicalSurge: 3,
    modernEquivalent: 'Big Tech antitrust actions (EU Digital Markets Act, US DOJ vs Google/Apple)',
    analysis: 'Just as Progressive Era reformers broke up Standard Oil and regulated the trusts, current regulators are attempting to constrain platform monopolies. The question is whether these efforts will produce the kind of institutional reform that channels the technology toward broader prosperity.',
    status: 'emerging',
  },
  {
    historicalEvent: 'Creation of the Federal Reserve (1913) after repeated financial panics',
    historicalSurge: 3,
    modernEquivalent: 'Central bank digital currencies (CBDCs) and crypto regulation',
    analysis: 'The Fed was created because private banking repeatedly failed to prevent panics. Today, crypto and DeFi are creating a new parallel financial system, and central banks are responding with CBDCs. This may be an analogous institutional innovation — a new monetary infrastructure for the digital age.',
    status: 'emerging',
  },
  {
    historicalEvent: 'New Deal institutional framework (1933–1938)',
    historicalSurge: 4,
    modernEquivalent: 'Post-2008/post-COVID institutional response (incomplete)',
    analysis: 'Perez\'s most provocative argument: the 5th surge has not yet had its "New Deal moment." The 2008 crisis produced Dodd-Frank but not a fundamental institutional reset. The deployment golden age — with broadly shared prosperity — requires regulation that channels ICT/AI toward societal benefit. Whether this happens through climate policy, AI governance, or something else remains the key question.',
    status: 'debated',
  },
  {
    historicalEvent: 'Ford\'s $5/day wage (1914) — paying workers enough to buy the product',
    historicalSurge: 4,
    modernEquivalent: 'Universal Basic Income debates, AI displacement and retraining',
    analysis: 'Ford realised mass production required mass consumption. If AI automates cognitive work at scale, an analogous institutional innovation may be needed to ensure the population can participate in the AI economy as consumers and citizens, not just as displaced workers.',
    status: 'potential',
  },
  {
    historicalEvent: 'Bretton Woods (1944) — international institutional framework for the golden age',
    historicalSurge: 4,
    modernEquivalent: 'Need for global AI governance and digital trade frameworks',
    analysis: 'Bretton Woods created the international institutional architecture for the 4th surge\'s golden age. The 5th surge operates globally but lacks equivalent international governance for data flows, AI development, platform regulation, and digital taxation. Without this, the "deployment golden age" may remain fragmented.',
    status: 'potential',
  },
];

export const PHASE_DESCRIPTIONS: Record<string, { title: string; description: string; capitalType: string; mood: string; icon: string }> = {
  irruption: {
    title: 'Irruption',
    description: 'A revolutionary new technology appears and begins to spread. Early adopters and entrepreneurs see the potential. Financial capital starts to notice the new opportunities. The old paradigm is still dominant but clearly showing its age.',
    capitalType: 'Venture capital, angel investors, risk-tolerant finance',
    mood: 'Excitement, experimentation, niche enthusiasm',
    icon: '🌱',
  },
  frenzy: {
    title: 'Frenzy',
    description: 'Financial capital floods into the new technology. Asset prices soar. A speculative bubble forms as "everyone" wants exposure to the new paradigm. Wealth concentrates enormously. The financial sector decouples from productive investment. Fraud and excess proliferate.',
    capitalType: 'Speculative finance, IPOs, leveraged investment, Ponzi-like schemes',
    mood: '"This time is different." Euphoria, greed, FOMO',
    icon: '🔥',
  },
  turning: {
    title: 'Turning Point',
    description: 'The bubble bursts. Financial crisis, recession, and social upheaval follow. This is a critical juncture: society must decide whether to reform institutions to accommodate the new technology or allow the old institutional framework to persist.',
    capitalType: 'Capital destruction, deleveraging, flight to safety',
    mood: 'Panic, anger, demands for regulation and accountability',
    icon: '💥',
  },
  synergy: {
    title: 'Synergy (Golden Age)',
    description: 'If institutional reform succeeds, a "golden age" begins. Production capital takes over from financial capital. The technology spreads to all sectors of the economy. Prosperity is broadly shared. New social norms, regulations, and institutions align with the technological paradigm.',
    capitalType: 'Production capital, institutional investment, retained earnings, public investment',
    mood: 'Confidence, expansion, broad-based optimism, social cohesion',
    icon: '✨',
  },
  maturity: {
    title: 'Maturity',
    description: 'The paradigm matures and market saturation sets in. Returns on investment decline. Financial capital begins looking for the "next big thing." The seeds of the next technological revolution are often planted during this period of creative restlessness.',
    capitalType: 'Declining returns, conglomerate diversification, early VC for next paradigm',
    mood: 'Stagnation, nostalgia, search for new frontiers',
    icon: '🍂',
  },
};

export interface PerezFigureRow {
  surgeId: number;
  ordinal: string;
  dateLine: string;
  revolutionName: string;
  coreCountry: string;
  bubbleLabel: string;
  bubbleDetail: string;
  recessionLabel: string;
  recessionYears: string;
  goldenAgeLabel: string;
  goldenAgeDetail: string;
  maturityNote: string;
  installStart: number;
  installEnd: number;
  tpStart: number;
  tpEnd: number;
  deployStart: number;
  deployEnd: number;
}

export const PEREZ_FIGURE_DATA: PerezFigureRow[] = [
  {
    surgeId: 1, ordinal: '1st', dateLine: '1771',
    revolutionName: 'The Industrial Revolution',
    coreCountry: 'Britain',
    bubbleLabel: 'Canal mania',
    bubbleDetail: 'UK',
    recessionLabel: '1793–97',
    recessionYears: '1793–97',
    goldenAgeLabel: 'Great British leap',
    goldenAgeDetail: 'Factory system, British industrial supremacy',
    maturityNote: '',
    installStart: 1771, installEnd: 1793,
    tpStart: 1793, tpEnd: 1797,
    deployStart: 1798, deployEnd: 1829,
  },
  {
    surgeId: 2, ordinal: '2nd', dateLine: '1829',
    revolutionName: 'Age of Steam & Railways',
    coreCountry: 'Britain',
    bubbleLabel: 'Railway mania',
    bubbleDetail: 'UK',
    recessionLabel: '1848–50',
    recessionYears: '1848–50',
    goldenAgeLabel: 'The Victorian Boom',
    goldenAgeDetail: 'Global trade expansion, Great Exhibition 1851',
    maturityNote: '',
    installStart: 1829, installEnd: 1848,
    tpStart: 1848, tpEnd: 1850,
    deployStart: 1850, deployEnd: 1873,
  },
  {
    surgeId: 3, ordinal: '3rd', dateLine: '1875',
    revolutionName: 'Age of Steel, Electricity & Engineering',
    coreCountry: 'USA & Germany',
    bubbleLabel: 'London funded global market infrastructure build-up',
    bubbleDetail: '(Argentina, Australia, USA)',
    recessionLabel: '1890–95',
    recessionYears: '1890–95',
    goldenAgeLabel: "Belle Époque (Europe) / Progressive Era (USA)",
    goldenAgeDetail: 'Electrification, submarine cables, reform era',
    maturityNote: '* Overlap of more than a decade between Deployment 3 and Installation 4',
    installStart: 1875, installEnd: 1890,
    tpStart: 1890, tpEnd: 1895,
    deployStart: 1895, deployEnd: 1918,
  },
  {
    surgeId: 4, ordinal: '4th', dateLine: '1908',
    revolutionName: 'Age of Oil, Autos & Mass Production',
    coreCountry: 'USA',
    bubbleLabel: 'The roaring twenties USA — Autos, housing, radio, aviation, electricity',
    bubbleDetail: '',
    recessionLabel: 'Europe 1929–33 / USA 1929–43',
    recessionYears: '1929–43',
    goldenAgeLabel: 'Post-war Golden Age',
    goldenAgeDetail: 'Suburbanisation, welfare states, Keynesian full employment',
    maturityNote: '',
    installStart: 1908, installEnd: 1929,
    tpStart: 1929, tpEnd: 1943,
    deployStart: 1943, deployEnd: 1974,
  },
  {
    surgeId: 5, ordinal: '5th', dateLine: '1971',
    revolutionName: 'Age of ICT & Digital',
    coreCountry: 'USA',
    bubbleLabel: 'Internet mania, Telecoms 1990s, emerging markets, global financial casino/housing 2000s',
    bubbleDetail: '',
    recessionLabel: '2000–03 / 2007–??',
    recessionYears: '2000–??',
    goldenAgeLabel: "Global sustainable 'golden age'?",
    goldenAgeDetail: 'Green transition, AI-augmented productivity — depends on institutional alignment',
    maturityNote: '← We are here',
    installStart: 1971, installEnd: 2000,
    tpStart: 2000, tpEnd: 2008,
    deployStart: 2008, deployEnd: 2060,
  },
];

export const EXTENDED_QUOTES: { quote: string; author: string; source: string; year: number; relevantView: string }[] = [
  {
    quote: 'Not only does the irruption of each revolution set the stage for a bubble, but also, in the times of paradigm transition, the conditions are especially fertile for the growth of a financial hotbed of decoupled financial capital.',
    author: 'Carlota Perez',
    source: 'Technological Revolutions and Financial Capital',
    year: 2002,
    relevantView: 'capital',
  },
  {
    quote: 'Bubbles are functional to the process of technology diffusion. They provide the massive investment needed to install the new infrastructure, which then becomes available at low cost for the deployment period.',
    author: 'Carlota Perez',
    source: 'Technological Revolutions and Financial Capital',
    year: 2002,
    relevantView: 'bubbles',
  },
  {
    quote: 'The process of industrial mutation... incessantly revolutionizes the economic structure from within, incessantly destroying the old one, incessantly creating a new one. This process of Creative Destruction is the essential fact about capitalism.',
    author: 'Joseph Schumpeter',
    source: 'Capitalism, Socialism and Democracy',
    year: 1942,
    relevantView: 'surges',
  },
  {
    quote: 'The role of speculative excess is not merely destructive. Without the mania of the railway promoters, Britain would not have acquired its railway network as quickly, nor would the resistance of landed interests have been overcome.',
    author: 'William Janeway',
    source: 'Doing Capitalism in the Innovation Economy',
    year: 2012,
    relevantView: 'bubbles',
  },
  {
    quote: 'What dies in a financial crisis is not the technology, but the particular pattern of its financing. The infrastructure remains.',
    author: 'Carlota Perez',
    source: 'Technological Revolutions and Financial Capital',
    year: 2002,
    relevantView: 'adoption',
  },
  {
    quote: 'The innovations which we associate with the names of Watt, Trevithick, or Stephenson did not come out of the blue. They were connected with earlier scientific and technical progress... each generation stood on the shoulders of the preceding one.',
    author: 'Christopher Freeman & Francisco Louçã',
    source: 'As Time Goes By',
    year: 2001,
    relevantView: 'kondratiev',
  },
  {
    quote: 'Over a protracted period of good times, capitalist economies tend to move from a financial structure dominated by hedge finance units to a structure in which there is large weight to units engaged in speculative and Ponzi finance.',
    author: 'Hyman Minsky',
    source: 'Stabilizing an Unstable Economy',
    year: 1986,
    relevantView: 'capital',
  },
  {
    quote: 'The period from 1867 to 1914 was the most inventive and most consequential in human history... the technical and scientific innovations of those five decades created the world in which we are still living.',
    author: 'Vaclav Smil',
    source: 'Creating the Twentieth Century',
    year: 2005,
    relevantView: 'surges',
  },
];
