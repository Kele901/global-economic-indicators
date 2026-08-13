// Historical scenario presets for the /simulator page.
//
// Each preset is a sequence of shocks the simulator engine can
// apply one after another to build an approximation of the named
// historical episode. The magnitudes are calibrated to match the
// contemporaneous data (e.g. 2008 Fed cut = -4pp over 12 months).

export interface ShockStep {
  country: string;         // one of COUNTRY_KEYS
  inputMetric: string;     // one of the simulator's INPUT_METRICS
  changeMagnitude: number; // signed change applied to the input metric
  narrative: string;       // short label for the run summary
}

export interface ScenarioPreset {
  id: string;
  title: string;
  year: string;
  summary: string;         // one-sentence description surfaced next to the preset chip
  steps: ShockStep[];
}

export const HISTORICAL_PRESETS: ScenarioPreset[] = [
  {
    id: 'replay-2008',
    title: 'Replay 2008 GFC',
    year: '2008-09',
    summary: 'Fed cuts 4pp, credit contracts, US GDP falls ~3pp and unemployment climbs sharply.',
    steps: [
      { country: 'USA', inputMetric: 'interestRates',    changeMagnitude: -4,  narrative: 'Fed cuts policy rate 4pp' },
      { country: 'USA', inputMetric: 'gdpGrowth',        changeMagnitude: -3,  narrative: 'US real GDP contracts ~3pp' },
      { country: 'EU',  inputMetric: 'interestRates',    changeMagnitude: -3,  narrative: 'ECB follows with 3pp of cuts' },
    ],
  },
  {
    id: 'replay-1973',
    title: 'Replay 1973 oil shock',
    year: '1973-74',
    summary: 'OPEC quadruples oil prices; US inflation +8pp, GDP -2pp, sterling +policy rates +5pp.',
    steps: [
      { country: 'USA', inputMetric: 'inflationRates',   changeMagnitude: 8,   narrative: 'US CPI jumps 8pp' },
      { country: 'USA', inputMetric: 'gdpGrowth',        changeMagnitude: -2,  narrative: 'US GDP contracts 2pp' },
      { country: 'UK',  inputMetric: 'interestRates',    changeMagnitude: 5,   narrative: 'Bank of England tightens 5pp' },
    ],
  },
  {
    id: 'replay-2020',
    title: 'Replay 2020 COVID',
    year: '2020',
    summary: 'Fed slashes 1.5pp, US GDP -3.5pp, debt +10pp, EM currencies weaken.',
    steps: [
      { country: 'USA',    inputMetric: 'interestRates', changeMagnitude: -1.5,  narrative: 'Fed cuts 1.5pp to zero-lower bound' },
      { country: 'USA',    inputMetric: 'gdpGrowth',     changeMagnitude: -3.5,  narrative: 'US GDP contracts 3.5pp' },
      { country: 'USA',    inputMetric: 'governmentDebt', changeMagnitude: 10,   narrative: 'US debt to GDP jumps 10pp' },
      { country: 'BRAZIL', inputMetric: 'exchangeRate',  changeMagnitude: -20,   narrative: 'BRL sells off 20% vs USD' },
    ],
  },
  {
    id: 'replay-2022',
    title: 'Replay 2022 Ukraine energy shock',
    year: '2022',
    summary: 'European gas prices spike, EU inflation +5pp, ECB tightens, EUR/USD -12%.',
    steps: [
      { country: 'EU',      inputMetric: 'inflationRates', changeMagnitude: 5,   narrative: 'EU HICP jumps 5pp' },
      { country: 'EU',      inputMetric: 'interestRates',  changeMagnitude: 4,   narrative: 'ECB hikes 4pp' },
      { country: 'EU',      inputMetric: 'exchangeRate',   changeMagnitude: -12, narrative: 'EUR/USD depreciates 12%' },
      { country: 'GERMANY', inputMetric: 'gdpGrowth',      changeMagnitude: -2,  narrative: 'German GDP -2pp on gas supply shock' },
    ],
  },
];

export function findPreset(id: string): ScenarioPreset | undefined {
  return HISTORICAL_PRESETS.find(p => p.id === id);
}
