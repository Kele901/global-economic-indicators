import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn | A Beginner\u2019s Guide to the Global Economy (Ages 13+)',
  description:
    'A friendly 15-lesson starter course for teens on money, prices, jobs, debt, trade, climate, defense, resources and AI. Interactive demos, quizzes and a printable certificate.',
  keywords:
    'economics for teens, beginner economics, learn economics, inflation for kids, GDP explained, interest rates for beginners, teen finance, student certificate',
  alternates: { canonical: '/learn' },
  openGraph: {
    type: 'article',
    title: 'Learn: A Beginner\u2019s Guide to the Global Economy (Ages 13+)',
    description:
      'Fifteen bite-sized lessons across four modules with interactive demos, quizzes and a printable certificate.',
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
