'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

// World map TopoJSON URL
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country code mapping for World Bank data to ISO numeric codes (used by the map)
const COUNTRY_NAME_TO_ISO: { [key: string]: string } = {
  'USA': '840',
  'Canada': '124',
  'UK': '826',
  'France': '250',
  'Germany': '276',
  'Italy': '380',
  'Japan': '392',
  'Australia': '036',
  'Mexico': '484',
  'SouthKorea': '410',
  'Spain': '724',
  'Sweden': '752',
  'Switzerland': '756',
  'Turkey': '792',
  'Nigeria': '566',
  'China': '156',
  'Russia': '643',
  'Brazil': '076',
  'Chile': '152',
  'Argentina': '032',
  'India': '356',
  'Norway': '578',
  'Netherlands': '528',
  'Portugal': '620',
  'Belgium': '056',
  'Indonesia': '360',
  'SouthAfrica': '710',
  'Poland': '616',
  'SaudiArabia': '682',
  'Egypt': '818',
};

// Reverse mapping: ISO numeric code to country name
const ISO_TO_COUNTRY_NAME: { [key: string]: string } = Object.fromEntries(
  Object.entries(COUNTRY_NAME_TO_ISO).map(([name, iso]) => [iso, name])
);

// Country display names for tooltips
const COUNTRY_DISPLAY_NAMES: { [key: string]: string } = {
  'USA': 'United States',
  'UK': 'United Kingdom',
  'SouthKorea': 'South Korea',
  'SouthAfrica': 'South Africa',
  'SaudiArabia': 'Saudi Arabia',
};

// Cost of Living data for major cities (Index where NYC = 100)
interface CityData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  costIndex: number;
  rentIndex: number;
  groceriesIndex: number;
  restaurantIndex: number;
}

