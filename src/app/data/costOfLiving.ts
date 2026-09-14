import { CITY_LABELS, type CityId } from './cities';

// Curated cost-of-living price series, scraped from Numbeo city pages and
// frozen here as a snapshot. These are not fetched at runtime: Numbeo has no
// open API, and the numbers only change once a year.
//
// Lifted out of inflation/page.tsx, which had grown to ~5,900 lines because
// these tables and four near-identical sets of chart markup lived inline.

// Essential goods price data (2011-2024)
export const essentialGoodsData = [
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
export const goodsList = [
  { key: 'milk', label: 'Milk (1L)', color: '#2563eb' },
  { key: 'bread', label: 'Bread (500g)', color: '#f59e42' },
  { key: 'eggs', label: 'Eggs (12)', color: '#e11d48' },
  { key: 'water', label: 'Water (1.5L)', color: '#10b981' },
  { key: 'domesticBeer', label: 'Domestic Beer (0.5L)', color: '#a21caf' },
  { key: 'importedBeer', label: 'Imported Beer (0.33L)', color: '#fbbf24' },
];

// Fruit & Vegetable price data (2011-2024)
export const produceData = [
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

export const produceList = [
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
export const proteinData = [
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

export const proteinList = [
  { key: 'cheese', label: 'Local Cheese (1kg)', color: '#fbbf24' },
  { key: 'wine', label: 'Bottle of Wine (Mid-Range)', color: '#6366f1' },
  { key: 'cigarettes', label: 'Cigarettes 20 Pack (Marlboro)', color: '#ef4444' },
  { key: 'chicken', label: 'Chicken Fillets (1kg)', color: '#10b981' },
  { key: 'beef', label: 'Beef Round (1kg)', color: '#a21caf' },
];

// Apartment rental price data (2011-2024)
export const rentData = [
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

export const rentList = [
  { key: 'apt1city', label: 'Apartment (1 bed) City Centre', color: '#6366f1' },
  { key: 'apt1out', label: 'Apartment (1 bed) Outside Centre', color: '#f59e42' },
  { key: 'apt3city', label: 'Apartment (3 bed) City Centre', color: '#10b981' },
  { key: 'apt3out', label: 'Apartment (3 bed) Outside Centre', color: '#ef4444' },
];

// Buy Apartment Price data (2011-2024)
export const buyAptData = [
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

export const buyAptList = [
  { key: 'city', label: 'City Centre', color: '#6366f1' },
  { key: 'out', label: 'Outside Centre', color: '#f59e42' },
];

// Average Monthly Net Salary data (2011-2024)
export const salaryData = [
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

export const salaryList = [
  { key: 'salary', label: 'Average Monthly Net Salary (After Tax)', color: '#6366f1' },
];

// Utilities (Monthly) data (2011-2024)
export const utilitiesData = [
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

export const utilitiesList = [
  { key: 'basic', label: 'Basic (Electricity, Heating, Cooling, Water, Garbage)', color: '#6366f1' },
  { key: 'internet', label: 'Internet (60 Mbps+)', color: '#10b981' },
  { key: 'mobile', label: 'Mobile Phone (10GB+ Data)', color: '#f59e42' },
];

// Sports and Leisure data (2011-2024)
export const sportsLeisureData = [
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

export const sportsLeisureList = [
  { key: 'fitness', label: 'Fitness Club (Monthly Fee)', color: '#6366f1' },
  { key: 'tennis', label: 'Tennis Court Rent (1hr Weekend)', color: '#10b981' },
  { key: 'cinema', label: 'Cinema (1 Seat, Intl Release)', color: '#f59e42' },
];

// Clothing and Shoes data (2011-2024)
export const clothingShoesData = [
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

export const clothingShoesList = [
  { key: 'jeans', label: '1 Pair of Jeans (Levis 501 or Similar)', color: '#6366f1' },
  { key: 'dress', label: '1 Summer Dress (Chain Store)', color: '#10b981' },
  { key: 'nike', label: '1 Pair of Nike Running Shoes', color: '#f59e42' },
  { key: 'leather', label: '1 Pair of Men Leather Business Shoes', color: '#ef4444' },
];

// Transportation data (2011-2024)
export const transportationData = [
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

export const transportationList = [
  { key: 'ticket', label: 'One-way Ticket (Local Transport)', color: '#6366f1' },
  { key: 'gasoline', label: 'Gasoline (1 liter)', color: '#10b981' },
];

export const restaurantList = [
  { key: 'inexpensive', label: 'Meal, Inexpensive Restaurant', color: '#6366f1' },
  { key: 'midrange', label: 'Meal for 2 People, Mid-range Restaurant, Three-course', color: '#10b981' },
  { key: 'mcdonalds', label: 'McMeal at McDonalds (or Equivalent Combo Meal)', color: '#f59e42' },
];

export const beveragesList = [
  { key: 'domesticBeer', label: 'Domestic Beer (0.5 liter draught)', color: '#6366f1' },
  { key: 'importedBeer', label: 'Imported Beer (0.33 liter bottle)', color: '#10b981' },
  { key: 'coke', label: 'Coke/Pepsi (0.33 liter bottle)', color: '#f59e42' },
  { key: 'water', label: 'Water (0.33 liter bottle)', color: '#8b5cf6' },
  { key: 'cappuccino', label: 'Cappuccino (regular)', color: '#ef4444' },
];

// Paris Essential Goods price data (2011-2024)
export const parisEssentialGoodsData = [
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
export const newYorkEssentialGoodsData = [
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
export const newYorkProduceData = [
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
export const newYorkProteinData = [
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
export const newYorkRentData = [
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
export const newYorkBuyAptData = [
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
export const newYorkSalaryData = [
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
export const newYorkUtilitiesData = [
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
export const newYorkSportsLeisureData = [
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
export const newYorkClothingShoesData = [
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
export const newYorkTransportationData = [
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
export const tokyoEssentialGoodsData = [
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
export const tokyoProduceData = [
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
export const tokyoProteinData = [
  { year: 2011, cheese: 1266.77, wine: 1583.47, cigarettes: 636.80, chicken: 931.20, beef: null },
  { year: 2012, cheese: 2494.69, wine: 1366.67, cigarettes: 426.67, chicken: 851.25, beef: null },
  { year: 2013, cheese: 2487.50, wine: 1520.83, cigarettes: 438.89, chicken: 1065.56, beef: null },
  { year: 2014, cheese: 1784.55, wine: 1342.86, cigarettes: 450.40, chicken: 808.96, beef: null },
  { year: 2015, cheese: 1985.71, wine: 1486.67, cigarettes: 447.78, chicken: 782.50, beef: 2550.00 },
  { year: 2016, cheese: 2150.00, wine: 2166.67, cigarettes: 440.33, chicken: 896.36, beef: 1711.37 },
  { year: 2017, cheese: 1660.00, wine: 1733.33, cigarettes: 460.00, chicken: 971.67, beef: 2766.67 },
  { year: 2018, cheese: 1100.00, wine: 1292.31, cigarettes: 467.50, chicken: 829.23, beef: 2380.76 },
  { year: 2019, cheese: 1675.00, wine: 1362.50, cigarettes: 517.50, chicken: 870.91, beef: 2913.33 },
  { year: 2020, cheese: 1487.50, wine: 1393.33, cigarettes: 524.29, chicken: 980.83, beef: 2308.89 },
  { year: 2021, cheese: 2417.69, wine: 1496.15, cigarettes: 543.00, chicken: 1050.00, beef: 3149.00 },
  { year: 2022, cheese: 1837.00, wine: 1377.33, cigarettes: 611.11, chicken: 1126.00, beef: 2822.22 },
  { year: 2023, cheese: 2712.00, wine: 1054.44, cigarettes: 576.92, chicken: 1058.12, beef: 2973.08 },
  { year: 2024, cheese: 1848.89, wine: 1625.00, cigarettes: 580.00, chicken: 1164.17, beef: 4028.57 },
];

// Tokyo Rent price data (2011-2024)
export const tokyoRentData = [
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
export const tokyoBuyAptData = [
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
export const tokyoSalaryData = [
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
export const tokyoUtilitiesData = [
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
export const tokyoSportsLeisureData = [
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
export const tokyoClothingShoesData = [
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
export const tokyoTransportationData = [
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
export const tokyoRestaurantData = [
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
export const tokyoBeveragesData = [
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
export const parisProduceData = [
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
export const parisProteinData = [
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
export const parisRentData = [
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
export const parisBuyAptData = [
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
export const parisSalaryData = [
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
export const parisTransportationData = [
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
export const parisUtilitiesData = [
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
export const parisSportsLeisureData = [
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
export const parisClothingShoesData = [
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
export const costOfLivingData = [
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

// ---------------------------------------------------------------------------
// City panel configuration
//
// Every city panel is the same thing repeated: a title, a sentence of
// context, a price table and the list of series a reader can toggle. The
// page used to spell all of that out in JSX, four times over, which is how
// London ended up with five sections under the Cost of Living tab and ten
// under the Inflation tab. Describing the panels as data means one set of
// markup renders all of them and the two tabs cannot drift again.
// ---------------------------------------------------------------------------

export interface PriceSeries {
  key: string;
  label: string;
  color: string;
}

export interface PriceRow {
  year: number;
  [series: string]: number | null;
}

export interface CitySection {
  /** Stable slug, used for the DOM id and the chart-download filename. */
  id: string;
  title: string;
  blurb: string;
  data: PriceRow[];
  series: PriceSeries[];
}

export interface CityProfile {
  id: CityId;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  /** Yen prices run into the thousands, where cents are just noise. */
  decimals: number;
  sections: CitySection[];
}

function sections(
  currency: string,
  tables: {
    goods: PriceRow[];
    produce: PriceRow[];
    protein: PriceRow[];
    rent: PriceRow[];
    buyApt: PriceRow[];
    salary: PriceRow[];
    utilities: PriceRow[];
    sportsLeisure: PriceRow[];
    clothingShoes: PriceRow[];
    transportation: PriceRow[];
  },
): CitySection[] {
  return [
    {
      id: 'essential-goods',
      title: 'Essential Goods',
      blurb: `Supermarket staples in ${currency}, 2011 to 2024.`,
      data: tables.goods,
      series: goodsList,
    },
    {
      id: 'produce',
      title: 'Fruit & Vegetables',
      blurb: `Fresh produce in ${currency}. Gaps are years Numbeo had too few submissions to publish.`,
      data: tables.produce,
      series: produceList,
    },
    {
      id: 'protein',
      title: 'Cheese, Wine, Cigarettes, Chicken & Beef',
      blurb: `Higher-value grocery items in ${currency}, where price moves show up earlier than in the headline index.`,
      data: tables.protein,
      series: proteinList,
    },
    {
      id: 'rent',
      title: 'Apartment Rents',
      blurb: `Monthly rent in ${currency}, split by apartment size and distance from the centre.`,
      data: tables.rent,
      series: rentList,
    },
    {
      id: 'buy-apartment',
      title: 'Apartment Purchase Price per m²',
      blurb: `Asking price per square metre in ${currency}.`,
      data: tables.buyApt,
      series: buyAptList,
    },
    {
      id: 'salary',
      title: 'Average Monthly Net Salary',
      blurb: `Take-home pay in ${currency}. Read it against the rent series above to see what has actually got more expensive.`,
      data: tables.salary,
      series: salaryList,
    },
    {
      id: 'utilities',
      title: 'Utilities',
      blurb: `Monthly household bills in ${currency}.`,
      data: tables.utilities,
      series: utilitiesList,
    },
    {
      id: 'sports-leisure',
      title: 'Sports & Leisure',
      blurb: `Discretionary spending in ${currency}.`,
      data: tables.sportsLeisure,
      series: sportsLeisureList,
    },
    {
      id: 'clothing-shoes',
      title: 'Clothing & Shoes',
      blurb: `Chain-store clothing in ${currency}, priced on identical items across cities.`,
      data: tables.clothingShoes,
      series: clothingShoesList,
    },
    {
      id: 'transportation',
      title: 'Transport',
      blurb: `Fares and fuel in ${currency}.`,
      data: tables.transportation,
      series: transportationList,
    },
  ];
}

export const CITY_PROFILES: Record<CityId, CityProfile> = {
  london: {
    id: 'london',
    ...CITY_LABELS.london,
    currencyCode: 'GBP',
    currencySymbol: '£',
    decimals: 2,
    sections: sections('GBP', {
      goods: essentialGoodsData,
      produce: produceData,
      protein: proteinData,
      rent: rentData,
      buyApt: buyAptData,
      salary: salaryData,
      utilities: utilitiesData,
      sportsLeisure: sportsLeisureData,
      clothingShoes: clothingShoesData,
      transportation: transportationData,
    }),
  },
  paris: {
    id: 'paris',
    ...CITY_LABELS.paris,
    currencyCode: 'EUR',
    currencySymbol: '€',
    decimals: 2,
    sections: sections('EUR', {
      goods: parisEssentialGoodsData,
      produce: parisProduceData,
      protein: parisProteinData,
      rent: parisRentData,
      buyApt: parisBuyAptData,
      salary: parisSalaryData,
      utilities: parisUtilitiesData,
      sportsLeisure: parisSportsLeisureData,
      clothingShoes: parisClothingShoesData,
      transportation: parisTransportationData,
    }),
  },
  newYork: {
    id: 'newYork',
    ...CITY_LABELS.newYork,
    currencyCode: 'USD',
    currencySymbol: '$',
    decimals: 2,
    sections: sections('USD', {
      goods: newYorkEssentialGoodsData,
      produce: newYorkProduceData,
      protein: newYorkProteinData,
      rent: newYorkRentData,
      buyApt: newYorkBuyAptData,
      salary: newYorkSalaryData,
      utilities: newYorkUtilitiesData,
      sportsLeisure: newYorkSportsLeisureData,
      clothingShoes: newYorkClothingShoesData,
      transportation: newYorkTransportationData,
    }),
  },
  tokyo: {
    id: 'tokyo',
    ...CITY_LABELS.tokyo,
    currencyCode: 'JPY',
    currencySymbol: '¥',
    decimals: 0,
    sections: [
      ...sections('JPY', {
        goods: tokyoEssentialGoodsData,
        produce: tokyoProduceData,
        protein: tokyoProteinData,
        rent: tokyoRentData,
        buyApt: tokyoBuyAptData,
        salary: tokyoSalaryData,
        utilities: tokyoUtilitiesData,
        sportsLeisure: tokyoSportsLeisureData,
        clothingShoes: tokyoClothingShoesData,
        transportation: tokyoTransportationData,
      }),
      // Only Tokyo has usable coverage for these two.
      {
        id: 'beverages',
        title: 'Drinks & Coffee',
        blurb: 'Bar and café prices in JPY.',
        data: tokyoBeveragesData,
        series: beveragesList,
      },
      {
        id: 'restaurants',
        title: 'Restaurants',
        blurb: 'Eating out in JPY, from a cheap lunch to a three-course dinner for two.',
        data: tokyoRestaurantData,
        series: restaurantList,
      },
    ],
  },
};

