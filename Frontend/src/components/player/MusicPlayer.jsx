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
  Music,
  ChevronUp,
  ChevronDown,
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
  const fullProgressRef = useRef(null)
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
    setQueue,
    removeFromQueue,
    clearQueue
  } = usePlayerStore()

  const [showQueue, setShowQueue] = useState(false)
  const [showFullPlayer, setShowFullPlayer] = useState(false)

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

  const seekAt = (el, clientX) => {
    if (!el || !playerInstance || !ytDuration) return
    const rect = el.getBoundingClientRect()
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const newTime = percent * ytDuration
    playerInstance.seekTo(newTime, true)
    setCurrentTime(newTime)
    setYtCurrentTime(newTime)
  }

  const handleSeek = (e) => seekAt(progressRef.current, e.clientX)

  const handleFullSeek = (e) => seekAt(fullProgressRef.current, e.clientX)

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
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#121212]/95 backdrop-blur-md border-t border-white/[0.07] flex items-center gap-2 px-3 sm:px-4 z-40">

          {/* Mobile progress line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 sm:hidden">
            <div className="h-full bg-[#fc3c44]" style={{ width: `${progress}%` }} />
          </div>

          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0 sm:w-1/4 sm:flex-none sm:min-w-[180px]">
            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#2d2d2f] to-[#1d1d1f] flex items-center justify-center">
              {currentSong.thumbnail ? (
                <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music size={22} className="text-white/40" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-medium text-white truncate hover:underline cursor-pointer">{currentSong.title}</h4>
              <p className="text-[11px] text-[#a1a1a6] truncate hover:underline cursor-pointer">{currentSong.channel_name || 'Unknown'}</p>
            </div>
            <button
              onClick={() => toggleLikeSong(currentSong)}
              aria-label={isLiked ? 'Unlike' : 'Like'}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-[#fc3c44]' : 'text-[#a1a1a6] hover:text-white'
              }`}
            >
              <Heart size={16} fill={isLiked ? '#fc3c44' : 'none'} />
            </button>
            <button
              onClick={() => setShowFullPlayer(true)}
              aria-label="Open full player"
              className="sm:hidden p-2 rounded-full text-[#a1a1a6] active:text-white transition-colors"
            >
              <ChevronUp size={18} />
            </button>
          </div>

          {/* Player Controls - desktop */}
          <div className="hidden sm:flex flex-1 flex-col items-center max-w-[722px] mx-auto">
            {/* Buttons */}
            <div className="flex items-center gap-4 mb-1.5">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                title="Shuffle"
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
                aria-label="Previous track"
                title="Previous"
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white transition-all"
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isPlayerReadyState}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                title={isPlaying ? 'Pause' : 'Play'}
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
                aria-label="Next track"
                title="Next"
                className="p-1 rounded-full text-[#b3b3b3] hover:text-white transition-all"
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                aria-label="Repeat"
                title="Repeat"
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

          {/* Volume & Extra - desktop */}
          <div className="hidden sm:flex items-center justify-end gap-1 w-1/4 min-w-[180px]">
            <button
              onClick={() => setShowQueue(!showQueue)}
              aria-label="Queue"
              title="Queue"
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
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute' : 'Mute'}
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

          {/* Compact controls - mobile only */}
          <div className="flex sm:hidden items-center gap-0.5 flex-shrink-0">
            <button
              onClick={previousSong}
              className="p-2 rounded-full text-white/80 active:text-white transition-colors"
              aria-label="Previous"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!isPlayerReadyState}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} fill="black" className="text-black" />
              ) : (
                <Play size={18} fill="black" className="text-black ml-0.5" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-2 rounded-full text-white/80 active:text-white transition-colors"
              aria-label="Next"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
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
              <div className="flex items-center gap-3">
                <h3 className="text-[16px] font-bold text-white">Queue</h3>
                {queue.length > queueIndex + 1 && (
                  <button
                    onClick={clearQueue}
                    aria-label="Clear queue"
                    className="text-[12px] text-[#a1a1a6] hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowQueue(false)}
                aria-label="Close queue"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} className="text-[#a1a1a6]" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-[#a1a1a6] uppercase tracking-wider mb-3">Now Playing</p>
              {currentSong && (
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/[0.04]">
                  <div className="w-10 h-10 rounded overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
                    {currentSong.thumbnail ? (
                      <img src={currentSong.thumbnail} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Music size={16} className="text-white/40" />
                    )}
                  </div>
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
                  className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
                    {song.thumbnail ? (
                      <img src={song.thumbnail} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Music size={16} className="text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate">{song.title}</p>
                    <p className="text-[11px] text-[#a1a1a6] truncate">{song.channel_name}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(queueIndex + 1 + i) }}
                    aria-label={`Remove ${song.title} from queue`}
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 text-[#a1a1a6] hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {queue.length <= queueIndex + 1 && (
                <p className="text-[13px] text-[#6e6e73] px-2 py-1">Nothing up next</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen player - mobile only */}
      <AnimatePresence>
        {showFullPlayer && currentSong && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="sm:hidden fixed inset-0 z-[60] bg-gradient-to-b from-[#232326] to-black flex flex-col px-6 pt-4 pb-8"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFullPlayer(false)}
                aria-label="Close full player"
                className="p-2 -ml-2 rounded-full text-[#a1a1a6] active:text-white transition-colors"
              >
                <ChevronDown size={24} />
              </button>
              <p className="text-[11px] font-semibold text-[#a1a1a6] uppercase tracking-widest">Now Playing</p>
              <button
                onClick={() => toggleLikeSong(currentSong)}
                aria-label={isLiked ? 'Unlike' : 'Like'}
                className="p-2 -mr-2 rounded-full transition-colors"
              >
                <Heart size={22} className={isLiked ? 'text-[#fc3c44]' : 'text-[#a1a1a6]'} fill={isLiked ? '#fc3c44' : 'none'} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-6 min-h-0">
              <div className="w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#2d2d2f] to-[#1d1d1f] flex items-center justify-center">
                {currentSong.thumbnail ? (
                  <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
                ) : (
                  <Music size={64} className="text-white/30" />
                )}
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-[20px] font-bold text-white truncate">{currentSong.title}</h2>
              <p className="text-[14px] text-[#a1a1a6] truncate mt-1">{currentSong.channel_name || 'Unknown'}</p>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] text-[#a1a1a6] tabular-nums">{formatTime(ytCurrentTime)}</span>
              <div
                ref={fullProgressRef}
                className="flex-1 h-1.5 bg-white/15 rounded-full cursor-pointer"
                onClick={handleFullSeek}
              >
                <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] text-[#a1a1a6] tabular-nums">{formatTime(ytDuration)}</span>
            </div>

            <div className="flex items-center justify-between px-2">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                className={`p-2 transition-colors ${isShuffled ? 'text-[#fc3c44]' : 'text-white/70 active:text-white'}`}
              >
                <Shuffle size={22} />
              </button>
              <button onClick={previousSong} aria-label="Previous track" className="p-2 text-white active:scale-95 transition-transform">
                <SkipBack size={30} fill="currentColor" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isPlayerReadyState}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause size={28} fill="black" className="text-black" />
                ) : (
                  <Play size={28} fill="black" className="text-black ml-1" />
                )}
              </button>
              <button onClick={nextSong} aria-label="Next track" className="p-2 text-white active:scale-95 transition-transform">
                <SkipForward size={30} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                aria-label="Repeat"
                className={`p-2 transition-colors ${repeat !== 'none' ? 'text-[#fc3c44]' : 'text-white/70 active:text-white'}`}
              >
                {repeat === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