const CITY_COST_OF_LIVING: CityData[] = [
  // North America - USA
  { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, costIndex: 100, rentIndex: 100, groceriesIndex: 100, restaurantIndex: 100 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194, costIndex: 97, rentIndex: 119, groceriesIndex: 95, restaurantIndex: 96 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, costIndex: 83, rentIndex: 88, groceriesIndex: 85, restaurantIndex: 83 },
  { city: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, costIndex: 77, rentIndex: 65, groceriesIndex: 80, restaurantIndex: 79 },
  { city: 'Boston', country: 'USA', lat: 42.3601, lon: -71.0589, costIndex: 91, rentIndex: 95, groceriesIndex: 85, restaurantIndex: 88 },
  { city: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321, costIndex: 88, rentIndex: 92, groceriesIndex: 82, restaurantIndex: 85 },
  { city: 'Washington DC', country: 'USA', lat: 38.9072, lon: -77.0369, costIndex: 85, rentIndex: 88, groceriesIndex: 80, restaurantIndex: 82 },
  { city: 'Miami', country: 'USA', lat: 25.7617, lon: -80.1918, costIndex: 80, rentIndex: 78, groceriesIndex: 78, restaurantIndex: 78 },
  { city: 'Denver', country: 'USA', lat: 39.7392, lon: -104.9903, costIndex: 75, rentIndex: 68, groceriesIndex: 75, restaurantIndex: 72 },
  { city: 'Austin', country: 'USA', lat: 30.2672, lon: -97.7431, costIndex: 72, rentIndex: 65, groceriesIndex: 70, restaurantIndex: 70 },
  { city: 'Atlanta', country: 'USA', lat: 33.7490, lon: -84.3880, costIndex: 70, rentIndex: 62, groceriesIndex: 72, restaurantIndex: 68 },
  { city: 'Philadelphia', country: 'USA', lat: 39.9526, lon: -75.1652, costIndex: 74, rentIndex: 62, groceriesIndex: 78, restaurantIndex: 72 },
  { city: 'Houston', country: 'USA', lat: 29.7604, lon: -95.3698, costIndex: 65, rentIndex: 55, groceriesIndex: 68, restaurantIndex: 62 },
  { city: 'Dallas', country: 'USA', lat: 32.7767, lon: -96.7970, costIndex: 68, rentIndex: 58, groceriesIndex: 70, restaurantIndex: 65 },
  { city: 'Phoenix', country: 'USA', lat: 33.4484, lon: -112.0740, costIndex: 65, rentIndex: 55, groceriesIndex: 68, restaurantIndex: 62 },
  { city: 'San Diego', country: 'USA', lat: 32.7157, lon: -117.1611, costIndex: 85, rentIndex: 88, groceriesIndex: 80, restaurantIndex: 82 },
  { city: 'Las Vegas', country: 'USA', lat: 36.1699, lon: -115.1398, costIndex: 68, rentIndex: 58, groceriesIndex: 70, restaurantIndex: 65 },
  { city: 'Portland', country: 'USA', lat: 45.5152, lon: -122.6784, costIndex: 78, rentIndex: 72, groceriesIndex: 75, restaurantIndex: 75 },
  { city: 'Minneapolis', country: 'USA', lat: 44.9778, lon: -93.2650, costIndex: 72, rentIndex: 60, groceriesIndex: 75, restaurantIndex: 70 },
  
  // North America - Canada
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, costIndex: 75, rentIndex: 68, groceriesIndex: 78, restaurantIndex: 72 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, costIndex: 76, rentIndex: 72, groceriesIndex: 75, restaurantIndex: 71 },
  { city: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673, costIndex: 65, rentIndex: 52, groceriesIndex: 72, restaurantIndex: 62 },
  { city: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719, costIndex: 68, rentIndex: 55, groceriesIndex: 72, restaurantIndex: 65 },
  { city: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972, costIndex: 65, rentIndex: 52, groceriesIndex: 70, restaurantIndex: 62 },
  
  // North America - Mexico
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 38 },
  { city: 'Guadalajara', country: 'Mexico', lat: 20.6597, lon: -103.3496, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 35 },
  { city: 'Monterrey', country: 'Mexico', lat: 25.6866, lon: -100.3161, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 38 },
  { city: 'Cancun', country: 'Mexico', lat: 21.1619, lon: -86.8515, costIndex: 48, rentIndex: 28, groceriesIndex: 50, restaurantIndex: 45 },
  
  // Europe - UK & Ireland
  { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, costIndex: 93, rentIndex: 95, groceriesIndex: 75, restaurantIndex: 85 },
  { city: 'Manchester', country: 'UK', lat: 53.4808, lon: -2.2426, costIndex: 68, rentIndex: 52, groceriesIndex: 65, restaurantIndex: 65 },
  { city: 'Edinburgh', country: 'UK', lat: 55.9533, lon: -3.1883, costIndex: 72, rentIndex: 58, groceriesIndex: 68, restaurantIndex: 68 },
  { city: 'Birmingham', country: 'UK', lat: 52.4862, lon: -1.8904, costIndex: 65, rentIndex: 48, groceriesIndex: 62, restaurantIndex: 62 },
  { city: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603, costIndex: 85, rentIndex: 82, groceriesIndex: 72, restaurantIndex: 78 },
  
  // Europe - France
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, costIndex: 87, rentIndex: 75, groceriesIndex: 85, restaurantIndex: 82 },
  { city: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357, costIndex: 70, rentIndex: 52, groceriesIndex: 72, restaurantIndex: 68 },
  { city: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698, costIndex: 65, rentIndex: 45, groceriesIndex: 68, restaurantIndex: 62 },
  { city: 'Nice', country: 'France', lat: 43.7102, lon: 7.2620, costIndex: 75, rentIndex: 58, groceriesIndex: 75, restaurantIndex: 72 },
  
  // Europe - Germany
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, costIndex: 70, rentIndex: 45, groceriesIndex: 65, restaurantIndex: 62 },
  { city: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820, costIndex: 82, rentIndex: 68, groceriesIndex: 70, restaurantIndex: 72 },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, costIndex: 78, rentIndex: 62, groceriesIndex: 68, restaurantIndex: 70 },
  { city: 'Hamburg', country: 'Germany', lat: 53.5511, lon: 9.9937, costIndex: 72, rentIndex: 52, groceriesIndex: 68, restaurantIndex: 68 },
  { city: 'Cologne', country: 'Germany', lat: 50.9375, lon: 6.9603, costIndex: 70, rentIndex: 48, groceriesIndex: 65, restaurantIndex: 65 },
  
  // Europe - Other Western
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, costIndex: 85, rentIndex: 78, groceriesIndex: 68, restaurantIndex: 77 },
  { city: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lon: 4.4777, costIndex: 75, rentIndex: 62, groceriesIndex: 65, restaurantIndex: 70 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, costIndex: 131, rentIndex: 118, groceriesIndex: 125, restaurantIndex: 128 },
  { city: 'Geneva', country: 'Switzerland', lat: 46.2044, lon: 6.1432, costIndex: 125, rentIndex: 110, groceriesIndex: 120, restaurantIndex: 122 },
  { city: 'Basel', country: 'Switzerland', lat: 47.5596, lon: 7.5886, costIndex: 115, rentIndex: 95, groceriesIndex: 110, restaurantIndex: 112 },
  { city: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517, costIndex: 75, rentIndex: 58, groceriesIndex: 72, restaurantIndex: 72 },
  { city: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4025, costIndex: 70, rentIndex: 52, groceriesIndex: 68, restaurantIndex: 68 },
  { city: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, costIndex: 75, rentIndex: 55, groceriesIndex: 72, restaurantIndex: 70 },
  { city: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lon: 6.1319, costIndex: 95, rentIndex: 85, groceriesIndex: 88, restaurantIndex: 90 },
  
  // Europe - Scandinavia
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, costIndex: 82, rentIndex: 62, groceriesIndex: 75, restaurantIndex: 78 },
  { city: 'Gothenburg', country: 'Sweden', lat: 57.7089, lon: 11.9746, costIndex: 75, rentIndex: 52, groceriesIndex: 72, restaurantIndex: 72 },
  { city: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, costIndex: 102, rentIndex: 72, groceriesIndex: 98, restaurantIndex: 105 },
  { city: 'Bergen', country: 'Norway', lat: 60.3913, lon: 5.3221, costIndex: 95, rentIndex: 62, groceriesIndex: 92, restaurantIndex: 98 },
  { city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, costIndex: 95, rentIndex: 72, groceriesIndex: 82, restaurantIndex: 92 },
  { city: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384, costIndex: 85, rentIndex: 62, groceriesIndex: 78, restaurantIndex: 82 },
  { city: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426, costIndex: 105, rentIndex: 75, groceriesIndex: 98, restaurantIndex: 108 },
  
  // Europe - Southern
  { city: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, costIndex: 72, rentIndex: 52, groceriesIndex: 68, restaurantIndex: 70 },
  { city: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.1900, costIndex: 80, rentIndex: 68, groceriesIndex: 72, restaurantIndex: 75 },
  { city: 'Florence', country: 'Italy', lat: 43.7696, lon: 11.2558, costIndex: 72, rentIndex: 55, groceriesIndex: 68, restaurantIndex: 68 },
  { city: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155, costIndex: 78, rentIndex: 62, groceriesIndex: 72, restaurantIndex: 75 },
  { city: 'Naples', country: 'Italy', lat: 40.8518, lon: 14.2681, costIndex: 58, rentIndex: 38, groceriesIndex: 58, restaurantIndex: 55 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, costIndex: 62, rentIndex: 48, groceriesIndex: 58, restaurantIndex: 58 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, costIndex: 65, rentIndex: 55, groceriesIndex: 60, restaurantIndex: 60 },
  { city: 'Valencia', country: 'Spain', lat: 39.4699, lon: -0.3763, costIndex: 55, rentIndex: 38, groceriesIndex: 52, restaurantIndex: 52 },
  { city: 'Seville', country: 'Spain', lat: 37.3891, lon: -5.9845, costIndex: 52, rentIndex: 35, groceriesIndex: 50, restaurantIndex: 48 },
  { city: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393, costIndex: 58, rentIndex: 48, groceriesIndex: 52, restaurantIndex: 50 },
  { city: 'Porto', country: 'Portugal', lat: 41.1579, lon: -8.6291, costIndex: 52, rentIndex: 38, groceriesIndex: 48, restaurantIndex: 45 },
  { city: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275, costIndex: 55, rentIndex: 32, groceriesIndex: 55, restaurantIndex: 48 },
  { city: 'Thessaloniki', country: 'Greece', lat: 40.6401, lon: 22.9444, costIndex: 48, rentIndex: 25, groceriesIndex: 50, restaurantIndex: 42 },
  
  // Europe - Eastern
  { city: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, costIndex: 48, rentIndex: 32, groceriesIndex: 42, restaurantIndex: 40 },
  { city: 'Krakow', country: 'Poland', lat: 50.0647, lon: 19.9450, costIndex: 42, rentIndex: 25, groceriesIndex: 38, restaurantIndex: 35 },
  { city: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, costIndex: 52, rentIndex: 38, groceriesIndex: 45, restaurantIndex: 42 },
  { city: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402, costIndex: 45, rentIndex: 28, groceriesIndex: 40, restaurantIndex: 38 },
  { city: 'Bucharest', country: 'Romania', lat: 44.4268, lon: 26.1025, costIndex: 42, rentIndex: 25, groceriesIndex: 38, restaurantIndex: 35 },
  { city: 'Sofia', country: 'Bulgaria', lat: 42.6977, lon: 23.3219, costIndex: 38, rentIndex: 22, groceriesIndex: 35, restaurantIndex: 32 },
  { city: 'Belgrade', country: 'Serbia', lat: 44.7866, lon: 20.4489, costIndex: 38, rentIndex: 22, groceriesIndex: 35, restaurantIndex: 32 },
  { city: 'Zagreb', country: 'Croatia', lat: 45.8150, lon: 15.9819, costIndex: 52, rentIndex: 32, groceriesIndex: 48, restaurantIndex: 45 },
  { city: 'Tallinn', country: 'Estonia', lat: 59.4370, lon: 24.7536, costIndex: 58, rentIndex: 35, groceriesIndex: 55, restaurantIndex: 52 },
  { city: 'Riga', country: 'Latvia', lat: 56.9496, lon: 24.1052, costIndex: 52, rentIndex: 32, groceriesIndex: 48, restaurantIndex: 45 },
  { city: 'Vilnius', country: 'Lithuania', lat: 54.6872, lon: 25.2797, costIndex: 50, rentIndex: 30, groceriesIndex: 45, restaurantIndex: 42 },
  
  // Europe - Turkey & Russia
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, costIndex: 38, rentIndex: 18, groceriesIndex: 40, restaurantIndex: 32 },
  { city: 'Ankara', country: 'Turkey', lat: 39.9334, lon: 32.8597, costIndex: 32, rentIndex: 12, groceriesIndex: 35, restaurantIndex: 28 },
  { city: 'Izmir', country: 'Turkey', lat: 38.4237, lon: 27.1428, costIndex: 35, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 30 },
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173, costIndex: 48, rentIndex: 35, groceriesIndex: 45, restaurantIndex: 42 },
  { city: 'St Petersburg', country: 'Russia', lat: 59.9311, lon: 30.3609, costIndex: 42, rentIndex: 28, groceriesIndex: 40, restaurantIndex: 38 },
  
  // Asia - East Asia
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, costIndex: 76, rentIndex: 62, groceriesIndex: 85, restaurantIndex: 68 },
  { city: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, costIndex: 70, rentIndex: 52, groceriesIndex: 78, restaurantIndex: 62 },
  { city: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681, costIndex: 68, rentIndex: 48, groceriesIndex: 75, restaurantIndex: 60 },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, costIndex: 78, rentIndex: 58, groceriesIndex: 85, restaurantIndex: 58 },
  { city: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756, costIndex: 65, rentIndex: 42, groceriesIndex: 72, restaurantIndex: 50 },
  { city: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694, costIndex: 88, rentIndex: 125, groceriesIndex: 82, restaurantIndex: 58 },
  { city: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, costIndex: 58, rentIndex: 52, groceriesIndex: 55, restaurantIndex: 42 },
  { city: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, costIndex: 55, rentIndex: 48, groceriesIndex: 52, restaurantIndex: 40 },
  { city: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579, costIndex: 55, rentIndex: 48, groceriesIndex: 52, restaurantIndex: 40 },
  { city: 'Guangzhou', country: 'China', lat: 23.1291, lon: 113.2644, costIndex: 50, rentIndex: 42, groceriesIndex: 48, restaurantIndex: 38 },
  { city: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654, costIndex: 62, rentIndex: 45, groceriesIndex: 62, restaurantIndex: 48 },
  
  // Asia - Southeast Asia
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, costIndex: 85, rentIndex: 105, groceriesIndex: 78, restaurantIndex: 62 },
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, costIndex: 42, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 32 },
  { city: 'Chiang Mai', country: 'Thailand', lat: 18.7883, lon: 98.9853, costIndex: 32, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 25 },
  { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 32 },
  { city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 28 },
  { city: 'Bali', country: 'Indonesia', lat: -8.3405, lon: 115.0920, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 32 },
  { city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297, costIndex: 35, rentIndex: 18, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Hanoi', country: 'Vietnam', lat: 21.0278, lon: 105.8342, costIndex: 32, rentIndex: 15, groceriesIndex: 35, restaurantIndex: 25 },
  { city: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 28 },
  { city: 'Cebu', country: 'Philippines', lat: 10.3157, lon: 123.8854, costIndex: 32, rentIndex: 12, groceriesIndex: 38, restaurantIndex: 25 },
  
  // Asia - South Asia
  { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, costIndex: 28, rentIndex: 15, groceriesIndex: 30, restaurantIndex: 22 },
  { city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, costIndex: 26, rentIndex: 12, groceriesIndex: 28, restaurantIndex: 20 },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946, costIndex: 28, rentIndex: 15, groceriesIndex: 28, restaurantIndex: 22 },
  { city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, costIndex: 25, rentIndex: 12, groceriesIndex: 26, restaurantIndex: 20 },
  { city: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, costIndex: 22, rentIndex: 8, groceriesIndex: 24, restaurantIndex: 18 },
  { city: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867, costIndex: 24, rentIndex: 10, groceriesIndex: 25, restaurantIndex: 18 },
  { city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, costIndex: 28, rentIndex: 12, groceriesIndex: 32, restaurantIndex: 22 },
  { city: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, costIndex: 22, rentIndex: 8, groceriesIndex: 25, restaurantIndex: 18 },
  { city: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587, costIndex: 20, rentIndex: 6, groceriesIndex: 22, restaurantIndex: 15 },
  { city: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612, costIndex: 32, rentIndex: 15, groceriesIndex: 35, restaurantIndex: 25 },
  { city: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240, costIndex: 28, rentIndex: 10, groceriesIndex: 32, restaurantIndex: 22 },
  
  // Oceania
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, costIndex: 85, rentIndex: 78, groceriesIndex: 82, restaurantIndex: 80 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, costIndex: 78, rentIndex: 62, groceriesIndex: 78, restaurantIndex: 75 },
  { city: 'Brisbane', country: 'Australia', lat: -27.4698, lon: 153.0251, costIndex: 72, rentIndex: 55, groceriesIndex: 75, restaurantIndex: 70 },
  { city: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605, costIndex: 75, rentIndex: 58, groceriesIndex: 78, restaurantIndex: 72 },
  { city: 'Adelaide', country: 'Australia', lat: -34.9285, lon: 138.6007, costIndex: 68, rentIndex: 48, groceriesIndex: 72, restaurantIndex: 65 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.8509, lon: 174.7645, costIndex: 78, rentIndex: 62, groceriesIndex: 75, restaurantIndex: 72 },
  { city: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762, costIndex: 75, rentIndex: 55, groceriesIndex: 72, restaurantIndex: 70 },
  
  // Middle East
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, costIndex: 72, rentIndex: 62, groceriesIndex: 58, restaurantIndex: 68 },
  { city: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773, costIndex: 68, rentIndex: 55, groceriesIndex: 55, restaurantIndex: 62 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818, costIndex: 95, rentIndex: 85, groceriesIndex: 82, restaurantIndex: 90 },
  { city: 'Jerusalem', country: 'Israel', lat: 31.7683, lon: 35.2137, costIndex: 82, rentIndex: 68, groceriesIndex: 75, restaurantIndex: 78 },
  { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, costIndex: 52, rentIndex: 28, groceriesIndex: 48, restaurantIndex: 45 },
  { city: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925, costIndex: 50, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 42 },
  { city: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310, costIndex: 68, rentIndex: 55, groceriesIndex: 58, restaurantIndex: 62 },
  { city: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774, costIndex: 62, rentIndex: 48, groceriesIndex: 55, restaurantIndex: 58 },
  { city: 'Manama', country: 'Bahrain', lat: 26.2285, lon: 50.5860, costIndex: 58, rentIndex: 42, groceriesIndex: 52, restaurantIndex: 55 },
  { city: 'Muscat', country: 'Oman', lat: 23.5880, lon: 58.3829, costIndex: 55, rentIndex: 38, groceriesIndex: 50, restaurantIndex: 52 },
  { city: 'Amman', country: 'Jordan', lat: 31.9454, lon: 35.9284, costIndex: 45, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 40 },
  { city: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018, costIndex: 52, rentIndex: 35, groceriesIndex: 50, restaurantIndex: 48 },
  
  // Africa - North
  { city: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, costIndex: 25, rentIndex: 8, groceriesIndex: 28, restaurantIndex: 18 },
  { city: 'Alexandria', country: 'Egypt', lat: 31.2001, lon: 29.9187, costIndex: 22, rentIndex: 6, groceriesIndex: 25, restaurantIndex: 15 },
  { city: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898, costIndex: 38, rentIndex: 18, groceriesIndex: 40, restaurantIndex: 32 },
  { city: 'Marrakech', country: 'Morocco', lat: 31.6295, lon: -7.9811, costIndex: 35, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815, costIndex: 32, rentIndex: 12, groceriesIndex: 35, restaurantIndex: 25 },
  { city: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588, costIndex: 35, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 28 },
  
  // Africa - Sub-Saharan
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, costIndex: 34, rentIndex: 22, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Abuja', country: 'Nigeria', lat: 9.0765, lon: 7.3986, costIndex: 38, rentIndex: 25, groceriesIndex: 40, restaurantIndex: 32 },
  { city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 38 },
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, costIndex: 45, rentIndex: 28, groceriesIndex: 48, restaurantIndex: 42 },
  { city: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 35 },
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 32 },
  { city: 'Mombasa', country: 'Kenya', lat: -4.0435, lon: 39.6682, costIndex: 32, rentIndex: 12, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Accra', country: 'Ghana', lat: 5.6037, lon: -0.1870, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'Addis Ababa', country: 'Ethiopia', lat: 9.0320, lon: 38.7469, costIndex: 35, rentIndex: 18, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lon: 39.2083, costIndex: 35, rentIndex: 15, groceriesIndex: 40, restaurantIndex: 28 },
  { city: 'Kampala', country: 'Uganda', lat: 0.3476, lon: 32.5825, costIndex: 32, rentIndex: 12, groceriesIndex: 38, restaurantIndex: 25 },
  { city: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4677, costIndex: 45, rentIndex: 22, groceriesIndex: 48, restaurantIndex: 38 },
  { city: 'Kigali', country: 'Rwanda', lat: -1.9403, lon: 29.8739, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 32 },
  
  // South America
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, costIndex: 42, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, costIndex: 45, rentIndex: 32, groceriesIndex: 48, restaurantIndex: 38 },
  { city: 'Brasilia', country: 'Brazil', lat: -15.7975, lon: -47.8919, costIndex: 40, rentIndex: 22, groceriesIndex: 42, restaurantIndex: 32 },
  { city: 'Salvador', country: 'Brazil', lat: -12.9714, lon: -38.5014, costIndex: 35, rentIndex: 18, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, costIndex: 35, rentIndex: 18, groceriesIndex: 38, restaurantIndex: 30 },
  { city: 'Cordoba', country: 'Argentina', lat: -31.4201, lon: -64.1888, costIndex: 30, rentIndex: 12, groceriesIndex: 32, restaurantIndex: 25 },
  { city: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693, costIndex: 48, rentIndex: 32, groceriesIndex: 52, restaurantIndex: 42 },
  { city: 'Valparaiso', country: 'Chile', lat: -33.0472, lon: -71.6127, costIndex: 42, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 38 },
  { city: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'Bogota', country: 'Colombia', lat: 4.7110, lon: -74.0721, costIndex: 38, rentIndex: 18, groceriesIndex: 42, restaurantIndex: 30 },
  { city: 'Medellin', country: 'Colombia', lat: 6.2476, lon: -75.5658, costIndex: 35, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 28 },
  { city: 'Cartagena', country: 'Colombia', lat: 10.3910, lon: -75.4794, costIndex: 38, rentIndex: 18, groceriesIndex: 40, restaurantIndex: 32 },
  { city: 'Quito', country: 'Ecuador', lat: -0.1807, lon: -78.4678, costIndex: 42, rentIndex: 20, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645, costIndex: 52, rentIndex: 28, groceriesIndex: 55, restaurantIndex: 45 },
  { city: 'Caracas', country: 'Venezuela', lat: 10.4806, lon: -66.9036, costIndex: 42, rentIndex: 22, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'La Paz', country: 'Bolivia', lat: -16.4897, lon: -68.1193, costIndex: 32, rentIndex: 12, groceriesIndex: 35, restaurantIndex: 25 },
  { city: 'Asuncion', country: 'Paraguay', lat: -25.2637, lon: -57.5759, costIndex: 35, rentIndex: 15, groceriesIndex: 38, restaurantIndex: 28 },
  
  // Central America & Caribbean
  { city: 'Panama City', country: 'Panama', lat: 8.9824, lon: -79.5199, costIndex: 55, rentIndex: 35, groceriesIndex: 55, restaurantIndex: 48 },
  { city: 'San Jose', country: 'Costa Rica', lat: 9.9281, lon: -84.0907, costIndex: 52, rentIndex: 32, groceriesIndex: 55, restaurantIndex: 45 },
  { city: 'Guatemala City', country: 'Guatemala', lat: 14.6349, lon: -90.5069, costIndex: 42, rentIndex: 20, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'San Salvador', country: 'El Salvador', lat: 13.6929, lon: -89.2182, costIndex: 45, rentIndex: 22, groceriesIndex: 48, restaurantIndex: 38 },
  { city: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666, costIndex: 42, rentIndex: 25, groceriesIndex: 45, restaurantIndex: 35 },
  { city: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4861, lon: -69.9312, costIndex: 45, rentIndex: 25, groceriesIndex: 48, restaurantIndex: 38 },
  { city: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lon: -66.1057, costIndex: 72, rentIndex: 48, groceriesIndex: 75, restaurantIndex: 65 },
  { city: 'Kingston', country: 'Jamaica', lat: 18.0179, lon: -76.8099, costIndex: 55, rentIndex: 28, groceriesIndex: 58, restaurantIndex: 48 },
  { city: 'Nassau', country: 'Bahamas', lat: 25.0343, lon: -77.3963, costIndex: 85, rentIndex: 52, groceriesIndex: 88, restaurantIndex: 78 },
];

