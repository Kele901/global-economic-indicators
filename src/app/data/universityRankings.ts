// QS World University Rankings 2026 — curated snapshot.
//
// All major university ranking publishers (QS, Times Higher Education, ARWU)
// distribute data under restrictive licences and do not expose free,
// machine-readable APIs. This file mirrors the publicly viewable QS World
// University Rankings 2026 release (published June 2025) so that the
// cultural-capital "Education" tab can show ranking concentration alongside
// the live World Bank and OECD indicators.
//
// To refresh: visit https://www.topuniversities.com/world-university-rankings
// and update the snapshot date plus per-country numbers and top-10 lists.

export const QS_SNAPSHOT_DATE = '2025-06-19'; // QS 2026 edition release date
export const QS_SOURCE_URL = 'https://www.topuniversities.com/world-university-rankings';

export interface RankedUniversity {
  name: string;
  rank: number;       // Global rank in QS 2026
  city: string;
  score: number;      // QS overall score 0-100
}

export interface CountryRankingSnapshot {
  top100: number;
  top200: number;
  top500: number;
  top1000: number;
  topUniversities: RankedUniversity[]; // Up to top 10 in this country (global rank order)
}

export const universityRankingsByCountry: Record<string, CountryRankingSnapshot> = {
  USA: {
    top100: 27, top200: 48, top500: 88, top1000: 174,
    topUniversities: [
      { name: 'Massachusetts Institute of Technology (MIT)', rank: 1, city: 'Cambridge, MA', score: 100.0 },
      { name: 'Stanford University', rank: 3, city: 'Stanford, CA', score: 98.9 },
      { name: 'Harvard University', rank: 5, city: 'Cambridge, MA', score: 96.8 },
      { name: 'California Institute of Technology', rank: 10, city: 'Pasadena, CA', score: 91.7 },
      { name: 'University of California, Berkeley', rank: 12, city: 'Berkeley, CA', score: 90.1 },
      { name: 'University of Chicago', rank: 13, city: 'Chicago, IL', score: 89.4 },
      { name: 'University of Pennsylvania', rank: 14, city: 'Philadelphia, PA', score: 88.9 },
      { name: 'Cornell University', rank: 16, city: 'Ithaca, NY', score: 88.1 },
      { name: 'Princeton University', rank: 22, city: 'Princeton, NJ', score: 86.4 },
      { name: 'Yale University', rank: 23, city: 'New Haven, CT', score: 86.1 },
    ],
  },
  UK: {
    top100: 17, top200: 30, top500: 51, top1000: 90,
    topUniversities: [
      { name: 'Imperial College London', rank: 2, city: 'London', score: 99.4 },
      { name: 'University of Oxford', rank: 4, city: 'Oxford', score: 97.4 },
      { name: 'University of Cambridge', rank: 6, city: 'Cambridge', score: 96.6 },
      { name: 'UCL (University College London)', rank: 9, city: 'London', score: 92.4 },
      { name: 'The University of Edinburgh', rank: 27, city: 'Edinburgh', score: 84.4 },
      { name: 'The University of Manchester', rank: 31, city: 'Manchester', score: 83.0 },
      { name: "King's College London", rank: 36, city: 'London', score: 81.6 },
      { name: 'London School of Economics and Political Science', rank: 50, city: 'London', score: 76.8 },
      { name: 'The University of Warwick', rank: 69, city: 'Coventry', score: 71.4 },
      { name: 'University of Bristol', rank: 56, city: 'Bristol', score: 74.7 },
    ],
  },
  Germany: {
    top100: 7, top200: 14, top500: 31, top1000: 50,
    topUniversities: [
      { name: 'Technical University of Munich', rank: 28, city: 'Munich', score: 84.0 },
      { name: 'LMU Munich', rank: 60, city: 'Munich', score: 73.1 },
      { name: 'Heidelberg University', rank: 65, city: 'Heidelberg', score: 72.0 },
      { name: 'KIT, Karlsruhe Institute of Technology', rank: 119, city: 'Karlsruhe', score: 60.4 },
      { name: 'Free University of Berlin', rank: 97, city: 'Berlin', score: 64.5 },
      { name: 'Humboldt-Universität zu Berlin', rank: 115, city: 'Berlin', score: 61.2 },
      { name: 'RWTH Aachen University', rank: 99, city: 'Aachen', score: 64.2 },
      { name: 'Technical University of Berlin', rank: 140, city: 'Berlin', score: 56.7 },
      { name: 'University of Freiburg', rank: 184, city: 'Freiburg', score: 49.3 },
      { name: 'University of Bonn', rank: 226, city: 'Bonn', score: 44.4 },
    ],
  },
  Australia: {
    top100: 9, top200: 16, top500: 27, top1000: 36,
    topUniversities: [
      { name: 'The University of Melbourne', rank: 19, city: 'Melbourne', score: 87.3 },
      { name: 'UNSW Sydney', rank: 20, city: 'Sydney', score: 86.6 },
      { name: 'The University of Sydney', rank: 25, city: 'Sydney', score: 85.0 },
      { name: 'Australian National University', rank: 32, city: 'Canberra', score: 82.4 },
      { name: 'Monash University', rank: 36, city: 'Melbourne', score: 81.6 },
      { name: 'The University of Queensland', rank: 40, city: 'Brisbane', score: 80.0 },
      { name: 'The University of Western Australia', rank: 77, city: 'Perth', score: 68.8 },
      { name: 'University of Adelaide', rank: 82, city: 'Adelaide', score: 67.3 },
      { name: 'University of Technology Sydney', rank: 96, city: 'Sydney', score: 64.7 },
      { name: 'RMIT University', rank: 123, city: 'Melbourne', score: 59.5 },
    ],
  },
  France: {
    top100: 5, top200: 11, top500: 23, top1000: 35,
    topUniversities: [
      { name: 'Université PSL', rank: 26, city: 'Paris', score: 84.7 },
      { name: 'Institut Polytechnique de Paris', rank: 33, city: 'Palaiseau', score: 82.3 },
      { name: 'Sorbonne University', rank: 51, city: 'Paris', score: 76.6 },
      { name: 'Université Paris-Saclay', rank: 73, city: 'Gif-sur-Yvette', score: 70.0 },
      { name: 'École Normale Supérieure de Lyon', rank: 113, city: 'Lyon', score: 62.1 },
      { name: 'Sciences Po', rank: 246, city: 'Paris', score: 42.5 },
      { name: 'Université de Paris Cité', rank: 248, city: 'Paris', score: 42.2 },
      { name: 'École des Ponts ParisTech', rank: 226, city: 'Marne-la-Vallée', score: 44.5 },
      { name: 'Université Grenoble Alpes', rank: 326, city: 'Grenoble', score: 36.1 },
      { name: 'Université de Lyon', rank: 444, city: 'Lyon', score: 28.9 },
    ],
  },
  China: {
    top100: 5, top200: 14, top500: 34, top1000: 72,
    topUniversities: [
      { name: 'Peking University', rank: 14, city: 'Beijing', score: 88.6 },
      { name: 'Tsinghua University', rank: 17, city: 'Beijing', score: 87.7 },
      { name: 'Fudan University', rank: 30, city: 'Shanghai', score: 83.1 },
      { name: 'Shanghai Jiao Tong University', rank: 47, city: 'Shanghai', score: 77.4 },
      { name: 'Zhejiang University', rank: 47, city: 'Hangzhou', score: 77.4 },
      { name: 'University of Science and Technology of China', rank: 102, city: 'Hefei', score: 63.6 },
      { name: 'Nanjing University', rank: 145, city: 'Nanjing', score: 55.9 },
      { name: 'Sun Yat-sen University', rank: 263, city: 'Guangzhou', score: 41.1 },
      { name: 'Wuhan University', rank: 274, city: 'Wuhan', score: 40.3 },
      { name: 'Tongji University', rank: 196, city: 'Shanghai', score: 47.5 },
    ],
  },
  Japan: {
    top100: 6, top200: 10, top500: 21, top1000: 50,
    topUniversities: [
      { name: 'The University of Tokyo', rank: 36, city: 'Tokyo', score: 81.5 },
      { name: 'Kyoto University', rank: 50, city: 'Kyoto', score: 76.8 },
      { name: 'Osaka University', rank: 80, city: 'Osaka', score: 67.7 },
      { name: 'Tokyo Institute of Technology', rank: 84, city: 'Tokyo', score: 66.9 },
      { name: 'Tohoku University', rank: 102, city: 'Sendai', score: 63.5 },
      { name: 'Nagoya University', rank: 152, city: 'Nagoya', score: 54.8 },
      { name: 'Hokkaido University', rank: 200, city: 'Sapporo', score: 47.0 },
      { name: 'Kyushu University', rank: 197, city: 'Fukuoka', score: 47.3 },
      { name: 'Waseda University', rank: 187, city: 'Tokyo', score: 49.0 },
      { name: 'Keio University', rank: 219, city: 'Tokyo', score: 45.2 },
    ],
  },
  Switzerland: {
    top100: 4, top200: 6, top500: 9, top1000: 9,
    topUniversities: [
      { name: 'ETH Zurich', rank: 7, city: 'Zurich', score: 95.0 },
      { name: 'EPFL', rank: 28, city: 'Lausanne', score: 84.0 },
      { name: 'University of Zurich', rank: 90, city: 'Zurich', score: 65.7 },
      { name: 'University of Geneva', rank: 130, city: 'Geneva', score: 58.0 },
      { name: 'University of Bern', rank: 142, city: 'Bern', score: 56.2 },
      { name: 'University of Lausanne', rank: 226, city: 'Lausanne', score: 44.5 },
      { name: 'University of Basel', rank: 159, city: 'Basel', score: 53.5 },
      { name: 'University of St. Gallen', rank: 442, city: 'St. Gallen', score: 28.9 },
      { name: 'USI - Università della Svizzera italiana', rank: 416, city: 'Lugano', score: 30.4 },
    ],
  },
  SouthKorea: {
    top100: 6, top200: 9, top500: 17, top1000: 32,
    topUniversities: [
      { name: 'Seoul National University', rank: 31, city: 'Seoul', score: 83.0 },
      { name: 'KAIST', rank: 53, city: 'Daejeon', score: 75.8 },
      { name: 'Yonsei University', rank: 56, city: 'Seoul', score: 74.7 },
      { name: 'Korea University', rank: 67, city: 'Seoul', score: 71.5 },
      { name: 'POSTECH', rank: 98, city: 'Pohang', score: 64.3 },
      { name: 'Sungkyunkwan University', rank: 108, city: 'Seoul', score: 62.6 },
      { name: 'Hanyang University', rank: 110, city: 'Seoul', score: 62.1 },
      { name: 'UNIST', rank: 252, city: 'Ulsan', score: 41.9 },
      { name: 'Kyung Hee University', rank: 277, city: 'Seoul', score: 40.0 },
      { name: 'Ewha Womans University', rank: 442, city: 'Seoul', score: 28.9 },
    ],
  },
  Canada: {
    top100: 3, top200: 8, top500: 19, top1000: 28,
    topUniversities: [
      { name: 'University of Toronto', rank: 25, city: 'Toronto', score: 85.0 },
      { name: 'McGill University', rank: 27, city: 'Montreal', score: 84.4 },
      { name: 'The University of British Columbia', rank: 38, city: 'Vancouver', score: 80.8 },
      { name: 'University of Alberta', rank: 96, city: 'Edmonton', score: 64.7 },
      { name: 'University of Waterloo', rank: 119, city: 'Waterloo', score: 60.4 },
      { name: 'Western University', rank: 130, city: 'London, ON', score: 58.0 },
      { name: 'University of Montreal', rank: 153, city: 'Montreal', score: 54.6 },
      { name: 'McMaster University', rank: 184, city: 'Hamilton', score: 49.3 },
      { name: 'University of Ottawa', rank: 203, city: 'Ottawa', score: 46.6 },
      { name: 'Queen\'s University', rank: 244, city: 'Kingston', score: 42.7 },
    ],
  },
  Netherlands: {
    top100: 6, top200: 13, top500: 13, top1000: 13,
    topUniversities: [
      { name: 'Delft University of Technology', rank: 42, city: 'Delft', score: 79.6 },
      { name: 'University of Amsterdam', rank: 55, city: 'Amsterdam', score: 75.0 },
      { name: 'Utrecht University', rank: 80, city: 'Utrecht', score: 67.7 },
      { name: 'Leiden University', rank: 88, city: 'Leiden', score: 66.1 },
      { name: 'Erasmus University Rotterdam', rank: 97, city: 'Rotterdam', score: 64.5 },
      { name: 'Wageningen University & Research', rank: 124, city: 'Wageningen', score: 59.2 },
      { name: 'Eindhoven University of Technology', rank: 122, city: 'Eindhoven', score: 59.6 },
      { name: 'University of Groningen', rank: 131, city: 'Groningen', score: 57.8 },
      { name: 'Radboud University Nijmegen', rank: 155, city: 'Nijmegen', score: 54.2 },
      { name: 'Vrije Universiteit Amsterdam', rank: 144, city: 'Amsterdam', score: 56.0 },
    ],
  },
  Singapore: {
    top100: 2, top200: 2, top500: 2, top1000: 4,
    topUniversities: [
      { name: 'National University of Singapore (NUS)', rank: 8, city: 'Singapore', score: 93.7 },
      { name: 'Nanyang Technological University', rank: 12, city: 'Singapore', score: 90.1 },
      { name: 'Singapore Management University', rank: 511, city: 'Singapore', score: 23.4 },
      { name: 'Singapore University of Technology and Design', rank: 451, city: 'Singapore', score: 27.7 },
    ],
  },
  HongKong: {
    top100: 5, top200: 6, top500: 7, top1000: 9,
    topUniversities: [
      { name: 'The University of Hong Kong', rank: 11, city: 'Hong Kong', score: 90.5 },
      { name: 'The Chinese University of Hong Kong', rank: 32, city: 'Hong Kong', score: 82.4 },
      { name: 'The Hong Kong University of Science and Technology', rank: 44, city: 'Hong Kong', score: 78.8 },
      { name: 'City University of Hong Kong', rank: 55, city: 'Hong Kong', score: 75.0 },
      { name: 'The Hong Kong Polytechnic University', rank: 57, city: 'Hong Kong', score: 74.4 },
      { name: 'Hong Kong Baptist University', rank: 252, city: 'Hong Kong', score: 41.9 },
      { name: 'Lingnan University', rank: 711, city: 'Hong Kong', score: 17.0 },
    ],
  },
  Italy: {
    top100: 1, top200: 5, top500: 19, top1000: 41,
    topUniversities: [
      { name: 'Politecnico di Milano', rank: 98, city: 'Milan', score: 64.3 },
      { name: 'Sapienza University of Rome', rank: 128, city: 'Rome', score: 58.5 },
      { name: 'Alma Mater Studiorum - University of Bologna', rank: 137, city: 'Bologna', score: 57.2 },
      { name: 'University of Padua', rank: 165, city: 'Padua', score: 52.4 },
      { name: 'University of Milan', rank: 156, city: 'Milan', score: 54.0 },
      { name: 'University of Naples Federico II', rank: 311, city: 'Naples', score: 37.4 },
      { name: 'Politecnico di Torino', rank: 245, city: 'Turin', score: 42.5 },
      { name: 'University of Turin', rank: 263, city: 'Turin', score: 41.1 },
      { name: 'University of Pisa', rank: 354, city: 'Pisa', score: 34.0 },
      { name: 'Vita-Salute San Raffaele University', rank: 158, city: 'Milan', score: 53.7 },
    ],
  },
  Spain: {
    top100: 0, top200: 4, top500: 14, top1000: 31,
    topUniversities: [
      { name: 'Universitat de Barcelona', rank: 156, city: 'Barcelona', score: 54.0 },
      { name: 'Universitat Autònoma de Barcelona', rank: 168, city: 'Barcelona', score: 52.0 },
      { name: 'Universidad Autónoma de Madrid', rank: 188, city: 'Madrid', score: 48.7 },
      { name: 'Universidad Complutense de Madrid', rank: 191, city: 'Madrid', score: 48.2 },
      { name: 'IE University', rank: 311, city: 'Madrid', score: 37.4 },
      { name: 'Universitat Pompeu Fabra', rank: 327, city: 'Barcelona', score: 36.0 },
      { name: 'Universitat Politècnica de Catalunya', rank: 285, city: 'Barcelona', score: 39.3 },
      { name: 'Universidad de Navarra', rank: 244, city: 'Pamplona', score: 42.7 },
      { name: 'Universidad Politécnica de Madrid', rank: 366, city: 'Madrid', score: 33.4 },
      { name: 'Universidad de Granada', rank: 415, city: 'Granada', score: 30.4 },
    ],
  },
  Sweden: {
    top100: 2, top200: 5, top500: 7, top1000: 8,
    topUniversities: [
      { name: 'Lund University', rank: 79, city: 'Lund', score: 67.9 },
      { name: 'KTH Royal Institute of Technology', rank: 78, city: 'Stockholm', score: 68.0 },
      { name: 'Uppsala University', rank: 105, city: 'Uppsala', score: 63.1 },
      { name: 'Stockholm University', rank: 142, city: 'Stockholm', score: 56.2 },
      { name: 'Chalmers University of Technology', rank: 121, city: 'Gothenburg', score: 59.8 },
      { name: 'University of Gothenburg', rank: 187, city: 'Gothenburg', score: 49.0 },
      { name: 'Linköping University', rank: 326, city: 'Linköping', score: 36.1 },
    ],
  },
  Belgium: {
    top100: 1, top200: 4, top500: 7, top1000: 9,
    topUniversities: [
      { name: 'KU Leuven', rank: 71, city: 'Leuven', score: 70.7 },
      { name: 'Ghent University', rank: 137, city: 'Ghent', score: 57.2 },
      { name: 'Université Catholique de Louvain', rank: 188, city: 'Louvain-la-Neuve', score: 48.7 },
      { name: 'Vrije Universiteit Brussel (VUB)', rank: 196, city: 'Brussels', score: 47.5 },
      { name: 'University of Antwerp', rank: 273, city: 'Antwerp', score: 40.4 },
      { name: 'Université Libre de Bruxelles', rank: 235, city: 'Brussels', score: 43.6 },
      { name: 'University of Liège', rank: 461, city: 'Liège', score: 27.2 },
    ],
  },
  Russia: {
    top100: 1, top200: 2, top500: 8, top1000: 22,
    topUniversities: [
      { name: 'Lomonosov Moscow State University', rank: 95, city: 'Moscow', score: 64.9 },
      { name: 'Saint Petersburg State University', rank: 184, city: 'St. Petersburg', score: 49.3 },
      { name: 'Novosibirsk State University', rank: 313, city: 'Novosibirsk', score: 37.2 },
      { name: 'HSE University', rank: 313, city: 'Moscow', score: 37.2 },
      { name: 'Moscow Institute of Physics and Technology', rank: 326, city: 'Moscow', score: 36.1 },
      { name: 'Tomsk State University', rank: 401, city: 'Tomsk', score: 31.0 },
      { name: 'Bauman Moscow State Technical University', rank: 348, city: 'Moscow', score: 34.4 },
      { name: 'ITMO University', rank: 411, city: 'St. Petersburg', score: 30.7 },
    ],
  },
  Brazil: {
    top100: 0, top200: 1, top500: 6, top1000: 17,
    topUniversities: [
      { name: 'Universidade de São Paulo', rank: 92, city: 'São Paulo', score: 65.4 },
      { name: 'Universidade Estadual de Campinas', rank: 220, city: 'Campinas', score: 45.0 },
      { name: 'Federal University of Rio de Janeiro', rank: 350, city: 'Rio de Janeiro', score: 34.2 },
      { name: 'Universidade Federal de Minas Gerais', rank: 416, city: 'Belo Horizonte', score: 30.4 },
      { name: 'Pontifical Catholic University of Rio de Janeiro', rank: 442, city: 'Rio de Janeiro', score: 28.9 },
      { name: 'Federal University of São Paulo', rank: 451, city: 'São Paulo', score: 27.7 },
    ],
  },
  India: {
    top100: 1, top200: 4, top500: 11, top1000: 46,
    topUniversities: [
      { name: 'Indian Institute of Technology Delhi', rank: 123, city: 'New Delhi', score: 59.5 },
      { name: 'Indian Institute of Technology Bombay', rank: 129, city: 'Mumbai', score: 58.4 },
      { name: 'Indian Institute of Science', rank: 219, city: 'Bangalore', score: 45.2 },
      { name: 'Indian Institute of Technology Madras', rank: 180, city: 'Chennai', score: 50.0 },
      { name: 'Indian Institute of Technology Kharagpur', rank: 215, city: 'Kharagpur', score: 45.6 },
      { name: 'Indian Institute of Technology Kanpur', rank: 222, city: 'Kanpur', score: 44.7 },
      { name: 'University of Delhi', rank: 328, city: 'New Delhi', score: 35.8 },
      { name: 'Indian Institute of Technology Roorkee', rank: 339, city: 'Roorkee', score: 35.0 },
      { name: 'Indian Institute of Technology Guwahati', rank: 334, city: 'Guwahati', score: 35.3 },
      { name: 'Anna University', rank: 411, city: 'Chennai', score: 30.7 },
    ],
  },
  Argentina: {
    top100: 0, top200: 1, top500: 2, top1000: 8,
    topUniversities: [
      { name: 'Universidad de Buenos Aires (UBA)', rank: 71, city: 'Buenos Aires', score: 70.7 },
      { name: 'Pontifical Catholic University of Argentina', rank: 521, city: 'Buenos Aires', score: 23.0 },
      { name: 'Austral University', rank: 451, city: 'Buenos Aires', score: 27.7 },
    ],
  },
  Mexico: {
    top100: 0, top200: 1, top500: 3, top1000: 8,
    topUniversities: [
      { name: 'Tecnológico de Monterrey', rank: 159, city: 'Monterrey', score: 53.5 },
      { name: 'UNAM - Universidad Nacional Autónoma de México', rank: 110, city: 'Mexico City', score: 62.1 },
      { name: 'Universidad de las Américas Puebla', rank: 416, city: 'Puebla', score: 30.4 },
    ],
  },
  Chile: {
    top100: 0, top200: 1, top500: 2, top1000: 5,
    topUniversities: [
      { name: 'Pontificia Universidad Católica de Chile (UC)', rank: 96, city: 'Santiago', score: 64.7 },
      { name: 'Universidad de Chile', rank: 167, city: 'Santiago', score: 52.2 },
      { name: 'Universidad de Concepción', rank: 511, city: 'Concepción', score: 23.4 },
    ],
  },
  SouthAfrica: {
    top100: 0, top200: 1, top500: 3, top1000: 8,
    topUniversities: [
      { name: 'University of Cape Town', rank: 171, city: 'Cape Town', score: 51.5 },
      { name: 'University of the Witwatersrand', rank: 274, city: 'Johannesburg', score: 40.3 },
      { name: 'Stellenbosch University', rank: 305, city: 'Stellenbosch', score: 37.8 },
      { name: 'University of Johannesburg', rank: 354, city: 'Johannesburg', score: 34.0 },
      { name: 'University of Pretoria', rank: 444, city: 'Pretoria', score: 28.9 },
    ],
  },
  SaudiArabia: {
    top100: 1, top200: 2, top500: 6, top1000: 12,
    topUniversities: [
      { name: 'King Fahd University of Petroleum & Minerals', rank: 67, city: 'Dhahran', score: 71.5 },
      { name: 'King Abdulaziz University', rank: 109, city: 'Jeddah', score: 62.4 },
      { name: 'King Saud University', rank: 198, city: 'Riyadh', score: 47.1 },
      { name: 'Alfaisal University', rank: 313, city: 'Riyadh', score: 37.2 },
      { name: 'King Khalid University', rank: 411, city: 'Abha', score: 30.7 },
      { name: 'King Abdullah University of Science and Technology', rank: 211, city: 'Thuwal', score: 45.9 },
    ],
  },
  UAE: {
    top100: 1, top200: 4, top500: 6, top1000: 10,
    topUniversities: [
      { name: 'Khalifa University', rank: 197, city: 'Abu Dhabi', score: 47.3 },
      { name: 'United Arab Emirates University', rank: 230, city: 'Al Ain', score: 44.0 },
      { name: 'American University of Sharjah', rank: 311, city: 'Sharjah', score: 37.4 },
      { name: 'University of Sharjah', rank: 415, city: 'Sharjah', score: 30.4 },
      { name: 'Zayed University', rank: 521, city: 'Dubai', score: 23.0 },
    ],
  },
  Turkey: {
    top100: 0, top200: 0, top500: 5, top1000: 26,
    topUniversities: [
      { name: 'Koç University', rank: 396, city: 'Istanbul', score: 31.5 },
      { name: 'Boğaziçi University', rank: 437, city: 'Istanbul', score: 29.2 },
      { name: 'Middle East Technical University', rank: 444, city: 'Ankara', score: 28.9 },
      { name: 'Istanbul Technical University', rank: 461, city: 'Istanbul', score: 27.2 },
      { name: 'Sabancı University', rank: 451, city: 'Istanbul', score: 27.7 },
    ],
  },
  NewZealand: {
    top100: 1, top200: 5, top500: 8, top1000: 8,
    topUniversities: [
      { name: 'The University of Auckland', rank: 65, city: 'Auckland', score: 72.0 },
      { name: 'University of Otago', rank: 197, city: 'Dunedin', score: 47.3 },
      { name: 'Victoria University of Wellington', rank: 240, city: 'Wellington', score: 43.0 },
      { name: 'The University of Canterbury', rank: 261, city: 'Christchurch', score: 41.2 },
      { name: 'Massey University', rank: 230, city: 'Palmerston North', score: 44.0 },
    ],
  },
  Norway: {
    top100: 0, top200: 2, top500: 3, top1000: 4,
    topUniversities: [
      { name: 'University of Oslo', rank: 116, city: 'Oslo', score: 61.0 },
      { name: 'NTNU - Norwegian University of Science and Technology', rank: 268, city: 'Trondheim', score: 40.7 },
      { name: 'University of Bergen', rank: 246, city: 'Bergen', score: 42.5 },
    ],
  },
  Portugal: {
    top100: 0, top200: 1, top500: 4, top1000: 8,
    topUniversities: [
      { name: 'University of Porto', rank: 254, city: 'Porto', score: 41.7 },
      { name: 'Universidade NOVA de Lisboa', rank: 311, city: 'Lisbon', score: 37.4 },
      { name: 'University of Coimbra', rank: 286, city: 'Coimbra', score: 39.2 },
      { name: 'Universidade de Lisboa', rank: 305, city: 'Lisbon', score: 37.8 },
    ],
  },
  Poland: {
    top100: 0, top200: 0, top500: 2, top1000: 12,
    topUniversities: [
      { name: 'University of Warsaw', rank: 311, city: 'Warsaw', score: 37.4 },
      { name: 'Jagiellonian University', rank: 326, city: 'Krakow', score: 36.1 },
      { name: 'Warsaw University of Technology', rank: 539, city: 'Warsaw', score: 22.2 },
    ],
  },
  Egypt: {
    top100: 0, top200: 0, top500: 2, top1000: 10,
    topUniversities: [
      { name: 'The American University in Cairo', rank: 411, city: 'Cairo', score: 30.7 },
      { name: 'Cairo University', rank: 491, city: 'Cairo', score: 25.5 },
      { name: 'Ain Shams University', rank: 561, city: 'Cairo', score: 21.6 },
    ],
  },
  Indonesia: {
    top100: 0, top200: 0, top500: 2, top1000: 10,
    topUniversities: [
      { name: 'Universitas Indonesia', rank: 215, city: 'Depok', score: 45.6 },
      { name: 'Universitas Gadjah Mada', rank: 251, city: 'Yogyakarta', score: 42.0 },
      { name: 'Bandung Institute of Technology', rank: 286, city: 'Bandung', score: 39.2 },
    ],
  },
  Nigeria: {
    top100: 0, top200: 0, top500: 0, top1000: 2,
    topUniversities: [
      { name: 'University of Lagos', rank: 851, city: 'Lagos', score: 13.0 },
      { name: 'University of Ibadan', rank: 901, city: 'Ibadan', score: 11.5 },
    ],
  },
  Ireland: {
    top100: 1, top200: 3, top500: 6, top1000: 8,
    topUniversities: [
      { name: 'Trinity College Dublin', rank: 75, city: 'Dublin', score: 69.4 },
      { name: 'University College Dublin', rank: 125, city: 'Dublin', score: 59.0 },
      { name: 'University of Galway', rank: 273, city: 'Galway', score: 40.4 },
      { name: 'University College Cork', rank: 273, city: 'Cork', score: 40.4 },
      { name: 'Dublin City University', rank: 410, city: 'Dublin', score: 30.8 },
      { name: 'University of Limerick', rank: 411, city: 'Limerick', score: 30.7 },
    ],
  },
  Israel: {
    top100: 1, top200: 4, top500: 6, top1000: 8,
    topUniversities: [
      { name: 'Hebrew University of Jerusalem', rank: 197, city: 'Jerusalem', score: 47.3 },
      { name: 'Tel Aviv University', rank: 173, city: 'Tel Aviv', score: 51.2 },
      { name: 'Technion - Israel Institute of Technology', rank: 188, city: 'Haifa', score: 48.7 },
      { name: 'Weizmann Institute of Science', rank: 244, city: 'Rehovot', score: 42.7 },
      { name: 'Bar-Ilan University', rank: 392, city: 'Ramat Gan', score: 31.7 },
      { name: 'Ben-Gurion University of the Negev', rank: 446, city: 'Beer-Sheva', score: 28.7 },
    ],
  },
  Denmark: {
    top100: 2, top200: 4, top500: 5, top1000: 5,
    topUniversities: [
      { name: 'University of Copenhagen', rank: 100, city: 'Copenhagen', score: 64.1 },
      { name: 'Technical University of Denmark', rank: 117, city: 'Kongens Lyngby', score: 60.8 },
      { name: 'Aarhus University', rank: 165, city: 'Aarhus', score: 52.4 },
      { name: 'Aalborg University', rank: 348, city: 'Aalborg', score: 34.4 },
      { name: 'University of Southern Denmark', rank: 396, city: 'Odense', score: 31.5 },
    ],
  },
  Finland: {
    top100: 0, top200: 1, top500: 5, top1000: 9,
    topUniversities: [
      { name: 'University of Helsinki', rank: 105, city: 'Helsinki', score: 63.1 },
      { name: 'Aalto University', rank: 114, city: 'Espoo', score: 61.5 },
      { name: 'University of Turku', rank: 348, city: 'Turku', score: 34.4 },
      { name: 'Tampere University', rank: 411, city: 'Tampere', score: 30.7 },
      { name: 'University of Oulu', rank: 311, city: 'Oulu', score: 37.4 },
    ],
  },
};

