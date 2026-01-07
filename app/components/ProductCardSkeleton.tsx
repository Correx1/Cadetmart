export default function ProductCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-700"></div>
      
      <div className="p-3 space-y-1.5">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      
      <div className="px-3 pb-3">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
      </div>
    </div>
  );
}
