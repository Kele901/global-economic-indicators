import type { CountryKey } from '../../utils/countryMappings';

export type QualityFlag = 'curated' | 'estimate';

export interface HdrRecord {
  hdiRank: number | null;
  hdi: number | null;
  lifeExpectancy: number | null;
  expectedSchooling: number | null;
  meanSchooling: number | null;
  // 2021 PPP $
  gniPerCapita: number | null;
  ihdi: number | null;
  // Percentage of HDI lost to inequality.
  ihdiLoss: number | null;
  inequalityLife: number | null;
  inequalityEducation: number | null;
  inequalityIncome: number | null;
  gdi: number | null;
  // UNDP GDI group 1 (high equality) .. 5 (low equality).
  gdiGroup: number | null;
  hdiFemale: number | null;
  hdiMale: number | null;
  gii: number | null;
  giiRank: number | null;
  maternalMortality: number | null;
  adolescentBirths: number | null;
  parliamentFemale: number | null;
  secondaryEdFemale: number | null;
  secondaryEdMale: number | null;
  labourForceFemale: number | null;
  labourForceMale: number | null;
  phdi: number | null;
  co2PerCapita: number | null;
  materialFootprint: number | null;
  populationMillions: number | null;
  trend: Record<string, number>;
}

export type IncomeGroup = 'High income' | 'Upper-middle income' | 'Lower-middle income' | 'Low income';

export interface MpiRecord {
  // Share of people multidimensionally poor, %.
  headcount: number;
  // Average deprivation share among the poor, %.
  intensity: number;
  mpi: number;
  surveyYear: number;
}

export interface CountryIndices {
  hci?: number;
  spi?: number;
  happiness?: number;
  // Intergenerational elasticity of education; higher means less mobility.
  ige?: number;
  subnationalHdi?: { min: number; minRegion: string; max: number; maxRegion: string };
  population2050?: number;
  population2100?: number;
}

export interface StoryEvent {
  year: number;
  label: string;
}

export interface DevelopmentStory {
  id: string;
  title: string;
  countries: CountryKey[];
  metric: 'gdpPcConst' | 'lifeExpectancy' | 'poverty300' | 'under5Mortality';
  from: number;
  summary: string;
  paragraphs: string[];
  events: StoryEvent[];
}

export interface IncomePercentile {
  percentile: number;
  // $ per person per day, 2021 PPP.
  dailyIncome: number;
}
