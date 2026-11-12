import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const revalidate = 3600;

export const metadata: Metadata = withOgImage('/ai-ledger', {
  title: 'AI Ledger | Global Economic Indicators',
  description:
    'Frontier AI compute, model releases, chip capacity, private investment, energy footprint, talent flows, regulation and an interactive network of the ~60 companies that power AI, from ASML and TSMC to Nvidia, OpenAI and Anthropic. Live World Bank + curated Stanford AI Index and Epoch AI data.',
  keywords:
    'AI, artificial intelligence, LLM, GPT, Claude, Gemini, DeepSeek, TSMC, Nvidia, ASML, SK hynix, Micron, OpenAI, Anthropic, Microsoft, Google, Amazon, AI supply chain, AI power network, fab capacity, AI investment, AI regulation, EU AI Act, Stanford AI Index, Epoch AI',
  alternates: { canonical: '/ai-ledger' },
  openGraph: {
    type: 'article',
    title: 'The AI Ledger — compute, capital, chips, code, and control',
    description:
      'Nine chapters on the global AI landscape: notable models, frontier releases, patents, fab capacity, private investment, energy, talent flows, regulation and the network of companies that power AI.',
  },
});

export default function AiLedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