// QS World University Rankings 2026 — global top 100 (curated snapshot).
//
// This is a flat, global rank-ordered list spanning ALL tracked nations,
// independent of the per-country `topUniversities` lists above (which are
// capped at the top 10 per country). Use this when you want one canonical
// "global top 100" view inside the dashboard.
//
// Names, host cities and approximate QS overall scores reflect the publicly
// viewable QS 2026 edition published June 2025. To refresh, update
// QS_SNAPSHOT_DATE and the entries below from
// https://www.topuniversities.com/world-university-rankings.

export interface GlobalRankedUniversity extends RankedUniversity {
  countryKey: string;   // Internal key, e.g. 'USA' (matches the rest of the app)
  countryLabel: string; // Display label, e.g. 'United States'
}

export const qs2026Top100: GlobalRankedUniversity[] = [
  // 1-10
  { rank: 1,  name: 'Massachusetts Institute of Technology (MIT)', city: 'Cambridge, MA', score: 100.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 2,  name: 'Imperial College London', city: 'London', score: 99.4, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 3,  name: 'Stanford University', city: 'Stanford, CA', score: 98.9, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 4,  name: 'University of Oxford', city: 'Oxford', score: 97.4, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 5,  name: 'Harvard University', city: 'Cambridge, MA', score: 96.8, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 6,  name: 'University of Cambridge', city: 'Cambridge', score: 96.6, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 7,  name: 'ETH Zurich', city: 'Zurich', score: 95.0, countryKey: 'Switzerland', countryLabel: 'Switzerland' },
  { rank: 8,  name: 'National University of Singapore (NUS)', city: 'Singapore', score: 93.7, countryKey: 'Singapore', countryLabel: 'Singapore' },
  { rank: 9,  name: 'UCL (University College London)', city: 'London', score: 92.4, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 10, name: 'California Institute of Technology (Caltech)', city: 'Pasadena, CA', score: 91.7, countryKey: 'USA', countryLabel: 'United States' },

  // 11-20
  { rank: 11, name: 'The University of Hong Kong', city: 'Hong Kong', score: 90.5, countryKey: 'HongKong', countryLabel: 'Hong Kong' },
  { rank: 12, name: 'University of California, Berkeley', city: 'Berkeley, CA', score: 90.1, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 12, name: 'Nanyang Technological University (NTU)', city: 'Singapore', score: 90.1, countryKey: 'Singapore', countryLabel: 'Singapore' },
  { rank: 13, name: 'University of Chicago', city: 'Chicago, IL', score: 89.4, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 14, name: 'University of Pennsylvania', city: 'Philadelphia, PA', score: 88.9, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 14, name: 'Peking University', city: 'Beijing', score: 88.6, countryKey: 'China', countryLabel: 'China' },
  { rank: 16, name: 'Cornell University', city: 'Ithaca, NY', score: 88.1, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 17, name: 'Tsinghua University', city: 'Beijing', score: 87.7, countryKey: 'China', countryLabel: 'China' },
  { rank: 19, name: 'The University of Melbourne', city: 'Melbourne', score: 87.3, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 20, name: 'UNSW Sydney', city: 'Sydney', score: 86.6, countryKey: 'Australia', countryLabel: 'Australia' },

  // 21-30
  { rank: 22, name: 'Princeton University', city: 'Princeton, NJ', score: 86.4, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 23, name: 'Yale University', city: 'New Haven, CT', score: 86.1, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 24, name: 'Columbia University', city: 'New York, NY', score: 85.5, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 25, name: 'University of Toronto', city: 'Toronto', score: 85.0, countryKey: 'Canada', countryLabel: 'Canada' },
  { rank: 25, name: 'The University of Sydney', city: 'Sydney', score: 85.0, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 26, name: 'Université PSL', city: 'Paris', score: 84.7, countryKey: 'France', countryLabel: 'France' },
  { rank: 27, name: 'McGill University', city: 'Montreal', score: 84.4, countryKey: 'Canada', countryLabel: 'Canada' },
  { rank: 27, name: 'The University of Edinburgh', city: 'Edinburgh', score: 84.4, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 28, name: 'Technical University of Munich', city: 'Munich', score: 84.0, countryKey: 'Germany', countryLabel: 'Germany' },
  { rank: 28, name: 'EPFL', city: 'Lausanne', score: 84.0, countryKey: 'Switzerland', countryLabel: 'Switzerland' },

  // 31-40
  { rank: 30, name: 'Fudan University', city: 'Shanghai', score: 83.1, countryKey: 'China', countryLabel: 'China' },
  { rank: 31, name: 'Seoul National University', city: 'Seoul', score: 83.0, countryKey: 'SouthKorea', countryLabel: 'South Korea' },
  { rank: 31, name: 'The University of Manchester', city: 'Manchester', score: 83.0, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 32, name: 'The Chinese University of Hong Kong (CUHK)', city: 'Hong Kong', score: 82.4, countryKey: 'HongKong', countryLabel: 'Hong Kong' },
  { rank: 32, name: 'Australian National University', city: 'Canberra', score: 82.4, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 33, name: 'Institut Polytechnique de Paris', city: 'Palaiseau', score: 82.3, countryKey: 'France', countryLabel: 'France' },
  { rank: 35, name: 'University of Michigan-Ann Arbor', city: 'Ann Arbor, MI', score: 82.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 36, name: "King's College London", city: 'London', score: 81.6, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 36, name: 'Monash University', city: 'Melbourne', score: 81.6, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 36, name: 'The University of Tokyo', city: 'Tokyo', score: 81.5, countryKey: 'Japan', countryLabel: 'Japan' },

  // 41-50
  { rank: 38, name: 'The University of British Columbia', city: 'Vancouver', score: 80.8, countryKey: 'Canada', countryLabel: 'Canada' },
  { rank: 40, name: 'The University of Queensland', city: 'Brisbane', score: 80.0, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 41, name: 'New York University (NYU)', city: 'New York, NY', score: 79.8, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 42, name: 'Delft University of Technology', city: 'Delft', score: 79.6, countryKey: 'Netherlands', countryLabel: 'Netherlands' },
  { rank: 43, name: 'Duke University', city: 'Durham, NC', score: 79.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 44, name: 'The Hong Kong University of Science and Technology', city: 'Hong Kong', score: 78.8, countryKey: 'HongKong', countryLabel: 'Hong Kong' },
  { rank: 45, name: 'Johns Hopkins University', city: 'Baltimore, MD', score: 78.5, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 46, name: 'Northwestern University', city: 'Evanston, IL', score: 78.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 47, name: 'Shanghai Jiao Tong University', city: 'Shanghai', score: 77.4, countryKey: 'China', countryLabel: 'China' },
  { rank: 47, name: 'Zhejiang University', city: 'Hangzhou', score: 77.4, countryKey: 'China', countryLabel: 'China' },

  // 51-60
  { rank: 49, name: 'University of California, Los Angeles (UCLA)', city: 'Los Angeles, CA', score: 77.7, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 50, name: 'Kyoto University', city: 'Kyoto', score: 76.8, countryKey: 'Japan', countryLabel: 'Japan' },
  { rank: 50, name: 'London School of Economics and Political Science (LSE)', city: 'London', score: 76.8, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 51, name: 'Sorbonne University', city: 'Paris', score: 76.6, countryKey: 'France', countryLabel: 'France' },
  { rank: 53, name: 'KAIST', city: 'Daejeon', score: 75.8, countryKey: 'SouthKorea', countryLabel: 'South Korea' },
  { rank: 54, name: 'University of California, San Diego (UCSD)', city: 'La Jolla, CA', score: 75.5, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 55, name: 'University of Amsterdam', city: 'Amsterdam', score: 75.0, countryKey: 'Netherlands', countryLabel: 'Netherlands' },
  { rank: 55, name: 'City University of Hong Kong', city: 'Hong Kong', score: 75.0, countryKey: 'HongKong', countryLabel: 'Hong Kong' },
  { rank: 56, name: 'Yonsei University', city: 'Seoul', score: 74.7, countryKey: 'SouthKorea', countryLabel: 'South Korea' },
  { rank: 56, name: 'University of Bristol', city: 'Bristol', score: 74.7, countryKey: 'UK', countryLabel: 'United Kingdom' },

  // 61-70
  { rank: 57, name: 'The Hong Kong Polytechnic University', city: 'Hong Kong', score: 74.4, countryKey: 'HongKong', countryLabel: 'Hong Kong' },
  { rank: 60, name: 'LMU Munich', city: 'Munich', score: 73.1, countryKey: 'Germany', countryLabel: 'Germany' },
  { rank: 61, name: 'University of Texas at Austin', city: 'Austin, TX', score: 73.4, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 63, name: 'Carnegie Mellon University', city: 'Pittsburgh, PA', score: 73.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 65, name: 'The University of Auckland', city: 'Auckland', score: 72.0, countryKey: 'NewZealand', countryLabel: 'New Zealand' },
  { rank: 65, name: 'Heidelberg University', city: 'Heidelberg', score: 72.0, countryKey: 'Germany', countryLabel: 'Germany' },
  { rank: 67, name: 'Korea University', city: 'Seoul', score: 71.5, countryKey: 'SouthKorea', countryLabel: 'South Korea' },
  { rank: 67, name: 'King Fahd University of Petroleum & Minerals', city: 'Dhahran', score: 71.5, countryKey: 'SaudiArabia', countryLabel: 'Saudi Arabia' },
  { rank: 69, name: 'The University of Warwick', city: 'Coventry', score: 71.4, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 70, name: 'University of Washington', city: 'Seattle, WA', score: 70.5, countryKey: 'USA', countryLabel: 'United States' },

  // 71-80
  { rank: 71, name: 'KU Leuven', city: 'Leuven', score: 70.7, countryKey: 'Belgium', countryLabel: 'Belgium' },
  { rank: 71, name: 'Universidad de Buenos Aires (UBA)', city: 'Buenos Aires', score: 70.7, countryKey: 'Argentina', countryLabel: 'Argentina' },
  { rank: 72, name: 'Brown University', city: 'Providence, RI', score: 70.2, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 73, name: 'Université Paris-Saclay', city: 'Gif-sur-Yvette', score: 70.0, countryKey: 'France', countryLabel: 'France' },
  { rank: 75, name: 'Trinity College Dublin', city: 'Dublin', score: 69.4, countryKey: 'Ireland', countryLabel: 'Ireland' },
  { rank: 76, name: 'Georgia Institute of Technology', city: 'Atlanta, GA', score: 68.7, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 77, name: 'The University of Western Australia', city: 'Perth', score: 68.8, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 78, name: 'KTH Royal Institute of Technology', city: 'Stockholm', score: 68.0, countryKey: 'Sweden', countryLabel: 'Sweden' },
  { rank: 79, name: 'Lund University', city: 'Lund', score: 67.9, countryKey: 'Sweden', countryLabel: 'Sweden' },
  { rank: 80, name: 'Osaka University', city: 'Osaka', score: 67.7, countryKey: 'Japan', countryLabel: 'Japan' },

  // 81-90
  { rank: 80, name: 'Utrecht University', city: 'Utrecht', score: 67.7, countryKey: 'Netherlands', countryLabel: 'Netherlands' },
  { rank: 82, name: 'University of Adelaide', city: 'Adelaide', score: 67.3, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 83, name: 'University of Illinois Urbana-Champaign', city: 'Urbana-Champaign, IL', score: 66.9, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 84, name: 'Tokyo Institute of Technology (Institute of Science Tokyo)', city: 'Tokyo', score: 66.9, countryKey: 'Japan', countryLabel: 'Japan' },
  { rank: 86, name: 'University of Wisconsin-Madison', city: 'Madison, WI', score: 66.0, countryKey: 'USA', countryLabel: 'United States' },
  { rank: 87, name: 'University of Glasgow', city: 'Glasgow', score: 65.8, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 88, name: 'Leiden University', city: 'Leiden', score: 66.1, countryKey: 'Netherlands', countryLabel: 'Netherlands' },
  { rank: 89, name: 'University of Southampton', city: 'Southampton', score: 65.5, countryKey: 'UK', countryLabel: 'United Kingdom' },
  { rank: 90, name: 'University of Zurich', city: 'Zurich', score: 65.7, countryKey: 'Switzerland', countryLabel: 'Switzerland' },
  { rank: 92, name: 'Universidade de São Paulo', city: 'São Paulo', score: 65.4, countryKey: 'Brazil', countryLabel: 'Brazil' },

  // 91-100
  { rank: 95, name: 'Lomonosov Moscow State University', city: 'Moscow', score: 64.9, countryKey: 'Russia', countryLabel: 'Russia' },
  { rank: 96, name: 'University of Alberta', city: 'Edmonton', score: 64.7, countryKey: 'Canada', countryLabel: 'Canada' },
  { rank: 96, name: 'Pontificia Universidad Católica de Chile (UC)', city: 'Santiago', score: 64.7, countryKey: 'Chile', countryLabel: 'Chile' },
  { rank: 96, name: 'University of Technology Sydney', city: 'Sydney', score: 64.7, countryKey: 'Australia', countryLabel: 'Australia' },
  { rank: 97, name: 'Erasmus University Rotterdam', city: 'Rotterdam', score: 64.5, countryKey: 'Netherlands', countryLabel: 'Netherlands' },
  { rank: 97, name: 'Free University of Berlin', city: 'Berlin', score: 64.5, countryKey: 'Germany', countryLabel: 'Germany' },
  { rank: 98, name: 'Politecnico di Milano', city: 'Milan', score: 64.3, countryKey: 'Italy', countryLabel: 'Italy' },
  { rank: 98, name: 'POSTECH', city: 'Pohang', score: 64.3, countryKey: 'SouthKorea', countryLabel: 'South Korea' },
  { rank: 99, name: 'RWTH Aachen University', city: 'Aachen', score: 64.2, countryKey: 'Germany', countryLabel: 'Germany' },
  { rank: 100, name: 'University of Copenhagen', city: 'Copenhagen', score: 64.1, countryKey: 'Denmark', countryLabel: 'Denmark' },
];

