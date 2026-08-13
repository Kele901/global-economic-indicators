import GlobalInterestRateApp from './components/GlobalInterestRateApp';
import LearnBanner from './components/LearnBanner';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <LearnBanner />
      <GlobalInterestRateApp />
    </main>
  );
} 