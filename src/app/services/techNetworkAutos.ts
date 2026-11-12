// Carmakers and auto-tech suppliers for the Technology page power network.
// Conventions match aiPowerNetworkCompanies.ts and techNetworkUpstream.ts.
// Non-USD figures use the same Nov 2026 rates as the upstream file
// (¥159.6, €1.11 per USD for market values; 2025 averages for revenue).

import type { Commodity, LinkKind, TechCompany, TechLink } from './network/types';

const MCAP = 'Market cap, Nov 2026';

const L = (source: string, target: string, kind: LinkKind, note: string, commodity?: Commodity): TechLink =>
  (commodity ? { source, target, kind, note, commodity } : { source, target, kind, note });

export const AUTO_COMPANIES: TechCompany[] = [
  // ── Carmakers ────────────────────────────────────────────────────────
  {
    id: 'toyota', name: 'Toyota', category: 'autos', hqCountry: 'Japan', hqCity: 'Toyota City',
    founded: 1937, leader: 'Koji Sato', listed: true, ticker: '7203.T',
    revenueUsdBn: 315.1, revenueBasis: 'FY to Mar 2026 (approx.)', valueUsdBn: 223, valueBasis: MCAP,
    oneLiner: 'The world’s largest carmaker by volume, now building its next cars on Nvidia DRIVE.',
    summary: [
      'Toyota sells more cars than any other company and still leads in hybrids. Its brands include Lexus, and it holds large stakes in suppliers such as Denso.',
      'In January 2025 it said next-generation vehicles would run on Nvidia DRIVE AGX Orin and the safety-certified DriveOS stack. It also co-owns Prime Planet Energy & Solutions with Panasonic for battery cells, and uses Qualcomm’s Snapdragon Digital Chassis in models such as the 2026 RAV4.',
    ],
    contributions: [
      'Largest global automaker by unit sales.',
      'Next-generation ADAS and autonomy stack on Nvidia DRIVE AGX Orin (Jan 2025).',
      'Prime Planet battery joint venture with Panasonic.',
      'Snapdragon Digital Chassis cockpit in the 2026 RAV4.',
    ],
    keyProducts: ['Toyota and Lexus vehicles', 'Hybrid powertrains', 'Toyota Safety Sense'],
    role: 'Volume carmaker adopting Nvidia and Qualcomm silicon for software-defined vehicles.',
    sources: [
      { label: 'Toyota global newsroom', url: 'https://global.toyota/en/newsroom/' },
      { label: 'Nvidia investor news', url: 'https://investor.nvidia.com/' },
    ],
  },
  {
    id: 'volkswagen', name: 'Volkswagen', category: 'autos', hqCountry: 'Germany', hqCity: 'Wolfsburg',
    founded: 1937, leader: 'Oliver Blume', listed: true, ticker: 'VOW3.DE',
    revenueUsdBn: 351.1, revenueBasis: 'FY2025', valueUsdBn: 55, valueBasis: MCAP,
    oneLiner: 'Europe’s largest car group, using Mobileye mapping and CATL and LG cells in its EVs.',
    summary: [
      'Volkswagen Group owns VW, Audi, Porsche, Škoda, SEAT, Bentley and others, and is the largest carmaker by revenue. Its MEB platform underpins most of its volume electric cars.',
      'It was the first large OEM to use Mobileye’s crowd-sourced Roadbook maps in Travel Assist across VW, Škoda and SEAT. Battery cells come from CATL, LG Energy Solution and other suppliers; Qualcomm will supply high-performance SoCs for vehicles built with Rivian’s joint-venture platform.',
    ],
    contributions: [
      'Largest automaker by revenue.',
      'Mobileye Roadbook maps in Travel Assist 2.5 across MEB models.',
      'Multi-supplier EV battery programme including CATL and LG Energy Solution.',
    ],
    keyProducts: ['ID. electric range', 'Audi and Porsche EVs', 'MEB and SSP platforms'],
    role: 'Europe’s volume EV platform and a major Mobileye and battery customer.',
    sources: [
      { label: 'Volkswagen Group newsroom', url: 'https://www.volkswagen-group.com/en/press-releases' },
    ],
  },
  {
    id: 'byd', name: 'BYD', category: 'autos', hqCountry: 'China', hqCity: 'Shenzhen',
    founded: 1995, leader: 'Wang Chuanfu', listed: true, ticker: '002594.SZ',
    revenueUsdBn: 108.0, revenueBasis: 'FY2025', valueUsdBn: 135, valueBasis: MCAP,
    oneLiner: 'The largest new-energy vehicle maker, with its own batteries and Nvidia DRIVE cars.',
    summary: [
      'BYD makes more plug-in cars than anyone else and builds most of its own blades and LFP cells. In 2025 it sold about 4.6 million new-energy vehicles.',
      'It is on Nvidia’s DRIVE partner list for autonomous and assisted driving, and has plugged Chinese foundation models, including DeepSeek, into DiLink cockpits across its brands.',
    ],
    contributions: [
      'Largest NEV maker by unit sales in 2025.',
      'Vertical integration of LFP blade batteries and vehicles.',
      'Nvidia DRIVE platform for next-generation assisted driving.',
    ],
    keyProducts: ['Qin, Han, Seal and Dolphin ranges', 'Blade LFP battery', 'e-Platform'],
    role: 'China’s EV champion and a vertically integrated battery-and-chip buyer.',
    sources: [
      { label: 'BYD investor relations', url: 'https://www.bydglobal.com/en/investor' },
    ],
  },
  {
    id: 'gm', name: 'General Motors', category: 'autos', hqCountry: 'USA', hqCity: 'Detroit',
    founded: 1908, leader: 'Mary Barra', listed: true, ticker: 'GM',
    revenueUsdBn: 187.4, revenueBasis: 'FY2025', valueUsdBn: 72, valueBasis: MCAP,
    oneLiner: 'US carmaker building Ultium EVs on LG cells, Nvidia AI and US-made rare-earth magnets.',
    summary: [
      'GM is the largest US carmaker by sales, with Chevrolet, GMC, Cadillac and Buick. Its Ultium EV platform is the centre of its electrification plan.',
      'Ultium Cells is a joint venture with LG Energy Solution. It has a long-term deal with MP Materials for US-made rare-earth magnets, and at GTC 2025 it said next-generation vehicles and factories would use Nvidia DRIVE AGX and Omniverse.',
    ],
    contributions: [
      'Ultium Cells battery joint venture with LG Energy Solution.',
      'Long-term rare-earth magnet supply from MP Materials for Ultium motors.',
      'Nvidia DRIVE AGX and Omniverse for next-generation vehicles and factories.',
    ],
    keyProducts: ['Ultium platform', 'Chevrolet, GMC and Cadillac EVs', 'Super Cruise'],
    role: 'US EV platform linking Korean batteries, US magnets and Nvidia compute.',
    sources: [
      { label: 'GM investor news', url: 'https://investors.gm.com/' },
    ],
  },
  {
    id: 'ford', name: 'Ford', category: 'autos', hqCountry: 'USA', hqCity: 'Dearborn, MI', tier: 'brief',
    founded: 1903, leader: 'Jim Farley', listed: true, ticker: 'F',
    revenueUsdBn: 187.3, revenueBasis: 'FY2025', valueUsdBn: 48, valueBasis: MCAP,
    oneLiner: 'US truck and commercial-vehicle leader using CATL LFP tech and Mobileye maps.',
    summary: [
      'Ford’s Blue, Pro and Model e units sell F-Series trucks, commercial vans and EVs such as the Mustang Mach-E. Its Michigan battery plant licences CATL’s LFP chemistry, and Mobileye’s REM maps feed future BlueCruise hands-free driving.',
    ],
    contributions: ['CATL LFP technology for the Michigan battery plant.', 'Mobileye REM mapping for BlueCruise.'],
    keyProducts: ['F-Series', 'Ford Pro', 'Mustang Mach-E', 'BlueCruise'],
    role: 'US volume brand tying Chinese battery IP to Mobileye ADAS.',
    sources: [{ label: 'Ford media center', url: 'https://media.ford.com/' }],
  },
  {
    id: 'stellantis', name: 'Stellantis', category: 'autos', hqCountry: 'Netherlands', hqCity: 'Hoofddorp', tier: 'brief',
    founded: 2021, listed: true, ticker: 'STLA',
    revenueUsdBn: 169.7, revenueBasis: 'FY2025', valueUsdBn: 14, valueBasis: MCAP,
    oneLiner: 'Owner of Jeep, Peugeot and Ram, using Mistral AI and CATL cells.',
    summary: [
      'Stellantis was formed from Fiat Chrysler and PSA. It is expanding a strategic partnership with Mistral AI across customer service, vehicle development and factories, buys cells from CATL and LG Energy Solution, and is on Nvidia’s Drive Hyperion customer list.',
    ],
    contributions: ['Strategic AI partnership with Mistral (2025).', 'CATL and LG Energy Solution cell supply.'],
    keyProducts: ['Jeep', 'Peugeot', 'Ram', 'STLA platforms'],
    role: 'European–US multi-brand group adopting European AI and Chinese batteries.',
    sources: [{ label: 'Stellantis newsroom', url: 'https://www.stellantis.com/en/news' }],
  },
  {
    id: 'hyundai', name: 'Hyundai', category: 'autos', hqCountry: 'SouthKorea', hqCity: 'Seoul',
    founded: 1967, leader: 'José Muñoz', listed: true, ticker: '005380.KS',
    revenueUsdBn: 128.5, revenueBasis: 'FY2025', valueUsdBn: 90, valueBasis: MCAP,
    oneLiner: 'Korean carmaker building Waymo’s Ioniq 5 robotaxis and buying Nvidia GPUs for cars.',
    summary: [
      'Hyundai Motor, with Kia, is one of the largest global car groups and a leading EV seller through the Ioniq and EV6 lines. Its Georgia Metaplant builds cars for the US market.',
      'In October 2024 it agreed a multi-year deal for Waymo to put the sixth-generation Waymo Driver into Ioniq 5s made in Georgia. It is also adopting Nvidia DRIVE and securing large GPU allocations for software-defined vehicles.',
    ],
    contributions: [
      'Multi-year Waymo partnership: Ioniq 5 robotaxis from the Georgia Metaplant (Oct 2024).',
      'Nvidia DRIVE and GPU supply for next-generation EVs and autonomy.',
      'LG Energy Solution and CATL among its cell suppliers.',
    ],
    keyProducts: ['Ioniq 5 and 6', 'Kia EV6', 'E-GMP platform'],
    role: 'Hardware partner for Waymo’s robotaxi fleet and an Nvidia DRIVE OEM.',
    sources: [
      { label: 'Hyundai Motor Group news', url: 'https://www.hyundaimotorgroup.com/en/news' },
    ],
  },
  {
    id: 'bmw', name: 'BMW', category: 'autos', hqCountry: 'Germany', hqCity: 'Munich', tier: 'brief',
    founded: 1916, leader: 'Oliver Zipse', listed: true, ticker: 'BMW.DE',
    revenueUsdBn: 154.0, revenueBasis: 'FY2025', valueUsdBn: 60, valueBasis: MCAP,
    oneLiner: 'Premium German brand putting Alibaba and DeepSeek AI into China-built cars.',
    summary: [
      'BMW’s Neue Klasse platform is its next EV architecture. In China it is integrating Alibaba’s Qwen models and DeepSeek into the in-car assistant from 2025–26, and it co-developed Qualcomm’s Snapdragon Ride Pilot L2+ stack. Figure AI robots also work in its factories.',
    ],
    contributions: ['Alibaba Qwen and DeepSeek in China-market Neue Klasse cars.', 'Snapdragon Ride Pilot with Qualcomm.'],
    keyProducts: ['Neue Klasse', 'iX and i4', 'MINI'],
    role: 'Premium OEM stitching Chinese foundation models to Qualcomm ADAS silicon.',
    sources: [{ label: 'BMW Group press', url: 'https://www.press.bmwgroup.com/' }],
  },
  {
    id: 'mercedes', name: 'Mercedes-Benz', category: 'autos', hqCountry: 'Germany', hqCity: 'Stuttgart',
    founded: 1926, leader: 'Ola Källenius', listed: true, ticker: 'MBG.DE',
    revenueUsdBn: 157.5, revenueBasis: 'FY2025', valueUsdBn: 55, valueBasis: MCAP,
    oneLiner: 'Luxury carmaker putting Google Gemini and Nvidia Drive AV into production cars.',
    summary: [
      'Mercedes-Benz is the largest luxury-car brand by heritage and a leader in Level 2+ driving with Drive Pilot. Its MB.OS software stack is the centre of its software-defined-vehicle plan.',
      'It was the first production customer for Google Cloud’s Automotive AI Agent, combining Gemini with ChatGPT in “Hey Mercedes”. At CES 2026 it was named the lead customer for Nvidia’s Alpamayo Drive AV stack on the new CLA.',
    ],
    contributions: [
      'First production Google Cloud Automotive AI Agent, with Gemini in Hey Mercedes.',
      'Lead customer for Nvidia Alpamayo / Drive AV on the CLA (CES 2026).',
      'CATL and LG Energy Solution among its cell suppliers.',
    ],
    keyProducts: ['EQ and CLA electric ranges', 'Drive Pilot', 'MB.OS'],
    role: 'Luxury SDV reference customer for Google and Nvidia in-car AI.',
    sources: [
      { label: 'Mercedes-Benz Group media', url: 'https://group.mercedes-benz.com/innovation/' },
    ],
  },
  {
    id: 'honda', name: 'Honda', category: 'autos', hqCountry: 'Japan', hqCity: 'Tokyo', tier: 'brief',
    founded: 1948, listed: true, ticker: '7267.T',
    revenueUsdBn: 142.3, revenueBasis: 'FY to Mar 2026 (approx.)', valueUsdBn: 31, valueBasis: MCAP,
    oneLiner: 'Japanese car and motorcycle maker building US EV batteries with LG Energy Solution.',
    summary: [
      'Honda sells cars, motorcycles and power equipment worldwide. With LG Energy Solution it is building a large EV battery plant in Ohio to supply North American electric models.',
    ],
    contributions: ['Ohio EV battery joint venture with LG Energy Solution.'],
    keyProducts: ['Civic and CR-V', 'Acura', 'Motorcycles'],
    role: 'Japanese OEM tying US EV output to Korean cells.',
    sources: [{ label: 'Honda newsroom', url: 'https://global.honda/en/newsroom/' }],
  },
  {
    id: 'geely', name: 'Geely', category: 'autos', hqCountry: 'China', hqCity: 'Hangzhou', tier: 'brief',
    founded: 1986, leader: 'Li Shufu', listed: true, ticker: '0175.HK',
    revenueUsdBn: 79.9, revenueBasis: 'FY2025', valueUsdBn: 32, valueBasis: MCAP,
    oneLiner: 'Chinese group behind Volvo, Zeekr and Lotus, using Mobileye and Nvidia DRIVE.',
    summary: [
      'Geely Holding controls Geely Auto, Zeekr, Volvo Cars, Polestar, Lotus and others. Zeekr was an early Mobileye Drive L4 partner, and Nvidia expanded its DRIVE deals to Geely in 2026. Geely brands have also integrated DeepSeek models in China.',
    ],
    contributions: ['Zeekr consumer AV programme on Mobileye Drive.', 'Nvidia DRIVE partnership (2026).'],
    keyProducts: ['Geely and Zeekr EVs', 'SEA architecture', 'Volvo Cars stake'],
    role: 'Chinese multi-brand group linking Mobileye autonomy to Nvidia compute.',
    sources: [{ label: 'Geely Auto investors', url: 'https://global.geely.com/en/investors' }],
  },
  {
    id: 'xiaomi', name: 'Xiaomi', category: 'autos', hqCountry: 'China', hqCity: 'Beijing', tier: 'brief',
    founded: 2010, leader: 'Lei Jun', listed: true, ticker: '1810.HK',
    revenueUsdBn: 63.7, revenueBasis: 'FY2025, RMB457bn', valueUsdBn: 110, valueBasis: MCAP,
    oneLiner: 'Phone maker whose EV and AI unit already contributes about a quarter of group sales.',
    summary: [
      'Xiaomi built its fortune on phones and AIoT devices, then launched the SU7 electric car. In 2025 its smart-EV, AI and new-initiatives segment took in RMB106bn, about 23% of group revenue, and it is on Nvidia’s DRIVE partner list.',
    ],
    contributions: ['SU7 EV ramp; EV/AI segment about RMB106bn in 2025.', 'Nvidia DRIVE partner for assisted driving.'],
    keyProducts: ['Xiaomi SU7', 'Smartphones', 'AIoT devices'],
    role: 'Consumer-tech brand crossing into EVs on Nvidia automotive compute.',
    sources: [{ label: 'Xiaomi investor relations', url: 'https://ir.mi.com/' }],
  },

  // ── Auto tech & suppliers ────────────────────────────────────────────
  {
    id: 'bosch', name: 'Bosch', category: 'auto-tech', hqCountry: 'Germany', hqCity: 'Gerlingen', tier: 'brief',
    founded: 1886, leader: 'Stefan Hartung', listed: false,
    revenueUsdBn: 97.7, revenueBasis: 'FY2025', valueUsdBn: null, valueBasis: 'Private, Bosch foundation-owned',
    oneLiner: 'The world’s largest auto supplier, a 10% owner of TSMC’s Dresden fab.',
    summary: [
      'Robert Bosch GmbH is the largest automotive supplier by revenue and also a major industrial and consumer-electronics group. It owns 10% of the European Semiconductor Manufacturing Company (ESMC) Dresden fab with TSMC, Infineon and NXP, aimed at automotive chips from 2027.',
    ],
    contributions: ['10% stake in ESMC Dresden with TSMC (automotive nodes from 2027).'],
    keyProducts: ['Powertrain and ADAS components', 'ESITronic', 'Industrial tech'],
    role: 'Tier-1 supplier securing European automotive chip capacity.',
    sources: [{ label: 'Bosch press', url: 'https://www.bosch-presse.de/pressportal/de/en/' }],
  },
  {
    id: 'denso', name: 'Denso', category: 'auto-tech', hqCountry: 'Japan', hqCity: 'Kariya', tier: 'brief',
    founded: 1949, listed: true, ticker: '6902.T',
    revenueUsdBn: 47.2, revenueBasis: 'FY to Mar 2026, ¥7.54tn', valueUsdBn: 31, valueBasis: MCAP,
    oneLiner: 'Toyota’s main components affiliate and a top global auto supplier.',
    summary: [
      'Denso makes thermal systems, powertrain electrification parts, ADAS sensors and semiconductors. Toyota remains its largest shareholder, so the two move together on hybrids, batteries and software-defined vehicles.',
    ],
    contributions: ['Core Toyota-group supplier of electrification and ADAS parts.'],
    keyProducts: ['Thermal systems', 'Electrification components', 'ADAS sensors'],
    role: 'Toyota-aligned tier-1 feeding hybrid and EV hardware.',
    sources: [{ label: 'Denso investors', url: 'https://www.denso.com/global/en/investors/' }],
  },
  {
    id: 'mobileye', name: 'Mobileye', category: 'auto-tech', hqCountry: 'Israel', hqCity: 'Jerusalem',
    founded: 1999, leader: 'Amnon Shashua', listed: true, ticker: 'MBLY',
    revenueUsdBn: 1.89, revenueBasis: 'FY2025', valueUsdBn: 4.9, valueBasis: MCAP,
    oneLiner: 'Intel-controlled vision and mapping company behind many carmakers’ ADAS.',
    summary: [
      'Mobileye’s EyeQ chips and Road Experience Management maps power driver-assistance systems in tens of millions of cars. Intel still owns the large majority of the company after its 2022 IPO.',
      'Volkswagen uses its Roadbook maps in Travel Assist, Ford is adding REM to BlueCruise, and Geely’s Zeekr brand has been a lead partner for Mobileye Drive consumer autonomy.',
    ],
    contributions: [
      'EyeQ vision processors in volume ADAS programmes worldwide.',
      'REM / Roadbook maps in Volkswagen Travel Assist and Ford BlueCruise.',
      'Mobileye Drive autonomy stack with Zeekr (Geely).',
    ],
    keyProducts: ['EyeQ', 'Road Experience Management', 'Mobileye Drive'],
    role: 'ADAS and mapping layer for volume carmakers, majority-owned by Intel.',
    sources: [
      { label: 'Mobileye newsroom', url: 'https://www.mobileye.com/news/' },
      { label: 'Intel newsroom', url: 'https://www.intc.com/news-events/press-releases' },
    ],
  },
  {
    id: 'waymo', name: 'Waymo', category: 'auto-tech', hqCountry: 'USA', hqCity: 'Mountain View, CA',
    founded: 2009, listed: false,
    revenueUsdBn: 0.35, revenueBasis: 'Annualised run-rate, 2026 (reported)', valueUsdBn: 126, valueBasis: 'Private valuation, Feb 2026',
    oneLiner: 'Alphabet’s robotaxi unit, putting its Driver into Hyundai Ioniq 5s.',
    summary: [
      'Waymo began as Google’s self-driving-car project and now runs paid robotaxi rides in several US cities. Alphabet remains the owner; a 2026 funding round valued the unit at about $126bn.',
      'Hyundai will supply Ioniq 5s from its Georgia plant for Waymo One fleets (deal Oct 2024). Waymo also distributes rides through Uber in selected cities.',
    ],
    contributions: [
      'Largest scaled robotaxi service in the US.',
      'Multi-year vehicle supply partnership with Hyundai for Ioniq 5 robotaxis (Oct 2024).',
      'Ride distribution partnership with Uber in selected cities.',
    ],
    keyProducts: ['Waymo Driver', 'Waymo One'],
    role: 'Alphabet’s autonomous-driving fleet, now hardware-partnered with Hyundai.',
    sources: [
      { label: 'Waymo blog', url: 'https://waymo.com/blog/' },
      { label: 'Hyundai Motor Group news', url: 'https://www.hyundaimotorgroup.com/en/news' },
    ],
  },
  {
    id: 'infineon', name: 'Infineon', category: 'auto-tech', hqCountry: 'Germany', hqCity: 'Munich', tier: 'brief',
    founded: 1999, leader: 'Jochen Hanebeck', listed: true, ticker: 'IFX.DE',
    revenueUsdBn: 16.3, revenueBasis: 'FY to Sep 2025, €14.66bn', valueUsdBn: 48, valueBasis: 'Market cap, Sep 2025 (€43.2bn)',
    oneLiner: 'Europe’s largest auto-chip maker and a partner in TSMC’s Dresden fab.',
    summary: [
      'Infineon is the global leader in automotive semiconductors, with about half of its revenue from cars. With TSMC, Bosch and NXP it co-owns the ESMC Dresden fab (10% stake) for 12–28 nm automotive chips from 2027.',
    ],
    contributions: ['Largest automotive semiconductor vendor.', '10% of ESMC Dresden with TSMC.'],
    keyProducts: ['Power semiconductors', 'Microcontrollers', 'Sensors'],
    role: 'Power and control chips inside EVs and ADAS.',
    sources: [{ label: 'Infineon investor relations', url: 'https://www.infineon.com/cms/en/about-infineon/investor/' }],
  },
  {
    id: 'nxp', name: 'NXP', category: 'auto-tech', hqCountry: 'Netherlands', hqCity: 'Eindhoven', tier: 'brief',
    founded: 2006, listed: true, ticker: 'NXPI',
    revenueUsdBn: 12.3, revenueBasis: 'FY2025', valueUsdBn: 68, valueBasis: MCAP,
    oneLiner: 'Leading auto and industrial chipmaker, 10% owner of ESMC Dresden.',
    summary: [
      'NXP sells processors, radar and networking chips used across software-defined vehicles. With TSMC, Bosch and Infineon it holds 10% of the ESMC Dresden fab aimed at European automotive supply from 2027.',
    ],
    contributions: ['Major automotive processor and radar supplier.', '10% of ESMC Dresden with TSMC.'],
    keyProducts: ['S32 processors', 'Radar and networking chips', 'Secure elements'],
    role: 'Vehicle compute and sensing silicon for European and global OEMs.',
    sources: [{ label: 'NXP investor relations', url: 'https://investors.nxp.com/' }],
  },
];

