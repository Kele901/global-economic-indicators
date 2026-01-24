'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import AdSense from '../components/AdSense';
import RealDataToggle from '../components/RealDataToggle';
import DataSourceIndicator from '../components/DataSourceIndicator';
import DataSourceBreakdown from '../components/DataSourceBreakdown';
import InfoPanel from '../components/InfoPanel';
import { useTradeData, useHistoricalTradeData } from '../hooks/useTradeData';
import { COUNTRY_MAPPINGS } from '../services/tradeData';
import { 
  US, CN, DE, JP, GB, IN, BR, KR, CA, AU, MX, RU, SA,
  FR, IT, ES, ID, TR, TH, SG, MY, AR, UY, PY
} from 'country-flag-icons/react/3x2';

// Flag component mapping
const countryFlags: { [key: string]: React.ComponentType<any> } = {
  US: US,
  CN: CN,
  DE: DE,
  JP: JP,
  GB: GB,
  IN: IN,
  BR: BR,
  KR: KR,
  CA: CA,
  AU: AU,
  MX: MX,
  RU: RU,
  SA: SA,
  FR: FR,
  IT: IT,
  ES: ES,
  ID: ID,
  TR: TR,
  TH: TH,
  SG: SG,
  MY: MY,
  AR: AR,
  UY: UY,
  PY: PY
};

// Reverse mapping: 3-letter codes to 2-letter codes for flag lookup
const REVERSE_COUNTRY_MAPPINGS: { [key: string]: string } = {
  USA: 'US',
  CHN: 'CN',
  DEU: 'DE',
  JPN: 'JP',
  GBR: 'GB',
  IND: 'IN',
  BRA: 'BR',
  KOR: 'KR',
  CAN: 'CA',
  AUS: 'AU',
  MEX: 'MX',
  RUS: 'RU',
  SAU: 'SA',
  FRA: 'FR',
  ITA: 'IT',
  ESP: 'ES',
  IDN: 'ID',
  TUR: 'TR'
};

// Enhanced mock trade data with more countries and metrics
const mockTradeData = {
  countries: [
    {
      name: 'United States',
      code: 'US',
      flag: '🇺🇸',
      region: 'North America',
      tradeBalance: -89.2,
      totalExports: 1691.2,
      totalImports: 1780.4,
      gdp: 25439.7,
      population: 331.9,
      tradeIntensity: 13.6,
      diversificationIndex: 0.78,
      tradeOpenness: 13.6,
      exportGrowth: 2.3,
      importGrowth: 3.1,
      topExports: ['Machinery', 'Electronics', 'Aircraft', 'Medical Equipment', 'Chemicals'],
      topImports: ['Electronics', 'Machinery', 'Vehicles', 'Textiles', 'Oil'],
      tradePartners: [
        { country: 'China', tradeVolume: 559.2, balance: -345.2, share: 16.5 },
        { country: 'Canada', tradeVolume: 614.9, balance: 12.3, share: 18.1 },
        { country: 'Mexico', tradeVolume: 614.5, balance: -130.1, share: 18.0 },
        { country: 'Japan', tradeVolume: 218.2, balance: -68.8, share: 6.4 },
        { country: 'Germany', tradeVolume: 171.2, balance: -67.1, share: 5.0 }
      ]
    },
    {
      name: 'China',
      code: 'CN',
      flag: '🇨🇳',
      region: 'Asia',
      tradeBalance: 535.4,
      totalExports: 3360.0,
      totalImports: 2824.6,
      gdp: 17963.2,
      population: 1439.3,
      tradeIntensity: 34.4,
      diversificationIndex: 0.65,
      tradeOpenness: 34.4,
      exportGrowth: 8.7,
      importGrowth: 6.2,
      topExports: ['Electronics', 'Machinery', 'Textiles', 'Furniture', 'Toys'],
      topImports: ['Oil', 'Machinery', 'Electronics', 'Chemicals', 'Metals'],
      tradePartners: [
        { country: 'United States', tradeVolume: 559.2, balance: 345.2, share: 9.0 },
        { country: 'Japan', tradeVolume: 317.4, balance: 45.6, share: 5.1 },
        { country: 'South Korea', tradeVolume: 240.4, balance: 78.9, share: 3.9 },
        { country: 'Germany', tradeVolume: 198.7, balance: 23.4, share: 3.2 },
        { country: 'India', tradeVolume: 125.6, balance: 67.8, share: 2.0 }
      ]
    },
    {
      name: 'Germany',
      code: 'DE',
      flag: '🇩🇪',
      region: 'Europe',
      tradeBalance: 310.8,
      totalExports: 1560.0,
      totalImports: 1249.2,
      gdp: 4082.5,
      population: 83.2,
      tradeIntensity: 68.8,
      diversificationIndex: 0.82,
      tradeOpenness: 68.8,
      exportGrowth: 4.2,
      importGrowth: 3.8,
      topExports: ['Machinery', 'Vehicles', 'Chemicals', 'Electronics', 'Pharmaceuticals'],
      topImports: ['Oil', 'Machinery', 'Electronics', 'Chemicals', 'Textiles'],
      tradePartners: [
        { country: 'United States', tradeVolume: 171.2, balance: 67.1, share: 6.1 },
        { country: 'China', tradeVolume: 198.7, balance: -23.4, share: 7.1 },
        { country: 'France', tradeVolume: 156.8, balance: 45.2, share: 5.6 },
        { country: 'Netherlands', tradeVolume: 189.3, balance: 12.7, share: 6.7 },
        { country: 'Italy', tradeVolume: 134.5, balance: 23.8, share: 4.8 }
      ]
    },
    {
      name: 'Japan',
      code: 'JP',
      flag: '🇯🇵',
      region: 'Asia',
      tradeBalance: 45.2,
      totalExports: 738.0,
      totalImports: 692.8,
      gdp: 4231.1,
      population: 125.8,
      tradeIntensity: 33.8,
      diversificationIndex: 0.71,
      tradeOpenness: 33.8,
      exportGrowth: 1.8,
      importGrowth: 2.4,
      topExports: ['Vehicles', 'Electronics', 'Machinery', 'Chemicals', 'Steel'],
      topImports: ['Oil', 'Electronics', 'Machinery', 'Chemicals', 'Food'],
      tradePartners: [
        { country: 'China', tradeVolume: 317.4, balance: -45.6, share: 22.2 },
        { country: 'United States', tradeVolume: 218.2, balance: 68.8, share: 15.3 },
        { country: 'South Korea', tradeVolume: 89.3, balance: 12.4, share: 6.3 },
        { country: 'Germany', tradeVolume: 67.8, balance: 8.9, share: 4.7 },
        { country: 'Australia', tradeVolume: 45.6, balance: -12.3, share: 3.2 }
      ]
    },
    {
      name: 'United Kingdom',
      code: 'GB',
      flag: '🇬🇧',
      region: 'Europe',
      tradeBalance: -45.7,
      totalExports: 423.8,
      totalImports: 469.5,
      gdp: 3070.7,
      population: 67.3,
      tradeIntensity: 29.1,
      diversificationIndex: 0.69,
      tradeOpenness: 29.1,
      exportGrowth: -1.2,
      importGrowth: 0.8,
      topExports: ['Services', 'Machinery', 'Chemicals', 'Vehicles', 'Pharmaceuticals'],
      topImports: ['Oil', 'Machinery', 'Electronics', 'Vehicles', 'Chemicals'],
      tradePartners: [
        { country: 'United States', tradeVolume: 89.4, balance: 12.3, share: 10.0 },
        { country: 'Germany', tradeVolume: 78.9, balance: -23.4, share: 8.8 },
        { country: 'China', tradeVolume: 67.8, balance: -45.6, share: 7.6 },
        { country: 'Netherlands', tradeVolume: 56.7, balance: 8.9, share: 6.3 },
        { country: 'France', tradeVolume: 45.6, balance: -12.3, share: 5.1 }
      ]
    },
    {
      name: 'India',
      code: 'IN',
      flag: '🇮🇳',
      region: 'Asia',
      tradeBalance: -78.3,
      totalExports: 324.2,
      totalImports: 402.5,
      gdp: 3386.4,
      population: 1380.0,
      tradeIntensity: 21.4,
      diversificationIndex: 0.58,
      tradeOpenness: 21.4,
      exportGrowth: 12.4,
      importGrowth: 15.7,
      topExports: ['Textiles', 'Pharmaceuticals', 'IT Services', 'Jewelry', 'Chemicals'],
      topImports: ['Oil', 'Electronics', 'Machinery', 'Gold', 'Coal'],
      tradePartners: [
        { country: 'United States', tradeVolume: 78.9, balance: 23.4, share: 10.9 },
        { country: 'China', tradeVolume: 125.6, balance: -67.8, share: 17.3 },
        { country: 'UAE', tradeVolume: 45.2, balance: -12.3, share: 6.2 },
        { country: 'Germany', tradeVolume: 23.8, balance: 5.6, share: 3.3 },
        { country: 'Singapore', tradeVolume: 18.7, balance: 2.1, share: 2.6 }
      ]
    },
    {
      name: 'Brazil',
      code: 'BR',
      flag: '🇧🇷',
      region: 'South America',
      tradeBalance: 67.8,
      totalExports: 280.4,
      totalImports: 212.6,
      gdp: 1608.9,
      population: 215.3,
      tradeIntensity: 30.6,
      diversificationIndex: 0.52,
      tradeOpenness: 30.6,
      exportGrowth: 8.9,
      importGrowth: 5.2,
      topExports: ['Soybeans', 'Iron Ore', 'Oil', 'Meat', 'Sugar'],
      topImports: ['Machinery', 'Electronics', 'Chemicals', 'Vehicles', 'Oil'],
      tradePartners: [
        { country: 'China', tradeVolume: 89.4, balance: 34.5, share: 18.1 },
        { country: 'United States', tradeVolume: 45.6, balance: 12.3, share: 9.2 },
        { country: 'Argentina', tradeVolume: 23.8, balance: 8.9, share: 4.8 },
        { country: 'Germany', tradeVolume: 18.7, balance: 5.6, share: 3.8 },
        { country: 'Netherlands', tradeVolume: 15.2, balance: 3.4, share: 3.1 }
      ]
    },
    {
      name: 'South Korea',
      code: 'KR',
      flag: '🇰🇷',
      region: 'Asia',
      tradeBalance: 89.4,
      totalExports: 512.8,
      totalImports: 423.4,
      gdp: 1810.9,
      population: 51.7,
      tradeIntensity: 51.7,
      diversificationIndex: 0.76,
      tradeOpenness: 51.7,
      exportGrowth: 6.8,
      importGrowth: 4.9,
      topExports: ['Electronics', 'Vehicles', 'Machinery', 'Chemicals', 'Steel'],
      topImports: ['Oil', 'Electronics', 'Machinery', 'Chemicals', 'Coal'],
      tradePartners: [
        { country: 'China', tradeVolume: 240.4, balance: 78.9, share: 25.6 },
        { country: 'United States', tradeVolume: 89.3, balance: 12.4, share: 9.5 },
        { country: 'Japan', tradeVolume: 67.8, balance: 8.9, share: 7.2 },
        { country: 'Vietnam', tradeVolume: 45.6, balance: 23.4, share: 4.9 },
        { country: 'Germany', tradeVolume: 34.5, balance: 5.6, share: 3.7 }
      ]
    },
    {
      name: 'Canada',
      code: 'CA',
      flag: '🇨🇦',
      region: 'North America',
      tradeBalance: 23.4,
      totalExports: 456.7,
      totalImports: 433.3,
      gdp: 1990.8,
      population: 38.0,
      tradeIntensity: 44.8,
      diversificationIndex: 0.61,
      tradeOpenness: 44.8,
      exportGrowth: 3.2,
      importGrowth: 4.1,
      topExports: ['Oil', 'Lumber', 'Minerals', 'Machinery', 'Aircraft'],
      topImports: ['Vehicles', 'Machinery', 'Electronics', 'Chemicals', 'Oil'],
      tradePartners: [
        { country: 'United States', tradeVolume: 614.9, balance: 12.3, share: 69.1 },
        { country: 'China', tradeVolume: 45.6, balance: -23.4, share: 5.1 },
        { country: 'Mexico', tradeVolume: 23.8, balance: 5.6, share: 2.7 },
        { country: 'Germany', tradeVolume: 18.7, balance: 3.4, share: 2.1 },
        { country: 'Japan', tradeVolume: 15.2, balance: 2.1, share: 1.7 }
      ]
    },
    {
      name: 'Australia',
      code: 'AU',
      flag: '🇦🇺',
      region: 'Oceania',
      tradeBalance: 45.6,
      totalExports: 312.4,
      totalImports: 266.8,
      gdp: 1542.7,
      population: 25.7,
      tradeIntensity: 37.5,
      diversificationIndex: 0.48,
      tradeOpenness: 37.5,
      exportGrowth: 7.8,
      importGrowth: 5.4,
      topExports: ['Iron Ore', 'Coal', 'Gold', 'Natural Gas', 'Wheat'],
      topImports: ['Machinery', 'Vehicles', 'Electronics', 'Oil', 'Chemicals'],
      tradePartners: [
        { country: 'China', tradeVolume: 123.4, balance: 67.8, share: 21.3 },
        { country: 'Japan', tradeVolume: 45.6, balance: 12.3, share: 7.9 },
        { country: 'United States', tradeVolume: 34.5, balance: 5.6, share: 6.0 },
        { country: 'South Korea', tradeVolume: 23.8, balance: 8.9, share: 4.1 },
        { country: 'India', tradeVolume: 18.7, balance: 3.4, share: 3.2 }
      ]
    },
    {
      name: 'Mexico',
      code: 'MX',
      flag: '🇲🇽',
      region: 'North America',
      tradeBalance: -12.3,
      totalExports: 417.8,
      totalImports: 430.1,
      gdp: 1289.3,
      population: 130.3,
      tradeIntensity: 55.7,
      diversificationIndex: 0.63,
      tradeOpenness: 55.7,
      exportGrowth: 9.2,
      importGrowth: 11.5,
      topExports: ['Vehicles', 'Electronics', 'Machinery', 'Oil', 'Agricultural Products'],
      topImports: ['Electronics', 'Machinery', 'Vehicles', 'Oil', 'Chemicals'],
      tradePartners: [
        { country: 'United States', tradeVolume: 614.5, balance: -130.1, share: 72.4 },
        { country: 'China', tradeVolume: 45.6, balance: -23.4, share: 5.4 },
        { country: 'Canada', tradeVolume: 23.8, balance: 5.6, share: 2.8 },
        { country: 'Germany', tradeVolume: 18.7, balance: 3.4, share: 2.2 },
        { country: 'Japan', tradeVolume: 15.2, balance: 2.1, share: 1.8 }
      ]
    },
    {
      name: 'Russia',
      code: 'RU',
      flag: '🇷🇺',
      region: 'Europe/Asia',
      tradeBalance: 156.7,
      totalExports: 345.6,
      totalImports: 188.9,
      gdp: 1835.9,
      population: 146.2,
      tradeIntensity: 29.1,
      diversificationIndex: 0.41,
      tradeOpenness: 29.1,
      exportGrowth: -5.2,
      importGrowth: -8.7,
      topExports: ['Oil', 'Natural Gas', 'Metals', 'Wheat', 'Chemicals'],
      topImports: ['Machinery', 'Electronics', 'Vehicles', 'Pharmaceuticals', 'Food'],
      tradePartners: [
        { country: 'China', tradeVolume: 89.4, balance: 45.6, share: 16.7 },
        { country: 'Germany', tradeVolume: 45.6, balance: 12.3, share: 8.5 },
        { country: 'Netherlands', tradeVolume: 34.5, balance: 8.9, share: 6.4 },
        { country: 'Turkey', tradeVolume: 23.8, balance: 5.6, share: 4.4 },
        { country: 'Belarus', tradeVolume: 18.7, balance: 3.4, share: 3.5 }
      ]
    },
    {
      name: 'Saudi Arabia',
      code: 'SA',
      flag: '🇸🇦',
      region: 'Middle East',
      tradeBalance: 234.5,
      totalExports: 298.7,
      totalImports: 64.2,
      gdp: 793.5,
      population: 35.0,
      tradeIntensity: 45.8,
      diversificationIndex: 0.23,
      tradeOpenness: 45.8,
      exportGrowth: 12.3,
      importGrowth: 8.9,
      topExports: ['Oil', 'Petrochemicals', 'Minerals', 'Plastics', 'Fertilizers'],
      topImports: ['Machinery', 'Vehicles', 'Electronics', 'Food', 'Pharmaceuticals'],
      tradePartners: [
        { country: 'China', tradeVolume: 67.8, balance: 23.4, share: 18.2 },
        { country: 'India', tradeVolume: 45.6, balance: 12.3, share: 12.3 },
        { country: 'Japan', tradeVolume: 34.5, balance: 8.9, share: 9.3 },
        { country: 'United States', tradeVolume: 23.8, balance: 5.6, share: 6.4 },
        { country: 'South Korea', tradeVolume: 18.7, balance: 3.4, share: 5.0 }
      ]
    },
    {
      name: 'France',
      code: 'FR',
      flag: '🇫🇷',
      region: 'Europe',
      tradeBalance: 67.2,
      totalExports: 578.4,
      totalImports: 511.2,
      gdp: 2630.0,
      population: 67.0,
      tradeIntensity: 41.4,
      diversificationIndex: 0.80,
      tradeOpenness: 41.4,
      exportGrowth: 3.8,
      importGrowth: 3.2,
      topExports: ['Aircraft', 'Machinery', 'Pharmaceuticals', 'Vehicles', 'Wine'],
      topImports: ['Machinery', 'Vehicles', 'Oil', 'Electronics', 'Chemicals'],
      tradePartners: [
        { country: 'Germany', tradeVolume: 156.8, balance: -45.2, share: 14.4 },
        { country: 'United States', tradeVolume: 89.3, balance: 23.4, share: 8.2 },
        { country: 'Italy', tradeVolume: 78.9, balance: 12.3, share: 7.3 },
        { country: 'Spain', tradeVolume: 67.8, balance: 8.9, share: 6.2 },
        { country: 'Belgium', tradeVolume: 56.7, balance: 5.6, share: 5.2 }
      ]
    },
    {
      name: 'Italy',
      code: 'IT',
      flag: '🇮🇹',
      region: 'Europe',
      tradeBalance: 45.3,
      totalExports: 542.8,
      totalImports: 497.5,
      gdp: 2000.0,
      population: 59.0,
      tradeIntensity: 52.0,
      diversificationIndex: 0.77,
      tradeOpenness: 52.0,
      exportGrowth: 4.1,
      importGrowth: 3.7,
      topExports: ['Machinery', 'Vehicles', 'Pharmaceuticals', 'Fashion', 'Furniture'],
      topImports: ['Oil', 'Machinery', 'Vehicles', 'Chemicals', 'Electronics'],
      tradePartners: [
        { country: 'Germany', tradeVolume: 134.5, balance: -23.8, share: 13.0 },
        { country: 'France', tradeVolume: 78.9, balance: -12.3, share: 7.6 },
        { country: 'United States', tradeVolume: 67.8, balance: 18.7, share: 6.5 },
        { country: 'Spain', tradeVolume: 56.7, balance: 9.8, share: 5.5 },
        { country: 'Switzerland', tradeVolume: 45.6, balance: 7.8, share: 4.4 }
      ]
    },
    {
      name: 'Spain',
      code: 'ES',
      flag: '🇪🇸',
      region: 'Europe',
      tradeBalance: 12.4,
      totalExports: 387.6,
      totalImports: 375.2,
      gdp: 1400.0,
      population: 47.0,
      tradeIntensity: 54.5,
      diversificationIndex: 0.73,
      tradeOpenness: 54.5,
      exportGrowth: 5.2,
      importGrowth: 4.8,
      topExports: ['Vehicles', 'Machinery', 'Pharmaceuticals', 'Food', 'Chemicals'],
      topImports: ['Oil', 'Machinery', 'Vehicles', 'Electronics', 'Chemicals'],
      tradePartners: [
        { country: 'France', tradeVolume: 67.8, balance: -8.9, share: 8.9 },
        { country: 'Germany', tradeVolume: 56.7, balance: -12.3, share: 7.4 },
        { country: 'Italy', tradeVolume: 45.6, balance: -9.8, share: 6.0 },
        { country: 'Portugal', tradeVolume: 34.5, balance: 5.6, share: 4.5 },
        { country: 'United States', tradeVolume: 23.8, balance: 3.4, share: 3.1 }
      ]
    },
    {
      name: 'Indonesia',
      code: 'ID',
      flag: '🇮🇩',
      region: 'Asia',
      tradeBalance: 34.7,
      totalExports: 256.4,
      totalImports: 221.7,
      gdp: 1120.0,
      population: 274.0,
      tradeIntensity: 42.7,
      diversificationIndex: 0.54,
      tradeOpenness: 42.7,
      exportGrowth: 9.8,
      importGrowth: 7.4,
      topExports: ['Palm Oil', 'Coal', 'Natural Gas', 'Textiles', 'Electronics'],
      topImports: ['Machinery', 'Oil', 'Chemicals', 'Electronics', 'Steel'],
      tradePartners: [
        { country: 'China', tradeVolume: 89.4, balance: -23.4, share: 18.7 },
        { country: 'Singapore', tradeVolume: 45.6, balance: 12.3, share: 9.5 },
        { country: 'Japan', tradeVolume: 34.5, balance: -8.9, share: 7.2 },
        { country: 'United States', tradeVolume: 23.8, balance: 9.8, share: 5.0 },
        { country: 'India', tradeVolume: 18.7, balance: 5.6, share: 3.9 }
      ]
    },
    {
      name: 'Turkey',
      code: 'TR',
      flag: '🇹🇷',
      region: 'Europe',
      tradeBalance: -34.8,
      totalExports: 234.5,
      totalImports: 269.3,
      gdp: 819.0,
      population: 85.0,
      tradeIntensity: 61.5,
      diversificationIndex: 0.69,
      tradeOpenness: 61.5,
      exportGrowth: 8.2,
      importGrowth: 9.7,
      topExports: ['Vehicles', 'Machinery', 'Textiles', 'Steel', 'Food'],
      topImports: ['Oil', 'Machinery', 'Chemicals', 'Electronics', 'Metals'],
      tradePartners: [
        { country: 'Germany', tradeVolume: 45.6, balance: -8.9, share: 9.1 },
        { country: 'China', tradeVolume: 34.5, balance: -12.3, share: 6.9 },
        { country: 'Russia', tradeVolume: 28.7, balance: -15.6, share: 5.7 },
        { country: 'United States', tradeVolume: 23.8, balance: 5.6, share: 4.7 },
        { country: 'Italy', tradeVolume: 18.9, balance: 3.4, share: 3.8 }
      ]
    }
  ],
  globalStats: {
    totalWorldTrade: 28400.0,
    topTradingNations: ['China', 'United States', 'Germany', 'Japan', 'Netherlands'],
    fastestGrowing: ['Vietnam', 'India', 'Bangladesh', 'Mexico', 'Poland'],
    tradeWars: [
      { countries: ['US', 'CN'], impact: 'High', status: 'Ongoing' },
      { countries: ['EU', 'US'], impact: 'Medium', status: 'Resolved' },
      { countries: ['JP', 'KR'], impact: 'Low', status: 'Ongoing' }
    ],
    regionalStats: {
      'North America': { tradeVolume: 3200.0, growth: 2.8, countries: 3 },
      'Asia': { tradeVolume: 8500.0, growth: 6.2, countries: 8 },
      'Europe': { tradeVolume: 4200.0, growth: 1.9, countries: 6 },
      'South America': { tradeVolume: 1200.0, growth: 4.5, countries: 2 },
      'Middle East': { tradeVolume: 1800.0, growth: 8.1, countries: 1 },
      'Oceania': { tradeVolume: 500.0, growth: 3.7, countries: 1 }
    },
    tradeMetrics: {
      averageTradeIntensity: 35.2,
      averageDiversificationIndex: 0.58,
      globalTradeGrowth: 4.8,
      servicesTradeShare: 23.4,
      manufacturingTradeShare: 67.8,
      agriculturalTradeShare: 8.8
    }
  }
};