// OECD PISA 2022 Mean Performance — curated snapshot.
// PISA is run once every 3 years; 2022 is the most recent published wave.
// The next wave (PISA 2025) is expected to be released in late 2026.
// Source: OECD, https://www.oecd.org/pisa/publications/

export const PISA_WAVE = '2022';
export const PISA_SOURCE_URL = 'https://www.oecd.org/pisa/publications/';

export interface PisaScore {
  reading: number;  // OECD-mean: 476
  math: number;     // OECD-mean: 472
  science: number;  // OECD-mean: 485
}

export const pisaScoresByCountry: Record<string, PisaScore> = {
  Singapore:   { reading: 543, math: 575, science: 561 },
  Japan:       { reading: 516, math: 536, science: 547 },
  SouthKorea:  { reading: 515, math: 527, science: 528 },
  Ireland:     { reading: 516, math: 492, science: 504 },
  Estonia:     { reading: 511, math: 510, science: 526 },
  Canada:      { reading: 507, math: 497, science: 515 },
  HongKong:    { reading: 500, math: 540, science: 520 },
  USA:         { reading: 504, math: 465, science: 499 },
  UK:          { reading: 494, math: 489, science: 500 },
  Australia:   { reading: 498, math: 487, science: 507 },
  NewZealand:  { reading: 501, math: 479, science: 504 },
  Switzerland: { reading: 483, math: 508, science: 503 },
  Poland:      { reading: 489, math: 489, science: 499 },
  Denmark:     { reading: 489, math: 489, science: 494 },
  Czechia:     { reading: 489, math: 487, science: 498 },
  CzechRepublic: { reading: 489, math: 487, science: 498 },
  Sweden:      { reading: 487, math: 482, science: 494 },
  Finland:     { reading: 490, math: 484, science: 511 },
  Germany:     { reading: 480, math: 475, science: 492 },
  Belgium:     { reading: 479, math: 489, science: 491 },
  Netherlands: { reading: 459, math: 493, science: 488 },
  Austria:     { reading: 480, math: 487, science: 491 },
  Norway:      { reading: 477, math: 468, science: 478 },
  France:      { reading: 474, math: 474, science: 487 },
  Slovenia:    { reading: 469, math: 485, science: 500 },
  Hungary:     { reading: 473, math: 473, science: 486 },
  Spain:       { reading: 474, math: 473, science: 485 },
  Italy:       { reading: 482, math: 471, science: 477 },
  Portugal:    { reading: 477, math: 472, science: 484 },
  Israel:      { reading: 474, math: 458, science: 465 },
  Croatia:     { reading: 475, math: 463, science: 483 },
  Iceland:     { reading: 436, math: 459, science: 447 },
  Latvia:      { reading: 475, math: 483, science: 494 },
  Lithuania:   { reading: 472, math: 475, science: 484 },
  Slovakia:    { reading: 447, math: 464, science: 462 },
  Turkey:      { reading: 456, math: 453, science: 476 },
  Greece:      { reading: 438, math: 430, science: 441 },
  Chile:       { reading: 448, math: 412, science: 444 },
  Uruguay:     { reading: 430, math: 409, science: 435 },
  Mexico:      { reading: 415, math: 395, science: 410 },
  Costa_Rica:  { reading: 415, math: 385, science: 405 },
  CostaRica:   { reading: 415, math: 385, science: 405 },
  Brazil:      { reading: 410, math: 379, science: 403 },
  Colombia:    { reading: 409, math: 383, science: 411 },
  Argentina:   { reading: 401, math: 378, science: 406 },
  Peru:        { reading: 408, math: 391, science: 408 },
  SaudiArabia: { reading: 383, math: 389, science: 390 },
  UAE:         { reading: 417, math: 431, science: 432 },
  Qatar:       { reading: 419, math: 414, science: 432 },
  Indonesia:   { reading: 359, math: 366, science: 383 },
  Malaysia:    { reading: 388, math: 409, science: 416 },
  Thailand:    { reading: 379, math: 394, science: 409 },
  Philippines: { reading: 347, math: 355, science: 356 },
  Vietnam:     { reading: 462, math: 469, science: 472 },
  China:       { reading: 555, math: 591, science: 590 }, // 4 provinces sampled
  Romania:     { reading: 428, math: 428, science: 428 },
  Bulgaria:    { reading: 404, math: 417, science: 421 },
  Albania:     { reading: 358, math: 368, science: 376 },
  Kazakhstan:  { reading: 386, math: 425, science: 423 },
  Morocco:     { reading: 339, math: 365, science: 365 },
  Jordan:      { reading: 342, math: 361, science: 375 },
};

// OECD average for reference lines
export const PISA_OECD_AVG = { reading: 476, math: 472, science: 485 };