export const AUTO_LINKS: TechLink[] = [
  // ── Chips and in-car AI ──────────────────────────────────────────────
  L('nvidia', 'toyota', 'supplies', 'Next-generation Toyota vehicles on Nvidia DRIVE AGX Orin and DriveOS (Jan 2025).'),
  L('nvidia', 'gm', 'partnership', 'Next-generation GM vehicles and factories on Nvidia DRIVE AGX and Omniverse (GTC 2025).'),
  L('nvidia', 'hyundai', 'supplies', 'Nvidia DRIVE and GPU allocations for Hyundai’s software-defined EVs and autonomy stack.'),
  L('nvidia', 'mercedes', 'supplies', 'Lead customer for Nvidia Alpamayo / Drive AV software on the CLA (CES 2026).'),
  L('nvidia', 'byd', 'supplies', 'BYD among Nvidia DRIVE partners for assisted and autonomous driving (2025–26).'),
  L('nvidia', 'xiaomi', 'supplies', 'Xiaomi listed among Nvidia DRIVE partners for next-generation vehicles (Jan 2025).'),
  L('nvidia', 'stellantis', 'supplies', 'Stellantis is a Nvidia Drive Hyperion customer for autonomy compute.'),
  L('nvidia', 'geely', 'supplies', 'Nvidia expanded DRIVE deals to Geely brands (2026).'),
  L('qualcomm', 'toyota', 'supplies', 'Snapdragon Digital Chassis powers the 2026 Toyota RAV4 cockpit and AI features.'),
  L('qualcomm', 'bmw', 'partnership', 'Snapdragon Ride Pilot L2+ platform co-developed with BMW.'),
  L('alphabet', 'mercedes', 'partnership', 'First production Google Cloud Automotive AI Agent; Gemini in Hey Mercedes.'),
  L('microsoft', 'mercedes', 'partnership', 'ChatGPT / Azure OpenAI powers part of the Hey Mercedes in-car assistant.'),
  L('stellantis', 'mistral', 'partnership', 'Strategic partnership to use Mistral models across customer, development and factory AI (2025).'),
  L('alibaba', 'bmw', 'partnership', 'Alibaba Qwen models in BMW’s China-market Neue Klasse assistant from 2026.'),
  L('bmw', 'deepseek', 'partnership', 'DeepSeek models to be integrated in new BMW vehicles in China (Apr 2025).'),
  L('byd', 'deepseek', 'partnership', 'DeepSeek models integrated into DiLink cockpits across BYD brands (2025).'),
  L('figure-ai', 'bmw', 'supplies', 'Figure AI humanoid robots deployed in BMW factories for material handling and assembly.'),

  // ── Batteries and metals ─────────────────────────────────────────────
  L('catl', 'ford', 'partnership', 'Ford’s Michigan battery plant licences CATL LFP cell technology.', 'batteries'),
  L('catl', 'stellantis', 'supplies', 'CATL cells for Stellantis EV programmes, including European capacity.', 'batteries'),
  L('catl', 'volkswagen', 'supplies', 'CATL among Volkswagen Group’s volume EV cell suppliers.', 'batteries'),
  L('catl', 'hyundai', 'supplies', 'CATL cells used in selected Hyundai and Kia EVs.', 'batteries'),
  L('catl', 'toyota', 'supplies', 'CATL among Toyota’s EV cell suppliers.', 'batteries'),
  L('lg-energy', 'gm', 'supplies', 'Ultium Cells joint venture supplies GM’s Ultium EV platform.', 'batteries'),
  L('lg-energy', 'hyundai', 'supplies', 'LG Energy Solution cells for Hyundai Motor Group EVs.', 'batteries'),
  L('lg-energy', 'honda', 'partnership', 'Ohio EV battery joint venture to supply Honda’s North American electrics.', 'batteries'),
  L('lg-energy', 'volkswagen', 'supplies', 'LG Energy Solution among Volkswagen Group’s EV cell suppliers.', 'batteries'),
  L('panasonic', 'toyota', 'partnership', 'Prime Planet Energy & Solutions battery joint venture.', 'batteries'),
  L('mp-materials', 'gm', 'supplies', 'Long-term US rare-earth magnet supply for Ultium EV motors (from 2023).', 'rare-earths'),
  L('albemarle', 'gm', 'supplies', 'Battery-grade lithium into the Ultium and broader EV supply chain.', 'lithium'),

  // ── Self-driving ─────────────────────────────────────────────────────
  L('alphabet', 'waymo', 'investment', 'Alphabet owns Waymo; 2026 funding round valued the unit at about $126bn.'),
  L('hyundai', 'waymo', 'supplies', 'Multi-year deal (Oct 2024) for Georgia-built Ioniq 5s equipped with the Waymo Driver.'),
  L('waymo', 'uber', 'partnership', 'Waymo rides distributed through Uber in selected US cities.'),
  L('intel', 'mobileye', 'investment', 'Intel retains a large majority stake after Mobileye’s 2022 IPO.'),
  L('mobileye', 'volkswagen', 'supplies', 'Roadbook / REM maps power Travel Assist 2.5 across VW, Škoda and SEAT MEB models.'),
  L('mobileye', 'ford', 'partnership', 'REM mapping to expand Ford BlueCruise hands-free driving.'),
  L('mobileye', 'geely', 'partnership', 'Zeekr consumer autonomy programme built on Mobileye Drive.'),

  // ── Auto chip supply and group ties ──────────────────────────────────
  L('tsmc', 'infineon', 'partnership', 'ESMC Dresden fab: TSMC 70%, Infineon 10%; automotive 12–28 nm from 2027.'),
  L('tsmc', 'bosch', 'partnership', 'ESMC Dresden fab: TSMC 70%, Bosch 10%; automotive chips from 2027.'),
  L('tsmc', 'nxp', 'partnership', 'ESMC Dresden fab: TSMC 70%, NXP 10%; automotive chips from 2027.'),
  L('infineon', 'bosch', 'partnership', 'Co-investors with TSMC and NXP in the ESMC Dresden automotive fab.'),
  L('nxp', 'bosch', 'partnership', 'Co-investors with TSMC and Infineon in the ESMC Dresden automotive fab.'),
  L('toyota', 'denso', 'investment', 'Toyota is Denso’s largest shareholder and main customer.'),
  L('nvidia', 'denso', 'partnership', 'Denso builds ADAS and electrification systems on Nvidia DRIVE platforms.'),
  L('denso', 'panasonic', 'partnership', 'Both supply Toyota-group electrification hardware; Panasonic cells and Denso thermal and power electronics.', 'batteries'),
  L('infineon', 'volkswagen', 'supplies', 'Automotive power and microcontroller chips for Volkswagen Group vehicles.'),
  L('infineon', 'bmw', 'supplies', 'Automotive power and microcontroller chips for BMW vehicles.'),
  L('nxp', 'volkswagen', 'supplies', 'Automotive processors and radar for Volkswagen Group vehicles.'),
  L('nxp', 'mercedes', 'supplies', 'Automotive processors and networking chips for Mercedes-Benz vehicles.'),
  L('bosch', 'volkswagen', 'supplies', 'Powertrain, ADAS and electronics components for Volkswagen Group.'),
  L('bosch', 'mercedes', 'supplies', 'Powertrain, ADAS and electronics components for Mercedes-Benz.'),
];