// Country-specific tariff data
const countryTariffs = {
  US: {
    averageTariff: 2.0,
    appliedTariffs: [
      { sector: "Steel", rate: 25, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "Aluminum", rate: 10, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "Chinese Electronics", rate: 25, status: "Active", effectiveDate: "2018-07-06" },
      { sector: "Chinese Machinery", rate: 25, status: "Active", effectiveDate: "2018-07-06" },
      { sector: "Chinese Textiles", rate: 25, status: "Active", effectiveDate: "2018-07-06" },
      { sector: "EU Steel", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" },
      { sector: "EU Aluminum", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }
    ],
    tradeDisputes: ["US-China Trade War", "EU-US Steel Dispute"],
    retaliatoryTariffs: 25
  },
  CN: {
    averageTariff: 7.5,
    appliedTariffs: [
      { sector: "US Agriculture", rate: 25, status: "Active", effectiveDate: "2018-08-23" },
      { sector: "US Aerospace", rate: 25, status: "Active", effectiveDate: "2018-08-23" },
      { sector: "US Chemicals", rate: 25, status: "Active", effectiveDate: "2018-08-23" },
      { sector: "US Automobiles", rate: 15, status: "Active", effectiveDate: "2018-08-23" },
      { sector: "US Energy", rate: 10, status: "Active", effectiveDate: "2018-08-23" }
    ],
    tradeDisputes: ["US-China Trade War"],
    retaliatoryTariffs: 25
  },
  DE: {
    averageTariff: 1.8,
    appliedTariffs: [
      { sector: "US Motorcycles", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" },
      { sector: "US Whiskey", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" },
      { sector: "US Denim", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" },
      { sector: "US Orange Juice", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" }
    ],
    tradeDisputes: ["EU-US Steel Dispute"],
    retaliatoryTariffs: 0
  },
  JP: {
    averageTariff: 2.4,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  GB: {
    averageTariff: 2.1,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" },
      { sector: "US Aluminum", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" },
      { sector: "US Whiskey", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }
    ],
    tradeDisputes: ["EU-US Steel Dispute"],
    retaliatoryTariffs: 0
  },
  IN: {
    averageTariff: 13.4,
    appliedTariffs: [
      { sector: "US Apples", rate: 20, status: "Active", effectiveDate: "2019-06-16" },
      { sector: "US Almonds", rate: 20, status: "Active", effectiveDate: "2019-06-16" },
      { sector: "US Walnuts", rate: 20, status: "Active", effectiveDate: "2019-06-16" },
      { sector: "US Steel", rate: 10, status: "Active", effectiveDate: "2019-06-16" },
      { sector: "US Aluminum", rate: 10, status: "Active", effectiveDate: "2019-06-16" }
    ],
    tradeDisputes: ["India-US Trade Tensions"],
    retaliatoryTariffs: 20
  },
  BR: {
    averageTariff: 11.5,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  KR: {
    averageTariff: 4.2,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  CA: {
    averageTariff: 1.5,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  AU: {
    averageTariff: 2.8,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  MX: {
    averageTariff: 4.9,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  RU: {
    averageTariff: 6.0,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  },
  SA: {
    averageTariff: 5.2,
    appliedTariffs: [
      { sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" },
      { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }
    ],
    tradeDisputes: [],
    retaliatoryTariffs: 0
  }
};

// Tariff and Trade War Data
const tariffData = {
  currentDisputes: [
    {
      id: 1,
      title: "US-China Trade War",
      status: "Ongoing",
      startDate: "2018-03-01",
      description: "Bilateral trade tensions between the world's two largest economies",
      tariffs: {
        us: { total: 25, affected: 250, sectors: ["Electronics", "Machinery", "Textiles"] },
        china: { total: 25, affected: 110, sectors: ["Agriculture", "Aerospace", "Chemicals"] },
        eu: null,
        india: null
      },
      impact: {
        globalTrade: -0.5,
        gdp: -0.3,
        affectedCountries: 40
      },
      timeline: [
        { date: "2018-03-01", event: "US imposes 25% tariffs on steel and aluminum" },
        { date: "2018-07-06", event: "US imposes 25% tariffs on $34B Chinese goods" },
        { date: "2018-08-23", event: "China retaliates with 25% tariffs on $16B US goods" },
        { date: "2019-05-10", event: "US increases tariffs to 25% on $200B Chinese goods" },
        { date: "2020-01-15", event: "Phase 1 trade deal signed" },
        { date: "2024-01-01", event: "Some tariffs remain in place" }
      ]
    },
    {
      id: 2,
      title: "EU-US Steel Dispute",
      status: "Resolved",
      startDate: "2018-06-01",
      description: "Dispute over steel and aluminum tariffs affecting transatlantic trade",
      tariffs: {
        us: { total: 25, affected: 50, sectors: ["Steel", "Aluminum"] },
        eu: { total: 25, affected: 30, sectors: ["Motorcycles", "Whiskey", "Denim"] },
        china: null
      },
      impact: {
        globalTrade: -0.1,
        gdp: -0.05,
        affectedCountries: 28
      },
      timeline: [
        { date: "2018-06-01", event: "US imposes steel/aluminum tariffs on EU" },
        { date: "2018-06-22", event: "EU retaliates with counter-tariffs" },
        { date: "2021-10-30", event: "Agreement reached to suspend tariffs" },
        { date: "2022-01-01", event: "Tariffs officially suspended" }
      ]
    },
    {
      id: 3,
      title: "India-US Trade Tensions",
      status: "Ongoing",
      startDate: "2019-06-05",
      description: "Disputes over digital services tax and market access",
      tariffs: {
        us: { total: 10, affected: 20, sectors: ["Steel", "Aluminum"] },
        india: { total: 20, affected: 15, sectors: ["Apples", "Almonds", "Walnuts"] },
        china: null,
        eu: null
      },
      impact: {
        globalTrade: -0.05,
        gdp: -0.02,
        affectedCountries: 2
      },
      timeline: [
        { date: "2019-06-05", event: "US removes India from GSP program" },
        { date: "2019-06-16", event: "India imposes retaliatory tariffs" },
        { date: "2020-02-14", event: "Limited trade deal signed" },
        { date: "2024-01-01", event: "Negotiations ongoing" }
      ]
    }
  ],
  historicalWars: [
    {
      name: "Smoot-Hawley Tariff Act (1930)",
      period: "1930-1934",
      description: "Raised US tariffs on over 20,000 imported goods, contributing to the Great Depression",
      averageTariff: 20,
      impact: "Global trade fell by 66%",
      countries: ["USA", "Canada", "UK", "France", "Germany"]
    },
    {
      name: "Chicken War (1962-1964)",
      period: "1962-1964",
      description: "Trade dispute between US and European Economic Community over poultry exports",
      averageTariff: 25,
      impact: "US poultry exports to Europe fell by 25%",
      countries: ["USA", "France", "Germany", "Netherlands"]
    },
    {
      name: "US-Japan Trade War (1980s)",
      period: "1980-1995",
      description: "Series of trade disputes over automobiles, semiconductors, and steel",
      averageTariff: 100,
      impact: "Voluntary export restraints implemented",
      countries: ["USA", "Japan"]
    },
    {
      name: "Banana Wars (1993-2012)",
      period: "1993-2012",
      description: "Dispute between US and EU over banana import policies",
      averageTariff: 20,
      impact: "WTO ruled against EU banana regime",
      countries: ["USA", "EU", "Ecuador", "Costa Rica"]
    }
  ],
  globalTariffTrends: [
    { year: 2015, average: 2.5, countries: 195 },
    { year: 2016, average: 2.6, countries: 195 },
    { year: 2017, average: 2.7, countries: 195 },
    { year: 2018, average: 3.2, countries: 195 },
    { year: 2019, average: 3.8, countries: 195 },
    { year: 2020, average: 4.1, countries: 195 },
    { year: 2021, average: 4.3, countries: 195 },
    { year: 2022, average: 4.5, countries: 195 },
    { year: 2023, average: 4.7, countries: 195 },
    { year: 2024, average: 4.9, countries: 195 }
  ],
  sectoralImpacts: [
    { sector: "Steel", tariffIncrease: 25, tradeVolume: -15, affectedCountries: 45 },
    { sector: "Aluminum", tariffIncrease: 10, tradeVolume: -8, affectedCountries: 30 },
    { sector: "Automobiles", tariffIncrease: 2.5, tradeVolume: -5, affectedCountries: 25 },
    { sector: "Electronics", tariffIncrease: 15, tradeVolume: -12, affectedCountries: 40 },
    { sector: "Agriculture", tariffIncrease: 20, tradeVolume: -18, affectedCountries: 35 },
    { sector: "Textiles", tariffIncrease: 10, tradeVolume: -6, affectedCountries: 20 }
  ]
};

const TradingPlacesPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState(mockTradeData.countries[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('tradeBalance');
  const [filterRegion, setFilterRegion] = useState('All');
  const [tariffTab, setTariffTab] = useState('current');
  const [activeMetricCategory, setActiveMetricCategory] = useState('complexity');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [enableRealData, setEnableRealData] = useLocalStorage('enableRealData', false);
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [showHistoricalView, setShowHistoricalView] = useState(false);
  const [customStartYear, setCustomStartYear] = useState<number>(1960);
  const [customEndYear, setCustomEndYear] = useState<number>(2023);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [selectedCountriesForComparison, setSelectedCountriesForComparison] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'all' | 'selected'>('all');

  // Regional Trade Blocs Data
  const tradeBlocs = {
    'USMCA': {
      name: 'United States-Mexico-Canada Agreement',
      acronym: 'USMCA',
      established: '2020',
      type: 'Free Trade Agreement',
      members: [
        { code: 'US', name: 'United States', population: 332000000, gdp: 21400000 },
        { code: 'CA', name: 'Canada', population: 38000000, gdp: 1740000 },
        { code: 'MX', name: 'Mexico', population: 129000000, gdp: 1300000 }
      ],
      totalGdp: 24440000,
      totalPopulation: 499000000,
      intraBlocTrade: 1200000,
      tradeCoverage: 95.0,
      keyFeatures: [
        'Elimination of tariffs on 99% of goods',
        'Digital trade provisions',
        'Labor and environmental standards',
        'Intellectual property protections'
      ],
      majorSectors: ['Automotive', 'Agriculture', 'Energy', 'Manufacturing']
    },
    'EU': {
      name: 'European Union',
      acronym: 'EU',
      established: '1993',
      type: 'Customs Union & Single Market',
      members: [
        { code: 'DE', name: 'Germany', population: 83000000, gdp: 3850000 },
        { code: 'FR', name: 'France', population: 67000000, gdp: 2630000 },
        { code: 'IT', name: 'Italy', population: 59000000, gdp: 2000000 },
        { code: 'ES', name: 'Spain', population: 47000000, gdp: 1400000 }
      ],
      totalGdp: 15600000,
      totalPopulation: 447000000,
      intraBlocTrade: 3800000,
      tradeCoverage: 99.0,
      keyFeatures: [
        'Common external tariff',
        'Free movement of goods, services, capital, people',
        'Common currency (Euro)',
        'Harmonized regulations'
      ],
      majorSectors: ['Manufacturing', 'Services', 'Agriculture', 'Technology']
    },
    'ASEAN': {
      name: 'Association of Southeast Asian Nations',
      acronym: 'ASEAN',
      established: '1967',
      type: 'Free Trade Area',
      members: [
        { code: 'ID', name: 'Indonesia', population: 274000000, gdp: 1120000 },
        { code: 'TH', name: 'Thailand', population: 70000000, gdp: 500000 },
        { code: 'SG', name: 'Singapore', population: 6000000, gdp: 340000 },
        { code: 'MY', name: 'Malaysia', population: 32000000, gdp: 340000 }
      ],
      totalGdp: 3200000,
      totalPopulation: 661000000,
      intraBlocTrade: 600000,
      tradeCoverage: 92.0,
      keyFeatures: [
        'ASEAN Free Trade Area (AFTA)',
        'Common Effective Preferential Tariff',
        'Services liberalization',
        'Investment facilitation'
      ],
      majorSectors: ['Electronics', 'Palm Oil', 'Textiles', 'Tourism']
    },
    'MERCOSUR': {
      name: 'Southern Common Market',
      acronym: 'MERCOSUR',
      established: '1991',
      type: 'Customs Union',
      members: [
        { code: 'BR', name: 'Brazil', population: 213000000, gdp: 1610000 },
        { code: 'AR', name: 'Argentina', population: 45000000, gdp: 450000 },
        { code: 'UY', name: 'Uruguay', population: 4000000, gdp: 53000 },
        { code: 'PY', name: 'Paraguay', population: 7000000, gdp: 38000 }
      ],
      totalGdp: 2150000,
      totalPopulation: 269000000,
      intraBlocTrade: 280000,
      tradeCoverage: 87.0,
      keyFeatures: [
        'Common external tariff',
        'Free movement of goods and services',
        'Macroeconomic coordination',
        'Sectoral agreements'
      ],
      majorSectors: ['Agriculture', 'Mining', 'Manufacturing', 'Energy']
    },
    'CPTPP': {
      name: 'Comprehensive and Progressive Trans-Pacific Partnership',
      acronym: 'CPTPP',
      established: '2018',
      type: 'Free Trade Agreement',
      members: [
        { code: 'JP', name: 'Japan', population: 126000000, gdp: 4940000 },
        { code: 'CA', name: 'Canada', population: 38000000, gdp: 1740000 },
        { code: 'AU', name: 'Australia', population: 26000000, gdp: 1330000 },
        { code: 'MX', name: 'Mexico', population: 129000000, gdp: 1300000 }
      ],
      totalGdp: 13400000,
      totalPopulation: 500000000,
      intraBlocTrade: 2100000,
      tradeCoverage: 96.0,
      keyFeatures: [
        'Elimination of 95% of tariffs',
        'High-standard trade rules',
        'Digital economy provisions',
        'Environmental protections'
      ],
      majorSectors: ['Technology', 'Agriculture', 'Manufacturing', 'Services']
    },
    'RCEP': {
      name: 'Regional Comprehensive Economic Partnership',
      acronym: 'RCEP',
      established: '2022',
      type: 'Free Trade Agreement',
      members: [
        { code: 'CN', name: 'China', population: 1440000000, gdp: 14720000 },
        { code: 'JP', name: 'Japan', population: 126000000, gdp: 4940000 },
        { code: 'KR', name: 'South Korea', population: 52000000, gdp: 1640000 },
        { code: 'AU', name: 'Australia', population: 26000000, gdp: 1330000 }
      ],
      totalGdp: 26200000,
      totalPopulation: 2300000000,
      intraBlocTrade: 2800000,
      tradeCoverage: 92.0,
      keyFeatures: [
        'World\'s largest trade agreement',
        'Gradual tariff elimination',
        'Rules of origin simplification',
        'E-commerce provisions'
      ],
      majorSectors: ['Manufacturing', 'Technology', 'Agriculture', 'Services']
    }
  };

  // Advanced Trade Measurements and Indicators
  const advancedTradeMetrics = {
    // Economic Complexity and Sophistication
    economicComplexity: {
      'US': { eci: 1.23, rank: 9, productComplexity: 0.89, opportunityValue: 0.76 },
      'CN': { eci: 0.26, rank: 25, productComplexity: 0.45, opportunityValue: 1.12 },
      'DE': { eci: 2.09, rank: 1, productComplexity: 1.15, opportunityValue: 0.34 },
      'JP': { eci: 2.07, rank: 2, productComplexity: 1.23, opportunityValue: 0.28 },
      'GB': { eci: 1.54, rank: 5, productComplexity: 0.92, opportunityValue: 0.67 },
      'IN': { eci: -0.34, rank: 42, productComplexity: 0.23, opportunityValue: 1.45 },
      'BR': { eci: -0.19, rank: 35, productComplexity: 0.31, opportunityValue: 1.23 },
      'KR': { eci: 1.66, rank: 4, productComplexity: 1.08, opportunityValue: 0.45 },
      'CA': { eci: 0.78, rank: 15, productComplexity: 0.56, opportunityValue: 0.89 },
      'AU': { eci: -0.28, rank: 39, productComplexity: 0.19, opportunityValue: 1.34 },
      'MX': { eci: 0.25, rank: 26, productComplexity: 0.43, opportunityValue: 0.98 },
      'RU': { eci: -0.45, rank: 47, productComplexity: 0.15, opportunityValue: 1.67 },
      'SA': { eci: -1.23, rank: 67, productComplexity: 0.08, opportunityValue: 2.15 }
    },

    // Trade Connectivity and Network Analysis
    tradeConnectivity: {
      'US': { partners: 195, networkCentrality: 0.92, tradeClusterCoeff: 0.78, avgDistance: 1.23 },
      'CN': { partners: 187, networkCentrality: 0.89, tradeClusterCoeff: 0.82, avgDistance: 1.18 },
      'DE': { partners: 176, networkCentrality: 0.85, tradeClusterCoeff: 0.91, avgDistance: 1.15 },
      'JP': { partners: 164, networkCentrality: 0.76, tradeClusterCoeff: 0.73, avgDistance: 1.34 },
      'GB': { partners: 158, networkCentrality: 0.74, tradeClusterCoeff: 0.69, avgDistance: 1.41 },
      'IN': { partners: 142, networkCentrality: 0.67, tradeClusterCoeff: 0.58, avgDistance: 1.67 },
      'BR': { partners: 138, networkCentrality: 0.62, tradeClusterCoeff: 0.54, avgDistance: 1.78 },
      'KR': { partners: 145, networkCentrality: 0.69, tradeClusterCoeff: 0.71, avgDistance: 1.52 },
      'CA': { partners: 156, networkCentrality: 0.71, tradeClusterCoeff: 0.66, avgDistance: 1.45 },
      'AU': { partners: 134, networkCentrality: 0.58, tradeClusterCoeff: 0.49, avgDistance: 1.89 },
      'MX': { partners: 128, networkCentrality: 0.55, tradeClusterCoeff: 0.61, avgDistance: 1.73 },
      'RU': { partners: 119, networkCentrality: 0.51, tradeClusterCoeff: 0.43, avgDistance: 1.95 },
      'SA': { partners: 98, networkCentrality: 0.42, tradeClusterCoeff: 0.38, avgDistance: 2.12 }
    },

    // Trade Performance and Competitiveness
    tradePerformance: {
      'US': { exportQuality: 0.87, marketShare: 8.7, competitiveness: 0.91, innovation: 0.94 },
      'CN': { exportQuality: 0.56, marketShare: 14.2, competitiveness: 0.78, innovation: 0.67 },
      'DE': { exportQuality: 0.95, marketShare: 8.1, competitiveness: 0.96, innovation: 0.89 },
      'JP': { exportQuality: 0.92, marketShare: 3.8, competitiveness: 0.88, innovation: 0.91 },
      'GB': { exportQuality: 0.84, marketShare: 2.9, competitiveness: 0.82, innovation: 0.86 },
      'IN': { exportQuality: 0.43, marketShare: 1.8, competitiveness: 0.54, innovation: 0.45 },
      'BR': { exportQuality: 0.49, marketShare: 1.2, competitiveness: 0.58, innovation: 0.41 },
      'KR': { exportQuality: 0.81, marketShare: 3.1, competitiveness: 0.84, innovation: 0.83 },
      'CA': { exportQuality: 0.73, marketShare: 2.4, competitiveness: 0.76, innovation: 0.72 },
      'AU': { exportQuality: 0.61, marketShare: 1.5, competitiveness: 0.69, innovation: 0.58 },
      'MX': { exportQuality: 0.58, marketShare: 2.1, competitiveness: 0.63, innovation: 0.48 },
      'RU': { exportQuality: 0.34, marketShare: 1.8, competitiveness: 0.45, innovation: 0.32 },
      'SA': { exportQuality: 0.28, marketShare: 1.3, competitiveness: 0.41, innovation: 0.25 }
    },

    // Trade Sustainability and Environmental Impact
    tradeSustainability: {
      'US': { carbonIntensity: 0.42, sustainableExports: 23.4, greenTech: 0.78, circularTrade: 0.34 },
      'CN': { carbonIntensity: 0.89, sustainableExports: 12.8, greenTech: 0.56, circularTrade: 0.21 },
      'DE': { carbonIntensity: 0.31, sustainableExports: 34.7, greenTech: 0.91, circularTrade: 0.67 },
      'JP': { carbonIntensity: 0.38, sustainableExports: 28.9, greenTech: 0.85, circularTrade: 0.58 },
      'GB': { carbonIntensity: 0.35, sustainableExports: 31.2, greenTech: 0.82, circularTrade: 0.52 },
      'IN': { carbonIntensity: 0.76, sustainableExports: 8.9, greenTech: 0.41, circularTrade: 0.18 },
      'BR': { carbonIntensity: 0.58, sustainableExports: 15.6, greenTech: 0.38, circularTrade: 0.23 },
      'KR': { carbonIntensity: 0.45, sustainableExports: 22.1, greenTech: 0.74, circularTrade: 0.41 },
      'CA': { carbonIntensity: 0.48, sustainableExports: 19.8, greenTech: 0.69, circularTrade: 0.36 },
      'AU': { carbonIntensity: 0.67, sustainableExports: 14.3, greenTech: 0.52, circularTrade: 0.28 },
      'MX': { carbonIntensity: 0.54, sustainableExports: 11.7, greenTech: 0.43, circularTrade: 0.25 },
      'RU': { carbonIntensity: 0.82, sustainableExports: 7.2, greenTech: 0.29, circularTrade: 0.15 },
      'SA': { carbonIntensity: 0.95, sustainableExports: 4.8, greenTech: 0.22, circularTrade: 0.12 }
    },

    // Trade Finance and Logistics
    tradeInfrastructure: {
      'US': { logisticsIndex: 4.05, tradeCost: 0.8, financingAccess: 0.92, digitalTrade: 0.89 },
      'CN': { logisticsIndex: 3.61, tradeCost: 1.2, financingAccess: 0.76, digitalTrade: 0.81 },
      'DE': { logisticsIndex: 4.20, tradeCost: 0.7, financingAccess: 0.95, digitalTrade: 0.91 },
      'JP': { logisticsIndex: 4.03, tradeCost: 0.9, financingAccess: 0.88, digitalTrade: 0.86 },
      'GB': { logisticsIndex: 3.99, tradeCost: 0.9, financingAccess: 0.91, digitalTrade: 0.94 },
      'IN': { logisticsIndex: 3.18, tradeCost: 1.8, financingAccess: 0.54, digitalTrade: 0.67 },
      'BR': { logisticsIndex: 2.99, tradeCost: 2.1, financingAccess: 0.61, digitalTrade: 0.58 },
      'KR': { logisticsIndex: 3.72, tradeCost: 1.1, financingAccess: 0.83, digitalTrade: 0.88 },
      'CA': { logisticsIndex: 3.73, tradeCost: 1.0, financingAccess: 0.87, digitalTrade: 0.82 },
      'AU': { logisticsIndex: 3.75, tradeCost: 1.3, financingAccess: 0.79, digitalTrade: 0.75 },
      'MX': { logisticsIndex: 3.05, tradeCost: 1.7, financingAccess: 0.67, digitalTrade: 0.63 },
      'RU': { logisticsIndex: 2.76, tradeCost: 2.4, financingAccess: 0.48, digitalTrade: 0.51 },
      'SA': { logisticsIndex: 3.01, tradeCost: 1.9, financingAccess: 0.72, digitalTrade: 0.59 }
    },

    // Trade Vulnerability and Resilience
    tradeResilience: {
      'US': { supplyChainRisk: 0.34, tradeConcentration: 0.28, resilience: 0.87, adaptability: 0.82 },
      'CN': { supplyChainRisk: 0.45, tradeConcentration: 0.31, resilience: 0.76, adaptability: 0.79 },
      'DE': { supplyChainRisk: 0.38, tradeConcentration: 0.42, resilience: 0.81, adaptability: 0.85 },
      'JP': { supplyChainRisk: 0.52, tradeConcentration: 0.48, resilience: 0.73, adaptability: 0.78 },
      'GB': { supplyChainRisk: 0.41, tradeConcentration: 0.35, resilience: 0.79, adaptability: 0.81 },
      'IN': { supplyChainRisk: 0.67, tradeConcentration: 0.58, resilience: 0.56, adaptability: 0.62 },
      'BR': { supplyChainRisk: 0.71, tradeConcentration: 0.62, resilience: 0.52, adaptability: 0.58 },
      'KR': { supplyChainRisk: 0.49, tradeConcentration: 0.51, resilience: 0.71, adaptability: 0.74 },
      'CA': { supplyChainRisk: 0.43, tradeConcentration: 0.39, resilience: 0.76, adaptability: 0.72 },
      'AU': { supplyChainRisk: 0.56, tradeConcentration: 0.67, resilience: 0.64, adaptability: 0.68 },
      'MX': { supplyChainRisk: 0.59, tradeConcentration: 0.73, resilience: 0.61, adaptability: 0.65 },
      'RU': { supplyChainRisk: 0.78, tradeConcentration: 0.81, resilience: 0.45, adaptability: 0.48 },
      'SA': { supplyChainRisk: 0.85, tradeConcentration: 0.89, resilience: 0.38, adaptability: 0.41 }
    }
  };

  // Real data integration
  const {
    data: realTradeData,
    loading,
    error,
    lastUpdated,
    isRealData,
    refreshData
  } = useTradeData({
    countries: ['US', 'CN', 'DE', 'JP', 'GB', 'IN', 'BR', 'KR', 'CA', 'AU', 'MX', 'RU', 'SA', 'FR', 'IT', 'ES', 'ID', 'TR'],
    enableRealData,
    refreshInterval: 3600000 // 1 hour
  });

  // Historical data integration (fetching from 1960 - earliest World Bank data)
  const {
    yearlyData: historicalYearlyData,
    trends: historicalTrends,
    globalTrends: historicalGlobalTrends,
    loading: historicalLoading,
    error: historicalError,
    availableYearRange,
    refreshData: refreshHistoricalData
  } = useHistoricalTradeData({
    countries: ['US', 'CN', 'DE', 'JP', 'GB', 'IN', 'BR', 'KR', 'CA', 'AU', 'MX', 'RU', 'SA', 'FR', 'IT', 'ES', 'ID', 'TR'],
    startYear: customStartYear,
    endYear: customEndYear,
    enableRealData: enableRealData && showHistoricalView
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme changes
  useEffect(() => {
    // Apply theme changes to DOM
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('themeChange'));
  }, [isDarkMode]);

  // Debug logging for comparison feature
  useEffect(() => {
    if (comparisonMode === 'selected' && selectedCountriesForComparison.length >= 2) {
      console.log('Comparison Debug:', {
        selectedCountries: selectedCountriesForComparison,
        historicalTrendsKeys: Object.keys(historicalTrends),
        historicalTrendsLength: Object.keys(historicalTrends).length,
        enableRealData,
        showHistoricalView,
        historicalLoading,
        sampleTrend: historicalTrends[selectedCountriesForComparison[0]]
      });
    }
  }, [comparisonMode, selectedCountriesForComparison, historicalTrends, enableRealData, showHistoricalView, historicalLoading]);

  // Merge real data with mock data
  const combinedTradeData = useMemo(() => {
    if (enableRealData && realTradeData.length > 0) {
      // Log the incoming real data for debugging
      console.log('Real Trade Data received:', realTradeData.map(r => ({
        code: r.code,
        countryCode: r.countryCode,
        country: r.country,
        exports: r.exports,
        imports: r.imports
      })));

      // First, merge real data with mock data for each country
      const mergedCountries = mockTradeData.countries.map(mockCountry => {
        const realCountryData = realTradeData.find(real => 
          real.code === mockCountry.code || // Match by 2-letter code (e.g., US)
          real.countryCode === mockCountry.code || // Match by code field
          real.countryCode === COUNTRY_MAPPINGS[mockCountry.code] || // Match by mapped 3-letter code (e.g., USA)
          real.country?.toLowerCase() === mockCountry.name.toLowerCase() // Match by country name
        );

        if (realCountryData) {
          console.log(`Matched ${mockCountry.code} (${mockCountry.name}) with real data:`, {
            exports: realCountryData.exports,
            imports: realCountryData.imports,
            totalExports: realCountryData.exports || mockCountry.totalExports,
            totalImports: realCountryData.imports || mockCountry.totalImports
          });
          return {
            ...mockCountry,
            // Use real data if it exists and is a valid number, otherwise use mock data
            totalExports: (typeof realCountryData.exports === 'number' && realCountryData.exports > 0) 
              ? realCountryData.exports 
              : mockCountry.totalExports,
            totalImports: (typeof realCountryData.imports === 'number' && realCountryData.imports > 0) 
              ? realCountryData.imports 
              : mockCountry.totalImports,
            tradeBalance: (typeof realCountryData.tradeBalance === 'number') 
              ? realCountryData.tradeBalance 
              : mockCountry.tradeBalance,
            gdp: (typeof realCountryData.gdp === 'number' && realCountryData.gdp > 0) 
              ? realCountryData.gdp 
              : mockCountry.gdp,
            population: (typeof realCountryData.population === 'number' && realCountryData.population > 0) 
              ? realCountryData.population 
              : mockCountry.population,
            tradeIntensity: (typeof realCountryData.tradeIntensity === 'number' && realCountryData.tradeIntensity > 0) 
              ? realCountryData.tradeIntensity 
              : mockCountry.tradeIntensity,
            diversificationIndex: (typeof realCountryData.diversificationIndex === 'number') 
              ? realCountryData.diversificationIndex 
              : mockCountry.diversificationIndex,
            // Use real data for categories if available, otherwise keep mock
            topExports: realCountryData.topExports && realCountryData.topExports.length > 0 
              ? realCountryData.topExports 
              : mockCountry.topExports,
            topImports: realCountryData.topImports && realCountryData.topImports.length > 0 
              ? realCountryData.topImports 
              : mockCountry.topImports,
            tradePartners: realCountryData.tradingPartners && realCountryData.tradingPartners.length > 0
              ? realCountryData.tradingPartners 
              : mockCountry.tradePartners,
            // Use real growth rates if available
            exportGrowth: (typeof realCountryData.exportGrowth === 'number') 
              ? realCountryData.exportGrowth 
              : mockCountry.exportGrowth,
            importGrowth: (typeof realCountryData.importGrowth === 'number') 
              ? realCountryData.importGrowth 
              : mockCountry.importGrowth
          };
        }
        return mockCountry;
      });

      // Calculate global stats from the merged country data
      const totalWorldTrade = mergedCountries.reduce((sum, country) => 
        sum + (country.totalExports || 0) + (country.totalImports || 0), 0
      );

      // Get top trading nations by exports
      const topTradingNations = mergedCountries
        .filter(country => country.totalExports > 0)
        .sort((a, b) => b.totalExports - a.totalExports)
        .slice(0, 5)
        .map(country => country.name);

      // Calculate average trade intensity
      const validTradeIntensities = mergedCountries
        .filter(country => country.tradeIntensity > 0)
        .map(country => country.tradeIntensity);
      const averageTradeIntensity = validTradeIntensities.length > 0
        ? validTradeIntensities.reduce((sum, val) => sum + val, 0) / validTradeIntensities.length
        : mockTradeData.globalStats.tradeMetrics.averageTradeIntensity;

      // Calculate global trade growth
      const validGrowthRates = mergedCountries
        .filter(country => country.exportGrowth !== undefined && country.importGrowth !== undefined)
        .map(country => (country.exportGrowth + country.importGrowth) / 2);
      const globalTradeGrowth = validGrowthRates.length > 0
        ? validGrowthRates.reduce((sum, val) => sum + val, 0) / validGrowthRates.length
        : mockTradeData.globalStats.tradeMetrics.globalTradeGrowth;

      // Log for debugging
      console.log('Trading Places - Real Data:', {
        realDataCount: realTradeData.length,
        mergedCountriesCount: mergedCountries.length,
        totalWorldTrade,
        topTradingNations,
        averageTradeIntensity,
        globalTradeGrowth
      });

      return {
        countries: mergedCountries,
        globalStats: {
          ...mockTradeData.globalStats,
          totalWorldTrade: totalWorldTrade > 0 ? totalWorldTrade : mockTradeData.globalStats.totalWorldTrade,
          topTradingNations: topTradingNations.length > 0 ? topTradingNations : mockTradeData.globalStats.topTradingNations,
          tradeMetrics: {
            ...mockTradeData.globalStats.tradeMetrics,
            averageTradeIntensity,
            globalTradeGrowth
          }
        }
      };
    }
    return mockTradeData;
  }, [enableRealData, realTradeData]);

  const sortedCountries = useMemo(() => {
    let filtered = [...combinedTradeData.countries];
    
    // Filter by region
    if (filterRegion !== 'All') {
      filtered = filtered.filter(country => country.region === filterRegion);
    }
    
    // Sort by selected metric
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tradeBalance':
          return b.tradeBalance - a.tradeBalance;
        case 'totalExports':
          return b.totalExports - a.totalExports;
        case 'totalImports':
          return b.totalImports - a.totalImports;
        case 'gdp':
          return b.gdp - a.gdp;
        case 'tradeIntensity':
          return b.tradeIntensity - a.tradeIntensity;
        case 'diversificationIndex':
          return b.diversificationIndex - a.diversificationIndex;
        case 'exportGrowth':
          return b.exportGrowth - a.exportGrowth;
        case 'importGrowth':
          return b.importGrowth - a.importGrowth;
        case 'population':
          return b.population - a.population;
        default:
          return 0;
      }
    });
  }, [sortBy, filterRegion, combinedTradeData]);

  const formatNumber = (num: number, suffix: string = 'B') => {
    return `$${Math.round(Math.abs(num))}${suffix}`;
  };

  const formatPercentage = (num: number, decimals: number = 1) => {
    return `${Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.round(num)}M`;
    }
    return Math.round(num).toString();
  };

  const formatDecimal = (num: number, decimals: number = 1) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  const getTradeBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTradeBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  // Memoized chart data to prevent infinite re-renders
  const chartData = useMemo(() => {
    const exportColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    const importColors = [
      '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777',
      '#0891B2', '#65A30D', '#EA580C', '#BE185D', '#4F46E5'
    ];
    
    const partnerColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'
    ];

    // Create stable data objects
    const exportData = selectedCountry.topExports.map((exportItem: string, index: number) => ({
      name: exportItem,
      value: 20 + (index * 5), // Stable values instead of Math.random()
      color: exportColors[index % exportColors.length],
      fill: exportColors[index % exportColors.length]
    }));

    const importData = selectedCountry.topImports.map((importItem: string, index: number) => ({
      name: importItem,
      value: 18 + (index * 4), // Stable values instead of Math.random()
      color: importColors[index % importColors.length],
      fill: importColors[index % importColors.length]
    }));

    const partnerData = selectedCountry.tradePartners.map((partner: any, index: number) => ({
      name: partner.country,
      value: partner.share,
      color: partnerColors[index % partnerColors.length],
      fill: partnerColors[index % partnerColors.length]
    }));

    return { exportData, importData, partnerData };
  }, [selectedCountry]);

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'
  ];

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
          {/* Static content that renders immediately */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Places</h1>
              <p className="text-sm text-gray-600">Global Trade Data & Statistics</p>
            </div>
          </div>
          
          {/* Static intro content visible during loading */}
          <div className="rounded-lg p-4 sm:p-6 bg-blue-50">
            <h2 className="text-lg font-semibold mb-3">Global Trade Analysis Dashboard</h2>
            <p className="text-sm mb-4">
              Explore international trade flows, import/export statistics, and trade relationships between 
              the world's major economies. Our data covers bilateral trade, trade balances, commodity breakdowns, 
              and historical trends from official UN Comtrade and World Bank sources.
            </p>
          </div>
          
          {/* Loading indicator with meaningful text */}
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading Trade Data</p>
            <p className="text-sm text-gray-500">Fetching global trade statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Places</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Global Trade Data & Statistics {isRealData && enableRealData ? '(Live Data)' : '(Demo Data)'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Light</span>
              <button
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`} />
              </button>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Dark</span>
            </div>
          </div>
        </div>

        {/* Static intro content - always visible for SEO and AdSense compliance */}
        <div className={`rounded-lg p-4 sm:p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <h2 className="text-lg font-semibold mb-3">Global Trade Analysis Dashboard</h2>
          <p className="text-sm mb-4">
            Explore international trade flows, import/export statistics, and trade relationships between 
            the world's major economies. Our data covers bilateral trade, trade balances, commodity breakdowns, 
            and historical trends from official UN Comtrade and World Bank sources.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <div className="font-medium mb-1">Trade Metrics</div>
              <ul className="space-y-1 opacity-80">
                <li>• Export/Import volumes</li>
                <li>• Trade balance analysis</li>
                <li>• Market concentration</li>
              </ul>
            </div>
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <div className="font-medium mb-1">Country Coverage</div>
              <ul className="space-y-1 opacity-80">
                <li>• 50+ major economies</li>
                <li>• Bilateral trade flows</li>
                <li>• Regional trade blocs</li>
              </ul>
            </div>
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <div className="font-medium mb-1">Data Sources</div>
              <ul className="space-y-1 opacity-80">
                <li>• UN Comtrade Database</li>
                <li>• World Bank indicators</li>
                <li>• IMF trade statistics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Only show ads when content is ready */}
        <AdSense show={mounted && !loading} />

        {/* Real Data Toggle */}
        <RealDataToggle
          isRealData={isRealData && enableRealData}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onToggle={() => setEnableRealData(!enableRealData)}
          onRefresh={refreshData}
          isDarkMode={isDarkMode}
        />

        {/* Alert when Compare Mode needs Live Data */}
        {comparisonMode === 'selected' && !enableRealData && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-300'} border-l-4`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">Live Data Required for Comparison</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  The country comparison feature requires real historical data from World Bank and UN Comtrade.
                </p>
                <button
                  onClick={() => setEnableRealData(true)}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Enable Live Data Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Historical Data Controls */}
        {enableRealData && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
            <div className="flex flex-col gap-4">
              {/* Main Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowHistoricalView(!showHistoricalView)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showHistoricalView
                        ? isDarkMode
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : isDarkMode
                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showHistoricalView ? 'Hide' : 'Show'} Historical Trends
                  </button>
                  
                  {showHistoricalView && (
                    <>
                      {historicalLoading && (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Loading historical data...
                        </span>
                      )}
                      {historicalError && (
                        <span className="text-sm text-red-500">
                          Error: {historicalError}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {showHistoricalView && !historicalLoading && Object.keys(historicalYearlyData).length > 0 && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5" />
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      View Year:
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className={`px-3 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {Object.keys(historicalYearlyData)
                        .map(Number)
                        .sort((a, b) => b - a)
                        .map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Date Range Selector */}
              {showHistoricalView && !historicalLoading && (
                <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date Range:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1960"
                        max={customEndYear}
                        value={customStartYear}
                        onChange={(e) => setCustomStartYear(Number(e.target.value))}
                        className={`w-20 px-2 py-1 rounded border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min={customStartYear}
                        max="2023"
                        value={customEndYear}
                        onChange={(e) => setCustomEndYear(Number(e.target.value))}
                        className={`w-20 px-2 py-1 rounded border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={refreshHistoricalData}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Apply Range
                  </button>

                  {availableYearRange && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Available data: {availableYearRange.min} - {availableYearRange.max} 
                      <span className="ml-2">({availableYearRange.max - availableYearRange.min + 1} years)</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCustomStartYear(1960);
                        setCustomEndYear(2023);
                      }}
                      className={`px-3 py-1 rounded text-xs ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Full Range (1960-2023)
                    </button>
                    <button
                      onClick={() => {
                        setCustomStartYear(2010);
                        setCustomEndYear(2023);
                      }}
                      className={`px-3 py-1 rounded text-xs ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Last 10 Years
                    </button>
                    <button
                      onClick={() => {
                        setCustomStartYear(2000);
                        setCustomEndYear(2023);
                      }}
                      className={`px-3 py-1 rounded text-xs ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      21st Century
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>World Trade Volume</p>
                {loading && enableRealData ? (
                  <p className="text-xl sm:text-2xl font-bold">Loading...</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-bold">{formatNumber(combinedTradeData.globalStats.totalWorldTrade, 'T')}</p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Growth: {formatPercentage(combinedTradeData.globalStats.tradeMetrics.globalTradeGrowth)} {isRealData && enableRealData ? '(Live)' : '(Demo)'}
                </p>
              </div>
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-green-50 text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Top Exporter</p>
                {loading && enableRealData ? (
                  <p className="text-lg sm:text-xl font-bold">Loading...</p>
                ) : (
                  <p className="text-lg sm:text-xl font-bold">{combinedTradeData.globalStats.topTradingNations[0]}</p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Trade Intensity: {formatPercentage(combinedTradeData.globalStats.tradeMetrics.averageTradeIntensity)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-purple-50 text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fastest Growing</p>
                <p className="text-lg sm:text-xl font-bold">{combinedTradeData.globalStats.fastestGrowing[0]}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Diversification: {formatPercentage(combinedTradeData.globalStats.tradeMetrics.averageDiversificationIndex * 100)}
                </p>
              </div>
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-orange-50 text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Trade Wars</p>
                <p className="text-xl sm:text-2xl font-bold">{combinedTradeData.globalStats.tradeWars.length}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Services Share: {formatPercentage(combinedTradeData.globalStats.tradeMetrics.servicesTradeShare)}
                </p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Historical Trends Section */}
        {showHistoricalView && !historicalLoading && Object.keys(historicalYearlyData).length > 0 && (
          <div className="space-y-6">
            {/* Data Range Info Banner */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-300'} border-l-4`}>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 mt-0.5 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">Historical Trade Data</h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Displaying {Object.keys(historicalYearlyData).length} years of trade data 
                    {availableYearRange && ` from ${availableYearRange.min} to ${availableYearRange.max}`}.
                    Data sourced from World Bank, UN Comtrade, and OECD databases.
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📊 World Bank trade statistics are available from 1960 onwards. Earlier data may be incomplete for some countries.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-bold mb-4">
                Global Trade Volume Over Time 
                {availableYearRange && (
                  <span className={`text-base font-normal ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ({availableYearRange.min}-{availableYearRange.max})
                  </span>
                )}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.entries(historicalGlobalTrends?.totalWorldTradeByYear || {})
                      .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
                      .map(([year, trade]) => ({
                        year: Number(year),
                        'World Trade Volume ($T)': Math.round((Number(trade) + Number.EPSILON) * 100) / 100
                      }))
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="year" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '0.5rem',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="World Trade Volume ($T)" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Country-Specific Historical Trends */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <div className="flex flex-col gap-4 mb-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Country Trade Trends 
                      {availableYearRange && (
                        <span className={`text-base font-normal ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({availableYearRange.min}-{availableYearRange.max})
                        </span>
                      )}
                    </h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {comparisonMode === 'selected' && selectedCountriesForComparison.length > 0
                        ? `Comparing ${selectedCountriesForComparison.length} selected countries`
                        : `Showing ${showAllCountries ? Object.keys(historicalTrends).length : Math.min(6, Object.keys(historicalTrends).length)} of ${Object.keys(historicalTrends).length} countries (sorted by export volume)`
                      }
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        if (comparisonMode === 'selected') {
                          setComparisonMode('all');
                          setSelectedCountriesForComparison([]);
                        } else {
                          // Check if Live Data is enabled before entering compare mode
                          if (!enableRealData) {
                            alert('⚠️ Please enable "Live Data" first!\n\nThe comparison feature requires real historical trade data from World Bank and UN Comtrade.\n\n1. Click the "Live Data" toggle at the top of the page\n2. Then click "Compare Countries" again');
                            return;
                          }
                          setComparisonMode('selected');
                          // Automatically enable historical view when entering compare mode
                          if (!showHistoricalView) {
                            setShowHistoricalView(true);
                          }
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        comparisonMode === 'selected'
                          ? isDarkMode
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                          : isDarkMode
                          ? 'bg-gray-600 text-white hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={!enableRealData && comparisonMode !== 'selected'}
                      title={!enableRealData ? 'Enable Live Data first' : ''}
                    >
                      {comparisonMode === 'selected' ? '✓ Compare Mode' : 'Compare Countries'}
                      {!enableRealData && comparisonMode !== 'selected' && ' 🔒'}
                    </button>
                    {comparisonMode === 'all' && (
                      <button
                        onClick={() => setShowAllCountries(!showAllCountries)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {showAllCountries ? 'Show Less' : `Show All Countries`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Country Selection Dropdown */}
                {comparisonMode === 'selected' && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Select countries to compare or use quick presets:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full sm:w-auto">
                          {/* Quick Select Presets - Popular Comparisons */}
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} col-span-full`}>
                            Popular:
                          </div>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['USA', 'CHN']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                          >
                            US vs China
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['USA', 'CHN', 'JPN', 'DEU']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            Top 4 Exporters
                          </button>

                          {/* Trade Blocs */}
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} col-span-full mt-2`}>
                            Trade Blocs:
                          </div>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['BRA', 'RUS', 'IND', 'CHN', 'SAU']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                            } text-white`}
                          >
                            BRICS
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['USA', 'CAN', 'MEX']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                            } text-white`}
                          >
                            USMCA
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['DEU', 'FRA', 'ITA', 'ESP']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
                            } text-white`}
                          >
                            European Union
                          </button>

                          {/* Regional Groupings */}
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} col-span-full mt-2`}>
                            Regions:
                          </div>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['CHN', 'JPN', 'KOR', 'IND']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                          >
                            Asia Major
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['USA', 'CAN', 'MEX', 'BRA']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'
                            } text-white`}
                          >
                            Americas
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['DEU', 'FRA', 'ITA', 'ESP']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                          >
                            EU Major
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['SAU', 'RUS']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
                            } text-white`}
                          >
                            Energy Producers
                          </button>
                          <button
                            onClick={() => {
                              if (!enableRealData) {
                                alert('Please enable Live Data first to use comparison features!');
                                return;
                              }
                              setSelectedCountriesForComparison(['AUS', 'CAN', 'BRA', 'RUS']);
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600'
                            } text-white`}
                          >
                            Resource Rich
                          </button>
                          {selectedCountriesForComparison.length > 0 && (
                            <button
                              onClick={() => setSelectedCountriesForComparison([])}
                              className={`text-xs px-3 py-1 rounded ${
                                isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                              } text-white`}
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Country Selection Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {Object.keys(historicalTrends)
                          .sort((a, b) => {
                            const countryA = mockTradeData.countries.find(c => c.code === a);
                            const countryB = mockTradeData.countries.find(c => c.code === b);
                            return (countryA?.name || a).localeCompare(countryB?.name || b);
                          })
                          .map(countryCode => {
                            const country = mockTradeData.countries.find(c => c.code === countryCode);
                            const twoLetterCode = REVERSE_COUNTRY_MAPPINGS[countryCode] || countryCode;
                            const FlagComponent = countryFlags[twoLetterCode];
                            const isSelected = selectedCountriesForComparison.includes(countryCode);
                            
                            return (
                              <button
                                key={countryCode}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCountriesForComparison(prev => prev.filter(c => c !== countryCode));
                                  } else {
                                    setSelectedCountriesForComparison(prev => [...prev, countryCode]);
                                  }
                                }}
                                className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? isDarkMode
                                      ? 'border-purple-500 bg-purple-600/30 text-white'
                                      : 'border-purple-500 bg-purple-50 text-purple-900'
                                    : isDarkMode
                                    ? 'border-gray-500 bg-gray-700 text-gray-300 hover:border-gray-400'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                              >
                                {FlagComponent && (
                                  <FlagComponent className="w-6 h-4 rounded shadow-sm flex-shrink-0" />
                                )}
                                <span className="text-xs truncate">{country?.name || countryCode}</span>
                                {isSelected && <span className="text-green-500 font-bold">✓</span>}
                              </button>
                            );
                          })}
                      </div>

                      {/* Selection Info */}
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-between`}>
                        <span>
                          {selectedCountriesForComparison.length === 0 && 'Select at least 1 country'}
                          {selectedCountriesForComparison.length === 1 && '1 country selected'}
                          {selectedCountriesForComparison.length > 1 && selectedCountriesForComparison.length <= 4 && `${selectedCountriesForComparison.length} countries selected - Good for comparison!`}
                          {selectedCountriesForComparison.length > 4 && `${selectedCountriesForComparison.length} countries selected - Consider selecting fewer for clearer comparison`}
                        </span>
                        {selectedCountriesForComparison.length > 0 && (
                          <span className={isDarkMode ? 'text-purple-400' : 'text-purple-600'}>
                            ← Click countries to toggle selection
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(historicalTrends)
                  .filter(([countryCode]) => {
                    // In comparison mode, only show selected countries
                    if (comparisonMode === 'selected') {
                      return selectedCountriesForComparison.length === 0 || selectedCountriesForComparison.includes(countryCode);
                    }
                    return true;
                  })
                  .sort(([, trendA]: [string, any], [, trendB]: [string, any]) => 
                    trendB.averageExports - trendA.averageExports // Sort by export volume
                  )
                  .slice(0, comparisonMode === 'selected' ? selectedCountriesForComparison.length : (showAllCountries ? Object.keys(historicalTrends).length : 6))
                  .map(([countryCode, trend]: [string, any]) => {
                    const twoLetterCode = REVERSE_COUNTRY_MAPPINGS[countryCode] || countryCode;
                    const FlagComponent = countryFlags[twoLetterCode];
                    const country = mockTradeData.countries.find(c => c.code === countryCode);
                    return (
                    <div key={countryCode} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} hover:shadow-lg transition-shadow`}>
                      <div className="flex items-center space-x-2 mb-3">
                        {FlagComponent && (
                          <FlagComponent className="w-8 h-6 rounded shadow-sm" />
                        )}
                        <h3 className="text-lg font-semibold">
                          {country?.name || countryCode}
                        </h3>
                      </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Export Growth:</span>
                        <span className={`font-semibold ${trend.exportGrowthTotal > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trend.exportGrowthTotal > 0 ? '+' : ''}{trend.exportGrowthTotal.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Import Growth:</span>
                        <span className={`font-semibold ${trend.importGrowthTotal > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trend.importGrowthTotal > 0 ? '+' : ''}{trend.importGrowthTotal.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Avg Exports:</span>
                        <span className="font-semibold">${trend.averageExports.toFixed(1)}B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Avg Imports:</span>
                        <span className="font-semibold">${trend.averageImports.toFixed(1)}B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Years with Data:</span>
                        <span className="font-semibold">{trend.yearsWithData}</span>
                      </div>
                    </div>
                    <div className="mt-4 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis 
                            dataKey="year" 
                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            style={{ fontSize: '0.75rem' }}
                          />
                          <YAxis 
                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            style={{ fontSize: '0.75rem' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem'
                            }}
                          />
                          <Line type="monotone" dataKey="exports" stroke="#10b981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="imports" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Side-by-Side Comparison Table */}
              {comparisonMode === 'selected' && selectedCountriesForComparison.length >= 2 && Object.keys(historicalTrends).length > 0 && (
                <div className={`mt-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-4">
                    Direct Comparison
                    <span className={`text-sm font-normal ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({selectedCountriesForComparison.length} countries)
                    </span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                          <th className="text-left p-3 font-semibold">Metric</th>
                          {selectedCountriesForComparison.map(countryCode => {
                            const country = mockTradeData.countries.find(c => c.code === countryCode);
                            const twoLetterCode = REVERSE_COUNTRY_MAPPINGS[countryCode] || countryCode;
                            const FlagComponent = countryFlags[twoLetterCode];
                            return (
                              <th key={countryCode} className="text-center p-3">
                                <div className="flex flex-col items-center space-y-1">
                                  {FlagComponent && (
                                    <FlagComponent className="w-8 h-6 rounded shadow-sm" />
                                  )}
                                  <span className="text-sm font-semibold">{country?.name || countryCode}</span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Export Growth */}
                        <tr className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <td className={`p-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Export Growth</td>
                          {selectedCountriesForComparison.map(countryCode => {
                            const trend = historicalTrends[countryCode];
                            return (
                              <td key={countryCode} className="text-center p-3">
                                {trend && typeof trend.exportGrowthTotal === 'number' ? (
                                  <span className={`font-semibold ${trend.exportGrowthTotal > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trend.exportGrowthTotal > 0 ? '+' : ''}{trend.exportGrowthTotal.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Import Growth */}
                        <tr className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <td className={`p-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Import Growth</td>
                          {selectedCountriesForComparison.map(countryCode => {
                            const trend = historicalTrends[countryCode];
                            return (
                              <td key={countryCode} className="text-center p-3">
                                {trend && typeof trend.importGrowthTotal === 'number' ? (
                                  <span className={`font-semibold ${trend.importGrowthTotal > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trend.importGrowthTotal > 0 ? '+' : ''}{trend.importGrowthTotal.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Average Exports */}
                        <tr className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <td className={`p-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Avg Exports</td>
                          {selectedCountriesForComparison.map(countryCode => {
                            const trend = historicalTrends[countryCode];
                            return (
                              <td key={countryCode} className="text-center p-3 font-semibold">
                                {trend && typeof trend.averageExports === 'number' 
                                  ? `$${trend.averageExports.toFixed(1)}B`
                                  : <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data</span>
                                }
                              </td>
                            );
                          })}
                        </tr>

                        {/* Average Imports */}
                        <tr className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <td className={`p-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Avg Imports</td>
                          {selectedCountriesForComparison.map(countryCode => {
                            const trend = historicalTrends[countryCode];
                            return (
                              <td key={countryCode} className="text-center p-3 font-semibold">
                                {trend && typeof trend.averageImports === 'number'
                                  ? `$${trend.averageImports.toFixed(1)}B`
                                  : <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data</span>
                                }
                              </td>
                            );
                          })}
                        </tr>

                        {/* Years with Data */}
                        <tr className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <td className={`p-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Years with Data</td>
                          {selectedCountriesForComparison.map(countryCode => {
                            const trend = historicalTrends[countryCode];
                            return (
                              <td key={countryCode} className="text-center p-3 font-semibold">
                                {trend && typeof trend.yearsWithData === 'number'
                                  ? trend.yearsWithData
                                  : <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data</span>
                                }
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Message when comparison mode is active but no data */}
              {comparisonMode === 'selected' && selectedCountriesForComparison.length >= 2 && Object.keys(historicalTrends).length === 0 && (
                <div className={`mt-6 p-6 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-300'} border-l-4`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{historicalLoading ? '⏳' : 'ℹ️'}</span>
                    <div>
                      <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {historicalLoading ? 'Loading Comparison Data...' : 'Comparison Data Not Available'}
                      </h3>
                      {historicalLoading ? (
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Please wait while we fetch historical trade data from World Bank and UN Comtrade...
                        </p>
                      ) : (
                        <>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Historical trade data hasn't been loaded yet. Please ensure:
                          </p>
                          <ul className={`text-sm mt-2 list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <li>You've enabled <strong>Live Data</strong> at the top of the page</li>
                            <li>You've clicked <strong>"Show Historical Trends"</strong> button above</li>
                            <li>Wait for the data to finish loading (this may take 10-30 seconds)</li>
                          </ul>
                          {!enableRealData && (
                            <div className={`mt-3 p-3 rounded ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                ⚠️ Live Data is currently disabled. Enable it to use the comparison feature.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Year-Specific Data View */}
            {historicalYearlyData[selectedYear] && (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <h2 className="text-2xl font-bold mb-4">Trade Data for {selectedYear}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className="text-left p-3">Country</th>
                        <th className="text-right p-3">Exports ($B)</th>
                        <th className="text-right p-3">Imports ($B)</th>
                        <th className="text-right p-3">Trade Balance ($B)</th>
                        <th className="text-right p-3">GDP ($T)</th>
                        <th className="text-right p-3">Trade Intensity (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalYearlyData[selectedYear]
                        .sort((a, b) => b.exports - a.exports)
                        .map((country: any) => (
                          <tr key={country.countryCode} className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <td className="p-3 font-medium">{country.country}</td>
                            <td className="text-right p-3">${country.exports.toFixed(1)}</td>
                            <td className="text-right p-3">${country.imports.toFixed(1)}</td>
                            <td className={`text-right p-3 font-semibold ${country.tradeBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              ${country.tradeBalance.toFixed(1)}
                            </td>
                            <td className="text-right p-3">${country.gdp.toFixed(2)}</td>
                            <td className="text-right p-3">{country.tradeIntensity.toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Country List */}
          <div className="lg:col-span-1">
            <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-bold">Countries ({sortedCountries.length})</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select 
                      value={filterRegion} 
                      onChange={(e) => setFilterRegion(e.target.value)}
                      className={`text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="All">All Regions</option>
                      <option value="North America">North America</option>
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="South America">South America</option>
                      <option value="Middle East">Middle East</option>
                      <option value="Oceania">Oceania</option>
                    </select>
                  </div>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="tradeBalance">Trade Balance</option>
                    <option value="totalExports">Total Exports</option>
                    <option value="totalImports">Total Imports</option>
                    <option value="gdp">GDP</option>
                    <option value="tradeIntensity">Trade Intensity</option>
                    <option value="diversificationIndex">Diversification</option>
                    <option value="exportGrowth">Export Growth</option>
                    <option value="importGrowth">Import Growth</option>
                    <option value="population">Population</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                {sortedCountries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => setSelectedCountry(country)}
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedCountry.code === country.code
                        ? isDarkMode 
                          ? 'border-blue-500 bg-blue-900/20' 
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-600'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-6 sm:w-10 sm:h-7 rounded overflow-hidden shadow-sm">
                          {React.createElement(countryFlags[country.code] || 'div', {
                            className: 'w-full h-full object-cover'
                          })}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {country.name}
                          </p>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {country.code} • {country.region}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 ${getTradeBalanceColor(country.tradeBalance)}`}>
                          {getTradeBalanceIcon(country.tradeBalance)}
                          <span className="font-semibold text-xs sm:text-sm">{formatNumber(country.tradeBalance)}</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sortBy === 'tradeBalance' ? 'Trade Balance' : 
                           sortBy === 'tradeIntensity' ? formatPercentage(country.tradeIntensity) :
                           sortBy === 'diversificationIndex' ? formatPercentage(country.diversificationIndex * 100) :
                           sortBy === 'exportGrowth' ? formatPercentage(country.exportGrowth) :
                           sortBy === 'importGrowth' ? formatPercentage(country.importGrowth) :
                           sortBy === 'population' ? `${formatLargeNumber(country.population)}` :
                           'Trade Balance'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country Details */}
          <div className="lg:col-span-2">
            <div className={`p-4 sm:p-6 rounded-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
              {/* Country Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-9 sm:w-16 sm:h-12 rounded overflow-hidden shadow-md">
                    {React.createElement(countryFlags[selectedCountry.code] || 'div', {
                      className: 'w-full h-full object-cover'
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{selectedCountry.name}</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Trade Statistics & Analysis
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    GDP: {formatNumber(selectedCountry.gdp, 'T')}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Population: {formatLargeNumber(selectedCountry.population)}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className={`flex flex-wrap gap-1 mb-4 sm:mb-6 rounded-lg p-1 ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                {['overview', 'exports', 'imports', 'partners', 'metrics', 'regional', 'charts', 'tariffs', 'country-tariffs', 'trade-blocs', 'advanced-metrics', 'data-sources'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? isDarkMode
                          ? 'bg-gray-500 text-white shadow-sm'
                          : 'bg-white text-blue-600 shadow-sm'
                        : isDarkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'trade-blocs' ? 'Trade Blocs' : 
                     tab === 'country-tariffs' ? 'Country Tariffs' :
                     tab === 'data-sources' ? 'Data Sources' :
                     tab === 'advanced-metrics' ? 'Advanced Metrics' :
                     tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-3 sm:p-4 rounded-md ${isDarkMode ? 'bg-green-900/20 text-white' : 'bg-green-50 text-gray-800'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                              Total Exports
                            </p>
                            <DataSourceIndicator
                              isRealData={enableRealData && isRealData}
                              metric="exports"
                              source={enableRealData ? "World Bank" : undefined}
                              lastUpdated={lastUpdated}
                              isDarkMode={isDarkMode}
                              size="sm"
                            />
                          </div>
                          <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedCountry.totalExports)}</p>
                        </div>
                        <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className={`p-3 sm:p-4 rounded-md ${isDarkMode ? 'bg-red-900/20 text-white' : 'bg-red-50 text-gray-800'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                              Total Imports
                            </p>
                            <DataSourceIndicator
                              isRealData={enableRealData && isRealData}
                              metric="imports"
                              source={enableRealData ? "World Bank" : undefined}
                              lastUpdated={lastUpdated}
                              isDarkMode={isDarkMode}
                              size="sm"
                            />
                          </div>
                          <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedCountry.totalImports)}</p>
                        </div>
                        <ArrowDownRight className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                      </div>
                    </div>
                    
                    <div className={`p-3 sm:p-4 rounded-md ${
                      selectedCountry.tradeBalance >= 0 
                        ? isDarkMode ? 'bg-blue-900/20 text-white' : 'bg-blue-50 text-gray-800'
                        : isDarkMode ? 'bg-orange-900/20 text-white' : 'bg-orange-50 text-gray-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm font-medium ${
                            selectedCountry.tradeBalance >= 0 
                              ? isDarkMode ? 'text-blue-300' : 'text-blue-800'
                              : isDarkMode ? 'text-orange-300' : 'text-orange-800'
                          }`}>Trade Balance</p>
                          <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedCountry.tradeBalance)}</p>
                        </div>
                        {getTradeBalanceIcon(selectedCountry.tradeBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trade Intensity</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{formatPercentage(selectedCountry.tradeIntensity)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(selectedCountry.tradeIntensity, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Trade as % of GDP
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Diversification</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{formatPercentage(selectedCountry.diversificationIndex * 100, 0)}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${selectedCountry.diversificationIndex * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Export diversification
                      </p>
                    </div>
                  </div>

                  {/* Top Exports */}
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Top Export Categories
                      </h3>
                      <DataSourceIndicator
                        isRealData={enableRealData && !!(selectedCountry as any).hasRealCategories}
                        metric="categories"
                        source={enableRealData ? "UN Comtrade" : undefined}
                        lastUpdated={lastUpdated}
                        isDarkMode={isDarkMode}
                        size="sm"
                      />
                    </div>
                    {enableRealData && !(selectedCountry as any).hasRealCategories && (
                      <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          ⚠️ Real category data unavailable for {selectedCountry.name}. Showing educational mock data based on real trade patterns.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCountry.topExports.map((item, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                        }`}>
                          <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              #{index + 1}
                            </span>
                            {enableRealData && !!(selectedCountry as any).hasRealCategories && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                              }`}>
                                Live
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exports' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Export Analysis
                    </h3>
                    <DataSourceIndicator
                      isRealData={enableRealData && !!(selectedCountry as any).hasRealCategories}
                      metric="export-categories"
                      source={enableRealData ? "UN Comtrade" : undefined}
                      lastUpdated={lastUpdated}
                      isDarkMode={isDarkMode}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedCountry.topExports.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                        isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {index + 1}
                          </div>
                          <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Export Category
                          </p>
                          <p className="font-semibold text-green-600 text-xs sm:text-sm">High Volume</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'imports' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Import Analysis
                    </h3>
                    <DataSourceIndicator
                      isRealData={enableRealData && !!(selectedCountry as any).hasRealCategories}
                      metric="import-categories"
                      source={enableRealData ? "UN Comtrade" : undefined}
                      lastUpdated={lastUpdated}
                      isDarkMode={isDarkMode}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedCountry.topImports.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {index + 1}
                          </div>
                          <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Import Category
                          </p>
                          <p className="font-semibold text-red-600 text-xs sm:text-sm">High Volume</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'partners' && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Top Trading Partners
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedCountry.tradePartners.map((partner, index) => {
                      const partnerCountry = mockTradeData.countries.find(c => c.name === partner.country);
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                          isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-6 sm:w-10 sm:h-7 rounded overflow-hidden shadow-sm">
                              {partnerCountry && React.createElement(countryFlags[partnerCountry.code] || 'div', {
                                className: 'w-full h-full object-cover'
                              })}
                            </div>
                            <div>
                              <span className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {partner.country}
                              </span>
                              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Trade Volume: {formatNumber(partner.tradeVolume)} • Share: {formatPercentage(partner.share)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Balance
                            </p>
                            <p className={`font-semibold text-xs sm:text-sm ${getTradeBalanceColor(partner.balance)}`}>
                              {formatNumber(partner.balance)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Advanced Trade Metrics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trade Intensity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current</span>
                          <span className="font-semibold">{selectedCountry.tradeIntensity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(selectedCountry.tradeIntensity, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Trade as % of GDP
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Diversification Index</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current</span>
                          <span className="font-semibold">{(selectedCountry.diversificationIndex * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${selectedCountry.diversificationIndex * 100}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Export diversification level
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Export Growth</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${selectedCountry.exportGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedCountry.exportGrowth >= 0 ? '+' : ''}{formatPercentage(selectedCountry.exportGrowth)}
                        </span>
                        {selectedCountry.exportGrowth >= 0 ? 
                          <TrendingUp className="w-5 h-5 text-green-600" /> : 
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Year-over-year growth
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Import Growth</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold ${selectedCountry.importGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedCountry.importGrowth >= 0 ? '+' : ''}{formatPercentage(selectedCountry.importGrowth)}
                        </span>
                        {selectedCountry.importGrowth >= 0 ? 
                          <TrendingUp className="w-5 h-5 text-green-600" /> : 
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Year-over-year growth
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'regional' && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Regional Trade Analysis
                  </h3>
                  
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCountry.region} Region Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Trade Volume</p>
                        <p className="text-xl font-bold">{formatNumber(mockTradeData.globalStats.regionalStats[selectedCountry.region]?.tradeVolume || 0, 'B')}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Regional Growth</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatPercentage(mockTradeData.globalStats.regionalStats[selectedCountry.region]?.growth || 0)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Countries in Region</p>
                        <p className="text-xl font-bold">{mockTradeData.globalStats.regionalStats[selectedCountry.region]?.countries || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Regional Trade Partners
                    </h4>
                    {selectedCountry.tradePartners
                      .filter(partner => {
                        const partnerCountry = mockTradeData.countries.find(c => c.name === partner.country);
                        return partnerCountry && partnerCountry.region === selectedCountry.region;
                      })
                      .map((partner, index) => {
                        const partnerCountry = mockTradeData.countries.find(c => c.name === partner.country);
                        return (
                          <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-4 rounded overflow-hidden shadow-sm">
                                {partnerCountry && React.createElement(countryFlags[partnerCountry.code] || 'div', {
                                  className: 'w-full h-full object-cover'
                                })}
                              </div>
                              <div>
                                <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {partner.country}
                                </span>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  Trade Volume: {formatNumber(partner.tradeVolume)} • Share: {partner.share}%
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Balance</p>
                              <p className={`font-semibold text-sm ${getTradeBalanceColor(partner.balance)}`}>
                                {formatNumber(partner.balance)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Trade Data Visualizations
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Export Categories Pie Chart */}
                    <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Export Categories
                        </h4>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                          <PieChart className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={chartData.exportData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              innerRadius={20}
                              fill="#8884d8"
                              dataKey="value"
                              strokeWidth={2}
                              stroke={isDarkMode ? '#374151' : '#ffffff'}
                            >
                              {chartData.exportData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `${value.toFixed(1)}%`, 
                                'Export Share'
                              ]}
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                                borderRadius: '12px',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Export Categories List */}
                      <div className="mt-4 space-y-2">
                        <h5 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Export Breakdown:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {chartData.exportData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {item.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatPercentage(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Import Categories Pie Chart */}
                    <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Import Categories
                        </h4>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                          <Package className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        </div>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={chartData.importData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              innerRadius={20}
                              fill="#8884d8"
                              dataKey="value"
                              strokeWidth={2}
                              stroke={isDarkMode ? '#374151' : '#ffffff'}
                            >
                              {chartData.importData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `${value.toFixed(1)}%`, 
                                'Import Share'
                              ]}
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                                borderRadius: '12px',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Import Categories List */}
                      <div className="mt-4 space-y-2">
                        <h5 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Import Breakdown:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {chartData.importData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {item.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatPercentage(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Trading Partners Pie Chart */}
                    <div className={`p-6 rounded-xl shadow-lg border lg:col-span-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Trading Partners Distribution
                        </h4>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                          <Globe className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        </div>
                      </div>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={chartData.partnerData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                              outerRadius={120}
                              innerRadius={30}
                              fill="#8884d8"
                              dataKey="value"
                              strokeWidth={2}
                              stroke={isDarkMode ? '#374151' : '#ffffff'}
                            >
                              {chartData.partnerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `${value.toFixed(1)}%`, 
                                'Trade Share'
                              ]}
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                                border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                                borderRadius: '12px',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{
                                color: isDarkMode ? '#ffffff' : '#000000',
                                fontSize: '13px',
                                fontWeight: '500',
                                paddingTop: '20px'
                              }}
                              iconType="circle"
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Trading Partners List */}
                      <div className="mt-6 space-y-2">
                        <h5 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Trading Partners Breakdown:
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {chartData.partnerData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {item.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatPercentage(item.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart Summary */}
                  <div className={`p-6 rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Key Insights
                      </h4>
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                        <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                            <ArrowUpRight className={`w-4 h-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                          </div>
                          <p className={`font-semibold text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            Top Export
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCountry.topExports[0]}
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-800' : 'bg-red-100'}`}>
                            <ArrowDownRight className={`w-4 h-4 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
                          </div>
                          <p className={`font-semibold text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                            Top Import
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCountry.topImports[0]}
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-800' : 'bg-green-100'}`}>
                            <Globe className={`w-4 h-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                          </div>
                          <p className={`font-semibold text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Top Partner
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedCountry.tradePartners[0]?.country}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {selectedCountry.tradePartners[0]?.share}% of trade
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tariffs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Tariffs & Trade Wars Analysis
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTariffTab('current')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          tariffTab === 'current'
                            ? isDarkMode
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700'
                            : isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Current Disputes
                      </button>
                      <button
                        onClick={() => setTariffTab('historical')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          tariffTab === 'historical'
                            ? isDarkMode
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700'
                            : isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Historical Wars
                      </button>
                      <button
                        onClick={() => setTariffTab('trends')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          tariffTab === 'trends'
                            ? isDarkMode
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700'
                            : isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Global Trends
                      </button>
                    </div>
                  </div>

                  {/* Current Disputes Tab */}
                  {tariffTab === 'current' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {tariffData.currentDisputes.map((dispute) => (
                          <div key={dispute.id} className={`p-6 rounded-xl shadow-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {dispute.title}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                dispute.status === 'Ongoing'
                                  ? isDarkMode
                                    ? 'bg-red-900/30 text-red-400'
                                    : 'bg-red-100 text-red-700'
                                  : isDarkMode
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {dispute.status}
                              </span>
                            </div>
                            
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {dispute.description}
                            </p>

                            {/* Tariff Details */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <h5 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  US Tariffs
                                </h5>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  {formatPercentage(dispute.tariffs.us.total, 0)}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {dispute.tariffs.us.affected} products
                                </p>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <h5 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {dispute.title.includes('China') ? 'China' : 
                                   dispute.title.includes('India') ? 'India' : 'EU'} Tariffs
                                </h5>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  {formatPercentage(dispute.tariffs.china?.total || dispute.tariffs.eu?.total || dispute.tariffs.india?.total || 0, 0)}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {dispute.tariffs.china?.affected || dispute.tariffs.eu?.affected || dispute.tariffs.india?.affected} products
                                </p>
                              </div>
                            </div>

                            {/* Impact Metrics */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="text-center">
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {formatPercentage(dispute.impact.globalTrade)}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Global Trade
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {formatPercentage(dispute.impact.gdp)}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  GDP Impact
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {dispute.impact.affectedCountries}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Countries
                                </p>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                              <h5 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Key Events:
                              </h5>
                              <div className="space-y-1">
                                {dispute.timeline.slice(0, 3).map((event, index) => (
                                  <div key={index} className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <span className="font-medium">{event.date}:</span> {event.event}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historical Wars Tab */}
                  {tariffTab === 'historical' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tariffData.historicalWars.map((war, index) => (
                          <div key={index} className={`p-6 rounded-xl shadow-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {war.name}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {war.period}
                              </span>
                            </div>
                            
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {war.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <h5 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Average Tariff
                                </h5>
                                <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  {formatPercentage(war.averageTariff, 0)}
                                </p>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <h5 className={`font-semibold text-sm mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Impact
                                </h5>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {war.impact}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Countries Involved:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {war.countries.map((country, idx) => (
                                  <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {country}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Global Trends Tab */}
                  {tariffTab === 'trends' && (
                    <div className="space-y-6">
                      {/* Global Tariff Trends Chart */}
                      <div className={`p-6 rounded-xl shadow-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Global Average Tariff Trends (2015-2024)
                        </h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tariffData.globalTariffTrends}>
                              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                              <XAxis 
                                dataKey="year" 
                                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                fontSize={12}
                              />
                              <YAxis 
                                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                fontSize={12}
                                label={{ value: 'Average Tariff (%)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                                  border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  color: isDarkMode ? '#ffffff' : '#000000'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="average" 
                                stroke="#EF4444" 
                                strokeWidth={3}
                                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Sectoral Impacts */}
                      <div className={`p-6 rounded-xl shadow-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Sectoral Impact of Recent Tariffs
                        </h4>
                        <div className="space-y-4">
                          {tariffData.sectoralImpacts.map((sector, index) => (
                            <div key={index} className={`p-4 rounded-lg ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {sector.sector}
                                </h5>
                                <div className="flex space-x-4 text-sm">
                                  <span className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    +{formatPercentage(sector.tariffIncrease, 0)} tariff
                                  </span>
                                  <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {formatPercentage(sector.tradeVolume)} trade volume
                                  </span>
                                  <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {sector.affectedCountries} countries
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(sector.tariffIncrease * 2, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'country-tariffs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCountry.name} Tariff Information
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      Average Tariff: {formatPercentage(countryTariffs[selectedCountry.code]?.averageTariff || 0)}
                    </div>
                  </div>

                  {/* Tariff Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Average Tariff Rate
                      </h4>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {formatPercentage(countryTariffs[selectedCountry.code]?.averageTariff || 0)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Active Tariffs
                      </h4>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {countryTariffs[selectedCountry.code]?.appliedTariffs?.filter(t => t.status === 'Active').length || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Trade Disputes
                      </h4>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                        {countryTariffs[selectedCountry.code]?.tradeDisputes?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Applied Tariffs Table */}
                  <div className={`p-6 rounded-xl shadow-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Applied Tariffs by Sector
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Sector
                            </th>
                            <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Rate
                            </th>
                            <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Status
                            </th>
                            <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Effective Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {countryTariffs[selectedCountry.code]?.appliedTariffs?.map((tariff, index) => (
                            <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                              <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {tariff.sector}
                              </td>
                              <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  tariff.rate > 0
                                    ? isDarkMode
                                      ? 'bg-red-900/30 text-red-400'
                                      : 'bg-red-100 text-red-700'
                                    : isDarkMode
                                    ? 'bg-green-900/30 text-green-400'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {formatPercentage(tariff.rate, 0)}
                                </span>
                              </td>
                              <td className={`py-3 px-4`}>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  tariff.status === 'Active'
                                    ? isDarkMode
                                      ? 'bg-red-900/30 text-red-400'
                                      : 'bg-red-100 text-red-700'
                                    : tariff.status === 'Suspended'
                                    ? isDarkMode
                                      ? 'bg-yellow-900/30 text-yellow-400'
                                      : 'bg-yellow-100 text-yellow-700'
                                    : isDarkMode
                                    ? 'bg-gray-600 text-gray-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {tariff.status}
                                </span>
                              </td>
                              <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {tariff.effectiveDate}
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={4} className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                No tariff data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Trade Disputes */}
                  {countryTariffs[selectedCountry.code]?.tradeDisputes?.length > 0 && (
                    <div className={`p-6 rounded-xl shadow-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Active Trade Disputes
                      </h4>
                      <div className="space-y-3">
                        {countryTariffs[selectedCountry.code].tradeDisputes.map((dispute, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {dispute}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                              }`}>
                                Ongoing
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Retaliatory Tariffs */}
                  {countryTariffs[selectedCountry.code]?.retaliatoryTariffs > 0 && (
                    <div className={`p-6 rounded-xl shadow-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Retaliatory Tariffs
                      </h4>
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                            Maximum Retaliatory Rate
                          </p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {formatPercentage(countryTariffs[selectedCountry.code].retaliatoryTariffs, 0)}
                          </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                          <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                            Impact Level
                          </p>
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {countryTariffs[selectedCountry.code].retaliatoryTariffs > 20 ? 'High' : 
                             countryTariffs[selectedCountry.code].retaliatoryTariffs > 10 ? 'Medium' : 'Low'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'trade-blocs' && (
                <div className="space-y-6">
                  <h3 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Regional Trade Blocs
                  </h3>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Explore major regional trade agreements and economic partnerships that shape global commerce.
                  </p>

                  {/* Trade Blocs Overview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(tradeBlocs).map(([key, bloc]) => (
                      <div key={key} className={`rounded-xl border p-6 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      } hover:shadow-lg transition-shadow`}>
                        {/* Bloc Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {bloc.acronym}
                            </h4>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Est. {bloc.established}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {bloc.type}
                          </div>
                        </div>

                        {/* Bloc Name */}
                        <p className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {bloc.name}
                        </p>

                        {/* Key Statistics */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Total GDP
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              ${formatLargeNumber(bloc.totalGdp)}T
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Population
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {formatLargeNumber(bloc.totalPopulation / 1000000)}M
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Intra-Bloc Trade
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              ${formatLargeNumber(bloc.intraBlocTrade)}B
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Trade Coverage
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                              {formatPercentage(bloc.tradeCoverage)}%
                            </p>
                          </div>
                        </div>

                        {/* Member Countries */}
                        <div className="mb-4">
                          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Key Members ({bloc.members.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {bloc.members.slice(0, 4).map((member) => (
                              <div key={member.code} className="flex items-center space-x-1">
                                {countryFlags[member.code] ? React.createElement(countryFlags[member.code], { 
                                  className: "w-4 h-3 rounded-sm" 
                                }) : (
                                  <div className="w-4 h-3 rounded-sm bg-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-600">{member.code}</span>
                                  </div>
                                )}
                                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {member.name.length > 8 ? member.code : member.name}
                                </span>
                              </div>
                            ))}
                            {bloc.members.length > 4 && (
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                +{bloc.members.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Major Sectors */}
                        <div className="mb-4">
                          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Major Sectors
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {bloc.majorSectors.slice(0, 3).map((sector, index) => (
                              <span key={index} className={`px-2 py-1 rounded text-xs ${
                                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {sector}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Features */}
                        <div>
                          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Key Features
                          </p>
                          <ul className="space-y-1">
                            {bloc.keyFeatures.slice(0, 2).map((feature, index) => (
                              <li key={index} className={`text-xs flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="mr-1 text-green-500">•</span>
                                {feature}
                              </li>
                            ))}
                            {bloc.keyFeatures.length > 2 && (
                              <li className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                +{bloc.keyFeatures.length - 2} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trade Blocs Comparison Chart */}
                  <div className={`rounded-xl border p-6 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Trade Blocs Comparison
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Trade Bloc
                            </th>
                            <th className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              GDP (Trillion $)
                            </th>
                            <th className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Population (Million)
                            </th>
                            <th className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Intra-Trade (Billion $)
                            </th>
                            <th className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Coverage (%)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(tradeBlocs)
                            .sort(([,a], [,b]) => b.totalGdp - a.totalGdp)
                            .map(([key, bloc]) => (
                            <tr key={key} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {bloc.acronym}
                                  </span>
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    ({bloc.established})
                                  </span>
                                </div>
                              </td>
                              <td className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {formatLargeNumber(bloc.totalGdp)}
                              </td>
                              <td className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {formatLargeNumber(bloc.totalPopulation / 1000000)}
                              </td>
                              <td className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {formatLargeNumber(bloc.intraBlocTrade)}
                              </td>
                              <td className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                {formatPercentage(bloc.tradeCoverage)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Trade Bloc Impact Analysis */}
                  <div className={`rounded-xl border p-6 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Regional Integration Impact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                        <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Trade Creation
                        </h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Regional trade agreements increase trade between member countries by reducing barriers and costs.
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                        <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Economic Efficiency
                        </h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Specialization and economies of scale lead to more efficient resource allocation within blocs.
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                        <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Investment Flows
                        </h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Reduced barriers attract foreign direct investment within integrated regions.
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                        <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Standards Harmonization
                        </h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Common regulations and standards reduce compliance costs and facilitate trade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced-metrics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Advanced Trade Measurements
                      </h3>
                      <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Comprehensive analysis of economic complexity, trade connectivity, performance metrics, sustainability indicators, and resilience measures.
                      </p>
                    </div>
                    <InfoPanel
                      metric={{
                        title: "Advanced Trade Metrics Guide",
                        description: "Comprehensive analysis framework for understanding the multifaceted nature of international trade performance, economic sophistication, and global competitiveness through six key measurement categories.",
                        interpretation: "These metrics provide deep insights into different aspects of trade performance: Economic Complexity measures knowledge intensity, Trade Networks analyze connectivity, Competitiveness evaluates market performance, Sustainability assesses environmental impact, Infrastructure measures trade facilitation, and Resilience evaluates risk management capabilities.",
                        implications: [
                          "Economic Complexity Index (ECI) indicates a country's ability to produce sophisticated goods and potential for economic growth through diversification",
                          "Network Centrality reveals a country's importance in global trade relationships and influence on international commerce",
                          "Export Quality and Innovation metrics show technological capabilities and value-added manufacturing capacity",
                          "Sustainability indicators help assess environmental responsibility and future trade competitiveness",
                          "Infrastructure metrics reveal trade facilitation efficiency and digital readiness for modern commerce",
                          "Resilience measures indicate vulnerability to supply chain disruptions and adaptive capacity during economic shocks"
                        ],
                        dataSource: "Economic Complexity Observatory, World Bank, OECD, UN Comtrade, World Economic Forum",
                        frequency: "Annual updates with quarterly revisions",
                        units: "Various: Index scores (0-1), Rankings (#1-67), Percentages (%), Billions USD",
                        relatedMetrics: ["Economic Complexity Index", "Network Centrality", "Export Quality", "Carbon Intensity", "Logistics Performance", "Supply Chain Risk"]
                      }}
                      isDarkMode={isDarkMode}
                      position="top-right"
                      size="large"
                    />
                  </div>

                  {/* Metric Category Selector */}
                  <div className={`flex flex-wrap gap-2 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {[
                      { key: 'complexity', label: 'Economic Complexity', icon: '🧠' },
                      { key: 'connectivity', label: 'Trade Networks', icon: '🌐' },
                      { key: 'performance', label: 'Competitiveness', icon: '🏆' },
                      { key: 'sustainability', label: 'Sustainability', icon: '🌱' },
                      { key: 'infrastructure', label: 'Infrastructure', icon: '🚢' },
                      { key: 'resilience', label: 'Resilience', icon: '🛡️' }
                    ].map((category) => (
                      <button
                        key={category.key}
                        onClick={() => setActiveMetricCategory(category.key)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                          activeMetricCategory === category.key
                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                            : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Economic Complexity Metrics */}
                  {activeMetricCategory === 'complexity' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Economic Complexity Analysis
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Economic Complexity Metrics",
                              description: "Economic complexity measures the knowledge intensity and sophistication of an economy based on the diversity and uniqueness of its exports. It captures the capability of countries to produce complex products that require sophisticated productive capabilities.",
                              formula: "ECI = (Kc,0 - ⟨K⟩) / std(K), where Kc,0 is the diversity of country c and ⟨K⟩ is the average diversity",
                              interpretation: "Higher ECI scores indicate more complex economies with greater productive capabilities. Positive values suggest above-average complexity, while negative values indicate less complex economies. Rankings from 1-67 show global positioning.",
                              implications: [
                                "Countries with higher ECI tend to have faster economic growth and higher income levels",
                                "Product Complexity indicates the sophistication of export products and technological capabilities",
                                "Opportunity Value shows potential for economic diversification into more complex products",
                                "Complex economies are more resilient to economic shocks and have better development prospects",
                                "ECI predicts future economic growth better than traditional measures like GDP per capita"
                              ],
                              dataSource: "Economic Complexity Observatory (Harvard Growth Lab), MIT Media Lab",
                              frequency: "Annual updates based on UN Comtrade trade data",
                              units: "Index scores (-2.5 to +2.5), Global rankings (1-67), Opportunity values (0-3)",
                              relatedMetrics: ["Product Complexity Index", "Economic Fitness", "Product Diversification", "Export Sophistication"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Country</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>ECI Score</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global Rank</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Complexity</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Opportunity Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(advancedTradeMetrics.economicComplexity)
                                .sort(([,a], [,b]) => a.rank - b.rank)
                                .map(([countryCode, metrics]) => {
                                  const country = combinedTradeData.countries.find(c => c.code === countryCode);
                                  if (!country) return null;
                                  return (
                                    <tr key={countryCode} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-6 h-4 rounded overflow-hidden shadow-sm">
                                            {React.createElement(countryFlags[countryCode] || 'div', {
                                              className: 'w-full h-full object-cover'
                                            })}
                                          </div>
                                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {country.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className={`text-center py-3 px-4 font-bold ${
                                        metrics.eci > 1 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                                        metrics.eci > 0 ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') :
                                        (isDarkMode ? 'text-red-400' : 'text-red-600')
                                      }`}>
                                        {formatDecimal(metrics.eci)}
                                      </td>
                                      <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        #{metrics.rank}
                                      </td>
                                      <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {formatDecimal(metrics.productComplexity)}
                                      </td>
                                      <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                        {formatDecimal(metrics.opportunityValue)}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trade Connectivity Metrics */}
                  {activeMetricCategory === 'connectivity' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Trade Network Analysis
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Trade Network Connectivity",
                              description: "Trade network analysis examines the structure and dynamics of global trade relationships, measuring how countries are connected in the international trade system and their relative importance in facilitating global commerce.",
                              formula: "Centrality = Σ(trade_ij / total_trade) × connectivity_weight, where trade_ij is bilateral trade between countries i and j",
                              interpretation: "Network Centrality (0-1): Higher values indicate greater importance in global trade networks. Trade Clustering (0-1): Higher values show dense regional trade relationships. Average Distance: Lower values indicate more efficient trade connections.",
                              implications: [
                                "High network centrality indicates a country's strategic importance in global trade flows",
                                "Trade clustering reveals the strength of regional economic integration",
                                "Lower average distance suggests more efficient and diverse trade connections",
                                "Central countries have greater influence on global trade patterns and disruptions",
                                "Well-connected countries are more resilient to regional economic shocks"
                              ],
                              dataSource: "UN Comtrade, World Trade Organization (WTO), Network analysis algorithms",
                              frequency: "Annual updates with quarterly trade flow data",
                              units: "Centrality scores (0-1), Clustering coefficients (0-1), Distance measures (1-5)",
                              relatedMetrics: ["Betweenness Centrality", "Eigenvector Centrality", "Trade Intensity Index", "Regional Integration Index"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          {Object.entries(advancedTradeMetrics.tradeConnectivity).map(([countryCode, metrics]) => {
                            const country = combinedTradeData.countries.find(c => c.code === countryCode);
                            if (!country) return null;
                            return (
                              <div key={countryCode} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="w-6 h-4 rounded overflow-hidden shadow-sm">
                                    {React.createElement(countryFlags[countryCode] || 'div', {
                                      className: 'w-full h-full object-cover'
                                    })}
                                  </div>
                                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {country.name}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Partners</span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {metrics.partners}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Centrality</span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                      {formatDecimal(metrics.networkCentrality)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clustering</span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                      {formatDecimal(metrics.tradeClusterCoeff)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Distance</span>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                      {formatDecimal(metrics.avgDistance)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trade Performance Metrics */}
                  {activeMetricCategory === 'performance' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Trade Competitiveness Dashboard
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Trade Performance & Competitiveness",
                              description: "Trade performance metrics evaluate a country's competitive position in international markets, measuring export quality, market share, innovation capacity, and overall competitiveness in global trade.",
                              formula: "Competitiveness Index = (Export_Quality × 0.3) + (Market_Share × 0.25) + (Innovation × 0.25) + (Efficiency × 0.2)",
                              interpretation: "Export Quality (0-1): Higher values indicate more sophisticated, value-added exports. Market Share (%): Country's portion of global trade. Competitiveness (0-1): Overall trade performance. Innovation (0-1): Technology and R&D intensity.",
                              implications: [
                                "High export quality indicates advanced manufacturing capabilities and technological sophistication",
                                "Larger market share demonstrates competitive advantage and global market presence",
                                "Strong innovation metrics correlate with high-value exports and economic resilience",
                                "Competitive countries attract more foreign investment and trade partnerships",
                                "Performance metrics predict long-term economic growth and development potential"
                              ],
                              dataSource: "World Economic Forum, OECD, UN Industrial Development Organization (UNIDO)",
                              frequency: "Annual competitiveness reports with quarterly trade updates",
                              units: "Quality indices (0-1), Market share (%), Competitiveness scores (0-1), Innovation indices (0-1)",
                              relatedMetrics: ["Global Competitiveness Index", "Export Performance Index", "Innovation Index", "Revealed Comparative Advantage"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.entries(advancedTradeMetrics.tradePerformance).map(([countryCode, metrics]) => {
                            const country = combinedTradeData.countries.find(c => c.code === countryCode);
                            if (!country) return null;
                            return (
                              <div key={countryCode} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                                    {React.createElement(countryFlags[countryCode] || 'div', {
                                      className: 'w-full h-full object-cover'
                                    })}
                                  </div>
                                  <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {country.name}
                                  </h5>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Export Quality</p>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 mb-1 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${metrics.exportQuality * 100}%`}}></div>
                                    </div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {formatPercentage(metrics.exportQuality * 100)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Share</p>
                                    <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                      {formatDecimal(metrics.marketShare)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Competitiveness</p>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 mb-1 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${metrics.competitiveness * 100}%`}}></div>
                                    </div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                      {formatPercentage(metrics.competitiveness * 100)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Innovation</p>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 mb-1 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-orange-600 h-2 rounded-full" style={{width: `${metrics.innovation * 100}%`}}></div>
                                    </div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                      {formatPercentage(metrics.innovation * 100)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sustainability Metrics */}
                  {activeMetricCategory === 'sustainability' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Trade Sustainability Index
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Trade Sustainability & Environmental Impact",
                              description: "Trade sustainability metrics assess the environmental impact of international trade activities, measuring carbon intensity, sustainable export practices, green technology adoption, and circular economy integration in trade flows.",
                              formula: "Sustainability Index = (1/Carbon_Intensity × 0.4) + (Sustainable_Exports × 0.3) + (Green_Tech × 0.2) + (Circular_Trade × 0.1)",
                              interpretation: "Carbon Intensity (0-1): Lower values indicate cleaner trade practices. Sustainable Exports (%): Percentage of eco-friendly products. Green Tech (0-1): Clean technology capabilities. Circular Trade (0-1): Circular economy integration.",
                              implications: [
                                "Lower carbon intensity indicates more environmentally responsible trade practices",
                                "Higher sustainable export percentages show commitment to green economy transition",
                                "Strong green technology capabilities position countries for future sustainable trade",
                                "Circular trade practices reduce waste and improve resource efficiency",
                                "Sustainable trade practices increasingly influence international competitiveness and market access"
                              ],
                              dataSource: "OECD Environment Database, UN Environment Programme, Carbon Trust",
                              frequency: "Annual sustainability reports with biannual environmental updates",
                              units: "Carbon intensity (tCO2/USD), Sustainable exports (%), Green tech indices (0-1), Circular trade (0-1)",
                              relatedMetrics: ["Environmental Performance Index", "Green Growth Index", "Carbon Footprint", "Renewable Energy Trade"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Country</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carbon Intensity</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sustainable Exports</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Green Tech</th>
                                <th className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Circular Trade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(advancedTradeMetrics.tradeSustainability).map(([countryCode, metrics]) => {
                                const country = combinedTradeData.countries.find(c => c.code === countryCode);
                                if (!country) return null;
                                return (
                                  <tr key={countryCode} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-4 rounded overflow-hidden shadow-sm">
                                          {React.createElement(countryFlags[countryCode] || 'div', {
                                            className: 'w-full h-full object-cover'
                                          })}
                                        </div>
                                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                          {country.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className={`text-center py-3 px-4 font-bold ${
                                      metrics.carbonIntensity < 0.4 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                                      metrics.carbonIntensity < 0.7 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                                      (isDarkMode ? 'text-red-400' : 'text-red-600')
                                    }`}>
                                      {formatDecimal(metrics.carbonIntensity)}
                                    </td>
                                    <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {formatDecimal(metrics.sustainableExports)}%
                                    </td>
                                    <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                      {formatPercentage(metrics.greenTech * 100)}%
                                    </td>
                                    <td className={`text-center py-3 px-4 font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                      {formatPercentage(metrics.circularTrade * 100)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Infrastructure Metrics */}
                  {activeMetricCategory === 'infrastructure' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Trade Infrastructure & Digital Readiness
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Trade Infrastructure & Digital Capabilities",
                              description: "Trade infrastructure metrics evaluate the physical and digital foundations that enable efficient international trade, including logistics performance, trade costs, financing access, and digital trade readiness.",
                              formula: "Infrastructure Index = (Logistics_Performance/5 × 0.4) + ((5-Trade_Cost)/5 × 0.3) + (Financing_Access × 0.2) + (Digital_Trade × 0.1)",
                              interpretation: "Logistics Performance (1-5): World Bank index, higher is better. Trade Cost Index: Lower values indicate lower costs. Financing Access (0-1): Availability of trade finance. Digital Trade (0-1): E-commerce and digital capabilities.",
                              implications: [
                                "Higher logistics performance enables more efficient and cost-effective trade operations",
                                "Lower trade costs improve competitiveness and market access for exporters",
                                "Better financing access facilitates trade expansion, especially for SMEs",
                                "Strong digital trade capabilities are essential for modern e-commerce and services trade",
                                "Infrastructure quality directly impacts a country's ability to participate in global value chains"
                              ],
                              dataSource: "World Bank Logistics Performance Index, OECD Trade Facilitation Indicators",
                              frequency: "Biannual LPI updates with annual trade facilitation assessments",
                              units: "LPI scores (1-5), Trade cost indices (0-5), Access ratios (0-1), Digital readiness (0-1)",
                              relatedMetrics: ["Logistics Performance Index", "Trade Facilitation Index", "Doing Business Rankings", "Digital Economy Index"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(advancedTradeMetrics.tradeInfrastructure).map(([countryCode, metrics]) => {
                            const country = combinedTradeData.countries.find(c => c.code === countryCode);
                            if (!country) return null;
                            return (
                              <div key={countryCode} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-6 h-4 rounded overflow-hidden shadow-sm">
                                    {React.createElement(countryFlags[countryCode] || 'div', {
                                      className: 'w-full h-full object-cover'
                                    })}
                                  </div>
                                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {country.name}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Logistics Performance</span>
                                      <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {formatDecimal(metrics.logisticsIndex)}/5
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(metrics.logisticsIndex / 5) * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Trade Cost Index</span>
                                      <span className={`text-sm font-medium ${
                                        metrics.tradeCost < 1 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                                        metrics.tradeCost < 2 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                                        (isDarkMode ? 'text-red-400' : 'text-red-600')
                                      }`}>
                                        {formatDecimal(metrics.tradeCost)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Financing Access</span>
                                      <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {formatPercentage(metrics.financingAccess * 100)}%
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${metrics.financingAccess * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Digital Trade</span>
                                      <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                        {formatPercentage(metrics.digitalTrade * 100)}%
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-orange-600 h-2 rounded-full" style={{width: `${metrics.digitalTrade * 100}%`}}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resilience Metrics */}
                  {activeMetricCategory === 'resilience' && (
                    <div className="space-y-6">
                      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Trade Resilience & Risk Assessment
                          </h4>
                          <InfoPanel
                            metric={{
                              title: "Trade Resilience & Risk Management",
                              description: "Trade resilience metrics assess a country's ability to withstand and adapt to trade disruptions, measuring supply chain vulnerabilities, trade concentration risks, overall resilience capacity, and adaptive capabilities.",
                              formula: "Resilience Index = ((1-Supply_Chain_Risk) × 0.3) + ((1-Trade_Concentration) × 0.2) + (Resilience_Score × 0.3) + (Adaptability × 0.2)",
                              interpretation: "Supply Chain Risk (0-1): Lower values indicate lower risk. Trade Concentration (0-1): Lower values show better diversification. Resilience Score (0-1): Higher values indicate better shock absorption. Adaptability (0-1): Higher values show better adjustment capacity.",
                              implications: [
                                "Lower supply chain risk indicates better preparedness for trade disruptions",
                                "Reduced trade concentration provides protection against market-specific shocks",
                                "Higher resilience scores suggest better ability to maintain trade during crises",
                                "Strong adaptability enables quick adjustment to changing trade conditions",
                                "Resilient trade systems support long-term economic stability and growth"
                              ],
                              dataSource: "IMF Trade Resilience Database, World Bank Supply Chain Risk Assessment",
                              frequency: "Annual resilience assessments with quarterly risk updates",
                              units: "Risk indices (0-1), Concentration ratios (0-1), Resilience scores (0-1), Adaptability indices (0-1)",
                              relatedMetrics: ["Supply Chain Resilience Index", "Trade Diversification Index", "Economic Vulnerability Index", "Crisis Response Capacity"]
                            }}
                            isDarkMode={isDarkMode}
                            position="top-right"
                            size="large"
                          />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {Object.entries(advancedTradeMetrics.tradeResilience).map(([countryCode, metrics]) => {
                            const country = combinedTradeData.countries.find(c => c.code === countryCode);
                            if (!country) return null;
                            const overallScore = (metrics.resilience + metrics.adaptability) / 2;
                            return (
                              <div key={countryCode} className={`p-4 rounded-lg border-2 ${
                                overallScore > 0.8 ? (isDarkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50') :
                                overallScore > 0.6 ? (isDarkMode ? 'border-yellow-500 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50') :
                                (isDarkMode ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50')
                              }`}>
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-8 h-6 rounded overflow-hidden shadow-sm">
                                    {React.createElement(countryFlags[countryCode] || 'div', {
                                      className: 'w-full h-full object-cover'
                                    })}
                                  </div>
                                  <div>
                                    <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {country.name}
                                    </h5>
                                    <p className={`text-xs ${
                                      overallScore > 0.8 ? 'text-green-600' :
                                      overallScore > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {overallScore > 0.8 ? 'High Resilience' :
                                       overallScore > 0.6 ? 'Medium Resilience' : 'Low Resilience'}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Supply Chain Risk</span>
                                      <span className={`font-medium ${
                                        metrics.supplyChainRisk < 0.4 ? 'text-green-600' :
                                        metrics.supplyChainRisk < 0.7 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                        {metrics.supplyChainRisk < 0.4 ? 'Low' :
                                         metrics.supplyChainRisk < 0.7 ? 'Medium' : 'High'}
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className={`h-2 rounded-full ${
                                        metrics.supplyChainRisk < 0.4 ? 'bg-green-600' :
                                        metrics.supplyChainRisk < 0.7 ? 'bg-yellow-600' : 'bg-red-600'
                                      }`} style={{width: `${metrics.supplyChainRisk * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Trade Concentration</span>
                                      <span className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {formatPercentage(metrics.tradeConcentration * 100)}%
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${metrics.tradeConcentration * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Resilience Score</span>
                                      <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        {formatPercentage(metrics.resilience * 100)}%
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${metrics.resilience * 100}%`}}></div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Adaptability</span>
                                      <span className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {formatPercentage(metrics.adaptability * 100)}%
                                      </span>
                                    </div>
                                    <div className={`w-full bg-gray-300 rounded-full h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
                                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${metrics.adaptability * 100}%`}}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data-sources' && (
                <div className="space-y-6">
                  <DataSourceBreakdown
                    enableRealData={enableRealData}
                    isRealData={isRealData}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Only show ads when content is ready */}
        <AdSense show={mounted && !loading} />
      </div>
    </div>
  );
};

export default TradingPlacesPage;
