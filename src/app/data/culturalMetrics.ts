export interface CulturalIndicatorInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  unit: string;
  source: string;
  interpretation: string;
  color: string;
  colorDark: string;
}

export const culturalIndicators: { [key: string]: CulturalIndicatorInfo } = {
  heritageSites: {
    id: 'heritageSites',
    name: 'UNESCO World Heritage Sites',
    shortName: 'Heritage Sites',
    description: 'Total number of UNESCO World Heritage Sites inscribed in a country, including cultural, natural, and mixed properties.',
    unit: 'Number of sites',
    source: 'UNESCO World Heritage Centre',
    interpretation: 'Higher counts reflect rich cultural and natural heritage recognized internationally.',
    color: '#8B5CF6',
    colorDark: '#A78BFA'
  },
  tourismArrivals: {
    id: 'tourismArrivals',
    name: 'International Tourism Arrivals',
    shortName: 'Tourism Arrivals',
    description: 'Number of international inbound tourists (overnight visitors) arriving in a country.',
    unit: 'Number of arrivals',
    source: 'World Bank (UNWTO)',
    interpretation: 'Higher arrivals indicate cultural attractiveness and soft power draw.',
    color: '#3B82F6',
    colorDark: '#60A5FA'
  },
  tourismReceipts: {
    id: 'tourismReceipts',
    name: 'International Tourism Receipts',
    shortName: 'Tourism Receipts',
    description: 'Expenditures by international inbound visitors in the destination country, in current US dollars.',
    unit: 'Current US$',
    source: 'World Bank (UNWTO)',
    interpretation: 'Higher receipts show economic value of cultural and tourism assets.',
    color: '#10B981',
    colorDark: '#34D399'
  },
  tourismExpenditure: {
    id: 'tourismExpenditure',
    name: 'International Tourism Expenditure',
    shortName: 'Tourism Spending',
    description: 'Expenditures by outbound international visitors in other countries, in current US dollars.',
    unit: 'Current US$',
    source: 'World Bank (UNWTO)',
    interpretation: 'High outbound spending indicates cultural engagement and affluence.',
    color: '#F59E0B',
    colorDark: '#FBBF24'
  },
  educationExpenditure: {
    id: 'educationExpenditure',
    name: 'Education Expenditure',
    shortName: 'Education % GDP',
    description: 'Government expenditure on education as a percentage of GDP, encompassing cultural and creative education.',
    unit: '% of GDP',
    source: 'World Bank (UNESCO)',
    interpretation: 'Higher spending supports cultural capital formation through education.',
    color: '#06B6D4',
    colorDark: '#22D3EE'
  },
  trademarkApplications: {
    id: 'trademarkApplications',
    name: 'Trademark Applications',
    shortName: 'Trademarks',
    description: 'Trademark applications filed by residents, indicating cultural brand development and creative IP.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Higher filings reflect a dynamic creative and branding ecosystem.',
    color: '#EC4899',
    colorDark: '#F472B6'
  },
  netMigration: {
    id: 'netMigration',
    name: 'Net Migration',
    shortName: 'Net Migration',
    description: 'Net number of migrants (immigrants minus emigrants). Positive values indicate cultural attractiveness.',
    unit: 'Number of people',
    source: 'World Bank (UN DESA)',
    interpretation: 'Positive net migration suggests cultural pull and quality of life attractiveness.',
    color: '#14B8A6',
    colorDark: '#2DD4BF'
  },
  creativeGoodsExports: {
    id: 'creativeGoodsExports',
    name: 'Creative Goods Exports',
    shortName: 'Creative Exports',
    description: 'Value of creative goods exported, including art, design, film, music, crafts, and publishing.',
    unit: 'Billion US$',
    source: 'UNCTAD Creative Economy',
    interpretation: 'Higher exports indicate a competitive creative industries sector.',
    color: '#EF4444',
    colorDark: '#F87171'
  },
  creativeServicesExports: {
    id: 'creativeServicesExports',
    name: 'Creative Services Exports',
    shortName: 'Creative Services',
    description: 'Value of creative services exported, including advertising, architecture, audiovisual, and design services.',
    unit: 'Billion US$',
    source: 'UNCTAD Creative Economy',
    interpretation: 'Higher service exports show strength in knowledge-based creative industries.',
    color: '#A855F7',
    colorDark: '#C084FC'
  },
  museumDensity: {
    id: 'museumDensity',
    name: 'Museum Density',
    shortName: 'Museums/M',
    description: 'Number of museums per million inhabitants, reflecting cultural infrastructure investment.',
    unit: 'Per million people',
    source: 'UNESCO/ICOM',
    interpretation: 'Higher density indicates strong commitment to cultural preservation and public access.',
    color: '#6366F1',
    colorDark: '#818CF8'
  },
  creativeCities: {
    id: 'creativeCities',
    name: 'UNESCO Creative Cities',
    shortName: 'Creative Cities',
    description: 'Number of cities designated in the UNESCO Creative Cities Network across seven creative fields.',
    unit: 'Number of cities',
    source: 'UNESCO Creative Cities Network',
    interpretation: 'More designated cities indicate vibrant urban creative ecosystems.',
    color: '#F97316',
    colorDark: '#FB923C'
  },
  softPowerRank: {
    id: 'softPowerRank',
    name: 'Global Soft Power Rank',
    shortName: 'Soft Power',
    description: 'Composite ranking measuring cultural influence, reputation, and global perception.',
    unit: 'Rank (lower is better)',
    source: 'Brand Finance Global Soft Power Index',
    interpretation: 'Lower rank indicates greater cultural and diplomatic influence globally.',
    color: '#0EA5E9',
    colorDark: '#38BDF8'
  },
  culturalEmployment: {
    id: 'culturalEmployment',
    name: 'Cultural Employment Share',
    shortName: 'Cultural Jobs %',
    description: 'Share of total employment in cultural and creative sectors.',
    unit: '% of total employment',
    source: 'OECD/Eurostat/ILO',
    interpretation: 'Higher share indicates a larger creative economy within the workforce.',
    color: '#84CC16',
    colorDark: '#A3E635'
  },
  featureFilms: {
    id: 'featureFilms',
    name: 'Feature Films Produced',
    shortName: 'Films',
    description: 'Number of feature-length films produced annually in the country.',
    unit: 'Number of films',
    source: 'UNESCO UIS',
    interpretation: 'Higher production indicates a vibrant film industry and cultural expression.',
    color: '#D946EF',
    colorDark: '#E879F9'
  },
  libraryDensity: {
    id: 'libraryDensity',
    name: 'Library Density',
    shortName: 'Libraries/M',
    description: 'Number of public libraries per million inhabitants.',
    unit: 'Per million people',
    source: 'IFLA/National Statistics',
    interpretation: 'Higher density indicates investment in public access to knowledge and culture.',
    color: '#0891B2',
    colorDark: '#06B6D4'
  },
  intangibleHeritage: {
    id: 'intangibleHeritage',
    name: 'Intangible Cultural Heritage',
    shortName: 'Intangible',
    description: 'Elements inscribed on the UNESCO Representative List of Intangible Cultural Heritage.',
    unit: 'Number of elements',
    source: 'UNESCO',
    interpretation: 'More inscriptions reflect rich living traditions and cultural practices.',
    color: '#BE185D',
    colorDark: '#EC4899'
  },
  endangeredLanguages: {
    id: 'endangeredLanguages',
    name: 'Endangered Languages',
    shortName: 'Languages at Risk',
    description: 'Number of languages classified as endangered in the country.',
    unit: 'Number of languages',
    source: 'UNESCO Atlas of Languages in Danger',
    interpretation: 'Higher numbers highlight linguistic diversity under threat.',
    color: '#DC2626',
    colorDark: '#F87171'
  },
  languageDiversity: {
    id: 'languageDiversity',
    name: 'Language Diversity Index',
    shortName: 'Lang. Diversity',
    description: 'Probability that two randomly chosen people speak different languages (0-1 scale).',
    unit: 'Index (0-1)',
    source: 'Ethnologue / UNESCO',
    interpretation: 'Higher values indicate greater linguistic and cultural plurality.',
    color: '#7C3AED',
    colorDark: '#A78BFA'
  },
  musicRevenue: {
    id: 'musicRevenue',
    name: 'Recorded Music Revenue',
    shortName: 'Music Revenue',
    description: 'Annual recorded music market revenue including streaming, physical, and downloads.',
    unit: 'Billion US$',
    source: 'IFPI Global Music Report',
    interpretation: 'Higher revenue indicates a strong domestic music industry and cultural output.',
    color: '#E11D48',
    colorDark: '#FB7185'
  },
  gamingRevenue: {
    id: 'gamingRevenue',
    name: 'Video Game Revenue',
    shortName: 'Gaming Revenue',
    description: 'Annual video game market revenue including console, PC, and mobile gaming.',
    unit: 'Billion US$',
    source: 'Newzoo Global Games Market Report',
    interpretation: 'Higher revenue reflects a major contemporary creative industry.',
    color: '#059669',
    colorDark: '#34D399'
  },
  bookTitles: {
    id: 'bookTitles',
    name: 'Book Titles Published',
    shortName: 'Book Titles',
    description: 'Number of new book titles (including new editions) published annually.',
    unit: 'Number of titles',
    source: 'UNESCO UIS / IPA',
    interpretation: 'Higher output reflects a vibrant publishing and literary ecosystem.',
    color: '#B45309',
    colorDark: '#F59E0B'
  },
  ipReceipts: {
    id: 'ipReceipts',
    name: 'Cultural IP Receipts',
    shortName: 'IP Income',
    description: 'Charges for use of intellectual property received from abroad (royalties, licensing).',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher receipts indicate valuable cultural and creative IP assets.',
    color: '#16A34A',
    colorDark: '#4ADE80'
  },
  ipPayments: {
    id: 'ipPayments',
    name: 'Cultural IP Payments',
    shortName: 'IP Costs',
    description: 'Charges for use of intellectual property paid to foreign entities.',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher payments may indicate reliance on foreign creative content and technology.',
    color: '#EA580C',
    colorDark: '#FB923C'
  },
  culturalGoodsImports: {
    id: 'culturalGoodsImports',
    name: 'Cultural Goods Imports',
    shortName: 'Cultural Imports',
    description: 'Value of creative and cultural goods imported by the country.',
    unit: 'Billion US$',
    source: 'UNCTAD Creative Economy',
    interpretation: 'High imports alongside exports indicate an active cultural exchange economy.',
    color: '#0369A1',
    colorDark: '#38BDF8'
  },
  streamingOriginals: {
    id: 'streamingOriginals',
    name: 'Streaming Originals',
    shortName: 'Streaming',
    description: 'Number of original series/films produced for major streaming platforms.',
    unit: 'Number of titles',
    source: 'Ampere Analysis / industry reports',
    interpretation: 'Higher production signals strength in contemporary global content creation.',
    color: '#9333EA',
    colorDark: '#C084FC'
  },
  culturalParticipation: {
    id: 'culturalParticipation',
    name: 'Cultural Participation Rate',
    shortName: 'Participation %',
    description: 'Percentage of population who attended a cultural event or visited a cultural site in the past year.',
    unit: '% of population',
    source: 'Eurostat/OECD/National Surveys',
    interpretation: 'Higher rates indicate active cultural engagement in society.',
    color: '#2563EB',
    colorDark: '#60A5FA'
  },
  performingArts: {
    id: 'performingArts',
    name: 'Performing Arts Attendance',
    shortName: 'Performing Arts',
    description: 'Annual attendance at live performing arts events (theater, concerts, dance) per capita.',
    unit: 'Attendance per capita',
    source: 'Eurostat/National Arts Councils',
    interpretation: 'Higher attendance reflects a thriving live cultural scene.',
    color: '#C026D3',
    colorDark: '#E879F9'
  },
  memoryOfWorld: {
    id: 'memoryOfWorld',
    name: 'Memory of the World',
    shortName: 'MoW Register',
    description: 'Number of documentary heritage items inscribed on the UNESCO Memory of the World Register.',
    unit: 'Number of items',
    source: 'UNESCO Memory of the World',
    interpretation: 'More entries reflect significant documentary and archival heritage.',
    color: '#475569',
    colorDark: '#94A3B8'
  },
  webLanguagePresence: {
    id: 'webLanguagePresence',
    name: 'Web Language Presence',
    shortName: 'Web Language %',
    description: 'Percentage of web content available in the country\'s primary language.',
    unit: '% of web content',
    source: 'W3Techs',
    interpretation: 'Higher presence indicates digital cultural influence and language vitality.',
    color: '#0D9488',
    colorDark: '#2DD4BF'
  }
};

