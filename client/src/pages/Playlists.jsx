import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Music2, Play, X } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { searchSongs } from '../services/youtube'
import YouTubeSearch from '../components/ui/YouTubeSearch'

const defaultPlaylists = [
  { id: 'liked', name: "Liked Songs", description: "Songs you liked from YouTube", songs: 0 },
  { id: 'recent', name: "Recently Played", description: "Last played from YouTube", songs: 0 },
]

export default function Playlists() {
  const navigate = useNavigate()
  const { playSong, history, likedSongs } = usePlayerStore()
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const songs = await searchSongs(searchQuery)
      setSearchResults(songs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        cover_url: s.thumbnail,
        audio_url: s.url,
        duration: s.duration || 180
      })))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const playlistsWithStats = [
    ...defaultPlaylists,
    { id: 'history', name: "History", description: "Your listening history", songs: history.length },
    { id: 'liked-full', name: "Liked", description: "All liked songs", songs: likedSongs.length },
  ]

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-white mb-1">Library</h1>
          <p className="text-[#a1a1a6]">Your YouTube music collection</p>
        </div>
        <button 
          onClick={() => setShowYouTubeSearch(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white text-[13px] font-semibold"
        >
          <Plus size={16} />
          Add Songs
        </button>
      </div>

      {/* Search to create playlist */}
      <div className="p-4 bg-white/[0.03] rounded-xl">
        <h3 className="text-[16px] font-medium text-white mb-3">Create New Playlist</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a6]" />
            <input
              type="text"
              placeholder="Search songs to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-10 bg-white/[0.06] rounded-lg pl-10 pr-4 text-white text-[14px] placeholder-[#6e6e73] focus:outline-none"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[14px]"
          >
            Search
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-3 max-h-60 overflow-y-auto">
            <p className="text-[12px] text-[#6e6e73] mb-2">Results - click to play</p>
            {searchResults.slice(0, 5).map((song, i) => (
              <div 
                key={song.id}
                onClick={() => playSong(song, searchResults)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.06] cursor-pointer"
              >
                <img src={song.cover_url} alt="" className="w-10 h-10 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-white truncate">{song.title}</p>
                  <p className="text-[12px] text-[#a1a1a6] truncate">{song.artist}</p>
                </div>
                <Play size={16} className="text-[#fc3c44]" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Library Sections */}
      <section>
        <h2 className="text-[20px] font-semibold text-white mb-4">Your Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlistsWithStats.map((playlist, i) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-all"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-[#fc3c44]/30 to-[#ff6b6b]/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music2 size={40} className="text-white/50" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#fc3c44] flex items-center justify-center">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-1">{playlist.name}</h3>
              <p className="text-[13px] text-[#a1a1a6]">{playlist.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <YouTubeSearch isOpen={showYouTubeSearch} onClose={() => setShowYouTubeSearch(false)} />
    </div>
  )
}