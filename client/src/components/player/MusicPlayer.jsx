import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  X
} from "lucide-react"
import { usePlayerStore } from "../../store/playerStore"

let playerInstance = null
let isPlayerReady = false

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    if (document.getElementById('youtube-api-script')) {
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady)
          resolve()
        }
      }, 100)
      return
    }

    const tag = document.createElement('script')
    tag.id = 'youtube-api-script'
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

export default function MusicPlayer() {
  const progressRef = useRef(null)
  const [isPlayerReadyState, setPlayerReady] = useState(false)
  const [ytPlaying, setYtPlaying] = useState(false)
  const [ytCurrentTime, setYtCurrentTime] = useState(0)
  const [ytDuration, setYtDuration] = useState(0)
  const [localVolume, setLocalVolume] = useState(80)
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    nextSong,
    previousSong,
    setCurrentTime,
    setDuration,
    repeat,
    toggleRepeat,
    isShuffled,
    toggleShuffle,
    volume,
    isMuted,
    toggleMute,
    queue,
    queueIndex,
    toggleLikeSong,
    isSongLiked,
    setQueue
  } = usePlayerStore()

  const [showQueue, setShowQueue] = useState(false)

  // Initialize YouTube player
  useEffect(() => {
    let mounted = true

    const setupPlayer = async () => {
      await loadYouTubeAPI()
      if (!mounted) return

      playerInstance = new window.YT.Player('youtube-player-iframe', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          loop: 0,
        },
        events: {
          onReady: (event) => {
            if (mounted) {
              setPlayerReady(true)
              isPlayerReady = true
              playerInstance = event.target
              playerInstance.setVolume(localVolume)
            }
          },
          onStateChange: (event) => {
            if (!mounted) return
            const state = event.data
            if (state === window.YT.PlayerState.PLAYING) {
              setYtPlaying(true)
              setIsPlaying(true)
            } else if (state === window.YT.PlayerState.PAUSED) {
              setYtPlaying(false)
              setIsPlaying(false)
            } else if (state === window.YT.PlayerState.ENDED) {
              nextSong()
            }
          },
          onError: (e) => console.error('YT Error:', e.data)
        }
      })
    }

    setupPlayer()

    return () => {
      mounted = false
    }
  }, [])

  // Load new video when song changes
  useEffect(() => {
    if (!currentSong?.video_id) return

    const loadVideo = () => {
      if (playerInstance && currentSong.video_id) {
        playerInstance.loadVideoById(currentSong.video_id)
        const dur = playerInstance.getDuration()
        if (dur) {
          setDuration(dur)
          setYtDuration(dur)
        }
      }
    }

    if (isPlayerReady) {
      loadVideo()
    }
  }, [currentSong?.video_id, isPlayerReady])

  // Sync play/pause
  useEffect(() => {
    if (!playerInstance || !isPlayerReady) return

    if (isPlaying && !ytPlaying) {
      playerInstance.playVideo()
    } else if (!isPlaying && ytPlaying) {
      playerInstance.pauseVideo()
    }
  }, [isPlaying, ytPlaying, isPlayerReady])

  // Time update interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerInstance && isPlayerReady && isPlaying) {
        const t = playerInstance.getCurrentTime() || 0
        setYtCurrentTime(t)
        setCurrentTime(t)
        if (!ytDuration) {
          const d = playerInstance.getDuration()
          if (d) {
            setDuration(d)
            setYtDuration(d)
          }
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isPlayerReady])

  const handleSeek = (e) => {
    if (!progressRef.current || !playerInstance || !ytDuration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * ytDuration
    playerInstance.seekTo(newTime, true)
    setCurrentTime(newTime)
    setYtCurrentTime(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value)
    setLocalVolume(newVolume)
    if (playerInstance && isPlayerReady) {
      playerInstance.setVolume(newVolume)
    }
    usePlayerStore.getState().setVolume(newVolume)
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00"
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ytDuration ? (ytCurrentTime / ytDuration) * 100 : 0
  const isLiked = currentSong ? isSongLiked(currentSong.id) : false
  const effectiveVolume = isMuted ? 0 : localVolume

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2

  return (
    <>
      {/* Hidden YouTube Player */}
      <div id="youtube-player-iframe" style={{ position: 'absolute', visibility: 'hidden' }} />

      {currentSong ? (
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#121212] border-t border-white/[0.07] flex items-center px-4 z-40">

          {/* Song Info */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={currentSong.thumbnail || 'https://picsum.photos/100'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-medium text-white truncate hover:underline cursor-pointer">{currentSong.title}</h4>
              <p className="text-[11px] text-[#a1a1a6] truncate hover:underline cursor-pointer">{currentSong.channel_name || 'Unknown'}</p>
            </div>
            <button
              onClick={() => toggleLikeSong(currentSong)}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-[#fc3c44]' : 'text-[#a1a1a6] hover:text-white'
              }`}
            >
              <Heart size={16} fill={isLiked ? '#fc3c44' : 'none'} />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center max-w-[722px] mx-auto">
            {/* Buttons */}
            <div className="flex items-center gap-4 mb-1.5">
              <button
                onClick={toggleShuffle}
                className={`p-1 rounded-full transition-all ${
                  isShuffled
                    ? 'text-[#fc3c44]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                <Shuffle size={16} />
              </button>
              <button
                onClick={previousSong}
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white transition-all"
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isPlayerReadyState}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause size={16} fill="black" className="text-black" />
                ) : (
                  <Play size={16} fill="black" className="text-black ml-0.5" />
                )}
              </button>
              <button
                onClick={nextSong}
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white transition-all"
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-1 rounded-full transition-all ${
                  repeat !== 'none'
                    ? 'text-[#fc3c44]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[11px] text-[#a1a1a6] w-10 text-right tabular-nums">{formatTime(ytCurrentTime)}</span>
              <div
                ref={progressRef}
                className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group relative"
                onClick={handleSeek}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-white group-hover:bg-[#fc3c44] rounded-full transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-sm transition-opacity" />
                </div>
              </div>
              <span className="text-[11px] text-[#a1a1a6] w-10 tabular-nums">{formatTime(ytDuration)}</span>
            </div>
          </div>

          {/* Volume & Extra */}
          <div className="flex items-center justify-end gap-1 w-1/4 min-w-[180px]">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-full transition-all ${
                showQueue
                  ? 'text-[#fc3c44]'
                  : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              <ListMusic size={16} />
            </button>
            <div className="flex items-center gap-1 group">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full text-[#b3b3b3] hover:text-white transition-all"
              >
                <VolumeIcon size={16} />
              </button>
              <div className="hidden sm:flex items-center w-[93px]">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={effectiveVolume}
                  onChange={handleVolumeChange}
                  className="volume-slider w-full h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #fc3c44 ${effectiveVolume}%, #4d4d4d ${effectiveVolume}%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-[#121212] border-l border-white/[0.07] z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
              <h3 className="text-[16px] font-bold text-white">Queue</h3>
              <button onClick={() => setShowQueue(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <X size={16} className="text-[#a1a1a6]" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-[#a1a1a6] uppercase tracking-wider mb-3">Now Playing</p>
              {currentSong && (
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/[0.04]">
                  <img src={currentSong.thumbnail || 'https://picsum.photos/50'} className="w-10 h-10 rounded object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#fc3c44] truncate">{currentSong.title}</p>
                    <p className="text-[11px] text-[#a1a1a6] truncate">{currentSong.channel_name}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <p className="text-[12px] text-[#a1a1a6] uppercase tracking-wider mb-3">Next Up</p>
              {queue.slice(queueIndex + 1).map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  onClick={() => setQueue(queue, queueIndex + 1 + i)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <img src={song.thumbnail || 'https://picsum.photos/50'} className="w-10 h-10 rounded object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate">{song.title}</p>
                    <p className="text-[11px] text-[#a1a1a6] truncate">{song.channel_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
