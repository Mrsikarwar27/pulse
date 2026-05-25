import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, RefreshCw, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { searchSongsWithAbort } from '../services/youtube'
import useDebounce from '../hooks/useDebounce'
import SongCard from '../components/ui/SongCard'
import { SearchSkeleton } from '../components/ui/Skeleton'

const genres = [
  { name: "Hindi", query: "hindi songs" },
  { name: "Punjabi", query: "punjabi songs" },
  { name: "Pop", query: "pop music" },
  { name: "Rock", query: "rock music" },
  { name: "Hip Hop", query: "hip hop songs" },
  { name: "Electronic", query: "edm music" },
  { name: "Classical", query: "classical music" },
  { name: "R&B", query: "r&b songs" },
]

export default function Search() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [slowLoading, setSlowLoading] = useState(false)
  const { playSong } = usePlayerStore()

  const debouncedQuery = useDebounce(query, 400)
  const slowTimerRef = useRef(null)

  // Auto-search when debounced query changes (min 2 chars)
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      doSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  // Auto-search if query param exists (on mount)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
    }
  }, [searchParams.get('q')])

  const doSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    setSlowLoading(false)
    clearTimeout(slowTimerRef.current)

    // Show "Still loading..." after 2s
    slowTimerRef.current = setTimeout(() => setSlowLoading(true), 2000)

    try {
      const songs = await searchSongsWithAbort(searchQuery)

      // null means request was aborted — ignore
      if (songs === null) {
        clearTimeout(slowTimerRef.current)
        setLoading(false)
        setSlowLoading(false)
        return
      }

      const playableSongs = songs.map(song => ({
        id: song.id,
        video_id: song.id,
        title: song.title,
        channel_name: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration || 180
      }))
      setResults(playableSongs)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    }

    clearTimeout(slowTimerRef.current)
    setLoading(false)
    setSlowLoading(false)
  }

  const handleSearch = () => {
    if (!query.trim()) return
    doSearch(query)
  }

  const handleGenreClick = (genre) => {
    setQuery(genre.query)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  return (
    <div className="space-y-10">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a6]" />
        <input
          type="text"
          placeholder="Search for songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-12 bg-white/[0.06] rounded-xl pl-12 pr-12 text-white placeholder-[#6e6e73] focus:outline-none focus:bg-white/[0.1] text-[15px]"
          autoFocus
        />
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#a1a1a6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full">
            <X size={16} className="text-[#a1a1a6]" />
          </button>
        )}
      </div>

      {/* Genre Cards - Show when no search */}
      {!hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-[22px] font-bold text-white mb-5">Browse Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {genres.map((genre, i) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleGenreClick(genre)}
                className="relative h-24 rounded-xl bg-gradient-to-br from-[#fc3c44]/30 to-[#ff6b6b]/30 overflow-hidden cursor-pointer group"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-[16px] font-semibold text-white">{genre.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[22px] font-bold text-white">Results for "{query}"</h2>
              </div>
              <SearchSkeleton count={10} />
              {slowLoading && (
                <p className="text-center text-[#a1a1a6] text-sm py-2">Still loading...</p>
              )}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-bold text-white">Results for "{query}"</h2>
                <button
                  onClick={() => {
                    if (results.length > 0) playSong(results[0], results)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc3c44] text-white text-[13px] font-medium"
                >
                  Play All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {results.map((song, i) => (
                  <SongCard key={song.id} song={song} index={i} onPlay={(s) => playSong(s, results)} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <SearchIcon size={40} className="mx-auto text-[#6e6e73] mb-3" />
              <p className="text-[#a1a1a6]">No songs found. Try a different search.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
