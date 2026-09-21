import { motion } from 'framer-motion'
import { Play, Heart, Clock, Music2 } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

export default function LikedSongs() {
  const { playSong, currentSong, isPlaying, togglePlay, likedSongs } = usePlayerStore()

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs)
    }
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalDuration = likedSongs.reduce((acc, song) => acc + (song.duration || 180), 0)
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-end"
      >
        <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart size={64} className="text-white/90" fill="white" />
        </div>
        
        <div className="flex-1">
          <span className="text-[12px] font-medium text-[#a1a1a6] uppercase tracking-wider">Playlist</span>
          <h1 className="text-[32px] md:text-[40px] font-bold text-white mb-3">Liked Songs</h1>
          <div className="flex items-center gap-3 text-[#a1a1a6] text-[14px]">
            <span>{likedSongs.length} songs</span>
            {likedSongs.length > 0 && (
              <>
                <span>•</span>
                <span>{hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`}</span>
              </>
            )}
          </div>
          
          {likedSongs.length > 0 && (
            <div className="flex items-center gap-3 mt-5">
              <button 
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#fc3c44] hover:bg-[#ff6b6b] text-white font-semibold transition-all hover:scale-105"
              >
                <Play size={16} fill="white" />
                Play
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {likedSongs.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-[#6e6e73] mb-4" />
          <h3 className="text-[20px] font-semibold text-white mb-2">No liked songs yet</h3>
          <p className="text-[#a1a1a6] mb-4">Songs you like from YouTube will appear here</p>
          <p className="text-[#6e6e73] text-[14px]">Search and play songs, then tap the heart to like</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="hidden md:grid grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 text-[11px] text-[#6e6e73] border-b border-white/[0.05]">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span><Clock size={12} /></span>
          </div>
          
          {likedSongs.map((song, i) => {
            const isCurrent = currentSong?.id === song.id
            return (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => isCurrent ? togglePlay() : playSong(song, likedSongs)}
                className={`group grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,1fr,auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/[0.05] cursor-pointer ${isCurrent ? 'bg-white/[0.03]' : ''}`}
              >
                <div className="w-8 flex items-center justify-center text-[#6e6e73]">
                  {isCurrent && isPlaying ? (
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <span className="group-hover:hidden text-[12px]">{i + 1}</span>
                  )}
                  {!isCurrent && <Play size={10} className="hidden group-hover:block text-white" />}
                </div>
                
                <div className="flex items-center gap-3 min-w-0">
                  <img src={song.cover_url} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-[14px] truncate ${isCurrent ? 'text-[#fc3c44]' : 'text-white'}`}>{song.title}</p>
                    <p className="text-[12px] text-[#a1a1a6] truncate">{song.artist}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center text-[#a1a1a6] text-[13px] truncate">
                  YouTube
                </div>
                
                <span className="text-[#6e6e73] text-[12px]">{formatTime(song.duration)}</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}