// View type for the map
type MapView = 'inflation' | 'cost-of-living' | 'both';

interface GlobalEconomicMapProps {
  isDarkMode: boolean;
  inflationData?: any[];
}

// Get inflation color based on rate
const getInflationColor = (rate: number | null | undefined, isDarkMode: boolean): string => {
  if (rate === null || rate === undefined) {
    return isDarkMode ? '#374151' : '#d1d5db'; // Gray for no data
  }
  
  if (rate < 0) return '#3b82f6'; // Blue for deflation
  if (rate < 2) return '#22c55e'; // Green - low inflation
  if (rate < 5) return '#84cc16'; // Yellow-green
  if (rate < 10) return '#eab308'; // Yellow
  if (rate < 20) return '#f97316'; // Orange
  if (rate < 50) return '#ef4444'; // Red
  return '#dc2626'; // Dark red for hyperinflation
};

// Get cost of living marker color
const getCostOfLivingColor = (index: number): string => {
  if (index < 40) return '#22c55e'; // Green - affordable
  if (index < 70) return '#eab308'; // Yellow - moderate
  if (index < 100) return '#f97316'; // Orange - expensive
  return '#ef4444'; // Red - very expensive
};

// Get marker size based on cost index
const getMarkerSize = (index: number): number => {
  if (index < 40) return 4;
  if (index < 70) return 5;
  if (index < 100) return 6;
  return 7;
};

