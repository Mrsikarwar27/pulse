import { motion } from 'framer-motion'
import { Play, Clock, Music2 } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

export default function RecentlyPlayed() {
  const { playSong, currentSong, isPlaying, togglePlay, history } = usePlayerStore()

  const handlePlayAll = () => {
    if (history.length > 0) {
      playSong(history[0], history)
    }
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Recently Played</h1>
          <p className="text-[#a1a1a6]">Your YouTube listening history</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc3c44] hover:bg-[#ff6b6b] text-white font-semibold"
          >
            <Play size={16} fill="white" />
            Play All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={64} className="mx-auto text-[#6e6e73] mb-4" />
          <h3 className="text-[20px] font-semibold text-white mb-2">No listening history</h3>
          <p className="text-[#a1a1a6]">Songs you play from YouTube will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {history.map((song, i) => {
            const isCurrent = currentSong?.id === song.id
            return (
              <motion.div 
                key={`${song.id}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => isCurrent ? togglePlay() : playSong(song, history)}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors ${isCurrent ? 'bg-white/[0.05]' : ''}`}
              >
                <div className="w-10 flex items-center justify-center text-[#6e6e73]">
                  {isCurrent && isPlaying ? (
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-2.5 bg-[#fc3c44] rounded-full animate-pulse" />
                      <span className="w-0.5 h-2.5 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2.5 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <span className="text-[14px] w-6 text-center">{i + 1}</span>
                  )}
                </div>
                
                <img src={song.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium truncate ${isCurrent ? 'text-[#fc3c44]' : 'text-white'}`}>{song.title}</p>
                  <p className="text-[12px] text-[#a1a1a6] truncate">YouTube</p>
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