"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchGlobalData } from '../services/worldbank';
import { useLocalStorage } from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { GB, US, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';
import BulkChartDownload from '../components/BulkChartDownload';
import ChartDownloadButton from '../components/ChartDownloadButton';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';

const countryColors = {
  USA: "#8884d8", Canada: "#82ca9d", France: "#ffc658", Germany: "#ff8042", Italy: "#a4de6c", 
  Japan: "#d0ed57", UK: "#83a6ed", Australia: "#ff7300", Mexico: "#e60049", SouthKorea: "#0bb4ff", 
  Spain: "#50e991", Sweden: "#e6d800", Switzerland: "#9b19f5", Turkey: "#dc0ab4", Nigeria: "#00bfa0",
  China: "#b3d4ff", Russia: "#fd7f6f", Brazil: "#7eb0d5", Chile: "#b2e061", Argentina: "#bd7ebe",
  India: "#ff9ff3", Norway: "#45aaf2", Netherlands: "#ff6b35", Portugal: "#004e89", Belgium: "#f7b801",
  Indonesia: "#06a77d", SouthAfrica: "#d62246", Poland: "#c1292e", SaudiArabia: "#006c35", Egypt: "#c09000"
};

const countryFlags: { [key: string]: React.ComponentType<any> } = {
  UK: GB, USA: US, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG
};

// Essential goods price data (2011-2024)
const essentialGoodsData = [
  { year: 2011, milk: 0.97, bread: 1.15, eggs: 2.53, water: 1.15, domesticBeer: 1.70, importedBeer: 1.93 },
  { year: 2012, milk: 0.98, bread: 1.04, eggs: 2.21, water: 1.08, domesticBeer: 1.49, importedBeer: 1.54 },
  { year: 2013, milk: 0.94, bread: 0.99, eggs: 2.36, water: 0.99, domesticBeer: 1.72, importedBeer: 1.70 },
  { year: 2014, milk: 0.96, bread: 1.10, eggs: 2.42, water: 0.90, domesticBeer: 1.28, importedBeer: 1.45 },
  { year: 2015, milk: 0.92, bread: 0.99, eggs: 2.28, water: 0.96, domesticBeer: 1.25, importedBeer: 1.56 },
  { year: 2016, milk: 0.91, bread: 1.05, eggs: 2.22, water: 0.91, domesticBeer: 1.66, importedBeer: 1.71 },
  { year: 2017, milk: 0.94, bread: 1.09, eggs: 2.24, water: 1.00, domesticBeer: 1.84, importedBeer: 2.06 },
  { year: 2018, milk: 0.93, bread: 1.14, eggs: 2.21, water: 1.02, domesticBeer: 1.67, importedBeer: 2.21 },
  { year: 2019, milk: 0.99, bread: 1.12, eggs: 2.12, water: 0.78, domesticBeer: 1.80, importedBeer: 1.69 },
  { year: 2020, milk: 0.94, bread: 1.00, eggs: 2.15, water: 0.90, domesticBeer: 1.77, importedBeer: 2.13 },
  { year: 2021, milk: 0.93, bread: 1.08, eggs: 2.21, water: 0.98, domesticBeer: 1.88, importedBeer: 2.26 },
  { year: 2022, milk: 1.08, bread: 1.17, eggs: 2.41, water: 1.14, domesticBeer: 1.99, importedBeer: 2.37 },
  { year: 2023, milk: 1.32, bread: 1.50, eggs: 3.45, water: 1.22, domesticBeer: 1.89, importedBeer: 2.41 },
  { year: 2024, milk: 1.32, bread: 1.53, eggs: 3.39, water: 1.26, domesticBeer: 2.21, importedBeer: 2.64 },
];

// List of goods and their display names/colors
const goodsList = [
  { key: 'milk', label: 'Milk (1L)', color: '#2563eb' },
  { key: 'bread', label: 'Bread (500g)', color: '#f59e42' },
  { key: 'eggs', label: 'Eggs (12)', color: '#e11d48' },
  { key: 'water', label: 'Water (1.5L)', color: '#10b981' },
  { key: 'domesticBeer', label: 'Domestic Beer (0.5L)', color: '#a21caf' },
  { key: 'importedBeer', label: 'Imported Beer (0.33L)', color: '#fbbf24' },
];

// Fruit & Vegetable price data (2011-2024)
const produceData = [
  { year: 2011, apples: 1.57, oranges: 1.57, potato: 1.30, lettuce: 1.00, rice: null, tomato: null, banana: null, onion: null },
  { year: 2012, apples: 1.81, oranges: 1.64, potato: 1.15, lettuce: 0.91, rice: 1.74, tomato: 2.40, banana: null, onion: null },
  { year: 2013, apples: 2.19, oranges: 1.93, potato: 1.44, lettuce: 0.94, rice: 1.45, tomato: 2.14, banana: 1.24, onion: 1.10 },
  { year: 2014, apples: 1.97, oranges: 2.15, potato: 1.46, lettuce: 1.02, rice: 1.75, tomato: 2.06, banana: null, onion: 1.11 },
  { year: 2015, apples: 1.92, oranges: 2.00, potato: 1.23, lettuce: 0.78, rice: 1.56, tomato: 1.91, banana: 1.15, onion: 1.11 },
  { year: 2016, apples: 2.04, oranges: 2.01, potato: 1.23, lettuce: 0.74, rice: 1.45, tomato: 2.04, banana: 1.05, onion: 1.13 },
  { year: 2017, apples: 1.95, oranges: 1.87, potato: 1.47, lettuce: 0.88, rice: 1.41, tomato: 2.27, banana: 1.14, onion: 1.22 },
  { year: 2018, apples: 2.38, oranges: 2.43, potato: 1.26, lettuce: 0.79, rice: 1.82, tomato: 2.47, banana: 1.11, onion: 1.16 },
  { year: 2019, apples: 1.96, oranges: 2.00, potato: 1.29, lettuce: 0.76, rice: 1.33, tomato: 2.57, banana: 1.20, onion: 1.11 },
  { year: 2020, apples: 2.05, oranges: 1.92, potato: 1.17, lettuce: 0.81, rice: 1.45, tomato: 2.47, banana: 1.12, onion: 1.15 },
  { year: 2021, apples: 2.10, oranges: 1.80, potato: 1.04, lettuce: 0.75, rice: 1.61, tomato: 2.17, banana: 1.07, onion: 1.08 },
  { year: 2022, apples: 2.12, oranges: 1.96, potato: 1.13, lettuce: 0.81, rice: 1.82, tomato: 2.52, banana: 1.24, onion: 1.10 },
  { year: 2023, apples: 2.36, oranges: 2.57, potato: 1.19, lettuce: 0.91, rice: 2.30, tomato: 3.18, banana: 1.26, onion: 1.16 },
  { year: 2024, apples: 2.52, oranges: 2.47, potato: 1.23, lettuce: 0.97, rice: 2.00, tomato: 2.87, banana: 1.31, onion: 1.22 },
];

const produceList = [
  { key: 'apples', label: 'Apples (1kg)', color: '#f87171' },
  { key: 'oranges', label: 'Oranges (1kg)', color: '#fbbf24' },
  { key: 'potato', label: 'Potato (1kg)', color: '#a3e635' },
  { key: 'lettuce', label: 'Lettuce (1 head)', color: '#34d399' },
  { key: 'rice', label: 'Rice (1kg)', color: '#60a5fa' },
  { key: 'tomato', label: 'Tomato (1kg)', color: '#f43f5e' },
  { key: 'banana', label: 'Banana (1kg)', color: '#fde68a' },
  { key: 'onion', label: 'Onion (1kg)', color: '#a78bfa' },
];

// Cheese, Wine, Cigarettes, Chicken, Beef price data (2011-2024)
const proteinData = [
  { year: 2011, cheese: 10.68, wine: 6.44, cigarettes: 6.67, chicken: 7.50, beef: 7.50 },
  { year: 2012, cheese: 6.80, wine: 7.09, cigarettes: 7.41, chicken: 7.20, beef: 7.50 },
  { year: 2013, cheese: 7.49, wine: 7.49, cigarettes: 8.09, chicken: 7.50, beef: null },
  { year: 2014, cheese: 7.17, wine: 7.51, cigarettes: 8.34, chicken: 8.17, beef: null },
  { year: 2015, cheese: 6.70, wine: 7.60, cigarettes: 8.87, chicken: 7.31, beef: 10.49 },
  { year: 2016, cheese: 6.28, wine: 8.19, cigarettes: 9.49, chicken: 6.82, beef: 9.24 },
  { year: 2017, cheese: 5.97, wine: 8.07, cigarettes: 10.79, chicken: 6.79, beef: 8.62 },
  { year: 2018, cheese: 7.71, wine: 8.73, cigarettes: 11.23, chicken: 6.94, beef: 9.50 },
  { year: 2019, cheese: 7.04, wine: 8.67, cigarettes: 11.18, chicken: 6.12, beef: 9.02 },
  { year: 2020, cheese: 6.83, wine: 8.48, cigarettes: 12.20, chicken: 6.23, beef: 9.24 },
  { year: 2021, cheese: 6.06, wine: 7.87, cigarettes: 12.51, chicken: 5.79, beef: 11.47 },
  { year: 2022, cheese: 6.45, wine: 9.32, cigarettes: 13.11, chicken: 6.24, beef: 10.09 },
  { year: 2023, cheese: 7.58, wine: 9.53, cigarettes: 14.29, chicken: 7.58, beef: 12.12 },
  { year: 2024, cheese: 8.46, wine: 10.19, cigarettes: 16.16, chicken: 7.03, beef: 10.69 },
];

const proteinList = [
  { key: 'localCheese', label: 'Local Cheese (1kg)', color: '#fbbf24' },
  { key: 'wine', label: 'Bottle of Wine (Mid-Range)', color: '#6366f1' },
  { key: 'cigarettes', label: 'Cigarettes 20 Pack (Marlboro)', color: '#ef4444' },
  { key: 'chickenFillets', label: 'Chicken Fillets (1kg)', color: '#10b981' },
  { key: 'beefRound', label: 'Beef Round (1kg)', color: '#a21caf' },
];

// Apartment rental price data (2011-2024)
const rentData = [
  { year: 2011, apt1city: 1476.00, apt1out: 998.75, apt3city: 2656.25, apt3out: 1766.67 },
  { year: 2012, apt1city: 1454.33, apt1out: 916.36, apt3city: 2842.86, apt3out: 1567.73 },
  { year: 2013, apt1city: 1563.50, apt1out: 953.40, apt3city: 2748.81, apt3out: 1740.93 },
  { year: 2014, apt1city: 1567.31, apt1out: 1034.90, apt3city: 3257.26, apt3out: 1810.29 },
  { year: 2015, apt1city: 1702.35, apt1out: 1176.72, apt3city: 3477.46, apt3out: 2010.63 },
  { year: 2016, apt1city: 1703.45, apt1out: 1168.70, apt3city: 3241.66, apt3out: 1969.14 },
  { year: 2017, apt1city: 1688.81, apt1out: 1206.56, apt3city: 3220.83, apt3out: 2008.37 },
  { year: 2018, apt1city: 1710.13, apt1out: 1232.41, apt3city: 3241.99, apt3out: 2074.23 },
  { year: 2019, apt1city: 1760.07, apt1out: 1230.68, apt3city: 3290.00, apt3out: 2070.33 },
  { year: 2020, apt1city: 1731.00, apt1out: 1262.39, apt3city: 3181.75, apt3out: 2073.45 },
  { year: 2021, apt1city: 1711.85, apt1out: 1276.00, apt3city: 3428.57, apt3out: 2145.33 },
  { year: 2022, apt1city: 1873.18, apt1out: 1361.47, apt3city: 3300.36, apt3out: 2310.88 },
  { year: 2023, apt1city: 2160.76, apt1out: 1533.52, apt3city: 4250.91, apt3out: 2628.04 },
  { year: 2024, apt1city: 2151.79, apt1out: 1602.77, apt3city: 4255.32, apt3out: 2809.82 },
];

const rentList = [
  { key: 'apt1city', label: 'Apartment (1 bed) City Centre', color: '#6366f1' },
  { key: 'apt1out', label: 'Apartment (1 bed) Outside Centre', color: '#f59e42' },
  { key: 'apt3city', label: 'Apartment (3 bed) City Centre', color: '#10b981' },
  { key: 'apt3out', label: 'Apartment (3 bed) Outside Centre', color: '#ef4444' },
];

// Buy Apartment Price data (2011-2024)
const buyAptData = [
  { year: 2011, city: 8000.00, out: 4116.50 },
  { year: 2012, city: 8875.00, out: 4834.89 },
  { year: 2013, city: 9609.07, out: 5073.50 },
  { year: 2014, city: 18802.78, out: 9028.11 },
  { year: 2015, city: 15956.57, out: 8186.49 },
  { year: 2016, city: 13175.60, out: 6872.47 },
  { year: 2017, city: 13884.30, out: 7864.82 },
  { year: 2018, city: 12884.98, out: 7118.72 },
  { year: 2019, city: 11312.03, out: 5815.71 },
  { year: 2020, city: 12355.49, out: 5412.50 },
  { year: 2021, city: 11727.71, out: 7348.22 },
  { year: 2022, city: 16096.77, out: 7994.14 },
  { year: 2023, city: 16133.03, out: 8838.36 },
  { year: 2024, city: 16133.03, out: 8838.36 },
];

const buyAptList = [
  { key: 'city', label: 'City Centre', color: '#6366f1' },
  { key: 'out', label: 'Outside Centre', color: '#f59e42' },
];

// Average Monthly Net Salary data (2011-2024)
const salaryData = [
  { year: 2011, salary: 2210.09 },
  { year: 2012, salary: 2114.29 },
  { year: 2013, salary: 2250.30 },
  { year: 2014, salary: 1965.51 },
  { year: 2015, salary: 2074.89 },
  { year: 2016, salary: 2160.82 },
  { year: 2017, salary: 2330.27 },
  { year: 2018, salary: 2582.82 },
  { year: 2019, salary: 2387.61 },
  { year: 2020, salary: 2821.32 },
  { year: 2021, salary: 3148.59 },
  { year: 2022, salary: 2921.14 },
  { year: 2023, salary: 3202.25 },
  { year: 2024, salary: 3467.55 },
];

const salaryList = [
  { key: 'salary', label: 'Average Monthly Net Salary (After Tax)', color: '#6366f1' },
];

// Utilities (Monthly) data (2011-2024)
const utilitiesData = [
  { year: 2011, basic: 172.86, internet: 21.25, mobile: null },
  { year: 2012, basic: 182.89, internet: 19.96, mobile: null },
  { year: 2013, basic: 148.78, internet: 19.59, mobile: null },
  { year: 2014, basic: 155.92, internet: 20.62, mobile: null },
  { year: 2015, basic: 151.28, internet: 22.76, mobile: null },
  { year: 2016, basic: 157.79, internet: 25.80, mobile: null },
  { year: 2017, basic: 146.50, internet: 27.41, mobile: null },
  { year: 2018, basic: 157.89, internet: 33.02, mobile: null },
  { year: 2019, basic: 171.72, internet: 32.03, mobile: null },
  { year: 2020, basic: 175.79, internet: 31.27, mobile: null },
  { year: 2021, basic: 197.00, internet: 31.85, mobile: null },
  { year: 2022, basic: 252.99, internet: 28.94, mobile: null },
  { year: 2023, basic: 317.14, internet: 32.46, mobile: 14.48 },
  { year: 2024, basic: 250.23, internet: 31.61, mobile: 15.14 },
];

const utilitiesList = [
  { key: 'basic', label: 'Basic (Electricity, Heating, Cooling, Water, Garbage)', color: '#6366f1' },
  { key: 'internet', label: 'Internet (60 Mbps+)', color: '#10b981' },
  { key: 'mobile', label: 'Mobile Phone (10GB+ Data)', color: '#f59e42' },
];

// Sports and Leisure data (2011-2024)
const sportsLeisureData = [
  { year: 2011, fitness: 60.00, tennis: 11.50, cinema: 10.61 },
  { year: 2012, fitness: 54.29, tennis: 9.25, cinema: 10.46 },
  { year: 2013, fitness: 54.54, tennis: 9.50, cinema: 11.21 },
  { year: 2014, fitness: 53.85, tennis: 10.90, cinema: 11.74 },
  { year: 2015, fitness: 48.38, tennis: 12.76, cinema: 12.10 },
  { year: 2016, fitness: 49.97, tennis: 12.27, cinema: 12.53 },
  { year: 2017, fitness: 49.36, tennis: 11.75, cinema: 12.61 },
  { year: 2018, fitness: 47.38, tennis: 11.54, cinema: 13.13 },
  { year: 2019, fitness: 42.51, tennis: 12.40, cinema: 13.00 },
  { year: 2020, fitness: 42.85, tennis: 11.19, cinema: 12.72 },
  { year: 2021, fitness: 44.56, tennis: 11.04, cinema: 13.57 },
  { year: 2022, fitness: 43.83, tennis: 12.30, cinema: 12.54 },
  { year: 2023, fitness: 51.69, tennis: 15.05, cinema: 13.90 },
  { year: 2024, fitness: 48.70, tennis: 13.82, cinema: 13.72 },
];

const sportsLeisureList = [
  { key: 'fitness', label: 'Fitness Club (Monthly Fee)', color: '#6366f1' },
  { key: 'tennis', label: 'Tennis Court Rent (1hr Weekend)', color: '#10b981' },
  { key: 'cinema', label: 'Cinema (1 Seat, Intl Release)', color: '#f59e42' },
];

// Clothing and Shoes data (2011-2024)
const clothingShoesData = [
  { year: 2011, jeans: 58.57, dress: 32.50, nike: 63.75, leather: 73.33 },
  { year: 2012, jeans: 64.40, dress: 36.67, nike: 61.47, leather: 73.61 },
  { year: 2013, jeans: 61.50, dress: 31.59, nike: 66.97, leather: 69.77 },
  { year: 2014, jeans: 64.00, dress: 33.10, nike: 69.76, leather: 77.00 },
  { year: 2015, jeans: 63.45, dress: 33.54, nike: 62.28, leather: 74.00 },
  { year: 2016, jeans: 64.30, dress: 32.78, nike: 67.79, leather: 81.91 },
  { year: 2017, jeans: 65.87, dress: 32.60, nike: 68.00, leather: 84.21 },
  { year: 2018, jeans: 63.66, dress: 31.97, nike: 70.46, leather: 83.15 },
  { year: 2019, jeans: 67.92, dress: 32.75, nike: 69.45, leather: 81.27 },
  { year: 2020, jeans: 67.17, dress: 33.17, nike: 72.24, leather: 94.00 },
  { year: 2021, jeans: 56.86, dress: 32.05, nike: 73.79, leather: 87.50 },
  { year: 2022, jeans: 73.66, dress: 33.17, nike: 74.81, leather: 91.26 },
  { year: 2023, jeans: 82.11, dress: 38.24, nike: 85.45, leather: 99.70 },
  { year: 2024, jeans: 78.95, dress: 38.47, nike: 88.00, leather: 116.29 },
];

const clothingShoesList = [
  { key: 'jeans', label: '1 Pair of Jeans (Levis 501 or Similar)', color: '#6366f1' },
  { key: 'dress', label: '1 Summer Dress (Chain Store)', color: '#10b981' },
  { key: 'nike', label: '1 Pair of Nike Running Shoes', color: '#f59e42' },
  { key: 'leather', label: '1 Pair of Men Leather Business Shoes', color: '#ef4444' },
];

// Transportation data (2011-2024)
const transportationData = [
  { year: 2011, ticket: 3.19, gasoline: 1.36 },
  { year: 2012, ticket: 3.05, gasoline: 1.40 },
  { year: 2013, ticket: 3.15, gasoline: 1.40 },
  { year: 2014, ticket: 2.78, gasoline: 1.33 },
  { year: 2015, ticket: 2.68, gasoline: 1.14 },
  { year: 2016, ticket: 2.72, gasoline: 1.12 },
  { year: 2017, ticket: 2.68, gasoline: 1.20 },
  { year: 2018, ticket: 2.56, gasoline: 1.28 },
  { year: 2019, ticket: 2.68, gasoline: 1.30 },
  { year: 2020, ticket: 2.85, gasoline: 1.24 },
  { year: 2021, ticket: 2.63, gasoline: 1.38 },
  { year: 2022, ticket: 2.62, gasoline: 1.71 },
  { year: 2023, ticket: 2.94, gasoline: 1.52 },
  { year: 2024, ticket: 2.77, gasoline: 1.48 },
];

const transportationList = [
  { key: 'ticket', label: 'One-way Ticket (Local Transport)', color: '#6366f1' },
  { key: 'gasoline', label: 'Gasoline (1 liter)', color: '#10b981' },
];

const restaurantList = [
  { key: 'inexpensive', label: 'Meal, Inexpensive Restaurant', color: '#6366f1' },
  { key: 'midrange', label: 'Meal for 2 People, Mid-range Restaurant, Three-course', color: '#10b981' },
  { key: 'mcdonalds', label: 'McMeal at McDonalds (or Equivalent Combo Meal)', color: '#f59e42' },
];

const beveragesList = [
  { key: 'domesticBeer', label: 'Domestic Beer (0.5 liter draught)', color: '#6366f1' },
  { key: 'importedBeer', label: 'Imported Beer (0.33 liter bottle)', color: '#10b981' },
  { key: 'coke', label: 'Coke/Pepsi (0.33 liter bottle)', color: '#f59e42' },
  { key: 'water', label: 'Water (0.33 liter bottle)', color: '#8b5cf6' },
  { key: 'cappuccino', label: 'Cappuccino (regular)', color: '#ef4444' },
];

// Paris Essential Goods price data (2011-2024)
const parisEssentialGoodsData = [
  { year: 2011, milk: 1.20, bread: 1.37, eggs: 3.40, water: 0.80, domesticBeer: 2.01, importedBeer: 2.31 },
  { year: 2012, milk: 1.23, bread: 1.87, eggs: 3.04, water: 1.41, domesticBeer: 1.33, importedBeer: 1.33 },
  { year: 2013, milk: 1.22, bread: 1.51, eggs: 3.21, water: 1.14, domesticBeer: 1.72, importedBeer: 2.22 },
  { year: 2014, milk: 1.02, bread: 1.65, eggs: 3.23, water: 0.86, domesticBeer: 1.50, importedBeer: 1.47 },
  { year: 2015, milk: 1.03, bread: 1.51, eggs: 3.14, water: 0.80, domesticBeer: 1.81, importedBeer: 1.47 },
  { year: 2016, milk: 1.15, bread: 1.36, eggs: 3.36, water: 0.80, domesticBeer: 1.80, importedBeer: 1.98 },
  { year: 2017, milk: 1.19, bread: 1.69, eggs: 3.17, water: 0.84, domesticBeer: 1.91, importedBeer: 2.57 },
  { year: 2018, milk: 1.14, bread: 1.57, eggs: 3.42, water: 0.93, domesticBeer: 1.56, importedBeer: 2.18 },
  { year: 2019, milk: 1.29, bread: 1.73, eggs: 3.51, water: 1.04, domesticBeer: 2.46, importedBeer: 2.44 },
  { year: 2020, milk: 1.08, bread: 1.80, eggs: 3.81, water: 0.79, domesticBeer: 1.86, importedBeer: 2.30 },
  { year: 2021, milk: 1.13, bread: 1.97, eggs: 3.67, water: 0.90, domesticBeer: 1.73, importedBeer: 2.52 },
  { year: 2022, milk: 1.19, bread: 1.94, eggs: 3.49, water: 0.76, domesticBeer: 2.32, importedBeer: 3.21 },
  { year: 2023, milk: 1.38, bread: 1.83, eggs: 4.24, water: 1.05, domesticBeer: 2.03, importedBeer: 3.17 },
  { year: 2024, milk: 1.33, bread: 1.95, eggs: 4.40, water: 0.74, domesticBeer: 2.40, importedBeer: 3.79 },
];

// New York Essential Goods price data (2011-2024)
const newYorkEssentialGoodsData = [
  { year: 2011, milk: 1.51, bread: 2.58, eggs: 3.56, water: 2.10, domesticBeer: 2.93, importedBeer: 3.62 },
  { year: 2012, milk: 1.26, bread: 3.04, eggs: 3.00, water: 2.17, domesticBeer: 2.38, importedBeer: 4.06 },
  { year: 2013, milk: 1.63, bread: 3.01, eggs: 3.19, water: 1.89, domesticBeer: 1.79, importedBeer: 2.33 },
  { year: 2014, milk: 1.45, bread: 2.68, eggs: 3.16, water: 2.06, domesticBeer: 1.88, importedBeer: 2.27 },
  { year: 2015, milk: 1.11, bread: 3.55, eggs: 3.57, water: 1.84, domesticBeer: 1.80, importedBeer: 2.71 },
  { year: 2016, milk: 1.13, bread: 3.70, eggs: 3.64, water: 2.24, domesticBeer: 2.55, importedBeer: 3.00 },
  { year: 2017, milk: 1.07, bread: 3.16, eggs: 3.13, water: 2.50, domesticBeer: 2.44, importedBeer: 2.94 },
  { year: 2018, milk: 1.18, bread: 4.00, eggs: 3.48, water: 2.45, domesticBeer: 2.21, importedBeer: 2.50 },
  { year: 2019, milk: 1.17, bread: 4.13, eggs: 4.02, water: 2.06, domesticBeer: null, importedBeer: 3.25 },
  { year: 2020, milk: 1.20, bread: 3.78, eggs: 3.35, water: 2.09, domesticBeer: 3.08, importedBeer: 2.92 },
  { year: 2021, milk: 1.18, bread: 3.98, eggs: 3.23, water: 2.46, domesticBeer: 3.14, importedBeer: 3.82 },
  { year: 2022, milk: 1.26, bread: 4.36, eggs: 4.18, water: 2.43, domesticBeer: 3.22, importedBeer: 4.25 },
  { year: 2023, milk: 1.39, bread: 4.61, eggs: 5.46, water: 2.41, domesticBeer: 2.60, importedBeer: 3.15 },
  { year: 2024, milk: 1.72, bread: 5.07, eggs: 5.41, water: 2.59, domesticBeer: 3.72, importedBeer: 4.50 },
];

// New York Produce (Fruit & Vegetable) price data (2011-2024)
const newYorkProduceData = [
  { year: 2011, apples: 4.72, oranges: 4.25, potato: 1.47, lettuce: 1.65, rice: null, tomato: null, banana: null, onion: null },
  { year: 2012, apples: 3.52, oranges: 3.54, potato: 1.64, lettuce: 2.26, rice: 2.10, tomato: 4.29, banana: null, onion: null },
  { year: 2013, apples: 4.77, oranges: 4.60, potato: 2.34, lettuce: 2.41, rice: 3.98, tomato: 5.22, banana: null, onion: null },
  { year: 2014, apples: 5.20, oranges: 5.46, potato: 2.62, lettuce: 2.09, rice: 3.47, tomato: 4.89, banana: null, onion: null },
  { year: 2015, apples: 5.32, oranges: 4.88, potato: 4.00, lettuce: 2.57, rice: 4.49, tomato: 5.78, banana: 2.06, onion: 4.16 },
  { year: 2016, apples: 5.68, oranges: 6.03, potato: 3.32, lettuce: 2.23, rice: 6.41, tomato: 5.19, banana: 2.64, onion: 3.25 },
  { year: 2017, apples: 6.57, oranges: 5.27, potato: 3.24, lettuce: 2.41, rice: 7.81, tomato: 5.36, banana: 2.69, onion: 2.99 },
  { year: 2018, apples: 6.56, oranges: 6.98, potato: 4.09, lettuce: 2.30, rice: 5.95, tomato: 5.99, banana: 2.02, onion: 3.40 },
  { year: 2019, apples: 6.38, oranges: 5.41, potato: 4.72, lettuce: 2.04, rice: 7.70, tomato: 6.55, banana: 3.32, onion: 3.66 },
  { year: 2020, apples: 6.03, oranges: 5.22, potato: 4.05, lettuce: 2.24, rice: 5.57, tomato: 5.54, banana: 2.74, onion: 4.00 },
  { year: 2021, apples: 5.69, oranges: 6.40, potato: 4.74, lettuce: 2.63, rice: 5.66, tomato: 6.10, banana: 2.86, onion: 3.70 },
  { year: 2022, apples: 5.93, oranges: 4.83, potato: 3.83, lettuce: 2.96, rice: 8.46, tomato: 6.79, banana: 2.22, onion: 4.00 },
  { year: 2023, apples: 6.91, oranges: 6.46, potato: 4.43, lettuce: 3.18, rice: 7.09, tomato: 5.94, banana: 2.12, onion: 3.69 },
  { year: 2024, apples: 7.62, oranges: 6.09, potato: 3.77, lettuce: 3.37, rice: 10.04, tomato: 6.62, banana: 3.08, onion: 4.14 },
];

// New York Protein (Cheese, Wine, Cigarettes, Chicken, Beef) price data (2011-2024)
const newYorkProteinData = [
  { year: 2011, cheese: 10.67, wine: 14.14, cigarettes: 11.16, chicken: 6.77, beef: null },
  { year: 2012, cheese: 11.03, wine: 15.50, cigarettes: 12.89, chicken: 7.17, beef: null },
  { year: 2013, cheese: 11.28, wine: 15.47, cigarettes: 12.08, chicken: 9.89, beef: null },
  { year: 2014, cheese: 14.82, wine: 16.64, cigarettes: 12.47, chicken: 10.39, beef: null },
  { year: 2015, cheese: 13.43, wine: 15.31, cigarettes: 13.18, chicken: 13.27, beef: 14.98 },
  { year: 2016, cheese: 12.57, wine: 16.23, cigarettes: 13.08, chicken: 11.42, beef: 13.98 },
  { year: 2017, cheese: 13.68, wine: 16.58, cigarettes: 13.29, chicken: 12.11, beef: 16.61 },
  { year: 2018, cheese: 14.64, wine: 16.41, cigarettes: 14.06, chicken: 13.73, beef: 15.19 },
  { year: 2019, cheese: 19.15, wine: 15.25, cigarettes: 15.00, chicken: 14.89, beef: 15.15 },
  { year: 2020, cheese: 14.78, wine: 16.21, cigarettes: 14.68, chicken: 13.64, beef: 16.60 },
  { year: 2021, cheese: 13.01, wine: 15.72, cigarettes: 14.88, chicken: 12.77, beef: 21.55 },
  { year: 2022, cheese: 20.06, wine: 19.19, cigarettes: 15.81, chicken: 18.23, beef: 19.08 },
  { year: 2023, cheese: 17.19, wine: 18.95, cigarettes: 16.21, chicken: 14.40, beef: 18.83 },
  { year: 2024, cheese: 19.32, wine: 17.37, cigarettes: 18.89, chicken: 16.69, beef: 22.73 },
];

// New York Rent price data (2011-2024)
const newYorkRentData = [
  { year: 2011, apt1city: 2448.83, apt1out: 1481.07, apt3city: 5711.11, apt3out: 2628.95 },
  { year: 2012, apt1city: 2762.50, apt1out: 1477.08, apt3city: 4937.50, apt3out: 2931.25 },
  { year: 2013, apt1city: 3091.71, apt1out: 1834.17, apt3city: 5102.08, apt3out: 3316.67 },
  { year: 2014, apt1city: 2890.89, apt1out: 1758.09, apt3city: 5912.57, apt3out: 3560.33 },
  { year: 2015, apt1city: 3077.37, apt1out: 1893.60, apt3city: 6298.06, apt3out: 3226.30 },
  { year: 2016, apt1city: 2915.70, apt1out: 1862.95, apt3city: 5937.94, apt3out: 3355.87 },
  { year: 2017, apt1city: 3167.98, apt1out: 1934.50, apt3city: 6121.39, apt3out: 3407.25 },
  { year: 2018, apt1city: 3210.13, apt1out: 2002.35, apt3city: 6388.55, apt3out: 3451.74 },
  { year: 2019, apt1city: 3195.02, apt1out: 2053.33, apt3city: 6240.81, apt3out: 3762.50 },
  { year: 2020, apt1city: 3388.16, apt1out: 2036.98, apt3city: 6776.98, apt3out: 3559.71 },
  { year: 2021, apt1city: 3072.94, apt1out: 2202.76, apt3city: 6848.00, apt3out: 4097.22 },
  { year: 2022, apt1city: 3666.69, apt1out: 2381.62, apt3city: 6861.26, apt3out: 4141.33 },
  { year: 2023, apt1city: 4007.19, apt1out: 2664.22, apt3city: 8123.12, apt3out: 4061.18 },
  { year: 2024, apt1city: 4045.80, apt1out: 2896.50, apt3city: 9061.76, apt3out: 5802.67 },
];

// New York Buy Apartment Price per Square Meter data (2011-2024)
const newYorkBuyAptData = [
  { year: 2011, city: 9687.52, out: 5274.32 },
  { year: 2012, city: 10763.91, out: 3470.38 },
  { year: 2013, city: null, out: null },
  { year: 2014, city: 10868.07, out: 7581.82 },
  { year: 2015, city: 19522.92, out: 10729.06 },
  { year: 2016, city: 13120.29, out: 8249.35 },
  { year: 2017, city: 13553.73, out: 6951.11 },
  { year: 2018, city: 15182.00, out: 6254.36 },
  { year: 2019, city: 14732.12, out: 7918.96 },
  { year: 2020, city: 16685.07, out: 8201.98 },
  { year: 2021, city: 13562.35, out: 8697.93 },
  { year: 2022, city: 16530.29, out: 10763.91 },
  { year: 2023, city: 16553.82, out: 12283.25 },
  { year: 2024, city: 18434.41, out: 12037.52 },
];

// New York Average Monthly Net Salary (After Tax) data (2011-2024)
const newYorkSalaryData = [
  { year: 2011, salary: 3727.58 },
  { year: 2012, salary: 4170.45 },
  { year: 2013, salary: 4418.58 },
  { year: 2014, salary: 3554.96 },
  { year: 2015, salary: 3472.74 },
  { year: 2016, salary: 4154.99 },
  { year: 2017, salary: 4196.42 },
  { year: 2018, salary: 4671.66 },
  { year: 2019, salary: 5132.31 },
  { year: 2020, salary: 6023.25 },
  { year: 2021, salary: 6118.18 },
  { year: 2022, salary: 5969.80 },
  { year: 2023, salary: 6329.33 },
  { year: 2024, salary: 5573.87 },
];

// New York Utilities (Monthly) data (2011-2024)
const newYorkUtilitiesData = [
  { year: 2011, basic: 125.00, internet: 50.00, mobile: null },
  { year: 2012, basic: null, internet: null, mobile: null },
  { year: 2013, basic: 186.29, internet: 57.44, mobile: null },
  { year: 2014, basic: 117.87, internet: 52.37, mobile: null },
  { year: 2015, basic: 134.89, internet: 55.17, mobile: null },
  { year: 2016, basic: 136.25, internet: 56.62, mobile: null },
  { year: 2017, basic: 127.93, internet: 61.54, mobile: null },
  { year: 2018, basic: 149.79, internet: 63.32, mobile: null },
  { year: 2019, basic: 132.82, internet: 63.71, mobile: null },
  { year: 2020, basic: 142.92, internet: 66.44, mobile: null },
  { year: 2021, basic: 175.93, internet: 64.99, mobile: null },
  { year: 2022, basic: 164.84, internet: 70.04, mobile: null },
  { year: 2023, basic: 163.57, internet: 70.38, mobile: 59.89 },
  { year: 2024, basic: 193.02, internet: 66.07, mobile: 69.21 },
];

// New York Sports and Leisure data (2011-2024)
const newYorkSportsLeisureData = [
  { year: 2011, fitness: 66.25, tennis: 12.33, cinema: 12.22 },
  { year: 2012, fitness: 86.67, tennis: 32.50, cinema: 13.58 },
  { year: 2013, fitness: 111.53, tennis: null, cinema: 13.87 },
  { year: 2014, fitness: 95.50, tennis: null, cinema: 14.45 },
  { year: 2015, fitness: 85.59, tennis: 47.50, cinema: 14.50 },
  { year: 2016, fitness: 75.03, tennis: 35.56, cinema: 14.99 },
  { year: 2017, fitness: 80.18, tennis: 58.46, cinema: 15.34 },
  { year: 2018, fitness: 83.81, tennis: 32.54, cinema: 16.24 },
  { year: 2019, fitness: 80.69, tennis: 36.07, cinema: 16.45 },
  { year: 2020, fitness: 82.49, tennis: 40.33, cinema: 16.40 },
  { year: 2021, fitness: 113.95, tennis: 45.00, cinema: 18.11 },
  { year: 2022, fitness: 97.55, tennis: 41.25, cinema: 18.35 },
  { year: 2023, fitness: 117.63, tennis: 59.17, cinema: 19.16 },
  { year: 2024, fitness: 189.05, tennis: 93.00, cinema: 19.28 },
];

// New York Clothing and Shoes data (2011-2024)
const newYorkClothingShoesData = [
  { year: 2011, jeans: 59.17, dress: 40.67, nike: 79.27, leather: 85.77 },
  { year: 2012, jeans: 56.43, dress: 35.00, nike: 80.00, leather: 100.00 },
  { year: 2013, jeans: 59.82, dress: 50.17, nike: 100.20, leather: 143.85 },
  { year: 2014, jeans: 65.00, dress: 53.75, nike: 95.00, leather: 155.00 },
  { year: 2015, jeans: 53.55, dress: 39.52, nike: 85.55, leather: 129.38 },
  { year: 2016, jeans: 53.36, dress: 40.28, nike: 86.65, leather: 120.69 },
  { year: 2017, jeans: 55.78, dress: 45.49, nike: 91.57, leather: 121.16 },
  { year: 2018, jeans: 54.45, dress: 41.59, nike: 88.30, leather: 135.40 },
  { year: 2019, jeans: 55.31, dress: 38.93, nike: 86.53, leather: 134.67 },
  { year: 2020, jeans: 58.35, dress: 46.38, nike: 89.46, leather: 131.83 },
  { year: 2021, jeans: 62.71, dress: 52.33, nike: 95.91, leather: 151.77 },
  { year: 2022, jeans: 65.44, dress: 53.60, nike: 95.64, leather: 145.31 },
  { year: 2023, jeans: 67.64, dress: 46.29, nike: 99.60, leather: 167.12 },
  { year: 2024, jeans: 66.59, dress: 60.83, nike: 115.94, leather: 188.57 },
];

// New York Transportation data (2011-2024)
const newYorkTransportationData = [
  { year: 2011, ticket: 2.30, gasoline: 1.03 },
  { year: 2012, ticket: 2.30, gasoline: 1.07 },
  { year: 2013, ticket: 2.50, gasoline: 1.09 },
  { year: 2014, ticket: 2.52, gasoline: 0.98 },
  { year: 2015, ticket: 2.75, gasoline: 0.74 },
  { year: 2016, ticket: 2.75, gasoline: 0.66 },
  { year: 2017, ticket: 2.75, gasoline: 0.73 },
  { year: 2018, ticket: 2.75, gasoline: 0.81 },
  { year: 2019, ticket: 2.75, gasoline: 0.80 },
  { year: 2020, ticket: 2.75, gasoline: 0.70 },
  { year: 2021, ticket: 2.75, gasoline: 0.86 },
  { year: 2022, ticket: 2.75, gasoline: 1.21 },
  { year: 2023, ticket: 2.86, gasoline: 1.04 },
  { year: 2024, ticket: 2.91, gasoline: 1.01 },
];

// Tokyo Essential Goods price data (2011-2024)
const tokyoEssentialGoodsData = [
  { year: 2011, milk: 261.70, bread: 291.20, eggs: 375.07, water: 192.03, domesticBeer: 352.27, importedBeer: 541.80 },
  { year: 2012, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2013, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2014, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2015, milk: 177.89, bread: 172.34, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2016, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2017, milk: 220.95, bread: 220.95, eggs: 220.95, water: 117.42, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2018, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 227.45, importedBeer: 310.00 },
  { year: 2019, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: null },
  { year: 2020, milk: 220.95, bread: 220.95, eggs: 220.95, water: 117.42, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2021, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2022, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2023, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
  { year: 2024, milk: 220.95, bread: 220.95, eggs: 220.95, water: 172.34, domesticBeer: 310.00, importedBeer: 310.00 },
];

// Tokyo Produce (Fruit & Vegetable) price data (2011-2024)
const tokyoProduceData = [
  { year: 2011, apples: 492.00, oranges: 325.00, potato: 348.00, lettuce: 179.33, rice: null, tomato: null, banana: null, onion: null },
  { year: 2012, apples: 682.96, oranges: 545.46, potato: 550.00, lettuce: 183.33, rice: 450.00, tomato: 880.00, banana: null, onion: null },
  { year: 2013, apples: 571.78, oranges: 549.25, potato: 385.71, lettuce: 217.33, rice: 659.80, tomato: 600.00, banana: null, onion: null },
  { year: 2014, apples: 700.00, oranges: 766.67, potato: 525.00, lettuce: 200.00, rice: 475.60, tomato: 1099.50, banana: null, onion: null },
  { year: 2015, apples: 973.75, oranges: 579.60, potato: 549.50, lettuce: 228.67, rice: 489.82, tomato: 659.60, banana: 400.39, onion: 459.60 },
  { year: 2016, apples: 797.78, oranges: 875.00, potato: 341.67, lettuce: 257.14, rice: 525.00, tomato: 788.75, banana: 405.11, onion: 350.00 },
  { year: 2017, apples: 1042.86, oranges: 537.00, potato: 389.60, lettuce: 219.67, rice: 525.00, tomato: 841.67, banana: 400.00, onion: 349.60 },
  { year: 2018, apples: 854.62, oranges: 711.11, potato: 475.00, lettuce: 222.50, rice: 716.67, tomato: 750.00, banana: 368.00, onion: 378.89 },
  { year: 2019, apples: 787.50, oranges: 525.00, potato: 300.00, lettuce: 168.00, rice: 579.17, tomato: 600.00, banana: 343.50, onion: 358.33 },
  { year: 2020, apples: 791.11, oranges: 891.67, potato: 418.75, lettuce: 204.46, rice: 514.38, tomato: 740.00, banana: 391.60, onion: 315.00 },
  { year: 2021, apples: 995.00, oranges: 715.00, potato: 440.00, lettuce: 198.85, rice: 518.42, tomato: 695.45, banana: 456.44, onion: 427.78 },
  { year: 2022, apples: 935.89, oranges: 911.94, potato: 727.48, lettuce: 205.56, rice: 394.12, tomato: 757.96, banana: 374.06, onion: 667.70 },
  { year: 2023, apples: 783.33, oranges: 978.57, potato: 448.12, lettuce: 213.00, rice: 518.75, tomato: 740.15, banana: 402.00, onion: 407.78 },
  { year: 2024, apples: 742.58, oranges: 795.00, potato: 385.00, lettuce: 203.87, rice: 706.85, tomato: 897.56, banana: 310.50, onion: 459.14 },
];

// Tokyo Protein (Cheese, Wine, Cigarettes, Chicken, Beef) price data (2011-2024)
const tokyoProteinData = [
  { year: 2011, localCheese: 1266.77, wine: 1583.47, cigarettes: 636.80, chickenFillets: 931.20, beefRound: null },
  { year: 2012, localCheese: 2494.69, wine: 1366.67, cigarettes: 426.67, chickenFillets: 851.25, beefRound: null },
  { year: 2013, localCheese: 2487.50, wine: 1520.83, cigarettes: 438.89, chickenFillets: 1065.56, beefRound: null },
  { year: 2014, localCheese: 1784.55, wine: 1342.86, cigarettes: 450.40, chickenFillets: 808.96, beefRound: null },
  { year: 2015, localCheese: 1985.71, wine: 1486.67, cigarettes: 447.78, chickenFillets: 782.50, beefRound: 2550.00 },
  { year: 2016, localCheese: 2150.00, wine: 2166.67, cigarettes: 440.33, chickenFillets: 896.36, beefRound: 1711.37 },
  { year: 2017, localCheese: 1660.00, wine: 1733.33, cigarettes: 460.00, chickenFillets: 971.67, beefRound: 2766.67 },
  { year: 2018, localCheese: 1100.00, wine: 1292.31, cigarettes: 467.50, chickenFillets: 829.23, beefRound: 2380.76 },
  { year: 2019, localCheese: 1675.00, wine: 1362.50, cigarettes: 517.50, chickenFillets: 870.91, beefRound: 2913.33 },
  { year: 2020, localCheese: 1487.50, wine: 1393.33, cigarettes: 524.29, chickenFillets: 980.83, beefRound: 2308.89 },
  { year: 2021, localCheese: 2417.69, wine: 1496.15, cigarettes: 543.00, chickenFillets: 1050.00, beefRound: 3149.00 },
  { year: 2022, localCheese: 1837.00, wine: 1377.33, cigarettes: 611.11, chickenFillets: 1126.00, beefRound: 2822.22 },
  { year: 2023, localCheese: 2712.00, wine: 1054.44, cigarettes: 576.92, chickenFillets: 1058.12, beefRound: 2973.08 },
  { year: 2024, localCheese: 1848.89, wine: 1625.00, cigarettes: 580.00, chickenFillets: 1164.17, beefRound: 4028.57 },
];

// Tokyo Rent price data (2011-2024)
const tokyoRentData = [
  { year: 2011, apt1city: 169750.00, apt1out: 125000.00, apt3city: 477813.33, apt3out: 219466.67 },
  { year: 2012, apt1city: 130545.45, apt1out: 67977.82, apt3city: 333333.33, apt3out: 175000.00 },
  { year: 2013, apt1city: 138104.97, apt1out: 73571.43, apt3city: 307000.00, apt3out: 166500.00 },
  { year: 2014, apt1city: 125456.87, apt1out: 72777.78, apt3city: 418750.00, apt3out: 219875.00 },
  { year: 2015, apt1city: 144174.66, apt1out: 79285.71, apt3city: 424000.00, apt3out: 197520.00 },
  { year: 2016, apt1city: 131225.40, apt1out: 79142.86, apt3city: 327708.33, apt3out: 149739.13 },
  { year: 2017, apt1city: 125896.55, apt1out: 77608.70, apt3city: 275526.32, apt3out: 142941.18 },
  { year: 2018, apt1city: 121018.18, apt1out: 75803.92, apt3city: 283666.67, apt3out: 150189.19 },
  { year: 2019, apt1city: 131019.61, apt1out: 80666.67, apt3city: 295000.00, apt3out: 158137.93 },
  { year: 2020, apt1city: 129076.92, apt1out: 73261.05, apt3city: 367021.69, apt3out: 176470.59 },
  { year: 2021, apt1city: 154522.59, apt1out: 83800.00, apt3city: 331250.00, apt3out: 185333.33 },
  { year: 2022, apt1city: 150613.79, apt1out: 91953.30, apt3city: 334250.00, apt3out: 182142.86 },
  { year: 2023, apt1city: 148041.67, apt1out: 89909.09, apt3city: 400095.24, apt3out: 167943.31 },
  { year: 2024, apt1city: 163214.67, apt1out: 84414.13, apt3city: 368578.79, apt3out: 195805.66 },
];

// Tokyo Buy Apartment Price per Square Meter data (2011-2024)
const tokyoBuyAptData = [
  { year: 2011, city: 1750400.00, out: 1667200.00 },
  { year: 2012, city: 600000.00, out: 600000.00 },
  { year: 2013, city: 583333.33, out: 450000.00 },
  { year: 2014, city: 737512.66, out: 631250.00 },
  { year: 2015, city: 2310845.41, out: 1010869.55 },
  { year: 2016, city: 1487500.00, out: 650000.00 },
  { year: 2017, city: 1216666.50, out: 592083.25 },
  { year: 2018, city: 1211671.12, out: 571428.57 },
  { year: 2019, city: 1172644.05, out: 774977.78 },
  { year: 2020, city: 1395393.13, out: 742426.07 },
  { year: 2021, city: 1242536.09, out: null },
  { year: 2022, city: 1119807.00, out: 531250.00 },
  { year: 2023, city: 1453802.73, out: 771800.00 },
  { year: 2024, city: 2112778.21, out: 791759.40 },
];

// Tokyo Average Monthly Net Salary (After Tax) data (2011-2024)
const tokyoSalaryData = [
  { year: 2011, salary: 309706.94 },
  { year: 2012, salary: 316000.00 },
  { year: 2013, salary: 337458.50 },
  { year: 2014, salary: 281318.61 },
  { year: 2015, salary: 321426.81 },
  { year: 2016, salary: 314805.25 },
  { year: 2017, salary: 327975.08 },
  { year: 2018, salary: 325223.49 },
  { year: 2019, salary: 330709.62 },
  { year: 2020, salary: 320945.00 },
  { year: 2021, salary: 410298.65 },
  { year: 2022, salary: 378158.16 },
  { year: 2023, salary: 367123.14 },
  { year: 2024, salary: 373135.48 },
];

// Tokyo Utilities (Monthly) data (2011-2024)
const tokyoUtilitiesData = [
  { year: 2011, basic: 14390.40, internet: 2717.20, mobile: null },
  { year: 2012, basic: 18752.08, internet: 3966.67, mobile: null },
  { year: 2013, basic: 21042.75, internet: 3657.50, mobile: null },
  { year: 2014, basic: 21183.84, internet: 3939.33, mobile: null },
  { year: 2015, basic: 16937.36, internet: 4264.62, mobile: null },
  { year: 2016, basic: 20263.48, internet: 3977.08, mobile: null },
  { year: 2017, basic: 20284.79, internet: 4013.04, mobile: null },
  { year: 2018, basic: 21717.98, internet: 4745.71, mobile: null },
  { year: 2019, basic: 20895.41, internet: 4772.67, mobile: null },
  { year: 2020, basic: 24060.16, internet: 4575.00, mobile: null },
  { year: 2021, basic: 22053.06, internet: 4426.67, mobile: null },
  { year: 2022, basic: 23208.50, internet: 4687.00, mobile: null },
  { year: 2023, basic: 28570.62, internet: 4952.28, mobile: 4197.27 },
  { year: 2024, basic: 25646.15, internet: 4860.88, mobile: 3836.68 },
];

// Tokyo Sports and Leisure data (2011-2024)
const tokyoSportsLeisureData = [
  { year: 2011, fitness: 10834.40, tennis: null, cinema: 1655.73 },
  { year: 2012, fitness: 8333.33, tennis: null, cinema: 1760.00 },
  { year: 2013, fitness: 10000.00, tennis: 2425.00, cinema: 1775.00 },
  { year: 2014, fitness: 8666.67, tennis: null, cinema: 1855.56 },
  { year: 2015, fitness: 9736.84, tennis: null, cinema: 1872.41 },
  { year: 2016, fitness: 10386.67, tennis: 2812.50, cinema: 1865.28 },
  { year: 2017, fitness: 10022.73, tennis: 2500.00, cinema: 1878.57 },
  { year: 2018, fitness: 10000.00, tennis: 3658.33, cinema: 1839.66 },
  { year: 2019, fitness: 9671.11, tennis: 3200.00, cinema: 1843.64 },
  { year: 2020, fitness: 9437.50, tennis: null, cinema: 1766.00 },
  { year: 2021, fitness: 10246.15, tennis: null, cinema: 1900.00 },
  { year: 2022, fitness: 9914.29, tennis: 2800.00, cinema: 1838.89 },
  { year: 2023, fitness: 9379.33, tennis: 2704.44, cinema: 1848.28 },
  { year: 2024, fitness: 10675.00, tennis: 3428.57, cinema: 1863.16 },
];

// Tokyo Clothing and Shoes data (2011-2024)
const tokyoClothingShoesData = [
  { year: 2011, jeans: 7445.33, dress: 5334.00, nike: 11252.00, leather: 16669.33 },
  { year: 2012, jeans: 7666.67, dress: 8333.33, nike: 10000.00, leather: 9750.00 },
  { year: 2013, jeans: 8170.00, dress: 9125.00, nike: 8777.78, leather: 14666.67 },
  { year: 2014, jeans: 7560.00, dress: 3625.00, nike: 7916.67, leather: 8500.00 },
  { year: 2015, jeans: 7761.91, dress: 4076.92, nike: 9785.71, leather: 12464.29 },
  { year: 2016, jeans: 7422.68, dress: 4209.95, nike: 8750.00, leather: 13807.69 },
  { year: 2017, jeans: 7321.25, dress: 4374.92, nike: 8431.25, leather: 12052.63 },
  { year: 2018, jeans: 6700.00, dress: 4636.11, nike: 8275.00, leather: 12050.00 },
  { year: 2019, jeans: 7426.67, dress: 4740.62, nike: 9025.58, leather: 14851.43 },
  { year: 2020, jeans: 6805.14, dress: 4391.67, nike: 7764.71, leather: 13090.91 },
  { year: 2021, jeans: 6771.43, dress: 5420.00, nike: 9775.00, leather: 16090.91 },
  { year: 2022, jeans: 6344.54, dress: 4837.90, nike: 8193.75, leather: 11909.09 },
  { year: 2023, jeans: 8182.38, dress: 5865.33, nike: 9636.36, leather: 12969.41 },
  { year: 2024, jeans: 7981.82, dress: 5604.18, nike: 8377.79, leather: 16744.70 },
];

// Tokyo Transportation data (2011-2024)
const tokyoTransportationData = [
  { year: 2011, ticket: 158.91, gasoline: 168.47 },
  { year: 2012, ticket: 172.22, gasoline: 146.53 },
  { year: 2013, ticket: 178.24, gasoline: 154.70 },
  { year: 2014, ticket: 194.62, gasoline: 153.83 },
  { year: 2015, ticket: 200.13, gasoline: 141.51 },
  { year: 2016, ticket: 195.18, gasoline: 120.39 },
  { year: 2017, ticket: 195.88, gasoline: 129.99 },
  { year: 2018, ticket: 201.72, gasoline: 144.59 },
  { year: 2019, ticket: 193.75, gasoline: 140.01 },
  { year: 2020, ticket: 203.32, gasoline: 137.47 },
  { year: 2021, ticket: 226.75, gasoline: 147.11 },
  { year: 2022, ticket: 196.00, gasoline: 166.96 },
  { year: 2023, ticket: 181.67, gasoline: 166.75 },
  { year: 2024, ticket: 200.68, gasoline: 178.21 },
];

// Tokyo Restaurant data (2011-2024)
const tokyoRestaurantData = [
  { year: 2011, inexpensive: 1016.72, midrange: 4141.56, mcdonalds: 628.93 },
  { year: 2012, inexpensive: 920.59, midrange: 4675.38, mcdonalds: 614.60 },
  { year: 2013, inexpensive: 878.54, midrange: 5336.54, mcdonalds: 681.58 },
  { year: 2014, inexpensive: 937.01, midrange: 5324.62, mcdonalds: 666.08 },
  { year: 2015, inexpensive: 846.43, midrange: 5808.69, mcdonalds: 681.38 },
  { year: 2016, inexpensive: 941.54, midrange: 5560.61, mcdonalds: 702.41 },
  { year: 2017, inexpensive: 996.79, midrange: 5477.78, mcdonalds: 672.50 },
  { year: 2018, inexpensive: 965.06, midrange: 5379.31, mcdonalds: 662.69 },
  { year: 2019, inexpensive: 936.81, midrange: 6039.30, mcdonalds: 700.69 },
  { year: 2020, inexpensive: 900.00, midrange: 4814.00, mcdonalds: 693.92 },
  { year: 2021, inexpensive: 993.75, midrange: 5808.69, mcdonalds: 729.21 },
  { year: 2022, inexpensive: 1064.61, midrange: 6915.25, mcdonalds: 690.43 },
  { year: 2023, inexpensive: 1129.07, midrange: 7347.66, mcdonalds: 780.33 },
  { year: 2024, inexpensive: 1073.55, midrange: 6593.12, mcdonalds: 797.29 },
];

// Tokyo Beverages and Coffee data (2011-2024)
const tokyoBeveragesData = [
  { year: 2011, domesticBeer: 569.38, importedBeer: 808.40, coke: 132.01, water: 138.84, cappuccino: 416.67 },
  { year: 2012, domesticBeer: 533.33, importedBeer: 643.16, coke: 158.33, water: 124.38, cappuccino: 373.24 },
  { year: 2013, domesticBeer: 472.67, importedBeer: 557.03, coke: 177.95, water: 116.30, cappuccino: 381.25 },
  { year: 2014, domesticBeer: 425.16, importedBeer: 488.84, coke: 135.90, water: 115.00, cappuccino: 387.77 },
  { year: 2015, domesticBeer: 437.57, importedBeer: 549.38, coke: 136.67, water: 112.26, cappuccino: 384.48 },
  { year: 2016, domesticBeer: 420.86, importedBeer: 509.21, coke: 138.16, water: 111.71, cappuccino: 399.71 },
  { year: 2017, domesticBeer: 517.27, importedBeer: 634.55, coke: 149.77, water: 110.24, cappuccino: 398.64 },
  { year: 2018, domesticBeer: 413.64, importedBeer: 492.11, coke: 143.25, water: 105.00, cappuccino: 387.50 },
  { year: 2019, domesticBeer: 486.66, importedBeer: 608.60, coke: 154.39, water: 109.60, cappuccino: 395.31 },
  { year: 2020, domesticBeer: 501.59, importedBeer: 609.63, coke: 149.14, water: 108.90, cappuccino: 390.83 },
  { year: 2021, domesticBeer: 494.21, importedBeer: 615.00, coke: 146.15, water: 109.89, cappuccino: 430.28 },
  { year: 2022, domesticBeer: 594.10, importedBeer: 656.27, coke: 170.09, water: 117.79, cappuccino: 462.76 },
  { year: 2023, domesticBeer: 525.30, importedBeer: 722.11, coke: 178.46, water: 117.89, cappuccino: 490.99 },
  { year: 2024, domesticBeer: 503.08, importedBeer: 624.55, coke: 166.67, water: 115.15, cappuccino: 511.31 },
];

// Paris Produce (Fruit & Vegetable) price data (2011-2024)
const parisProduceData = [
  { year: 2011, apples: 2.71, oranges: 2.14, potato: 1.74, lettuce: 1.15, rice: 1.25, tomato: 3.31, banana: null, onion: null },
  { year: 2012, apples: 3.25, oranges: 2.88, potato: 1.96, lettuce: 1.75, rice: 1.25, tomato: 3.31, banana: null, onion: null },
  { year: 2013, apples: 2.80, oranges: 3.15, potato: 2.60, lettuce: 1.38, rice: 2.18, tomato: 3.23, banana: null, onion: null },
  { year: 2014, apples: 2.70, oranges: 2.46, potato: 1.68, lettuce: 1.29, rice: 1.71, tomato: 2.36, banana: null, onion: 1.68 },
  { year: 2015, apples: 2.58, oranges: 2.29, potato: 1.49, lettuce: 1.18, rice: 1.91, tomato: 2.60, banana: 2.00, onion: 1.68 },
  { year: 2016, apples: 2.55, oranges: 2.53, potato: 1.79, lettuce: 1.42, rice: 2.15, tomato: 2.88, banana: 2.01, onion: 2.06 },
  { year: 2017, apples: 2.72, oranges: 2.34, potato: 1.71, lettuce: 1.47, rice: 1.99, tomato: 2.67, banana: 2.05, onion: 2.05 },
  { year: 2018, apples: 2.78, oranges: 2.53, potato: 1.78, lettuce: 1.33, rice: 1.94, tomato: 2.85, banana: 1.98, onion: 2.26 },
  { year: 2019, apples: 3.24, oranges: 3.00, potato: 1.90, lettuce: 1.36, rice: 1.90, tomato: 2.86, banana: 2.36, onion: 2.22 },
  { year: 2020, apples: 3.05, oranges: 2.99, potato: 2.38, lettuce: 1.59, rice: 2.25, tomato: 3.28, banana: 2.17, onion: 2.95 },
  { year: 2021, apples: 2.46, oranges: 2.43, potato: 1.73, lettuce: 1.27, rice: 2.00, tomato: 3.01, banana: 1.85, onion: 1.94 },
  { year: 2022, apples: 3.32, oranges: 3.03, potato: 2.34, lettuce: 1.51, rice: 2.20, tomato: 3.85, banana: 2.16, onion: 2.24 },
  { year: 2023, apples: 3.32, oranges: 3.55, potato: 2.34, lettuce: 1.57, rice: 2.13, tomato: 4.09, banana: 2.35, onion: 2.45 },
  { year: 2024, apples: 3.21, oranges: 3.17, potato: 2.35, lettuce: 1.55, rice: 2.62, tomato: 3.60, banana: 2.12, onion: 2.61 },
];

// Paris Protein (Cheese, Wine, Cigarettes, Chicken, Beef) price data (2011-2024)
const parisProteinData = [
  { year: 2011, cheese: 16.25, wine: 6.33, cigarettes: 5.94, chicken: 9.46, beef: 14.67 },
  { year: 2012, cheese: 14.74, wine: 5.73, cigarettes: 6.40, chicken: 14.67, beef: 14.67 },
  { year: 2013, cheese: 17.78, wine: 7.88, cigarettes: 6.65, chicken: 13.90, beef: 13.90 },
  { year: 2014, cheese: 16.62, wine: 6.13, cigarettes: 7.06, chicken: 12.11, beef: 12.11 },
  { year: 2015, cheese: 15.44, wine: 6.93, cigarettes: 7.22, chicken: 11.26, beef: 20.83 },
  { year: 2016, cheese: 15.37, wine: 6.65, cigarettes: 7.07, chicken: 11.81, beef: 21.70 },
  { year: 2017, cheese: 16.24, wine: 7.24, cigarettes: 7.14, chicken: 11.76, beef: 16.85 },
  { year: 2018, cheese: 16.43, wine: 7.12, cigarettes: 8.07, chicken: 11.94, beef: 18.64 },
  { year: 2019, cheese: 21.85, wine: 9.22, cigarettes: 8.73, chicken: 13.70, beef: 20.33 },
  { year: 2020, cheese: 15.84, wine: 8.03, cigarettes: 9.95, chicken: 12.68, beef: 20.70 },
  { year: 2021, cheese: 18.19, wine: 9.15, cigarettes: 10.35, chicken: 12.42, beef: 20.85 },
  { year: 2022, cheese: 17.22, wine: 9.15, cigarettes: 10.40, chicken: 12.52, beef: 21.84 },
  { year: 2023, cheese: 20.81, wine: 8.52, cigarettes: 11.81, chicken: 14.60, beef: 21.60 },
  { year: 2024, cheese: 22.05, wine: 8.97, cigarettes: 12.28, chicken: 12.56, beef: 19.46 },
];

// Paris Rent price data (2011-2024)
const parisRentData = [
  { year: 2011, apt1city: 1075.00, apt1out: 775.00, apt3city: 2312.50, apt3out: 1475.00 },
  { year: 2012, apt1city: 1121.76, apt1out: 774.82, apt3city: 2550.00, apt3out: 1785.71 },
  { year: 2013, apt1city: 1190.74, apt1out: 852.26, apt3city: 2617.50, apt3out: 1850.83 },
  { year: 2014, apt1city: 1143.14, apt1out: 849.55, apt3city: 2447.06, apt3out: 1700.00 },
  { year: 2015, apt1city: 1137.64, apt1out: 802.16, apt3city: 2527.78, apt3out: 1698.78 },
  { year: 2016, apt1city: 1103.13, apt1out: 797.05, apt3city: 2257.61, apt3out: 1527.63 },
  { year: 2017, apt1city: 1094.31, apt1out: 843.62, apt3city: 2406.25, apt3out: 1666.62 },
  { year: 2018, apt1city: 1178.95, apt1out: 872.82, apt3city: 2494.75, apt3out: 1703.92 },
  { year: 2019, apt1city: 1201.81, apt1out: 859.14, apt3city: 2660.91, apt3out: 1785.57 },
  { year: 2020, apt1city: 1222.21, apt1out: 882.32, apt3city: 2752.22, apt3out: 1768.57 },
  { year: 2021, apt1city: 1256.88, apt1out: 892.95, apt3city: 2660.99, apt3out: 1865.49 },
  { year: 2022, apt1city: 1273.16, apt1out: 939.49, apt3city: 2922.45, apt3out: 2007.20 },
  { year: 2023, apt1city: 1333.65, apt1out: 953.14, apt3city: 3013.00, apt3out: 2182.95 },
  { year: 2024, apt1city: 1320.51, apt1out: 991.59, apt3city: 3036.00, apt3out: 2044.00 },
];

// Paris Buy Apartment Price per Square Meter data (2011-2024)
const parisBuyAptData = [
  { year: 2011, city: 9587.25, out: 5583.33 },
  { year: 2012, city: 9275.00, out: 5866.67 },
  { year: 2013, city: 10571.43, out: 6818.18 },
  { year: 2014, city: 9750.00, out: 7270.03 },
  { year: 2015, city: 10641.08, out: 6643.59 },
  { year: 2016, city: 9639.65, out: 6075.55 },
  { year: 2017, city: 9927.47, out: 7017.41 },
  { year: 2018, city: 10575.50, out: 7532.50 },
  { year: 2019, city: 11508.28, out: 8413.51 },
  { year: 2020, city: 12195.74, out: 9222.51 },
  { year: 2021, city: 12520.70, out: 8861.19 },
  { year: 2022, city: 12460.36, out: 8917.15 },
  { year: 2023, city: 11844.44, out: 8750.00 },
  { year: 2024, city: 11854.04, out: 8420.69 },
];

// Paris Average Monthly Net Salary (After Tax) data (2011-2024)
const parisSalaryData = [
  { year: 2011, salary: 2331.25 },
  { year: 2012, salary: 2172.67 },
  { year: 2013, salary: 2796.92 },
  { year: 2014, salary: 2245.65 },
  { year: 2015, salary: 2372.45 },
  { year: 2016, salary: 2412.17 },
  { year: 2017, salary: 2398.23 },
  { year: 2018, salary: 2446.02 },
  { year: 2019, salary: 2308.96 },
  { year: 2020, salary: 2510.77 },
  { year: 2021, salary: 2791.18 },
  { year: 2022, salary: 2601.82 },
  { year: 2023, salary: 2846.41 },
  { year: 2024, salary: 2942.39 },
];

// Paris Transportation data (2011-2024)
const parisTransportationData = [
  { year: 2011, ticket: 1.63, gasoline: 1.51 },
  { year: 2012, ticket: 1.84, gasoline: 1.63 },
  { year: 2013, ticket: 1.82, gasoline: 1.69 },
  { year: 2014, ticket: 1.80, gasoline: 1.64 },
  { year: 2015, ticket: 1.80, gasoline: 1.40 },
  { year: 2016, ticket: 1.83, gasoline: 1.32 },
  { year: 2017, ticket: 1.88, gasoline: 1.42 },
  { year: 2018, ticket: 1.87, gasoline: 1.56 },
  { year: 2019, ticket: 1.87, gasoline: 1.57 },
  { year: 2020, ticket: 1.89, gasoline: 1.54 },
  { year: 2021, ticket: 1.89, gasoline: 1.62 },
  { year: 2022, ticket: 1.91, gasoline: 1.93 },
  { year: 2023, ticket: 2.09, gasoline: 1.91 },
  { year: 2024, ticket: 2.21, gasoline: 1.89 },
];

// Paris Utilities (Monthly) data (2011-2024)
const parisUtilitiesData = [
  { year: 2011, basic: 126.67, internet: 29.50, mobile: null },
  { year: 2012, basic: 145.11, internet: 30.00, mobile: null },
  { year: 2013, basic: 194.00, internet: 29.33, mobile: null },
  { year: 2014, basic: 188.35, internet: 28.95, mobile: null },
  { year: 2015, basic: 182.63, internet: 28.26, mobile: null },
  { year: 2016, basic: 179.85, internet: 27.11, mobile: null },
  { year: 2017, basic: 167.05, internet: 26.68, mobile: null },
  { year: 2018, basic: 153.19, internet: 29.03, mobile: null },
  { year: 2019, basic: 186.02, internet: 29.44, mobile: null },
  { year: 2020, basic: 155.50, internet: 26.16, mobile: null },
  { year: 2021, basic: 186.77, internet: 29.42, mobile: null },
  { year: 2022, basic: 196.89, internet: 30.18, mobile: null },
  { year: 2023, basic: 198.81, internet: 30.68, mobile: 20.55 },
  { year: 2024, basic: 232.70, internet: 31.27, mobile: 15.50 },
];

// Paris Sports and Leisure data (2011-2024)
const parisSportsLeisureData = [
  { year: 2011, fitness: 75.28, tennis: 19.00, cinema: 10.67 },
  { year: 2012, fitness: 106.43, tennis: 25.00, cinema: 10.49 },
  { year: 2013, fitness: 94.79, tennis: 26.67, cinema: 9.87 },
  { year: 2014, fitness: 62.18, tennis: 18.80, cinema: 10.60 },
  { year: 2015, fitness: 53.78, tennis: 16.46, cinema: 10.68 },
  { year: 2016, fitness: 52.59, tennis: 13.77, cinema: 10.53 },
  { year: 2017, fitness: 48.55, tennis: 15.11, cinema: 10.74 },
  { year: 2018, fitness: 49.55, tennis: 21.77, cinema: 11.23 },
  { year: 2019, fitness: 42.45, tennis: 20.36, cinema: 11.01 },
  { year: 2020, fitness: 39.62, tennis: 16.77, cinema: 11.26 },
  { year: 2021, fitness: 45.15, tennis: 19.58, cinema: 11.55 },
  { year: 2022, fitness: 33.56, tennis: 13.56, cinema: 12.70 },
  { year: 2023, fitness: 39.23, tennis: 17.67, cinema: 12.98 },
  { year: 2024, fitness: 33.50, tennis: 16.49, cinema: 13.16 },
];

// Paris Clothing and Shoes data (2011-2024)
const parisClothingShoesData = [
  { year: 2011, jeans: 96.00, dress: 35.94, nike: 94.00, leather: 128.17 },
  { year: 2012, jeans: 98.33, dress: 34.50, nike: 104.50, leather: 108.00 },
  { year: 2013, jeans: 88.75, dress: 35.53, nike: 84.10, leather: 117.50 },
  { year: 2014, jeans: 85.00, dress: 37.50, nike: 89.44, leather: 101.60 },
  { year: 2015, jeans: 86.24, dress: 39.39, nike: 90.06, leather: 120.33 },
  { year: 2016, jeans: 88.56, dress: 38.20, nike: 88.16, leather: 125.38 },
  { year: 2017, jeans: 88.87, dress: 38.05, nike: 88.45, leather: 139.00 },
  { year: 2018, jeans: 85.32, dress: 36.21, nike: 93.98, leather: 134.37 },
  { year: 2019, jeans: 87.93, dress: 36.93, nike: 95.00, leather: 140.90 },
  { year: 2020, jeans: 89.29, dress: 37.17, nike: 89.83, leather: 135.17 },
  { year: 2021, jeans: 95.83, dress: 36.17, nike: 91.84, leather: 157.50 },
  { year: 2022, jeans: 101.09, dress: 40.70, nike: 93.76, leather: 134.16 },
  { year: 2023, jeans: 90.00, dress: 39.97, nike: 97.24, leather: 131.08 },
  { year: 2024, jeans: 100.11, dress: 43.48, nike: 102.59, leather: 136.19 },
];

// Cost of Living Index data (2026) - Representative sample from major global cities
// Source: Numbeo Cost of Living Index (https://www.numbeo.com/cost-of-living/rankings.jsp)
const costOfLivingData = [
  { rank: 1, city: 'Zurich', country: 'Switzerland', colIndex: 118.5, rentIndex: 70.6, colPlusRent: 97.1, groceriesIndex: 115.4, restaurantIndex: 121.0, purchasingPower: 164.4 },
  { rank: 2, city: 'Geneva', country: 'Switzerland', colIndex: 116.5, rentIndex: 65.1, colPlusRent: 93.6, groceriesIndex: 114.3, restaurantIndex: 121.8, purchasingPower: 158.5 },
  { rank: 3, city: 'Basel', country: 'Switzerland', colIndex: 112.4, rentIndex: 49.6, colPlusRent: 84.4, groceriesIndex: 110.4, restaurantIndex: 114.9, purchasingPower: 183.7 },
  { rank: 7, city: 'New York, NY', country: 'United States', colIndex: 100.0, rentIndex: 100.0, colPlusRent: 100.0, groceriesIndex: 100.0, restaurantIndex: 100.0, purchasingPower: 100.0 },
  { rank: 8, city: 'Reykjavik', country: 'Iceland', colIndex: 98.9, rentIndex: 50.1, colPlusRent: 77.1, groceriesIndex: 105.2, restaurantIndex: 109.3, purchasingPower: 109.0 },
  { rank: 10, city: 'San Francisco, CA', country: 'United States', colIndex: 97.6, rentIndex: 80.5, colPlusRent: 90.0, groceriesIndex: 103.2, restaurantIndex: 109.2, purchasingPower: 151.0 },
  { rank: 13, city: 'Oslo', country: 'Norway', colIndex: 90.2, rentIndex: 39.3, colPlusRent: 67.5, groceriesIndex: 90.7, restaurantIndex: 99.1, purchasingPower: 110.8 },
  { rank: 14, city: 'Singapore', country: 'Singapore', colIndex: 87.7, rentIndex: 73.1, colPlusRent: 81.2, groceriesIndex: 77.3, restaurantIndex: 55.5, purchasingPower: 105.5 },
  { rank: 15, city: 'London', country: 'United Kingdom', colIndex: 87.5, rentIndex: 70.1, colPlusRent: 79.7, groceriesIndex: 68.9, restaurantIndex: 89.7, purchasingPower: 117.5 },
  { rank: 20, city: 'Copenhagen', country: 'Denmark', colIndex: 85.7, rentIndex: 46.1, colPlusRent: 68.0, groceriesIndex: 78.3, restaurantIndex: 99.9, purchasingPower: 136.9 },
  { rank: 28, city: 'Amsterdam', country: 'Netherlands', colIndex: 82.6, rentIndex: 60.0, colPlusRent: 72.5, groceriesIndex: 71.5, restaurantIndex: 91.8, purchasingPower: 129.9 },
  { rank: 42, city: 'Paris', country: 'France', colIndex: 78.6, rentIndex: 43.5, colPlusRent: 62.9, groceriesIndex: 77.9, restaurantIndex: 75.2, purchasingPower: 118.0 },
  { rank: 47, city: 'Dublin', country: 'Ireland', colIndex: 76.7, rentIndex: 59.7, colPlusRent: 69.1, groceriesIndex: 71.7, restaurantIndex: 89.2, purchasingPower: 114.6 },
  { rank: 52, city: 'Munich', country: 'Germany', colIndex: 76.1, rentIndex: 45.4, colPlusRent: 62.4, groceriesIndex: 63.5, restaurantIndex: 81.9, purchasingPower: 142.7 },
  { rank: 60, city: 'Sydney', country: 'Australia', colIndex: 75.1, rentIndex: 53.8, colPlusRent: 65.6, groceriesIndex: 79.2, restaurantIndex: 69.6, purchasingPower: 117.1 },
  { rank: 69, city: 'Vienna', country: 'Austria', colIndex: 73.9, rentIndex: 29.6, colPlusRent: 54.2, groceriesIndex: 74.0, restaurantIndex: 75.0, purchasingPower: 133.5 },
  { rank: 75, city: 'Milan', country: 'Italy', colIndex: 73.1, rentIndex: 41.4, colPlusRent: 58.9, groceriesIndex: 70.3, restaurantIndex: 78.2, purchasingPower: 83.5 },
  { rank: 115, city: 'Berlin', country: 'Germany', colIndex: 70.0, rentIndex: 36.2, colPlusRent: 54.9, groceriesIndex: 63.0, restaurantIndex: 68.1, purchasingPower: 126.1 },
  { rank: 145, city: 'Seoul', country: 'South Korea', colIndex: 68.2, rentIndex: 23.0, colPlusRent: 48.0, groceriesIndex: 81.4, restaurantIndex: 42.6, purchasingPower: 130.0 },
  { rank: 160, city: 'Toronto', country: 'Canada', colIndex: 67.5, rentIndex: 40.6, colPlusRent: 55.5, groceriesIndex: 71.1, restaurantIndex: 69.2, purchasingPower: 121.2 },
  { rank: 172, city: 'Brisbane', country: 'Australia', colIndex: 64.8, rentIndex: 38.5, colPlusRent: 53.1, groceriesIndex: 76.6, restaurantIndex: 66.5, purchasingPower: 145.3 },
  { rank: 195, city: 'Madrid', country: 'Spain', colIndex: 60.0, rentIndex: 36.2, colPlusRent: 49.4, groceriesIndex: 56.1, restaurantIndex: 63.4, purchasingPower: 104.1 },
  { rank: 200, city: 'Prague', country: 'Czech Republic', colIndex: 59.6, rentIndex: 32.0, colPlusRent: 47.3, groceriesIndex: 52.9, restaurantIndex: 50.5, purchasingPower: 94.2 },
  { rank: 205, city: 'Barcelona', country: 'Spain', colIndex: 59.2, rentIndex: 36.0, colPlusRent: 48.9, groceriesIndex: 56.0, restaurantIndex: 63.8, purchasingPower: 95.1 },
  { rank: 222, city: 'Lisbon', country: 'Portugal', colIndex: 54.2, rentIndex: 38.6, colPlusRent: 47.2, groceriesIndex: 50.1, restaurantIndex: 53.1, purchasingPower: 60.9 },
  { rank: 223, city: 'Tokyo', country: 'Japan', colIndex: 54.2, rentIndex: 25.8, colPlusRent: 41.5, groceriesIndex: 62.9, restaurantIndex: 35.4, purchasingPower: 117.8 },
  { rank: 237, city: 'Warsaw', country: 'Poland', colIndex: 53.5, rentIndex: 28.5, colPlusRent: 42.3, groceriesIndex: 46.4, restaurantIndex: 52.5, purchasingPower: 98.9 },
  { rank: 244, city: 'Budapest', country: 'Hungary', colIndex: 51.1, rentIndex: 20.3, colPlusRent: 37.3, groceriesIndex: 47.8, restaurantIndex: 50.5, purchasingPower: 84.9 },
  { rank: 255, city: 'Buenos Aires', country: 'Argentina', colIndex: 48.8, rentIndex: 16.3, colPlusRent: 34.3, groceriesIndex: 46.6, restaurantIndex: 63.1, purchasingPower: 45.4 },
  { rank: 260, city: 'Moscow', country: 'Russia', colIndex: 47.5, rentIndex: 34.1, colPlusRent: 41.5, groceriesIndex: 40.7, restaurantIndex: 47.3, purchasingPower: 81.4 },
  { rank: 275, city: 'Istanbul', country: 'Turkey', colIndex: 43.8, rentIndex: 21.8, colPlusRent: 34.0, groceriesIndex: 41.7, restaurantIndex: 46.8, purchasingPower: 59.8 },
  { rank: 285, city: 'Bangkok', country: 'Thailand', colIndex: 41.4, rentIndex: 19.6, colPlusRent: 31.6, groceriesIndex: 45.2, restaurantIndex: 29.2, purchasingPower: 50.9 },
  { rank: 295, city: 'Shanghai', country: 'China', colIndex: 38.8, rentIndex: 23.2, colPlusRent: 31.8, groceriesIndex: 38.1, restaurantIndex: 26.0, purchasingPower: 96.0 },
  { rank: 300, city: 'Sao Paulo', country: 'Brazil', colIndex: 36.8, rentIndex: 16.4, colPlusRent: 27.7, groceriesIndex: 37.3, restaurantIndex: 33.6, purchasingPower: 53.4 },
  { rank: 310, city: 'Mumbai', country: 'India', colIndex: 26.3, rentIndex: 18.5, colPlusRent: 22.9, groceriesIndex: 25.8, restaurantIndex: 24.6, purchasingPower: 61.2 },
  { rank: 320, city: 'Cairo', country: 'Egypt', colIndex: 23.2, rentIndex: 5.7, colPlusRent: 15.4, groceriesIndex: 23.4, restaurantIndex: 22.6, purchasingPower: 23.4 },
];

// Tab type for inflation page
type InflationTab = 'inflation' | 'cost-of-living';

// City tab type for Cost of Living section
type CityTab = 'overview' | 'london' | 'paris' | 'tokyo' | 'newYork';

export default function InflationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA", "UK", "Germany"]);
  const [selectedPeriod, setSelectedPeriod] = useState<'5y' | '10y' | 'all'>('all');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [activeTab, setActiveTab] = useState<InflationTab>('inflation');
  const [colSortField, setColSortField] = useState<string>('rank');
  const [colSortDirection, setColSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCityTab, setSelectedCityTab] = useState<CityTab>('overview');
  const inflationChartRef = useRef<HTMLDivElement>(null);
  const londonGoodsChartRef = useRef<HTMLDivElement>(null);
  const londonProduceChartRef = useRef<HTMLDivElement>(null);
  const londonProteinChartRef = useRef<HTMLDivElement>(null);
  const londonRentChartRef = useRef<HTMLDivElement>(null);
  const londonBuyAptChartRef = useRef<HTMLDivElement>(null);
  const londonSalaryChartRef = useRef<HTMLDivElement>(null);
  const londonUtilitiesChartRef = useRef<HTMLDivElement>(null);
  const londonSportsLeisureChartRef = useRef<HTMLDivElement>(null);
  const londonClothingShoesChartRef = useRef<HTMLDivElement>(null);
  const londonTransportationChartRef = useRef<HTMLDivElement>(null);
  const parisGoodsChartRef = useRef<HTMLDivElement>(null);
  const parisProduceChartRef = useRef<HTMLDivElement>(null);
  const parisProteinChartRef = useRef<HTMLDivElement>(null);
  const parisRentChartRef = useRef<HTMLDivElement>(null);
  const parisBuyAptChartRef = useRef<HTMLDivElement>(null);
  const parisSalaryChartRef = useRef<HTMLDivElement>(null);
  const parisTransportationChartRef = useRef<HTMLDivElement>(null);
  const parisUtilitiesChartRef = useRef<HTMLDivElement>(null);
  const parisSportsLeisureChartRef = useRef<HTMLDivElement>(null);
  const parisClothingShoesChartRef = useRef<HTMLDivElement>(null);
  const newYorkGoodsChartRef = useRef<HTMLDivElement>(null);
  const newYorkProduceChartRef = useRef<HTMLDivElement>(null);
  const newYorkProteinChartRef = useRef<HTMLDivElement>(null);
  const newYorkRentChartRef = useRef<HTMLDivElement>(null);
  const newYorkBuyAptChartRef = useRef<HTMLDivElement>(null);
  const newYorkSalaryChartRef = useRef<HTMLDivElement>(null);
  const newYorkUtilitiesChartRef = useRef<HTMLDivElement>(null);
  const newYorkSportsLeisureChartRef = useRef<HTMLDivElement>(null);
  const newYorkClothingShoesChartRef = useRef<HTMLDivElement>(null);
  const newYorkTransportationChartRef = useRef<HTMLDivElement>(null);
  const tokyoGoodsChartRef = useRef<HTMLDivElement>(null);
  const tokyoProduceChartRef = useRef<HTMLDivElement>(null);
  const tokyoProteinChartRef = useRef<HTMLDivElement>(null);
  const tokyoRentChartRef = useRef<HTMLDivElement>(null);
  const tokyoBuyAptChartRef = useRef<HTMLDivElement>(null);
  const tokyoSalaryChartRef = useRef<HTMLDivElement>(null);
  const tokyoUtilitiesChartRef = useRef<HTMLDivElement>(null);
  const tokyoSportsLeisureChartRef = useRef<HTMLDivElement>(null);
  const tokyoClothingShoesChartRef = useRef<HTMLDivElement>(null);
  const tokyoTransportationChartRef = useRef<HTMLDivElement>(null);
  const tokyoRestaurantChartRef = useRef<HTMLDivElement>(null);
  const [selectedGoods, setSelectedGoods] = useState(goodsList.map(g => g.key));
  const [selectedProduce, setSelectedProduce] = useState(produceList.map(g => g.key));
  const [selectedProtein, setSelectedProtein] = useState(proteinList.map(g => g.key));
  const [selectedRent, setSelectedRent] = useState(rentList.map(g => g.key));
  const [selectedBuyApt, setSelectedBuyApt] = useState(buyAptList.map(g => g.key));
  const [selectedSalary, setSelectedSalary] = useState(salaryList.map(g => g.key));
  const [selectedUtilities, setSelectedUtilities] = useState(utilitiesList.map(u => u.key));
  const [selectedSportsLeisure, setSelectedSportsLeisure] = useState(sportsLeisureList.map(u => u.key));
  const [selectedClothingShoes, setSelectedClothingShoes] = useState(clothingShoesList.map(u => u.key));
  const [selectedTransportation, setSelectedTransportation] = useState(transportationList.map(u => u.key));
  const [selectedParisGoods, setSelectedParisGoods] = useState(goodsList.map(g => g.key));
  const [selectedParisProduce, setSelectedParisProduce] = useState(produceList.map(g => g.key));
  const [selectedParisProtein, setSelectedParisProtein] = useState(proteinList.map(g => g.key));
  const [selectedParisRent, setSelectedParisRent] = useState(rentList.map(g => g.key));
  const [selectedParisBuyApt, setSelectedParisBuyApt] = useState(buyAptList.map(g => g.key));
  const [selectedParisSalary, setSelectedParisSalary] = useState(salaryList.map(g => g.key));
  const [selectedParisTransportation, setSelectedParisTransportation] = useState(transportationList.map(g => g.key));
  const [selectedParisUtilities, setSelectedParisUtilities] = useState(utilitiesList.map(g => g.key));
  const [selectedParisSportsLeisure, setSelectedParisSportsLeisure] = useState(sportsLeisureList.map(g => g.key));
  const [selectedParisClothingShoes, setSelectedParisClothingShoes] = useState(clothingShoesList.map(g => g.key));
  const [selectedNewYorkGoods, setSelectedNewYorkGoods] = useState(goodsList.map(g => g.key));
  const [selectedNewYorkProduce, setSelectedNewYorkProduce] = useState(produceList.map(g => g.key));
  const [selectedNewYorkProtein, setSelectedNewYorkProtein] = useState(proteinList.map(g => g.key));
  const [selectedNewYorkRent, setSelectedNewYorkRent] = useState(rentList.map(g => g.key));
  const [selectedNewYorkBuyApt, setSelectedNewYorkBuyApt] = useState(buyAptList.map(g => g.key));
  const [selectedNewYorkSalary, setSelectedNewYorkSalary] = useState(salaryList.map(g => g.key));
  const [selectedNewYorkUtilities, setSelectedNewYorkUtilities] = useState(utilitiesList.map(u => u.key));
  const [selectedNewYorkSportsLeisure, setSelectedNewYorkSportsLeisure] = useState(sportsLeisureList.map(u => u.key));
  const [selectedNewYorkClothingShoes, setSelectedNewYorkClothingShoes] = useState(clothingShoesList.map(u => u.key));
  const [selectedNewYorkTransportation, setSelectedNewYorkTransportation] = useState(transportationList.map(u => u.key));

  // Tokyo state variables
  const [selectedTokyoGoods, setSelectedTokyoGoods] = useState(goodsList.map(g => g.key));
  const [selectedTokyoProduce, setSelectedTokyoProduce] = useState(produceList.map(g => g.key));
  const [selectedTokyoProtein, setSelectedTokyoProtein] = useState(proteinList.map(g => g.key));
  const [selectedTokyoRent, setSelectedTokyoRent] = useState(rentList.map(g => g.key));
  const [selectedTokyoBuyApt, setSelectedTokyoBuyApt] = useState(buyAptList.map(g => g.key));
  const [selectedTokyoSalary, setSelectedTokyoSalary] = useState(salaryList.map(g => g.key));
  const [selectedTokyoUtilities, setSelectedTokyoUtilities] = useState(utilitiesList.map(u => u.key));
  const [selectedTokyoSportsLeisure, setSelectedTokyoSportsLeisure] = useState(sportsLeisureList.map(u => u.key));
  const [selectedTokyoClothingShoes, setSelectedTokyoClothingShoes] = useState(clothingShoesList.map(u => u.key));
  const [selectedTokyoTransportation, setSelectedTokyoTransportation] = useState(transportationList.map(u => u.key));
  const [selectedTokyoRestaurant, setSelectedTokyoRestaurant] = useState(restaurantList.map(u => u.key));
  const [selectedTokyoBeverages, setSelectedTokyoBeverages] = useState(beveragesList.map(g => g.key));

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalData = await fetchGlobalData();
        setData(globalData);
      } catch (err) {
        setError('Failed to fetch economic data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inflationData = useMemo(() => {
    if (!data) return [];
    let filtered = data.inflationRates || [];
    const endYear = new Date().getFullYear();
    const startYear = selectedPeriod === '5y' ? endYear - 5 : selectedPeriod === '10y' ? endYear - 10 : 1960;
    return filtered.filter((item: any) => parseInt(item.year) >= startYear && parseInt(item.year) <= endYear);
  }, [data, selectedPeriod]);

  const latestStats = useMemo(() => {
    if (!inflationData.length) return [];
    const lastYear = inflationData[inflationData.length - 1].year;
    return selectedCountries.map(country => ({
      country,
      value: inflationData[inflationData.length - 1][country],
    }));
  }, [inflationData, selectedCountries]);

  const handleCountryToggle = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  // Sort cost of living data - useMemo must be before early returns (React hooks rule)
  const sortedCostOfLivingData = useMemo(() => {
    const sorted = [...costOfLivingData].sort((a, b) => {
      const aVal = a[colSortField as keyof typeof a];
      const bVal = b[colSortField as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return colSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return colSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
    return sorted;
  }, [colSortField, colSortDirection]);

  const handleColSort = (field: string) => {
    if (colSortField === field) {
      setColSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColSortField(field);
      setColSortDirection('asc');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Inflation & Cost of Living</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              Track inflation rates across countries and explore cost of living indices for major cities worldwide.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BulkChartDownload variant="primary" size="sm" />
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

        {/* Tab Navigation */}
        <div className={`flex gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('inflation')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'inflation'
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            Inflation Rates
          </button>
          <button
            onClick={() => setActiveTab('cost-of-living')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'cost-of-living'
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow')
                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
            }`}
          >
            Cost of Living Index
          </button>
        </div>

        {/* Inflation Tab Content */}
        {activeTab === 'inflation' && (
        <>
        {/* Country Selector */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(countryColors).map(country => {
              const isSelected = selectedCountries.includes(country);
              const FlagComponent = countryFlags[country];
              return (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium
                    ${isSelected 
                      ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900') 
                      : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                  `}
                >
                  {FlagComponent && <FlagComponent className="w-6 h-4 rounded" />}
                  {country}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="mb-4 flex gap-2">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className={`px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Time</option>
            <option value="10y">Last 10 Years</option>
            <option value="5y">Last 5 Years</option>
          </select>
        </div>

        {/* Key Stats */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {latestStats.map(({ country, value }) => {
            const FlagComponent = countryFlags[country];
            return (
              <div key={country} className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {FlagComponent && <FlagComponent className="w-6 h-4 rounded" />}
                  <span className="font-semibold text-lg">{country}</span>
                </div>
                <div className="text-2xl font-bold">{value !== undefined ? `${value.toFixed(2)}%` : 'N/A'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Latest available</div>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div 
          ref={inflationChartRef}
          data-chart-container
          data-chart-title="Inflation Rate Over Time"
          className={`rounded-lg shadow p-4 relative ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
        >
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-semibold">Inflation Rate Over Time</h2>
            <ChartDownloadButton
              chartElement={inflationChartRef.current}
              chartRef={inflationChartRef}
              chartData={{
                title: "Inflation Rate Over Time",
                data: inflationData,
                type: 'line',
                countries: selectedCountries
              }}
              variant="outline"
              size="sm"
            />
          </div>
          
          {/* Info Panel for Inflation Rate */}
          <InfoPanel
            metric={economicMetrics.inflationRate}
            isDarkMode={isDarkMode}
            position="top-right"
            size="medium"
          />
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                <Tooltip
                  contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                  labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                  formatter={(value: number) => `${value?.toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                {selectedCountries.map((country, idx) => (
                  <Line
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stroke={countryColors[country as keyof typeof countryColors] || '#6366f1'}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* London Prices Section */}
        <div className={`rounded-xl shadow-lg p-6 mt-8 mb-8 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
          <h2 className="text-2xl font-bold mb-2">London Prices</h2>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
            The following charts show the historical prices of essential goods, produce, protein, and apartment rentals in London. All values are in <span className='font-semibold'>GBP (£)</span> and reflect market averages for each year.
          </p>

          {/* Essential Goods Prices Chart */}
          <div 
            ref={londonGoodsChartRef}
            data-chart-container
            data-chart-title="Essential Goods Prices Over the Years"
            className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">Essential Goods Prices Over the Years</h2>
              <ChartDownloadButton
                chartElement={londonGoodsChartRef.current}
                chartRef={londonGoodsChartRef}
                chartData={{
                  title: "Essential Goods Prices Over the Years",
                  data: essentialGoodsData,
                  type: 'line',
                  countries: selectedGoods
                }}
                variant="outline"
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of key goods (in GBP) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Goods Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {goodsList.map(good => {
                const isSelected = selectedGoods.includes(good.key);
                return (
                  <button
                    key={good.key}
                    onClick={() => setSelectedGoods(prev =>
                      isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: good.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                    {good.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={essentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => `£${value?.toFixed(2)}`}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {goodsList.filter(good => selectedGoods.includes(good.key)).map(good => (
                    <Line
                      key={good.key}
                      type="monotone"
                      dataKey={good.key}
                      name={good.label}
                      stroke={good.color}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Produce Prices Chart */}
          <div 
            ref={londonProduceChartRef}
            data-chart-container
            data-chart-title="Fruit & Vegetable Prices Over the Years"
            className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">Fruit & Vegetable Prices Over the Years</h2>
              <ChartDownloadButton
                chartElement={londonProduceChartRef.current}
                chartRef={londonProduceChartRef}
                chartData={{
                  title: "Fruit & Vegetable Prices Over the Years",
                  data: produceData,
                  type: 'line',
                  countries: selectedProduce
                }}
                variant="outline"
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected fruits and vegetables (in GBP) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Produce Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {produceList.map(item => {
                const isSelected = selectedProduce.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedProduce(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={produceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `£${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {produceList.filter(item => selectedProduce.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protein Prices Chart */}
          <div 
            ref={londonProteinChartRef}
            data-chart-container
            data-chart-title="Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years"
            className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years</h2>
              <ChartDownloadButton
                chartElement={londonProteinChartRef.current}
                chartRef={londonProteinChartRef}
                chartData={{
                  title: "Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years",
                  data: proteinData,
                  type: 'line',
                  countries: selectedProtein
                }}
                variant="outline"
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected protein and related goods (in GBP) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Protein Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {proteinList.map(item => {
                const isSelected = selectedProtein.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedProtein(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={proteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `£${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {proteinList.filter(item => selectedProtein.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rent Prices Chart */}
          <div 
            ref={londonRentChartRef}
            data-chart-container
            data-chart-title="Apartment Rental Prices Over the Years"
            className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">Apartment Rental Prices Over the Years</h2>
              <ChartDownloadButton
                chartElement={londonRentChartRef.current}
                chartRef={londonRentChartRef}
                chartData={{
                  title: "Apartment Rental Prices Over the Years",
                  data: rentData,
                  type: 'line',
                  countries: selectedRent
                }}
                variant="outline"
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly rent (in GBP) for different apartment types from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Rent Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {rentList.map(item => {
                const isSelected = selectedRent.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedRent(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `£${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {rentList.filter(item => selectedRent.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Buy Apartment Price Chart */}
            <div 
              ref={londonBuyAptChartRef}
              data-chart-container
              data-chart-title="Buy Apartment Price per Square Meter"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Buy Apartment Price per Square Meter</h2>
                <ChartDownloadButton
                  chartElement={londonBuyAptChartRef.current}
                  chartRef={londonBuyAptChartRef}
                  chartData={{
                    title: "Buy Apartment Price per Square Meter",
                    data: buyAptData,
                    type: 'line',
                    countries: selectedBuyApt
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price per square meter (in GBP) to buy an apartment in London, both in the city centre and outside, from 2011 to 2024.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Buy Apartment Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {buyAptList.map(item => {
                  const isSelected = selectedBuyApt.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedBuyApt(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buyAptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value: number) => value !== null && value !== undefined ? `£${value.toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {buyAptList.filter(item => selectedBuyApt.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Salary Chart */}
            <div 
              ref={londonSalaryChartRef}
              data-chart-container
              data-chart-title="Average Monthly Net Salary (After Tax)"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Average Monthly Net Salary (After Tax)</h2>
                <ChartDownloadButton
                  chartElement={londonSalaryChartRef.current}
                  chartRef={londonSalaryChartRef}
                  chartData={{
                    title: "Average Monthly Net Salary (After Tax)",
                    data: salaryData,
                    type: 'line',
                    countries: selectedSalary
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly net salary (after tax, in GBP) in London from 2011 to 2024.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Salary Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {salaryList.map(item => {
                  const isSelected = selectedSalary.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedSalary(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value: number) => value !== null && value !== undefined ? `£${value.toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {salaryList.filter(item => selectedSalary.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Utilities (Monthly) Chart */}
            <div 
              ref={londonUtilitiesChartRef}
              data-chart-container
              data-chart-title="Utilities (Monthly) Over the Years"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Utilities (Monthly) Over the Years</h2>
                <ChartDownloadButton
                  chartElement={londonUtilitiesChartRef.current}
                  chartData={{
                    title: "Utilities (Monthly) Over the Years",
                    data: utilitiesData,
                    type: 'line',
                    countries: selectedUtilities
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly cost (in GBP) for utilities in London from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Utilities Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {utilitiesList.map(item => {
                  const isSelected = selectedUtilities.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedUtilities(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={utilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `£${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {utilitiesList.filter(item => selectedUtilities.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sports and Leisure Chart */}
            <div 
              ref={londonSportsLeisureChartRef}
              data-chart-container
              data-chart-title="Sports and Leisure Over the Years"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Sports and Leisure Over the Years</h2>
                <ChartDownloadButton
                  chartElement={londonSportsLeisureChartRef.current}
                  chartData={{
                    title: "Sports and Leisure Over the Years",
                    data: sportsLeisureData,
                    type: 'line',
                    countries: selectedSportsLeisure
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly cost (in GBP) for sports and leisure activities in London from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Sports and Leisure Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sportsLeisureList.map(item => {
                  const isSelected = selectedSportsLeisure.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedSportsLeisure(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `£${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {sportsLeisureList.filter(item => selectedSportsLeisure.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clothing and Shoes Chart */}
            <div 
              ref={londonClothingShoesChartRef}
              data-chart-container
              data-chart-title="Clothing and Shoes Over the Years"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Clothing and Shoes Over the Years</h2>
                <ChartDownloadButton
                  chartElement={londonClothingShoesChartRef.current}
                  chartData={{
                    title: "Clothing and Shoes Over the Years",
                    data: clothingShoesData,
                    type: 'line',
                    countries: selectedClothingShoes
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in GBP) for clothing and shoes in London from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Clothing and Shoes Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {clothingShoesList.map(item => {
                  const isSelected = selectedClothingShoes.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedClothingShoes(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `£${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {clothingShoesList.filter(item => selectedClothingShoes.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transportation Chart */}
            <div 
              ref={londonTransportationChartRef}
              data-chart-container
              data-chart-title="Transportation Over the Years"
              className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">Transportation Over the Years</h2>
                <ChartDownloadButton
                  chartElement={londonTransportationChartRef.current}
                  chartData={{
                    title: "Transportation Over the Years",
                    data: transportationData,
                    type: 'line',
                    countries: selectedTransportation
                  }}
                  variant="outline"
                  size="sm"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in GBP) for transportation in London from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Transportation Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {transportationList.map(item => {
                  const isSelected = selectedTransportation.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTransportation(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `£${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {transportationList.filter(item => selectedTransportation.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Paris Prices Section */}
        <div className={`rounded-xl shadow-lg p-6 mt-8 mb-8 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
          <h2 className="text-2xl font-bold mb-2">Paris Prices</h2>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
            The following charts will show the historical prices of essential goods, produce, protein, apartment rentals, and more in Paris. All values will be in <span className='font-semibold'>EUR (€)</span> and reflect market averages for each year.
          </p>

          {/* Essential Goods Prices Chart (Paris) */}
          <div 
            ref={parisGoodsChartRef}
            data-chart-container
            data-chart-title="Essential Goods Prices Over the Years (Paris)"
            className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">Essential Goods Prices Over the Years (Paris)</h2>
              <ChartDownloadButton
                chartElement={parisGoodsChartRef.current}
                chartData={{
                  title: "Essential Goods Prices Over the Years (Paris)",
                  data: parisEssentialGoodsData,
                  type: 'line',
                  countries: selectedParisGoods
                }}
                variant="outline"
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of key goods (in EUR) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Goods Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {goodsList.map(good => {
                const isSelected = selectedParisGoods.includes(good.key);
                return (
                  <button
                    key={good.key}
                    onClick={() => setSelectedParisGoods(prev =>
                      isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: good.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                    {good.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => `€${value?.toFixed(2)}`}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {goodsList.filter(good => selectedParisGoods.includes(good.key)).map(good => (
                    <Line
                      key={good.key}
                      type="monotone"
                      dataKey={good.key}
                      name={good.label}
                      stroke={good.color}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Produce Prices Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Fruit & Vegetable Prices Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected fruits and vegetables (in EUR) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Produce Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {produceList.map(item => {
                const isSelected = selectedParisProduce.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisProduce(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {produceList.filter(item => selectedParisProduce.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protein Prices Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected protein and related goods (in EUR) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Protein Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {proteinList.map(item => {
                const isSelected = selectedParisProtein.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisProtein(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {proteinList.filter(item => selectedParisProtein.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rent Prices Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Apartment Rental Prices Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly rent (in EUR) for different apartment types from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Rent Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {rentList.map(item => {
                const isSelected = selectedParisRent.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisRent(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {rentList.filter(item => selectedParisRent.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Buy Apartment Price Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Buy Apartment Price per Square Meter (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price per square meter (in EUR) to buy an apartment in Paris, both in the city centre and outside, from 2011 to 2024.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Buy Apartment Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {buyAptList.map(item => {
                const isSelected = selectedParisBuyApt.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisBuyApt(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisBuyAptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {buyAptList.filter(item => selectedParisBuyApt.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Average Monthly Net Salary (After Tax) (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly net salary (after tax, in EUR) in Paris from 2011 to 2024.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* Paris Salary Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {salaryList.map(item => {
                const isSelected = selectedParisSalary.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisSalary(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {salaryList.filter(item => selectedParisSalary.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Utilities (Monthly) Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Utilities (Monthly) Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly cost (in EUR) for utilities in Paris from 2011 to 2024. Data is based on market averages.
            </p>
            {/* Paris Utilities Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {utilitiesList.map(item => {
                const isSelected = selectedParisUtilities.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisUtilities(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {utilitiesList.filter(item => selectedParisUtilities.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sports and Leisure Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Sports and Leisure Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly cost (in EUR) for sports and leisure activities in Paris from 2011 to 2024. Data is based on market averages.
            </p>
            {/* Paris Sports and Leisure Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sportsLeisureList.map(item => {
                const isSelected = selectedParisSportsLeisure.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisSportsLeisure(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {sportsLeisureList.filter(item => selectedParisSportsLeisure.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clothing and Shoes Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Clothing and Shoes Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price (in EUR) for clothing and shoes in Paris from 2011 to 2024. Data is based on market averages.
            </p>
            {/* Paris Clothing and Shoes Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {clothingShoesList.map(item => {
                const isSelected = selectedParisClothingShoes.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisClothingShoes(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {clothingShoesList.filter(item => selectedParisClothingShoes.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transportation Chart (Paris) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Transportation Over the Years (Paris)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price (in EUR) for transportation in Paris from 2011 to 2024. Data is based on market averages.
            </p>
            {/* Paris Transportation Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {transportationList.map(item => {
                const isSelected = selectedParisTransportation.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedParisTransportation(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={parisTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value: number) => value !== null && value !== undefined ? `€${value.toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {transportationList.filter(item => selectedParisTransportation.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* New York Prices Section */}
        <div className={`rounded-xl shadow-lg p-6 mt-8 mb-8 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
          <h2 className="text-2xl font-bold mb-2">New York Prices</h2>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
            The following chart shows the historical prices of essential goods in New York City. All values are in <span className='font-semibold'>USD ($)</span> and reflect market averages for each year.
          </p>

          {/* Essential Goods Prices Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Essential Goods Prices Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of key goods (in USD) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {goodsList.map(good => (
                    <Line
                      key={good.key}
                      type="monotone"
                      dataKey={good.key}
                      name={good.label}
                      stroke={good.color}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fruit & Vegetable Prices Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Fruit & Vegetable Prices Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected fruits and vegetables (in USD) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Produce Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {produceList.map(item => {
                const isSelected = selectedNewYorkProduce.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkProduce(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {produceList.filter(item => selectedNewYorkProduce.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Protein Prices Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price of selected protein and related goods (in USD) from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Protein Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {proteinList.map(item => {
                const isSelected = selectedNewYorkProtein.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkProtein(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {proteinList.filter(item => selectedNewYorkProtein.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Apartment Rental Prices Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Apartment Rental Prices Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly rent (in USD) for different apartment types from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Rent Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {rentList.map(item => {
                const isSelected = selectedNewYorkRent.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkRent(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {rentList.filter(item => selectedNewYorkRent.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Buy Apartment Price per Square Meter Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Buy Apartment Price per Square Meter (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price per square meter (in USD) to buy an apartment in New York, both in the city centre and outside, from 2011 to 2024.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Buy Apartment Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {buyAptList.map(item => {
                const isSelected = selectedNewYorkBuyApt.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkBuyApt(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkBuyAptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {buyAptList.filter(item => selectedNewYorkBuyApt.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Monthly Net Salary (After Tax) Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Average Monthly Net Salary (After Tax) (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly net salary (after tax, in USD) in New York from 2011 to 2024.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Salary Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {salaryList.map(item => {
                const isSelected = selectedNewYorkSalary.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkSalary(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {salaryList.filter(item => selectedNewYorkSalary.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Utilities (Monthly) Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Utilities (Monthly) Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly cost (in USD) for utilities in New York from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Utilities Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {utilitiesList.map(item => {
                const isSelected = selectedNewYorkUtilities.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkUtilities(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {utilitiesList.filter(item => selectedNewYorkUtilities.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sports and Leisure Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Sports and Leisure Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average monthly cost (in USD) for sports and leisure activities in New York from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Sports and Leisure Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sportsLeisureList.map(item => {
                const isSelected = selectedNewYorkSportsLeisure.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkSportsLeisure(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {sportsLeisureList.filter(item => selectedNewYorkSportsLeisure.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clothing and Shoes Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Clothing and Shoes Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price (in USD) for clothing and shoes in New York from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Clothing and Shoes Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {clothingShoesList.map(item => {
                const isSelected = selectedNewYorkClothingShoes.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkClothingShoes(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {clothingShoesList.filter(item => selectedNewYorkClothingShoes.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transportation Chart (New York) */}
          <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-lg font-semibold mb-2">Transportation Over the Years (New York)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The chart below shows the average price (in USD) for transportation in New York from 2011 to 2024. Data is based on market averages.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
            {/* New York Transportation Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {transportationList.map(item => {
                const isSelected = selectedNewYorkTransportation.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelectedNewYorkTransportation(prev =>
                      isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                    )}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                      ${isSelected
                        ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                        : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                    `}
                    style={{ borderColor: item.color }}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newYorkTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                  <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                  <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                    formatter={(value) => value !== null && value !== undefined ? `$${Number(value).toFixed(2)}` : 'N/A'}
                    labelFormatter={label => `Year: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                  {transportationList.filter(item => selectedNewYorkTransportation.includes(item.key)).map(item => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.label}
                      stroke={item.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tokyo Prices Section */}
          <div className={`rounded-lg shadow p-6 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
            <h2 className="text-2xl font-bold mb-2">Tokyo Prices</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The following chart shows the historical prices of essential goods in Tokyo. All values are in <span className='font-semibold'>JPY (¥)</span> and reflect market averages for each year.
            </p>

            {/* Essential Goods Prices Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Essential Goods Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for essential goods in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Essential Goods Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {goodsList.map(item => {
                  const isSelected = selectedTokyoGoods.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoGoods(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {goodsList.filter(item => selectedTokyoGoods.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Beverages and Coffee Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Beverages and Coffee Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for beverages and coffee in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Beverages Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {beveragesList.map(item => {
                  const isSelected = selectedTokyoBeverages.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoBeverages(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoBeveragesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {beveragesList.filter(item => selectedTokyoBeverages.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fruit & Vegetable Prices Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Fruit & Vegetable Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for fruits and vegetables in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Produce Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {produceList.map(item => {
                  const isSelected = selectedTokyoProduce.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoProduce(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {produceList.filter(item => selectedTokyoProduce.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Protein Prices Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Cheese, Wine, Cigarettes, Chicken & Beef Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for protein items in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Protein Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {proteinList.map(item => {
                  const isSelected = selectedTokyoProtein.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoProtein(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {proteinList.filter(item => selectedTokyoProtein.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Apartment Rental Prices Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Apartment Rental Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly rent (in JPY) for apartments in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Rent Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {rentList.map(item => {
                  const isSelected = selectedTokyoRent.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoRent(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {rentList.filter(item => selectedTokyoRent.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Buy Apartment Price per Square Meter Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Buy Apartment Price per Square Meter (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price per square meter (in JPY) to buy an apartment in Tokyo, both in the city centre and outside, from 2011 to 2024.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Buy Apartment Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {buyAptList.map(item => {
                  const isSelected = selectedTokyoBuyApt.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoBuyApt(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoBuyAptData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {buyAptList.filter(item => selectedTokyoBuyApt.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Monthly Net Salary (After Tax) Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Average Monthly Net Salary (After Tax) (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly net salary (after tax, in JPY) in Tokyo from 2011 to 2024.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Salary Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {salaryList.map(item => {
                  const isSelected = selectedTokyoSalary.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoSalary(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {salaryList.filter(item => selectedTokyoSalary.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Utilities (Monthly) Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Utilities (Monthly) Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly cost (in JPY) for utilities in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Utilities Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {utilitiesList.map(item => {
                  const isSelected = selectedTokyoUtilities.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoUtilities(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {utilitiesList.filter(item => selectedTokyoUtilities.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sports and Leisure Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Sports and Leisure Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average monthly cost (in JPY) for sports and leisure activities in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Sports and Leisure Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sportsLeisureList.map(item => {
                  const isSelected = selectedTokyoSportsLeisure.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoSportsLeisure(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {sportsLeisureList.filter(item => selectedTokyoSportsLeisure.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clothing and Shoes Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Clothing and Shoes Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for clothing and shoes in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Clothing and Shoes Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {clothingShoesList.map(item => {
                  const isSelected = selectedTokyoClothingShoes.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoClothingShoes(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {clothingShoesList.filter(item => selectedTokyoClothingShoes.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transportation Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Transportation Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for transportation in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Transportation Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {transportationList.map(item => {
                  const isSelected = selectedTokyoTransportation.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoTransportation(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {transportationList.filter(item => selectedTokyoTransportation.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Restaurant Chart (Tokyo) */}
            <div className={`rounded-lg shadow p-4 mt-8 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}>
              <h2 className="text-lg font-semibold mb-2">Restaurant Prices Over the Years (Tokyo)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                The chart below shows the average price (in JPY) for restaurant meals in Tokyo from 2011 to 2024. Data is based on market averages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
              {/* Tokyo Restaurant Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurantList.map(item => {
                  const isSelected = selectedTokyoRestaurant.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedTokyoRestaurant(prev =>
                        isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                      )}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                        ${isSelected
                          ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                      `}
                      style={{ borderColor: item.color }}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokyoRestaurantData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                    <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                    <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(2)}`} />
                    <Tooltip
                      contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                      labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                      formatter={(value) => value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : 'N/A'}
                      labelFormatter={label => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                    {restaurantList.filter(item => selectedTokyoRestaurant.includes(item.key)).map(item => (
                      <Line
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2.5}
                        dot={false}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* Cost of Living Tab Content */}
        {activeTab === 'cost-of-living' && (
          <div className="space-y-6">
            {/* Introduction */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-xl font-bold mb-3">Cost of Living Index by City 2026</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                The Cost of Living Index compares the relative cost of living across cities worldwide, using New York City as the baseline (index = 100). 
                A city with an index of 80 means it is 20% cheaper than New York, while an index of 120 means it is 20% more expensive.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Cost of Living Index:</span> Relative indicator of consumer goods prices including groceries, restaurants, transportation, and utilities (excluding rent)
                </div>
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Rent Index:</span> Estimation of apartment rent prices compared to New York City
                </div>
                <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className="font-semibold">Purchasing Power:</span> Relative purchasing power in buying goods and services based on average net salary
                </div>
              </div>
            </div>

            {/* City Tabs Navigation */}
            <div className={`flex flex-wrap gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {[
                { id: 'overview' as CityTab, label: 'Overview', flag: null },
                { id: 'london' as CityTab, label: 'London', flag: '🇬🇧' },
                { id: 'paris' as CityTab, label: 'Paris', flag: '🇫🇷' },
                { id: 'tokyo' as CityTab, label: 'Tokyo', flag: '🇯🇵' },
                { id: 'newYork' as CityTab, label: 'New York', flag: '🇺🇸' },
              ].map(city => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityTab(city.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedCityTab === city.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {city.flag && <span>{city.flag}</span>}
                  {city.label}
                </button>
              ))}
            </div>

            {/* Overview Tab - Data Table */}
            {selectedCityTab === 'overview' && (
            <>
            {/* Data Table */}
            <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      {[
                        { key: 'rank', label: 'Rank' },
                        { key: 'city', label: 'City' },
                        { key: 'country', label: 'Country' },
                        { key: 'colIndex', label: 'Cost of Living' },
                        { key: 'rentIndex', label: 'Rent Index' },
                        { key: 'colPlusRent', label: 'COL + Rent' },
                        { key: 'groceriesIndex', label: 'Groceries' },
                        { key: 'restaurantIndex', label: 'Restaurant' },
                        { key: 'purchasingPower', label: 'Purchasing Power' },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => handleColSort(col.key)}
                          className={`px-4 py-3 text-left font-semibold cursor-pointer hover:bg-opacity-80 transition-colors ${
                            colSortField === col.key ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : ''
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {colSortField === col.key && (
                              <span>{colSortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedCostOfLivingData.map((row, idx) => (
                      <tr 
                        key={row.rank} 
                        className={`${idx % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')} hover:bg-opacity-80`}
                      >
                        <td className="px-4 py-3 font-medium">{row.rank}</td>
                        <td className="px-4 py-3 font-medium">{row.city}</td>
                        <td className="px-4 py-3">{row.country}</td>
                        <td className={`px-4 py-3 ${row.colIndex >= 100 ? 'text-red-500' : row.colIndex >= 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {row.colIndex.toFixed(1)}
                        </td>
                        <td className={`px-4 py-3 ${row.rentIndex >= 50 ? 'text-red-500' : row.rentIndex >= 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {row.rentIndex.toFixed(1)}
                        </td>
                        <td className="px-4 py-3">{row.colPlusRent.toFixed(1)}</td>
                        <td className="px-4 py-3">{row.groceriesIndex.toFixed(1)}</td>
                        <td className="px-4 py-3">{row.restaurantIndex.toFixed(1)}</td>
                        <td className={`px-4 py-3 ${row.purchasingPower >= 120 ? 'text-green-500' : row.purchasingPower >= 80 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {row.purchasingPower.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h3 className="text-lg font-bold mb-3">Most Expensive Cities</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li><span className="font-semibold">Zurich, Switzerland</span> - Highest cost of living index (118.5)</li>
                  <li><span className="font-semibold">Geneva, Switzerland</span> - Second highest (116.5)</li>
                  <li><span className="font-semibold">New York, USA</span> - Baseline city for comparison (100.0)</li>
                  <li><span className="font-semibold">San Francisco, USA</span> - Tech hub with high costs (97.6)</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h3 className="text-lg font-bold mb-3">Best Purchasing Power</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li><span className="font-semibold">Basel, Switzerland</span> - Highest purchasing power (183.7)</li>
                  <li><span className="font-semibold">Zurich, Switzerland</span> - High salaries offset costs (164.4)</li>
                  <li><span className="font-semibold">San Francisco, USA</span> - Strong tech salaries (151.0)</li>
                  <li><span className="font-semibold">Brisbane, Australia</span> - Good value for money (145.3)</li>
                </ul>
              </div>
            </div>

            {/* Data Source Attribution */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-semibold">Data Source:</span> This data is sourced from{' '}
                <a 
                  href="https://www.numbeo.com/cost-of-living/rankings.jsp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Numbeo Cost of Living Index 2026
                </a>
                . Numbeo is the world&apos;s largest cost of living database, powered by user-contributed data. 
                This table shows a representative sample of major global cities. Visit Numbeo for the complete dataset with 400+ cities.
              </p>
            </div>
            </>
            )}

            {/* London Tab Content */}
            {selectedCityTab === 'london' && (
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
                <h2 className="text-2xl font-bold mb-2">London Cost of Living</h2>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                  Explore detailed price trends for essential goods, produce, protein, housing, and more in London. All values are in <span className='font-semibold'>GBP (£)</span> and reflect market averages from 2011-2024.
                </p>
                
                {/* London Essential Goods Chart */}
                <div 
                  ref={londonGoodsChartRef}
                  data-chart-container
                  data-chart-title="London Essential Goods Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Essential Goods Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={londonGoodsChartRef.current}
                      chartRef={londonGoodsChartRef}
                      chartData={{
                        title: "London Essential Goods Prices",
                        data: essentialGoodsData,
                        type: 'line',
                        countries: selectedGoods
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average prices of key goods (in GBP) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {goodsList.map(good => {
                      const isSelected = selectedGoods.includes(good.key);
                      return (
                        <button
                          key={good.key}
                          onClick={() => setSelectedGoods(prev =>
                            isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: good.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                          {good.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={essentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `£${value?.toFixed(2)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {goodsList.filter(good => selectedGoods.includes(good.key)).map(good => (
                          <Line key={good.key} type="monotone" dataKey={good.key} name={good.label} stroke={good.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* London Produce Chart */}
                <div 
                  ref={londonProduceChartRef}
                  data-chart-container
                  data-chart-title="London Produce Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Fruit & Vegetable Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={londonProduceChartRef.current}
                      chartRef={londonProduceChartRef}
                      chartData={{
                        title: "London Produce Prices",
                        data: produceData,
                        type: 'line',
                        countries: selectedProduce
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average prices of fruits and vegetables (in GBP) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {produceList.map(item => {
                      const isSelected = selectedProduce.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedProduce(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={produceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `£${value?.toFixed(2)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {produceList.filter(item => selectedProduce.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* London Rent Chart */}
                <div 
                  ref={londonRentChartRef}
                  data-chart-container
                  data-chart-title="London Apartment Rental Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Apartment Rental Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={londonRentChartRef.current}
                      chartRef={londonRentChartRef}
                      chartData={{
                        title: "London Apartment Rental Prices",
                        data: rentData,
                        type: 'line',
                        countries: selectedRent
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly rental prices (in GBP) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rentList.map(item => {
                      const isSelected = selectedRent.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedRent(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `£${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {rentList.filter(item => selectedRent.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* London Salary Chart */}
                <div 
                  ref={londonSalaryChartRef}
                  data-chart-container
                  data-chart-title="London Average Net Salary"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Average Monthly Net Salary (After Tax)</h3>
                    <ChartDownloadButton
                      chartElement={londonSalaryChartRef.current}
                      chartRef={londonSalaryChartRef}
                      chartData={{
                        title: "London Average Net Salary",
                        data: salaryData,
                        type: 'line',
                        countries: ['salary']
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly net salary after tax (in GBP) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `£${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        <Line type="monotone" dataKey="salary" name="Monthly Net Salary" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* London Transportation Chart */}
                <div 
                  ref={londonTransportationChartRef}
                  data-chart-container
                  data-chart-title="London Transportation Costs"
                  className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Transportation Costs Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={londonTransportationChartRef.current}
                      chartRef={londonTransportationChartRef}
                      chartData={{
                        title: "London Transportation Costs",
                        data: transportationData,
                        type: 'line',
                        countries: selectedTransportation
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average transportation costs (in GBP) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transportationList.map(item => {
                      const isSelected = selectedTransportation.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedTransportation(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={transportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `£${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `£${value?.toFixed(2)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {transportationList.filter(item => selectedTransportation.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Paris Tab Content */}
            {selectedCityTab === 'paris' && (
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
                <h2 className="text-2xl font-bold mb-2">Paris Cost of Living</h2>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                  Explore detailed price trends for essential goods, produce, protein, housing, and more in Paris. All values are in <span className='font-semibold'>EUR (€)</span> and reflect market averages from 2011-2024.
                </p>
                
                {/* Paris Essential Goods Chart */}
                <div 
                  ref={parisGoodsChartRef}
                  data-chart-container
                  data-chart-title="Paris Essential Goods Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Essential Goods Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisGoodsChartRef.current}
                      chartRef={parisGoodsChartRef}
                      chartData={{
                        title: "Paris Essential Goods Prices",
                        data: parisEssentialGoodsData,
                        type: 'line',
                        countries: selectedParisGoods
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average prices of key goods (in EUR) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {goodsList.map(good => {
                      const isSelected = selectedParisGoods.includes(good.key);
                      return (
                        <button
                          key={good.key}
                          onClick={() => setSelectedParisGoods(prev =>
                            isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: good.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                          {good.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `€${value?.toFixed(2)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {goodsList.filter(good => selectedParisGoods.includes(good.key)).map(good => (
                          <Line key={good.key} type="monotone" dataKey={good.key} name={good.label} stroke={good.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Rent Chart */}
                <div 
                  ref={parisRentChartRef}
                  data-chart-container
                  data-chart-title="Paris Apartment Rental Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Apartment Rental Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisRentChartRef.current}
                      chartRef={parisRentChartRef}
                      chartData={{
                        title: "Paris Apartment Rental Prices",
                        data: parisRentData,
                        type: 'line',
                        countries: selectedParisRent
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly rental prices (in EUR) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rentList.map(item => {
                      const isSelected = selectedParisRent.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedParisRent(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `€${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {rentList.filter(item => selectedParisRent.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Salary Chart */}
                <div 
                  ref={parisSalaryChartRef}
                  data-chart-container
                  data-chart-title="Paris Average Net Salary"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Average Monthly Net Salary (After Tax)</h3>
                    <ChartDownloadButton
                      chartElement={parisSalaryChartRef.current}
                      chartRef={parisSalaryChartRef}
                      chartData={{
                        title: "Paris Average Net Salary",
                        data: parisSalaryData,
                        type: 'line',
                        countries: ['salary']
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly net salary after tax (in EUR) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `€${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        <Line type="monotone" dataKey="salary" name="Monthly Net Salary" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Produce Chart */}
                <div 
                  ref={parisProduceChartRef}
                  data-chart-container
                  data-chart-title="Paris Produce Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Fruit & Vegetable Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisProduceChartRef.current}
                      chartRef={parisProduceChartRef}
                      chartData={{ title: "Paris Produce Prices", data: parisProduceData, type: 'line', countries: selectedParisProduce }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of fruits and vegetables (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {produceList.map(item => {
                      const isSelected = selectedParisProduce.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisProduce(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {produceList.filter(item => selectedParisProduce.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Protein Chart */}
                <div 
                  ref={parisProteinChartRef}
                  data-chart-container
                  data-chart-title="Paris Protein & Specialty Items"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Protein & Specialty Items Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisProteinChartRef.current}
                      chartRef={parisProteinChartRef}
                      chartData={{ title: "Paris Protein & Specialty Items", data: parisProteinData, type: 'line', countries: selectedParisProtein }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of protein and specialty items (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {proteinList.map(item => {
                      const isSelected = selectedParisProtein.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisProtein(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {proteinList.filter(item => selectedParisProtein.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Transportation Chart */}
                <div 
                  ref={parisTransportationChartRef}
                  data-chart-container
                  data-chart-title="Paris Transportation Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Transportation Costs Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisTransportationChartRef.current}
                      chartRef={parisTransportationChartRef}
                      chartData={{ title: "Paris Transportation Costs", data: parisTransportationData, type: 'line', countries: selectedParisTransportation }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average transportation costs (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transportationList.map(item => {
                      const isSelected = selectedParisTransportation.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisTransportation(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {transportationList.filter(item => selectedParisTransportation.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Utilities Chart */}
                <div 
                  ref={parisUtilitiesChartRef}
                  data-chart-container
                  data-chart-title="Paris Utilities Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Utilities Costs Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisUtilitiesChartRef.current}
                      chartRef={parisUtilitiesChartRef}
                      chartData={{ title: "Paris Utilities Costs", data: parisUtilitiesData, type: 'line', countries: selectedParisUtilities }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average monthly utilities costs (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {utilitiesList.map(item => {
                      const isSelected = selectedParisUtilities.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisUtilities(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {utilitiesList.filter(item => selectedParisUtilities.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Sports & Leisure Chart */}
                <div 
                  ref={parisSportsLeisureChartRef}
                  data-chart-container
                  data-chart-title="Paris Sports & Leisure Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Sports & Leisure Costs Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisSportsLeisureChartRef.current}
                      chartRef={parisSportsLeisureChartRef}
                      chartData={{ title: "Paris Sports & Leisure Costs", data: parisSportsLeisureData, type: 'line', countries: selectedParisSportsLeisure }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average sports and leisure costs (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sportsLeisureList.map(item => {
                      const isSelected = selectedParisSportsLeisure.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisSportsLeisure(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {sportsLeisureList.filter(item => selectedParisSportsLeisure.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Paris Clothing & Shoes Chart */}
                <div 
                  ref={parisClothingShoesChartRef}
                  data-chart-container
                  data-chart-title="Paris Clothing & Shoes Prices"
                  className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Clothing & Shoes Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={parisClothingShoesChartRef.current}
                      chartRef={parisClothingShoesChartRef}
                      chartData={{ title: "Paris Clothing & Shoes Prices", data: parisClothingShoesData, type: 'line', countries: selectedParisClothingShoes }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average clothing and shoes prices (in EUR) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clothingShoesList.map(item => {
                      const isSelected = selectedParisClothingShoes.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedParisClothingShoes(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={parisClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `€${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `€${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {clothingShoesList.filter(item => selectedParisClothingShoes.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Tokyo Tab Content */}
            {selectedCityTab === 'tokyo' && (
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
                <h2 className="text-2xl font-bold mb-2">Tokyo Cost of Living</h2>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                  Explore detailed price trends for essential goods, produce, protein, housing, and more in Tokyo. All values are in <span className='font-semibold'>JPY (¥)</span> and reflect market averages from 2011-2024.
                </p>
                
                {/* Tokyo Essential Goods Chart */}
                <div 
                  ref={tokyoGoodsChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Essential Goods Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Essential Goods Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={tokyoGoodsChartRef.current}
                      chartRef={tokyoGoodsChartRef}
                      chartData={{
                        title: "Tokyo Essential Goods Prices",
                        data: tokyoEssentialGoodsData,
                        type: 'line',
                        countries: selectedTokyoGoods
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average prices of key goods (in JPY) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {goodsList.map(good => {
                      const isSelected = selectedTokyoGoods.includes(good.key);
                      return (
                        <button
                          key={good.key}
                          onClick={() => setSelectedTokyoGoods(prev =>
                            isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: good.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                          {good.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `¥${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {goodsList.filter(good => selectedTokyoGoods.includes(good.key)).map(good => (
                          <Line key={good.key} type="monotone" dataKey={good.key} name={good.label} stroke={good.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Rent Chart */}
                <div 
                  ref={tokyoRentChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Apartment Rental Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Apartment Rental Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={tokyoRentChartRef.current}
                      chartRef={tokyoRentChartRef}
                      chartData={{
                        title: "Tokyo Apartment Rental Prices",
                        data: tokyoRentData,
                        type: 'line',
                        countries: selectedTokyoRent
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly rental prices (in JPY) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rentList.map(item => {
                      const isSelected = selectedTokyoRent.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedTokyoRent(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `¥${value?.toLocaleString()}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {rentList.filter(item => selectedTokyoRent.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Salary Chart */}
                <div 
                  ref={tokyoSalaryChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Average Net Salary"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Average Monthly Net Salary (After Tax)</h3>
                    <ChartDownloadButton
                      chartElement={tokyoSalaryChartRef.current}
                      chartRef={tokyoSalaryChartRef}
                      chartData={{
                        title: "Tokyo Average Net Salary",
                        data: tokyoSalaryData,
                        type: 'line',
                        countries: ['salary']
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly net salary after tax (in JPY) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `¥${value?.toLocaleString()}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        <Line type="monotone" dataKey="salary" name="Monthly Net Salary" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Produce Chart */}
                <div 
                  ref={tokyoProduceChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Produce Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Fruit & Vegetable Prices Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoProduceChartRef.current} chartRef={tokyoProduceChartRef} chartData={{ title: "Tokyo Produce Prices", data: tokyoProduceData, type: 'line', countries: selectedTokyoProduce }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of fruits and vegetables (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {produceList.map(item => {
                      const isSelected = selectedTokyoProduce.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoProduce(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {produceList.filter(item => selectedTokyoProduce.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Protein Chart */}
                <div 
                  ref={tokyoProteinChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Protein & Specialty Items"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Protein & Specialty Items Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoProteinChartRef.current} chartRef={tokyoProteinChartRef} chartData={{ title: "Tokyo Protein & Specialty Items", data: tokyoProteinData, type: 'line', countries: selectedTokyoProtein }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of protein and specialty items (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {proteinList.map(item => {
                      const isSelected = selectedTokyoProtein.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoProtein(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {proteinList.filter(item => selectedTokyoProtein.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Transportation Chart */}
                <div 
                  ref={tokyoTransportationChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Transportation Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Transportation Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoTransportationChartRef.current} chartRef={tokyoTransportationChartRef} chartData={{ title: "Tokyo Transportation Costs", data: tokyoTransportationData, type: 'line', countries: selectedTokyoTransportation }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average transportation costs (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transportationList.map(item => {
                      const isSelected = selectedTokyoTransportation.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoTransportation(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {transportationList.filter(item => selectedTokyoTransportation.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Utilities Chart */}
                <div 
                  ref={tokyoUtilitiesChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Utilities Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Utilities Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoUtilitiesChartRef.current} chartRef={tokyoUtilitiesChartRef} chartData={{ title: "Tokyo Utilities Costs", data: tokyoUtilitiesData, type: 'line', countries: selectedTokyoUtilities }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average monthly utilities costs (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {utilitiesList.map(item => {
                      const isSelected = selectedTokyoUtilities.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoUtilities(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {utilitiesList.filter(item => selectedTokyoUtilities.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Sports & Leisure Chart */}
                <div 
                  ref={tokyoSportsLeisureChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Sports & Leisure Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Sports & Leisure Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoSportsLeisureChartRef.current} chartRef={tokyoSportsLeisureChartRef} chartData={{ title: "Tokyo Sports & Leisure Costs", data: tokyoSportsLeisureData, type: 'line', countries: selectedTokyoSportsLeisure }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average sports and leisure costs (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sportsLeisureList.map(item => {
                      const isSelected = selectedTokyoSportsLeisure.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoSportsLeisure(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {sportsLeisureList.filter(item => selectedTokyoSportsLeisure.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tokyo Clothing & Shoes Chart */}
                <div 
                  ref={tokyoClothingShoesChartRef}
                  data-chart-container
                  data-chart-title="Tokyo Clothing & Shoes Prices"
                  className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Clothing & Shoes Prices Over the Years</h3>
                    <ChartDownloadButton chartElement={tokyoClothingShoesChartRef.current} chartRef={tokyoClothingShoesChartRef} chartData={{ title: "Tokyo Clothing & Shoes Prices", data: tokyoClothingShoesData, type: 'line', countries: selectedTokyoClothingShoes }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average clothing and shoes prices (in JPY) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clothingShoesList.map(item => {
                      const isSelected = selectedTokyoClothingShoes.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedTokyoClothingShoes(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tokyoClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `¥${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `¥${value?.toLocaleString()}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {clothingShoesList.filter(item => selectedTokyoClothingShoes.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* New York Tab Content */}
            {selectedCityTab === 'newYork' && (
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-[#151a23]' : 'bg-gray-50'} transition-colors duration-200`}> 
                <h2 className="text-2xl font-bold mb-2">New York Cost of Living</h2>
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
                  Explore detailed price trends for essential goods, produce, protein, housing, and more in New York. All values are in <span className='font-semibold'>USD ($)</span> and reflect market averages from 2011-2024.
                </p>
                
                {/* New York Essential Goods Chart */}
                <div 
                  ref={newYorkGoodsChartRef}
                  data-chart-container
                  data-chart-title="New York Essential Goods Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Essential Goods Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={newYorkGoodsChartRef.current}
                      chartRef={newYorkGoodsChartRef}
                      chartData={{
                        title: "New York Essential Goods Prices",
                        data: newYorkEssentialGoodsData,
                        type: 'line',
                        countries: selectedNewYorkGoods
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average prices of key goods (in USD) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {goodsList.map(good => {
                      const isSelected = selectedNewYorkGoods.includes(good.key);
                      return (
                        <button
                          key={good.key}
                          onClick={() => setSelectedNewYorkGoods(prev =>
                            isSelected ? prev.filter(k => k !== good.key) : [...prev, good.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: good.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: good.color }} />
                          {good.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkEssentialGoodsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `$${value?.toFixed(2)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {goodsList.filter(good => selectedNewYorkGoods.includes(good.key)).map(good => (
                          <Line key={good.key} type="monotone" dataKey={good.key} name={good.label} stroke={good.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Rent Chart */}
                <div 
                  ref={newYorkRentChartRef}
                  data-chart-container
                  data-chart-title="New York Apartment Rental Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Apartment Rental Prices Over the Years</h3>
                    <ChartDownloadButton
                      chartElement={newYorkRentChartRef.current}
                      chartRef={newYorkRentChartRef}
                      chartData={{
                        title: "New York Apartment Rental Prices",
                        data: newYorkRentData,
                        type: 'line',
                        countries: selectedNewYorkRent
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly rental prices (in USD) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rentList.map(item => {
                      const isSelected = selectedNewYorkRent.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          onClick={() => setSelectedNewYorkRent(prev =>
                            isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key]
                          )}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150
                            ${isSelected
                              ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400')
                              : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}
                          `}
                          style={{ borderColor: item.color }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkRentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `$${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {rentList.filter(item => selectedNewYorkRent.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Salary Chart */}
                <div 
                  ref={newYorkSalaryChartRef}
                  data-chart-container
                  data-chart-title="New York Average Net Salary"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Average Monthly Net Salary (After Tax)</h3>
                    <ChartDownloadButton
                      chartElement={newYorkSalaryChartRef.current}
                      chartRef={newYorkSalaryChartRef}
                      chartData={{
                        title: "New York Average Net Salary",
                        data: newYorkSalaryData,
                        type: 'line',
                        countries: ['salary']
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Average monthly net salary after tax (in USD) from 2011 to 2024.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkSalaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip
                          contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }}
                          labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
                          formatter={(value: number) => `$${value?.toFixed(0)}`}
                          labelFormatter={label => `Year: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        <Line type="monotone" dataKey="salary" name="Monthly Net Salary" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Produce Chart */}
                <div 
                  ref={newYorkProduceChartRef}
                  data-chart-container
                  data-chart-title="New York Produce Prices"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Fruit & Vegetable Prices Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkProduceChartRef.current} chartRef={newYorkProduceChartRef} chartData={{ title: "New York Produce Prices", data: newYorkProduceData, type: 'line', countries: selectedNewYorkProduce }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of fruits and vegetables (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {produceList.map(item => {
                      const isSelected = selectedNewYorkProduce.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkProduce(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkProduceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {produceList.filter(item => selectedNewYorkProduce.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Protein Chart */}
                <div 
                  ref={newYorkProteinChartRef}
                  data-chart-container
                  data-chart-title="New York Protein & Specialty Items"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Protein & Specialty Items Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkProteinChartRef.current} chartRef={newYorkProteinChartRef} chartData={{ title: "New York Protein & Specialty Items", data: newYorkProteinData, type: 'line', countries: selectedNewYorkProtein }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average prices of protein and specialty items (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {proteinList.map(item => {
                      const isSelected = selectedNewYorkProtein.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkProtein(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkProteinData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {proteinList.filter(item => selectedNewYorkProtein.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Transportation Chart */}
                <div 
                  ref={newYorkTransportationChartRef}
                  data-chart-container
                  data-chart-title="New York Transportation Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Transportation Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkTransportationChartRef.current} chartRef={newYorkTransportationChartRef} chartData={{ title: "New York Transportation Costs", data: newYorkTransportationData, type: 'line', countries: selectedNewYorkTransportation }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average transportation costs (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {transportationList.map(item => {
                      const isSelected = selectedNewYorkTransportation.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkTransportation(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkTransportationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(2)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {transportationList.filter(item => selectedNewYorkTransportation.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Utilities Chart */}
                <div 
                  ref={newYorkUtilitiesChartRef}
                  data-chart-container
                  data-chart-title="New York Utilities Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Utilities Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkUtilitiesChartRef.current} chartRef={newYorkUtilitiesChartRef} chartData={{ title: "New York Utilities Costs", data: newYorkUtilitiesData, type: 'line', countries: selectedNewYorkUtilities }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average monthly utilities costs (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {utilitiesList.map(item => {
                      const isSelected = selectedNewYorkUtilities.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkUtilities(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkUtilitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {utilitiesList.filter(item => selectedNewYorkUtilities.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Sports & Leisure Chart */}
                <div 
                  ref={newYorkSportsLeisureChartRef}
                  data-chart-container
                  data-chart-title="New York Sports & Leisure Costs"
                  className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Sports & Leisure Costs Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkSportsLeisureChartRef.current} chartRef={newYorkSportsLeisureChartRef} chartData={{ title: "New York Sports & Leisure Costs", data: newYorkSportsLeisureData, type: 'line', countries: selectedNewYorkSportsLeisure }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average sports and leisure costs (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sportsLeisureList.map(item => {
                      const isSelected = selectedNewYorkSportsLeisure.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkSportsLeisure(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkSportsLeisureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {sportsLeisureList.filter(item => selectedNewYorkSportsLeisure.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* New York Clothing & Shoes Chart */}
                <div 
                  ref={newYorkClothingShoesChartRef}
                  data-chart-container
                  data-chart-title="New York Clothing & Shoes Prices"
                  className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">Clothing & Shoes Prices Over the Years</h3>
                    <ChartDownloadButton chartElement={newYorkClothingShoesChartRef.current} chartRef={newYorkClothingShoesChartRef} chartData={{ title: "New York Clothing & Shoes Prices", data: newYorkClothingShoesData, type: 'line', countries: selectedNewYorkClothingShoes }} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Average clothing and shoes prices (in USD) from 2011 to 2024.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clothingShoesList.map(item => {
                      const isSelected = selectedNewYorkClothingShoes.includes(item.key);
                      return (
                        <button key={item.key} onClick={() => setSelectedNewYorkClothingShoes(prev => isSelected ? prev.filter(k => k !== item.key) : [...prev, item.key])}
                          className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 ${isSelected ? (isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-100 text-blue-900 border-blue-400') : (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200')}`}
                          style={{ borderColor: item.color }}>
                          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: item.color }} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newYorkClothingShoesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
                        <XAxis dataKey="year" stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} />
                        <YAxis stroke={isDarkMode ? '#e5e7eb' : '#374151'} tick={{ fill: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }} tickFormatter={v => `$${v.toFixed(0)}`} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 } : { fontSize: 16 }} labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }} formatter={(value: number) => `$${value?.toFixed(2)}`} labelFormatter={label => `Year: ${label}`} />
                        <Legend wrapperStyle={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 600, fontSize: 15 }} />
                        {clothingShoesList.filter(item => selectedNewYorkClothingShoes.includes(item.key)).map(item => (
                          <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2.5} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 