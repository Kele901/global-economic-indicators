import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn | A Beginner\u2019s Guide to the Global Economy (Ages 13+)',
  description:
    'A friendly 23-lesson starter course for teens on money, banking, prices, jobs, the business cycle, taxes, debt, trade, climate, energy, health, defense, AI and how to read data critically. Interactive demos, quizzes and a printable certificate.',
  keywords:
    'economics for teens, beginner economics, learn economics, inflation for kids, GDP explained, interest rates for beginners, how banks work, business cycle explained, correlation vs causation, data literacy, teen finance, student certificate',
  alternates: { canonical: '/learn' },
  openGraph: {
    type: 'article',
    title: 'Learn: A Beginner\u2019s Guide to the Global Economy (Ages 13+)',
    description:
      'Twenty-three bite-sized lessons across five modules with interactive demos, quizzes and a printable certificate.',
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
