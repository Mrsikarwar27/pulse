import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Music, Heart } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

const fallbackColors = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-indigo-500 to-blue-600',
]

const formatTime = (s) => {
  if (!s || isNaN(s)) return ''
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SongCard({ song, index, onPlay, variant = 'card' }) {
  const { currentSong, isPlaying, togglePlay, toggleLikeSong, isSongLiked } = usePlayerStore()
  const isCurrent = currentSong?.id === song.id
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const handlePlay = (e) => {
    e.stopPropagation()
    if (isCurrent) togglePlay()
    else onPlay?.(song)
  }

  // Get thumbnail - try multiple formats
  const getThumbnail = () => {
    if (song.thumbnail) return song.thumbnail
    if (song.cover_url) return song.cover_url
    if (song.video_id) return `https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`
    if (song.id && !song.id.startsWith('fallback')) return `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`
    return null
  }

  const cover = getThumbnail()
  const artist = song.channel_name || song.artist
  const hasValidImage = cover && !imgError
  const fallbackColor = fallbackColors[(index || 0) % fallbackColors.length]

  // Compact YouTube Music-style row
  if (variant === 'row') {
    const liked = isSongLiked(song.id)
    return (
      <div
        onClick={handlePlay}
        className={`group flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-colors ${isCurrent ? 'bg-white/[0.04]' : ''}`}
      >
        <div className="w-6 flex items-center justify-center text-[#6e6e73] flex-shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex gap-0.5">
              <span className="w-0.5 h-3 bg-[#fc3c44] rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-3 bg-[#fc3c44] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <>
              <span className="group-hover:hidden text-[13px] tabular-nums">{(index || 0) + 1}</span>
              {isCurrent ? (
                <Pause size={14} className="hidden group-hover:block text-white" />
              ) : (
                <Play size={14} fill="currentColor" className="hidden group-hover:block text-white" />
              )}
            </>
          )}
        </div>

        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-white/[0.06]">
          {hasValidImage ? (
            <img
              src={cover}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallbackColor} flex items-center justify-center`}>
              <Music size={18} className="text-white/50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[14px] truncate ${isCurrent ? 'text-[#fc3c44]' : 'text-white'}`}>{song.title}</p>
          <p className="text-[12px] text-[#a1a1a6] truncate mt-0.5">{artist || 'Unknown artist'}</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggleLikeSong(song) }}
          className="p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Like"
        >
          <Heart size={15} className={liked ? 'text-[#fc3c44]' : 'text-[#a1a1a6] hover:text-white'} fill={liked ? '#fc3c44' : 'none'} />
        </button>

        <span className="text-[12px] text-[#6e6e73] tabular-nums w-10 text-right flex-shrink-0 hidden sm:block">
          {formatTime(song.duration)}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.03 }}
      onClick={handlePlay}
      className="group p-3 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
        {hasValidImage ? (
          <>
            {!imgLoaded && (
              <div className={`absolute inset-0 bg-gradient-to-br ${fallbackColor} flex items-center justify-center`}>
                <Music size={32} className="text-white/40" />
              </div>
            )}
            <img
              src={cover}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallbackColor} flex items-center justify-center`}>
            <Music size={40} className="text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all">
          <div className="w-10 h-10 rounded-full bg-[#fc3c44] flex items-center justify-center shadow-xl hover:bg-[#ff5c5c] transition-colors">
            {isCurrent && isPlaying ? (
              <div className="flex gap-0.5">
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <Play size={16} fill="white" className="text-white ml-0.5" />
            )}
          </div>
        </div>
      </div>
      <h3 className={`text-[13px] font-medium truncate ${isCurrent ? 'text-[#fc3c44]' : 'text-white'}`}>
        {song.title}
      </h3>
      <p className="text-[11px] text-[#a1a1a6] truncate mt-0.5">{artist}</p>
    </motion.div>
  )
}
