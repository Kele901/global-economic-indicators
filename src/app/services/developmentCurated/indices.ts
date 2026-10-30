// Hand-curated indices that have no open API. Values are rounded and should be
// read as estimates: check the publisher before quoting a single figure.
//   SPI   Social Progress Imperative, Social Progress Index 2025 (0-100)
//   WHR   World Happiness Report 2025, Cantril ladder 2022-24 average (0-10)
//   IGE   Intergenerational earnings elasticity (Corak 2013 compilation);
//         higher means parents' income predicts children's income more.
//   SHDI  Global Data Lab Subnational HDI v8, lowest and highest region
//   MPI   UNDP/OPHI Global Multidimensional Poverty Index 2024

import type { CountryKey } from '../../utils/countryMappings';
import type { MpiRecord } from './types';

export const INDICES_LAST_UPDATED = '2025-10-01';

export const SOCIAL_PROGRESS: Partial<Record<CountryKey, number>> = {
  Norway: 90.4, Switzerland: 89.0, Sweden: 88.5, Netherlands: 88.0, Germany: 87.2,
  Japan: 87.0, Australia: 86.8, Canada: 86.2, Belgium: 86.0, UK: 85.4,
  France: 85.1, Spain: 85.0, Portugal: 84.9, SouthKorea: 84.8, Italy: 84.2,
  Singapore: 83.9, Poland: 82.1, Greece: 81.8, USA: 81.2, Chile: 80.1,
  Israel: 79.3, Argentina: 76.2, UAE: 74.1, Qatar: 73.0, Ukraine: 70.9,
  Brazil: 70.8, Thailand: 70.2, Mexico: 69.9, Colombia: 69.8, Russia: 68.2,
  Turkey: 67.9, China: 67.4, Vietnam: 67.0, SaudiArabia: 66.3, Indonesia: 66.0,
  SouthAfrica: 65.8, Morocco: 64.2, Philippines: 63.9, Iran: 62.1, Egypt: 61.0,
  India: 60.1, Ghana: 59.2, Kenya: 57.3, Bangladesh: 56.4, Pakistan: 50.2,
  Nigeria: 48.3, Ethiopia: 45.1,
};

export const HAPPINESS: Partial<Record<CountryKey, number>> = {
  Sweden: 7.35, Netherlands: 7.31, Norway: 7.26, Israel: 7.23, Mexico: 6.97,
  Australia: 7.06, Switzerland: 6.95, Belgium: 6.91, Canada: 6.80, UAE: 6.76,
  Germany: 6.75, UK: 6.73, USA: 6.72, SaudiArabia: 6.60, France: 6.59,
  Singapore: 6.57, Brazil: 6.49, Spain: 6.47, Poland: 6.44, Italy: 6.42,
  Argentina: 6.40, Qatar: 6.37, Japan: 6.15, Philippines: 6.11, Chile: 6.06,
  Vietnam: 6.04, SouthKorea: 6.04, Portugal: 6.01, Thailand: 5.98, Russia: 5.95,
  Colombia: 5.93, China: 5.92, Greece: 5.78, Indonesia: 5.62, SouthAfrica: 5.21,
  Ukraine: 5.07, Iran: 4.92, Turkey: 4.88, Nigeria: 4.76, Pakistan: 4.66,
  Morocco: 4.62, Kenya: 4.47, India: 4.39, Ghana: 4.37, Ethiopia: 4.00,
  Bangladesh: 3.89, Egypt: 3.82,
};

export const INTERGENERATIONAL_ELASTICITY: Partial<Record<CountryKey, number>> = {
  Norway: 0.17, Canada: 0.19, Australia: 0.26, Sweden: 0.27, Germany: 0.32,
  Japan: 0.34, Spain: 0.40, France: 0.41, Singapore: 0.44, Switzerland: 0.46,
  Pakistan: 0.46, USA: 0.47, Italy: 0.50, UK: 0.50, Chile: 0.52, Argentina: 0.40,
  Brazil: 0.58, China: 0.60,
};

