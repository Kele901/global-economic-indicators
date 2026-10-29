import type { Gender, RouteToPower } from './types';

export interface LeaderBio {
  born?: number;
  gender: Gender;
  route: RouteToPower;
}

const m = (born: number | undefined, route: RouteToPower): LeaderBio => ({ born, gender: 'male', route });
const f = (born: number, route: RouteToPower): LeaderBio => ({ born, gender: 'female', route });

// Keyed by the exact `Leader.name` used in the region files.
export const LEADER_BIOS: Record<string, LeaderBio> = {
  // North America
  'Donald Trump': m(1946, 'election'),
  'Charles III': m(1948, 'hereditary'),
  'Mark Carney': m(1965, 'party-selection'),
  'Claudia Sheinbaum': f(1962, 'election'),
  // Latin America
  'Luiz Inácio Lula da Silva': m(1945, 'election'),
  'José Antonio Kast': m(1966, 'election'),
  'Javier Milei': m(1970, 'election'),
  'Abelardo de la Espriella': m(1978, 'election'),
  // Western Europe
  'Andy Burnham': m(1970, 'party-selection'),
  'Emmanuel Macron': m(1977, 'election'),
  'Sébastien Lecornu': m(1986, 'appointment'),
  'Frank-Walter Steinmeier': m(1956, 'parliamentary-vote'),
  'Friedrich Merz': m(1955, 'election'),
  'Sergio Mattarella': m(1941, 'parliamentary-vote'),
  'Giorgia Meloni': f(1977, 'election'),
  'Felipe VI': m(1968, 'hereditary'),
  'Pedro Sánchez': m(1972, 'parliamentary-vote'),
  'Guy Parmelin': m(1959, 'parliamentary-vote'),
  'Willem-Alexander': m(1967, 'hereditary'),
  'Rob Jetten': m(1987, 'parliamentary-vote'),
  'Philippe': m(1960, 'hereditary'),
  'Bart De Wever': m(1970, 'parliamentary-vote'),
  // Northern and Southern Europe
  'Carl XVI Gustaf': m(1946, 'hereditary'),
  'Ulf Kristersson': m(1963, 'parliamentary-vote'),
  'Harald V': m(1937, 'hereditary'),
  'Jonas Gahr Støre': m(1960, 'election'),
  'António José Seguro': m(1962, 'election'),
  'Luís Montenegro': m(1973, 'election'),
  'Karol Nawrocki': m(1983, 'election'),
  'Donald Tusk': m(1957, 'parliamentary-vote'),
  'Konstantinos Tasoulas': m(1959, 'parliamentary-vote'),
  'Kyriakos Mitsotakis': m(1968, 'election'),
  // Eurasia
  'Vladimir Putin': m(1952, 'election'),
  'Mikhail Mishustin': m(1966, 'appointment'),
  'Volodymyr Zelensky': m(1978, 'election'),
  'Serhii Koretskyi': m(undefined, 'parliamentary-vote'),
  // Middle East
  'Recep Tayyip Erdoğan': m(1954, 'election'),
  'Salman bin Abdulaziz Al Saud': m(1935, 'hereditary'),
  'Mohammed bin Salman': m(1985, 'appointment'),
  'Abdel Fattah el-Sisi': m(1954, 'election'),
  'Mostafa Madbouly': m(1966, 'appointment'),
  'Isaac Herzog': m(1960, 'parliamentary-vote'),
  'Benjamin Netanyahu': m(1949, 'parliamentary-vote'),
  'Mojtaba Khamenei': m(1969, 'appointment'),
  'Masoud Pezeshkian': m(1954, 'election'),
  'Mohamed bin Zayed Al Nahyan': m(1961, 'appointment'),
  'Mohammed bin Rashid Al Maktoum': m(1949, 'appointment'),
  'Tamim bin Hamad Al Thani': m(1980, 'hereditary'),
  'Mohammed bin Abdulrahman Al Thani': m(1980, 'appointment'),
  'Mohammed VI': m(1963, 'hereditary'),
  'Fatima Ezzahra El Mansouri': f(1976, 'appointment'),
  // Africa
  'Bola Tinubu': m(1952, 'election'),
  'Cyril Ramaphosa': m(1952, 'parliamentary-vote'),
  'William Ruto': m(1966, 'election'),
  'Taye Atske Selassie': m(1956, 'parliamentary-vote'),
  'Abiy Ahmed': m(1976, 'party-selection'),
  'John Dramani Mahama': m(1958, 'election'),
  // East Asia and Pacific
  'Naruhito': m(1960, 'hereditary'),
  'Sanae Takaichi': f(1961, 'party-selection'),
  'Lee Jae-myung': m(1963, 'election'),
  'Kim Min-seok': m(1964, 'appointment'),
  'Xi Jinping': m(1953, 'party-selection'),
  'Li Qiang': m(1959, 'appointment'),
  'Tô Lâm': m(1957, 'party-selection'),
  'Lê Minh Hưng': m(1970, 'appointment'),
  'Anthony Albanese': m(1963, 'election'),
  'Tharman Shanmugaratnam': m(1957, 'election'),
  'Lawrence Wong': m(1972, 'party-selection'),
  // South and Southeast Asia
  'Droupadi Murmu': f(1958, 'parliamentary-vote'),
  'Narendra Modi': m(1950, 'election'),
  'Prabowo Subianto': m(1951, 'election'),
  'Maha Vajiralongkorn (Rama X)': m(1952, 'hereditary'),
  'Anutin Charnvirakul': m(1966, 'parliamentary-vote'),
  'Ferdinand Marcos Jr.': m(1957, 'election'),
  'Asif Ali Zardari': m(1955, 'parliamentary-vote'),
  'Shehbaz Sharif': m(1951, 'parliamentary-vote'),
  'Mohammed Shahabuddin': m(1949, 'parliamentary-vote'),
  'Tarique Rahman': m(1965, 'election'),
};
