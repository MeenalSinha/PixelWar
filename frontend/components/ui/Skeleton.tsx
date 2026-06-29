export default function Skeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-300/60 rounded" style={{ width: `${80 - i * 10}%` }} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
