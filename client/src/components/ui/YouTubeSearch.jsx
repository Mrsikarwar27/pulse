import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, X, Music2 } from 'lucide-react'
import { searchSongsWithAbort } from '../../services/youtube'
import { usePlayerStore } from '../../store/playerStore'
import useDebounce from '../../hooks/useDebounce'

export default function YouTubeSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      setLoading(false)
      setSlowLoading(false)
    }
  }, [isOpen])

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

  const handlePlaySong = (song) => {
    playSong(song, results)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#1d1d1f] rounded-2xl border border-white/[0.1] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.1]">
          <h2 className="text-[18px] font-semibold text-white">Search YouTube</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} className="text-[#a1a1a6]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a6]" />
            <input
              type="text"
              placeholder="Search for a song..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-12 bg-white/[0.06] rounded-xl pl-12 pr-10 text-white placeholder-[#6e6e73] focus:outline-none focus:bg-white/[0.1]"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#a1a1a6] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-12 h-12 rounded-lg bg-[#2d2d2f]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#2d2d2f] rounded w-3/4" />
                    <div className="h-3 bg-[#2d2d2f] rounded w-1/2" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2d2d2f]" />
                </div>
              ))}
              {slowLoading && (
                <p className="text-center text-[#a1a1a6] text-sm py-3">Still loading...</p>
              )}
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="text-center py-12">
              <Music2 size={40} className="mx-auto text-[#6e6e73] mb-3" />
              <p className="text-[#a1a1a6]">No songs found</p>
            </div>
          )}

          {!loading && results.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handlePlaySong(song)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] cursor-pointer transition-colors"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white font-medium truncate">{song.title}</p>
                <p className="text-[12px] text-[#a1a1a6] truncate">{song.channel_name}</p>
              </div>
              <button className="p-2 rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c]">
                <Play size={14} fill="white" className="text-white" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
