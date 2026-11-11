/** Placeholder that reserves the grid's space while the client-side filters hydrate. */
export function ShopSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 border border-line bg-white sm:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[4/5] border-b border-r border-line bg-mist" />
      ))}
    </div>
  );
}