export const culturalChartColors: { [country: string]: string } = {
  USA: '#3B82F6',
  China: '#EF4444',
  Japan: '#F59E0B',
  Germany: '#10B981',
  SouthKorea: '#8B5CF6',
  UK: '#EC4899',
  France: '#06B6D4',
  India: '#F97316',
  Canada: '#84CC16',
  Australia: '#14B8A6',
  Brazil: '#A855F7',
  Mexico: '#0EA5E9',
  Italy: '#6366F1',
  Spain: '#D946EF',
  Netherlands: '#22C55E',
  Sweden: '#FBBF24',
  Switzerland: '#FB7185',
  Russia: '#64748B',
  Turkey: '#C026D3',
  Poland: '#2563EB',
  Indonesia: '#059669',
  SouthAfrica: '#7C3AED',
  Nigeria: '#16A34A',
  Egypt: '#CA8A04',
  SaudiArabia: '#0891B2',
  Argentina: '#9333EA',
  Chile: '#E11D48',
  Norway: '#0D9488',
  Belgium: '#4F46E5',
  Portugal: '#DB2777',
  Israel: '#0D9488',
  Singapore: '#7C3AED'
};

export const defaultCulturalCountries = [
  'France', 'Italy', 'China', 'Spain', 'Germany',
  'UK', 'USA', 'Japan', 'India', 'Mexico'
];

export const culturalCountryGroups = {
  heritageLeaders: {
    name: 'Heritage Leaders',
    description: 'Countries with the most UNESCO World Heritage Sites',
    countries: ['Italy', 'China', 'Germany', 'France', 'Spain'],
    color: '#8B5CF6'
  },
  tourismPowerhouses: {
    name: 'Tourism Powerhouses',
    description: 'Top international tourism destinations',
    countries: ['France', 'Spain', 'USA', 'Italy', 'China'],
    color: '#3B82F6'
  },
  creativeEconomies: {
    name: 'Creative Economies',
    description: 'Leaders in creative goods and services exports',
    countries: ['USA', 'UK', 'France', 'Germany', 'China'],
    color: '#10B981'
  },
  emergingCultural: {
    name: 'Emerging Cultural',
    description: 'Rising cultural capitals from emerging economies',
    countries: ['India', 'Brazil', 'Mexico', 'Indonesia', 'Turkey'],
    color: '#F59E0B'
  }
};

