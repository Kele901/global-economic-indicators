import { terms, vote, type HistoryMap } from './helpers';

const AKP = '#f59e0b', CHP = '#dc2626', MHP = '#1e3a8a', HDP = '#7c3aed';

export const MIDDLE_EAST_HISTORY: HistoryMap = {
  Turkey: {
    leaders: [
      ...terms('hos', [
        ['İsmet İnönü', 'CHP', '1938-11-11', '1950-05-22', 'p', 'Accepted defeat in the first free election'],
        ['Celal Bayar', 'Democrat Party', '1950-05-22', '1960-05-27', 'p', 'Deposed in the 1960 coup'],
        ['Cemal Gürsel', 'Military', '1960-05-27', '1966-03-28', 'c'],
        ['Cevdet Sunay', 'Independent', '1966-03-28', '1973-03-28', 'p'],
        ['Fahri Korutürk', 'Independent', '1973-04-06', '1980-04-06', 'p'],
        ['Kenan Evren', 'Military', '1980-09-12', '1989-11-09', 'c', '1980 coup; 1982 constitution'],
        ['Turgut Özal', 'ANAP', '1989-11-09', '1993-04-17', 'p', 'Died in office'],
        ['Süleyman Demirel', 'DYP', '1993-05-16', '2000-05-16', 'p'],
        ['Ahmet Necdet Sezer', 'Independent', '2000-05-16', '2007-08-28', 'p'],
        ['Abdullah Gül', 'AKP', '2007-08-28', '2014-08-28', 'p'],
        ['Recep Tayyip Erdoğan', 'AKP', '2014-08-28', null, 'e', 'First directly elected president; executive presidency from 2018'],
      ]),
      ...terms('hog', [
        ['Adnan Menderes', 'Democrat Party', '1950-05-22', '1960-05-27', 'e', 'Executed after the 1960 coup'],
        ['Süleyman Demirel', 'Justice Party', '1965-10-27', '1971-03-26', 'e', 'Forced out by the 1971 military memorandum'],
        ['Bülent Ecevit', 'CHP', '1974-01-26', '1974-11-17', 'p', 'Ordered the Cyprus intervention'],
        ['Turgut Özal', 'ANAP', '1983-12-13', '1989-10-31', 'e'],
        ['Tansu Çiller', 'DYP', '1993-06-25', '1996-03-06', 'ps', 'First woman PM'],
        ['Necmettin Erbakan', 'Welfare Party', '1996-06-28', '1997-06-30', 'p', 'Forced out by the 1997 "postmodern coup"'],
        ['Bülent Ecevit', 'DSP', '1999-01-11', '2002-11-18', 'e'],
        ['Abdullah Gül', 'AKP', '2002-11-18', '2003-03-14', 'e'],
        ['Recep Tayyip Erdoğan', 'AKP', '2003-03-14', '2014-08-28', 'e'],
        ['Ahmet Davutoğlu', 'AKP', '2014-08-28', '2016-05-24', 'ps'],
        ['Binali Yıldırım', 'AKP', '2016-05-24', '2018-07-09', 'ps', 'Office abolished in 2018'],
      ]),
    ],
    leadersNote: 'Prime ministers shown are the longer-serving or pivotal holders; the office was abolished in 2018.',
    votes: [
      vote(2002, 'Grand National Assembly', [['AKP', 'AKP', 34.3, AKP], ['CHP', 'CHP', 19.4, CHP], ['DYP', 'DYP', 9.5, '#0ea5e9'], ['MHP', 'MHP', 8.4, MHP]], { turnoutPct: 79.1 }),
      vote(2007, 'Grand National Assembly', [['AKP', 'AKP', 46.6, AKP], ['CHP', 'CHP', 20.9, CHP], ['MHP', 'MHP', 14.3, MHP]], { turnoutPct: 84.2 }),
      vote(2011, 'Grand National Assembly', [['AKP', 'AKP', 49.8, AKP], ['CHP', 'CHP', 26.0, CHP], ['MHP', 'MHP', 13.0, MHP]], { turnoutPct: 83.2 }),
      vote(2015, 'Grand National Assembly (November)', [['AKP', 'AKP', 49.5, AKP], ['CHP', 'CHP', 25.3, CHP], ['MHP', 'MHP', 11.9, MHP], ['HDP', 'HDP', 10.8, HDP]], { turnoutPct: 85.2 }),
      vote(2018, 'Grand National Assembly', [['AKP', 'AKP', 42.6, AKP], ['CHP', 'CHP', 22.6, CHP], ['HDP', 'HDP', 11.7, HDP], ['MHP', 'MHP', 11.1, MHP], ['IYI', 'İYİ Party', 10.0, '#06b6d4']], { turnoutPct: 86.2 }),
      vote(2023, 'Grand National Assembly', [['AKP', 'AKP', 35.6, AKP], ['CHP', 'CHP', 25.4, CHP], ['MHP', 'MHP', 10.1, MHP], ['IYI', 'İYİ Party', 9.7, '#06b6d4'], ['HDP', 'YSP (ex-HDP)', 8.8, HDP]], { turnoutPct: 87.0 }),
    ],
  },

  SaudiArabia: {
    leaders: [
      ...terms('hos', [
        ['Abdulaziz ibn Saud', 'House of Saud', '1932-09-23', '1953-11-09', 'c', 'Founded the kingdom by conquest'],
        ['Saud bin Abdulaziz', 'House of Saud', '1953-11-09', '1964-11-02', 'h', 'Deposed by the royal family'],
        ['Faisal bin Abdulaziz', 'House of Saud', '1964-11-02', '1975-03-25', 'h', 'Assassinated'],
        ['Khalid bin Abdulaziz', 'House of Saud', '1975-03-25', '1982-06-13', 'h'],
        ['Fahd bin Abdulaziz', 'House of Saud', '1982-06-13', '2005-08-01', 'h'],
        ['Abdullah bin Abdulaziz', 'House of Saud', '2005-08-01', '2015-01-23', 'h'],
        ['Salman bin Abdulaziz Al Saud', 'House of Saud', '2015-01-23', null, 'h'],
      ]),
      ...terms('hog', [
        ['Mohammed bin Salman', 'House of Saud', '2022-09-27', null, 'a', 'Crown prince since 2017; de facto ruler'],
      ]),
    ],
    votes: [],
    votesNote: 'No national elections. Only partial municipal council elections have been held, in 2005, 2011, 2015 and 2019.',
  },

  Egypt: {
    leaders: terms('hos', [
      ['Farouk I', 'Muhammad Ali dynasty', '1936-04-28', '1952-07-26', 'h', 'Overthrown by the Free Officers'],
      ['Fuad II', 'Muhammad Ali dynasty', '1952-07-26', '1953-06-18', 'h', 'Infant king; monarchy abolished'],
      ['Mohamed Naguib', 'Free Officers', '1953-06-18', '1954-11-14', 'c'],
      ['Gamal Abdel Nasser', 'Arab Socialist Union', '1954-11-14', '1970-09-28', 'c', 'Died in office'],
      ['Anwar Sadat', 'NDP', '1970-09-28', '1981-10-06', 's', 'Assassinated'],
      ['Hosni Mubarak', 'NDP', '1981-10-14', '2011-02-11', 's', 'Toppled in the 2011 uprising'],
      ['Mohamed Hussein Tantawi', 'SCAF (military)', '2011-02-11', '2012-06-30', 'c', 'Military council'],
      ['Mohamed Morsi', 'Freedom and Justice', '2012-06-30', '2013-07-03', 'e', 'First freely elected president; removed by the army'],
      ['Adly Mansour', 'Independent', '2013-07-04', '2014-06-08', 'a', 'Interim'],
      ['Abdel Fattah el-Sisi', 'Independent', '2014-06-08', null, 'e', 'Led the 2013 takeover'],
    ]),
    votes: [
      vote(2005, 'Presidential', [['NDP', 'Mubarak', 88.6, '#16a34a'], ['GHAD', 'Ayman Nour', 7.6, '#f97316']], { turnoutPct: 23.0, contested: true }),
      vote(2012, 'Presidential (first round)', [['ISL', 'Morsi', 24.8, '#15803d'], ['MIL', 'Shafik', 23.7, '#334155'], ['NAS', 'Sabahi', 20.7, '#dc2626'], ['ISLM', 'Aboul Fotouh', 17.5, '#84cc16'], ['LIB', 'Moussa', 11.1, '#0ea5e9']], { turnoutPct: 46.4 }),
      vote(2014, 'Presidential', [['MIL', 'el-Sisi', 96.9, '#334155'], ['NAS', 'Sabahi', 3.1, '#dc2626']], { turnoutPct: 47.5, contested: true }),
      vote(2018, 'Presidential', [['MIL', 'el-Sisi', 97.1, '#334155'], ['GHAD', 'Moussa Mostafa Moussa', 2.9, '#f97316']], { turnoutPct: 41.1, contested: true }),
      vote(2023, 'Presidential', [['MIL', 'el-Sisi', 89.6, '#334155'], ['WAFD', 'Hazem Omar', 4.5, '#0ea5e9'], ['NAS', 'Farid Zahran', 4.0, '#dc2626'], ['LIB', 'Abdel-Sanad Yamama', 1.9, '#a855f7']], { turnoutPct: 66.8, contested: true }),
    ],
    votesNote: 'Only the 2012 election is widely regarded as competitive; later contests excluded serious challengers.',
  },

  Israel: {
    leaders: terms('hog', [
      ['David Ben-Gurion', 'Mapai', '1948-05-14', '1954-01-26', 'e', 'Founding PM'],
      ['Moshe Sharett', 'Mapai', '1954-01-26', '1955-11-03', 'ps'],
      ['David Ben-Gurion', 'Mapai', '1955-11-03', '1963-06-26', 'e'],
      ['Levi Eshkol', 'Mapai / Alignment', '1963-06-26', '1969-02-26', 'ps', 'Died in office'],
      ['Golda Meir', 'Alignment', '1969-03-17', '1974-06-03', 'ps', 'First woman PM'],
      ['Yitzhak Rabin', 'Alignment', '1974-06-03', '1977-06-20', 'ps'],
      ['Menachem Begin', 'Likud', '1977-06-20', '1983-10-10', 'e', 'First right-wing PM; Camp David accords'],
      ['Yitzhak Shamir', 'Likud', '1983-10-10', '1984-09-13', 'ps'],
      ['Shimon Peres', 'Alignment', '1984-09-13', '1986-10-20', 'p', 'Rotation agreement'],
      ['Yitzhak Shamir', 'Likud', '1986-10-20', '1992-07-13', 'p', 'Rotation agreement'],
      ['Yitzhak Rabin', 'Labor', '1992-07-13', '1995-11-04', 'e', 'Assassinated'],
      ['Shimon Peres', 'Labor', '1995-11-04', '1996-06-18', 'ps'],
      ['Benjamin Netanyahu', 'Likud', '1996-06-18', '1999-07-06', 'e'],
      ['Ehud Barak', 'One Israel', '1999-07-06', '2001-03-07', 'e'],
      ['Ariel Sharon', 'Likud / Kadima', '2001-03-07', '2006-04-14', 'e', 'Incapacitated by a stroke'],
      ['Ehud Olmert', 'Kadima', '2006-04-14', '2009-03-31', 'e'],
      ['Benjamin Netanyahu', 'Likud', '2009-03-31', '2021-06-13', 'p'],
      ['Naftali Bennett', 'Yamina', '2021-06-13', '2022-06-30', 'p', 'Rotation government'],
      ['Yair Lapid', 'Yesh Atid', '2022-07-01', '2022-12-29', 'p', 'Caretaker'],
      ['Benjamin Netanyahu', 'Likud', '2022-12-29', null, 'p'],
    ]),
    votes: [
      vote(2015, 'Knesset', [['LIK', 'Likud', 23.4, '#1d4ed8'], ['DEM', 'Zionist Union', 18.7, '#dc2626'], ['JL', 'Joint List', 10.6, '#15803d'], ['YA', 'Yesh Atid', 8.8, '#06b6d4'], ['KUL', 'Kulanu', 7.5, '#38bdf8'], ['RZP', 'Jewish Home', 6.7, '#7c3aed'], ['SHAS', 'Shas', 5.7, '#111827']], { turnoutPct: 72.3 }),
      vote(2019, 'Knesset (September)', [['BW', 'Blue and White', 25.9, '#0ea5e9'], ['LIK', 'Likud', 25.1, '#1d4ed8'], ['JL', 'Joint List', 10.6, '#15803d'], ['SHAS', 'Shas', 7.4, '#111827'], ['YB', 'Yisrael Beiteinu', 7.0, '#64748b'], ['UTJ', 'United Torah Judaism', 6.1, '#334155'], ['RZP', 'Yamina', 5.9, '#7c3aed']], { turnoutPct: 69.8 }),
      vote(2020, 'Knesset', [['LIK', 'Likud', 29.5, '#1d4ed8'], ['BW', 'Blue and White', 26.6, '#0ea5e9'], ['JL', 'Joint List', 12.7, '#15803d'], ['SHAS', 'Shas', 7.7, '#111827'], ['UTJ', 'United Torah Judaism', 6.0, '#334155'], ['YB', 'Yisrael Beiteinu', 5.7, '#64748b']], { turnoutPct: 71.5 }),
      vote(2021, 'Knesset', [['LIK', 'Likud', 24.2, '#1d4ed8'], ['YA', 'Yesh Atid', 13.9, '#06b6d4'], ['SHAS', 'Shas', 7.2, '#111827'], ['BW', 'Blue and White', 6.6, '#0ea5e9'], ['YAM', 'Yamina', 6.2, '#a855f7'], ['DEM', 'Labor', 6.1, '#dc2626'], ['UTJ', 'United Torah Judaism', 5.6, '#334155'], ['YB', 'Yisrael Beiteinu', 5.6, '#64748b'], ['RZP', 'Religious Zionism', 5.1, '#7c3aed']], { turnoutPct: 67.4 }),
      vote(2022, 'Knesset', [['LIK', 'Likud', 23.4, '#1d4ed8'], ['YA', 'Yesh Atid', 17.8, '#06b6d4'], ['RZP', 'Religious Zionism', 10.8, '#7c3aed'], ['BW', 'National Unity', 9.1, '#0ea5e9'], ['SHAS', 'Shas', 8.2, '#111827'], ['UTJ', 'United Torah Judaism', 5.9, '#334155'], ['YB', 'Yisrael Beiteinu', 4.5, '#64748b'], ['RAAM', 'Ra\'am', 4.1, '#22c55e']], { turnoutPct: 70.6 }),
      vote(2026, 'Knesset', [['LIK', 'Likud', 20.5, '#1d4ed8'], ['YASHAR', 'Yashar', 16.1, '#f97316'], ['TOG', 'Together', 9.3, '#06b6d4'], ['JL', 'Joint List', 8.9, '#15803d'], ['DEM', 'The Democrats', 6.4, '#dc2626'], ['RAAM', 'Ra\'am', 5.9, '#22c55e'], ['YB', 'Yisrael Beiteinu', 5.9, '#64748b'], ['OTZ', 'Otzma Yehudit', 5.7, '#4c1d95'], ['UTJ', 'United Torah Judaism', 5.5, '#334155'], ['SHAS', 'Shas', 5.3, '#111827'], ['RZP', 'Religious Zionism', 5.1, '#7c3aed']], { turnoutPct: 77.7 }),
    ],
  },

  Iran: {
    leaders: terms('hos', [
      ['Mohammad Reza Pahlavi', 'Pahlavi dynasty', '1941-09-16', '1979-02-11', 'h', 'Shah; restored by the 1953 coup; overthrown in 1979'],
      ['Ruhollah Khomeini', 'Clergy', '1979-02-11', '1989-06-03', 'c', 'Islamic Revolution; Supreme Leader'],
      ['Ali Khamenei', 'Clergy', '1989-06-04', '2026-03-08', 'a', 'Chosen by the Assembly of Experts'],
      ['Mojtaba Khamenei', 'Clergy', '2026-03-08', null, 'a', 'Chosen by the Assembly of Experts'],
    ]),
    leadersNote: 'Since 1979 the Supreme Leader, not the elected president, holds ultimate authority.',
    votes: [
      vote(2005, 'Presidential (first round)', [['PRAG', 'Rafsanjani', 21.1, '#0ea5e9'], ['HARD', 'Ahmadinejad', 19.4, '#111827'], ['REF', 'Karroubi', 17.3, '#16a34a']], { turnoutPct: 62.8, contested: true }),
      vote(2009, 'Presidential', [['HARD', 'Ahmadinejad', 62.6, '#111827'], ['REF', 'Mousavi', 33.8, '#16a34a']], { turnoutPct: 85.0, contested: true }),
      vote(2013, 'Presidential', [['PRAG', 'Rouhani', 50.9, '#0ea5e9'], ['CON', 'Ghalibaf', 16.6, '#b45309'], ['HARD', 'Jalili', 11.4, '#111827']], { turnoutPct: 72.9, contested: true }),
      vote(2017, 'Presidential', [['PRAG', 'Rouhani', 57.1, '#0ea5e9'], ['HARD', 'Raisi', 38.3, '#111827']], { turnoutPct: 73.3, contested: true }),
      vote(2021, 'Presidential', [['HARD', 'Raisi', 61.9, '#111827'], ['CON', 'Rezaei', 11.8, '#b45309'], ['PRAG', 'Hemmati', 8.4, '#0ea5e9']], { turnoutPct: 48.8, contested: true }),
      vote(2024, 'Presidential (first round)', [['REF', 'Pezeshkian', 42.5, '#16a34a'], ['HARD', 'Jalili', 38.6, '#111827'], ['CON', 'Ghalibaf', 13.8, '#b45309']], { turnoutPct: 39.9, contested: true }),
    ],
    votesNote: 'Candidates are vetted by the Guardian Council, and many are disqualified. Abbreviations mark the camp: HARD (hardline), CON (conservative), PRAG (pragmatist) and REF (reformist).',
  },

  UAE: {
    leaders: terms('hos', [
      ['Zayed bin Sultan Al Nahyan', 'Al Nahyan', '1971-12-02', '2004-11-02', 'a', 'Founding president'],
      ['Khalifa bin Zayed Al Nahyan', 'Al Nahyan', '2004-11-03', '2022-05-13', 'a'],
      ['Mohamed bin Zayed Al Nahyan', 'Al Nahyan', '2022-05-14', null, 'a', 'De facto ruler since about 2014'],
    ]),
    leadersNote: 'Presidents are chosen by the Federal Supreme Council of the seven emirs. The federation was founded in 1971.',
    votes: [],
    votesNote: 'There are no popular national elections. Half of the advisory Federal National Council is chosen by a limited, appointed electoral college.',
  },

  Qatar: {
    leaders: terms('hos', [
      ['Abdullah bin Jassim Al Thani', 'Al Thani', '1913-07-17', '1949-08-20', 'h'],
      ['Ali bin Abdullah Al Thani', 'Al Thani', '1949-08-20', '1960-10-24', 'h', 'Abdicated'],
      ['Ahmad bin Ali Al Thani', 'Al Thani', '1960-10-24', '1972-02-22', 'h', 'Deposed'],
      ['Khalifa bin Hamad Al Thani', 'Al Thani', '1972-02-22', '1995-06-27', 'c', 'Palace coup'],
      ['Hamad bin Khalifa Al Thani', 'Al Thani', '1995-06-27', '2013-06-25', 'c', 'Deposed his father; abdicated'],
      ['Tamim bin Hamad Al Thani', 'Al Thani', '2013-06-25', null, 'h'],
    ]),
    votes: [],
    votesNote: 'The only national vote, the 2021 Shura Council election, was abolished by the 2024 constitutional referendum.',
  },

  Morocco: {
    leaders: terms('hos', [
      ['Mohammed V', 'Alaouite dynasty', '1957-08-14', '1961-02-26', 'h', 'Sultan from 1927; king after independence'],
      ['Hassan II', 'Alaouite dynasty', '1961-02-26', '1999-07-23', 'h', 'The "Years of Lead"'],
      ['Mohammed VI', 'Alaouite dynasty', '1999-07-23', null, 'h'],
    ]),
    votes: [
      vote(2002, 'House of Representatives (seat share)', [['USFP', 'USFP', 15.4, '#dc2626'], ['IST', 'Istiqlal', 14.8, '#ea580c'], ['PJD', 'PJD', 12.9, '#15803d'], ['RNI', 'RNI', 12.6, '#1d4ed8']]),
      vote(2007, 'House of Representatives (seat share)', [['IST', 'Istiqlal', 16.0, '#ea580c'], ['PJD', 'PJD', 14.2, '#15803d'], ['MP', 'Popular Movement', 12.6, '#a3e635'], ['RNI', 'RNI', 12.0, '#1d4ed8'], ['USFP', 'USFP', 11.7, '#dc2626']], { turnoutPct: 37.0 }),
      vote(2011, 'House of Representatives (seat share)', [['PJD', 'PJD', 27.1, '#15803d'], ['IST', 'Istiqlal', 15.2, '#ea580c'], ['RNI', 'RNI', 13.2, '#1d4ed8'], ['PAM', 'PAM', 11.9, '#7c3aed']], { turnoutPct: 45.4 }),
      vote(2016, 'House of Representatives (seat share)', [['PJD', 'PJD', 31.6, '#15803d'], ['PAM', 'PAM', 25.8, '#7c3aed'], ['IST', 'Istiqlal', 11.6, '#ea580c'], ['RNI', 'RNI', 9.4, '#1d4ed8']], { turnoutPct: 43.0 }),
      vote(2021, 'House of Representatives (seat share)', [['RNI', 'RNI', 25.8, '#1d4ed8'], ['PAM', 'PAM', 22.0, '#7c3aed'], ['IST', 'Istiqlal', 20.5, '#ea580c'], ['USFP', 'USFP', 8.6, '#dc2626'], ['PJD', 'PJD', 3.3, '#15803d']], { turnoutPct: 50.4 }),
    ],
    votesNote: 'Seat shares, because official vote totals are inconsistently published. The palace keeps strategic powers whatever the result. Results of the 2026 vote are not yet included.',
  },
};
