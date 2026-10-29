'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ThemeToggle from '../../components/ThemeToggle';
import Breadcrumbs from '../../components/Breadcrumbs';
import DataQualityBadge from '../../components/DataQualityBadge';
import SocialShareMenu from '../../components/SocialShareMenu';
import { COUNTRY_FLAGS } from '../../components/CountryFlag';
import {
  ANSWER_LABELS,
  POLITICS_BY_KEY,
  POLITICS_PROFILES,
  QUIZ_STATEMENTS,
  REGIME_LABELS,
  decodeAnswers,
  emptyAnswers,
  encodeAnswers,
  getEffectiveLeader,
  nearestParties,
  quadrantLabel,
  scoreAnswers,
  type Answer,
  type Answers,
  type PartyMatch,
} from '../../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG } from '../../utils/countryMappings';

const GovernmentCompassChart = dynamic(() => import('../../components/GovernmentCompassChart'), { ssr: false });

const MIN_ANSWERS = 6;

export default function PoliticalMatchPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [answers, setAnswers, hydrated] = useLocalStorage<Answers>('politics-match-answers', emptyAnswers());
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const fromUrl = decodeAnswers(new URLSearchParams(window.location.search).get('a'));
    if (fromUrl) {
      setAnswers(fromUrl);
      setShared(true);
    }
  }, [hydrated, setAnswers]);

  const answered = answers.filter((a) => a !== null).length;
  const ready = answered >= MIN_ANSWERS;
  const point = useMemo(() => scoreAnswers(answers), [answers]);
  const parties = useMemo(() => (ready ? nearestParties(point, POLITICS_PROFILES, { limit: 10 }) : []), [point, ready]);
  const governing = useMemo(() => (ready ? nearestParties(point, POLITICS_PROFILES, { limit: 6, governingOnly: true }) : []), [point, ready]);
  const highlight = useMemo(() => [...new Set(governing.map((m) => m.key))], [governing]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/politics-ledger/match?a=${encodeAnswers(answers)}` : '';

  const setAnswer = (i: number, a: Answer) => {
    setShared(false);
    setAnswers((cur) => {
      const next = [...cur];
      while (next.length < QUIZ_STATEMENTS.length) next.push(null);
      next[i] = next[i] === a ? null : a;
      return next;
    });
  };

  const reset = () => {
    setAnswers(emptyAnswers());
    setShared(false);
    if (window.location.search) window.history.replaceState(null, '', '/politics-ledger/match');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', shareUrl);
    }
  };

  const pageBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const link = isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700';

  const MatchRow = ({ m, rank }: { m: PartyMatch; rank: number }) => {
    const Flag = COUNTRY_FLAGS[m.key];
    const p = POLITICS_BY_KEY[m.key];
    return (
      <li className={`flex items-center gap-3 py-2 border-t first:border-t-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <span className={`w-5 text-right text-xs tabular-nums ${textMuted}`}>{rank}</span>
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.party.color }} />
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium truncate ${textPrimary}`}>
            {m.party.name} <span className={textMuted}>({m.party.abbr})</span>
          </div>
          <div className={`text-xs truncate ${textSec}`}>
            <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[m.key]}`} className="inline-flex items-center gap-1 hover:underline">
              {Flag && <Flag className="w-4 h-3 rounded-sm" />}
              {COUNTRY_DISPLAY_NAMES[m.key]}
            </Link>
            {' \u00b7 '}{m.party.ideology.slice(0, 2).join(', ')}
            {(m.party.role === 'governing' || m.party.role === 'coalition') && p && ` \u00b7 in government under ${getEffectiveLeader(p).name}`}
          </div>
        </div>
        <span className={`text-xs tabular-nums ${textSec}`} title="Distance on the -5 to +5 compass">{m.distance.toFixed(2)}</span>
      </li>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>The Politics Ledger</div>
            <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${textPrimary}`}>Find Your Political Match</h1>
            <p className={`text-base max-w-3xl ${textSec}`}>
              Twelve statements on the economy and society. Your answers place you on the same ideological map as the parties and governments of
              47 countries, so you can see which ones you are closest to, at home and abroad.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <ThemeToggle isDarkMode={isDarkMode} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <DataQualityBadge flag="estimate" isDarkMode={isDarkMode} />
          <span className={`text-[11px] ${textMuted}`}>
            Party placements and statement weights are editorial estimates. This is a conversation starter, not a voting advice application.
          </span>
        </div>

        {shared && (
          <div className={`mb-4 rounded-md border px-3 py-2 text-xs ${isDarkMode ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-800'}`}>
            You are viewing shared answers. Change any answer to make them your own, or{' '}
            <button type="button" onClick={reset} className="underline">start over</button>.
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ol className="space-y-3">
              {QUIZ_STATEMENTS.map((q, i) => (
                <li key={q.id} className={`rounded-lg border p-4 ${cardBg}`}>
                  <div className={`text-sm font-medium mb-3 ${textPrimary}`}>
                    <span className={`mr-2 tabular-nums ${textMuted}`}>{i + 1}.</span>
                    {q.text}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={q.text}>
                    {ANSWER_LABELS.map((opt) => {
                      const active = answers[i] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setAnswer(i, opt.value)}
                          className={`px-1 py-1.5 rounded-md text-[11px] leading-tight border transition-colors ${
                            active
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className={`rounded-lg border p-4 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Your position</div>
                  <span className={`text-xs tabular-nums ${textSec}`}>{answered}/{QUIZ_STATEMENTS.length} answered</span>
                </div>
                <div className={`h-1.5 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(answered / QUIZ_STATEMENTS.length) * 100}%` }} />
                </div>
                {ready ? (
                  <>
                    <div className={`text-xl font-bold ${textPrimary}`}>{quadrantLabel(point)}</div>
                    <div className={`text-xs tabular-nums ${textSec}`}>Economic {point.econ.toFixed(1)} {'\u00b7'} Social {point.social.toFixed(1)} (each -5 to +5)</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button type="button" onClick={copy} className={`text-xs px-2.5 py-1 rounded-md border ${isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        {copied ? 'Link copied' : 'Copy result link'}
                      </button>
                      <SocialShareMenu title={`My political match: ${quadrantLabel(point)}`} url={shareUrl} isDarkMode={isDarkMode} subject="page" />
                      <button type="button" onClick={reset} className={`text-xs px-2.5 py-1 rounded-md ${link}`}>Reset</button>
                    </div>
                  </>
                ) : (
                  <p className={`text-sm ${textSec}`}>Answer at least {MIN_ANSWERS} statements to see your position and matches.</p>
                )}
              </div>

              {ready && (
                <div className={`rounded-lg border p-4 ${cardBg}`}>
                  <GovernmentCompassChart isDarkMode={isDarkMode} height={340} userPoint={{ ...point, label: 'You' }} highlight={highlight} />
                </div>
              )}
            </div>
          </div>
        </div>

        {ready && (
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <h2 className={`text-base font-semibold mb-1 ${textPrimary}`}>Your 10 nearest parties</h2>
              <p className={`text-xs mb-2 ${textSec}`}>Across all 47 countries, ranked by distance on the compass.</p>
              <ul>{parties.map((m, i) => <MatchRow key={`${m.key}-${m.party.abbr}`} m={m} rank={i + 1} />)}</ul>
            </div>
            <div className={`rounded-lg border p-4 ${cardBg}`}>
              <h2 className={`text-base font-semibold mb-1 ${textPrimary}`}>Nearest parties in government</h2>
              <p className={`text-xs mb-2 ${textSec}`}>The governing or coalition parties closest to you; their countries are highlighted on the map.</p>
              <ul>{governing.map((m, i) => <MatchRow key={`${m.key}-${m.party.abbr}`} m={m} rank={i + 1} />)}</ul>
              {governing[0] && POLITICS_BY_KEY[governing[0].key] && (
                <p className={`text-xs mt-3 ${textSec}`}>
                  Closest government: <span className={textPrimary}>{COUNTRY_DISPLAY_NAMES[governing[0].key]}</span>, a{' '}
                  {REGIME_LABELS[POLITICS_BY_KEY[governing[0].key]!.system.regime].toLowerCase()}.
                </p>
              )}
            </div>
          </div>
        )}

        <div className={`text-xs mt-10 pt-6 border-t space-y-2 ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          <p>
            How it works: each statement moves you along the economic axis (state-led to market) and the social axis (liberal to authoritarian).
            Your answers are averaged and scaled to the same -5 to +5 range as the party placements, and parties are ranked by straight-line distance.
            Skipped statements are ignored. Your answers are stored only in this browser.
          </p>
          <p>
            <Link href="/politics-ledger" className={`underline underline-offset-2 ${link}`}>Back to the Politics Ledger</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
