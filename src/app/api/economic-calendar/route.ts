import { NextRequest, NextResponse } from 'next/server';

const MEETING_SCHEDULES_2025: Record<string, string[]> = {
  'Federal Reserve': [
    '2025-01-29', '2025-03-19', '2025-05-07', '2025-06-18',
    '2025-07-30', '2025-09-17', '2025-11-05', '2025-12-17'
  ],
  'ECB': [
    '2025-01-30', '2025-03-06', '2025-04-17', '2025-06-05',
    '2025-07-17', '2025-09-11', '2025-10-30', '2025-12-18'
  ],
  'Bank of Japan': [
    '2025-01-24', '2025-03-14', '2025-04-30', '2025-06-13',
    '2025-07-31', '2025-09-19', '2025-10-31', '2025-12-19'
  ],
  'Bank of England': [
    '2025-02-06', '2025-03-20', '2025-05-08', '2025-06-19',
    '2025-08-07', '2025-09-18', '2025-11-06', '2025-12-18'
  ],
  'Swiss National Bank': [
    '2025-03-20', '2025-06-19', '2025-09-18', '2025-12-11'
  ],
  'Bank of Canada': [
    '2025-01-29', '2025-03-12', '2025-04-16', '2025-06-04',
    '2025-07-30', '2025-09-03', '2025-10-29', '2025-12-10'
  ],
  'Reserve Bank of Australia': [
    '2025-02-18', '2025-04-01', '2025-05-20', '2025-07-08',
    '2025-08-12', '2025-09-30', '2025-11-04', '2025-12-09'
  ],
  'Reserve Bank of New Zealand': [
    '2025-02-19', '2025-04-09', '2025-05-28', '2025-07-09',
    '2025-08-20', '2025-10-08', '2025-11-26'
  ],
  'PBoC': [
    '2025-01-20', '2025-02-20', '2025-03-20', '2025-04-21',
    '2025-05-20', '2025-06-20', '2025-07-21', '2025-08-20',
    '2025-09-22', '2025-10-20', '2025-11-20', '2025-12-22'
  ],
  'Reserve Bank of India': [
    '2025-02-07', '2025-04-09', '2025-06-06', '2025-08-08',
    '2025-10-08', '2025-12-05'
  ],
};

const MEETING_SCHEDULES_2026: Record<string, string[]> = {
  'Federal Reserve': [
    '2026-01-28', '2026-03-18', '2026-05-06', '2026-06-17',
    '2026-07-29', '2026-09-16', '2026-11-04', '2026-12-16'
  ],
  'ECB': [
    '2026-01-22', '2026-03-05', '2026-04-16', '2026-06-04',
    '2026-07-16', '2026-09-10', '2026-10-29', '2026-12-17'
  ],
  'Bank of Japan': [
    '2026-01-23', '2026-03-13', '2026-04-28', '2026-06-12',
    '2026-07-30', '2026-09-18', '2026-10-30', '2026-12-18'
  ],
  'Bank of England': [
    '2026-02-05', '2026-03-19', '2026-05-07', '2026-06-18',
    '2026-08-06', '2026-09-17', '2026-11-05', '2026-12-17'
  ],
  'Swiss National Bank': [
    '2026-03-19', '2026-06-18', '2026-09-17', '2026-12-10'
  ],
  'Bank of Canada': [
    '2026-01-28', '2026-03-11', '2026-04-15', '2026-06-03',
    '2026-07-29', '2026-09-02', '2026-10-28', '2026-12-09'
  ],
  'Reserve Bank of Australia': [
    '2026-02-17', '2026-03-31', '2026-05-19', '2026-07-07',
    '2026-08-11', '2026-09-29', '2026-11-03', '2026-12-08'
  ],
  'Reserve Bank of New Zealand': [
    '2026-02-18', '2026-04-08', '2026-05-27', '2026-07-08',
    '2026-08-19', '2026-10-07', '2026-11-25'
  ],
  'PBoC': [
    '2026-01-20', '2026-02-20', '2026-03-20', '2026-04-20',
    '2026-05-20', '2026-06-22', '2026-07-20', '2026-08-20',
    '2026-09-21', '2026-10-20', '2026-11-20', '2026-12-21'
  ],
  'Reserve Bank of India': [
    '2026-02-06', '2026-04-08', '2026-06-05', '2026-08-07',
    '2026-10-07', '2026-12-04'
  ],
};

const CURRENCY_MAP: Record<string, string> = {
  'Federal Reserve': 'USD',
  'ECB': 'EUR',
  'Bank of Japan': 'JPY',
  'Bank of England': 'GBP',
  'Swiss National Bank': 'CHF',
  'Bank of Canada': 'CAD',
  'Reserve Bank of Australia': 'AUD',
  'Reserve Bank of New Zealand': 'NZD',
  'PBoC': 'CNY',
  'Reserve Bank of India': 'INR',
};

const TIME_MAP: Record<string, string> = {
  'Federal Reserve': '19:00',
  'ECB': '13:45',
  'Bank of Japan': '03:00',
  'Bank of England': '12:00',
  'Swiss National Bank': '08:30',
  'Bank of Canada': '14:45',
  'Reserve Bank of Australia': '03:30',
  'Reserve Bank of New Zealand': '01:00',
  'PBoC': '01:30',
  'Reserve Bank of India': '05:30',
};

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  bank: string;
  type: 'rate_decision' | 'minutes' | 'speech' | 'data_release';
}

function generateEvents(daysAhead: number = 90): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const today = new Date();
  const endDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  const allSchedules = { ...MEETING_SCHEDULES_2025, ...MEETING_SCHEDULES_2026 };
  
  for (const [bank, dates2025] of Object.entries(MEETING_SCHEDULES_2025)) {
    const dates2026 = MEETING_SCHEDULES_2026[bank] || [];
    const allDates = [...dates2025, ...dates2026];
    const currency = CURRENCY_MAP[bank];
    const time = TIME_MAP[bank] || '14:00';
    
    for (const dateStr of allDates) {
      const meetingDate = new Date(dateStr);
      
      if (meetingDate >= today && meetingDate <= endDate) {
        events.push({
          id: `${bank.replace(/\s+/g, '-').toLowerCase()}-${dateStr}`,
          date: dateStr,
          time,
          currency,
          event: `${bank} Interest Rate Decision`,
          importance: 'high',
          bank,
          type: 'rate_decision'
        });
        
        const minutesDate = new Date(meetingDate.getTime() + 21 * 24 * 60 * 60 * 1000);
        if (minutesDate <= endDate) {
          events.push({
            id: `${bank.replace(/\s+/g, '-').toLowerCase()}-minutes-${dateStr}`,
            date: minutesDate.toISOString().split('T')[0],
            time: '14:00',
            currency,
            event: `${bank} Meeting Minutes`,
            importance: 'medium',
            bank,
            type: 'minutes'
          });
        }
      }
    }
  }
  
  events.sort((a, b) => a.date.localeCompare(b.date));
  
  return events;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get('currency');
    const days = parseInt(searchParams.get('days') || '90');
    const type = searchParams.get('type');
    
    let events = generateEvents(days);
    
    if (currency) {
      events = events.filter(e => e.currency === currency.toUpperCase());
    }
    
    if (type) {
      events = events.filter(e => e.type === type);
    }
    
    return NextResponse.json({
      events,
      count: events.length,
      generatedAt: new Date().toISOString(),
      note: 'Meeting schedules are based on official central bank calendars for 2025-2026'
    });
    
  } catch (error: any) {
    console.error('Economic calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate economic calendar', details: error.message },
      { status: 500 }
    );
  }
}
