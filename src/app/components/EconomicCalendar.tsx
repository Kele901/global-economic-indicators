'use client';

import React, { useState, useMemo } from 'react';
import {
  ECONOMIC_CALENDAR,
  getUpcomingEvents,
  type CurrencyCode,
  type EventImportance,
  type EconomicEvent
} from '../data/currencyHierarchyData';

interface EconomicCalendarProps {
  isDarkMode: boolean;
}

const IMPORTANCE_STYLES: Record<EventImportance, { label: string; color: string; bgColor: string; dot: string }> = {
  high: {
    label: 'High Impact',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    dot: 'bg-red-500'
  },
  medium: {
    label: 'Medium Impact',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500'
  },
  low: {
    label: 'Low Impact',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    dot: 'bg-blue-500'
  }
};

const IMPORTANCE_STYLES_DARK: Record<EventImportance, { color: string; bgColor: string; dot: string }> = {
  high: { color: 'text-red-400', bgColor: 'bg-red-900/30 border-red-700', dot: 'bg-red-500' },
  medium: { color: 'text-amber-400', bgColor: 'bg-amber-900/30 border-amber-700', dot: 'bg-amber-500' },
  low: { color: 'text-blue-400', bgColor: 'bg-blue-900/30 border-blue-700', dot: 'bg-blue-500' }
};

const CURRENCY_FLAGS: Partial<Record<CurrencyCode, string>> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  JPY: '🇯🇵',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  NZD: '🇳🇿',
  CNY: '🇨🇳',
  SEK: '🇸🇪',
  NOK: '🇳🇴',
  MXN: '🇲🇽',
  BRL: '🇧🇷',
  INR: '🇮🇳',
  ZAR: '🇿🇦',
  TRY: '🇹🇷',
  RUB: '🇷🇺'
};

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ isDarkMode }) => {
  const [filterCurrency, setFilterCurrency] = useState<CurrencyCode | 'all'>('all');
  const [filterImportance, setFilterImportance] = useState<EventImportance | 'all'>('all');
  const [viewDays, setViewDays] = useState<number>(30);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const filteredEvents = useMemo(() => {
    let events = getUpcomingEvents(
      filterCurrency === 'all' ? undefined : filterCurrency,
      viewDays
    );
    
    if (filterImportance !== 'all') {
      events = events.filter(e => e.importance === filterImportance);
    }
    
    return events;
  }, [filterCurrency, filterImportance, viewDays]);

  const eventsByCurrency = useMemo(() => {
    const counts: Partial<Record<CurrencyCode, number>> = {};
    ECONOMIC_CALENDAR.forEach(event => {
      counts[event.currency] = (counts[event.currency] || 0) + 1;
    });
    return counts;
  }, []);

  const availableCurrencies = useMemo(() => {
    return Object.keys(eventsByCurrency) as CurrencyCode[];
  }, [eventsByCurrency]);

  const getImportanceStyle = (importance: EventImportance) => {
    return isDarkMode ? IMPORTANCE_STYLES_DARK[importance] : IMPORTANCE_STYLES[importance];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [date: string]: EconomicEvent[] } = {};
    filteredEvents.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Economic Calendar
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Upcoming central bank meetings and key economic data releases
        </p>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Time Period */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              TIME PERIOD
            </h4>
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setViewDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    viewDays === days
                      ? isDarkMode
                        ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Currency Filter */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              FILTER BY CURRENCY
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCurrency('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filterCurrency === 'all'
                    ? isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                All Currencies
              </button>
              {availableCurrencies.map(currency => (
                <button
                  key={currency}
                  onClick={() => setFilterCurrency(currency)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterCurrency === currency
                      ? isDarkMode
                        ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {CURRENCY_FLAGS[currency]} {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Importance Filter */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              FILTER BY IMPORTANCE
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterImportance('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  filterImportance === 'all'
                    ? isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                All Levels
              </button>
              {(['high', 'medium', 'low'] as EventImportance[]).map(imp => {
                const style = getImportanceStyle(imp);
                return (
                  <button
                    key={imp}
                    onClick={() => setFilterImportance(imp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      filterImportance === imp
                        ? `${style.bgColor} ${style.color}`
                        : isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    {IMPORTANCE_STYLES[imp].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className={`text-center py-8 ${themeColors.textSecondary}`}>
            No events found for the selected filters
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(eventsByDate).map(([date, events]) => {
              const daysUntil = getDaysUntil(date);
              const isUrgent = daysUntil <= 2;
              
              return (
                <div key={date}>
                  {/* Date Header */}
                  <div className={`flex items-center gap-2 mb-2 sticky top-0 py-1 ${
                    isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
                  } backdrop-blur-sm`}>
                    <span className={`text-sm font-semibold ${
                      isUrgent
                        ? isDarkMode ? 'text-red-400' : 'text-red-600'
                        : themeColors.text
                    }`}>
                      {formatDate(date)}
                    </span>
                    <span className={`text-xs ${themeColors.textTertiary}`}>
                      {daysUntil === 0
                        ? 'Today'
                        : daysUntil === 1
                          ? 'Tomorrow'
                          : `in ${daysUntil} days`
                      }
                    </span>
                    <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>
                  
                  {/* Events for this date */}
                  <div className="space-y-2">
                    {events.map(event => {
                      const style = getImportanceStyle(event.importance);
                      
                      return (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                <span className={`text-sm font-medium ${themeColors.text}`}>
                                  {event.event}
                                </span>
                              </div>
                              <p className={`text-xs ${themeColors.textSecondary} mb-2`}>
                                {event.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className={`px-2 py-0.5 rounded ${style.bgColor} ${style.color} border`}>
                                  {IMPORTANCE_STYLES[event.importance].label}
                                </span>
                                <span className={themeColors.textTertiary}>
                                  {event.time}
                                </span>
                                {event.forecast && (
                                  <span className={themeColors.textTertiary}>
                                    Forecast: <span className={themeColors.text}>{event.forecast}</span>
                                  </span>
                                )}
                                {event.previous && (
                                  <span className={themeColors.textTertiary}>
                                    Previous: <span className={themeColors.text}>{event.previous}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl">
                                {CURRENCY_FLAGS[event.currency] || '🌐'}
                              </div>
                              <div className={`text-xs font-medium ${themeColors.text}`}>
                                {event.currency}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
            Calendar Summary
          </h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className={themeColors.textTertiary}>Total Events:</span>{' '}
              <span className={themeColors.text}>{filteredEvents.length}</span>
            </div>
            <div>
              <span className={themeColors.textTertiary}>High Impact:</span>{' '}
              <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                {filteredEvents.filter(e => e.importance === 'high').length}
              </span>
            </div>
            <div>
              <span className={themeColors.textTertiary}>Next Event:</span>{' '}
              <span className={themeColors.text}>
                {filteredEvents.length > 0 
                  ? `${filteredEvents[0].event} (${formatDate(filteredEvents[0].date)})`
                  : 'None'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendar;