export const culturalCapitalWeights = {
  heritageSites: 0.15,
  tourismArrivals: 0.12,
  tourismReceipts: 0.10,
  creativeGoodsExports: 0.12,
  creativeServicesExports: 0.10,
  museumDensity: 0.08,
  creativeCities: 0.08,
  culturalEmployment: 0.10,
  educationExpenditure: 0.08,
  featureFilms: 0.07
};

// UNESCO World Heritage Sites by country (latest data, updated annually)
export const heritageSitesByCountry: { [country: string]: { total: number; cultural: number; natural: number; mixed: number } } = {
  Italy: { total: 59, cultural: 53, natural: 5, mixed: 1 },
  China: { total: 57, cultural: 39, natural: 14, mixed: 4 },
  Germany: { total: 52, cultural: 49, natural: 3, mixed: 0 },
  France: { total: 52, cultural: 44, natural: 7, mixed: 1 },
  Spain: { total: 50, cultural: 44, natural: 4, mixed: 2 },
  India: { total: 42, cultural: 34, natural: 7, mixed: 1 },
  Mexico: { total: 35, cultural: 28, natural: 6, mixed: 1 },
  UK: { total: 34, cultural: 29, natural: 4, mixed: 1 },
  Russia: { total: 31, cultural: 20, natural: 11, mixed: 0 },
  USA: { total: 25, cultural: 12, natural: 12, mixed: 1 },
  Japan: { total: 25, cultural: 20, natural: 5, mixed: 0 },
  Brazil: { total: 23, cultural: 15, natural: 7, mixed: 1 },
  Australia: { total: 20, cultural: 4, natural: 12, mixed: 4 },
  Canada: { total: 22, cultural: 10, natural: 11, mixed: 1 },
  Turkey: { total: 21, cultural: 19, natural: 0, mixed: 2 },
  SouthKorea: { total: 16, cultural: 14, natural: 2, mixed: 0 },
  Poland: { total: 17, cultural: 15, natural: 1, mixed: 1 },
  Portugal: { total: 17, cultural: 16, natural: 1, mixed: 0 },
  Sweden: { total: 15, cultural: 13, natural: 1, mixed: 1 },
  Belgium: { total: 16, cultural: 15, natural: 1, mixed: 0 },
  Netherlands: { total: 13, cultural: 12, natural: 1, mixed: 0 },
  Switzerland: { total: 13, cultural: 9, natural: 4, mixed: 0 },
  Indonesia: { total: 10, cultural: 6, natural: 4, mixed: 0 },
  Norway: { total: 8, cultural: 7, natural: 1, mixed: 0 },
  Argentina: { total: 12, cultural: 7, natural: 5, mixed: 0 },
  Egypt: { total: 7, cultural: 6, natural: 1, mixed: 0 },
  Chile: { total: 7, cultural: 7, natural: 0, mixed: 0 },
  SouthAfrica: { total: 10, cultural: 5, natural: 4, mixed: 1 },
  Nigeria: { total: 2, cultural: 2, natural: 0, mixed: 0 },
  SaudiArabia: { total: 7, cultural: 6, natural: 1, mixed: 0 },
  Israel: { total: 9, cultural: 9, natural: 0, mixed: 0 },
  Singapore: { total: 1, cultural: 1, natural: 0, mixed: 0 }
};

// UNESCO Creative Cities Network designations by country
export const creativeCitiesByCountry: { [country: string]: { total: number; fields: string[] } } = {
  China: { total: 18, fields: ['Crafts & Folk Art', 'Design', 'Film', 'Gastronomy', 'Literature', 'Media Arts', 'Music'] },
  Italy: { total: 13, fields: ['Crafts & Folk Art', 'Design', 'Film', 'Gastronomy', 'Literature', 'Music'] },
  Spain: { total: 8, fields: ['Design', 'Film', 'Gastronomy', 'Literature', 'Music'] },
  France: { total: 8, fields: ['Crafts & Folk Art', 'Design', 'Gastronomy', 'Literature', 'Media Arts'] },
  Brazil: { total: 7, fields: ['Design', 'Film', 'Gastronomy', 'Music'] },
  UK: { total: 6, fields: ['Design', 'Film', 'Literature', 'Music', 'Media Arts'] },
  Japan: { total: 6, fields: ['Crafts & Folk Art', 'Design', 'Film', 'Media Arts', 'Music'] },
  Germany: { total: 6, fields: ['Design', 'Literature', 'Media Arts', 'Music'] },
  USA: { total: 5, fields: ['Design', 'Film', 'Gastronomy', 'Literature', 'Music'] },
  India: { total: 5, fields: ['Crafts & Folk Art', 'Design', 'Film', 'Gastronomy', 'Music'] },
  SouthKorea: { total: 5, fields: ['Crafts & Folk Art', 'Design', 'Gastronomy', 'Media Arts', 'Music'] },
  Turkey: { total: 5, fields: ['Crafts & Folk Art', 'Design', 'Gastronomy', 'Literature'] },
  Mexico: { total: 5, fields: ['Crafts & Folk Art', 'Design', 'Gastronomy', 'Music'] },
  Argentina: { total: 4, fields: ['Design', 'Film', 'Gastronomy', 'Music'] },
  Poland: { total: 3, fields: ['Film', 'Gastronomy', 'Literature'] },
  Australia: { total: 3, fields: ['Design', 'Film', 'Literature'] },
  Russia: { total: 3, fields: ['Crafts & Folk Art', 'Music'] },
  Canada: { total: 3, fields: ['Design', 'Literature', 'Media Arts'] },
  Sweden: { total: 2, fields: ['Design', 'Literature'] },
  Portugal: { total: 2, fields: ['Crafts & Folk Art', 'Literature'] },
  Netherlands: { total: 2, fields: ['Design', 'Literature'] },
  Indonesia: { total: 3, fields: ['Crafts & Folk Art', 'Design', 'Gastronomy'] },
  Egypt: { total: 2, fields: ['Crafts & Folk Art'] },
  Norway: { total: 1, fields: ['Literature'] },
  Belgium: { total: 2, fields: ['Design', 'Gastronomy'] },
  Switzerland: { total: 1, fields: ['Design'] },
  Chile: { total: 1, fields: ['Music'] },
  SouthAfrica: { total: 2, fields: ['Design', 'Gastronomy'] },
  Nigeria: { total: 1, fields: ['Music'] },
  SaudiArabia: { total: 1, fields: ['Design'] },
  Israel: { total: 1, fields: ['Design'] },
  Singapore: { total: 1, fields: ['Design'] }
};

