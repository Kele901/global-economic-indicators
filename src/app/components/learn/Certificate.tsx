'use client';

// Printable certificate. Renders an SVG with the student's name
// (prompts for it if not set) plus completion date. The "Print"
// button triggers window.print(). Print-specific styling in globals
// (or via inline `@media print` here) hides everything except the
// certificate itself.

import { useState } from 'react';
import { TOTAL_LESSONS } from '../../learn/lessons';

interface Props {
  isDarkMode: boolean;
  studentName?: string;
  completionDate: string; // ISO
  onSetName: (name: string) => void;
}

export default function Certificate({ isDarkMode, studentName, completionDate, onSetName }: Props) {
  const [nameInput, setNameInput] = useState(studentName ?? '');

  const bg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const dateStr = new Date(completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = (studentName && studentName.trim().length > 0)
    ? studentName
    : 'Your name here';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) onSetName(nameInput.trim());
  };

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${bg}`}>
      <div className="flex items-baseline justify-between mb-4 print:hidden">
        <div>
          <div className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>Course Complete</div>
          <h2 className={`text-2xl font-bold ${text}`}>🏆 Your certificate</h2>
        </div>
        <button
          onClick={() => window.print()}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          Print certificate
        </button>
      </div>

      {(!studentName || studentName.trim().length === 0) && (
        <form onSubmit={handleSave} className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
          <label htmlFor="student-name" className={`text-sm ${muted}`}>Add your name:</label>
          <input
            id="student-name"
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="e.g. Ada Lovelace"
            className={`text-sm px-3 py-1.5 rounded-md border w-56 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
            maxLength={60}
          />
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Save name
          </button>
        </form>
      )}

      {/* Certificate itself — targeted by @media print CSS */}
      <div className="print-target rounded-xl overflow-hidden">
        <svg
          viewBox="0 0 800 560"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`Certificate of completion for ${displayName}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="bg-grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#fefce8" />
              <stop offset="1" stopColor="#fef3c7" />
            </linearGradient>
            <linearGradient id="border-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="800" height="560" fill="url(#bg-grad)" />
          <rect x="16" y="16" width="768" height="528" fill="none" stroke="url(#border-grad)" strokeWidth="6" rx="12" />
          <rect x="30" y="30" width="740" height="500" fill="none" stroke="#f59e0b" strokeWidth="1" rx="6" />
          <text x="400" y="120" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fill="#92400e" letterSpacing="6">
            CERTIFICATE OF COMPLETION
          </text>
          <text x="400" y="170" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill="#78350f">
            This is proudly presented to
          </text>
          <text x="400" y="250" textAnchor="middle" fontFamily="Georgia, serif" fontSize="46" fontWeight="bold" fill="#1f2937">
            {displayName}
          </text>
          <line x1="220" y1="270" x2="580" y2="270" stroke="#d97706" strokeWidth="1" />
          <text x="400" y="315" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fill="#374151">
            for successfully completing the {TOTAL_LESSONS}-lesson course
          </text>
          <text x="400" y="345" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill="#111827">
            &ldquo;A Beginner&apos;s Guide to the Global Economy&rdquo;
          </text>
          <text x="400" y="380" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#6b7280">
            covering money, prices, trade, debt, climate, defense, resources and AI.
          </text>
          <text x="400" y="450" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" fill="#78350f" letterSpacing="4">
            AWARDED {dateStr.toUpperCase()}
          </text>
          <text x="400" y="500" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fill="#92400e">
            globaleconindicators.info · Learn
          </text>
          {/* Seal */}
          <circle cx="700" cy="470" r="38" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
          <text x="700" y="466" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="bold" fill="#78350f">CERTIFIED</text>
          <text x="700" y="482" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="#78350f">LEARNER</text>
        </svg>
      </div>

      <p className={`mt-3 text-xs ${muted} print:hidden`}>
        Print or save as PDF. You can share it with a teacher or keep it for yourself.
      </p>

      {/* Print styles — hide everything except .print-target's ancestors */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-target, .print-target * { visibility: visible !important; }
          .print-target { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
