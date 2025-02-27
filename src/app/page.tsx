import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={37}
          priority
        />
        <div className="flex flex-col gap-4 items-center sm:items-start">
          <h1 className="text-4xl font-bold tracking-tight">
            Global Economic Indicators
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-[600px] text-center sm:text-left">
            Explore comprehensive economic data and visualizations from around the world.
          </p>
          <div className="flex gap-4 mt-4">
            <Link
              href="/currency-hierarchy"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Currency Hierarchy
            </Link>
            <a
              href="https://github.com/Kele901/global-economic-indicators"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
} 