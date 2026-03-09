'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Globe, DollarSign, Package,
  ArrowUpRight, ArrowDownRight, BarChart3, Search, ChevronUp,
  X, Clock, Shield, Map, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Line as MapLine } from 'react-simple-maps';
import { BILATERAL_TRADE, getTradePartnersFor } from '../data/bilateralTradeData';
import {
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTradeData, useHistoricalTradeData } from '../hooks/useTradeData';
import { COUNTRY_MAPPINGS } from '../services/tradeData';
import {
  US, CN, DE, JP, GB, IN, BR, KR, CA, AU, MX, RU, SA,
  FR, IT, ES, ID, TR, TH, SG, MY, AR, UY, PY
} from 'country-flag-icons/react/3x2';

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  US, CN, DE, JP, GB, IN, BR, KR, CA, AU, MX, RU, SA, FR, IT, ES, ID, TR, TH, SG, MY, AR, UY, PY
};

const REVERSE_COUNTRY_MAPPINGS: { [key: string]: string } = {
  USA: 'US', CHN: 'CN', DEU: 'DE', JPN: 'JP', GBR: 'GB', IND: 'IN', BRA: 'BR',
  KOR: 'KR', CAN: 'CA', AUS: 'AU', MEX: 'MX', RUS: 'RU', SAU: 'SA', FRA: 'FR',
  ITA: 'IT', ESP: 'ES', IDN: 'ID', TUR: 'TR'
};

const TRADE_COUNTRIES = ['US', 'CN', 'DE', 'JP', 'GB', 'IN', 'BR', 'KR', 'CA', 'AU', 'MX', 'RU', 'SA', 'FR', 'IT', 'ES', 'ID', 'TR'] as const;

const mockTradeData = {
  countries: [
    { name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America', tradeBalance: -89.2, totalExports: 1691.2, totalImports: 1780.4, gdp: 25439.7, population: 331.9, tradeIntensity: 13.6, diversificationIndex: 0.78, tradeOpenness: 13.6, exportGrowth: 2.3, importGrowth: 3.1, topExports: ['Machinery', 'Electronics', 'Aircraft', 'Medical Equipment', 'Chemicals'], topImports: ['Electronics', 'Machinery', 'Vehicles', 'Textiles', 'Oil'], tradePartners: [{ country: 'China', tradeVolume: 559.2, balance: -345.2, share: 16.5 }, { country: 'Canada', tradeVolume: 614.9, balance: 12.3, share: 18.1 }, { country: 'Mexico', tradeVolume: 614.5, balance: -130.1, share: 18.0 }, { country: 'Japan', tradeVolume: 218.2, balance: -68.8, share: 6.4 }, { country: 'Germany', tradeVolume: 171.2, balance: -67.1, share: 5.0 }] },
    { name: 'China', code: 'CN', flag: '🇨🇳', region: 'Asia', tradeBalance: 535.4, totalExports: 3360.0, totalImports: 2824.6, gdp: 17963.2, population: 1439.3, tradeIntensity: 34.4, diversificationIndex: 0.65, tradeOpenness: 34.4, exportGrowth: 8.7, importGrowth: 6.2, topExports: ['Electronics', 'Machinery', 'Textiles', 'Furniture', 'Toys'], topImports: ['Oil', 'Machinery', 'Electronics', 'Chemicals', 'Metals'], tradePartners: [{ country: 'United States', tradeVolume: 559.2, balance: 345.2, share: 9.0 }, { country: 'Japan', tradeVolume: 317.4, balance: 45.6, share: 5.1 }, { country: 'South Korea', tradeVolume: 240.4, balance: 78.9, share: 3.9 }, { country: 'Germany', tradeVolume: 198.7, balance: 23.4, share: 3.2 }, { country: 'India', tradeVolume: 125.6, balance: 67.8, share: 2.0 }] },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', tradeBalance: 310.8, totalExports: 1560.0, totalImports: 1249.2, gdp: 4082.5, population: 83.2, tradeIntensity: 68.8, diversificationIndex: 0.82, tradeOpenness: 68.8, exportGrowth: 4.2, importGrowth: 3.8, topExports: ['Machinery', 'Vehicles', 'Chemicals', 'Electronics', 'Pharmaceuticals'], topImports: ['Oil', 'Machinery', 'Electronics', 'Chemicals', 'Textiles'], tradePartners: [{ country: 'United States', tradeVolume: 171.2, balance: 67.1, share: 6.1 }, { country: 'China', tradeVolume: 198.7, balance: -23.4, share: 7.1 }, { country: 'France', tradeVolume: 156.8, balance: 45.2, share: 5.6 }, { country: 'Netherlands', tradeVolume: 189.3, balance: 12.7, share: 6.7 }, { country: 'Italy', tradeVolume: 134.5, balance: 23.8, share: 4.8 }] },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', tradeBalance: 45.2, totalExports: 738.0, totalImports: 692.8, gdp: 4231.1, population: 125.8, tradeIntensity: 33.8, diversificationIndex: 0.71, tradeOpenness: 33.8, exportGrowth: 1.8, importGrowth: 2.4, topExports: ['Vehicles', 'Electronics', 'Machinery', 'Chemicals', 'Steel'], topImports: ['Oil', 'Electronics', 'Machinery', 'Chemicals', 'Food'], tradePartners: [{ country: 'China', tradeVolume: 317.4, balance: -45.6, share: 22.2 }, { country: 'United States', tradeVolume: 218.2, balance: 68.8, share: 15.3 }, { country: 'South Korea', tradeVolume: 89.3, balance: 12.4, share: 6.3 }, { country: 'Germany', tradeVolume: 67.8, balance: 8.9, share: 4.7 }, { country: 'Australia', tradeVolume: 45.6, balance: -12.3, share: 3.2 }] },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe', tradeBalance: -45.7, totalExports: 423.8, totalImports: 469.5, gdp: 3070.7, population: 67.3, tradeIntensity: 29.1, diversificationIndex: 0.69, tradeOpenness: 29.1, exportGrowth: -1.2, importGrowth: 0.8, topExports: ['Services', 'Machinery', 'Chemicals', 'Vehicles', 'Pharmaceuticals'], topImports: ['Oil', 'Machinery', 'Electronics', 'Vehicles', 'Chemicals'], tradePartners: [{ country: 'United States', tradeVolume: 89.4, balance: 12.3, share: 10.0 }, { country: 'Germany', tradeVolume: 78.9, balance: -23.4, share: 8.8 }, { country: 'China', tradeVolume: 67.8, balance: -45.6, share: 7.6 }, { country: 'Netherlands', tradeVolume: 56.7, balance: 8.9, share: 6.3 }, { country: 'France', tradeVolume: 45.6, balance: -12.3, share: 5.1 }] },
    { name: 'India', code: 'IN', flag: '🇮🇳', region: 'Asia', tradeBalance: -78.3, totalExports: 324.2, totalImports: 402.5, gdp: 3386.4, population: 1380.0, tradeIntensity: 21.4, diversificationIndex: 0.58, tradeOpenness: 21.4, exportGrowth: 12.4, importGrowth: 15.7, topExports: ['Textiles', 'Pharmaceuticals', 'IT Services', 'Jewelry', 'Chemicals'], topImports: ['Oil', 'Electronics', 'Machinery', 'Gold', 'Coal'], tradePartners: [{ country: 'United States', tradeVolume: 78.9, balance: 23.4, share: 10.9 }, { country: 'China', tradeVolume: 125.6, balance: -67.8, share: 17.3 }, { country: 'UAE', tradeVolume: 45.2, balance: -12.3, share: 6.2 }, { country: 'Germany', tradeVolume: 23.8, balance: 5.6, share: 3.3 }, { country: 'Singapore', tradeVolume: 18.7, balance: 2.1, share: 2.6 }] },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', region: 'South America', tradeBalance: 67.8, totalExports: 280.4, totalImports: 212.6, gdp: 1608.9, population: 215.3, tradeIntensity: 30.6, diversificationIndex: 0.52, tradeOpenness: 30.6, exportGrowth: 8.9, importGrowth: 5.2, topExports: ['Soybeans', 'Iron Ore', 'Oil', 'Meat', 'Sugar'], topImports: ['Machinery', 'Electronics', 'Chemicals', 'Vehicles', 'Oil'], tradePartners: [{ country: 'China', tradeVolume: 89.4, balance: 34.5, share: 18.1 }, { country: 'United States', tradeVolume: 45.6, balance: 12.3, share: 9.2 }, { country: 'Argentina', tradeVolume: 23.8, balance: 8.9, share: 4.8 }, { country: 'Germany', tradeVolume: 18.7, balance: 5.6, share: 3.8 }, { country: 'Netherlands', tradeVolume: 15.2, balance: 3.4, share: 3.1 }] },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', region: 'Asia', tradeBalance: 89.4, totalExports: 512.8, totalImports: 423.4, gdp: 1810.9, population: 51.7, tradeIntensity: 51.7, diversificationIndex: 0.76, tradeOpenness: 51.7, exportGrowth: 6.8, importGrowth: 4.9, topExports: ['Electronics', 'Vehicles', 'Machinery', 'Chemicals', 'Steel'], topImports: ['Oil', 'Electronics', 'Machinery', 'Chemicals', 'Coal'], tradePartners: [{ country: 'China', tradeVolume: 240.4, balance: 78.9, share: 25.6 }, { country: 'United States', tradeVolume: 89.3, balance: 12.4, share: 9.5 }, { country: 'Japan', tradeVolume: 67.8, balance: 8.9, share: 7.2 }, { country: 'Vietnam', tradeVolume: 45.6, balance: 23.4, share: 4.9 }, { country: 'Germany', tradeVolume: 34.5, balance: 5.6, share: 3.7 }] },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'North America', tradeBalance: 23.4, totalExports: 456.7, totalImports: 433.3, gdp: 1990.8, population: 38.0, tradeIntensity: 44.8, diversificationIndex: 0.61, tradeOpenness: 44.8, exportGrowth: 3.2, importGrowth: 4.1, topExports: ['Oil', 'Lumber', 'Minerals', 'Machinery', 'Aircraft'], topImports: ['Vehicles', 'Machinery', 'Electronics', 'Chemicals', 'Oil'], tradePartners: [{ country: 'United States', tradeVolume: 614.9, balance: 12.3, share: 69.1 }, { country: 'China', tradeVolume: 45.6, balance: -23.4, share: 5.1 }, { country: 'Mexico', tradeVolume: 23.8, balance: 5.6, share: 2.7 }, { country: 'Germany', tradeVolume: 18.7, balance: 3.4, share: 2.1 }, { country: 'Japan', tradeVolume: 15.2, balance: 2.1, share: 1.7 }] },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', tradeBalance: 45.6, totalExports: 312.4, totalImports: 266.8, gdp: 1542.7, population: 25.7, tradeIntensity: 37.5, diversificationIndex: 0.48, tradeOpenness: 37.5, exportGrowth: 7.8, importGrowth: 5.4, topExports: ['Iron Ore', 'Coal', 'Gold', 'Natural Gas', 'Wheat'], topImports: ['Machinery', 'Vehicles', 'Electronics', 'Oil', 'Chemicals'], tradePartners: [{ country: 'China', tradeVolume: 123.4, balance: 67.8, share: 21.3 }, { country: 'Japan', tradeVolume: 45.6, balance: 12.3, share: 7.9 }, { country: 'United States', tradeVolume: 34.5, balance: 5.6, share: 6.0 }, { country: 'South Korea', tradeVolume: 23.8, balance: 8.9, share: 4.1 }, { country: 'India', tradeVolume: 18.7, balance: 3.4, share: 3.2 }] },
    { name: 'Mexico', code: 'MX', flag: '🇲🇽', region: 'North America', tradeBalance: -12.3, totalExports: 417.8, totalImports: 430.1, gdp: 1289.3, population: 130.3, tradeIntensity: 55.7, diversificationIndex: 0.63, tradeOpenness: 55.7, exportGrowth: 9.2, importGrowth: 11.5, topExports: ['Vehicles', 'Electronics', 'Machinery', 'Oil', 'Agricultural Products'], topImports: ['Electronics', 'Machinery', 'Vehicles', 'Oil', 'Chemicals'], tradePartners: [{ country: 'United States', tradeVolume: 614.5, balance: -130.1, share: 72.4 }, { country: 'China', tradeVolume: 45.6, balance: -23.4, share: 5.4 }, { country: 'Canada', tradeVolume: 23.8, balance: 5.6, share: 2.8 }, { country: 'Germany', tradeVolume: 18.7, balance: 3.4, share: 2.2 }, { country: 'Japan', tradeVolume: 15.2, balance: 2.1, share: 1.8 }] },
    { name: 'Russia', code: 'RU', flag: '🇷🇺', region: 'Europe/Asia', tradeBalance: 156.7, totalExports: 345.6, totalImports: 188.9, gdp: 1835.9, population: 146.2, tradeIntensity: 29.1, diversificationIndex: 0.41, tradeOpenness: 29.1, exportGrowth: -5.2, importGrowth: -8.7, topExports: ['Oil', 'Natural Gas', 'Metals', 'Wheat', 'Chemicals'], topImports: ['Machinery', 'Electronics', 'Vehicles', 'Pharmaceuticals', 'Food'], tradePartners: [{ country: 'China', tradeVolume: 89.4, balance: 45.6, share: 16.7 }, { country: 'Germany', tradeVolume: 45.6, balance: 12.3, share: 8.5 }, { country: 'Netherlands', tradeVolume: 34.5, balance: 8.9, share: 6.4 }, { country: 'Turkey', tradeVolume: 23.8, balance: 5.6, share: 4.4 }, { country: 'Belarus', tradeVolume: 18.7, balance: 3.4, share: 3.5 }] },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East', tradeBalance: 234.5, totalExports: 298.7, totalImports: 64.2, gdp: 793.5, population: 35.0, tradeIntensity: 45.8, diversificationIndex: 0.23, tradeOpenness: 45.8, exportGrowth: 12.3, importGrowth: 8.9, topExports: ['Oil', 'Petrochemicals', 'Minerals', 'Plastics', 'Fertilizers'], topImports: ['Machinery', 'Vehicles', 'Electronics', 'Food', 'Pharmaceuticals'], tradePartners: [{ country: 'China', tradeVolume: 67.8, balance: 23.4, share: 18.2 }, { country: 'India', tradeVolume: 45.6, balance: 12.3, share: 12.3 }, { country: 'Japan', tradeVolume: 34.5, balance: 8.9, share: 9.3 }, { country: 'United States', tradeVolume: 23.8, balance: 5.6, share: 6.4 }, { country: 'South Korea', tradeVolume: 18.7, balance: 3.4, share: 5.0 }] },
    { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', tradeBalance: 67.2, totalExports: 578.4, totalImports: 511.2, gdp: 2630.0, population: 67.0, tradeIntensity: 41.4, diversificationIndex: 0.80, tradeOpenness: 41.4, exportGrowth: 3.8, importGrowth: 3.2, topExports: ['Aircraft', 'Machinery', 'Pharmaceuticals', 'Vehicles', 'Wine'], topImports: ['Machinery', 'Vehicles', 'Oil', 'Electronics', 'Chemicals'], tradePartners: [{ country: 'Germany', tradeVolume: 156.8, balance: -45.2, share: 14.4 }, { country: 'United States', tradeVolume: 89.3, balance: 23.4, share: 8.2 }, { country: 'Italy', tradeVolume: 78.9, balance: 12.3, share: 7.3 }, { country: 'Spain', tradeVolume: 67.8, balance: 8.9, share: 6.2 }, { country: 'Belgium', tradeVolume: 56.7, balance: 5.6, share: 5.2 }] },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe', tradeBalance: 45.3, totalExports: 542.8, totalImports: 497.5, gdp: 2000.0, population: 59.0, tradeIntensity: 52.0, diversificationIndex: 0.77, tradeOpenness: 52.0, exportGrowth: 4.1, importGrowth: 3.7, topExports: ['Machinery', 'Vehicles', 'Pharmaceuticals', 'Fashion', 'Furniture'], topImports: ['Oil', 'Machinery', 'Vehicles', 'Chemicals', 'Electronics'], tradePartners: [{ country: 'Germany', tradeVolume: 134.5, balance: -23.8, share: 13.0 }, { country: 'France', tradeVolume: 78.9, balance: -12.3, share: 7.6 }, { country: 'United States', tradeVolume: 67.8, balance: 18.7, share: 6.5 }, { country: 'Spain', tradeVolume: 56.7, balance: 9.8, share: 5.5 }, { country: 'Switzerland', tradeVolume: 45.6, balance: 7.8, share: 4.4 }] },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe', tradeBalance: 12.4, totalExports: 387.6, totalImports: 375.2, gdp: 1400.0, population: 47.0, tradeIntensity: 54.5, diversificationIndex: 0.73, tradeOpenness: 54.5, exportGrowth: 5.2, importGrowth: 4.8, topExports: ['Vehicles', 'Machinery', 'Pharmaceuticals', 'Food', 'Chemicals'], topImports: ['Oil', 'Machinery', 'Vehicles', 'Electronics', 'Chemicals'], tradePartners: [{ country: 'France', tradeVolume: 67.8, balance: -8.9, share: 8.9 }, { country: 'Germany', tradeVolume: 56.7, balance: -12.3, share: 7.4 }, { country: 'Italy', tradeVolume: 45.6, balance: -9.8, share: 6.0 }, { country: 'Portugal', tradeVolume: 34.5, balance: 5.6, share: 4.5 }, { country: 'United States', tradeVolume: 23.8, balance: 3.4, share: 3.1 }] },
    { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia', tradeBalance: 34.7, totalExports: 256.4, totalImports: 221.7, gdp: 1120.0, population: 274.0, tradeIntensity: 42.7, diversificationIndex: 0.54, tradeOpenness: 42.7, exportGrowth: 9.8, importGrowth: 7.4, topExports: ['Palm Oil', 'Coal', 'Natural Gas', 'Textiles', 'Electronics'], topImports: ['Machinery', 'Oil', 'Chemicals', 'Electronics', 'Steel'], tradePartners: [{ country: 'China', tradeVolume: 89.4, balance: -23.4, share: 18.7 }, { country: 'Singapore', tradeVolume: 45.6, balance: 12.3, share: 9.5 }, { country: 'Japan', tradeVolume: 34.5, balance: -8.9, share: 7.2 }, { country: 'United States', tradeVolume: 23.8, balance: 9.8, share: 5.0 }, { country: 'India', tradeVolume: 18.7, balance: 5.6, share: 3.9 }] },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Europe', tradeBalance: -34.8, totalExports: 234.5, totalImports: 269.3, gdp: 819.0, population: 85.0, tradeIntensity: 61.5, diversificationIndex: 0.69, tradeOpenness: 61.5, exportGrowth: 8.2, importGrowth: 9.7, topExports: ['Vehicles', 'Machinery', 'Textiles', 'Steel', 'Food'], topImports: ['Oil', 'Machinery', 'Chemicals', 'Electronics', 'Metals'], tradePartners: [{ country: 'Germany', tradeVolume: 45.6, balance: -8.9, share: 9.1 }, { country: 'China', tradeVolume: 34.5, balance: -12.3, share: 6.9 }, { country: 'Russia', tradeVolume: 28.7, balance: -15.6, share: 5.7 }, { country: 'United States', tradeVolume: 23.8, balance: 5.6, share: 4.7 }, { country: 'Italy', tradeVolume: 18.9, balance: 3.4, share: 3.8 }] },
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
      averageTradeIntensity: 35.2, averageDiversificationIndex: 0.58,
      globalTradeGrowth: 4.8, servicesTradeShare: 23.4,
      manufacturingTradeShare: 67.8, agriculturalTradeShare: 8.8
    }
  }
};

