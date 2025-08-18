import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Go back
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Available pages:</p>
          <div className="mt-2 space-y-1">
            <Link href="/" className="block text-blue-600 hover:underline">Home</Link>
            <Link href="/compare" className="block text-blue-600 hover:underline">Compare Countries</Link>
            <Link href="/currency-hierarchy" className="block text-blue-600 hover:underline">Currency Hierarchy</Link>
            <Link href="/economic-gravity" className="block text-blue-600 hover:underline">Economic Gravity</Link>
            <Link href="/inflation" className="block text-blue-600 hover:underline">Inflation Analysis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
