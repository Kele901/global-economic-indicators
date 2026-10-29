import { terms, vote, type HistoryMap } from './helpers';

const NPP = '#1d4ed8', NDC = '#16a34a';

export const AFRICA_HISTORY: HistoryMap = {
  Nigeria: {
    leaders: terms('hos', [
      ['Nnamdi Azikiwe', 'NCNC', '1963-10-01', '1966-01-16', 'a', 'Ceremonial president; PM Tafawa Balewa held power'],
      ['Johnson Aguiyi-Ironsi', 'Military', '1966-01-16', '1966-07-29', 'c', 'Killed in the counter-coup'],
      ['Yakubu Gowon', 'Military', '1966-08-01', '1975-07-29', 'c', 'Led through the Biafran civil war'],
      ['Murtala Mohammed', 'Military', '1975-07-29', '1976-02-13', 'c', 'Assassinated'],
      ['Olusegun Obasanjo', 'Military', '1976-02-13', '1979-10-01', 's', 'Handed power to civilians'],
      ['Shehu Shagari', 'NPN', '1979-10-01', '1983-12-31', 'e'],
      ['Muhammadu Buhari', 'Military', '1983-12-31', '1985-08-27', 'c'],
      ['Ibrahim Babangida', 'Military', '1985-08-27', '1993-08-26', 'c', 'Annulled the 1993 election'],
      ['Ernest Shonekan', 'Independent', '1993-08-26', '1993-11-17', 'a', 'Interim'],
      ['Sani Abacha', 'Military', '1993-11-17', '1998-06-08', 'c', 'Died in office'],
      ['Abdulsalami Abubakar', 'Military', '1998-06-09', '1999-05-29', 's', 'Oversaw the return to democracy'],
      ['Olusegun Obasanjo', 'PDP', '1999-05-29', '2007-05-29', 'e'],
      ['Umaru Musa Yar\'Adua', 'PDP', '2007-05-29', '2010-05-05', 'e', 'Died in office'],
      ['Goodluck Jonathan', 'PDP', '2010-05-06', '2015-05-29', 's'],
      ['Muhammadu Buhari', 'APC', '2015-05-29', '2023-05-29', 'e', 'First opposition victory'],
      ['Bola Tinubu', 'APC', '2023-05-29', null, 'e'],
    ]),
    leadersNote: 'At independence (1960-63) the British monarch was head of state; executive power sat with PM Abubakar Tafawa Balewa until the 1966 coup.',
    votes: [
      vote(2003, 'Presidential', [['PDP', 'Obasanjo (PDP)', 61.9, '#15803d'], ['APC', 'Buhari (ANPP)', 32.2, '#0ea5e9']], { turnoutPct: 69.1 }),
      vote(2007, 'Presidential', [['PDP', 'Yar\'Adua (PDP)', 69.8, '#15803d'], ['APC', 'Buhari (ANPP)', 18.7, '#0ea5e9'], ['ACN', 'Atiku (AC)', 7.5, '#f97316']], { turnoutPct: 57.5, contested: true }),
      vote(2011, 'Presidential', [['PDP', 'Jonathan (PDP)', 58.9, '#15803d'], ['APC', 'Buhari (CPC)', 32.0, '#0ea5e9'], ['ACN', 'Ribadu (ACN)', 5.4, '#f97316']], { turnoutPct: 53.7 }),
      vote(2015, 'Presidential', [['APC', 'Buhari (APC)', 54.0, '#0ea5e9'], ['PDP', 'Jonathan (PDP)', 45.0, '#15803d']], { turnoutPct: 43.7 }),
      vote(2019, 'Presidential', [['APC', 'Buhari (APC)', 55.6, '#0ea5e9'], ['PDP', 'Atiku (PDP)', 41.2, '#15803d']], { turnoutPct: 34.8 }),
      vote(2023, 'Presidential', [['APC', 'Tinubu (APC)', 36.6, '#0ea5e9'], ['PDP', 'Atiku (PDP)', 29.1, '#15803d'], ['LP', 'Obi (Labour)', 25.4, '#dc2626'], ['NNPP', 'Kwankwaso (NNPP)', 6.4, '#a855f7']], { turnoutPct: 26.7 }),
    ],
  },

  SouthAfrica: {
    leaders: terms('hos', [
      ['Jan Smuts', 'United Party', '1939-09-05', '1948-06-04', 'p', 'Prime minister'],
      ['D. F. Malan', 'National Party', '1948-06-04', '1954-11-30', 'e', 'Prime minister; apartheid begins'],
      ['J. G. Strijdom', 'National Party', '1954-11-30', '1958-08-24', 'ps', 'Prime minister; died in office'],
      ['Hendrik Verwoerd', 'National Party', '1958-09-02', '1966-09-06', 'ps', 'Prime minister; assassinated'],
      ['B. J. Vorster', 'National Party', '1966-09-13', '1978-10-02', 'ps', 'Prime minister'],
      ['P. W. Botha', 'National Party', '1978-10-09', '1989-08-14', 'ps', 'Prime minister, then executive state president from 1984'],
      ['F. W. de Klerk', 'National Party', '1989-08-15', '1994-05-10', 'ps', 'Negotiated the end of apartheid'],
      ['Nelson Mandela', 'ANC', '1994-05-10', '1999-06-14', 'e', 'First democratic president'],
      ['Thabo Mbeki', 'ANC', '1999-06-14', '2008-09-24', 'e', 'Recalled by the ANC'],
      ['Kgalema Motlanthe', 'ANC', '2008-09-25', '2009-05-09', 'p', 'Caretaker'],
      ['Jacob Zuma', 'ANC', '2009-05-09', '2018-02-14', 'e', 'Resigned under ANC pressure'],
      ['Cyril Ramaphosa', 'ANC', '2018-02-15', null, 'p'],
    ]),
    leadersNote: 'Shows the holder of executive power: prime ministers until 1984, then executive presidents.',
    votes: [
      vote(1999, 'National Assembly', [['ANC', 'ANC', 66.4, '#15803d'], ['DA', 'Democratic Party', 9.6, '#1d4ed8'], ['IFP', 'IFP', 8.6, '#dc2626'], ['NNP', 'New National Party', 6.9, '#f97316']], { turnoutPct: 89.3 }),
      vote(2004, 'National Assembly', [['ANC', 'ANC', 69.7, '#15803d'], ['DA', 'Democratic Alliance', 12.4, '#1d4ed8'], ['IFP', 'IFP', 7.0, '#dc2626']], { turnoutPct: 76.7 }),
      vote(2009, 'National Assembly', [['ANC', 'ANC', 65.9, '#15803d'], ['DA', 'Democratic Alliance', 16.7, '#1d4ed8'], ['COPE', 'COPE', 7.4, '#eab308'], ['IFP', 'IFP', 4.6, '#dc2626']], { turnoutPct: 77.3 }),
      vote(2014, 'National Assembly', [['ANC', 'ANC', 62.2, '#15803d'], ['DA', 'Democratic Alliance', 22.2, '#1d4ed8'], ['EFF', 'EFF', 6.4, '#b91c1c'], ['IFP', 'IFP', 2.4, '#dc2626']], { turnoutPct: 73.5 }),
      vote(2019, 'National Assembly', [['ANC', 'ANC', 57.5, '#15803d'], ['DA', 'Democratic Alliance', 20.8, '#1d4ed8'], ['EFF', 'EFF', 10.8, '#b91c1c'], ['IFP', 'IFP', 3.4, '#dc2626']], { turnoutPct: 66.0 }),
      vote(2024, 'National Assembly', [['ANC', 'ANC', 40.2, '#15803d'], ['DA', 'Democratic Alliance', 21.8, '#1d4ed8'], ['MK', 'uMkhonto weSizwe', 14.6, '#111827'], ['EFF', 'EFF', 9.5, '#b91c1c'], ['IFP', 'IFP', 3.9, '#dc2626']], { turnoutPct: 58.6 }),
    ],
  },

  Kenya: {
    leaders: terms('hos', [
      ['Jomo Kenyatta', 'KANU', '1963-06-01', '1978-08-22', 'e', 'PM from 1963, president from 1964; died in office'],
      ['Daniel arap Moi', 'KANU', '1978-08-22', '2002-12-30', 's', 'One-party state 1982-91'],
      ['Mwai Kibaki', 'NARC / PNU', '2002-12-30', '2013-04-09', 'e'],
      ['Uhuru Kenyatta', 'Jubilee', '2013-04-09', '2022-09-13', 'e'],
      ['William Ruto', 'UDA', '2022-09-13', null, 'e'],
    ]),
    votes: [
      vote(1997, 'Presidential', [['KANU', 'Moi (KANU)', 40.4, '#dc2626'], ['DP', 'Kibaki (DP)', 31.1, '#1d4ed8'], ['ODM', 'Raila Odinga (NDP)', 10.8, '#f97316']], { contested: true }),
      vote(2002, 'Presidential', [['DP', 'Kibaki (NARC)', 62.2, '#1d4ed8'], ['KANU', 'Uhuru Kenyatta (KANU)', 31.3, '#dc2626']], { turnoutPct: 57.2 }),
      vote(2007, 'Presidential', [['DP', 'Kibaki (PNU)', 46.4, '#1d4ed8'], ['ODM', 'Raila Odinga (ODM)', 44.1, '#f97316'], ['ODMK', 'Musyoka (ODM-K)', 8.9, '#06b6d4']], { turnoutPct: 69.1, contested: true }),
      vote(2013, 'Presidential', [['JUB', 'Uhuru Kenyatta (Jubilee)', 50.5, '#dc2626'], ['ODM', 'Raila Odinga (CORD)', 43.7, '#f97316']], { turnoutPct: 86.0 }),
      vote(2017, 'Presidential (August, annulled)', [['JUB', 'Uhuru Kenyatta (Jubilee)', 54.2, '#dc2626'], ['ODM', 'Raila Odinga (NASA)', 44.9, '#f97316']], { turnoutPct: 78.9, contested: true }),
      vote(2022, 'Presidential', [['UDA', 'Ruto (Kenya Kwanza)', 50.5, '#eab308'], ['ODM', 'Raila Odinga (Azimio)', 48.8, '#f97316']], { turnoutPct: 64.8 }),
    ],
    votesNote: 'The Supreme Court annulled the August 2017 result; the October re-run, boycotted by the opposition, gave Kenyatta 98%.',
  },

  Ethiopia: {
    leaders: terms('hog', [
      ['Haile Selassie', 'Solomonic dynasty', '1930-11-02', '1974-09-12', 'h', 'Emperor; deposed by the Derg'],
      ['Aman Andom', 'Derg', '1974-09-12', '1974-11-23', 'c', 'Killed'],
      ['Tafari Benti', 'Derg', '1974-11-28', '1977-02-03', 'c', 'Killed'],
      ['Mengistu Haile Mariam', 'Derg / WPE', '1977-02-11', '1991-05-21', 'c', 'Red Terror; fled as rebels advanced'],
      ['Meles Zenawi', 'EPRDF (TPLF)', '1991-05-28', '2012-08-20', 'c', 'Rebel victory; president 1991-95, then PM; died in office'],
      ['Hailemariam Desalegn', 'EPRDF', '2012-08-20', '2018-04-02', 'ps', 'Resigned amid protests'],
      ['Abiy Ahmed', 'Prosperity Party', '2018-04-02', null, 'ps', 'Nobel Peace Prize 2019'],
    ]),
    leadersNote: 'Shows the effective ruler: the emperor, then the Derg chairmen, then prime ministers.',
    votes: [
      vote(2000, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'EPRDF', 87.9, '#dc2626']], { contested: true }),
      vote(2005, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'EPRDF', 59.8, '#dc2626'], ['CUD', 'CUD', 19.9, '#1d4ed8'], ['UEDF', 'UEDF', 9.5, '#16a34a']], { contested: true }),
      vote(2010, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'EPRDF and allies', 99.6, '#dc2626']], { contested: true }),
      vote(2015, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'EPRDF and allies', 100.0, '#dc2626']], { contested: true }),
      vote(2021, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'Prosperity Party', 94.0, '#eab308'], ['NAMA', 'NaMA', 1.2, '#1d4ed8'], ['EZEMA', 'EZEMA', 0.9, '#16a34a']], { contested: true }),
      vote(2026, 'House of Peoples\' Representatives (seat share)', [['EPRDF', 'Prosperity Party', 87.4, '#eab308']], { contested: true }),
    ],
    votesNote: 'Seat shares; the Prosperity Party replaced the EPRDF in 2019. The 2005 opposition surge was followed by a crackdown, and the 2021 and 2026 votes were not held in Tigray.',
  },

  Ghana: {
    leaders: terms('hos', [
      ['Kwame Nkrumah', 'CPP', '1957-03-06', '1966-02-24', 'e', 'PM, then president from 1960; overthrown'],
      ['Joseph Ankrah', 'Military (NLC)', '1966-02-24', '1969-04-02', 'c'],
      ['Akwasi Afrifa', 'Military (NLC)', '1969-04-02', '1969-10-03', 'c'],
      ['Kofi Busia', 'Progress Party', '1969-10-03', '1972-01-13', 'e', 'Prime minister'],
      ['Ignatius Kutu Acheampong', 'Military', '1972-01-13', '1978-07-05', 'c'],
      ['Fred Akuffo', 'Military', '1978-07-05', '1979-06-04', 'c'],
      ['Jerry Rawlings', 'AFRC', '1979-06-04', '1979-09-24', 'c', 'Handed power to an elected government'],
      ['Hilla Limann', 'PNP', '1979-09-24', '1981-12-31', 'e'],
      ['Jerry Rawlings', 'PNDC / NDC', '1981-12-31', '2001-01-07', 'c', 'Coup, then elected 1992 and 1996'],
      ['John Kufuor', 'NPP', '2001-01-07', '2009-01-07', 'e'],
      ['John Atta Mills', 'NDC', '2009-01-07', '2012-07-24', 'e', 'Died in office'],
      ['John Dramani Mahama', 'NDC', '2012-07-24', '2017-01-07', 's'],
      ['Nana Akufo-Addo', 'NPP', '2017-01-07', '2025-01-07', 'e'],
      ['John Dramani Mahama', 'NDC', '2025-01-07', null, 'e'],
    ]),
    votes: [
      vote(2004, 'Presidential', [['NPP', 'Kufuor (NPP)', 52.5, NPP], ['NDC', 'Mills (NDC)', 44.6, NDC]], { turnoutPct: 85.1 }),
      vote(2008, 'Presidential (first round)', [['NPP', 'Akufo-Addo (NPP)', 49.1, NPP], ['NDC', 'Mills (NDC)', 47.9, NDC]], { turnoutPct: 69.5 }),
      vote(2012, 'Presidential', [['NDC', 'Mahama (NDC)', 50.7, NDC], ['NPP', 'Akufo-Addo (NPP)', 47.7, NPP]], { turnoutPct: 79.4 }),
      vote(2016, 'Presidential', [['NPP', 'Akufo-Addo (NPP)', 53.9, NPP], ['NDC', 'Mahama (NDC)', 44.5, NDC]], { turnoutPct: 68.6 }),
      vote(2020, 'Presidential', [['NPP', 'Akufo-Addo (NPP)', 51.3, NPP], ['NDC', 'Mahama (NDC)', 47.4, NDC]], { turnoutPct: 79.0 }),
      vote(2024, 'Presidential', [['NDC', 'Mahama (NDC)', 56.6, NDC], ['NPP', 'Bawumia (NPP)', 41.6, NPP]], { turnoutPct: 60.9 }),
    ],
  },
};
