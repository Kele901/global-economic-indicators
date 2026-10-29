import { terms, vote, type HistoryMap } from './helpers';

const UR = '#1d4ed8', KPRF = '#b91c1c', LDPR = '#eab308', SR = '#f97316';

export const EURASIA_HISTORY: HistoryMap = {
  Russia: {
    leaders: terms('hos', [
      ['Joseph Stalin', 'CPSU', '1922-04-03', '1953-03-05', 'ps', 'Died in office'],
      ['Nikita Khrushchev', 'CPSU', '1953-09-14', '1964-10-14', 'ps', 'Ousted by the Presidium'],
      ['Leonid Brezhnev', 'CPSU', '1964-10-14', '1982-11-10', 'ps', 'Died in office'],
      ['Yuri Andropov', 'CPSU', '1982-11-12', '1984-02-09', 'ps', 'Died in office'],
      ['Konstantin Chernenko', 'CPSU', '1984-02-13', '1985-03-10', 'ps', 'Died in office'],
      ['Mikhail Gorbachev', 'CPSU', '1985-03-11', '1991-12-25', 'ps', 'USSR dissolved'],
      ['Boris Yeltsin', 'Independent', '1991-12-25', '1999-12-31', 'e', 'President of Russia from July 1991; resigned'],
      ['Vladimir Putin', 'Independent / United Russia', '1999-12-31', '2008-05-07', 'e', 'Acting, then elected 2000'],
      ['Dmitry Medvedev', 'United Russia', '2008-05-07', '2012-05-07', 'e', 'Putin served as prime minister'],
      ['Vladimir Putin', 'United Russia', '2012-05-07', null, 'e', '2020 amendments reset term limits'],
    ]),
    leadersNote: 'Soviet-era leaders are General Secretaries of the CPSU, the real seat of power.',
    votes: [
      vote(2003, 'State Duma (party list)', [['UR', 'United Russia', 37.6, UR], ['KPRF', 'Communist', 12.6, KPRF], ['LDPR', 'LDPR', 11.5, LDPR], ['ROD', 'Rodina', 9.0, '#64748b']], { turnoutPct: 55.8, contested: true }),
      vote(2007, 'State Duma', [['UR', 'United Russia', 64.3, UR], ['KPRF', 'Communist', 11.6, KPRF], ['LDPR', 'LDPR', 8.1, LDPR], ['SR', 'A Just Russia', 7.7, SR]], { turnoutPct: 63.7, contested: true }),
      vote(2011, 'State Duma', [['UR', 'United Russia', 49.3, UR], ['KPRF', 'Communist', 19.2, KPRF], ['SR', 'A Just Russia', 13.2, SR], ['LDPR', 'LDPR', 11.7, LDPR]], { turnoutPct: 60.1, contested: true }),
      vote(2016, 'State Duma (party list)', [['UR', 'United Russia', 54.2, UR], ['KPRF', 'Communist', 13.3, KPRF], ['LDPR', 'LDPR', 13.1, LDPR], ['SR', 'A Just Russia', 6.2, SR]], { turnoutPct: 47.9, contested: true }),
      vote(2021, 'State Duma (party list)', [['UR', 'United Russia', 49.8, UR], ['KPRF', 'Communist', 18.9, KPRF], ['LDPR', 'LDPR', 7.5, LDPR], ['SR', 'A Just Russia', 7.5, SR], ['NP', 'New People', 5.3, '#06b6d4']], { turnoutPct: 51.7, contested: true }),
      vote(2026, 'State Duma (party list)', [['UR', 'United Russia', 59.0, UR], ['KPRF', 'Communist', 13.7, KPRF], ['LDPR', 'LDPR', 9.0, LDPR], ['NP', 'New People', 7.9, '#06b6d4'], ['SR', 'A Just Russia', 5.4, SR]], { contested: true }),
    ],
    votesNote: 'Official results. Independent observers report systematic fraud, and genuine opposition parties are barred.',
  },

  Ukraine: {
    leaders: terms('hos', [
      ['Leonid Kravchuk', 'Independent', '1991-12-05', '1994-07-19', 'e'],
      ['Leonid Kuchma', 'Independent', '1994-07-19', '2005-01-23', 'e'],
      ['Viktor Yushchenko', 'Our Ukraine', '2005-01-23', '2010-02-25', 'e', 'Elected after the Orange Revolution re-run'],
      ['Viktor Yanukovych', 'Party of Regions', '2010-02-25', '2014-02-22', 'e', 'Fled during the Euromaidan revolution'],
      ['Oleksandr Turchynov', 'Batkivshchyna', '2014-02-23', '2014-06-07', 'p', 'Acting'],
      ['Petro Poroshenko', 'Solidarity', '2014-06-07', '2019-05-20', 'e'],
      ['Volodymyr Zelensky', 'Servant of the People', '2019-05-20', null, 'e', 'Term extended under martial law'],
    ]),
    leadersNote: 'Independent Ukraine from 1991; before that a Soviet republic ruled from Moscow.',
    votes: [
      vote(1994, 'Presidential (first round)', [['KRAV', 'Kravchuk', 38.4, '#0ea5e9'], ['KUCH', 'Kuchma', 31.2, '#1d4ed8'], ['SOC', 'Moroz (Socialist)', 13.0, '#ec4899']]),
      vote(1999, 'Presidential (first round)', [['KUCH', 'Kuchma', 36.5, '#1d4ed8'], ['KPU', 'Symonenko (Communist)', 22.2, '#b91c1c'], ['SOC', 'Moroz (Socialist)', 11.3, '#ec4899']]),
      vote(2004, 'Presidential (first round)', [['WEST', 'Yushchenko', 39.9, '#f97316'], ['EAST', 'Yanukovych', 39.3, '#2563eb'], ['SOC', 'Moroz (Socialist)', 5.8, '#ec4899'], ['KPU', 'Symonenko (Communist)', 5.0, '#b91c1c']], { turnoutPct: 74.9 }),
      vote(2010, 'Presidential (first round)', [['EAST', 'Yanukovych', 35.3, '#2563eb'], ['BAT', 'Tymoshenko', 25.1, '#dc2626'], ['TIH', 'Tihipko', 13.1, '#64748b'], ['YAT', 'Yatsenyuk', 7.0, '#16a34a']], { turnoutPct: 66.8 }),
      vote(2014, 'Presidential', [['WEST', 'Poroshenko', 54.7, '#f97316'], ['BAT', 'Tymoshenko', 12.8, '#dc2626'], ['RAD', 'Lyashko', 8.3, '#facc15']], { turnoutPct: 60.3 }),
      vote(2019, 'Presidential (first round)', [['SOTP', 'Zelensky', 30.2, '#22c55e'], ['WEST', 'Poroshenko', 15.9, '#f97316'], ['BAT', 'Tymoshenko', 13.4, '#dc2626'], ['EAST', 'Boyko', 11.7, '#2563eb']], { turnoutPct: 62.8 }),
    ],
    votesNote: 'Elections are suspended under martial law since the 2022 full-scale invasion; occupied areas could not vote in 2014 or 2019.',
  },
};
