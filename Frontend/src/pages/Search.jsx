import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, RefreshCw, X, Play } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { searchSongsWithAbort } from '../services/youtube'
import useDebounce from '../hooks/useDebounce'
import SongCard from '../components/ui/SongCard'
import ArtistCard from '../components/ui/ArtistCard'
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
  const [error, setError] = useState(null)
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
    setError(null)
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
      setResults([])
      setError(error.message || 'Search failed. Please try again.')
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
    setError(null)
  }

  // Artists derived from real results only
  const resultArtists = useMemo(() => {
    const seen = new Map()
    results.forEach((song) => {
      const name = song.channel_name
      if (name && !seen.has(name.toLowerCase())) {
        seen.set(name.toLowerCase(), {
          id: song.video_id || song.id,
          name,
          image: song.thumbnail,
        })
      }
    })
    return [...seen.values()].slice(0, 10)
  }, [results])

  const topResult = results.length > 0 ? results[0] : null

  return (
    <div className="space-y-10">
      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a1a1a6] pointer-events-none" />
        <input
          type="text"
          placeholder="Search songs, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-12 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.1] rounded-full pl-12 pr-12 text-white placeholder-[#6e6e73] focus:outline-none focus:ring-1 focus:ring-white/20 text-[15px] transition-colors"
          autoFocus
        />
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#a1a1a6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full" aria-label="Clear search">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-[20px] sm:text-[22px] font-bold text-white truncate">Results for "{query}"</h2>
              </div>
              <SearchSkeleton count={10} />
              {slowLoading && (
                <p className="text-center text-[#a1a1a6] text-sm py-2">Still loading...</p>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <h2 className="text-[20px] font-bold text-white mb-2">Unable to load music right now</h2>
              <p className="text-[#a1a1a6] text-sm mb-6">{error}</p>
              <button
                onClick={() => doSearch(query)}
                className="px-6 py-2.5 rounded-full bg-white text-black text-[13px] font-semibold hover:scale-105 active:scale-95 transition-transform"
              >
                Retry
              </button>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Top result */}
              {topResult && (
                <section>
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-white mb-4">Top result</h2>
                  <div
                    onClick={() => playSong(topResult, results)}
                    className="max-w-3xl rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors p-4 sm:p-5 flex items-center gap-4 sm:gap-5 cursor-pointer group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white/[0.06] flex-shrink-0">
                      {topResult.thumbnail ? (
                        <img src={topResult.thumbnail} alt={topResult.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2d2d2f] to-[#1d1d1f]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#a1a1a6] uppercase tracking-wider mb-1">Song</p>
                      <h3 className="text-[22px] sm:text-[32px] font-bold text-white truncate leading-tight">{topResult.title}</h3>
                      <p className="text-[13px] sm:text-[14px] text-[#a1a1a6] truncate mt-1">{topResult.channel_name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); playSong(topResult, results) }}
                      aria-label="Play top result"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
                    >
                      <Play size={22} fill="black" className="ml-0.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* Songs */}
              <section>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-white mb-4">Songs</h2>
                <div className="max-w-3xl">
                  {results.map((song, i) => (
                    <SongCard key={song.id} song={song} index={i} variant="row" onPlay={(s) => playSong(s, results)} />
                  ))}
                </div>
              </section>

              {/* Artists - only when real artist data exists */}
              {resultArtists.length > 0 && (
                <section>
                  <h2 className="text-[20px] sm:text-[22px] font-bold text-white mb-4">Artists</h2>
                  <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-2 no-scrollbar">
                    {resultArtists.map((artist, i) => (
                      <ArtistCard key={artist.id} artist={artist} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <SearchIcon size={40} className="mx-auto text-[#6e6e73] mb-3" />
              <p className="text-white font-medium mb-1">No results found</p>
              <p className="text-[#a1a1a6] text-sm">Try a different song or artist name.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
