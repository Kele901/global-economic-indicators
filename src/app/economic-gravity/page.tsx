'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import InfoPanel from '../components/InfoPanel';
import { economicMetrics } from '../data/economicMetrics';
import dynamic from 'next/dynamic';
import type { HistoricalPoint } from '../components/EconomicGravityMap';

// Dynamically import the map component to avoid SSR issues
const EconomicGravityMap = dynamic(
  () => import('../components/EconomicGravityMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

// Historical economic centers of gravity (approximate coordinates and data)
// Sources: Maddison Project Database, Angus Maddison's "The World Economy: A Millennial Perspective",
// Cambridge Economic History series, Wikipedia economic history articles
const historicalData: HistoricalPoint[] = [
  { 
    year: -2000, 
    label: '2000 BCE', 
    center: 'Mesopotamia', 
    lat: 33.2232, 
    lon: 43.6793, 
    description: 'Mesopotamia and the Nile Valley formed the twin engines of the ancient economy. Sumerian and Akkadian city-states developed the world\'s first surplus-based economies, enabling specialization in crafts, administration, and long-distance trade across the Fertile Crescent.',
    details: {
      mainCities: 'Ur, Babylon, Nineveh, Memphis (Egypt), Mohenjo-daro (Indus)',
      keyTrade: 'Barley, wool textiles, copper, tin, lapis lazuli, timber from Lebanon',
      innovations: 'Cuneiform accounting tablets, sexagesimal number system, wheeled carts, bronze metallurgy, canal irrigation',
      economicSystem: 'Temple and palace-based redistribution economy with early credit instruments and silver-weight money'
    },
    population: '~27 million (Mesopotamia + Egypt)',
    estimatedGDP: '~$4.5B (1990 Int$, Maddison est.)',
    keyFigures: 'Ur-Nammu, Hammurabi',
    historicalContext: 'The Bronze Age economy connected Mesopotamia, Egypt, the Indus Valley, and Anatolia through extensive overland and maritime trade. The Code of Hammurabi (c. 1750 BCE) codified commercial regulations including interest rate caps, merchant liability, and contract law.'
  },
  { 
    year: -1000, 
    label: '1000 BCE', 
    center: 'Eastern Mediterranean', 
    lat: 35.5, 
    lon: 33.0, 
    description: 'Phoenician city-states pioneered Mediterranean maritime commerce, establishing trade colonies from Carthage to Iberia. Simultaneously, the Zhou Dynasty in China developed feudal land-grant economies, and the Israelite kingdoms controlled key overland trade routes.',
    details: {
      mainCities: 'Tyre, Sidon, Carthage, Jerusalem, Athens, Luoyang (Zhou China)',
      keyTrade: 'Tyrian purple dye, cedar wood, glass, olive oil, wine, tin from Cornwall, amber from the Baltic',
      innovations: 'Phoenician alphabet (basis of Greek/Latin script), iron smelting, bireme galleys, early coinage prototypes',
      economicSystem: 'Maritime city-state mercantilism with colony-based trade networks and temple banking'
    },
    population: '~50 million globally',
    estimatedGDP: '~$6.4B (1990 Int$)',
    keyFigures: 'Hiram I of Tyre, King Solomon, Duke of Zhou',
    historicalContext: 'The Late Bronze Age Collapse (c. 1200 BCE) destroyed Mycenaean and Hittite palace economies, creating a power vacuum that enabled Phoenician commercial dominance. Iron replaced bronze, democratizing access to metal tools and weapons.'
  },
  { 
    year: -500, 
    label: '500 BCE', 
    center: 'Persia / Multipolarity', 
    lat: 32.6546, 
    lon: 51.6680, 
    description: 'The Achaemenid Persian Empire unified the largest contiguous economic zone yet seen, from Egypt to the Indus. Greek city-states pioneered coinage and market economies. India\'s Mahajanapadas developed sophisticated urban trade centers along the Ganges plain.',
    details: {
      mainCities: 'Persepolis, Susa, Athens, Sparta, Varanasi, Pataliputra',
      keyTrade: 'Spices, precious metals, textiles, lapis lazuli, incense, grain tribute, Athenian silver',
      innovations: 'Lydian/Greek coinage, Royal Road postal system (Persepolis to Sardis, 2,700 km), Athenian Laurium silver mines, qanat irrigation',
      economicSystem: 'Imperial taxation with satrap provinces, Greek agora-based free markets, Indian guild (shreni) system'
    },
    population: '~100 million globally (Maddison)',
    estimatedGDP: '~$14.3B (1990 Int$)',
    keyFigures: 'Darius I, Croesus of Lydia, Pericles, Bimbisara of Magadha',
    historicalContext: 'Darius I introduced the gold daric and silver siglos as imperial currency, established standardized weights and measures, and built infrastructure connecting three continents. Athens funded its golden age through silver mining revenues and the Delian League tribute.'
  },
  { 
    year: -200, 
    label: '200 BCE', 
    center: 'Multipolarity', 
    lat: 35.0, 
    lon: 55.0, 
    description: 'Three great empires divided global economic output: the Maurya Empire in India, the Qin/Han Dynasty in China, and the Roman Republic in the Mediterranean. Each developed sophisticated fiscal systems, road networks, and standardized currencies spanning vast territories.',
    details: {
      mainCities: 'Pataliputra (Maurya capital, pop. ~300K), Rome, Chang\'an, Alexandria, Carthage',
      keyTrade: 'Indian spices and cotton, Chinese silk, Roman glassware, Egyptian grain, Nabataean incense',
      innovations: 'Mauryan state economics (Arthashastra), Qin standardization of currency/weights/script, Roman concrete, Archimedean machines',
      economicSystem: 'Mauryan centralized bureaucratic economy, Han state monopolies (salt/iron), Roman Republican tax farming (publicani)'
    },
    population: '~150-200 million globally',
    estimatedGDP: '~$20B (1990 Int$)',
    keyFigures: 'Chandragupta Maurya, Kautilya (Arthashastra author), Qin Shi Huang, Scipio Africanus',
    historicalContext: 'The Arthashastra, composed around this period, is one of the world\'s first treatises on statecraft and economic policy, covering taxation, trade regulation, price controls, and labor management. The Roman victory over Carthage (146 BCE) opened Western Mediterranean trade.'
  },
  { 
    year: 0, 
    label: '1 CE', 
    center: 'Rome / Han China', 
    lat: 41.9028, 
    lon: 12.4964, 
    description: 'The Roman Empire and Han Dynasty together controlled over 60% of global GDP. Rome\'s Mediterranean economy reached peak integration with standardized currency, banking, insurance, and a legal framework for commerce. The Silk Road connected both empires across 6,400 km.',
    details: {
      mainCities: 'Rome (pop. ~1 million), Alexandria, Antioch, Chang\'an (pop. ~500K), Luoyang',
      keyTrade: 'Roman wine and glassware east; Chinese silk and spices west; Indian pepper, Egyptian grain, Spanish silver',
      innovations: 'Roman road network (80,000 km), aqueducts, concrete, Han paper-making, seismograph, iron casting, horse collar',
      economicSystem: 'Roman monetary economy with denarius standard, banking (argentarii), maritime insurance; Han state salt-iron monopoly with private merchant class'
    },
    population: '~231 million globally (Maddison)',
    estimatedGDP: '~$26.5B (1990 Int$)',
    keyFigures: 'Augustus Caesar, Wang Mang, Pliny the Elder',
    historicalContext: 'Roman GDP per capita likely peaked around this period at ~$570 (1990 Int$), not surpassed in Europe until c. 1500. Pliny the Elder lamented Rome\'s trade deficit with India, estimating 50 million sesterces annually spent on Eastern luxury imports.'
  },
  { 
    year: 500, 
    label: '500 CE', 
    center: 'Constantinople', 
    lat: 41.0082, 
    lon: 28.9784, 
    description: 'After Rome\'s fall, the Byzantine Empire preserved advanced economic institutions from its capital Constantinople, the world\'s wealthiest city. The Gupta Empire in India and the Sassanid Persian Empire maintained prosperous economies while Western Europe fragmented into subsistence agriculture.',
    details: {
      mainCities: 'Constantinople (pop. ~500K), Ctesiphon (Sassanid), Kanchipuram (Gupta India), Nanjing (Southern Dynasties)',
      keyTrade: 'Byzantine silk, Sassanid metalwork, Indian cotton and spices, Chinese porcelain, African gold and ivory',
      innovations: 'Greek fire, Justinian\'s Corpus Juris Civilis (legal codex), Indian numeral system (including zero), Chinese printing (woodblock)',
      economicSystem: 'Byzantine state-controlled guilds and monopolies, Sassanid landlord-based taxation, Gupta decentralized merchant economy'
    },
    population: '~210 million globally',
    estimatedGDP: '~$22B (1990 Int$)',
    keyFigures: 'Justinian I, Khosrow I (Sassanid), Chandragupta II (Gupta)',
    historicalContext: 'The Byzantine gold solidus (nomisma) served as the international reserve currency for over 700 years, accepted from Scandinavia to Sri Lanka. Global GDP declined from its Roman/Han peak as Western European and Chinese economies contracted.'
  },
  { 
    year: 750, 
    label: '750 CE', 
    center: 'Baghdad / Tang China', 
    lat: 33.5, 
    lon: 44.5, 
    description: 'The Abbasid Caliphate and Tang Dynasty presided over a golden age of trade, science, and financial innovation. Baghdad\'s House of Wisdom translated Greek, Persian, and Indian texts, while Tang Chang\'an was the world\'s largest city. Islamic merchants connected Africa, Europe, and Southeast Asia.',
    details: {
      mainCities: 'Baghdad (pop. ~1M), Chang\'an (pop. ~1M), Cordoba, Damascus, Guangzhou, Samarkand',
      keyTrade: 'Paper, steel (Damascus/wootz), silk, tea, sugar, slaves, gold (trans-Saharan), frankincense',
      innovations: 'Islamic banking (sakk/cheque, hawala transfers, mudaraba partnerships), algebra (al-Khwarizmi), Tang paper currency precursors, compass',
      economicSystem: 'Abbasid market-oriented economy with sophisticated credit instruments; Tang equal-field land system, salt monopoly, Grand Canal trade'
    },
    population: '~250 million globally',
    estimatedGDP: '~$30B (1990 Int$)',
    keyFigures: 'Harun al-Rashid, Emperor Xuanzong, al-Khwarizmi',
    historicalContext: 'The Abbasid revolution (750 CE) shifted the Islamic capital from Damascus to Baghdad, positioning it at the nexus of Indian Ocean, Central Asian, and Mediterranean trade. Tang China\'s An Lushan Rebellion (755 CE) disrupted but could not destroy the dynasty\'s commercial vitality.'
  },
  { 
    year: 1000, 
    label: '1000 CE', 
    center: 'Song China / Islamic World', 
    lat: 30.2741, 
    lon: 120.1551, 
    description: 'Song Dynasty China experienced the world\'s first proto-industrial revolution, with iron production reaching 125,000 tons annually (not matched in Europe until 1700). The Islamic world maintained advanced financial systems, and the Fatimid Caliphate made Cairo a new commercial hub.',
    details: {
      mainCities: 'Kaifeng (pop. ~1M, world\'s largest), Cairo, Cordoba, Baghdad, Angkor (Khmer Empire)',
      keyTrade: 'Chinese porcelain, silk, tea; Islamic textiles, spices; African gold from Ghana Empire; Viking silver and fur trade',
      innovations: 'Paper money (jiaozi), movable type printing (Bi Sheng), gunpowder applications, magnetic compass for navigation, advanced water-powered mills',
      economicSystem: 'Song market economy with paper currency, government bonds, and insurance; Islamic waqf endowments and international hawala networks'
    },
    population: '~310 million globally (Maddison)',
    estimatedGDP: '~$52B (1990 Int$)',
    keyFigures: 'Emperor Zhenzong (Song), Mahmud of Ghazni, Mansa of Ghana Empire',
    historicalContext: 'Song China\'s GDP per capita (~$600 in 1990 Int$) was the world\'s highest. China alone accounted for roughly 22-25% of global GDP. The jiaozi, first issued in Sichuan c. 1024 CE, was the world\'s first government-issued paper currency, enabling an unprecedented expansion of commerce.'
  },
  { 
    year: 1200, 
    label: '1200 CE', 
    center: 'Mongol Eurasia', 
    lat: 47.9077, 
    lon: 106.9172, 
    description: 'The Mongol Empire created the largest contiguous land empire in history, unifying trade routes from Korea to Hungary under the Pax Mongolica. Merchant caravans traveled safely across Eurasia, dramatically reducing transaction costs. Simultaneously, Italian city-states dominated Mediterranean finance.',
    details: {
      mainCities: 'Karakorum, Beijing (Khanbaliq), Venice, Florence, Hangzhou (Southern Song, pop. ~1.5M), Timbuktu',
      keyTrade: 'Silk, porcelain, spices, horses, precious metals, slaves; Italian banking services; Malian gold',
      innovations: 'Mongol yam postal relay system, unified passport (paiza), Fibonacci\'s Liber Abaci (1202, brought Hindu-Arabic numerals to Europe), Hanseatic League formation',
      economicSystem: 'Mongol ortaq merchant partnerships with state capital, Italian commenda contracts, Song/Yuan paper money system'
    },
    population: '~390 million globally',
    estimatedGDP: '~$68B (1990 Int$)',
    keyFigures: 'Genghis Khan, Marco Polo, Fibonacci, Mansa Musa (Mali)',
    historicalContext: 'The Pax Mongolica (c. 1250-1350) enabled the greatest overland trade volumes in pre-modern history. However, the same trade networks facilitated the spread of the Black Death (1346-1353), which killed 30-60% of Europe\'s population and reshaped labor markets permanently.'
  },
  { 
    year: 1500, 
    label: '1500 CE', 
    center: 'Venice / Ottoman / Ming', 
    lat: 45.4408, 
    lon: 12.3155, 
    description: 'Three great economic zones competed: Ming China (the world\'s largest economy), the Ottoman Empire (controlling East-West trade chokepoints), and Renaissance Italian city-states (pioneering modern banking). Portugal and Spain were beginning their voyages of exploration, about to reshape global trade.',
    details: {
      mainCities: 'Venice, Florence, Istanbul (pop. ~400K), Beijing (pop. ~672K), Tenochtitlan (pop. ~200K), Lisbon',
      keyTrade: 'Spices (pepper worth more than gold by weight), silk, Venetian glass, Ottoman ceramics, Ming porcelain, Aztec cacao',
      innovations: 'Double-entry bookkeeping (Pacioli, 1494), printing press (Gutenberg, 1440s), maritime navigation (astrolabe, caravel), Ming treasure fleets',
      economicSystem: 'Venetian/Florentine banking houses (Medici), Ottoman timar feudal land grants, Ming silver-based tax system, early Portuguese maritime empire'
    },
    population: '~438 million globally (Maddison)',
    estimatedGDP: '~$83B (1990 Int$)',
    keyFigures: 'Lorenzo de\' Medici, Sultan Mehmed II, Zheng He, Luca Pacioli',
    historicalContext: 'China and India together still accounted for ~50% of world GDP. Columbus\'s 1492 voyage and Vasco da Gama\'s 1498 route to India marked the beginning of the Columbian Exchange, which would transfer crops, diseases, animals, and silver between hemispheres, fundamentally transforming every economy on Earth.'
  },
  { 
    year: 1700, 
    label: '1700 CE', 
    center: 'Western Europe', 
    lat: 51.0, 
    lon: 2.0, 
    description: 'The Dutch Golden Age and early British mercantilism made Northwestern Europe the world\'s most dynamic economy. The Amsterdam Stock Exchange, Bank of England, and Lloyd\'s of London created modern financial infrastructure. Mughal India remained the world\'s largest manufacturing economy.',
    details: {
      mainCities: 'Amsterdam (financial capital), London, Paris, Delhi (Mughal, pop. ~600K), Edo/Tokyo (pop. ~1M), Isfahan',
      keyTrade: 'Atlantic slave trade, sugar, tobacco, spices, Indian cotton textiles (50% of world textile production), Chinese tea, New World silver',
      innovations: 'Central banking (Bank of England, 1694), stock exchanges, marine insurance, Newcomen steam engine (1712), scientific revolution instruments',
      economicSystem: 'Dutch/British mercantilism and joint-stock companies (VOC, EIC), Mughal mansabdari revenue system, Qing tribute trade, Atlantic triangular trade'
    },
    population: '~603 million globally (Maddison)',
    estimatedGDP: '~$131B (1990 Int$)',
    keyFigures: 'William III of England, Aurangzeb (Mughal), Kangxi Emperor (Qing), Isaac Newton (Master of the Mint)',
    historicalContext: 'India and China still produced ~47% of global GDP in 1700, but the Great Divergence was beginning. European institutions\u2014property rights, capital markets, scientific societies\u2014were creating compound advantages that would accelerate with industrialization.'
  },
  { 
    year: 1800, 
    label: '1800 CE', 
    center: 'Britain', 
    lat: 51.5074, 
    lon: -0.1278, 
    description: 'The Industrial Revolution was transforming Britain into the world\'s first industrial economy. Steam power, factory production, and canal networks multiplied output. Britain\'s GDP per capita surged ahead of all rivals, while colonial extraction began draining wealth from India and Africa.',
    details: {
      mainCities: 'London (pop. ~1M, world\'s largest), Manchester, Birmingham, Paris, Canton (Guangzhou), Calcutta',
      keyTrade: 'Cotton textiles (British manufactured), coal, iron, opium (to China), Indian indigo and raw cotton, Caribbean sugar, American tobacco',
      innovations: 'Watt steam engine, factory system, canal network, cotton gin (1793), Jacquard loom, smallpox vaccine (Jenner)',
      economicSystem: 'British industrial capitalism with free trade ideology, French dirigisme, Qing declining tributary system, American agrarian republic'
    },
    population: '~978 million globally (Maddison)',
    estimatedGDP: '~$188B (1990 Int$)',
    keyFigures: 'Adam Smith (Wealth of Nations, 1776), James Watt, Napoleon Bonaparte, Alexander Hamilton',
    historicalContext: 'In 1800 China and India still accounted for ~49% of world GDP (Maddison), but their share was declining rapidly. Britain\'s per capita income (~$1,707 in 1990 Int$) was already double China\'s (~$600). The Great Divergence between Europe and Asia was now unmistakable.'
  },
  { 
    year: 1900, 
    label: '1900 CE', 
    center: 'Atlantic', 
    lat: 40.7128, 
    lon: -74.0060, 
    description: 'The United States overtook Britain as the world\'s largest economy by 1890. European colonial empires reached peak territorial extent, extracting resources from Africa, Asia, and Latin America. The gold standard linked major economies in a fixed exchange rate system unprecedented in scope.',
    details: {
      mainCities: 'New York, London, Berlin, Paris, Chicago, Tokyo, Calcutta, Buenos Aires',
      keyTrade: 'Steel, oil, rubber, grain, machinery, financial services, colonial raw materials (diamonds, rubber, palm oil)',
      innovations: 'Electricity grid, internal combustion engine, telephone, radio, assembly line precursors, refrigeration, Bessemer steel process',
      economicSystem: 'Gold standard, corporate capitalism (trusts and cartels), European colonial extraction economies, Japanese Meiji industrial modernization'
    },
    population: '~1.56 billion globally (Maddison)',
    estimatedGDP: '~$725B (1990 Int$)',
    keyFigures: 'J.P. Morgan, Andrew Carnegie, Cecil Rhodes, Emperor Meiji',
    historicalContext: 'Europe and its offshoots (US, Canada, Australia) now controlled ~60% of global GDP, up from ~23% in 1700. India\'s share had fallen from ~24% to ~2% under colonial extraction. The first era of globalization (1870-1914) saw trade/GDP ratios, capital flows, and migration at levels not reached again until the 1990s.'
  },
  { 
    year: 1950, 
    label: '1950 CE', 
    center: 'United States', 
    lat: 38.9072, 
    lon: -77.0369, 
    description: 'Post-WWII America possessed nearly 50% of global industrial output. The Bretton Woods system (1944) established the US dollar as the world\'s reserve currency, backed by gold. The Marshall Plan rebuilt Europe, and decolonization began reshaping the Global South.',
    details: {
      mainCities: 'New York, Washington D.C., Detroit, London, Moscow, Tokyo (rebuilding)',
      keyTrade: 'American manufactured goods, oil (Middle East), Marshall Plan capital, grain surpluses, military equipment',
      innovations: 'Nuclear energy, jet aviation, early computers (ENIAC), Green Revolution agriculture, petrochemical industry, transistor (1947)',
      economicSystem: 'Bretton Woods fixed exchange rates, Keynesian demand management, Soviet central planning, European welfare states emerging'
    },
    population: '~2.54 billion globally (Maddison)',
    estimatedGDP: '~$2.2T (1990 Int$)',
    keyFigures: 'Harry Truman, John Maynard Keynes, Jean Monnet, Joseph Stalin',
    historicalContext: 'US GDP per capita (~$9,561 in 1990 Int$) was more than double any European country. The Cold War divided the world into competing economic blocs. The GATT (1947) began a multilateral process of tariff reduction that would underpin decades of trade-led growth.'
  },
  { 
    year: 2000, 
    label: '2000 CE', 
    center: 'North Atlantic', 
    lat: 42.3601, 
    lon: -71.0589, 
    description: 'The US-led "Washington Consensus" promoted free markets and globalization. The dot-com boom signaled technology\'s growing economic role. China\'s accession to the WTO (2001) marked the beginning of its integration into global supply chains, while the EU introduced the euro.',
    details: {
      mainCities: 'New York, London, Tokyo, Frankfurt, Shanghai (emerging), Silicon Valley',
      keyTrade: 'Financial services, software, semiconductors, pharmaceuticals, oil, Chinese manufactured exports beginning',
      innovations: 'World Wide Web (commercialized 1990s), mobile telecommunications, GPS, fiber optics, genome sequencing',
      economicSystem: 'Neoliberal globalization, EU single market with euro, Chinese "socialist market economy", WTO multilateral trade framework'
    },
    population: '~6.1 billion globally',
    estimatedGDP: '~$36.5T (1990 Int$, Maddison)',
    keyFigures: 'Alan Greenspan, Jiang Zemin, Tony Blair, Bill Gates',
    historicalContext: 'The US alone produced ~22% of global GDP. But the seeds of the Great Convergence were planted: China\'s share was rising from 3% in 1978 to 7% in 2000 (market rates), while India began liberalizing after its 1991 crisis. Financial deregulation set the stage for the 2008 Global Financial Crisis.'
  },
  { 
    year: 2023, 
    label: '2023 CE', 
    center: 'East/Southeast Asia', 
    lat: 34.3416, 
    lon: 108.9398, 
    description: 'The global economic center of gravity has shifted decisively eastward for the first time since 1800. China is now the world\'s largest economy in PPP terms. Asia-Pacific accounts for ~43% of global GDP, surpassing any single region. Digital economies and green energy are reshaping comparative advantage.',
    details: {
      mainCities: 'Shanghai, Beijing, Tokyo, New York, London, Mumbai, Singapore, Seoul, Jakarta',
      keyTrade: 'Semiconductors, EVs, LNG, rare earth minerals, cloud services, AI chips, pharmaceutical APIs, lithium-ion batteries',
      innovations: 'Generative AI (ChatGPT 2022), mRNA vaccines, quantum computing advances, renewable energy grid-scale storage, 5G networks, blockchain/DeFi',
      economicSystem: 'Mixed models: US innovation-driven capitalism, Chinese state capitalism, EU regulatory state, ASEAN export-oriented growth, emerging BRICS+ multilateralism'
    },
    population: '~8 billion globally',
    estimatedGDP: '~$105T (nominal), ~$175T (PPP)',
    keyFigures: 'Xi Jinping, Jerome Powell, Christine Lagarde, Jensen Huang',
    historicalContext: 'For the first time since the Industrial Revolution, a non-Western nation (China, $18T nominal) rivals the US ($25T) as an economic superpower. India ($3.7T) has overtaken the UK as the 5th largest economy. The Great Convergence is unwinding 200 years of Western economic dominance.'
  }
];

// GDP share data based on Maddison Project Database and Angus Maddison estimates (PPP, approximate %)
const gdpShareData = [
  { year: -2000, label: '2000 BCE', Asia: 68, Europe: 8, Americas: 7, Africa: 16, Oceania: 1 },
  { year: -1000, label: '1000 BCE', Asia: 66, Europe: 12, Americas: 6, Africa: 15, Oceania: 1 },
  { year: -500, label: '500 BCE', Asia: 67, Europe: 15, Americas: 5, Africa: 12, Oceania: 1 },
  { year: -200, label: '200 BCE', Asia: 70, Europe: 13, Americas: 5, Africa: 11, Oceania: 1 },
  { year: 0, label: '1 CE', Asia: 76, Europe: 10, Americas: 5, Africa: 8, Oceania: 1 },
  { year: 500, label: '500 CE', Asia: 70, Europe: 10, Americas: 7, Africa: 12, Oceania: 1 },
  { year: 750, label: '750 CE', Asia: 69, Europe: 9, Americas: 7, Africa: 14, Oceania: 1 },
  { year: 1000, label: '1000 CE', Asia: 68, Europe: 9, Americas: 8, Africa: 14, Oceania: 1 },
  { year: 1200, label: '1200 CE', Asia: 65, Europe: 12, Americas: 8, Africa: 14, Oceania: 1 },
  { year: 1500, label: '1500 CE', Asia: 62, Europe: 18, Americas: 7, Africa: 12, Oceania: 1 },
  { year: 1700, label: '1700 CE', Asia: 57, Europe: 23, Americas: 2, Africa: 7, Oceania: 1 },
  { year: 1800, label: '1800 CE', Asia: 49, Europe: 28, Americas: 3, Africa: 5, Oceania: 0.5 },
  { year: 1900, label: '1900 CE', Asia: 22, Europe: 36, Americas: 30, Africa: 3, Oceania: 1.5 },
  { year: 1950, label: '1950 CE', Asia: 16, Europe: 26, Americas: 39, Africa: 4, Oceania: 1.5 },
  { year: 2000, label: '2000 CE', Asia: 37, Europe: 21, Americas: 28, Africa: 3, Oceania: 1.5 },
  { year: 2023, label: '2023 CE', Asia: 43, Europe: 15, Americas: 27, Africa: 5, Oceania: 1.5 },
];

type ChartType = 'line' | 'stacked_area' | 'stacked_bar' | 'area_line' | 'bump';

const REGIONS = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania'] as const;
const REGION_COLORS: Record<string, string> = {
  Asia: '#f97316', Europe: '#3b82f6', Americas: '#22c55e', Africa: '#eab308', Oceania: '#8b5cf6'
};

const EconomicGravityPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [selectedPoint, setSelectedPoint] = useState<HistoricalPoint | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<ChartType>('line');

  const bumpData = useMemo(() => {
    return gdpShareData.map(row => {
      const ranked = REGIONS
        .map(r => ({ region: r, value: row[r] }))
        .sort((a, b) => b.value - a.value);
      const result: Record<string, unknown> = { label: row.label };
      ranked.forEach((item, idx) => { result[item.region] = idx + 1; });
      return result;
    });
  }, []);

  // Dispatch theme change event when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  // Define unified theme colors
  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    cardHoverBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
    selectedCardBg: isDarkMode ? 'from-blue-900 to-indigo-900' : 'from-blue-50 to-indigo-50',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    shadow: isDarkMode ? 'shadow-blue-900/20' : 'shadow-blue-100',
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${themeColors.text} ${themeColors.background} min-h-screen`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Economic Center of Gravity Through History</h1>
          <p className={`${themeColors.textSecondary} max-w-xl`}>
            Tracking the shift of global economic power from ancient civilizations to modern times. Explore how economic dominance has moved across continents and empires throughout human history.
          </p>
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

      {/* Static intro content - always visible for SEO */}
      <div className={`rounded-lg p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">The Economic Center of Gravity</h2>
        <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          The economic center of gravity is a geographic point representing the weighted average
          location of global economic activity. Over the past two millennia, this point has shifted
          dramatically &mdash; from ancient civilizations in Mesopotamia and China, through European
          colonial dominance, to the Atlantic-centered post-war economy, and now eastward as Asia
          reasserts its economic weight. This visualization tracks that journey using GDP shares,
          population data, and trade volumes to show how global economic power has migrated across
          continents and empires.
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Data drawn from the Maddison Project, World Bank, and historical economic research.
          Select different eras to see the world through the lens of economic geography.
        </p>
      </div>

      {/* World Map Visualization - NEW RESPONSIVE MAP */}
      <div className={`mb-12 p-4 sm:p-6 rounded-2xl relative ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className={`text-xl sm:text-2xl font-bold flex items-center ${themeColors.text}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
            Global Economic Center of Gravity
          </h2>
          {/* Info Panel for Economic Center of Gravity */}
          <InfoPanel
            metric={economicMetrics.economicCenterOfGravity}
            isDarkMode={isDarkMode}
            position="top-right"
            size="small"
          />
        </div>
        
        {/* Responsive Interactive Map */}
        <EconomicGravityMap
          historicalData={historicalData}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          isDarkMode={isDarkMode}
        />
        
        <div className={`mt-4 text-sm ${themeColors.textSecondary} italic`}>
          Click on any numbered marker to see details. Use the buttons or pinch/scroll to zoom. The trail shows the movement of economic power over time.
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-12 relative ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow} backdrop-blur-sm`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Timeline
        </h2>
        
        <p className={`text-sm mb-4 ${themeColors.textSecondary} max-w-2xl`}>
          Track the shifting balance of global economic power across continents and time periods. 
          The chart shows the relative share of global GDP by region, revealing how economic 
          dominance has moved from ancient civilizations to modern economic powerhouses.
        </p>

        {/* Chart type tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { key: 'line' as ChartType, label: 'Line' },
            { key: 'stacked_area' as ChartType, label: 'Stacked Area' },
            { key: 'stacked_bar' as ChartType, label: 'Stacked Bar' },
            { key: 'area_line' as ChartType, label: 'Area + Line' },
            { key: 'bump' as ChartType, label: 'Ranking' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeChart === tab.key
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-500 text-white shadow-md'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="h-[300px] sm:h-[400px] md:h-[500px] relative">
          {/* Info Panel for GDP Share by Region */}
          <div className="absolute top-0 right-0 z-10">
            <InfoPanel
              metric={economicMetrics.gdpShareByRegion}
              isDarkMode={isDarkMode}
              position="top-right"
              size="small"
            />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              const sharedXAxis = (
                <XAxis 
                  dataKey="label" 
                  stroke={themeColors.textSecondary}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 500 }}
                  axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
                  tickLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', strokeWidth: 1 }}
                  interval={0}
                />
              );
              const sharedGrid = (
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth={0.5} vertical={false} />
              );
              const sharedTooltipStyle = {
                contentStyle: {
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  color: isDarkMode ? '#e5e7eb' : '#374151',
                  fontSize: '12px',
                  padding: '12px 16px'
                },
                labelStyle: { fontWeight: 600, marginBottom: '8px', color: isDarkMode ? '#60a5fa' : '#3b82f6' }
              };
              const sharedLegend = (
                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 500 }} iconType="circle" iconSize={8} />
              );
              const sharedYAxis = (
                <YAxis 
                  stroke={themeColors.textSecondary}
                  tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 500 }}
                  axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
                  tickLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', strokeWidth: 1 }}
                  width={35}
                  label={{ value: 'GDP Share (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 600 }, offset: 10 }}
                />
              );
              const gradientDefs = (
                <defs>
                  {REGIONS.map(r => (
                    <linearGradient key={r} id={`${r.toLowerCase()}Gradient`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={REGION_COLORS[r]} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={REGION_COLORS[r]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
              );
              const dotStyle = (color: string) => ({ r: 3, fill: color, stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 });
              const activeDotStyle = (color: string) => ({ r: 6, fill: color, stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 });

              if (activeChart === 'stacked_area') {
                return (
                  <AreaChart data={gdpShareData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    {gradientDefs}
                    {sharedGrid}
                    {sharedXAxis}
                    {sharedYAxis}
                    <Tooltip {...sharedTooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                    {sharedLegend}
                    {REGIONS.map(r => (
                      <Area key={r} type="monotone" dataKey={r} stackId="1" stroke={REGION_COLORS[r]} fill={`url(#${r.toLowerCase()}Gradient)`} strokeWidth={1.5} />
                    ))}
                  </AreaChart>
                );
              }

              if (activeChart === 'stacked_bar') {
                return (
                  <BarChart data={gdpShareData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    {sharedGrid}
                    {sharedXAxis}
                    {sharedYAxis}
                    <Tooltip {...sharedTooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                    {sharedLegend}
                    {REGIONS.map(r => (
                      <Bar key={r} dataKey={r} stackId="1" fill={REGION_COLORS[r]} radius={r === 'Oceania' ? [2, 2, 0, 0] : undefined} />
                    ))}
                  </BarChart>
                );
              }

              if (activeChart === 'area_line') {
                return (
                  <AreaChart data={gdpShareData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    {gradientDefs}
                    {sharedGrid}
                    {sharedXAxis}
                    {sharedYAxis}
                    <Tooltip {...sharedTooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                    {sharedLegend}
                    <Area type="monotone" dataKey="Asia" stroke="#f97316" fill="url(#asiaGradient)" strokeWidth={2} fillOpacity={0.3} dot={dotStyle('#f97316')} activeDot={activeDotStyle('#f97316')} />
                    <Area type="monotone" dataKey="Europe" stroke="#3b82f6" fill="url(#europeGradient)" strokeWidth={2} fillOpacity={0.3} dot={dotStyle('#3b82f6')} activeDot={activeDotStyle('#3b82f6')} />
                    <Line type="monotone" dataKey="Americas" stroke="#22c55e" strokeWidth={2} dot={dotStyle('#22c55e')} activeDot={activeDotStyle('#22c55e')} />
                    <Line type="monotone" dataKey="Africa" stroke="#eab308" strokeWidth={2} dot={dotStyle('#eab308')} activeDot={activeDotStyle('#eab308')} />
                    <Line type="monotone" dataKey="Oceania" stroke="#8b5cf6" strokeWidth={2} dot={dotStyle('#8b5cf6')} activeDot={activeDotStyle('#8b5cf6')} />
                  </AreaChart>
                );
              }

              if (activeChart === 'bump') {
                return (
                  <LineChart data={bumpData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    {sharedGrid}
                    {sharedXAxis}
                    <YAxis
                      stroke={themeColors.textSecondary}
                      tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontWeight: 500 }}
                      axisLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
                      tickLine={{ stroke: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', strokeWidth: 1 }}
                      width={35}
                      reversed
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(v: number) => ['1st', '2nd', '3rd', '4th', '5th'][v - 1] || ''}
                      label={{ value: 'Rank', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11, fontWeight: 600 }, offset: 10 }}
                    />
                    <Tooltip
                      {...sharedTooltipStyle}
                      formatter={(value: number, name: string) => {
                        const suffix = ['st', 'nd', 'rd'][value - 1] || 'th';
                        return [`${value}${suffix}`, name];
                      }}
                    />
                    {sharedLegend}
                    {REGIONS.map(r => (
                      <Line
                        key={r}
                        type="monotone"
                        dataKey={r}
                        stroke={REGION_COLORS[r]}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: REGION_COLORS[r], stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: REGION_COLORS[r], stroke: isDarkMode ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </LineChart>
                );
              }

              // Default: line chart
              return (
                <LineChart data={gdpShareData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                  {gradientDefs}
                  {sharedGrid}
                  {sharedXAxis}
                  {sharedYAxis}
                  <Tooltip {...sharedTooltipStyle} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                  {sharedLegend}
                  {REGIONS.map(r => (
                    <Line
                      key={r}
                      type="monotone"
                      dataKey={r}
                      stroke={REGION_COLORS[r]}
                      strokeWidth={2}
                      dot={dotStyle(REGION_COLORS[r])}
                      activeDot={activeDotStyle(REGION_COLORS[r])}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </LineChart>
              );
            })()}
          </ResponsiveContainer>
        </div>
        
        {/* Timeline insights and analysis */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Ancient Dominance</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Asia held 68-76% of global GDP from 2000 BCE to 1 CE. Mesopotamian, Indian, and Chinese civilizations drove output through irrigated agriculture, bronze/iron metallurgy, and Silk Road trade.
            </p>
            <div className="mt-2 text-xs text-orange-500 font-medium">
              Asia peak: ~76% of global GDP (1 CE)
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Classical Convergence</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Rome, Maurya India, and Han China each built vast integrated economies (500 BCE - 500 CE). Combined, they accounted for over 80% of world GDP at their peak, connected by the Silk Road.
            </p>
            <div className="mt-2 text-xs text-red-500 font-medium">
              Roman + Han: ~60% of global GDP
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Medieval Commerce</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Song China achieved proto-industrialization while Islamic merchants created sophisticated banking. Venice and the Hanseatic League built Europe&apos;s first financial infrastructure (500-1500 CE).
            </p>
            <div className="mt-2 text-xs text-purple-500 font-medium">
              Song China alone: ~25% of global GDP
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Great Divergence</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Europe&apos;s share surged from 18% to 36% (1500-1900) via industrialization, colonial extraction, and financial innovation. Asia&apos;s share collapsed from 62% to 22% over the same period.
            </p>
            <div className="mt-2 text-xs text-blue-500 font-medium">
              Europe peak: ~36% of global GDP (1900)
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${themeColors.border} hover:shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <h4 className={`font-semibold text-sm ${themeColors.text}`}>Great Convergence</h4>
            </div>
            <p className={`text-xs ${themeColors.textSecondary}`}>
              Since 1950, Asia has rebounded from 16% to 43% of global GDP. China&apos;s post-1978 reforms and India&apos;s liberalization are reversing 200 years of Western dominance in a historic re-convergence.
            </p>
            <div className="mt-2 text-xs text-green-500 font-medium">
              Asia 2023: ~43% and rising
            </div>
          </div>
        </div>
        
        {/* Enhanced chart statistics */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <h4 className={`font-semibold text-sm mb-3 ${themeColors.text} flex items-center`}>
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Key Economic Shifts
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-xs">
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2000 BCE</div>
              <div className={themeColors.textSecondary}>Asia: 68%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Mesopotamia leads</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1 CE</div>
              <div className={themeColors.textSecondary}>Asia: 76%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Rome + Han peak</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1000 CE</div>
              <div className={themeColors.textSecondary}>Asia: 68%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Song Dynasty peak</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1500 CE</div>
              <div className={themeColors.textSecondary}>Europe: 18%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Pre-divergence</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1800 CE</div>
              <div className={themeColors.textSecondary}>Europe: 28%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Industrialization</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1900 CE</div>
              <div className={themeColors.textSecondary}>Americas: 30%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>US overtakes UK</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>1950 CE</div>
              <div className={themeColors.textSecondary}>Americas: 39%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Post-WWII peak</div>
            </div>
            <div className="text-center">
              <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2023 CE</div>
              <div className={themeColors.textSecondary}>Asia: 43%</div>
              <div className={`text-[10px] ${themeColors.textTertiary}`}>Great Convergence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Points - Compact Grid */}
      <div className={`mb-12 p-4 sm:p-6 rounded-2xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-6 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Economic Centers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historicalData.map((point, index) => (
            <button
              key={point.year}
              className={`p-4 rounded-xl text-left transition-all duration-300 transform hover:-translate-y-1 border ${themeColors.border} ${
                selectedPoint?.year === point.year
                  ? `bg-gradient-to-br ${themeColors.selectedCardBg} shadow-lg ring-2 ring-blue-500`
                  : `${themeColors.cardBg} hover:shadow-md`
              }`}
              onClick={() => setSelectedPoint(selectedPoint?.year === point.year ? null : point)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  selectedPoint?.year === point.year 
                    ? 'bg-amber-500 text-white' 
                    : isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <h3 className={`text-sm font-bold ${themeColors.text}`}>{point.center}</h3>
                  <p className={`text-xs ${themeColors.textTertiary}`}>{point.label}</p>
                </div>
              </div>
              <p className={`text-xs ${themeColors.textSecondary} line-clamp-2 mb-2`}>
                {point.description}
              </p>
              {(point.population || point.estimatedGDP) && (
                <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[10px] ${themeColors.textTertiary}`}>
                  {point.population && <span>Pop: {point.population}</span>}
                  {point.estimatedGDP && <span>GDP: {point.estimatedGDP}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className={`p-4 sm:p-8 rounded-2xl mb-12 ${themeColors.cardBg} border ${themeColors.border} shadow-lg ${themeColors.shadow}`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Historical Analysis
        </h2>
        <div className="space-y-6 sm:space-y-8">
          {[
            {
              title: 'Ancient Period (3000 BCE - 500 BCE)',
              content: 'The earliest economies emerged in river valleys where irrigation-based agriculture generated the food surpluses necessary for specialization, urbanization, and trade. Mesopotamian temple complexes functioned as the world\'s first banks, accepting deposits of grain and silver, issuing loans at 20-33% annual interest, and maintaining detailed ledgers in cuneiform. Egypt\'s command economy mobilized enormous labor forces for monumental construction, while the Indus Valley civilization (Harappa, Mohenjo-daro) developed standardized weights and measures for commerce across a territory of 1.25 million km\u00B2. The Late Bronze Age Collapse (c. 1200 BCE) destroyed palace economies from Mycenae to Ugarit, but the ensuing power vacuum enabled Phoenician maritime trade to flourish. By 600 BCE, the Lydians had invented electrum coinage, transforming commerce by creating portable, standardized stores of value.',
              events: [
                'c. 3200 BCE: Cuneiform writing develops in Sumer for accounting and trade records',
                'c. 3100 BCE: Egyptian unification creates the first large-scale command economy',
                'c. 2600 BCE: Indus Valley civilization establishes standardized weights for trade across 1,000+ settlements',
                'c. 2500 BCE: Great Pyramid of Giza construction\u2014evidence of sophisticated labor organization and resource logistics',
                'c. 1750 BCE: Code of Hammurabi codifies commercial law (interest rates, merchant liability, wages)',
                'c. 1600 BCE: Hittite iron-smelting techniques begin spreading, disrupting bronze trade monopolies',
                'c. 1200 BCE: Late Bronze Age Collapse destroys Mycenaean and Hittite palace economies',
                'c. 1000 BCE: Phoenician trade networks span the entire Mediterranean, founding Carthage (814 BCE)',
                'c. 600 BCE: Lydian electrum coins (Croesus) create the first standardized coinage system',
                'c. 500 BCE: Darius I issues gold daric and silver siglos, builds Royal Road (2,700 km)'
              ],
              sources: 'Maddison (2007), Cambridge Ancient History Vol. III, Van De Mieroop "The Ancient Mesopotamian City" (1999)'
            },
            {
              title: 'Classical Period (500 BCE - 500 CE)',
              content: 'The classical era witnessed the first truly transcontinental economies. Athens funded its golden age through the Laurium silver mines, producing an estimated 20 tonnes of silver annually. Alexander\'s conquests (334-323 BCE) spread Greek commercial practices and coinage standards across three continents. The Maurya Empire under Chandragupta and Ashoka unified the Indian subcontinent, with Kautilya\'s Arthashastra providing one of history\'s first treatises on economic statecraft\u2014covering taxation, trade regulation, and state monopolies. The Roman Empire at its peak (1st-2nd century CE) achieved a level of economic integration not seen again in Europe until the 19th century: 80,000 km of paved roads, a unified currency (denarius), sophisticated banking (argentarii), maritime insurance, and GDP per capita of ~$570 (1990 Int$). The Silk Road connected Roman glass and gold with Han Chinese silk and spices across 6,400 km.',
              events: [
                '500 BCE: Athens emerges as Mediterranean trading power funded by Laurium silver mines (~20 tonnes/year)',
                '321 BCE: Chandragupta Maurya unifies India; Arthashastra outlines state economic policy',
                '330 BCE: Alexander\'s conquests create Hellenistic economic zone from Egypt to Afghanistan',
                '221 BCE: Qin Shi Huang standardizes Chinese currency, weights, measures, and axle widths',
                '146 BCE: Roman destruction of Carthage and Corinth\u2014Rome dominates Mediterranean trade',
                '27 BCE: Augustus establishes the Principate and stabilizes Roman currency (aureus/denarius)',
                'c. 100 CE: Roman-Indian maritime trade peaks; Pliny estimates 50M sesterces annual deficit',
                'c. 105 CE: Cai Lun perfects paper-making in Han China, reducing administrative costs',
                '212 CE: Caracalla extends citizenship empire-wide, expanding the Roman tax base',
                '301 CE: Diocletian\'s Edict of Maximum Prices\u2014first large-scale price control attempt (fails)'
              ],
              sources: 'Maddison (2007), Scheidel "The Cambridge Companion to the Roman Economy" (2012), Thapar "Early India" (2002)'
            },
            {
              title: 'Early Medieval Period (500 - 1000 CE)',
              content: 'The fall of Rome fragmented Western Europe into subsistence economies, but three great civilizations maintained advanced commerce. The Byzantine Empire preserved Roman commercial law and its gold solidus served as the international reserve currency for over 700 years, accepted from Scandinavia to Sri Lanka. The Abbasid Caliphate (est. 750 CE) transformed Baghdad into the world\'s largest city and greatest commercial hub, where Muslim merchants developed the cheque (sakk), letter of credit (hawala), and partnership contract (mudaraba)\u2014financial instruments that would later influence Italian banking. Tang Dynasty China (618-907 CE) operated the Grand Canal, the world\'s longest artificial waterway, enabling grain transport that sustained a population of ~50 million. Viking Age Scandinavians connected Baltic silver with Islamic silver dirhams along Volga trade routes, while Charlemagne\'s Carolingian reforms standardized weights and established market regulations across Western Europe.',
              events: [
                '527-565 CE: Justinian\'s Corpus Juris Civilis codifies Roman commercial law for posterity',
                'c. 600 CE: Byzantine gold solidus (nomisma) functions as international reserve currency',
                '618 CE: Tang Dynasty founded; Grand Canal extended, enabling massive internal trade',
                '661-750 CE: Umayyad Caliphate creates unified economic zone from Spain to Central Asia',
                '750 CE: Abbasid Revolution; Baghdad founded as new capital at nexus of trade routes',
                'c. 800 CE: Islamic merchants develop sakk (cheque), hawala (remittance), and mudaraba (venture partnership)',
                '793 CE: Viking Age begins; Norse trade networks connect Baltic, Atlantic, and Caspian economies',
                'c. 800 CE: Charlemagne standardizes the livre (pound) weight system across Carolingian Empire',
                'c. 960 CE: Song Dynasty founded in China; begins the world\'s first proto-industrial revolution'
              ],
              sources: 'Wickham "Framing the Early Middle Ages" (2005), Goitein "A Mediterranean Society" (1967), Hansen "The Silk Road" (2012)'
            },
            {
              title: 'High Medieval & Pre-Modern (1000 - 1500 CE)',
              content: 'Song Dynasty China experienced an economic revolution: iron output reached 125,000 tonnes annually (not matched in Europe until 1700), paper money (jiaozi) circulated widely, and urbanization reached 20%\u2014the highest in the pre-modern world. The Mongol Empire (1206-1368) unified Eurasian trade under the Pax Mongolica, enabling caravans to travel safely from Korea to Hungary and reducing transaction costs dramatically. In Europe, Italian city-states pioneered modern finance: Florentine banking houses like the Medici managed papal finances across borders, Venice\'s Rialto became the first true commodity exchange, and Fibonacci\'s Liber Abaci (1202) introduced Hindu-Arabic numerals to European commerce. The Hanseatic League dominated Northern European trade with ~200 member cities. In West Africa, the Mali Empire\'s gold production (2/3 of the Old World\'s supply) made Mansa Musa possibly the wealthiest individual in history. The Black Death (1346-1353) killed 30-60% of Europe\'s population, permanently raising real wages for surviving laborers.',
              events: [
                'c. 1024 CE: Song China issues jiaozi\u2014world\'s first government-backed paper currency',
                'c. 1088 CE: Bi Sheng invents movable type printing in Song China',
                '1100s CE: Champagne Fairs become the hub of European long-distance trade',
                '1202 CE: Fibonacci publishes Liber Abaci, bringing Hindu-Arabic numerals to European commerce',
                'c. 1241 CE: Hanseatic League formalizes, dominating Baltic and North Sea trade (~200 cities)',
                '1260s CE: Mongol Pax Mongolica enables safest Eurasian overland trade in history',
                'c. 1324 CE: Mansa Musa\'s hajj to Mecca\u2014distributes so much gold it depresses Cairo\'s price for a decade',
                '1346-1353: Black Death kills 30-60% of Europeans, permanently raising real wages for survivors',
                '1397 CE: Medici Bank founded in Florence; becomes Europe\'s most powerful financial institution',
                '1450s CE: Gutenberg\'s printing press dramatically reduces cost of information transmission'
              ],
              sources: 'Maddison (2007), Abu-Lughod "Before European Hegemony" (1989), Pomeranz "The Great Divergence" (2000)'
            },
            {
              title: 'Early Modern & Industrial (1500 - 1900 CE)',
              content: 'The Columbian Exchange (post-1492) transferred crops, animals, diseases, and silver between hemispheres, transforming every economy on Earth. Spanish silver from Potosi flowed through Manila to China, creating the first truly global trade system. The Dutch VOC (1602) became the first publicly traded joint-stock company, pioneering limited liability and the stock exchange. Britain\'s Industrial Revolution (c. 1760-1840) was the single most important economic event in human history: steam power, factory production, and railways multiplied British output per capita 6x between 1700 and 1900. This "Great Divergence" saw Western Europe\'s share of global GDP surge from 18% to 36% while Asia\'s collapsed from 62% to 22%. Colonial extraction accelerated the shift\u2014India\'s share of world GDP fell from ~24% in 1700 to just 2% by 1900 under British rule. The gold standard (formally adopted by Britain in 1821) linked major economies in a fixed exchange rate system, enabling massive international capital flows and trade expansion.',
              events: [
                '1492: Columbus reaches the Americas; Columbian Exchange begins reshaping global economies',
                '1498: Vasco da Gama reaches India via Cape route, breaking Ottoman-Venetian trade monopoly',
                '1545: Discovery of Potosi silver mines (Bolivia)\u2014produces 60% of world\'s silver for a century',
                '1602: Dutch East India Company (VOC) founded\u2014first publicly traded joint-stock company',
                '1694: Bank of England founded, pioneering modern central banking',
                '1776: Adam Smith publishes Wealth of Nations; American Declaration of Independence',
                '1784: Watt\'s double-acting steam engine commercialized; factory system spreads',
                '1821: Britain formally adopts gold standard, enabling international fixed exchange rates',
                '1838: First transatlantic steamship crossing; global trade accelerates',
                '1848: California Gold Rush; Marx and Engels publish Communist Manifesto',
                '1869: Suez Canal opens, reducing Europe-Asia shipping time by 40%',
                '1870-1914: First age of globalization\u2014trade/GDP ratios not reached again until 1990s'
              ],
              sources: 'Pomeranz "The Great Divergence" (2000), Allen "The British Industrial Revolution" (2009), Findlay & O\'Rourke "Power and Plenty" (2007)'
            },
            {
              title: 'Modern Era (1900 CE - Present)',
              content: 'The 20th century saw economic gravity shift from Europe to America and then begin swinging back toward Asia. World War I destroyed the first globalization era and the gold standard. The Great Depression (1929-1939) demonstrated the catastrophic risks of unregulated capitalism and led to Keynesian economic management. World War II left the US with nearly 50% of global industrial capacity; the Bretton Woods system (1944) established dollar hegemony. Decolonization created dozens of new nations seeking development paths. The Asian Tigers (South Korea, Taiwan, Hong Kong, Singapore) proved that rapid industrialization was possible outside the West. China\'s post-1978 market reforms produced the largest poverty reduction in history\u2014800 million lifted above the poverty line. The 2008 Global Financial Crisis exposed fragilities in deregulated finance, while the COVID-19 pandemic accelerated digitalization and remote work. By 2023, Asia\'s GDP share (43%) exceeded its level in 1700, marking a historic return to the millennial norm.',
              events: [
                '1913: Federal Reserve established; peak of first globalization era',
                '1914-1918: WWI destroys European economic hegemony and gold standard',
                '1929: Wall Street Crash triggers Great Depression\u2014global GDP falls 15%',
                '1944: Bretton Woods Conference establishes IMF, World Bank, and dollar-gold peg',
                '1947: GATT signed, beginning multilateral tariff reduction; Marshall Plan rebuilds Europe',
                '1960s-1990s: Asian Tigers achieve 7-10% annual growth through export-oriented industrialization',
                '1971: Nixon ends dollar-gold convertibility; Bretton Woods collapses',
                '1978: Deng Xiaoping launches "Reform and Opening Up"\u2014China\'s GDP grows 40x by 2023',
                '1991: Soviet Union dissolves; India begins economic liberalization under Narasimha Rao',
                '1995: WTO established, replacing GATT; internet commercialization begins',
                '2001: China joins WTO\u2014becomes "world\'s factory" within a decade',
                '2008: Global Financial Crisis\u2014$22 trillion in wealth destroyed; leads to quantitative easing',
                '2020: COVID-19 pandemic accelerates digital economy; global GDP contracts 3.1%',
                '2023: Asia reaches 43% of global GDP (PPP), surpassing its 1700 CE share'
              ],
              sources: 'Maddison (2007), Piketty "Capital in the Twenty-First Century" (2014), World Bank & IMF databases'
            }
          ].map((period, index) => (
            <details 
              key={index}
              className={`group rounded-xl border ${themeColors.border} ${themeColors.cardBg} overflow-hidden`}
            >
              <summary className={`p-4 sm:p-6 cursor-pointer list-none flex items-center justify-between ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              } transition-colors`}>
                <h3 className={`text-base sm:text-xl font-bold ${themeColors.text}`}>{period.title}</h3>
                <svg 
                  className={`w-5 h-5 ${themeColors.textSecondary} transition-transform group-open:rotate-180`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className={`px-4 sm:px-6 pb-4 sm:pb-6 border-t ${themeColors.border}`}>
                <p className={`${themeColors.textSecondary} mt-4 mb-4 text-sm`}>{period.content}</p>
                <div>
                  <h4 className={`text-sm sm:text-base font-semibold mb-3 ${themeColors.text}`}>Key Economic Events:</h4>
                  <ul className={`space-y-2 text-sm ${themeColors.textSecondary}`}>
                    {period.events.map((event, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`mt-4 pt-3 border-t ${themeColors.border}`}>
                  <p className={`text-xs italic ${themeColors.textTertiary}`}>
                    Sources: {period.sources}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className={`p-4 sm:p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
        <h3 className={`text-base sm:text-lg font-bold mb-4 flex items-center ${themeColors.text}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-3 bg-blue-500`} />
          Methodology Note
        </h3>
        <p className={`text-sm ${themeColors.textTertiary}`}>
          This visualization is based on historical economic data and research from various academic sources.
          GDP shares are approximated for ancient periods where exact data is unavailable.
          Modern period data (1500 CE onwards) is derived from economic historians' estimates and World Bank data.
        </p>
      </div>
    </div>
  );
};

export default EconomicGravityPage;
