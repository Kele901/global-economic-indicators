// Technology & Innovation Indicators Data
// Contains metadata, descriptions, and color schemes for technology metrics

export interface TechIndicatorInfo {
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

// Technology indicator metadata
export const technologyIndicators: { [key: string]: TechIndicatorInfo } = {
  patentApplicationsResident: {
    id: 'patentApplicationsResident',
    name: 'Patent Applications (Residents)',
    shortName: 'Patents (Res)',
    description: 'Patent applications filed by residents of a country. Patents protect inventions and indicate the level of domestic innovation activity.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Higher numbers indicate stronger domestic innovation ecosystems and R&D investment.',
    color: '#3B82F6', // blue-500
    colorDark: '#60A5FA' // blue-400
  },
  patentApplicationsNonResident: {
    id: 'patentApplicationsNonResident',
    name: 'Patent Applications (Non-Residents)',
    shortName: 'Patents (Non-Res)',
    description: 'Patent applications filed by non-residents. Indicates foreign interest in protecting IP within a country\'s market.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Higher numbers suggest an attractive market for foreign innovation and technology transfer.',
    color: '#8B5CF6', // violet-500
    colorDark: '#A78BFA' // violet-400
  },
  trademarkApplications: {
    id: 'trademarkApplications',
    name: 'Trademark Applications',
    shortName: 'Trademarks',
    description: 'Trademark applications filed by residents. Trademarks protect brand names, logos, and distinctive signs.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Indicates commercial activity, brand development, and entrepreneurial dynamism.',
    color: '#EC4899', // pink-500
    colorDark: '#F472B6' // pink-400
  },
  rdSpending: {
    id: 'rdSpending',
    name: 'R&D Expenditure',
    shortName: 'R&D (% GDP)',
    description: 'Research and development expenditure as a percentage of GDP. Includes government, business, and higher education R&D spending.',
    unit: '% of GDP',
    source: 'World Bank (UNESCO)',
    interpretation: 'Higher spending correlates with greater innovation capacity and long-term economic competitiveness.',
    color: '#10B981', // emerald-500
    colorDark: '#34D399' // emerald-400
  },
  researchersRD: {
    id: 'researchersRD',
    name: 'Researchers in R&D',
    shortName: 'Researchers',
    description: 'Full-time equivalent researchers engaged in R&D per million people. Includes professionals conducting research and improving knowledge.',
    unit: 'Per million people',
    source: 'World Bank (UNESCO)',
    interpretation: 'Higher density indicates stronger human capital for innovation and scientific advancement.',
    color: '#F59E0B', // amber-500
    colorDark: '#FBBF24' // amber-400
  },
  techniciansRD: {
    id: 'techniciansRD',
    name: 'Technicians in R&D',
    shortName: 'Technicians',
    description: 'Full-time equivalent technicians engaged in R&D per million people. Technicians support researchers with technical tasks.',
    unit: 'Per million people',
    source: 'World Bank (UNESCO)',
    interpretation: 'Indicates the technical support infrastructure for R&D activities.',
    color: '#6366F1', // indigo-500
    colorDark: '#818CF8' // indigo-400
  },
  hightechExports: {
    id: 'hightechExports',
    name: 'High-Technology Exports',
    shortName: 'High-Tech Exports',
    description: 'High-technology exports as a percentage of manufactured exports. Includes aerospace, computers, pharmaceuticals, and scientific instruments.',
    unit: '% of manufactured exports',
    source: 'World Bank (UN Comtrade)',
    interpretation: 'Higher percentages indicate advanced manufacturing capabilities and technological sophistication.',
    color: '#EF4444', // red-500
    colorDark: '#F87171' // red-400
  },
  ictExports: {
    id: 'ictExports',
    name: 'ICT Goods Exports',
    shortName: 'ICT Exports',
    description: 'Information and communication technology goods exports as a percentage of total goods exports.',
    unit: '% of total goods exports',
    source: 'World Bank (UNCTAD)',
    interpretation: 'Indicates the importance of the digital economy and electronics manufacturing.',
    color: '#14B8A6', // teal-500
    colorDark: '#2DD4BF' // teal-400
  },
  scientificPublications: {
    id: 'scientificPublications',
    name: 'Scientific Publications',
    shortName: 'Publications',
    description: 'Scientific and technical journal articles published. Covers physics, biology, chemistry, mathematics, clinical medicine, and engineering.',
    unit: 'Number of articles',
    source: 'World Bank (NSF)',
    interpretation: 'Higher numbers indicate stronger research output and academic contribution to global knowledge.',
    color: '#06B6D4', // cyan-500
    colorDark: '#22D3EE' // cyan-400
  },
  ipReceipts: {
    id: 'ipReceipts',
    name: 'IP Receipts',
    shortName: 'IP Income',
    description: 'Charges for the use of intellectual property, receipts. Includes royalties and license fees received from abroad.',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher receipts indicate valuable IP assets and successful technology licensing.',
    color: '#84CC16', // lime-500
    colorDark: '#A3E635' // lime-400
  },
  ipPayments: {
    id: 'ipPayments',
    name: 'IP Payments',
    shortName: 'IP Costs',
    description: 'Charges for the use of intellectual property, payments. Includes royalties and license fees paid to foreign entities.',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher payments may indicate technology dependence or active licensing of foreign innovations.',
    color: '#F97316', // orange-500
    colorDark: '#FB923C' // orange-400
  },
  internetUsers: {
    id: 'internetUsers',
    name: 'Internet Users',
    shortName: 'Internet %',
    description: 'Individuals using the Internet as a percentage of the population.',
    unit: '% of population',
    source: 'World Bank (ITU)',
    interpretation: 'Higher percentages indicate better digital infrastructure and connectivity.',
    color: '#0EA5E9', // sky-500
    colorDark: '#38BDF8' // sky-400
  },
  mobileSubscriptions: {
    id: 'mobileSubscriptions',
    name: 'Mobile Subscriptions',
    shortName: 'Mobile',
    description: 'Mobile cellular subscriptions per 100 people. Includes both prepaid and postpaid subscriptions.',
    unit: 'Per 100 people',
    source: 'World Bank (ITU)',
    interpretation: 'Higher numbers indicate mobile technology adoption and telecommunications development.',
    color: '#A855F7', // purple-500
    colorDark: '#C084FC' // purple-400
  }
};

// Country groupings for technology analysis
export const techCountryGroups = {
  leaders: {
    name: 'Tech Leaders',
    description: 'Countries with highest R&D spending and patent activity',
    countries: ['USA', 'Japan', 'SouthKorea', 'Germany', 'China'],
    color: '#3B82F6'
  },
  emerging: {
    name: 'Emerging Tech',
    description: 'Rapidly growing technology sectors',
    countries: ['India', 'Brazil', 'Mexico', 'Indonesia', 'Turkey'],
    color: '#10B981'
  },
  european: {
    name: 'European Innovation',
    description: 'European technology hubs',
    countries: ['Germany', 'France', 'UK', 'Netherlands', 'Sweden', 'Switzerland'],
    color: '#8B5CF6'
  },
  asian: {
    name: 'Asian Tech',
    description: 'Asian technology powerhouses',
    countries: ['Japan', 'SouthKorea', 'China', 'India', 'Indonesia'],
    color: '#F59E0B'
  }
};

// Chart color palette for multi-country visualization
export const techChartColors: { [country: string]: string } = {
  USA: '#3B82F6',      // blue
  China: '#EF4444',    // red
  Japan: '#F59E0B',    // amber
  Germany: '#10B981',  // emerald
  SouthKorea: '#8B5CF6', // violet
  UK: '#EC4899',       // pink
  France: '#06B6D4',   // cyan
  India: '#F97316',    // orange
  Canada: '#84CC16',   // lime
  Australia: '#14B8A6', // teal
  Brazil: '#A855F7',   // purple
  Mexico: '#0EA5E9',   // sky
  Italy: '#6366F1',    // indigo
  Spain: '#D946EF',    // fuchsia
  Netherlands: '#22C55E', // green
  Sweden: '#FBBF24',   // yellow
  Switzerland: '#FB7185', // rose
  Russia: '#64748B',   // slate
  Turkey: '#C026D3',   // fuchsia-600
  Poland: '#2563EB',   // blue-600
  Indonesia: '#059669', // emerald-600
  SouthAfrica: '#7C3AED', // violet-600
  Nigeria: '#16A34A',  // green-600
  Egypt: '#CA8A04',    // yellow-600
  SaudiArabia: '#0891B2', // cyan-600
  Argentina: '#9333EA', // purple-600
  Chile: '#E11D48',    // rose-600
  Norway: '#0D9488',   // teal-600
  Belgium: '#4F46E5',  // indigo-600
  Portugal: '#DB2777'  // pink-600
};

// Default countries to display in charts
export const defaultTechCountries = [
  'USA', 'China', 'Japan', 'Germany', 'SouthKorea', 
  'UK', 'France', 'India', 'Canada', 'Australia'
];

// Innovation ranking weights for composite score
export const innovationWeights = {
  patentApplicationsResident: 0.20,
  rdSpending: 0.25,
  researchersRD: 0.15,
  hightechExports: 0.15,
  scientificPublications: 0.10,
  internetUsers: 0.10,
  ipReceipts: 0.05
};

// Format large numbers for display
export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toFixed(decimals);
}

// Format percentage values
export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%';
}

// Get trend indicator
export function getTrendIndicator(current: number, previous: number): { icon: string; color: string; change: number } {
  const change = ((current - previous) / previous) * 100;
  if (change > 5) {
    return { icon: '↗', color: 'text-green-500', change };
  }
  if (change < -5) {
    return { icon: '↘', color: 'text-red-500', change };
  }
  return { icon: '→', color: 'text-gray-500', change };
}