// Museum density per million inhabitants (curated from ICOM / national statistics)
export const museumDensityByCountry: { [country: string]: number } = {
  Sweden: 240,
  Norway: 210,
  Switzerland: 195,
  Netherlands: 175,
  Germany: 170,
  UK: 150,
  France: 140,
  USA: 115,
  Italy: 112,
  Belgium: 110,
  Canada: 95,
  Australia: 90,
  Spain: 85,
  Portugal: 78,
  Japan: 72,
  Poland: 65,
  SouthKorea: 55,
  Chile: 45,
  Argentina: 40,
  Mexico: 35,
  Russia: 32,
  Turkey: 28,
  Brazil: 22,
  China: 18,
  SouthAfrica: 15,
  India: 8,
  Egypt: 6,
  Indonesia: 4,
  SaudiArabia: 3,
  Nigeria: 1,
  Israel: 110,
  Singapore: 60
};

// Global Soft Power Index 2024 rankings (Brand Finance)
export const softPowerRankings: { [country: string]: { rank: number; score: number } } = {
  USA: { rank: 1, score: 74.8 },
  UK: { rank: 2, score: 67.3 },
  Germany: { rank: 3, score: 64.7 },
  Japan: { rank: 4, score: 63.2 },
  China: { rank: 5, score: 62.4 },
  France: { rank: 6, score: 61.9 },
  Canada: { rank: 7, score: 59.8 },
  Switzerland: { rank: 8, score: 58.2 },
  Italy: { rank: 9, score: 56.5 },
  SouthKorea: { rank: 10, score: 55.3 },
  Australia: { rank: 11, score: 54.1 },
  Sweden: { rank: 12, score: 53.5 },
  Netherlands: { rank: 13, score: 52.8 },
  Spain: { rank: 14, score: 52.1 },
  India: { rank: 15, score: 50.9 },
  Norway: { rank: 17, score: 49.3 },
  Singapore: { rank: 18, score: 48.7 },
  Brazil: { rank: 19, score: 47.2 },
  Belgium: { rank: 21, score: 45.6 },
  Russia: { rank: 22, score: 45.1 },
  Turkey: { rank: 24, score: 43.8 },
  Israel: { rank: 25, score: 42.5 },
  Mexico: { rank: 27, score: 41.2 },
  Poland: { rank: 28, score: 40.1 },
  Portugal: { rank: 29, score: 39.8 },
  SaudiArabia: { rank: 30, score: 39.5 },
  Argentina: { rank: 32, score: 38.2 },
  SouthAfrica: { rank: 33, score: 37.8 },
  Egypt: { rank: 35, score: 36.1 },
  Indonesia: { rank: 36, score: 35.4 },
  Chile: { rank: 39, score: 33.2 },
  Nigeria: { rank: 45, score: 28.9 }
};

// Creative goods exports in billions USD (UNCTAD 2023 data)
export const creativeGoodsExportsByCountry: { [country: string]: number } = {
  China: 183.4,
  Italy: 52.8,
  USA: 38.2,
  Germany: 35.6,
  France: 32.1,
  UK: 24.7,
  India: 19.3,
  Turkey: 15.8,
  Netherlands: 14.2,
  Spain: 12.5,
  Poland: 11.3,
  Belgium: 9.8,
  Japan: 9.2,
  SouthKorea: 8.7,
  Mexico: 8.1,
  Switzerland: 7.6,
  Brazil: 6.2,
  Indonesia: 5.8,
  Portugal: 4.9,
  Canada: 4.5,
  Australia: 3.1,
  Sweden: 3.0,
  Argentina: 2.8,
  SouthAfrica: 2.4,
  Chile: 1.8,
  Norway: 1.5,
  Russia: 4.3,
  Egypt: 1.9,
  SaudiArabia: 1.2,
  Nigeria: 0.6,
  Israel: 3.5,
  Singapore: 6.1
};

// Creative services exports in billions USD (UNCTAD 2023 data)
export const creativeServicesExportsByCountry: { [country: string]: number } = {
  USA: 247.5,
  UK: 102.3,
  India: 94.1,
  Germany: 92.4,
  France: 58.7,
  Netherlands: 52.1,
  China: 45.3,
  Japan: 28.6,
  Singapore: 25.8,
  Canada: 24.2,
  Switzerland: 22.1,
  SouthKorea: 19.5,
  Sweden: 18.3,
  Spain: 16.7,
  Italy: 15.4,
  Australia: 14.8,
  Belgium: 12.6,
  Poland: 10.9,
  Israel: 10.5,
  Brazil: 9.2,
  Norway: 8.1,
  Portugal: 6.8,
  Turkey: 5.3,
  Mexico: 4.7,
  Russia: 4.2,
  SouthAfrica: 3.8,
  Argentina: 3.5,
  Chile: 2.9,
  Indonesia: 2.4,
  Egypt: 1.8,
  SaudiArabia: 1.5,
  Nigeria: 0.9
};

// Cultural employment share % (OECD/Eurostat/ILO estimates)
export const culturalEmploymentByCountry: { [country: string]: number } = {
  UK: 5.8,
  Sweden: 5.5,
  Netherlands: 5.2,
  Germany: 5.0,
  Switzerland: 4.8,
  France: 4.7,
  USA: 4.5,
  Norway: 4.4,
  Belgium: 4.2,
  Canada: 4.1,
  Australia: 4.0,
  Spain: 3.8,
  Italy: 3.7,
  SouthKorea: 3.6,
  Japan: 3.4,
  Portugal: 3.3,
  Poland: 3.1,
  Israel: 3.0,
  Singapore: 2.9,
  Chile: 2.5,
  Argentina: 2.4,
  Mexico: 2.3,
  Turkey: 2.2,
  Brazil: 2.1,
  Russia: 2.0,
  China: 1.9,
  SouthAfrica: 1.8,
  Indonesia: 1.5,
  Egypt: 1.2,
  India: 1.1,
  SaudiArabia: 1.0,
  Nigeria: 0.8
};

// Feature films produced annually (UNESCO UIS / national sources)
export const featureFilmsByCountry: { [country: string]: number } = {
  India: 1986,
  China: 902,
  USA: 799,
  Japan: 689,
  UK: 285,
  France: 271,
  SouthKorea: 258,
  Germany: 237,
  Spain: 218,
  Italy: 196,
  Turkey: 184,
  Brazil: 175,
  Russia: 168,
  Mexico: 152,
  Argentina: 132,
  Indonesia: 115,
  Canada: 108,
  Australia: 95,
  Sweden: 62,
  Poland: 58,
  Netherlands: 52,
  Belgium: 48,
  Portugal: 38,
  Norway: 35,
  Switzerland: 32,
  Chile: 28,
  SouthAfrica: 25,
  Egypt: 42,
  Israel: 40,
  Singapore: 18,
  SaudiArabia: 12,
  Nigeria: 250
};

