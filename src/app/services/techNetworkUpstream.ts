// Upstream companies for the Technology page power network: the energy,
// metals, materials and grid suppliers the AI and tech stack depends on.
// Conventions match aiPowerNetworkCompanies.ts. Non-USD figures are converted
// at Nov 12, 2026 rates for market values (¥159.6, A$0.684, C$1.425, €1.11 per
// USD) and at 2025 averages for revenue.

import type { TechCompany } from './network/types';

const MCAP = 'Market cap, Nov 2026';

export const UPSTREAM_COMPANIES: TechCompany[] = [
  // ── Oil & gas ────────────────────────────────────────────────────────
  {
    id: 'aramco', name: 'Saudi Aramco', category: 'oil-gas', hqCountry: 'SaudiArabia', hqCity: 'Dhahran',
    founded: 1933, leader: 'Amin Nasser', listed: true, ticker: '2222.SR',
    revenueUsdBn: 445.7, revenueBasis: 'FY2025, revenue and other income related to sales', valueUsdBn: 1700, valueBasis: MCAP,
    oneLiner: 'The world’s largest oil producer, now building Saudi Arabia’s AI data-centre capacity.',
    summary: [
      'Saudi Aramco pumps about one in every eight barrels of the world’s crude and is the only energy company worth more than $1 trillion. The Saudi state owns the large majority of its shares.',
      'Through its Aramco Digital unit it has become a sponsor of the kingdom’s AI build-out, partnering with Groq on a large inference data centre and with Google Cloud on a local cloud region. Its cheap gas and land are a large part of Saudi Arabia’s pitch to host AI computing.',
    ],
    contributions: [
      'Largest crude producer and exporter, setting the marginal price of energy for much of the world.',
      'Aramco Digital partnered with Groq to build what it called the world’s largest AI inference data centre (2024).',
      'Partnered with Google Cloud to bring a cloud region to Saudi Arabia.',
    ],
    keyProducts: ['Crude oil', 'Natural gas', 'Refined and chemical products', 'Aramco Digital'],
    role: 'Energy and capital behind Saudi Arabia’s bid to become an AI compute hub.',
    sources: [
      { label: 'Saudi Aramco investor relations', url: 'https://www.aramco.com/en/investors' },
    ],
  },
  {
    id: 'exxonmobil', name: 'ExxonMobil', category: 'oil-gas', hqCountry: 'USA', hqCity: 'Spring, TX',
    founded: 1870, leader: 'Darren Woods', listed: true, ticker: 'XOM',
    revenueUsdBn: 323.9, revenueBasis: 'FY2025', valueUsdBn: 680, valueBasis: MCAP,
    oneLiner: 'America’s largest oil company, pitching gas power with carbon capture to AI data centres.',
    summary: [
      'ExxonMobil is the largest Western oil major by market value, with production centred on the Permian Basin, Guyana and liquefied natural gas. It also runs one of the world’s biggest refining and chemicals businesses.',
      'Since late 2024 it has pitched natural-gas power plants paired with carbon capture as a fast route to firm, lower-carbon electricity for data centres. In December 2025 it joined NextEra to develop a 1.2 GW plant in the US Southeast; as of 2026 the companies were still marketing it to hyperscalers.',
    ],
    contributions: [
      'Largest US oil and gas producer, with the Permian and Guyana as growth engines.',
      'Operates the largest CO₂ pipeline network in the US, which underpins its data-centre power offer.',
      'Co-developing a 1.2 GW gas-plus-carbon-capture power project with NextEra (Dec 2025).',
    ],
    keyProducts: ['Crude oil and natural gas', 'LNG', 'Carbon capture and storage', 'Lubricants and chemicals'],
    role: 'Natural gas and carbon capture for data-centre power plants.',
    sources: [
      { label: 'ExxonMobil investor relations', url: 'https://investor.exxonmobil.com/' },
    ],
  },
  {
    id: 'chevron', name: 'Chevron', category: 'oil-gas', hqCountry: 'USA', hqCity: 'Houston',
    founded: 1879, leader: 'Mike Wirth', listed: true, ticker: 'CVX',
    revenueUsdBn: 184.4, revenueBasis: 'FY2025', valueUsdBn: 419, valueBasis: MCAP,
    oneLiner: 'Oil major that signed the first big gas-power deal with a hyperscaler.',
    summary: [
      'Chevron is the second-largest US oil company, with large positions in the Permian Basin, Kazakhstan, Australia LNG and, since buying Hess, Guyana.',
      'In June 2026 it signed a 20-year power purchase agreement with Microsoft. Its Energy Forge One venture with Engine No. 1’s Joulent will build Project Kilby, about 2.7 GW of gas-fired generation co-located with a Microsoft data centre in Reeves County, Texas. It runs mostly on GE Vernova turbines and targets first power in 2028.',
    ],
    contributions: [
      'First oil major to sign a dedicated power deal with a hyperscaler (Microsoft, Jun 2026).',
      'Project Kilby: ~2.7 GW of behind-the-meter gas power fed by Chevron’s own Permian gas.',
      'Ordered large GE Vernova gas turbines for data-centre power.',
    ],
    keyProducts: ['Crude oil and natural gas', 'LNG', 'Power for data centres (Energy Forge One)'],
    role: 'Dedicated gas-fired power for Microsoft AI data centres.',
    sources: [
      { label: 'Chevron newsroom', url: 'https://www.chevron.com/newsroom' },
    ],
  },
  {
    id: 'shell', name: 'Shell', category: 'oil-gas', hqCountry: 'UK', hqCity: 'London', tier: 'brief',
    founded: 1907, leader: 'Wael Sawan', listed: true, ticker: 'SHEL',
    revenueUsdBn: 266.9, revenueBasis: 'FY2025', valueUsdBn: 277, valueBasis: MCAP,
    oneLiner: 'Europe’s largest oil company and the world’s biggest LNG trader.',
    summary: [
      'Shell is Europe’s largest energy company and the leading trader of liquefied natural gas, the fuel behind much new data-centre generation. It is a long-standing Microsoft Azure customer for cloud and AI, and supplies dielectric fluids for immersion-cooled AI servers.',
    ],
    contributions: ['World’s largest LNG portfolio.', 'Immersion-cooling fluids for AI data centres.'],
    keyProducts: ['LNG', 'Crude oil', 'Lubricants and cooling fluids'],
    role: 'Gas supply and data-centre cooling fluids.',
    sources: [{ label: 'Shell investor relations', url: 'https://www.shell.com/investors.html' }],
  },
  {
    id: 'totalenergies', name: 'TotalEnergies', category: 'oil-gas', hqCountry: 'France', hqCity: 'Courbevoie', tier: 'brief',
    founded: 1924, leader: 'Patrick Pouyanné', listed: true, ticker: 'TTE',
    revenueUsdBn: 201.2, revenueBasis: 'FY2025', valueUsdBn: 194, valueBasis: MCAP,
    oneLiner: 'French energy major selling renewable power to Google and working with Mistral AI.',
    summary: [
      'TotalEnergies is an oil and gas major with a fast-growing power business, including a 10 GW US renewables portfolio. In November 2025 it signed a 15-year deal to supply Google’s Ohio data centres with 1.5 TWh of solar power, and in June 2025 it set up a joint AI lab with Mistral AI.',
    ],
    contributions: ['15-year solar power deal for Google’s Ohio data centres (Nov 2025).', 'Joint AI innovation lab with Mistral AI (Jun 2025).'],
    keyProducts: ['Oil and gas', 'LNG', 'Renewable power'],
    role: 'Renewable power for data centres and an industrial user of European AI.',
    sources: [{ label: 'TotalEnergies newsroom', url: 'https://totalenergies.com/news' }],
  },

  // ── Nuclear & utilities ──────────────────────────────────────────────
  {
    id: 'constellation', name: 'Constellation Energy', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Baltimore',
    founded: 2022, leader: 'Joe Dominguez', listed: true, ticker: 'CEG',
    revenueUsdBn: 22.7, revenueBasis: 'FY2025', valueUsdBn: 97, valueBasis: MCAP,
    oneLiner: 'America’s largest nuclear operator, selling round-the-clock carbon-free power to Big Tech.',
    summary: [
      'Constellation was spun out of Exelon in 2022 and owns the largest fleet of nuclear reactors in the US, which produce about a tenth of the country’s carbon-free electricity. Its purchase of Calpine, agreed in 2025, adds a large gas fleet.',
      'Hyperscalers want firm, 24/7 clean power, and Constellation has signed long-term deals with all of them. It is restarting Three Mile Island Unit 1 as the Crane Clean Energy Center for Microsoft and selling the Clinton plant’s output to Meta.',
    ],
    contributions: [
      '20-year deal to restart Three Mile Island Unit 1 for Microsoft, 835 MW (Sep 2024).',
      '20-year agreement for the output of the Clinton nuclear plant with Meta, 1.1 GW (Jun 2025).',
      'Calvert Cliffs uprate power for Amazon.',
      'Largest US nuclear fleet, about 22 GW.',
    ],
    keyProducts: ['Nuclear power', 'Natural gas generation', 'Clean energy contracts for data centres'],
    role: 'Firm nuclear power for hyperscaler data centres.',
    sources: [
      { label: 'Constellation newsroom', url: 'https://www.constellationenergy.com/newsroom.html' },
    ],
  },
  {
    id: 'nextera', name: 'NextEra Energy', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Juno Beach, FL',
    founded: 1925, leader: 'John Ketchum', listed: true, ticker: 'NEE',
    revenueUsdBn: 27.4, revenueBasis: 'FY2025', valueUsdBn: 180, valueBasis: MCAP,
    oneLiner: 'The largest US renewable developer, now restarting nuclear and building gas for data centres.',
    summary: [
      'NextEra owns Florida Power & Light and NextEra Energy Resources, the world’s largest generator of wind and solar power.',
      'It is restarting the Duane Arnold nuclear plant in Iowa to supply Google, co-developing gigawatt-scale data-centre campuses with Google, selling solar and storage to Meta, and working with ExxonMobil on a gas plant with carbon capture.',
    ],
    contributions: [
      'Restarting Duane Arnold nuclear plant to supply Google, 615 MW (Oct 2025).',
      'Partnership with Google on several gigawatt-scale data-centre campuses (Dec 2025).',
      'About 2.5 GW of solar and storage contracts with Meta.',
      'Gas-plus-carbon-capture project with ExxonMobil (Dec 2025).',
    ],
    keyProducts: ['Wind and solar', 'Battery storage', 'Nuclear', 'Florida Power & Light'],
    role: 'Utility-scale generation for data-centre campuses.',
    sources: [
      { label: 'NextEra Energy investor relations', url: 'https://www.investor.nexteraenergy.com/' },
    ],
  },
  {
    id: 'vistra', name: 'Vistra', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Irving, TX', tier: 'brief',
    founded: 2016, listed: true, ticker: 'VST',
    revenueUsdBn: 17.6, revenueBasis: 'FY2025', valueUsdBn: 45, valueBasis: MCAP,
    oneLiner: 'Texas power producer selling nuclear output to Meta.',
    summary: [
      'Vistra is one of the largest US power generators, with gas, coal and the second-largest competitive nuclear fleet. It has agreed to supply Meta with about 2.2 GW from three nuclear plants in Ohio and Pennsylvania.',
    ],
    contributions: ['About 2.2 GW of nuclear power contracted to Meta.'],
    keyProducts: ['Nuclear power', 'Gas generation', 'Retail electricity'],
    role: 'Nuclear and gas power for data centres.',
    sources: [{ label: 'Vistra investor relations', url: 'https://investor.vistracorp.com/' }],
  },
  {
    id: 'talen', name: 'Talen Energy', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Houston', tier: 'brief',
    founded: 2015, listed: true, ticker: 'TLN',
    revenueUsdBn: 2.6, revenueBasis: 'FY2025', valueUsdBn: 16.5, valueBasis: MCAP,
    oneLiner: 'Owner of the Susquehanna nuclear plant, whose output goes to Amazon.',
    summary: [
      'Talen sold its data-centre campus next to the Susquehanna nuclear plant in Pennsylvania to Amazon in 2024 and in 2025 expanded the deal to supply up to 1.92 GW of nuclear power to AWS through 2042.',
    ],
    contributions: ['Up to 1.92 GW of Susquehanna nuclear power for AWS (Jun 2025).'],
    keyProducts: ['Nuclear power', 'Gas generation'],
    role: 'Nuclear power for Amazon data centres.',
    sources: [{ label: 'Talen Energy investor relations', url: 'https://ir.talenenergy.com/' }],
  },
  {
    id: 'cameco', name: 'Cameco', category: 'nuclear-utilities', hqCountry: 'Canada', hqCity: 'Saskatoon',
    founded: 1988, listed: true, ticker: 'CCJ',
    revenueUsdBn: 2.5, revenueBasis: 'FY2025, C$3.5bn', valueUsdBn: 32.4, valueBasis: MCAP,
    oneLiner: 'North America’s largest uranium miner and co-owner of Westinghouse.',
    summary: [
      'Cameco mines uranium at McArthur River and Cigar Lake in Saskatchewan, among the richest deposits in the world, and provides conversion and fuel services.',
      'With Brookfield it bought Westinghouse in 2023 and owns 49%. In October 2025 the owners agreed a partnership with the US government to finance at least $80bn of new Westinghouse reactors, a build-out pitched partly as power for AI.',
    ],
    contributions: [
      'Operates two of the world’s highest-grade uranium mines.',
      'Owns 49% of Westinghouse with Brookfield (since Nov 2023).',
      'Party to the US government’s $80bn Westinghouse reactor partnership (Oct 2025).',
    ],
    keyProducts: ['Uranium', 'Conversion services', 'Fuel fabrication'],
    role: 'Fuel for the nuclear plants that power data centres.',
    sources: [
      { label: 'Cameco investor relations', url: 'https://www.cameco.com/invest' },
    ],
  },
  {
    id: 'westinghouse', name: 'Westinghouse Electric', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Cranberry Township, PA',
    founded: 1886, listed: false,
    revenueUsdBn: null, revenueBasis: 'Not disclosed', valueUsdBn: 7.9, valueBasis: 'Enterprise value at Nov 2023 acquisition',
    oneLiner: 'Designer of the AP1000 reactor at the centre of America’s nuclear revival.',
    summary: [
      'Westinghouse designs reactors and supplies fuel and services to about half of the world’s operating nuclear plants. It is owned by Brookfield (51%) and Cameco (49%).',
      'Under an October 2025 partnership, the US government will arrange financing and permits for at least $80bn of new AP1000 reactors, with the power expected to serve AI data centres. It uses Google Cloud AI tools to speed up reactor design and construction planning.',
    ],
    contributions: [
      'AP1000 reactor design, the basis for the planned $80bn US build-out.',
      'Fuel and services for roughly half of the world’s reactors.',
      'Uses Google Cloud AI to cut reactor design and construction time (2025).',
    ],
    keyProducts: ['AP1000 reactor', 'AP300 small modular reactor', 'Nuclear fuel', 'Plant services'],
    role: 'Reactor designs for new firm power on the grid.',
    sources: [{ label: 'Westinghouse newsroom', url: 'https://info.westinghousenuclear.com/news' }],
  },
  {
    id: 'kairos', name: 'Kairos Power', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Alameda, CA', tier: 'brief',
    founded: 2016, listed: false,
    revenueUsdBn: null, revenueBasis: 'Pre-revenue', valueUsdBn: null, valueBasis: 'Not disclosed',
    oneLiner: 'Molten-salt reactor startup building 500 MW of nuclear for Google.',
    summary: [
      'Kairos Power develops fluoride-salt-cooled small reactors. Google agreed in 2024 to buy up to 500 MW from its plants by 2035, the first corporate deal for a fleet of small modular reactors. The first unit, Hermes 2 in Tennessee, will deliver 50 MW to the TVA grid serving Google from 2030.',
    ],
    contributions: ['First corporate SMR fleet deal (Google, Oct 2024).'],
    keyProducts: ['KP-FHR small modular reactor', 'Hermes demonstration reactors'],
    role: 'Advanced nuclear capacity for Google.',
    sources: [{ label: 'Kairos Power updates', url: 'https://kairospower.com/' }],
  },
  {
    id: 'x-energy', name: 'X-energy', category: 'nuclear-utilities', hqCountry: 'USA', hqCity: 'Rockville, MD', tier: 'brief',
    founded: 2009, listed: true, ticker: 'XE',
    revenueUsdBn: null, revenueBasis: 'Pre-commercial', valueUsdBn: 11.5, valueBasis: 'Value at Apr 2026 IPO debut',
    oneLiner: 'Amazon-backed small-reactor developer that listed in 2026.',
    summary: [
      'X-energy designs the Xe-100, an 80 MW high-temperature gas-cooled reactor. Amazon anchored its 2024 funding round, held about 29% before its April 2026 Nasdaq listing, and plans to buy up to 5 GW of its capacity.',
    ],
    contributions: ['Amazon targets 5 GW of Xe-100 capacity.'],
    keyProducts: ['Xe-100 reactor', 'TRISO-X fuel'],
    role: 'Small modular reactors for Amazon.',
    sources: [{ label: 'X-energy newsroom', url: 'https://x-energy.com/media' }],
  },

  // ── Mining & metals ──────────────────────────────────────────────────
  {
    id: 'freeport', name: 'Freeport-McMoRan', category: 'mining', hqCountry: 'USA', hqCity: 'Phoenix',
    founded: 1912, leader: 'Kathleen Quirk', listed: true, ticker: 'FCX',
    revenueUsdBn: 25.9, revenueBasis: 'FY2025', valueUsdBn: 86.5, valueBasis: MCAP,
    oneLiner: 'The largest listed copper-focused miner and about 70% of US refined copper output.',
    summary: [
      'Freeport runs Grasberg in Indonesia, one of the world’s largest copper and gold mines, plus large operations in Arizona and Peru. Copper made up three quarters of its 2025 revenue.',
      'Data centres use copper in power cables, busbars, transformer windings and cooling, so AI has become part of the copper demand story. Freeport accounts for about 70% of US refined copper production.',
    ],
    contributions: [
      'About 70% of US refined copper production.',
      'Grasberg: one of the world’s largest copper mines.',
      'Large open-pit copper operations across Arizona, New Mexico and Peru.',
    ],
    keyProducts: ['Copper cathode and rod', 'Gold', 'Molybdenum'],
    role: 'Copper for the grid, cables and data-centre power gear.',
    sources: [{ label: 'Freeport-McMoRan investor relations', url: 'https://investors.fcx.com/' }],
  },
  {
    id: 'bhp', name: 'BHP', category: 'mining', hqCountry: 'Australia', hqCity: 'Melbourne',
    founded: 1885, listed: true, ticker: 'BHP',
    revenueUsdBn: 58.8, revenueBasis: 'FY to Jun 2026', valueUsdBn: 206, valueBasis: MCAP,
    oneLiner: 'The world’s largest miner and largest copper producer.',
    summary: [
      'BHP mines iron ore, copper, coal and potash, and is the world’s largest copper producer through Escondida in Chile and operations in Australia. Copper delivered most of its earnings in the year to June 2026.',
      'It supplies nickel to Tesla and works with Microsoft on cloud and machine learning to lift copper recovery at Escondida.',
    ],
    contributions: [
      'World’s largest copper producer, led by Escondida in Chile.',
      'Nickel supply agreement with Tesla (2021).',
      'AI-driven copper recovery at Escondida with Microsoft.',
    ],
    keyProducts: ['Copper', 'Iron ore', 'Nickel', 'Potash'],
    role: 'Copper and battery metals at global scale.',
    sources: [{ label: 'BHP investor centre', url: 'https://www.bhp.com/investors' }],
  },
  {
    id: 'rio-tinto', name: 'Rio Tinto', category: 'mining', hqCountry: 'UK', hqCity: 'London', tier: 'brief',
    founded: 1873, listed: true, ticker: 'RIO',
    revenueUsdBn: 57.6, revenueBasis: 'FY2025', valueUsdBn: 106, valueBasis: MCAP,
    oneLiner: 'Diversified miner supplying low-carbon copper to AWS data centres.',
    summary: [
      'Rio Tinto mines iron ore, aluminium, copper and lithium. In January 2026 AWS became the first customer for copper from its Nuton bioleaching process at an Arizona mine, for use in US data-centre parts. It also has a copper partnership with Codelco in Chile.',
    ],
    contributions: ['First Nuton copper goes to AWS data centres (Jan 2026).'],
    keyProducts: ['Iron ore', 'Aluminium', 'Copper', 'Lithium'],
    role: 'Copper and aluminium for data-centre hardware.',
    sources: [{ label: 'Rio Tinto news releases', url: 'https://www.riotinto.com/en/news/releases' }],
  },
  {
    id: 'glencore', name: 'Glencore', category: 'mining', hqCountry: 'Switzerland', hqCity: 'Baar', tier: 'brief',
    founded: 1974, listed: true, ticker: 'GLEN.L',
    revenueUsdBn: 247.5, revenueBasis: 'FY2025, includes marketing', valueUsdBn: 80, valueBasis: MCAP,
    oneLiner: 'Mining and commodity-trading giant, a major copper and cobalt supplier.',
    summary: [
      'Glencore mines and trades copper, cobalt, nickel, zinc and coal. Its revenue is inflated by trading, but it is one of the largest copper producers and the biggest cobalt supplier outside China, with a cobalt supply deal with Tesla.',
    ],
    contributions: ['Cobalt supply agreement with Tesla (2020).'],
    keyProducts: ['Copper', 'Cobalt', 'Commodity trading'],
    role: 'Battery metals and copper.',
    sources: [{ label: 'Glencore investors', url: 'https://www.glencore.com/investors' }],
  },
  {
    id: 'codelco', name: 'Codelco', category: 'mining', hqCountry: 'Chile', hqCity: 'Santiago', tier: 'brief',
    founded: 1976, listed: false,
    revenueUsdBn: 19.6, revenueBasis: 'FY2025', valueUsdBn: null, valueBasis: 'State-owned',
    oneLiner: 'Chile’s state copper company, about 1.4 Mt of copper a year.',
    summary: [
      'Codelco is the world’s largest state-owned copper miner, producing 1.41 Mt in 2025 including joint ventures. It is partnering with Rio Tinto on the Nuevo Cobre project to add new supply.',
    ],
    contributions: ['1.41 Mt of copper in 2025.'],
    keyProducts: ['Copper cathode', 'Molybdenum'],
    role: 'A large share of the world’s mined copper.',
    sources: [{ label: 'Codelco corporate site', url: 'https://www.codelco.com/' }],
  },
  {
    id: 'mp-materials', name: 'MP Materials', category: 'mining', hqCountry: 'USA', hqCity: 'Las Vegas',
    founded: 2017, leader: 'James Litinsky', listed: true, ticker: 'MP',
    revenueUsdBn: 0.22, revenueBasis: 'FY2025', valueUsdBn: 6.5, valueBasis: MCAP,
    oneLiner: 'America’s only scaled rare-earth mine, now making magnets for Apple.',
    summary: [
      'MP Materials owns Mountain Pass in California, the only large rare-earth mine and separation plant in the Americas, and is building magnet factories in Texas.',
      'In July 2025 the US Department of Defense became its largest shareholder with a $400m investment, a price floor for NdPr and a guaranteed offtake. Days later Apple signed a $500m deal for US-made recycled magnets from 2027.',
    ],
    contributions: [
      'Only scaled rare-earth mine and separation plant in the Americas.',
      '$500m magnet supply and recycling deal with Apple (Jul 2025).',
      'DoD partnership with a $110/kg NdPr price floor (Jul 2025).',
    ],
    keyProducts: ['NdPr oxide', 'Rare-earth magnets', 'Magnet recycling'],
    role: 'Non-Chinese rare-earth magnets for devices, robots and motors.',
    sources: [
      { label: 'MP Materials investor news', url: 'https://investors.mpmaterials.com/' },
      { label: 'Apple newsroom', url: 'https://www.apple.com/newsroom/' },
    ],
  },
  {
    id: 'lynas', name: 'Lynas Rare Earths', category: 'mining', hqCountry: 'Australia', hqCity: 'Perth', tier: 'brief',
    founded: 1983, listed: true, ticker: 'LYC.AX',
    revenueUsdBn: null, revenueBasis: 'n/a', valueUsdBn: 9.2, valueBasis: 'Market cap, Nov 2026 (A$13.4bn)',
    oneLiner: 'The largest rare-earth producer outside China.',
    summary: [
      'Lynas mines at Mount Weld in Western Australia and separates rare earths in Malaysia, making it the only scaled non-Chinese supplier of separated NdPr. Its main market is Japanese magnet makers, including Shin-Etsu.',
    ],
    contributions: ['Main non-Chinese source of separated NdPr.'],
    keyProducts: ['NdPr oxide', 'Heavy rare earths'],
    role: 'Rare earths for magnet makers outside China.',
    sources: [{ label: 'Lynas Rare Earths investors', url: 'https://lynasrareearths.com/investors-media/' }],
  },
  {
    id: 'albemarle', name: 'Albemarle', category: 'mining',
    hqCountry: 'USA', hqCity: 'Charlotte, NC',
    founded: 1994, leader: 'Kent Masters', listed: true, ticker: 'ALB',
    revenueUsdBn: 5.1, revenueBasis: 'FY2025', valueUsdBn: 11.3, valueBasis: MCAP,
    oneLiner: 'The world’s largest lithium producer.',
    summary: [
      'Albemarle extracts lithium from brine in Chile’s Atacama and hard rock in Australia, and refines it into battery-grade carbonate and hydroxide.',
      'Its customers include CATL, Panasonic, LG Energy Solution and Tesla. Lithium prices collapsed after 2022, so revenue has fallen by about 30%, but grid batteries for data centres have added a new source of demand.',
    ],
    contributions: [
      'Largest lithium producer by output.',
      'Supplies lithium to Tesla and the three largest non-BYD cell makers.',
      'Operations across Chile, Australia, China and the US.',
    ],
    keyProducts: ['Lithium hydroxide', 'Lithium carbonate', 'Bromine'],
    role: 'Lithium for the batteries behind EVs and grid storage.',
    sources: [{ label: 'Albemarle investor relations', url: 'https://investors.albemarle.com/' }],
  },

  // ── Materials & gases ────────────────────────────────────────────────
  {
    id: 'linde', name: 'Linde', category: 'materials-gases', hqCountry: 'UK', hqCity: 'Woking',
    founded: 1879, leader: 'Sanjiv Lamba', listed: true, ticker: 'LIN',
    revenueUsdBn: 34.0, revenueBasis: 'FY2025', valueUsdBn: 242, valueBasis: MCAP,
    oneLiner: 'The world’s largest industrial-gas company and Samsung’s main gas supplier.',
    summary: [
      'Linde makes oxygen, nitrogen, argon, hydrogen and specialty gases, and builds the plants that make them. It is the largest materials company in the world by market value.',
      'Chip fabs consume vast volumes of ultra-pure gases. Linde is the main supplier to Samsung’s Pyeongtaek complex, its largest electronics site worldwide, and has supplied SK hynix’s fabs with on-site fluorine since 2004.',
    ],
    contributions: [
      'Main industrial-gas supplier to Samsung’s Pyeongtaek fabs, adding a new on-site plant (Apr 2025).',
      'On-site fluorine for chamber cleaning at all SK hynix fabs.',
      'Builds air-separation and hydrogen plants worldwide.',
    ],
    keyProducts: ['Nitrogen, oxygen, argon', 'Hydrogen', 'Electronic specialty gases', 'Engineering'],
    role: 'Ultra-pure gases that every chip fab runs on.',
    sources: [
      { label: 'Linde news and media', url: 'https://www.linde.com/news-and-media' },
      { label: 'Linde investor relations', url: 'https://investors.linde.com/' },
    ],
  },
  {
    id: 'air-liquide', name: 'Air Liquide', category: 'materials-gases', hqCountry: 'France', hqCity: 'Paris',
    founded: 1902, listed: true, ticker: 'AI.PA',
    revenueUsdBn: 30.4, revenueBasis: 'FY2025, €26.9bn', valueUsdBn: 136, valueBasis: MCAP,
    oneLiner: 'Industrial-gas leader supplying TSMC, Micron and SK hynix.',
    summary: [
      'Air Liquide is the second-largest industrial-gas company. Electronics is one of its fastest-growing businesses, with on-site plants at leading fabs in Taiwan, Korea, Japan and the US.',
      'It is building a $250m+ plant for Micron’s new Idaho fab and a $170m+ plant for SK hynix’s first US advanced-packaging fab in Indiana, which will make HBM for AI chips.',
    ],
    contributions: [
      '$250m+ carrier-gas plant for Micron in Idaho (Jun 2024).',
      '$170m+ on-site units for SK hynix’s Indiana HBM packaging fab (Jul 2026).',
      'Long-term supplier to Taiwan’s leading foundry.',
    ],
    keyProducts: ['Ultra-pure carrier gases', 'Electronic specialty materials', 'Hydrogen'],
    role: 'Gases for the fabs making AI memory and logic.',
    sources: [
      { label: 'Air Liquide press releases', url: 'https://www.airliquide.com/group/press-releases-news' },
    ],
  },
  {
    id: 'corning', name: 'Corning', category: 'materials-gases', hqCountry: 'USA', hqCity: 'Corning, NY',
    founded: 1851, leader: 'Wendell Weeks', listed: true, ticker: 'GLW',
    revenueUsdBn: 15.6, revenueBasis: 'FY2025', valueUsdBn: 104, valueBasis: MCAP,
    oneLiner: 'Glass and optical-fibre maker wiring AI data centres for Meta and Nvidia.',
    summary: [
      'Corning invented low-loss optical fibre in 1970 and makes Gorilla Glass for every iPhone. AI data centres need many times more fibre than older ones, which has turned its optical business into its growth engine.',
      'Meta agreed in January 2026 to pay up to $6bn through 2030 for fibre and cable. In May 2026 Nvidia took the right to invest up to $3.2bn as Corning builds three US plants for Nvidia’s optical interconnects. Apple committed $2.5bn to make all iPhone and Watch cover glass at its Kentucky plant.',
    ],
    contributions: [
      'Up to $6bn fibre and cable deal with Meta (Jan 2026).',
      'Three US optical plants for Nvidia, with Nvidia warrants worth up to $3.2bn (May 2026).',
      '$2.5bn Apple cover-glass commitment in Kentucky (Aug 2025).',
      'Inventor of low-loss optical fibre.',
    ],
    keyProducts: ['Optical fibre and cable', 'Gorilla Glass', 'Display glass', 'Hollow-core fibre'],
    role: 'Optical fibre that links AI accelerators and data centres.',
    sources: [
      { label: 'Corning investor news', url: 'https://investor.corning.com/' },
    ],
  },
  {
    id: 'entegris', name: 'Entegris', category: 'materials-gases', hqCountry: 'USA', hqCity: 'Billerica, MA', tier: 'brief',
    founded: 1966, listed: true, ticker: 'ENTG',
    revenueUsdBn: 3.2, revenueBasis: 'FY2025', valueUsdBn: 23.6, valueBasis: MCAP,
    oneLiner: 'Supplier of the filters, slurries and chemicals that keep fabs contamination-free.',
    summary: [
      'Entegris makes CMP slurries and pads, liquid filters, specialty chemicals and wafer carriers. Every leading fab, TSMC included, depends on its purity products, and its sales rise with each new process node.',
    ],
    contributions: ['Purity and materials supplier to every leading-edge fab.'],
    keyProducts: ['CMP slurries', 'Filtration', 'Specialty chemicals'],
    role: 'Process materials for advanced chips.',
    sources: [{ label: 'Entegris investor relations', url: 'https://investor.entegris.com/' }],
  },
  {
    id: 'jsr', name: 'JSR', category: 'materials-gases', hqCountry: 'Japan', hqCity: 'Tokyo', tier: 'brief',
    founded: 1957, listed: false,
    revenueUsdBn: null, revenueBasis: 'Not disclosed since delisting', valueUsdBn: 6.4, valueBasis: 'JIC buyout, 2024 (¥904bn)',
    oneLiner: 'Leading photoresist maker, taken private by Japan’s state fund.',
    summary: [
      'JSR is one of a handful of Japanese firms that dominate photoresist, the light-sensitive coating used to print chip patterns. Its Inpria unit makes metal-oxide resists for EUV. The state-backed Japan Investment Corporation took it private in 2024 to consolidate the industry.',
    ],
    contributions: ['Metal-oxide EUV photoresists through Inpria.'],
    keyProducts: ['Photoresists', 'EUV metal-oxide resist'],
    role: 'Photoresist for chip lithography.',
    sources: [{ label: 'JSR corporate site', url: 'https://www.jsr.co.jp/jsr_e/' }],
  },
  {
    id: 'sibelco', name: 'Sibelco', category: 'materials-gases', hqCountry: 'Belgium', hqCity: 'Antwerp', tier: 'brief',
    founded: 1872, listed: false,
    revenueUsdBn: null, revenueBasis: 'n/a', valueUsdBn: null, valueBasis: 'Private, family-controlled',
    oneLiner: 'Owner of Spruce Pine, source of most chip-grade high-purity quartz.',
    summary: [
      'Sibelco mines high-purity quartz at Spruce Pine, North Carolina, which supplies about 80% of the quartz used by the chip industry. It goes into the crucibles in which silicon ingots are grown. Hurricane Helene shut the mines in 2024 and exposed how concentrated this step is.',
    ],
    contributions: ['About 80% of chip-industry high-purity quartz.'],
    keyProducts: ['High-purity quartz', 'Industrial minerals'],
    role: 'Quartz for the crucibles that grow silicon wafers.',
    sources: [{ label: 'Sibelco corporate site', url: 'https://www.sibelco.com/' }],
  },

  // ── Batteries & grid ─────────────────────────────────────────────────
  {
    id: 'catl', name: 'CATL', category: 'batteries-grid', hqCountry: 'China', hqCity: 'Ningde',
    founded: 2011, leader: 'Robin Zeng', listed: true, ticker: '300750.SZ',
    revenueUsdBn: 59.0, revenueBasis: 'FY2025, RMB424bn', valueUsdBn: 166, valueBasis: MCAP,
    oneLiner: 'The world’s largest battery maker, supplying cars and grid storage.',
    summary: [
      'CATL makes more than a third of the world’s EV batteries and is the leader in grid-scale storage cells. Its lithium-iron-phosphate chemistry has become the standard for energy storage.',
      'It supplies Tesla’s cars and Megapack storage systems. As data centres add batteries to smooth demand spikes and firm up renewable power, storage has become a direct AI input.',
    ],
    contributions: [
      'Largest EV and energy-storage battery maker worldwide.',
      'LFP cells for Tesla vehicles and Megapacks.',
      'Added a Hong Kong listing in 2025, one of the year’s largest share sales.',
    ],
    keyProducts: ['LFP and NMC cells', 'Energy-storage systems', 'Sodium-ion cells'],
    role: 'Batteries for EVs and grid storage behind data centres.',
    sources: [{ label: 'CATL corporate site', url: 'https://www.catl.com/en/' }],
  },
  {
    id: 'prysmian', name: 'Prysmian', category: 'batteries-grid', hqCountry: 'Italy', hqCity: 'Milan',
    founded: 1879, leader: 'Massimo Battaini', listed: true, ticker: 'PRY.MI',
    revenueUsdBn: 22.2, revenueBasis: 'FY2025, €19.7bn', valueUsdBn: 36.9, valueBasis: MCAP,
    oneLiner: 'The world’s largest cable maker, for power grids and data-centre fibre.',
    summary: [
      'Prysmian makes high-voltage power cables, subsea interconnectors and optical fibre. It bought Encore Wire in 2024 and Atkore in 2026, making it a major buyer of US copper rod.',
      'In July 2026 it signed a 10-year, up to €5.5bn optical-cable deal with Molex for use inside data centres.',
    ],
    contributions: [
      'Largest cable maker by revenue.',
      'Up to €5.5bn data-centre optical-cable agreement with Molex (Jul 2026).',
      'Owns Encore Wire, a large US buyer of copper rod.',
    ],
    keyProducts: ['HV and subsea cables', 'Optical fibre and cable', 'Building wire'],
    role: 'Power cables and fibre for grids and data centres.',
    sources: [{ label: 'Prysmian press releases', url: 'https://www.prysmian.com/en/media/press-releases' }],
  },
  {
    id: 'hitachi', name: 'Hitachi', category: 'batteries-grid', hqCountry: 'Japan', hqCity: 'Tokyo',
    founded: 1910, leader: 'Toshiaki Tokunaga', listed: true, ticker: '6501.T',
    revenueUsdBn: 70.6, revenueBasis: 'FY to Mar 2026, ¥10.6tn', valueUsdBn: 140, valueBasis: 'Market cap, Nov 2026 (¥22.3tn)',
    oneLiner: 'Japanese conglomerate whose Hitachi Energy unit leads in transformers and grid gear.',
    summary: [
      'Hitachi has reshaped itself around digital and energy infrastructure. Hitachi Energy, the former ABB grid business, is one of the largest makers of power transformers and HVDC systems, and had $19.8bn of revenue in fiscal 2025.',
      'Transformers are among the scarcest parts of the AI build-out, with lead times above three years. Hitachi Energy has committed billions of dollars to expand capacity. Hitachi also supports Nvidia’s 800-volt rack power design, and has a multi-billion-dollar generative-AI partnership with Microsoft.',
    ],
    contributions: [
      'Hitachi Energy: one of the largest transformer and HVDC suppliers.',
      'Multi-billion-dollar factory expansion to ease the transformer shortage.',
      'Grid-to-rack support for Nvidia’s 800 VDC architecture (Oct 2025).',
      'Three-year generative-AI partnership with Microsoft (Jun 2024).',
    ],
    keyProducts: ['Power transformers', 'HVDC systems', 'Lumada digital services', 'Rail systems'],
    role: 'Grid equipment that connects data centres to power.',
    sources: [
      { label: 'Hitachi investor relations', url: 'https://www.hitachi.com/IR/' },
      { label: 'Hitachi Energy news', url: 'https://www.hitachienergy.com/news-and-events' },
    ],
  },
  {
    id: 'panasonic', name: 'Panasonic', category: 'batteries-grid', hqCountry: 'Japan', hqCity: 'Kadoma, Osaka', tier: 'brief',
    founded: 1918, listed: true, ticker: '6752.T',
    revenueUsdBn: 55.5, revenueBasis: 'FY to Mar 2026 (approx.)', valueUsdBn: 47, valueBasis: 'Market cap, Nov 2026 (¥7.5tn)',
    oneLiner: 'Tesla’s longest-standing battery partner.',
    summary: [
      'Panasonic Energy has made cylindrical cells for Tesla since 2010, at Gigafactory Nevada and a new Kansas plant that began mass production in 2025. Its cells also go into data-centre backup power.',
    ],
    contributions: ['Tesla cell supplier since 2010; Kansas plant opened 2025.'],
    keyProducts: ['Cylindrical EV cells', 'Data-centre battery backup'],
    role: 'Battery cells for Tesla.',
    sources: [{ label: 'Panasonic Holdings investor relations', url: 'https://holdings.panasonic/global/corporate/investors.html' }],
  },
  {
    id: 'lg-energy', name: 'LG Energy Solution', category: 'batteries-grid', hqCountry: 'SouthKorea', hqCity: 'Seoul', tier: 'brief',
    founded: 2020, listed: true, ticker: '373220.KS',
    revenueUsdBn: 16.9, revenueBasis: 'FY2025, ₩23.7tn', valueUsdBn: 58.2, valueBasis: MCAP,
    oneLiner: 'Korean battery maker supplying Tesla’s Megapack storage.',
    summary: [
      'LG Energy Solution is the largest battery maker outside China. In July 2025 it signed a $4.3bn deal to supply Tesla with LFP storage cells from Michigan between 2027 and 2030.',
    ],
    contributions: ['$4.3bn LFP storage-cell deal with Tesla (Jul 2025).'],
    keyProducts: ['EV cells', 'LFP energy-storage cells'],
    role: 'Storage batteries made in the US.',
    sources: [{ label: 'LG Energy Solution corporate site', url: 'https://www.lgensol.com/en' }],
  },
  {
    id: 'eaton', name: 'Eaton', category: 'batteries-grid', hqCountry: 'Ireland', hqCity: 'Dublin', tier: 'brief',
    founded: 1911, listed: true, ticker: 'ETN',
    revenueUsdBn: 27.4, revenueBasis: 'FY2025', valueUsdBn: 140, valueBasis: MCAP,
    oneLiner: 'Power-management company designing 800-volt power for Nvidia racks.',
    summary: [
      'Eaton makes switchgear, UPS systems, busways and transformers, and data centres are its fastest-growing market. Since July 2025 it has worked with Nvidia on 800-volt DC power for one-megawatt AI racks.',
    ],
    contributions: ['800 VDC power architecture with Nvidia (Jul 2025).'],
    keyProducts: ['Switchgear', 'UPS', 'Busway', 'Transformers'],
    role: 'Electrical gear inside AI data centres.',
    sources: [{ label: 'Eaton news releases', url: 'https://www.eaton.com/us/en-us/company/news-insights/news-releases.html' }],
  },
];