const countryTariffs: Record<string, { averageTariff: number; appliedTariffs: { sector: string; rate: number; status: string; effectiveDate: string }[]; tradeDisputes: string[]; retaliatoryTariffs: number }> = {
  US: { averageTariff: 2.0, appliedTariffs: [{ sector: "Steel", rate: 25, status: "Active", effectiveDate: "2018-03-01" }, { sector: "Aluminum", rate: 10, status: "Active", effectiveDate: "2018-03-01" }, { sector: "Chinese Electronics", rate: 25, status: "Active", effectiveDate: "2018-07-06" }, { sector: "Chinese Machinery", rate: 25, status: "Active", effectiveDate: "2018-07-06" }, { sector: "Chinese Textiles", rate: 25, status: "Active", effectiveDate: "2018-07-06" }, { sector: "EU Steel", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }, { sector: "EU Aluminum", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }], tradeDisputes: ["US-China Trade War", "EU-US Steel Dispute"], retaliatoryTariffs: 25 },
  CN: { averageTariff: 7.5, appliedTariffs: [{ sector: "US Agriculture", rate: 25, status: "Active", effectiveDate: "2018-08-23" }, { sector: "US Aerospace", rate: 25, status: "Active", effectiveDate: "2018-08-23" }, { sector: "US Chemicals", rate: 25, status: "Active", effectiveDate: "2018-08-23" }, { sector: "US Automobiles", rate: 15, status: "Active", effectiveDate: "2018-08-23" }, { sector: "US Energy", rate: 10, status: "Active", effectiveDate: "2018-08-23" }], tradeDisputes: ["US-China Trade War"], retaliatoryTariffs: 25 },
  DE: { averageTariff: 1.8, appliedTariffs: [{ sector: "US Motorcycles", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" }, { sector: "US Whiskey", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" }, { sector: "US Denim", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" }, { sector: "US Orange Juice", rate: 25, status: "Suspended", effectiveDate: "2018-06-22" }], tradeDisputes: ["EU-US Steel Dispute"], retaliatoryTariffs: 0 },
  JP: { averageTariff: 2.4, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  GB: { averageTariff: 2.1, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }, { sector: "US Aluminum", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }, { sector: "US Whiskey", rate: 0, status: "Suspended", effectiveDate: "2022-01-01" }], tradeDisputes: ["EU-US Steel Dispute"], retaliatoryTariffs: 0 },
  IN: { averageTariff: 13.4, appliedTariffs: [{ sector: "US Apples", rate: 20, status: "Active", effectiveDate: "2019-06-16" }, { sector: "US Almonds", rate: 20, status: "Active", effectiveDate: "2019-06-16" }, { sector: "US Walnuts", rate: 20, status: "Active", effectiveDate: "2019-06-16" }, { sector: "US Steel", rate: 10, status: "Active", effectiveDate: "2019-06-16" }, { sector: "US Aluminum", rate: 10, status: "Active", effectiveDate: "2019-06-16" }], tradeDisputes: ["India-US Trade Tensions"], retaliatoryTariffs: 20 },
  BR: { averageTariff: 11.5, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  KR: { averageTariff: 4.2, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  CA: { averageTariff: 1.5, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  AU: { averageTariff: 2.8, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  MX: { averageTariff: 4.9, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  RU: { averageTariff: 6.0, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
  SA: { averageTariff: 5.2, appliedTariffs: [{ sector: "US Steel", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Aluminum", rate: 0, status: "Active", effectiveDate: "2018-03-01" }, { sector: "US Agricultural Products", rate: 0, status: "Active", effectiveDate: "2018-03-01" }], tradeDisputes: [], retaliatoryTariffs: 0 },
};

const tariffData = {
  currentDisputes: [
    { id: 1, title: "US-China Trade War", status: "Ongoing", startDate: "2018-03-01", description: "Bilateral trade tensions between the world's two largest economies", tariffs: { us: { total: 25, affected: 250, sectors: ["Electronics", "Machinery", "Textiles"] }, china: { total: 25, affected: 110, sectors: ["Agriculture", "Aerospace", "Chemicals"] } }, impact: { globalTrade: -0.5, gdp: -0.3, affectedCountries: 40 }, timeline: [{ date: "2018-03-01", event: "US imposes 25% tariffs on steel and aluminum" }, { date: "2018-07-06", event: "US imposes 25% tariffs on $34B Chinese goods" }, { date: "2018-08-23", event: "China retaliates with 25% tariffs on $16B US goods" }, { date: "2019-05-10", event: "US increases tariffs to 25% on $200B Chinese goods" }, { date: "2020-01-15", event: "Phase 1 trade deal signed" }, { date: "2024-01-01", event: "Some tariffs remain in place" }] },
    { id: 2, title: "EU-US Steel Dispute", status: "Resolved", startDate: "2018-06-01", description: "Dispute over steel and aluminum tariffs affecting transatlantic trade", tariffs: { us: { total: 25, affected: 50, sectors: ["Steel", "Aluminum"] }, eu: { total: 25, affected: 30, sectors: ["Motorcycles", "Whiskey", "Denim"] } }, impact: { globalTrade: -0.1, gdp: -0.05, affectedCountries: 28 }, timeline: [{ date: "2018-06-01", event: "US imposes steel/aluminum tariffs on EU" }, { date: "2018-06-22", event: "EU retaliates with counter-tariffs" }, { date: "2021-10-30", event: "Agreement reached to suspend tariffs" }, { date: "2022-01-01", event: "Tariffs officially suspended" }] },
    { id: 3, title: "India-US Trade Tensions", status: "Ongoing", startDate: "2019-06-05", description: "Disputes over digital services tax and market access", tariffs: { us: { total: 10, affected: 20, sectors: ["Steel", "Aluminum"] }, india: { total: 20, affected: 15, sectors: ["Apples", "Almonds", "Walnuts"] } }, impact: { globalTrade: -0.05, gdp: -0.02, affectedCountries: 2 }, timeline: [{ date: "2019-06-05", event: "US removes India from GSP program" }, { date: "2019-06-16", event: "India imposes retaliatory tariffs" }, { date: "2020-02-14", event: "Limited trade deal signed" }, { date: "2024-01-01", event: "Negotiations ongoing" }] },
  ],
  historicalWars: [
    { name: "Smoot-Hawley Tariff Act (1930)", period: "1930-1934", description: "Raised US tariffs on over 20,000 imported goods, contributing to the Great Depression", averageTariff: 20, impact: "Global trade fell by 66%", countries: ["USA", "Canada", "UK", "France", "Germany"] },
    { name: "Chicken War (1962-1964)", period: "1962-1964", description: "Trade dispute between US and European Economic Community over poultry exports", averageTariff: 25, impact: "US poultry exports to Europe fell by 25%", countries: ["USA", "France", "Germany", "Netherlands"] },
    { name: "US-Japan Trade War (1980s)", period: "1980-1995", description: "Series of trade disputes over automobiles, semiconductors, and steel", averageTariff: 100, impact: "Voluntary export restraints implemented", countries: ["USA", "Japan"] },
    { name: "Banana Wars (1993-2012)", period: "1993-2012", description: "Dispute between US and EU over banana import policies", averageTariff: 20, impact: "WTO ruled against EU banana regime", countries: ["USA", "EU", "Ecuador", "Costa Rica"] },
  ],
  globalTariffTrends: [
    { year: 2015, average: 2.5 }, { year: 2016, average: 2.6 }, { year: 2017, average: 2.7 },
    { year: 2018, average: 3.2 }, { year: 2019, average: 3.8 }, { year: 2020, average: 4.1 },
    { year: 2021, average: 4.3 }, { year: 2022, average: 4.5 }, { year: 2023, average: 4.7 }, { year: 2024, average: 4.9 },
  ],
  sectoralImpacts: [
    { sector: "Steel", tariffIncrease: 25, tradeVolume: -15, affectedCountries: 45 },
    { sector: "Aluminum", tariffIncrease: 10, tradeVolume: -8, affectedCountries: 30 },
    { sector: "Automobiles", tariffIncrease: 2.5, tradeVolume: -5, affectedCountries: 25 },
    { sector: "Electronics", tariffIncrease: 15, tradeVolume: -12, affectedCountries: 40 },
    { sector: "Agriculture", tariffIncrease: 20, tradeVolume: -18, affectedCountries: 35 },
    { sector: "Textiles", tariffIncrease: 10, tradeVolume: -6, affectedCountries: 20 },
  ]
};

const tradeBlocs: Record<string, { name: string; acronym: string; established: string; type: string; members: { code: string; name: string; population: number; gdp: number }[]; totalGdp: number; totalPopulation: number; intraBlocTrade: number; tradeCoverage: number; keyFeatures: string[]; majorSectors: string[] }> = {
  'USMCA': { name: 'United States-Mexico-Canada Agreement', acronym: 'USMCA', established: '2020', type: 'Free Trade Agreement', members: [{ code: 'US', name: 'United States', population: 332000000, gdp: 21400000 }, { code: 'CA', name: 'Canada', population: 38000000, gdp: 1740000 }, { code: 'MX', name: 'Mexico', population: 129000000, gdp: 1300000 }], totalGdp: 24440000, totalPopulation: 499000000, intraBlocTrade: 1200000, tradeCoverage: 95.0, keyFeatures: ['Elimination of tariffs on 99% of goods', 'Digital trade provisions', 'Labor and environmental standards', 'Intellectual property protections'], majorSectors: ['Automotive', 'Agriculture', 'Energy', 'Manufacturing'] },
  'EU': { name: 'European Union', acronym: 'EU', established: '1993', type: 'Customs Union & Single Market', members: [{ code: 'DE', name: 'Germany', population: 83000000, gdp: 3850000 }, { code: 'FR', name: 'France', population: 67000000, gdp: 2630000 }, { code: 'IT', name: 'Italy', population: 59000000, gdp: 2000000 }, { code: 'ES', name: 'Spain', population: 47000000, gdp: 1400000 }], totalGdp: 15600000, totalPopulation: 447000000, intraBlocTrade: 3800000, tradeCoverage: 99.0, keyFeatures: ['Common external tariff', 'Free movement of goods, services, capital, people', 'Common currency (Euro)', 'Harmonized regulations'], majorSectors: ['Manufacturing', 'Services', 'Agriculture', 'Technology'] },
  'ASEAN': { name: 'Association of Southeast Asian Nations', acronym: 'ASEAN', established: '1967', type: 'Free Trade Area', members: [{ code: 'ID', name: 'Indonesia', population: 274000000, gdp: 1120000 }, { code: 'TH', name: 'Thailand', population: 70000000, gdp: 500000 }, { code: 'SG', name: 'Singapore', population: 6000000, gdp: 340000 }, { code: 'MY', name: 'Malaysia', population: 32000000, gdp: 340000 }], totalGdp: 3200000, totalPopulation: 661000000, intraBlocTrade: 600000, tradeCoverage: 92.0, keyFeatures: ['ASEAN Free Trade Area (AFTA)', 'Common Effective Preferential Tariff', 'Services liberalization', 'Investment facilitation'], majorSectors: ['Electronics', 'Palm Oil', 'Textiles', 'Tourism'] },
  'MERCOSUR': { name: 'Southern Common Market', acronym: 'MERCOSUR', established: '1991', type: 'Customs Union', members: [{ code: 'BR', name: 'Brazil', population: 213000000, gdp: 1610000 }, { code: 'AR', name: 'Argentina', population: 45000000, gdp: 450000 }, { code: 'UY', name: 'Uruguay', population: 4000000, gdp: 53000 }, { code: 'PY', name: 'Paraguay', population: 7000000, gdp: 38000 }], totalGdp: 2150000, totalPopulation: 269000000, intraBlocTrade: 280000, tradeCoverage: 87.0, keyFeatures: ['Common external tariff', 'Free movement of goods and services', 'Macroeconomic coordination', 'Sectoral agreements'], majorSectors: ['Agriculture', 'Mining', 'Manufacturing', 'Energy'] },
  'CPTPP': { name: 'Comprehensive and Progressive Trans-Pacific Partnership', acronym: 'CPTPP', established: '2018', type: 'Free Trade Agreement', members: [{ code: 'JP', name: 'Japan', population: 126000000, gdp: 4940000 }, { code: 'CA', name: 'Canada', population: 38000000, gdp: 1740000 }, { code: 'AU', name: 'Australia', population: 26000000, gdp: 1330000 }, { code: 'MX', name: 'Mexico', population: 129000000, gdp: 1300000 }], totalGdp: 13400000, totalPopulation: 500000000, intraBlocTrade: 2100000, tradeCoverage: 96.0, keyFeatures: ['Elimination of 95% of tariffs', 'High-standard trade rules', 'Digital economy provisions', 'Environmental protections'], majorSectors: ['Technology', 'Agriculture', 'Manufacturing', 'Services'] },
  'RCEP': { name: 'Regional Comprehensive Economic Partnership', acronym: 'RCEP', established: '2022', type: 'Free Trade Agreement', members: [{ code: 'CN', name: 'China', population: 1440000000, gdp: 14720000 }, { code: 'JP', name: 'Japan', population: 126000000, gdp: 4940000 }, { code: 'KR', name: 'South Korea', population: 52000000, gdp: 1640000 }, { code: 'AU', name: 'Australia', population: 26000000, gdp: 1330000 }], totalGdp: 26200000, totalPopulation: 2300000000, intraBlocTrade: 2800000, tradeCoverage: 92.0, keyFeatures: ["World's largest trade agreement", 'Gradual tariff elimination', 'Rules of origin simplification', 'E-commerce provisions'], majorSectors: ['Manufacturing', 'Technology', 'Agriculture', 'Services'] },
};

const advancedTradeMetrics: Record<string, Record<string, Record<string, number>>> = {
  economicComplexity: { US: { eci: 1.23, rank: 9, productComplexity: 0.89, opportunityValue: 0.76 }, CN: { eci: 0.26, rank: 25, productComplexity: 0.45, opportunityValue: 1.12 }, DE: { eci: 2.09, rank: 1, productComplexity: 1.15, opportunityValue: 0.34 }, JP: { eci: 2.07, rank: 2, productComplexity: 1.23, opportunityValue: 0.28 }, GB: { eci: 1.54, rank: 5, productComplexity: 0.92, opportunityValue: 0.67 }, IN: { eci: -0.34, rank: 42, productComplexity: 0.23, opportunityValue: 1.45 }, BR: { eci: -0.19, rank: 35, productComplexity: 0.31, opportunityValue: 1.23 }, KR: { eci: 1.66, rank: 4, productComplexity: 1.08, opportunityValue: 0.45 }, CA: { eci: 0.78, rank: 15, productComplexity: 0.56, opportunityValue: 0.89 }, AU: { eci: -0.28, rank: 39, productComplexity: 0.19, opportunityValue: 1.34 }, MX: { eci: 0.25, rank: 26, productComplexity: 0.43, opportunityValue: 0.98 }, RU: { eci: -0.45, rank: 47, productComplexity: 0.15, opportunityValue: 1.67 }, SA: { eci: -1.23, rank: 67, productComplexity: 0.08, opportunityValue: 2.15 } },
  tradeConnectivity: { US: { partners: 195, networkCentrality: 0.92, tradeClusterCoeff: 0.78, avgDistance: 1.23 }, CN: { partners: 187, networkCentrality: 0.89, tradeClusterCoeff: 0.82, avgDistance: 1.18 }, DE: { partners: 176, networkCentrality: 0.85, tradeClusterCoeff: 0.91, avgDistance: 1.15 }, JP: { partners: 164, networkCentrality: 0.76, tradeClusterCoeff: 0.73, avgDistance: 1.34 }, GB: { partners: 158, networkCentrality: 0.74, tradeClusterCoeff: 0.69, avgDistance: 1.41 }, IN: { partners: 142, networkCentrality: 0.67, tradeClusterCoeff: 0.58, avgDistance: 1.67 }, BR: { partners: 138, networkCentrality: 0.62, tradeClusterCoeff: 0.54, avgDistance: 1.78 }, KR: { partners: 145, networkCentrality: 0.69, tradeClusterCoeff: 0.71, avgDistance: 1.52 }, CA: { partners: 156, networkCentrality: 0.71, tradeClusterCoeff: 0.66, avgDistance: 1.45 }, AU: { partners: 134, networkCentrality: 0.58, tradeClusterCoeff: 0.49, avgDistance: 1.89 }, MX: { partners: 128, networkCentrality: 0.55, tradeClusterCoeff: 0.61, avgDistance: 1.73 }, RU: { partners: 119, networkCentrality: 0.51, tradeClusterCoeff: 0.43, avgDistance: 1.95 }, SA: { partners: 98, networkCentrality: 0.42, tradeClusterCoeff: 0.38, avgDistance: 2.12 } },
  tradePerformance: { US: { exportQuality: 0.87, marketShare: 8.7, competitiveness: 0.91, innovation: 0.94 }, CN: { exportQuality: 0.56, marketShare: 14.2, competitiveness: 0.78, innovation: 0.67 }, DE: { exportQuality: 0.95, marketShare: 8.1, competitiveness: 0.96, innovation: 0.89 }, JP: { exportQuality: 0.92, marketShare: 3.8, competitiveness: 0.88, innovation: 0.91 }, GB: { exportQuality: 0.84, marketShare: 2.9, competitiveness: 0.82, innovation: 0.86 }, IN: { exportQuality: 0.43, marketShare: 1.8, competitiveness: 0.54, innovation: 0.45 }, BR: { exportQuality: 0.49, marketShare: 1.2, competitiveness: 0.58, innovation: 0.41 }, KR: { exportQuality: 0.81, marketShare: 3.1, competitiveness: 0.84, innovation: 0.83 }, CA: { exportQuality: 0.73, marketShare: 2.4, competitiveness: 0.76, innovation: 0.72 }, AU: { exportQuality: 0.61, marketShare: 1.5, competitiveness: 0.69, innovation: 0.58 }, MX: { exportQuality: 0.58, marketShare: 2.1, competitiveness: 0.63, innovation: 0.48 }, RU: { exportQuality: 0.34, marketShare: 1.8, competitiveness: 0.45, innovation: 0.32 }, SA: { exportQuality: 0.28, marketShare: 1.3, competitiveness: 0.41, innovation: 0.25 } },
  tradeSustainability: { US: { carbonIntensity: 0.42, sustainableExports: 23.4, greenTech: 0.78, circularTrade: 0.34 }, CN: { carbonIntensity: 0.89, sustainableExports: 12.8, greenTech: 0.56, circularTrade: 0.21 }, DE: { carbonIntensity: 0.31, sustainableExports: 34.7, greenTech: 0.91, circularTrade: 0.67 }, JP: { carbonIntensity: 0.38, sustainableExports: 28.9, greenTech: 0.85, circularTrade: 0.58 }, GB: { carbonIntensity: 0.35, sustainableExports: 31.2, greenTech: 0.82, circularTrade: 0.52 }, IN: { carbonIntensity: 0.76, sustainableExports: 8.9, greenTech: 0.41, circularTrade: 0.18 }, BR: { carbonIntensity: 0.58, sustainableExports: 15.6, greenTech: 0.38, circularTrade: 0.23 }, KR: { carbonIntensity: 0.45, sustainableExports: 22.1, greenTech: 0.74, circularTrade: 0.41 }, CA: { carbonIntensity: 0.48, sustainableExports: 19.8, greenTech: 0.69, circularTrade: 0.36 }, AU: { carbonIntensity: 0.67, sustainableExports: 14.3, greenTech: 0.52, circularTrade: 0.28 }, MX: { carbonIntensity: 0.54, sustainableExports: 11.7, greenTech: 0.43, circularTrade: 0.25 }, RU: { carbonIntensity: 0.82, sustainableExports: 7.2, greenTech: 0.29, circularTrade: 0.15 }, SA: { carbonIntensity: 0.95, sustainableExports: 4.8, greenTech: 0.22, circularTrade: 0.12 } },
  tradeInfrastructure: { US: { logisticsIndex: 4.05, tradeCost: 0.8, financingAccess: 0.92, digitalTrade: 0.89 }, CN: { logisticsIndex: 3.61, tradeCost: 1.2, financingAccess: 0.76, digitalTrade: 0.81 }, DE: { logisticsIndex: 4.20, tradeCost: 0.7, financingAccess: 0.95, digitalTrade: 0.91 }, JP: { logisticsIndex: 4.03, tradeCost: 0.9, financingAccess: 0.88, digitalTrade: 0.86 }, GB: { logisticsIndex: 3.99, tradeCost: 0.9, financingAccess: 0.91, digitalTrade: 0.94 }, IN: { logisticsIndex: 3.18, tradeCost: 1.8, financingAccess: 0.54, digitalTrade: 0.67 }, BR: { logisticsIndex: 2.99, tradeCost: 2.1, financingAccess: 0.61, digitalTrade: 0.58 }, KR: { logisticsIndex: 3.72, tradeCost: 1.1, financingAccess: 0.83, digitalTrade: 0.88 }, CA: { logisticsIndex: 3.73, tradeCost: 1.0, financingAccess: 0.87, digitalTrade: 0.82 }, AU: { logisticsIndex: 3.75, tradeCost: 1.3, financingAccess: 0.79, digitalTrade: 0.75 }, MX: { logisticsIndex: 3.05, tradeCost: 1.7, financingAccess: 0.67, digitalTrade: 0.63 }, RU: { logisticsIndex: 2.76, tradeCost: 2.4, financingAccess: 0.48, digitalTrade: 0.51 }, SA: { logisticsIndex: 3.01, tradeCost: 1.9, financingAccess: 0.72, digitalTrade: 0.59 } },
  tradeResilience: { US: { supplyChainRisk: 0.34, tradeConcentration: 0.28, resilience: 0.87, adaptability: 0.82 }, CN: { supplyChainRisk: 0.45, tradeConcentration: 0.31, resilience: 0.76, adaptability: 0.79 }, DE: { supplyChainRisk: 0.38, tradeConcentration: 0.42, resilience: 0.81, adaptability: 0.85 }, JP: { supplyChainRisk: 0.52, tradeConcentration: 0.48, resilience: 0.73, adaptability: 0.78 }, GB: { supplyChainRisk: 0.41, tradeConcentration: 0.35, resilience: 0.79, adaptability: 0.81 }, IN: { supplyChainRisk: 0.67, tradeConcentration: 0.58, resilience: 0.56, adaptability: 0.62 }, BR: { supplyChainRisk: 0.71, tradeConcentration: 0.62, resilience: 0.52, adaptability: 0.58 }, KR: { supplyChainRisk: 0.49, tradeConcentration: 0.51, resilience: 0.71, adaptability: 0.74 }, CA: { supplyChainRisk: 0.43, tradeConcentration: 0.39, resilience: 0.76, adaptability: 0.72 }, AU: { supplyChainRisk: 0.56, tradeConcentration: 0.67, resilience: 0.64, adaptability: 0.68 }, MX: { supplyChainRisk: 0.59, tradeConcentration: 0.73, resilience: 0.61, adaptability: 0.65 }, RU: { supplyChainRisk: 0.78, tradeConcentration: 0.81, resilience: 0.45, adaptability: 0.48 }, SA: { supplyChainRisk: 0.85, tradeConcentration: 0.89, resilience: 0.38, adaptability: 0.41 } },
};

type ViewMode = 'rankings' | 'countryFocus' | 'historical' | 'tariffs' | 'map';
const VIEW_MODE_CONFIG: { id: ViewMode; label: string; description: string }[] = [
  { id: 'rankings', label: 'Rankings', description: 'Sortable country table' },
  { id: 'countryFocus', label: 'Country Focus', description: 'Detailed country analysis' },
  { id: 'historical', label: 'Historical', description: 'Trade trends over time' },
  { id: 'tariffs', label: 'Tariffs & Blocs', description: 'Disputes, blocs & metrics' },
  { id: 'map', label: 'Trade Map', description: 'Geographic trade flow visualization' },
];

const METRIC_CATEGORIES = [
  { id: 'complexity', label: 'Economic Complexity', keys: ['eci', 'rank', 'productComplexity', 'opportunityValue'] },
  { id: 'connectivity', label: 'Trade Connectivity', keys: ['partners', 'networkCentrality', 'tradeClusterCoeff', 'avgDistance'] },
  { id: 'performance', label: 'Trade Performance', keys: ['exportQuality', 'marketShare', 'competitiveness', 'innovation'] },
  { id: 'sustainability', label: 'Sustainability', keys: ['carbonIntensity', 'sustainableExports', 'greenTech', 'circularTrade'] },
  { id: 'infrastructure', label: 'Infrastructure', keys: ['logisticsIndex', 'tradeCost', 'financingAccess', 'digitalTrade'] },
  { id: 'resilience', label: 'Resilience', keys: ['supplyChainRisk', 'tradeConcentration', 'resilience', 'adaptability'] },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'];
const CHART_LINE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const ISO2_TO_NUMERIC: Record<string, string> = {
  US: '840', CN: '156', DE: '276', JP: '392', GB: '826', IN: '356',
  BR: '076', KR: '410', CA: '124', AU: '036', MX: '484', RU: '643',
  SA: '682', FR: '250', IT: '380', ES: '724', ID: '360', TR: '792',
};
const NUMERIC_TO_ISO2: Record<string, string> = Object.fromEntries(Object.entries(ISO2_TO_NUMERIC).map(([k, v]) => [v, k]));

const TRADE_CENTROIDS: Record<string, [number, number]> = {
  US: [-98, 39], CN: [104, 35], DE: [10, 51], JP: [138, 36], GB: [-3, 55],
  IN: [79, 22], BR: [-53, -10], KR: [128, 36], CA: [-106, 56], AU: [134, -25],
  MX: [-102, 23], RU: [90, 62], SA: [45, 24], FR: [2, 47], IT: [12, 43],
  ES: [-4, 40], ID: [118, -2], TR: [35, 39],
};

const TRADE_COUNTRY_NAMES: Record<string, string> = {
  USA: 'US', China: 'CN', Germany: 'DE', Japan: 'JP', UK: 'GB', India: 'IN',
  Brazil: 'BR', SouthKorea: 'KR', Canada: 'CA', Australia: 'AU', Mexico: 'MX',
  Russia: 'RU', SaudiArabia: 'SA', France: 'FR', Italy: 'IT', Spain: 'ES',
  Indonesia: 'ID', Turkey: 'TR',
};
const ISO2_TO_TRADE_NAME: Record<string, string> = Object.fromEntries(Object.entries(TRADE_COUNTRY_NAMES).map(([k, v]) => [v, k]));

type MapMetric = 'totalExports' | 'totalImports' | 'tradeBalance' | 'tradeIntensity' | 'exportGrowth';
const MAP_METRICS: { id: MapMetric; label: string }[] = [
  { id: 'totalExports', label: 'Exports' },
  { id: 'totalImports', label: 'Imports' },
  { id: 'tradeBalance', label: 'Balance' },
  { id: 'tradeIntensity', label: 'Trade Intensity' },
  { id: 'exportGrowth', label: 'Export Growth' },
];

const TradingPlacesPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [enableRealData, setEnableRealData] = useLocalStorage('enableRealData', false);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('tradingPlacesViewMode', 'rankings');
  const [selectedCountry, setSelectedCountry] = useState(mockTradeData.countries[0]);
  const [detailCountry, setDetailCountry] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('totalExports');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterRegion, setFilterRegion] = useState('All');
  const [countrySearch, setCountrySearch] = useState('');
  const [tariffTab, setTariffTab] = useState('disputes');
  const [activeMetricCategory, setActiveMetricCategory] = useState('complexity');
  const [customStartYear, setCustomStartYear] = useState<number>(1960);
  const [customEndYear, setCustomEndYear] = useState<number>(2023);
  const [showHistoricalView, setShowHistoricalView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mapStyle, setMapStyle] = useState<'choropleth' | 'bubble'>('choropleth');
  const [mapMetric, setMapMetric] = useState<MapMetric>('totalExports');
  const [mapPosition, setMapPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [0, 20], zoom: 1 });
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; code: string; value: number; x: number; y: number } | null>(null);
  const [hoveredFlow, setHoveredFlow] = useState<{ index: number; x: number; y: number } | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    window.dispatchEvent(new Event('themeChange'));
  }, [isDarkMode]);

  useEffect(() => {
    const h = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetailCountry(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (viewMode === 'historical' && !showHistoricalView) setShowHistoricalView(true);
  }, [viewMode, showHistoricalView]);

  useEffect(() => { setSelectedFlow(null); }, [detailCountry]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  const { data: realTradeData, loading } = useTradeData({
    countries: TRADE_COUNTRIES as unknown as string[],
    enableRealData,
    refreshInterval: 3600000
  });

  const {
    yearlyData: historicalYearlyData,
    trends: historicalTrends,
    globalTrends: historicalGlobalTrends,
    loading: historicalLoading,
  } = useHistoricalTradeData({
    countries: TRADE_COUNTRIES as unknown as string[],
    startYear: customStartYear,
    endYear: customEndYear,
    enableRealData: enableRealData && showHistoricalView
  });

  const combinedTradeData = useMemo(() => {
    if (enableRealData && realTradeData.length > 0) {
      const mergedCountries = mockTradeData.countries.map(mc => {
        const rd = realTradeData.find((r: any) =>
          r.code === mc.code || r.countryCode === mc.code ||
          r.countryCode === COUNTRY_MAPPINGS[mc.code] ||
          r.country?.toLowerCase() === mc.name.toLowerCase()
        );
        if (rd) {
          return {
            ...mc,
            totalExports: (typeof rd.exports === 'number' && rd.exports > 0) ? rd.exports : mc.totalExports,
            totalImports: (typeof rd.imports === 'number' && rd.imports > 0) ? rd.imports : mc.totalImports,
            tradeBalance: (typeof rd.tradeBalance === 'number') ? rd.tradeBalance : mc.tradeBalance,
            gdp: (typeof rd.gdp === 'number' && rd.gdp > 0) ? rd.gdp : mc.gdp,
            population: (typeof rd.population === 'number' && rd.population > 0) ? rd.population : mc.population,
            tradeIntensity: (typeof rd.tradeIntensity === 'number' && rd.tradeIntensity > 0) ? rd.tradeIntensity : mc.tradeIntensity,
            diversificationIndex: (typeof rd.diversificationIndex === 'number') ? rd.diversificationIndex : mc.diversificationIndex,
            topExports: rd.topExports?.length > 0 ? rd.topExports : mc.topExports,
            topImports: rd.topImports?.length > 0 ? rd.topImports : mc.topImports,
            tradePartners: rd.tradingPartners?.length > 0 ? rd.tradingPartners : mc.tradePartners,
            exportGrowth: (typeof rd.exportGrowth === 'number') ? rd.exportGrowth : mc.exportGrowth,
            importGrowth: (typeof rd.importGrowth === 'number') ? rd.importGrowth : mc.importGrowth,
          };
        }
        return mc;
      });
      const totalWorldTrade = mergedCountries.reduce((s, c) => s + (c.totalExports || 0) + (c.totalImports || 0), 0);
      const topTradingNations = mergedCountries.filter(c => c.totalExports > 0).sort((a, b) => b.totalExports - a.totalExports).slice(0, 5).map(c => c.name);
      const vi = mergedCountries.filter(c => c.tradeIntensity > 0).map(c => c.tradeIntensity);
      const avgIntensity = vi.length > 0 ? vi.reduce((s, v) => s + v, 0) / vi.length : mockTradeData.globalStats.tradeMetrics.averageTradeIntensity;
      const vg = mergedCountries.filter(c => c.exportGrowth !== undefined && c.importGrowth !== undefined).map(c => (c.exportGrowth + c.importGrowth) / 2);
      const globalGrowth = vg.length > 0 ? vg.reduce((s, v) => s + v, 0) / vg.length : mockTradeData.globalStats.tradeMetrics.globalTradeGrowth;
      return { countries: mergedCountries, globalStats: { ...mockTradeData.globalStats, totalWorldTrade: totalWorldTrade > 0 ? totalWorldTrade : mockTradeData.globalStats.totalWorldTrade, topTradingNations: topTradingNations.length > 0 ? topTradingNations : mockTradeData.globalStats.topTradingNations, tradeMetrics: { ...mockTradeData.globalStats.tradeMetrics, averageTradeIntensity: avgIntensity, globalTradeGrowth: globalGrowth } } };
    }
    return mockTradeData;
  }, [enableRealData, realTradeData]);

  useEffect(() => {
    const updated = combinedTradeData.countries.find(c => c.code === selectedCountry.code);
    if (updated && updated !== selectedCountry) setSelectedCountry(updated);
  }, [combinedTradeData]);

  const sortedCountries = useMemo(() => {
    let filtered = [...combinedTradeData.countries];
    if (countrySearch.trim()) {
      const q = countrySearch.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    if (filterRegion !== 'All') filtered = filtered.filter(c => c.region === filterRegion);
    const dir = sortDir === 'desc' ? 1 : -1;
    return filtered.sort((a: any, b: any) => dir * ((b[sortBy] ?? 0) - (a[sortBy] ?? 0)));
  }, [sortBy, sortDir, filterRegion, combinedTradeData, countrySearch]);

  const formatNumber = (num: number, suffix = 'B') => `$${Math.round(Math.abs(num))}${suffix}`;
  const formatPct = (num: number) => `${(Math.round(num * 10) / 10)}%`;
  const getBalColor = (b: number) => b > 0 ? tc.positive : b < 0 ? tc.negative : tc.textSec;

  const chartData = useMemo(() => {
    const ec = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];
    const ic = ['#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#BE185D', '#4F46E5'];
    const pc = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'];
    const mkW = (n: number) => { const w = Array.from({ length: n }, (_, i) => Math.max(1, n - i)); const t = w.reduce((a, b) => a + b, 0); return w.map(v => Math.round((v / t) * 100)); };
    const ew = mkW(selectedCountry.topExports.length);
    const exportData = selectedCountry.topExports.map((e: string, i: number) => ({ name: e, value: ew[i], fill: ec[i % ec.length] }));
    const iw = mkW(selectedCountry.topImports.length);
    const importData = selectedCountry.topImports.map((e: string, i: number) => ({ name: e, value: iw[i], fill: ic[i % ic.length] }));
    const partnerData = selectedCountry.tradePartners.map((p: any, i: number) => ({ name: p.country, value: p.share, fill: pc[i % pc.length] }));
    const partnerBarData = selectedCountry.tradePartners.map((p: any) => ({ name: p.country.length > 10 ? p.country.slice(0, 10) + '..' : p.country, exports: Math.round(((p.tradeVolume + p.balance) / 2) * 10) / 10, imports: Math.round(((p.tradeVolume - p.balance) / 2) * 10) / 10 }));
    return { exportData, importData, partnerData, partnerBarData };
  }, [selectedCountry]);

  const globalAggregateData = useMemo(() => {
    if (!historicalYearlyData || Object.keys(historicalYearlyData).length === 0) return [];
    return Object.entries(historicalYearlyData).sort(([a], [b]) => Number(a) - Number(b)).map(([year, countries]: [string, any[]]) => {
      const te = countries.reduce((s, c) => s + (c.exports || 0), 0);
      const ti = countries.reduce((s, c) => s + (c.imports || 0), 0);
      return { year: Number(year), 'Exports ($B)': Math.round(te * 10) / 10, 'Imports ($B)': Math.round(ti * 10) / 10 };
    });
  }, [historicalYearlyData]);

  const top5ExporterData = useMemo(() => {
    if (!historicalTrends || Object.keys(historicalTrends).length === 0) return { lines: [] as string[], data: [] as any[] };
    const sorted = Object.entries(historicalTrends).filter(([, t]: [string, any]) => t.data?.length > 0).sort(([, a]: [string, any], [, b]: [string, any]) => b.averageExports - a.averageExports).slice(0, 5);
    const names = sorted.map(([code]) => mockTradeData.countries.find(c => c.code === code)?.name || code);
    const yearSet = new Set<number>();
    sorted.forEach(([, t]: [string, any]) => t.data.forEach((d: any) => yearSet.add(d.year)));
    const years = Array.from(yearSet).sort((a, b) => a - b);
    const data = years.map(y => { const p: any = { year: y }; sorted.forEach(([, t]: [string, any], i) => { const d = t.data.find((d: any) => d.year === y); p[names[i]] = d ? Math.round(d.exports * 10) / 10 : null; }); return p; });
    return { lines: names, data };
  }, [historicalTrends]);

  const latestYearSnapshot = useMemo(() => {
    if (!historicalYearlyData || Object.keys(historicalYearlyData).length === 0) return [];
    const yrs = Object.keys(historicalYearlyData).map(Number).sort((a, b) => b - a);
    const cs: any[] = historicalYearlyData[yrs[0]] || [];
    return cs.filter(c => c.exports > 0 || c.imports > 0).map(c => ({ name: c.country?.length > 12 ? c.country.substring(0, 12) + '...' : c.country, 'Trade Volume ($B)': Math.round((c.exports + c.imports) * 10) / 10, year: yrs[0] })).sort((a, b) => b['Trade Volume ($B)'] - a['Trade Volume ($B)']);
  }, [historicalYearlyData]);

  const globalTradeVolumeData = useMemo(() => {
    return Object.entries(historicalGlobalTrends?.totalWorldTradeByYear || {}).sort(([a], [b]) => Number(a) - Number(b)).map(([year, trade]) => ({ year: Number(year), 'World Trade ($T)': Math.round((Number(trade) + Number.EPSILON) * 100) / 100 }));
  }, [historicalGlobalTrends]);

  const detailCountryData = useMemo(() => {
    if (!detailCountry) return null;
    return combinedTradeData.countries.find(c => c.code === detailCountry) || null;
  }, [detailCountry, combinedTradeData]);

  const mapValues = useMemo(() => {
    const vals: Record<string, number> = {};
    combinedTradeData.countries.forEach(c => {
      const numId = ISO2_TO_NUMERIC[c.code];
      if (numId) vals[numId] = (c as any)[mapMetric] ?? 0;
    });
    return vals;
  }, [combinedTradeData, mapMetric]);

  const { mapMin, mapMax } = useMemo(() => {
    const v = Object.values(mapValues);
    if (v.length === 0) return { mapMin: 0, mapMax: 1 };
    return { mapMin: Math.min(...v), mapMax: Math.max(...v) };
  }, [mapValues]);

  const tradeFlows = useMemo(() => {
    if (!detailCountry) return [];
    const tradeName = ISO2_TO_TRADE_NAME[detailCountry];
    if (!tradeName) return [];
    const partners = getTradePartnersFor(tradeName);
    return partners
      .map(p => {
        const partnerIso2 = TRADE_COUNTRY_NAMES[p.partner];
        if (!partnerIso2 || !TRADE_CENTROIDS[partnerIso2]) return null;
        return {
          partner: p.partner,
          partnerCode: partnerIso2,
          exports: p.exports,
          imports: p.imports,
          balance: p.balance,
          volume: p.exports + p.imports,
          from: TRADE_CENTROIDS[detailCountry],
          to: TRADE_CENTROIDS[partnerIso2],
        };
      })
      .filter(Boolean) as { partner: string; partnerCode: string; exports: number; imports: number; balance: number; volume: number; from: [number, number]; to: [number, number] }[];
  }, [detailCountry]);

  const maxFlowVolume = useMemo(() => {
    if (tradeFlows.length === 0) return 1;
    return Math.max(...tradeFlows.map(f => f.volume));
  }, [tradeFlows]);

  const getMapColor = useCallback((value: number) => {
    if (mapMetric === 'tradeBalance' || mapMetric === 'exportGrowth') {
      const absMax = Math.max(Math.abs(mapMin), Math.abs(mapMax)) || 1;
      const norm = value / absMax;
      if (norm >= 0) {
        const t = Math.min(norm, 1);
        const r = Math.round(16 + (16 - 16) * t);
        const g = Math.round(185 + (185 - 100) * t);
        const b = Math.round(129 + (129 - 50) * t);
        return `rgb(${r},${g},${b})`;
      } else {
        const t = Math.min(Math.abs(norm), 1);
        const r = Math.round(239 + (239 - 200) * t);
        const g = Math.round(68 - 40 * t);
        const b = Math.round(68 - 40 * t);
        return `rgb(${r},${g},${b})`;
      }
    }
    const range = mapMax - mapMin || 1;
    const t = Math.max(0, Math.min(1, (value - mapMin) / range));
    const r = Math.round(219 - 160 * t);
    const g = Math.round(234 - 174 * t);
    const b = Math.round(254 - 2 * t);
    return `rgb(${r},${g},${b})`;
  }, [mapMin, mapMax, mapMetric]);

  const toggleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  }, [sortBy]);

  const maxExport = useMemo(() => Math.max(...combinedTradeData.countries.map(c => c.totalExports)), [combinedTradeData]);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', selectBg: 'bg-gray-700 text-white border-gray-600',
    grid: '#374151', axis: '#6b7280',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' },
    activeBg: 'bg-blue-600 text-white', inactiveBg: 'bg-gray-700/50 text-gray-300 hover:bg-gray-700',
    positive: 'text-green-400', negative: 'text-red-400',
    rowHover: 'hover:bg-gray-700/50', selectedRow: 'bg-blue-500/10',
    subtab: 'bg-gray-700 text-gray-300', subtabActive: 'bg-blue-600 text-white',
    tagBg: 'bg-gray-700', infoBg: 'bg-blue-900/20 border-blue-800/30',
    ocean: '#0a1929', land: '#1e293b', mapBorder: '#374151', mapHighlight: '#f59e0b',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', selectBg: 'bg-white text-gray-900 border-gray-300',
    grid: '#e5e7eb', axis: '#9ca3af',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827' },
    activeBg: 'bg-blue-600 text-white', inactiveBg: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    positive: 'text-green-600', negative: 'text-red-600',
    rowHover: 'hover:bg-gray-50', selectedRow: 'bg-blue-50',
    subtab: 'bg-gray-100 text-gray-600', subtabActive: 'bg-blue-600 text-white',
    tagBg: 'bg-gray-100', infoBg: 'bg-blue-50/80 border-blue-100',
    ocean: '#e3f2fd', land: '#e5e7eb', mapBorder: '#d1d5db', mapHighlight: '#f59e0b',
  };

  if (!mounted) return null;

  if (loading && !combinedTradeData.countries.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading trade data...</p>
        </div>
      </div>
    );
  }

  const regions = ['All', ...Array.from(new Set(mockTradeData.countries.map(c => c.region)))];
  const sortOptions = [
    { value: 'totalExports', label: 'Exports' }, { value: 'totalImports', label: 'Imports' },
    { value: 'tradeBalance', label: 'Balance' }, { value: 'gdp', label: 'GDP' },
    { value: 'tradeIntensity', label: 'Trade Intensity' }, { value: 'exportGrowth', label: 'Export Growth' },
    { value: 'diversificationIndex', label: 'Diversification' },
  ];

  const FlagIcon = ({ code, size = 'w-6 h-4' }: { code: string; size?: string }) => {
    const Flag = countryFlags[code];
    return Flag ? <Flag className={size} /> : <span className={`${size} bg-gray-300 rounded`} />;
  };

  return (
    <div className={`min-h-screen ${tc.bg} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tc.text}`}>Trading Places</h1>
            <p className={tc.textSec}>Global trade flows, tariffs, and economic relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setEnableRealData(!enableRealData)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${enableRealData ? 'bg-green-600 text-white border-green-600' : `${tc.card} ${tc.textSec}`}`}>
              {enableRealData ? 'Live Data' : 'Sample'}
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${tc.textSec}`}>Light</span>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-xs ${tc.textSec}`}>Dark</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className={`rounded-xl border p-4 mb-6 ${tc.infoBg}`}>
          <h3 className={`font-semibold mb-1 ${tc.text}`}>Understanding Global Trade</h3>
          <p className={`text-sm ${tc.textSec}`}>
            Explore trade relationships between 18 major economies. Use Rankings to compare countries,
            Country Focus for detailed partner analysis, Historical for long-term trends, Tariffs &amp; Blocs
            for trade disputes and regional agreements, and Trade Map for geographic flow visualization.
          </p>
        </div>

        {/* Global Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'World Trade', value: `$${(combinedTradeData.globalStats.totalWorldTrade / 1000).toFixed(1)}T`, icon: Globe, color: 'text-blue-500' },
            { label: 'Top Exporter', value: combinedTradeData.globalStats.topTradingNations[0], icon: Package, color: 'text-green-500' },
            { label: 'Global Growth', value: `${combinedTradeData.globalStats.tradeMetrics.globalTradeGrowth.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Active Disputes', value: String(tariffData.currentDisputes.filter(d => d.status === 'Ongoing').length), icon: Shield, color: 'text-amber-500' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${tc.card}`}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className={`text-xs uppercase tracking-wide ${tc.textSec}`}>{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${tc.text}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* View Mode Selector */}
        <div className={`rounded-xl border p-3 mb-4 ${tc.card}`}>
          <div className="flex flex-wrap gap-2">
            {VIEW_MODE_CONFIG.map(vm => (
              <button key={vm.id} onClick={() => setViewMode(vm.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === vm.id ? tc.activeBg : tc.inactiveBg}`}>
                {vm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Card - shown for Rankings and Country Focus */}
        {(viewMode === 'rankings' || viewMode === 'countryFocus') && (
          <div className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-4 items-end ${tc.card}`}>
            {viewMode === 'rankings' && (
              <>
                <div className="min-w-[140px]">
                  <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Region</label>
                  <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className={`w-full px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="min-w-[140px]">
                  <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Sort By</label>
                  <select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortDir('desc'); }} className={`w-full px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>
                    {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="flex-1 min-w-[180px]">
              <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Search</label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tc.textSec}`} />
                <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search countries..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`} />
              </div>
            </div>
          </div>
        )}

        {/* Historical controls */}
        {viewMode === 'historical' && (
          <div className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-4 items-end ${tc.card}`}>
            <div className="min-w-[120px]">
              <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Start Year</label>
              <select value={customStartYear} onChange={e => setCustomStartYear(Number(e.target.value))} className={`w-full px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>
                {Array.from({ length: 7 }, (_, i) => 1960 + i * 10).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="min-w-[120px]">
              <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>End Year</label>
              <select value={customEndYear} onChange={e => setCustomEndYear(Number(e.target.value))} className={`w-full px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>
                {Array.from({ length: 7 }, (_, i) => 2023 - i * 5).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {historicalLoading && <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className={`text-sm ${tc.textSec}`}>Loading...</span></div>}
          </div>
        )}

        {/* Map controls */}
        {viewMode === 'map' && (
          <div className={`rounded-xl border p-4 mb-4 flex flex-wrap gap-4 items-end ${tc.card}`}>
            <div className="min-w-[160px]">
              <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Metric</label>
              <select value={mapMetric} onChange={e => setMapMetric(e.target.value as MapMetric)} className={`w-full px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>
                {MAP_METRICS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="min-w-[160px]">
              <label className={`block text-xs font-medium mb-1 ${tc.textSec}`}>Map Style</label>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: isDarkMode ? '#374151' : '#d1d5db' }}>
                <button onClick={() => setMapStyle('choropleth')} className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${mapStyle === 'choropleth' ? tc.subtabActive : tc.subtab}`}>
                  Choropleth
                </button>
                <button onClick={() => setMapStyle('bubble')} className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${mapStyle === 'bubble' ? tc.subtabActive : tc.subtab}`}>
                  Bubble
                </button>
              </div>
            </div>
            <div className="flex items-end gap-1">
              <button onClick={() => setMapPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))} className={`p-2 rounded-lg border ${tc.inactiveBg}`} title="Zoom in"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => setMapPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))} className={`p-2 rounded-lg border ${tc.inactiveBg}`} title="Zoom out"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={() => setMapPosition({ coordinates: [0, 20], zoom: 1 })} className={`p-2 rounded-lg border ${tc.inactiveBg}`} title="Reset"><RotateCcw className="w-4 h-4" /></button>
            </div>
            {detailCountry && (
              <div className="flex items-end">
                <button onClick={() => setDetailCountry(null)} className={`px-3 py-1.5 rounded-lg text-sm border ${tc.inactiveBg}`}>
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">

            {/* ==================== RANKINGS VIEW ==================== */}
            {viewMode === 'rankings' && (
              <div className={`rounded-xl border overflow-hidden ${tc.card}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}>
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${tc.textSec}`} style={{ width: 50 }}>#</th>
                        <th className={`px-3 py-3 text-left text-xs font-medium uppercase ${tc.textSec}`} style={{ minWidth: 160 }}>Country</th>
                        {[
                          { key: 'totalExports', label: 'Exports' }, { key: 'totalImports', label: 'Imports' },
                          { key: 'tradeBalance', label: 'Balance' }, { key: 'tradeIntensity', label: 'Intensity' },
                          { key: 'exportGrowth', label: 'Growth' }, { key: 'diversificationIndex', label: 'Divers.' },
                        ].map(col => (
                          <th key={col.key} onClick={() => toggleSort(col.key)}
                            className={`px-3 py-3 text-right text-xs font-medium uppercase cursor-pointer select-none ${tc.textSec} hover:text-blue-500`} style={{ minWidth: 100 }}>
                            {col.label} {sortBy === col.key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {sortedCountries.map((c, i) => (
                        <tr key={c.code} onClick={() => setDetailCountry(prev => prev === c.code ? null : c.code)}
                          className={`cursor-pointer transition-colors ${detailCountry === c.code ? tc.selectedRow : tc.rowHover}`}>
                          <td className={`px-3 py-3 ${tc.textSec}`}>{i + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <FlagIcon code={c.code} />
                              <span className={`font-medium ${tc.text}`}>{c.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(c.totalExports / maxExport) * 100}%` }} />
                              </div>
                              <span className={tc.text}>{formatNumber(c.totalExports)}</span>
                            </div>
                          </td>
                          <td className={`px-3 py-3 text-right ${tc.text}`}>{formatNumber(c.totalImports)}</td>
                          <td className={`px-3 py-3 text-right font-medium ${getBalColor(c.tradeBalance)}`}>
                            {c.tradeBalance > 0 ? '+' : ''}{formatNumber(c.tradeBalance)}
                          </td>
                          <td className={`px-3 py-3 text-right ${tc.text}`}>{formatPct(c.tradeIntensity)}</td>
                          <td className={`px-3 py-3 text-right font-medium ${c.exportGrowth >= 0 ? tc.positive : tc.negative}`}>
                            {c.exportGrowth > 0 ? '+' : ''}{formatPct(c.exportGrowth)}
                          </td>
                          <td className={`px-3 py-3 text-right ${tc.text}`}>{c.diversificationIndex.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== COUNTRY FOCUS VIEW ==================== */}
            {viewMode === 'countryFocus' && (
              <div className="space-y-6">
                {/* Country Selector */}
                <div className={`rounded-xl border p-3 ${tc.card}`}>
                  <div className="flex flex-wrap gap-2">
                    {(countrySearch ? sortedCountries : combinedTradeData.countries).map(c => (
                      <button key={c.code} onClick={() => { setSelectedCountry(c); setDetailCountry(c.code); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          selectedCountry.code === c.code ? tc.activeBg + ' border-blue-600' : tc.inactiveBg + ` border-transparent`
                        }`}>
                        <FlagIcon code={c.code} size="w-4 h-3" />
                        <span className="hidden sm:inline">{c.name.length > 10 ? c.name.slice(0, 10) + '..' : c.name}</span>
                        <span className="sm:hidden">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Exports Pie */}
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>Top Exports</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart><Pie data={chartData.exportData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {chartData.exportData.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                      </Pie><Tooltip contentStyle={tc.tooltip} /></RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Imports Pie */}
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>Top Imports</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart><Pie data={chartData.importData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {chartData.importData.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                      </Pie><Tooltip contentStyle={tc.tooltip} /></RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Partners Pie */}
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>Trading Partners</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart><Pie data={chartData.partnerData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {chartData.partnerData.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                      </Pie><Tooltip contentStyle={tc.tooltip} /></RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Partner Bar Chart */}
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${tc.text}`}>Partner Trade Flows ($B)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData.partnerBarData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                        <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={80} stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={tc.tooltip} />
                        <Legend />
                        <Bar dataKey="exports" fill="#3B82F6" name="Exports" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="imports" fill="#EF4444" name="Imports" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trade Flows Table */}
                <div className={`rounded-xl border overflow-hidden ${tc.card}`}>
                  <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                    <h3 className={`font-semibold ${tc.text}`}>{selectedCountry.name} - Trade Partners</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className={isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${tc.textSec}`}>Partner</th>
                      <th className={`px-4 py-2 text-right text-xs font-medium uppercase ${tc.textSec}`}>Volume ($B)</th>
                      <th className={`px-4 py-2 text-right text-xs font-medium uppercase ${tc.textSec}`}>Balance ($B)</th>
                      <th className={`px-4 py-2 text-right text-xs font-medium uppercase ${tc.textSec}`}>Share (%)</th>
                    </tr></thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {selectedCountry.tradePartners.map((p: any, i: number) => (
                        <tr key={i} className={tc.rowHover}>
                          <td className={`px-4 py-2 font-medium ${tc.text}`}>{p.country}</td>
                          <td className={`px-4 py-2 text-right ${tc.text}`}>${p.tradeVolume.toFixed(1)}</td>
                          <td className={`px-4 py-2 text-right font-medium ${getBalColor(p.balance)}`}>{p.balance > 0 ? '+' : ''}${p.balance.toFixed(1)}</td>
                          <td className={`px-4 py-2 text-right ${tc.text}`}>{p.share}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Exports', value: formatNumber(selectedCountry.totalExports), color: 'text-blue-500' },
                    { label: 'Total Imports', value: formatNumber(selectedCountry.totalImports), color: 'text-red-500' },
                    { label: 'Trade Balance', value: `${selectedCountry.tradeBalance > 0 ? '+' : ''}${formatNumber(selectedCountry.tradeBalance)}`, color: selectedCountry.tradeBalance >= 0 ? 'text-green-500' : 'text-red-500' },
                    { label: 'Trade Intensity', value: formatPct(selectedCountry.tradeIntensity), color: 'text-purple-500' },
                  ].map((c, i) => (
                    <div key={i} className={`rounded-xl border p-3 ${tc.card}`}>
                      <div className={`text-xs uppercase tracking-wide mb-1 ${tc.textSec}`}>{c.label}</div>
                      <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== HISTORICAL VIEW ==================== */}
            {viewMode === 'historical' && (
              <div className="space-y-6">
                {globalTradeVolumeData.length > 0 && (
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`font-semibold mb-3 ${tc.text}`}>Global Trade Volume Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={globalTradeVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                        <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={tc.tooltip} />
                        <Area type="monotone" dataKey="World Trade ($T)" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {globalAggregateData.length > 0 && (
                    <div className={`rounded-xl border p-4 ${tc.card}`}>
                      <h3 className={`font-semibold mb-3 ${tc.text}`}>Exports vs Imports</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={globalAggregateData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                          <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={tc.tooltip} />
                          <Legend />
                          <Area type="monotone" dataKey="Exports ($B)" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                          <Area type="monotone" dataKey="Imports ($B)" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {top5ExporterData.data.length > 0 && (
                    <div className={`rounded-xl border p-4 ${tc.card}`}>
                      <h3 className={`font-semibold mb-3 ${tc.text}`}>Top 5 Exporters Over Time</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={top5ExporterData.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                          <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={tc.tooltip} />
                          <Legend />
                          {top5ExporterData.lines.map((name, i) => (
                            <Line key={name} type="monotone" dataKey={name} stroke={CHART_LINE_COLORS[i]} strokeWidth={2} dot={false} connectNulls />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {latestYearSnapshot.length > 0 && (
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`font-semibold mb-3 ${tc.text}`}>Latest Year Trade Snapshot ({latestYearSnapshot[0]?.year})</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={latestYearSnapshot.slice(0, 15)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                        <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={100} stroke={tc.axis} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={tc.tooltip} />
                        <Bar dataKey="Trade Volume ($B)" radius={[0, 4, 4, 0]}>
                          {latestYearSnapshot.slice(0, 15).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {!globalTradeVolumeData.length && !globalAggregateData.length && !historicalLoading && (
                  <div className={`rounded-xl border p-12 text-center ${tc.card}`}>
                    <Clock className={`w-12 h-12 mx-auto mb-4 ${tc.textSec}`} />
                    <p className={`font-medium ${tc.text}`}>No historical data available</p>
                    <p className={`text-sm mt-1 ${tc.textSec}`}>Enable real data to fetch historical trade trends from the World Bank.</p>
                  </div>
                )}
              </div>
            )}

            {/* ==================== TARIFFS & BLOCS VIEW ==================== */}
            {viewMode === 'tariffs' && (
              <div className="space-y-6">
                {/* Sub-tabs */}
                <div className={`rounded-xl border p-2 flex flex-wrap gap-1 ${tc.card}`}>
                  {[
                    { id: 'disputes', label: 'Current Disputes' }, { id: 'trends', label: 'Trends' },
                    { id: 'blocs', label: 'Trade Blocs' }, { id: 'advanced', label: 'Advanced Metrics' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTariffTab(t.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tariffTab === t.id ? tc.subtabActive : tc.subtab}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Disputes */}
                {tariffTab === 'disputes' && (
                  <div className="space-y-4">
                    {tariffData.currentDisputes.map(d => (
                      <div key={d.id} className={`rounded-xl border p-5 ${tc.card}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className={`font-semibold text-lg ${tc.text}`}>{d.title}</h3>
                            <p className={`text-sm ${tc.textSec}`}>{d.description}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${d.status === 'Ongoing' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {d.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>Global Trade Impact</div>
                            <div className={`text-lg font-bold ${tc.negative}`}>{d.impact.globalTrade}%</div>
                          </div>
                          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>GDP Impact</div>
                            <div className={`text-lg font-bold ${tc.negative}`}>{d.impact.gdp}%</div>
                          </div>
                          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>Countries Affected</div>
                            <div className={`text-lg font-bold ${tc.text}`}>{d.impact.affectedCountries}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Timeline</h4>
                          <div className="space-y-2">
                            {d.timeline.map((t, i) => (
                              <div key={i} className="flex gap-3 text-sm">
                                <span className={`font-mono shrink-0 ${tc.textSec}`}>{t.date}</span>
                                <span className={tc.text}>{t.event}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trends */}
                {tariffTab === 'trends' && (
                  <div className="space-y-6">
                    <div className={`rounded-xl border p-4 ${tc.card}`}>
                      <h3 className={`font-semibold mb-3 ${tc.text}`}>Global Average Tariff Rate</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={tariffData.globalTariffTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                          <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} unit="%" />
                          <Tooltip contentStyle={tc.tooltip} />
                          <Area type="monotone" dataKey="average" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Avg Tariff %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className={`rounded-xl border p-4 ${tc.card}`}>
                      <h3 className={`font-semibold mb-3 ${tc.text}`}>Sectoral Impact</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={tariffData.sectoralImpacts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                          <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="sector" width={90} stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={tc.tooltip} />
                          <Legend />
                          <Bar dataKey="tariffIncrease" fill="#F59E0B" name="Tariff %" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="tradeVolume" fill="#EF4444" name="Trade Vol. %" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-3 ${tc.text}`}>Historical Trade Wars</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tariffData.historicalWars.map((w, i) => (
                          <div key={i} className={`rounded-xl border p-4 ${tc.card}`}>
                            <h4 className={`font-semibold mb-1 ${tc.text}`}>{w.name}</h4>
                            <p className={`text-xs mb-2 ${tc.textSec}`}>{w.period}</p>
                            <p className={`text-sm mb-2 ${tc.textSec}`}>{w.description}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded ${tc.tagBg} ${tc.textSec}`}>Avg Tariff: {w.averageTariff}%</span>
                              <span className={`px-2 py-0.5 rounded ${tc.tagBg} ${tc.textSec}`}>{w.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Blocs */}
                {tariffTab === 'blocs' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.values(tradeBlocs).map(bloc => (
                      <div key={bloc.acronym} className={`rounded-xl border p-5 ${tc.card}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl font-bold text-blue-500">{bloc.acronym}</span>
                          <div>
                            <h3 className={`font-semibold ${tc.text}`}>{bloc.name}</h3>
                            <p className={`text-xs ${tc.textSec}`}>{bloc.type} &middot; Est. {bloc.established}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {bloc.members.map(m => (
                            <span key={m.code} className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${tc.tagBg} ${tc.text}`}>
                              <FlagIcon code={m.code} size="w-4 h-3" />{m.name}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className={`rounded-lg p-2 text-center ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>GDP</div>
                            <div className={`font-bold ${tc.text}`}>${(bloc.totalGdp / 1000000).toFixed(1)}T</div>
                          </div>
                          <div className={`rounded-lg p-2 text-center ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>Population</div>
                            <div className={`font-bold ${tc.text}`}>{(bloc.totalPopulation / 1000000).toFixed(0)}M</div>
                          </div>
                          <div className={`rounded-lg p-2 text-center ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>Coverage</div>
                            <div className={`font-bold ${tc.text}`}>{bloc.tradeCoverage}%</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bloc.majorSectors.map(s => (
                            <span key={s} className={`px-2 py-0.5 rounded text-xs ${tc.tagBg} ${tc.textSec}`}>{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Advanced Metrics */}
                {tariffTab === 'advanced' && (
                  <div className="space-y-4">
                    <div className={`rounded-xl border p-3 flex flex-wrap gap-1 ${tc.card}`}>
                      {METRIC_CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setActiveMetricCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMetricCategory === cat.id ? tc.subtabActive : tc.subtab}`}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const catMap: Record<string, string> = { complexity: 'economicComplexity', connectivity: 'tradeConnectivity', performance: 'tradePerformance', sustainability: 'tradeSustainability', infrastructure: 'tradeInfrastructure', resilience: 'tradeResilience' };
                      const dataKey = catMap[activeMetricCategory] || 'economicComplexity';
                      const metricsData = advancedTradeMetrics[dataKey] || {};
                      const cat = METRIC_CATEGORIES.find(c => c.id === activeMetricCategory);
                      if (!cat) return null;
                      return cat.keys.map(metricKey => {
                        const barData = Object.entries(metricsData)
                          .map(([code, vals]) => ({ name: mockTradeData.countries.find(c => c.code === code)?.name || code, code, value: vals[metricKey] ?? 0 }))
                          .sort((a, b) => b.value - a.value);
                        return (
                          <div key={metricKey} className={`rounded-xl border p-4 ${tc.card}`}>
                            <h3 className={`font-semibold mb-3 capitalize ${tc.text}`}>{metricKey.replace(/([A-Z])/g, ' $1').trim()}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                                <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={100} stroke={tc.axis} tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={tc.tooltip} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ==================== MAP VIEW ==================== */}
            {viewMode === 'map' && (
              <div className="space-y-4">
                <div className={`rounded-xl border overflow-hidden ${tc.card}`}>
                  <div className="relative" style={{ background: tc.ocean }}>
                    <ComposableMap
                      projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                      width={800}
                      height={450}
                      style={{ width: '100%', height: 'auto' }}
                    >
                      <ZoomableGroup
                        center={mapPosition.coordinates}
                        zoom={mapPosition.zoom}
                        onMoveEnd={({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) => setMapPosition({ coordinates, zoom })}
                      >
                        <Geographies geography={GEO_URL}>
                          {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => {
                              const numId = geo.id;
                              const iso2 = NUMERIC_TO_ISO2[numId];
                              const val = mapValues[numId];
                              const isSelected = iso2 === detailCountry;
                              const isPartner = tradeFlows.some(f => f.partnerCode === iso2);
                              const isFlowEndpoint = selectedFlow !== null && tradeFlows[selectedFlow] &&
                                (iso2 === detailCountry || iso2 === tradeFlows[selectedFlow].partnerCode);
                              const hasData = val !== undefined;

                              let fill = tc.land;
                              if (mapStyle === 'choropleth' && hasData) {
                                fill = getMapColor(val);
                              } else if (mapStyle === 'bubble') {
                                fill = isDarkMode ? '#1e293b' : '#e5e7eb';
                              }

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={fill}
                                  stroke={isFlowEndpoint ? '#f59e0b' : isSelected ? tc.mapHighlight : isPartner ? '#f59e0b' : tc.mapBorder}
                                  strokeWidth={isFlowEndpoint ? 2 : isSelected ? 1.5 : isPartner ? 1 : 0.4}
                                  style={{
                                    default: { outline: 'none' },
                                    hover: { outline: 'none', fill: hasData ? (isDarkMode ? '#475569' : '#cbd5e1') : fill, cursor: hasData ? 'pointer' : 'default' },
                                    pressed: { outline: 'none' },
                                  }}
                                  onMouseEnter={(evt: React.MouseEvent) => {
                                    if (iso2 && hasData) {
                                      const country = combinedTradeData.countries.find(c => c.code === iso2);
                                      setHoveredCountry({
                                        name: country?.name || iso2,
                                        code: iso2,
                                        value: val,
                                        x: evt.clientX,
                                        y: evt.clientY,
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredCountry(null)}
                                  onClick={() => {
                                    if (iso2 && hasData) {
                                      setDetailCountry(iso2);
                                      const country = combinedTradeData.countries.find(c => c.code === iso2);
                                      if (country) setSelectedCountry(country);
                                    }
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>

                        {/* Choropleth: trade flow arcs (interactive) */}
                        {mapStyle === 'choropleth' && detailCountry && TRADE_CENTROIDS[detailCountry] && tradeFlows.map((flow, i) => {
                          const isActive = selectedFlow === i;
                          const isDimmed = selectedFlow !== null && selectedFlow !== i;
                          const baseWidth = Math.max(0.5, (flow.volume / maxFlowVolume) * 3);
                          return (
                            <React.Fragment key={`flow-${i}`}>
                              <MapLine
                                from={flow.from}
                                to={flow.to}
                                stroke={flow.balance >= 0 ? '#10B981' : '#EF4444'}
                                strokeWidth={isActive ? baseWidth + 2 : baseWidth}
                                strokeLinecap="round"
                                style={{ opacity: isDimmed ? 0.2 : isActive ? 1 : 0.7, transition: 'opacity 0.2s' }}
                              />
                              <MapLine
                                from={flow.from}
                                to={flow.to}
                                stroke="transparent"
                                strokeWidth={Math.max(12, baseWidth + 8)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(evt: React.MouseEvent) => {
                                  setHoveredFlow({ index: i, x: evt.clientX, y: evt.clientY });
                                  setHoveredCountry(null);
                                }}
                                onMouseMove={(evt: React.MouseEvent) => {
                                  setHoveredFlow(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
                                }}
                                onMouseLeave={() => setHoveredFlow(null)}
                                onClick={() => setSelectedFlow(prev => prev === i ? null : i)}
                              />
                            </React.Fragment>
                          );
                        })}

                        {/* Bubble map: circles at centroids */}
                        {mapStyle === 'bubble' && Object.entries(TRADE_CENTROIDS).map(([code, coords]) => {
                          const numId = ISO2_TO_NUMERIC[code];
                          const val = numId ? mapValues[numId] : undefined;
                          if (val === undefined) return null;
                          const range = mapMax - mapMin || 1;
                          const norm = (mapMetric === 'tradeBalance' || mapMetric === 'exportGrowth')
                            ? Math.abs(val) / (Math.max(Math.abs(mapMin), Math.abs(mapMax)) || 1)
                            : (val - mapMin) / range;
                          const radius = Math.max(2, Math.sqrt(Math.max(0, norm)) * 18);
                          const isSelected = code === detailCountry;
                          const isPartner = tradeFlows.some(f => f.partnerCode === code);
                          const isFlowEndpoint = selectedFlow !== null && tradeFlows[selectedFlow] &&
                            (code === detailCountry || code === tradeFlows[selectedFlow].partnerCode);

                          return (
                            <Marker key={`bubble-${code}`} coordinates={coords}>
                              <circle
                                r={isFlowEndpoint ? radius + 2 : radius}
                                fill={getMapColor(val)}
                                fillOpacity={0.75}
                                stroke={isFlowEndpoint ? '#f59e0b' : isSelected ? tc.mapHighlight : (isPartner ? '#f59e0b' : isDarkMode ? '#475569' : '#9ca3af')}
                                strokeWidth={isFlowEndpoint ? 2.5 : isSelected ? 2 : isPartner ? 1.5 : 0.5}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(evt: React.MouseEvent) => {
                                  const country = combinedTradeData.countries.find(c => c.code === code);
                                  setHoveredCountry({ name: country?.name || code, code, value: val, x: evt.clientX, y: evt.clientY });
                                }}
                                onMouseLeave={() => setHoveredCountry(null)}
                                onClick={() => {
                                  setDetailCountry(code);
                                  const country = combinedTradeData.countries.find(c => c.code === code);
                                  if (country) setSelectedCountry(country);
                                }}
                              />
                            </Marker>
                          );
                        })}

                        {/* Bubble map: connection lines (interactive) */}
                        {mapStyle === 'bubble' && detailCountry && TRADE_CENTROIDS[detailCountry] && tradeFlows.map((flow, i) => {
                          const isActive = selectedFlow === i;
                          const isDimmed = selectedFlow !== null && selectedFlow !== i;
                          const baseWidth = Math.max(0.5, (flow.volume / maxFlowVolume) * 2.5);
                          return (
                            <React.Fragment key={`conn-${i}`}>
                              <MapLine
                                from={flow.from}
                                to={flow.to}
                                stroke={flow.balance >= 0 ? '#10B981' : '#EF4444'}
                                strokeWidth={isActive ? baseWidth + 2 : baseWidth}
                                strokeLinecap="round"
                                strokeDasharray={isActive ? undefined : '4 2'}
                                style={{ opacity: isDimmed ? 0.2 : isActive ? 1 : 0.6, transition: 'opacity 0.2s' }}
                              />
                              <MapLine
                                from={flow.from}
                                to={flow.to}
                                stroke="transparent"
                                strokeWidth={Math.max(12, baseWidth + 8)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(evt: React.MouseEvent) => {
                                  setHoveredFlow({ index: i, x: evt.clientX, y: evt.clientY });
                                  setHoveredCountry(null);
                                }}
                                onMouseMove={(evt: React.MouseEvent) => {
                                  setHoveredFlow(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
                                }}
                                onMouseLeave={() => setHoveredFlow(null)}
                                onClick={() => setSelectedFlow(prev => prev === i ? null : i)}
                              />
                            </React.Fragment>
                          );
                        })}
                      </ZoomableGroup>
                    </ComposableMap>

                    {/* Country Hover Tooltip */}
                    {hoveredCountry && !hoveredFlow && (
                      <div
                        className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg shadow-lg text-sm"
                        style={{
                          left: hoveredCountry.x + 12,
                          top: hoveredCountry.y - 40,
                          backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                          color: isDarkMode ? '#fff' : '#111827',
                        }}
                      >
                        <div className="font-semibold">{hoveredCountry.name}</div>
                        <div className="text-xs opacity-75">
                          {MAP_METRICS.find(m => m.id === mapMetric)?.label}:{' '}
                          {mapMetric === 'tradeIntensity' || mapMetric === 'exportGrowth'
                            ? formatPct(hoveredCountry.value)
                            : formatNumber(hoveredCountry.value)}
                        </div>
                      </div>
                    )}

                    {/* Trade Flow Hover Tooltip */}
                    {hoveredFlow && tradeFlows[hoveredFlow.index] && (() => {
                      const flow = tradeFlows[hoveredFlow.index];
                      const sourceCountry = detailCountryData;
                      const partnerCountry = combinedTradeData.countries.find(c => c.code === flow.partnerCode);
                      return (
                        <div
                          className="fixed z-50 pointer-events-none px-4 py-3 rounded-xl shadow-xl text-sm min-w-[220px]"
                          style={{
                            left: hoveredFlow.x + 16,
                            top: hoveredFlow.y - 60,
                            backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            color: isDarkMode ? '#fff' : '#111827',
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FlagIcon code={detailCountry || ''} size="w-5 h-3.5" />
                            <span className="font-semibold text-xs">{sourceCountry?.name}</span>
                            <span className="text-xs opacity-50 mx-0.5">&harr;</span>
                            <FlagIcon code={flow.partnerCode} size="w-5 h-3.5" />
                            <span className="font-semibold text-xs">{partnerCountry?.name || flow.partner}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className="flex justify-between"><span className="opacity-60">Exports</span><span className="font-medium text-blue-500">${flow.exports}B</span></div>
                            <div className="flex justify-between"><span className="opacity-60">Imports</span><span className="font-medium text-red-500">${flow.imports}B</span></div>
                            <div className="flex justify-between"><span className="opacity-60">Balance</span><span className={`font-medium ${flow.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{flow.balance >= 0 ? '+' : ''}{flow.balance}B</span></div>
                            <div className="flex justify-between"><span className="opacity-60">Volume</span><span className="font-medium">${flow.volume}B</span></div>
                          </div>
                          <div className="text-[10px] opacity-40 mt-1.5 text-center">Click for details</div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Color Legend */}
                  <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={tc.textSec}>
                        {(mapMetric === 'tradeBalance' || mapMetric === 'exportGrowth') ? 'Deficit' : 'Low'}
                      </span>
                      <div className="flex-1 mx-3 h-3 rounded-full overflow-hidden flex">
                        {(mapMetric === 'tradeBalance' || mapMetric === 'exportGrowth') ? (
                          <>
                            <div className="flex-1" style={{ background: 'linear-gradient(to right, #ef4444, #fecaca, #d1fae5, #10b981)' }} />
                          </>
                        ) : (
                          <div className="flex-1" style={{ background: 'linear-gradient(to right, #dbeafe, #3b82f6, #1e3a8a)' }} />
                        )}
                      </div>
                      <span className={tc.textSec}>
                        {(mapMetric === 'tradeBalance' || mapMetric === 'exportGrowth') ? 'Surplus' : 'High'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={tc.textSec}>{MAP_METRICS.find(m => m.id === mapMetric)?.label}</span>
                      {mapStyle === 'bubble' && <span className={tc.textSec}>Circle size = metric value</span>}
                      {detailCountry && (
                        <span className={tc.textSec}>
                          <span className="inline-block w-3 h-0.5 bg-green-500 mr-1 align-middle" /> Surplus
                          <span className="inline-block w-3 h-0.5 bg-red-500 ml-2 mr-1 align-middle" /> Deficit
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Flow Detail Card */}
                {selectedFlow !== null && tradeFlows[selectedFlow] && detailCountryData && (() => {
                  const flow = tradeFlows[selectedFlow];
                  const sourceData = detailCountryData;
                  const partnerData = combinedTradeData.countries.find(c => c.code === flow.partnerCode);
                  const sourceTotalTrade = sourceData.totalExports + sourceData.totalImports;
                  const tradeSharePct = sourceTotalTrade > 0 ? ((flow.volume / sourceTotalTrade) * 100).toFixed(1) : '0.0';

                  const sharedBlocs = Object.values(tradeBlocs).filter(bloc =>
                    bloc.members.some(m => m.code === detailCountry) &&
                    bloc.members.some(m => m.code === flow.partnerCode)
                  );

                  const relevantDisputes = tariffData.currentDisputes.filter(d => {
                    const title = d.title.toLowerCase();
                    const srcName = sourceData.name.toLowerCase();
                    const partnerName = (partnerData?.name || flow.partner).toLowerCase();
                    return (title.includes(srcName) || title.includes(srcName.split(' ')[0])) &&
                           (title.includes(partnerName) || title.includes(partnerName.split(' ')[0]));
                  });

                  const srcTariff = countryTariffs[sourceData.code];
                  const partTariff = partnerData ? countryTariffs[partnerData.code] : undefined;

                  return (
                    <div className={`rounded-xl border p-5 ${tc.card}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <FlagIcon code={sourceData.code} size="w-7 h-5" />
                            <span className={`font-bold ${tc.text}`}>{sourceData.name}</span>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${flow.balance >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {flow.balance >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {flow.balance >= 0 ? 'Surplus' : 'Deficit'}
                          </div>
                          <div className="flex items-center gap-2">
                            <FlagIcon code={flow.partnerCode} size="w-7 h-5" />
                            <span className={`font-bold ${tc.text}`}>{partnerData?.name || flow.partner}</span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedFlow(null)} className={`p-1.5 rounded-lg ${tc.inactiveBg}`}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Exports', value: `$${flow.exports}B`, color: 'text-blue-500' },
                          { label: 'Imports', value: `$${flow.imports}B`, color: 'text-red-500' },
                          { label: 'Balance', value: `${flow.balance >= 0 ? '+' : ''}$${flow.balance}B`, color: flow.balance >= 0 ? 'text-green-500' : 'text-red-500' },
                          { label: 'Total Volume', value: `$${flow.volume}B`, color: 'text-purple-500' },
                        ].map((s, idx) => (
                          <div key={idx} className={`rounded-lg p-3 text-center ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`text-xs ${tc.textSec}`}>{s.label}</div>
                            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className={`rounded-lg p-3 mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium uppercase ${tc.textSec}`}>Trade Share</span>
                          <span className={`text-sm font-bold ${tc.text}`}>{tradeSharePct}%</span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(Number(tradeSharePct), 100)}%` }} />
                        </div>
                        <div className={`text-xs mt-1 ${tc.textSec}`}>
                          {partnerData?.name || flow.partner} accounts for {tradeSharePct}% of {sourceData.name}&apos;s total trade
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sharedBlocs.length > 0 && (
                          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Shared Trade Blocs</h4>
                            <div className="flex flex-wrap gap-2">
                              {sharedBlocs.map(bloc => (
                                <div key={bloc.acronym} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${tc.tagBg}`}>
                                  <Globe className="w-3 h-3 text-blue-500" />
                                  <span className={`font-medium ${tc.text}`}>{bloc.acronym}</span>
                                  <span className={tc.textSec}>({bloc.type})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(srcTariff || partTariff) && (
                          <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Tariff Rates</h4>
                            <div className="space-y-1.5">
                              {srcTariff && (
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <FlagIcon code={sourceData.code} size="w-4 h-3" />
                                    <span className={tc.text}>{sourceData.name}</span>
                                  </div>
                                  <span className={`font-medium ${tc.text}`}>{srcTariff.averageTariff}% avg</span>
                                </div>
                              )}
                              {partTariff && partnerData && (
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <FlagIcon code={partnerData.code} size="w-4 h-3" />
                                    <span className={tc.text}>{partnerData.name}</span>
                                  </div>
                                  <span className={`font-medium ${tc.text}`}>{partTariff.averageTariff}% avg</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {relevantDisputes.length > 0 && (
                        <div className={`rounded-lg p-3 mt-4 ${isDarkMode ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
                          <h4 className={`text-xs font-medium uppercase mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Active Trade Disputes</h4>
                          {relevantDisputes.map(d => (
                            <div key={d.id} className="mb-2 last:mb-0">
                              <div className={`text-sm font-medium ${tc.text}`}>{d.title}</div>
                              <div className={`text-xs ${tc.textSec}`}>{d.description}</div>
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className={tc.textSec}>Status: <span className={d.status === 'Ongoing' ? 'text-amber-500' : 'text-green-500'}>{d.status}</span></span>
                                <span className={tc.textSec}>Since {d.startDate.split('-')[0]}</span>
                                <span className={tc.textSec}>Impact: {d.impact.globalTrade}% global trade</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Trade Flow Info Section */}
                {detailCountry && detailCountryData && tradeFlows.length > 0 && (
                  <div className={`rounded-xl border p-4 ${tc.card}`}>
                    <h3 className={`font-semibold mb-3 ${tc.text}`}>
                      Trade Flows: {detailCountryData.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
                      {tradeFlows.slice(0, 5).map((flow) => {
                        const partnerCountry = combinedTradeData.countries.find(c => c.code === flow.partnerCode);
                        return (
                          <div
                            key={flow.partnerCode}
                            className={`rounded-lg p-3 cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => {
                              setDetailCountry(flow.partnerCode);
                              if (partnerCountry) setSelectedCountry(partnerCountry);
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <FlagIcon code={flow.partnerCode} size="w-5 h-3.5" />
                              <span className={`text-sm font-medium truncate ${tc.text}`}>
                                {partnerCountry?.name || flow.partner}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div>
                                <span className={tc.textSec}>Exp</span>
                                <div className="font-medium text-blue-500">${flow.exports}B</div>
                              </div>
                              <div>
                                <span className={tc.textSec}>Imp</span>
                                <div className="font-medium text-red-500">${flow.imports}B</div>
                              </div>
                            </div>
                            <div className={`text-xs mt-1 font-medium ${flow.balance >= 0 ? tc.positive : tc.negative}`}>
                              {flow.balance >= 0 ? '+' : ''}{flow.balance}B
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Trade Bloc Badges */}
                    {(() => {
                      const memberBlocs = Object.values(tradeBlocs).filter(bloc =>
                        bloc.members.some(m => m.code === detailCountry)
                      );
                      if (memberBlocs.length === 0) return null;
                      return (
                        <div>
                          <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Trade Bloc Membership</h4>
                          <div className="flex flex-wrap gap-2">
                            {memberBlocs.map(bloc => (
                              <span key={bloc.acronym} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${tc.tagBg} ${tc.text}`}>
                                <Globe className="w-3.5 h-3.5 text-blue-500" />
                                {bloc.acronym}
                                <span className={`text-xs ${tc.textSec}`}>({bloc.type})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================== DETAIL PANEL ==================== */}
          {detailCountryData && (
            <div ref={panelRef} className={`w-full lg:w-96 flex-shrink-0 rounded-xl border p-5 ${tc.card} self-start lg:sticky lg:top-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FlagIcon code={detailCountryData.code} size="w-8 h-6" />
                  <div>
                    <h2 className={`font-bold text-lg ${tc.text}`}>{detailCountryData.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded ${tc.tagBg} ${tc.textSec}`}>{detailCountryData.region}</span>
                  </div>
                </div>
                <button onClick={() => setDetailCountry(null)} className={`p-1 rounded-lg ${tc.inactiveBg}`}><X className="w-4 h-4" /></button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Exports', value: formatNumber(detailCountryData.totalExports), color: 'text-blue-500' },
                  { label: 'Imports', value: formatNumber(detailCountryData.totalImports), color: 'text-red-500' },
                  { label: 'Balance', value: `${detailCountryData.tradeBalance > 0 ? '+' : ''}${formatNumber(detailCountryData.tradeBalance)}`, color: detailCountryData.tradeBalance >= 0 ? 'text-green-500' : 'text-red-500' },
                  { label: 'Intensity', value: formatPct(detailCountryData.tradeIntensity), color: 'text-purple-500' },
                ].map((s, i) => (
                  <div key={i} className={`rounded-lg p-2.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className={`text-xs ${tc.textSec}`}>{s.label}</div>
                    <div className={`font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Growth */}
              <div className={`flex gap-4 mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-1.5">
                  {detailCountryData.exportGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  <span className={`text-xs ${tc.textSec}`}>Export Growth</span>
                  <span className={`text-sm font-bold ${detailCountryData.exportGrowth >= 0 ? tc.positive : tc.negative}`}>{detailCountryData.exportGrowth > 0 ? '+' : ''}{formatPct(detailCountryData.exportGrowth)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {detailCountryData.importGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  <span className={`text-xs ${tc.textSec}`}>Import Growth</span>
                  <span className={`text-sm font-bold ${detailCountryData.importGrowth >= 0 ? tc.positive : tc.negative}`}>{detailCountryData.importGrowth > 0 ? '+' : ''}{formatPct(detailCountryData.importGrowth)}</span>
                </div>
              </div>

              {/* Partners */}
              <div className="mb-4">
                <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Top Partners</h4>
                <div className="space-y-2">
                  {detailCountryData.tradePartners.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-sm ${tc.text}`}>{p.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(p.share * 2, 100)}%` }} />
                        </div>
                        <span className={`text-xs w-10 text-right ${tc.textSec}`}>{p.share}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Exports/Imports */}
              <div className="mb-4">
                <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Top Exports</h4>
                <div className="flex flex-wrap gap-1 mb-3">
                  {detailCountryData.topExports.map((e: string, i: number) => (
                    <span key={i} className={`px-2 py-0.5 rounded text-xs ${tc.tagBg} ${tc.text}`}>{e}</span>
                  ))}
                </div>
                <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Top Imports</h4>
                <div className="flex flex-wrap gap-1">
                  {detailCountryData.topImports.map((e: string, i: number) => (
                    <span key={i} className={`px-2 py-0.5 rounded text-xs ${tc.tagBg} ${tc.text}`}>{e}</span>
                  ))}
                </div>
              </div>

              {/* Tariff Info */}
              {countryTariffs[detailCountryData.code] && (
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Tariff Info</h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={tc.textSec}>Avg. Tariff Rate</span>
                    <span className={`font-medium ${tc.text}`}>{countryTariffs[detailCountryData.code].averageTariff}%</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={tc.textSec}>Active Tariffs</span>
                    <span className={`font-medium ${tc.text}`}>{countryTariffs[detailCountryData.code].appliedTariffs.filter(t => t.status === 'Active').length}</span>
                  </div>
                  {countryTariffs[detailCountryData.code].tradeDisputes.length > 0 && (
                    <div className="mt-2">
                      <span className={`text-xs ${tc.textSec}`}>Disputes: </span>
                      {countryTariffs[detailCountryData.code].tradeDisputes.map((d, i) => (
                        <span key={i} className="text-xs text-amber-500">{d}{i < countryTariffs[detailCountryData.code].tradeDisputes.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Summary */}
              {advancedTradeMetrics.economicComplexity[detailCountryData.code] && (
                <div className={`rounded-lg p-3 mt-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-xs font-medium uppercase mb-2 ${tc.textSec}`}>Advanced Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className={tc.textSec}>ECI Rank</span><div className={`font-medium ${tc.text}`}>#{advancedTradeMetrics.economicComplexity[detailCountryData.code].rank}</div></div>
                    <div><span className={tc.textSec}>Logistics</span><div className={`font-medium ${tc.text}`}>{advancedTradeMetrics.tradeInfrastructure[detailCountryData.code]?.logisticsIndex}</div></div>
                    <div><span className={tc.textSec}>Partners</span><div className={`font-medium ${tc.text}`}>{advancedTradeMetrics.tradeConnectivity[detailCountryData.code]?.partners}</div></div>
                    <div><span className={tc.textSec}>Market Share</span><div className={`font-medium ${tc.text}`}>{advancedTradeMetrics.tradePerformance[detailCountryData.code]?.marketShare}%</div></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll to top */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TradingPlacesPage;