// Tourism receipts fallback data in billions USD (UNWTO / World Bank)
export const tourismReceiptsFallbackData: { year: number; [country: string]: number }[] = [
  { year: 2010, France: 46.6, USA: 167.0, Spain: 54.6, Italy: 38.8, China: 45.8, UK: 32.4, Germany: 34.7, Japan: 13.2, Mexico: 12.0, India: 14.5, Turkey: 22.6, Australia: 29.8, Canada: 15.8, SouthKorea: 10.3, Brazil: 5.7 },
  { year: 2011, France: 53.8, USA: 178.3, Spain: 59.9, Italy: 43.0, China: 48.5, UK: 35.1, Germany: 38.9, Japan: 11.0, Mexico: 11.9, India: 17.5, Turkey: 25.1, Australia: 31.5, Canada: 16.8, SouthKorea: 12.4, Brazil: 6.6 },
  { year: 2012, France: 53.6, USA: 181.3, Spain: 58.0, Italy: 41.2, China: 50.0, UK: 36.4, Germany: 38.1, Japan: 14.6, Mexico: 12.7, India: 17.7, Turkey: 25.3, Australia: 31.5, Canada: 17.1, SouthKorea: 13.4, Brazil: 6.6 },
  { year: 2013, France: 56.7, USA: 195.3, Spain: 62.6, Italy: 43.9, China: 51.7, UK: 41.0, Germany: 41.3, Japan: 15.1, Mexico: 13.9, India: 18.4, Turkey: 27.9, Australia: 30.1, Canada: 17.7, SouthKorea: 14.6, Brazil: 6.7 },
  { year: 2014, France: 58.1, USA: 206.9, Spain: 65.1, Italy: 45.5, China: 44.4, UK: 45.5, Germany: 43.3, Japan: 18.9, Mexico: 16.2, India: 19.7, Turkey: 29.6, Australia: 28.6, Canada: 17.4, SouthKorea: 17.7, Brazil: 6.8 },
  { year: 2015, France: 45.9, USA: 206.0, Spain: 56.5, Italy: 39.4, China: 45.0, UK: 45.5, Germany: 36.9, Japan: 24.9, Mexico: 17.7, India: 21.0, Turkey: 26.6, Australia: 28.9, Canada: 16.5, SouthKorea: 15.2, Brazil: 5.8 },
  { year: 2016, France: 42.5, USA: 205.9, Spain: 60.3, Italy: 40.2, China: 44.4, UK: 39.5, Germany: 37.4, Japan: 30.7, Mexico: 19.6, India: 22.4, Turkey: 18.7, Australia: 32.4, Canada: 18.0, SouthKorea: 17.2, Brazil: 6.0 },
  { year: 2017, France: 60.7, USA: 210.7, Spain: 68.1, Italy: 44.2, China: 38.6, UK: 44.5, Germany: 39.8, Japan: 34.1, Mexico: 21.3, India: 27.3, Turkey: 22.5, Australia: 38.1, Canada: 20.2, SouthKorea: 13.3, Brazil: 5.8 },
  { year: 2018, France: 67.4, USA: 214.5, Spain: 73.8, Italy: 49.3, China: 40.4, UK: 48.5, Germany: 43.0, Japan: 41.1, Mexico: 22.5, India: 28.6, Turkey: 25.2, Australia: 38.2, Canada: 21.8, SouthKorea: 15.3, Brazil: 5.9 },
  { year: 2019, France: 63.8, USA: 193.3, Spain: 79.7, Italy: 49.6, China: 35.8, UK: 52.7, Germany: 41.6, Japan: 46.1, Mexico: 24.6, India: 30.1, Turkey: 29.8, Australia: 37.5, Canada: 22.1, SouthKorea: 17.5, Brazil: 5.9 },
  { year: 2020, France: 29.4, USA: 74.4, Spain: 19.7, Italy: 17.3, China: 11.8, UK: 18.9, Germany: 16.6, Japan: 7.1, Mexico: 10.3, India: 6.9, Turkey: 10.2, Australia: 14.3, Canada: 7.5, SouthKorea: 5.1, Brazil: 3.1 },
  { year: 2021, France: 40.3, USA: 97.0, Spain: 36.4, Italy: 27.2, China: 8.6, UK: 22.0, Germany: 20.4, Japan: 1.9, Mexico: 19.8, India: 8.8, Turkey: 24.5, Australia: 5.8, Canada: 7.3, SouthKorea: 4.1, Brazil: 3.5 },
  { year: 2022, France: 67.9, USA: 167.6, Spain: 72.5, Italy: 48.0, China: 11.1, UK: 49.4, Germany: 38.2, Japan: 9.0, Mexico: 28.0, India: 23.5, Turkey: 46.3, Australia: 16.8, Canada: 17.8, SouthKorea: 9.7, Brazil: 5.2 },
];

// Tourism expenditure fallback data in billions USD (UNWTO / World Bank)
export const tourismExpenditureFallbackData: { year: number; [country: string]: number }[] = [
  { year: 2010, China: 54.9, USA: 110.1, Germany: 78.1, UK: 50.0, France: 39.4, Canada: 29.6, Russia: 26.6, Italy: 27.1, Australia: 22.5, Japan: 27.9, Brazil: 16.4, India: 11.1, Spain: 16.2, Mexico: 7.5, SouthKorea: 21.7, Turkey: 7.6 },
  { year: 2011, China: 72.6, USA: 116.1, Germany: 85.8, UK: 51.0, France: 44.0, Canada: 33.4, Russia: 32.5, Italy: 28.7, Australia: 26.7, Japan: 27.2, Brazil: 21.3, India: 12.1, Spain: 16.2, Mexico: 8.1, SouthKorea: 22.6, Turkey: 7.3 },
  { year: 2012, China: 102.0, USA: 117.5, Germany: 81.3, UK: 52.3, France: 40.5, Canada: 35.2, Russia: 42.8, Italy: 26.4, Australia: 28.3, Japan: 28.1, Brazil: 22.2, India: 12.6, Spain: 15.1, Mexico: 9.2, SouthKorea: 23.3, Turkey: 7.5 },
  { year: 2013, China: 128.6, USA: 120.4, Germany: 85.9, UK: 52.6, France: 42.5, Canada: 35.1, Russia: 53.5, Italy: 27.0, Australia: 28.4, Japan: 21.8, Brazil: 25.1, India: 12.2, Spain: 14.8, Mexico: 9.5, SouthKorea: 24.6, Turkey: 8.5 },
  { year: 2014, China: 164.9, USA: 130.8, Germany: 92.2, UK: 57.6, France: 47.0, Canada: 33.3, Russia: 50.4, Italy: 28.8, Australia: 26.2, Japan: 18.8, Brazil: 25.6, India: 14.4, Spain: 16.9, Mexico: 10.1, SouthKorea: 23.4, Turkey: 9.8 },
  { year: 2015, China: 249.8, USA: 136.8, Germany: 77.5, UK: 63.3, France: 38.4, Canada: 29.4, Russia: 34.9, Italy: 24.5, Australia: 23.2, Japan: 16.0, Brazil: 17.4, India: 13.0, Spain: 16.4, Mexico: 10.4, SouthKorea: 25.1, Turkey: 8.2 },
  { year: 2016, China: 261.1, USA: 135.9, Germany: 81.1, UK: 63.6, France: 40.5, Canada: 31.1, Russia: 27.6, Italy: 25.0, Australia: 24.6, Japan: 17.4, Brazil: 13.3, India: 14.9, Spain: 18.2, Mexico: 10.7, SouthKorea: 26.6, Turkey: 5.0 },
  { year: 2017, China: 257.7, USA: 153.5, Germany: 89.1, UK: 71.4, France: 41.4, Canada: 33.0, Russia: 31.1, Italy: 27.8, Australia: 28.2, Japan: 17.7, Brazil: 15.0, India: 19.4, Spain: 22.0, Mexico: 10.8, SouthKorea: 30.6, Turkey: 5.1 },
  { year: 2018, China: 277.3, USA: 152.3, Germany: 94.2, UK: 75.8, France: 43.4, Canada: 33.0, Russia: 34.8, Italy: 30.1, Australia: 32.6, Japan: 19.4, Brazil: 15.2, India: 22.0, Spain: 22.8, Mexico: 11.2, SouthKorea: 32.2, Turkey: 4.9 },
  { year: 2019, France: 50.5, USA: 152.0, Germany: 93.0, UK: 71.9, China: 254.6, Canada: 35.0, Russia: 36.2, Italy: 30.6, Australia: 34.0, Japan: 21.0, Brazil: 14.9, India: 22.3, Spain: 24.2, Mexico: 12.5, SouthKorea: 28.7, Turkey: 4.8 },
  { year: 2020, France: 22.5, USA: 50.5, Germany: 43.5, UK: 26.0, China: 131.8, Canada: 9.3, Russia: 11.6, Italy: 8.2, Australia: 6.3, Japan: 4.6, Brazil: 4.4, India: 5.3, Spain: 5.3, Mexico: 4.1, SouthKorea: 8.2, Turkey: 2.8 },
  { year: 2021, France: 29.2, USA: 65.0, Germany: 46.0, UK: 32.1, China: 105.0, Canada: 10.3, Russia: 16.0, Italy: 11.0, Australia: 3.1, Japan: 2.5, Brazil: 4.9, India: 7.8, Spain: 9.2, Mexico: 6.8, SouthKorea: 8.8, Turkey: 5.3 },
  { year: 2022, France: 46.8, USA: 135.4, Germany: 73.6, UK: 60.5, China: 115.0, Canada: 26.2, Russia: 12.0, Italy: 24.1, Australia: 18.6, Japan: 8.5, Brazil: 8.5, India: 16.5, Spain: 19.8, Mexico: 10.6, SouthKorea: 15.5, Turkey: 8.8 },
];