// Memoized Geography component for inflation view
const InflationGeography = memo(({ 
  geo, 
  inflationRate,
  isDarkMode,
  onMouseEnter,
  onMouseLeave,
}: { 
  geo: any; 
  inflationRate: number | null;
  isDarkMode: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => (
  <Geography
    geography={geo}
    fill={getInflationColor(inflationRate, isDarkMode)}
    stroke={isDarkMode ? '#1f2937' : '#ffffff'}
    strokeWidth={0.5}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      default: { outline: 'none' },
      hover: { 
        fill: isDarkMode ? '#60a5fa' : '#93c5fd',
        outline: 'none',
        transition: 'all 0.2s',
        cursor: 'pointer'
      },
      pressed: { outline: 'none' },
    }}
  />
));

InflationGeography.displayName = 'InflationGeography';

// Memoized Geography component for base map (cost of living view)
const BaseGeography = memo(({ 
  geo, 
  isDarkMode 
}: { 
  geo: any; 
  isDarkMode: boolean;
}) => (
  <Geography
    geography={geo}
    fill={isDarkMode ? '#1e3a5f' : '#c8e6c9'}
    stroke={isDarkMode ? '#2d4a6f' : '#81c784'}
    strokeWidth={0.5}
    style={{
      default: { outline: 'none' },
      hover: { 
        fill: isDarkMode ? '#2d5a8f' : '#a5d6a7',
        outline: 'none',
        transition: 'all 0.2s'
      },
      pressed: { outline: 'none' },
    }}
  />
));

