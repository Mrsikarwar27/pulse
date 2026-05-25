export function SongSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 animate-pulse">
      <div className="w-12 h-12 bg-[#1d1d1f] rounded-md" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#1d1d1f] rounded w-3/4" />
        <div className="h-3 bg-[#1d1d1f] rounded w-1/2" />
      </div>
    </div>
  )
}

export function AlbumSkeleton() {
  return (
    <div className="bg-[#1d1d1f] rounded-xl p-4 animate-pulse">
      <div className="aspect-square rounded-lg bg-[#2d2d2f] mb-4" />
      <div className="h-4 bg-[#2d2d2f] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#2d2d2f] rounded w-1/2" />
    </div>
  )
}

export function SearchSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-3 rounded-xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="aspect-square rounded-xl bg-[#2d2d2f] mb-3" />
          <div className="h-3.5 bg-[#2d2d2f] rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-[#2d2d2f] rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 bg-[#1d1d1f] rounded w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <AlbumSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}