// Trademark applications fallback data (WIPO / World Bank, resident filings)
export const trademarkFallbackData: { year: number; [country: string]: number }[] = [
  { year: 2010, USA: 296041, China: 1054798, Japan: 124790, Germany: 69143, France: 79426, UK: 53875, India: 148000, Italy: 52637, Spain: 46580, Mexico: 87857, SouthKorea: 122543, Brazil: 117672, Canada: 32274, Australia: 51936, Turkey: 65594, Russia: 41752 },
  { year: 2011, USA: 303481, China: 1217606, Japan: 126693, Germany: 72104, France: 83249, UK: 57432, India: 158849, Italy: 53141, Spain: 47044, Mexico: 93148, SouthKorea: 127498, Brazil: 124272, Canada: 33685, Australia: 53296, Turkey: 71600, Russia: 44297 },
  { year: 2012, USA: 312265, China: 1481526, Japan: 129445, Germany: 71908, France: 84197, UK: 56127, India: 170329, Italy: 52003, Spain: 44979, Mexico: 97783, SouthKorea: 132132, Brazil: 131805, Canada: 34340, Australia: 54774, Turkey: 81472, Russia: 47161 },
  { year: 2013, USA: 325625, China: 1651104, Japan: 131107, Germany: 71963, France: 83741, UK: 55853, India: 183591, Italy: 52120, Spain: 46195, Mexico: 102052, SouthKorea: 139380, Brazil: 139691, Canada: 34866, Australia: 57262, Turkey: 95498, Russia: 51263 },
  { year: 2014, USA: 340683, China: 1886085, Japan: 130053, Germany: 74165, France: 84682, UK: 57124, India: 195426, Italy: 53254, Spain: 47637, Mexico: 106428, SouthKorea: 147171, Brazil: 147073, Canada: 35667, Australia: 59285, Turkey: 108276, Russia: 52572 },
  { year: 2015, USA: 348782, China: 2136825, Japan: 130755, Germany: 71282, France: 80703, UK: 57319, India: 211354, Italy: 51632, Spain: 46432, Mexico: 107389, SouthKorea: 164680, Brazil: 152996, Canada: 35666, Australia: 59710, Turkey: 121753, Russia: 50879 },
  { year: 2016, USA: 361466, China: 2690272, Japan: 131029, Germany: 72254, France: 78765, UK: 58200, India: 235343, Italy: 52654, Spain: 47538, Mexico: 112685, SouthKorea: 176860, Brazil: 152141, Canada: 37016, Australia: 62153, Turkey: 118432, Russia: 50781 },
  { year: 2017, USA: 379874, China: 3441762, Japan: 137740, Germany: 72300, France: 79413, UK: 56893, India: 272405, Italy: 54093, Spain: 48643, Mexico: 123137, SouthKorea: 181606, Brazil: 153826, Canada: 38496, Australia: 65105, Turkey: 115800, Russia: 48510 },
  { year: 2018, USA: 394163, China: 5016917, Japan: 138479, Germany: 73063, France: 78793, UK: 57065, India: 310003, Italy: 53423, Spain: 49308, Mexico: 123921, SouthKorea: 190757, Brazil: 164082, Canada: 39119, Australia: 66744, Turkey: 103899, Russia: 46591 },
  { year: 2019, USA: 398283, China: 5207892, Japan: 131770, Germany: 72013, France: 78090, UK: 55726, India: 330810, Italy: 53025, Spain: 49437, Mexico: 120925, SouthKorea: 206910, Brazil: 165277, Canada: 39082, Australia: 67036, Turkey: 104612, Russia: 48063 },
  { year: 2020, USA: 420508, China: 5724558, Japan: 131089, Germany: 73052, France: 78400, UK: 53182, India: 348668, Italy: 51421, Spain: 46300, Mexico: 107620, SouthKorea: 218917, Brazil: 168768, Canada: 38712, Australia: 65250, Turkey: 128126, Russia: 46876 },
  { year: 2021, USA: 470338, China: 6100000, Japan: 130100, Germany: 73800, France: 80200, UK: 56700, India: 371000, Italy: 53100, Spain: 48100, Mexico: 115300, SouthKorea: 227800, Brazil: 175200, Canada: 40300, Australia: 67200, Turkey: 155000, Russia: 47500 },
  { year: 2022, USA: 458500, China: 5800000, Japan: 128300, Germany: 72500, France: 79100, UK: 55900, India: 395000, Italy: 52600, Spain: 47800, Mexico: 118400, SouthKorea: 234500, Brazil: 180100, Canada: 39800, Australia: 66100, Turkey: 148000, Russia: 44200 },
];

// World Heritage Sites currently on the "In Danger" list (UNESCO, 2024)
export const endangeredSitesByCountry: Record<string, number> = {
  Syria: 6, Libya: 5, DRCongo: 5, Iraq: 3, Yemen: 4, Afghanistan: 2,
  Palestine: 3, Mali: 4, Niger: 2, Ukraine: 3, Egypt: 1, Honduras: 1,
  Venezuela: 1, Micronesia: 1, Bolivia: 1, Austria: 1, Indonesia: 1,
  USA: 1, UK: 1, Mexico: 1, Tanzania: 1, Uganda: 1, Peru: 1,
  Georgia: 1, Panama: 1, SolomonIslands: 1, Lebanon: 1, Kenya: 1,
};