BaseGeography.displayName = 'BaseGeography';

const GlobalEconomicMap: React.FC<GlobalEconomicMapProps> = ({
  isDarkMode,
  inflationData = [],
}) => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [activeView, setActiveView] = useState<MapView>('inflation');
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; inflation: number | null } | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  // Get latest inflation data for each country
  const latestInflationByCountry = useMemo(() => {
    if (!inflationData || inflationData.length === 0) return {};
    
    // Get the most recent year's data
    const latestYear = inflationData[inflationData.length - 1];
    const result: { [isoCode: string]: { rate: number; countryName: string } } = {};
    
    Object.entries(COUNTRY_NAME_TO_ISO).forEach(([countryName, isoCode]) => {
      const rate = latestYear[countryName];
      if (rate !== undefined && rate !== null) {
        result[isoCode] = { rate: Number(rate), countryName };
      }
    });
    
    return result;
  }, [inflationData]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }, [position.zoom]);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  }, []);

  // Theme colors
  const colors = {
    ocean: isDarkMode ? '#0a1929' : '#e3f2fd',
    text: isDarkMode ? '#e5e7eb' : '#374151',
    cardBg: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
  };

  const showInflation = activeView === 'inflation' || activeView === 'both';
  const showCostOfLiving = activeView === 'cost-of-living' || activeView === 'both';

  return (
    <div className="space-y-4">
      {/* View Toggle Buttons */}
      <div className={`flex flex-wrap gap-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveView('inflation')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeView === 'inflation'
              ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
              : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50')
          }`}
        >
          Inflation Rates
        </button>
        <button
          onClick={() => setActiveView('cost-of-living')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeView === 'cost-of-living'
              ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
              : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50')
          }`}
        >
          Cost of Living
        </button>
        <button
          onClick={() => setActiveView('both')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeView === 'both'
              ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
              : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50')
          }`}
        >
          Both
        </button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        onMouseMove={handleMouseMove}
        className={`relative w-full rounded-xl overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{ 
          aspectRatio: '16/9',
          minHeight: '400px',
          maxHeight: '600px',
          backgroundColor: colors.ocean
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [0, 20],
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={4}
          >
            {/* Ocean background */}
            <rect x={-800} y={-600} width={2000} height={1200} fill={colors.ocean} />
            
            {/* Countries */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoCode = geo.id;
                  const countryData = latestInflationByCountry[isoCode];
                  const inflationRate = countryData?.rate ?? null;
                  const countryName = countryData?.countryName || ISO_TO_COUNTRY_NAME[isoCode] || geo.properties?.name;
                  const displayName = COUNTRY_DISPLAY_NAMES[countryName] || countryName;

                  if (showInflation) {
                    return (
                      <InflationGeography
                        key={geo.rsmKey}
                        geo={geo}
                        inflationRate={inflationRate}
                        isDarkMode={isDarkMode}
                        onMouseEnter={() => {
                          if (inflationRate !== null) {
                            setHoveredCountry({ name: displayName, inflation: inflationRate });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                      />
                    );
                  }
                  
                  return (
                    <BaseGeography
                      key={geo.rsmKey}
                      geo={geo}
                      isDarkMode={isDarkMode}
                    />
                  );
                })
              }
            </Geographies>

            {/* City Markers for Cost of Living */}
            {showCostOfLiving && CITY_COST_OF_LIVING.map((city) => {
              const markerSize = getMarkerSize(city.costIndex);
              const markerColor = getCostOfLivingColor(city.costIndex);
              const isHovered = hoveredCity?.city === city.city;
              
              return (
                <Marker
                  key={`${city.city}-${city.country}`}
                  coordinates={[city.lon, city.lat]}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  {/* Outer glow for hovered marker */}
                  {isHovered && (
                    <circle
                      r={(markerSize + 3) / position.zoom}
                      fill={markerColor}
                      fillOpacity={0.3}
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Main marker */}
                  <circle
                    r={markerSize / position.zoom}
                    fill={markerColor}
                    stroke="#fff"
                    strokeWidth={1 / position.zoom}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-out',
                    }}
                  />
                  
                  {/* City label on hover */}
                  {isHovered && (
                    <text
                      x={15 / position.zoom}
                      y={4 / position.zoom}
                      style={{
                        fontFamily: 'system-ui',
                        fontSize: `${11 / position.zoom}px`,
                        fontWeight: 'bold',
                        fill: isDarkMode ? '#f59e0b' : '#d97706',
                        pointerEvents: 'none',
                        textShadow: isDarkMode 
                          ? '1px 1px 2px rgba(0,0,0,0.8)' 
                          : '1px 1px 2px rgba(255,255,255,0.9)',
                      }}
                    >
                      {city.city}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            disabled={position.zoom >= 4}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50' 
                : 'bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            disabled={position.zoom <= 1}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50' 
                : 'bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={handleReset}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            title="Reset view"
          >
            ⟲
          </button>
        </div>

        {/* Mobile/Desktop hints */}
        <div className={`absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded-full ${
          isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
        } backdrop-blur-sm hidden sm:block`}>
          Drag to pan • Scroll to zoom
        </div>
        <div className={`absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded-full ${
          isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80 text-gray-600'
        } backdrop-blur-sm sm:hidden`}>
          Pinch to zoom • Drag to pan
        </div>

        {/* Hover Tooltip for Country */}
        {hoveredCountry && showInflation && (
          <div 
            className={`absolute pointer-events-none z-50 ${
              isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-xl p-3 backdrop-blur-sm`}
            style={{
              left: Math.min(tooltipPosition.x + 15, (mapContainerRef.current?.clientWidth || 400) - 180),
              top: Math.max(tooltipPosition.y - 40, 10),
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getInflationColor(hoveredCountry.inflation, isDarkMode) }}
              />
              <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {hoveredCountry.name}
              </span>
            </div>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Inflation: <span className="font-semibold">{hoveredCountry.inflation?.toFixed(1)}%</span>
            </p>
          </div>
        )}

        {/* Hover Tooltip for City */}
        {hoveredCity && showCostOfLiving && (
          <div 
            className={`absolute pointer-events-none z-50 ${
              isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
            } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-xl p-4 backdrop-blur-sm min-w-[200px]`}
            style={{
              left: Math.min(tooltipPosition.x + 15, (mapContainerRef.current?.clientWidth || 400) - 220),
              top: Math.max(tooltipPosition.y - 60, 10),
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCostOfLivingColor(hoveredCity.costIndex) }}
              />
              <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {hoveredCity.city}, {hoveredCity.country}
              </span>
            </div>
            <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Overall Index: <span className="font-semibold">{hoveredCity.costIndex}</span> <span className="text-gray-400">(NYC=100)</span></p>
              <p>Rent: <span className="font-semibold">{hoveredCity.rentIndex}</span></p>
              <p>Groceries: <span className="font-semibold">{hoveredCity.groceriesIndex}</span></p>
              <p>Restaurants: <span className="font-semibold">{hoveredCity.restaurantIndex}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className={`p-4 rounded-xl border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        {showInflation && (
          <div className="mb-4">
            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Inflation Rate Legend
            </h4>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Deflation', color: '#3b82f6', range: '< 0%' },
                { label: 'Low', color: '#22c55e', range: '0-2%' },
                { label: 'Moderate', color: '#84cc16', range: '2-5%' },
                { label: 'Elevated', color: '#eab308', range: '5-10%' },
                { label: 'High', color: '#f97316', range: '10-20%' },
                { label: 'Very High', color: '#ef4444', range: '20-50%' },
                { label: 'Hyperinflation', color: '#dc2626', range: '> 50%' },
                { label: 'No Data', color: isDarkMode ? '#374151' : '#d1d5db', range: '' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.label} {item.range && `(${item.range})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCostOfLiving && (
          <div>
            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cost of Living Index Legend <span className="font-normal text-gray-400">(NYC = 100)</span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Affordable', color: '#22c55e', range: '< 40' },
                { label: 'Moderate', color: '#eab308', range: '40-70' },
                { label: 'Expensive', color: '#f97316', range: '70-100' },
                { label: 'Very Expensive', color: '#ef4444', range: '> 100' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.label} ({item.range})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Source Note */}
      <p className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Data sources: World Bank (inflation rates), Numbeo.com (cost of living indices). 
        Cost of living index is relative to New York City (NYC = 100).
      </p>
    </div>
  );
};

export default GlobalEconomicMap;