export const SUBNATIONAL_HDI: Partial<Record<CountryKey, { min: number; minRegion: string; max: number; maxRegion: string }>> = {
  India: { min: 0.58, minRegion: 'Bihar', max: 0.78, maxRegion: 'Kerala' },
  Nigeria: { min: 0.40, minRegion: 'North West', max: 0.66, maxRegion: 'South South' },
  China: { min: 0.72, minRegion: 'Gansu', max: 0.92, maxRegion: 'Beijing' },
  Brazil: { min: 0.70, minRegion: 'Maranhao', max: 0.85, maxRegion: 'Federal District' },
  USA: { min: 0.88, minRegion: 'Mississippi', max: 0.96, maxRegion: 'Massachusetts' },
  Indonesia: { min: 0.64, minRegion: 'Papua', max: 0.83, maxRegion: 'Jakarta' },
  Mexico: { min: 0.71, minRegion: 'Chiapas', max: 0.84, maxRegion: 'Mexico City' },
  SouthAfrica: { min: 0.66, minRegion: 'Eastern Cape', max: 0.76, maxRegion: 'Gauteng' },
  Pakistan: { min: 0.47, minRegion: 'Balochistan', max: 0.61, maxRegion: 'Islamabad' },
  Kenya: { min: 0.43, minRegion: 'North Eastern', max: 0.69, maxRegion: 'Nairobi' },
  Ethiopia: { min: 0.38, minRegion: 'Afar', max: 0.67, maxRegion: 'Addis Ababa' },
  Russia: { min: 0.76, minRegion: 'Tyva', max: 0.90, maxRegion: 'Moscow' },
  Italy: { min: 0.87, minRegion: 'Calabria', max: 0.93, maxRegion: 'Trentino-South Tyrol' },
  Germany: { min: 0.93, minRegion: 'Saxony-Anhalt', max: 0.97, maxRegion: 'Hamburg' },
};

export const MPI: Partial<Record<CountryKey, MpiRecord>> = {
  Ethiopia: { mpi: 0.367, headcount: 68.7, intensity: 53.3, surveyYear: 2019 },
  Nigeria: { mpi: 0.175, headcount: 33.0, intensity: 52.9, surveyYear: 2021 },
  Pakistan: { mpi: 0.198, headcount: 38.3, intensity: 51.7, surveyYear: 2018 },
  Kenya: { mpi: 0.133, headcount: 29.7, intensity: 44.8, surveyYear: 2022 },
  Ghana: { mpi: 0.111, headcount: 24.6, intensity: 45.1, surveyYear: 2018 },
  Bangladesh: { mpi: 0.104, headcount: 24.6, intensity: 42.2, surveyYear: 2019 },
  India: { mpi: 0.069, headcount: 16.4, intensity: 42.0, surveyYear: 2021 },
  Morocco: { mpi: 0.027, headcount: 6.4, intensity: 42.0, surveyYear: 2018 },
  Philippines: { mpi: 0.016, headcount: 3.9, intensity: 41.8, surveyYear: 2022 },
  Indonesia: { mpi: 0.014, headcount: 3.6, intensity: 38.7, surveyYear: 2017 },
  SouthAfrica: { mpi: 0.025, headcount: 6.3, intensity: 39.8, surveyYear: 2016 },
  Egypt: { mpi: 0.020, headcount: 5.2, intensity: 37.6, surveyYear: 2014 },
  Vietnam: { mpi: 0.008, headcount: 1.9, intensity: 40.5, surveyYear: 2021 },
  China: { mpi: 0.016, headcount: 3.9, intensity: 41.4, surveyYear: 2014 },
  Brazil: { mpi: 0.016, headcount: 3.8, intensity: 42.5, surveyYear: 2015 },
  Mexico: { mpi: 0.016, headcount: 4.0, intensity: 39.6, surveyYear: 2022 },
  Colombia: { mpi: 0.020, headcount: 4.8, intensity: 40.6, surveyYear: 2015 },
  Thailand: { mpi: 0.002, headcount: 0.6, intensity: 36.7, surveyYear: 2022 },
  Iran: { mpi: 0.002, headcount: 0.4, intensity: 37.3, surveyYear: 2011 },
  Turkey: { mpi: 0.004, headcount: 1.1, intensity: 39.9, surveyYear: 2014 },
  Ukraine: { mpi: 0.001, headcount: 0.2, intensity: 34.4, surveyYear: 2012 },
  Argentina: { mpi: 0.001, headcount: 0.4, intensity: 39.1, surveyYear: 2020 },
};