// Library density: public libraries per million inhabitants (IFLA / national statistics)
export const libraryDensityByCountry: Record<string, number> = {
  USA: 49, UK: 58, Germany: 76, France: 46, Japan: 26, China: 2.3, India: 0.4,
  Italy: 100, Spain: 110, Canada: 97, Australia: 54, SouthKorea: 22, Brazil: 3.8,
  Mexico: 6.2, Turkey: 4.5, Russia: 28, Netherlands: 70, Sweden: 112, Norway: 90,
  Denmark: 85, Finland: 154, Austria: 62, Belgium: 45, Switzerland: 55, Poland: 19,
  CzechRepublic: 54, Portugal: 30, Ireland: 40, NewZealand: 52, Argentina: 4.0,
  Chile: 5.1, SouthAfrica: 3.3, Egypt: 0.6, Nigeria: 0.2, Indonesia: 0.5,
  Thailand: 3.0, Singapore: 11, SaudiArabia: 1.5, Israel: 38
};

// Intangible Cultural Heritage inscriptions (UNESCO Representative List, cumulative 2024)
export const intangibleHeritageByCountry: Record<string, number> = {
  China: 43, France: 26, Japan: 22, SouthKorea: 22, Spain: 21, Turkey: 24,
  India: 16, Italy: 16, Belgium: 14, Mexico: 12, Brazil: 8, Germany: 8,
  USA: 1, UK: 7, Indonesia: 13, Vietnam: 15, Mongolia: 12, Iran: 21,
  Colombia: 12, Peru: 11, Croatia: 18, Azerbaijan: 17, Russia: 5, Portugal: 9,
  Argentina: 7, Egypt: 8, Nigeria: 5, Morocco: 12, SaudiArabia: 11,
  UAE: 14, Thailand: 5, Malaysia: 5, Philippines: 4, Chile: 3, Australia: 1,
  Canada: 2, SouthAfrica: 2, Kenya: 8, Ethiopia: 5, Cuba: 5, Greece: 9
};

// Endangered languages by country (UNESCO Atlas of Languages in Danger)
export const endangeredLanguagesByCountry: Record<string, number> = {
  USA: 191, India: 197, Brazil: 178, Indonesia: 146, China: 144, Mexico: 143,
  Russia: 131, Australia: 108, Nigeria: 29, Canada: 87, Colombia: 68,
  Nepal: 71, Papua_New_Guinea: 88, Peru: 62, Japan: 8, France: 26,
  UK: 12, Germany: 3, Italy: 31, Spain: 11, Turkey: 15, Iran: 22,
  Philippines: 35, Thailand: 25, Malaysia: 18, Vietnam: 15, Myanmar: 28,
  SouthAfrica: 5, Kenya: 14, Ethiopia: 18, Argentina: 36, Chile: 8,
  Bolivia: 29, Guatemala: 23, Tanzania: 8, Cameroon: 16
};

// Language Diversity Index (Greenberg, 0-1, where 1=max diversity)
export const languageDiversityIndex: Record<string, number> = {
  PapuaNewGuinea: 0.990, Cameroon: 0.974, India: 0.930, Nigeria: 0.868,
  SouthAfrica: 0.865, Tanzania: 0.965, Indonesia: 0.846, Philippines: 0.842,
  Kenya: 0.886, Ethiopia: 0.842, Malaysia: 0.597, China: 0.491,
  Canada: 0.573, USA: 0.353, Belgium: 0.541, Switzerland: 0.544,
  Russia: 0.312, Mexico: 0.152, Brazil: 0.107, Australia: 0.336,
  Spain: 0.413, France: 0.175, UK: 0.139, Italy: 0.115, Germany: 0.168,
  Japan: 0.018, SouthKorea: 0.002, Argentina: 0.062, Turkey: 0.222,
  Iran: 0.746, Thailand: 0.634, Vietnam: 0.237, Colombia: 0.024,
  Peru: 0.341, Chile: 0.038, Egypt: 0.024, SaudiArabia: 0.085,
  Israel: 0.548, Singapore: 0.385, NewZealand: 0.166, Poland: 0.028
};

// Recorded music revenue by country in billions USD (IFPI, 2018-2023)
export const musicRevenueFallbackData: { year: number; [country: string]: number }[] = [
  { year: 2018, USA: 9.83, Japan: 2.76, UK: 1.56, Germany: 1.40, France: 0.95, China: 0.90, SouthKorea: 0.58, Canada: 0.56, Australia: 0.52, Brazil: 0.37, India: 0.16, Italy: 0.28, Spain: 0.24, Mexico: 0.24, Netherlands: 0.24, Sweden: 0.20 },
  { year: 2019, USA: 11.14, Japan: 2.78, UK: 1.72, Germany: 1.55, France: 1.04, China: 1.09, SouthKorea: 0.64, Canada: 0.60, Australia: 0.54, Brazil: 0.44, India: 0.19, Italy: 0.31, Spain: 0.27, Mexico: 0.27, Netherlands: 0.27, Sweden: 0.22 },
  { year: 2020, USA: 12.15, Japan: 2.72, UK: 1.85, Germany: 1.62, France: 1.05, China: 1.52, SouthKorea: 0.69, Canada: 0.63, Australia: 0.55, Brazil: 0.43, India: 0.20, Italy: 0.30, Spain: 0.26, Mexico: 0.29, Netherlands: 0.28, Sweden: 0.23 },
  { year: 2021, USA: 14.19, Japan: 2.60, UK: 2.12, Germany: 1.79, France: 1.16, China: 2.00, SouthKorea: 0.79, Canada: 0.72, Australia: 0.63, Brazil: 0.53, India: 0.24, Italy: 0.35, Spain: 0.31, Mexico: 0.34, Netherlands: 0.32, Sweden: 0.25 },
  { year: 2022, USA: 15.90, Japan: 2.64, UK: 2.32, Germany: 1.91, France: 1.26, China: 2.27, SouthKorea: 0.88, Canada: 0.80, Australia: 0.68, Brazil: 0.64, India: 0.29, Italy: 0.39, Spain: 0.36, Mexico: 0.39, Netherlands: 0.35, Sweden: 0.27 },
  { year: 2023, USA: 17.10, Japan: 2.68, UK: 2.52, Germany: 2.04, France: 1.38, China: 2.55, SouthKorea: 0.97, Canada: 0.87, Australia: 0.74, Brazil: 0.73, India: 0.35, Italy: 0.44, Spain: 0.40, Mexico: 0.44, Netherlands: 0.38, Sweden: 0.29 },
];

