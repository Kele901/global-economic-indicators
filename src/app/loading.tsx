export default function Loading() {
  return (
    <div
      className="min-h-[40vh] px-6 py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 mb-4" />
        <div className="h-4 w-80 max-w-full rounded bg-gray-200 dark:bg-gray-800 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3"
            >
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-32 w-full rounded bg-gray-100 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
