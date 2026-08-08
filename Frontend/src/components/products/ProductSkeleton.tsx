export default function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-surface-2" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 w-1/3 bg-surface-2 rounded" />
        <div className="h-4 w-2/3 bg-surface-2 rounded" />
        <div className="h-3 w-full bg-surface-2 rounded" />
        <div className="h-3 w-4/5 bg-surface-2 rounded" />
        <div className="h-8 w-full bg-surface-2 rounded-lg mt-2" />
      </div>
    </div>
  );
}