// Video game revenue by country in billions USD (Newzoo, 2018-2023)
export const gamingRevenueFallbackData: { year: number; [country: string]: number }[] = [
  { year: 2018, China: 37.9, USA: 30.4, Japan: 19.2, SouthKorea: 6.2, Germany: 5.4, UK: 5.1, France: 3.7, Canada: 2.4, Italy: 2.2, Spain: 2.1, Brazil: 1.5, Australia: 1.5, India: 1.1, Mexico: 1.6, Russia: 1.8, Indonesia: 1.1, Turkey: 0.8 },
  { year: 2019, China: 40.5, USA: 32.1, Japan: 18.7, SouthKorea: 6.6, Germany: 5.9, UK: 5.5, France: 4.0, Canada: 2.6, Italy: 2.4, Spain: 2.3, Brazil: 1.7, Australia: 1.7, India: 1.5, Mexico: 1.8, Russia: 1.9, Indonesia: 1.3, Turkey: 0.9 },
  { year: 2020, China: 44.0, USA: 36.9, Japan: 20.5, SouthKorea: 7.5, Germany: 6.8, UK: 6.3, France: 4.5, Canada: 3.0, Italy: 2.8, Spain: 2.5, Brazil: 2.1, Australia: 2.1, India: 1.8, Mexico: 2.1, Russia: 2.1, Indonesia: 1.5, Turkey: 1.0 },
  { year: 2021, China: 46.0, USA: 42.1, Japan: 22.5, SouthKorea: 8.2, Germany: 7.4, UK: 7.0, France: 5.0, Canada: 3.3, Italy: 3.0, Spain: 2.7, Brazil: 2.3, Australia: 2.4, India: 2.2, Mexico: 2.4, Russia: 2.3, Indonesia: 1.7, Turkey: 1.2 },
  { year: 2022, China: 45.5, USA: 46.5, Japan: 23.0, SouthKorea: 8.6, Germany: 7.7, UK: 7.3, France: 5.2, Canada: 3.5, Italy: 3.1, Spain: 2.8, Brazil: 2.5, Australia: 2.5, India: 2.6, Mexico: 2.6, Russia: 2.1, Indonesia: 1.9, Turkey: 1.3 },
  { year: 2023, China: 46.8, USA: 49.6, Japan: 23.3, SouthKorea: 9.1, Germany: 8.0, UK: 7.6, France: 5.5, Canada: 3.7, Italy: 3.3, Spain: 2.9, Brazil: 2.8, Australia: 2.7, India: 3.1, Mexico: 2.8, Russia: 2.0, Indonesia: 2.1, Turkey: 1.4 },
];

// Book titles published annually (UNESCO UIS / IPA, approximate)
export const bookTitlesByCountry: Record<string, number> = {
  China: 510000, UK: 184000, USA: 304000, Russia: 101000, Germany: 82000,
  Japan: 72000, India: 90000, France: 70000, Spain: 86000, Italy: 65000,
  Brazil: 65000, SouthKorea: 45000, Turkey: 60000, Iran: 65000,
  Poland: 30000, Argentina: 28000, Canada: 25000, Australia: 22000,
  Mexico: 24000, Netherlands: 27000, CzechRepublic: 18000, Sweden: 14000,
  Indonesia: 30000, Colombia: 16000, Egypt: 18000, Nigeria: 5000,
  SouthAfrica: 4500, Thailand: 15000, Vietnam: 30000, Taiwan: 40000
};

// Cultural goods imports in billions USD (UNCTAD, approximate)
export const culturalGoodsImportsByCountry: Record<string, number> = {
  USA: 32.5, UK: 14.1, Germany: 11.8, France: 10.2, China: 8.4,
  Japan: 7.5, Canada: 5.2, Italy: 4.8, Netherlands: 5.1, Spain: 3.6,
  Australia: 3.8, SouthKorea: 4.2, Belgium: 3.0, Switzerland: 2.9,
  Mexico: 2.6, Brazil: 1.4, India: 1.8, Russia: 1.2, Turkey: 1.5,
  Sweden: 2.1, Poland: 1.6, SaudiArabia: 1.3, Singapore: 2.4,
  UAE: 3.1, Thailand: 1.1, Indonesia: 0.8, SouthAfrica: 0.9, Argentina: 0.5
};

// Streaming originals produced (Netflix/Amazon/Disney+/Apple+ combined, approximate 2023)
export const streamingOriginalsByCountry: Record<string, number> = {
  USA: 820, UK: 195, SouthKorea: 140, Japan: 95, India: 175, Germany: 85,
  France: 78, Spain: 72, Brazil: 68, Mexico: 52, Italy: 55, Turkey: 65,
  Australia: 38, Canada: 55, Sweden: 30, Netherlands: 25, Argentina: 35,
  Colombia: 28, Poland: 22, Indonesia: 20, Thailand: 18, Nigeria: 25,
  SouthAfrica: 15, Denmark: 22, Norway: 18, Israel: 20, Egypt: 12,
  Philippines: 14, Belgium: 12, CzechRepublic: 10
};

// Cultural participation rate (% of population attending cultural event in past 12 months)
export const culturalParticipationByCountry: Record<string, number> = {
  Sweden: 78, Denmark: 76, Finland: 74, Netherlands: 72, Norway: 71,
  Germany: 68, UK: 67, France: 65, Austria: 64, Belgium: 62, Ireland: 63,
  Switzerland: 70, Canada: 66, Australia: 64, USA: 60, Spain: 55,
  Italy: 52, Japan: 48, SouthKorea: 55, CzechRepublic: 58, Poland: 44,
  Portugal: 42, Greece: 38, Turkey: 32, Brazil: 30, Mexico: 35,
  China: 28, India: 20, Russia: 45, Argentina: 42, Chile: 48,
  SouthAfrica: 22, Nigeria: 18, Indonesia: 15, Thailand: 25, Singapore: 58
};

// Performing arts attendance per capita (annual, approximate)
export const performingArtsPerCapita: Record<string, number> = {
  UK: 3.2, Germany: 2.8, Austria: 3.5, USA: 2.1, France: 2.5, Australia: 2.0,
  Canada: 1.9, Netherlands: 2.7, Sweden: 2.4, Denmark: 2.6, Japan: 1.8,
  SouthKorea: 2.3, Switzerland: 2.9, Norway: 2.5, Finland: 2.3, Belgium: 2.2,
  Ireland: 1.8, Spain: 1.6, Italy: 1.7, CzechRepublic: 2.0, Poland: 1.3,
  Russia: 1.5, Brazil: 0.6, Mexico: 0.5, China: 0.4, India: 0.2,
  Turkey: 0.7, Argentina: 1.1, Chile: 0.9, SouthAfrica: 0.4, Singapore: 1.5
};

// Memory of the World register entries (UNESCO, cumulative)
export const memoryOfWorldByCountry: Record<string, number> = {
  Germany: 24, UK: 22, Poland: 17, Netherlands: 15, Austria: 15,
  France: 14, Russia: 14, Mexico: 13, SouthKorea: 16, Brazil: 8,
  India: 10, China: 13, Japan: 7, USA: 7, Australia: 9, Canada: 6,
  CzechRepublic: 9, Spain: 7, Italy: 6, Turkey: 5, Indonesia: 8,
  Thailand: 4, Iran: 7, Colombia: 5, Argentina: 4, Philippines: 5,
  Egypt: 5, SouthAfrica: 4, Peru: 4, Denmark: 4, Sweden: 4
};

// Web content by primary language (% of total web content, W3Techs)
export const webLanguagePresenceByCountry: Record<string, number> = {
  USA: 58.8, UK: 58.8, Russia: 5.3, Germany: 5.1, Spain: 4.7,
  France: 3.7, Japan: 3.4, Portugal: 2.6, Italy: 1.7, Turkey: 1.6,
  Netherlands: 1.3, Poland: 1.3, China: 1.4, SouthKorea: 0.6,
  CzechRepublic: 0.6, Iran: 0.9, Vietnam: 0.8, Indonesia: 0.6,
  Sweden: 0.7, Denmark: 0.4, Greece: 0.5, Romania: 0.4, Hungary: 0.4,
  Thailand: 0.3, India: 0.1, Brazil: 2.6, Argentina: 4.7, Mexico: 4.7
};

export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%';
}

export function formatCurrency(value: number, decimals: number = 1): string {
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(decimals) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(decimals) + 'M';
  if (value >= 1e3) return '$' + (value / 1e3).toFixed(decimals) + 'K';
  return '$' + value.toFixed(decimals);
}
