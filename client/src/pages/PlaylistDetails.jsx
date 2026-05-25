import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause, Heart, Clock, MoreHorizontal, ChevronLeft, Music2, Shuffle, RefreshCw } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { searchSongs } from '../services/youtube'

export default function PlaylistDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playSong, currentSong, isPlaying, togglePlay, toggleLikeSong, isSongLiked } = usePlayerStore()
  
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  const playlistInfo = {
    'chill': { name: "Chill Vibes", description: "Relaxing music from YouTube" },
    'workout': { name: "Workout Mix", description: "High energy tracks" },
    'late': { name: "Late Night", description: "Perfect for midnight" },
    'focus': { name: "Focus Flow", description: "Concentration boosting" },
    'road': { name: "Road Trip", description: "Your driving companion" },
  }

  const playlist = playlistInfo[id] || { name: "Playlist", description: "YouTube playlist" }

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true)
      try {
        const results = await searchSongs(playlist.name)
        setSongs(results.map(s => ({
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
    fetchSongs()
  }, [id])

  const handlePlayAll = () => {
    if (songs.length > 0) playSong(songs[0], songs)
  }

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5)
      playSong(shuffled[0], shuffled)
    }
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 180), 0)
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="space-y-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#a1a1a6] hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-end"
      >
        <div className={`w-44 h-44 rounded-2xl bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center shadow-2xl flex-shrink-0`}>
          <Music2 size={64} className="text-white/70" />
        </div>
        
        <div className="flex-1">
          <span className="text-[12px] font-medium text-[#a1a1a6] uppercase tracking-wider">Playlist</span>
          <h1 className="text-[40px] font-bold text-white mb-2">{playlist.name}</h1>
          <p className="text-[#a1a1a6] mb-3">{playlist.description}</p>
          <div className="flex items-center gap-3 text-[#a1a1a6] text-[14px]">
            <span>{songs.length} songs</span>
            {songs.length > 0 && (
              <>
                <span>•</span>
                <span>{hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-5">
            <button 
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#fc3c44] hover:bg-[#ff6b6b] text-white font-semibold disabled:opacity-50 transition-all"
            >
              {currentSong && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
              Play
            </button>
            <button 
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium disabled:opacity-50 transition-all"
            >
              <Shuffle size={16} />
              Shuffle
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={28} className="text-[#fc3c44] animate-spin" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16">
          <Music2 size={48} className="mx-auto text-[#6e6e73] mb-4" />
          <p className="text-[#a1a1a6]">No songs found</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 text-[11px] text-[#6e6e73] border-b border-white/[0.05]">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span><Clock size={12} /></span>
          </div>
          
          {songs.map((song, i) => {
            const isCurrent = currentSong?.id === song.id
            const liked = isSongLiked(song.id)
            return (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => isCurrent ? togglePlay() : playSong(song, songs)}
                className={`group grid grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/[0.05] cursor-pointer ${isCurrent ? 'bg-white/[0.05]' : ''}`}
              >
                <div className="w-8 flex items-center justify-center text-[#6e6e73]">
                  {isCurrent && isPlaying ? (
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <span className="group-hover:hidden">{i + 1}</span>
                  )}
                  {!isCurrent && <Play size={12} className="hidden group-hover:block text-white" />}
                </div>
                
                <div className="flex items-center gap-3 min-w-0">
                  <img src={song.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-[14px] truncate ${isCurrent ? 'text-[#fc3c44]' : 'text-white'}`}>{song.title}</p>
                    <p className="text-[12px] text-[#a1a1a6] truncate">{song.artist}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center text-[#a1a1a6] text-[13px] truncate">
                  YouTube
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLikeSong(song) }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full"
                  >
                    <Heart size={14} className={liked ? 'text-[#fc3c44]' : 'text-[#a1a1a6]'} fill={liked ? '#fc3c44' : 'none'} />
                  </button>
                  <span className="text-[#6e6e73] text-[12px]">{formatTime(song.duration)}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}