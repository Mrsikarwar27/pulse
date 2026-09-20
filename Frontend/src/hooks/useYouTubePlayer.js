import { useEffect, useRef, useState, useCallback } from 'react'

const YOUTUBE_API_KEY = 'AIzaSyAO_FJ2SlRIlKRIY4_5Tqn3jHQVCqsD3Xk' // Public API key for demo

// Singleton player instance
let playerInstance = null
let playerReady = false
let playerReadyCallbacks = []

export const useYouTubePlayer = () => {
  const [isReady, setIsReady] = useState(false)
  const [currentVideoId, setCurrentVideoId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(80)
  const playerRef = useRef(null)

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    // Load API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    return () => {
      // Cleanup on unmount
      if (playerInstance) {
        playerInstance.destroy()
        playerInstance = null
        playerReady = false
      }
    }
  }, [])

  const initPlayer = useCallback(() => {
    if (playerInstance) {
      setIsReady(true)
      return
    }

    playerInstance = new window.YT.Player('youtube-player-container', {
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
          playerReady = true
          setIsReady(true)
          // Execute pending callbacks
          playerReadyCallbacks.forEach(cb => cb())
          playerReadyCallbacks = []
        },
        onStateChange: (event) => {
          const state = event.data
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
          } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false)
          }
        },
        onError: (event) => {
          console.error('YouTube Player Error:', event.data)
        }
      }
    })
  }, [])

  // Wait for player to be ready
  const waitForPlayer = useCallback(() => {
    return new Promise((resolve) => {
      if (playerReady && playerInstance) {
        resolve()
      } else {
        playerReadyCallbacks.push(resolve)
      }
    })
  }, [])

  // Load and play video
  const loadVideo = useCallback(async (videoId) => {
    await waitForPlayer()
    
    if (playerInstance && videoId) {
      playerInstance.loadVideoById(videoId)
      setCurrentVideoId(videoId)
      setIsPlaying(true)
      
      // Get duration
      const dur = playerInstance.getDuration()
      if (dur) setDuration(dur)
    }
  }, [waitForPlayer])

  // Play
  const play = useCallback(() => {
    if (playerInstance) {
      playerInstance.playVideo()
      setIsPlaying(true)
    }
  }, [])

  // Pause
  const pause = useCallback(() => {
    if (playerInstance) {
      playerInstance.pauseVideo()
      setIsPlaying(false)
    }
  }, [])

  // Stop
  const stop = useCallback(() => {
    if (playerInstance) {
      playerInstance.stopVideo()
      setIsPlaying(false)
    }
  }, [])

  // Seek
  const seekTo = useCallback((seconds) => {
    if (playerInstance) {
      playerInstance.seekTo(seconds, true)
    }
  }, [])

  // Set volume (0-100)
  const setVolume = useCallback((vol) => {
    if (playerInstance) {
      playerInstance.setVolume(vol)
      setVolumeState(vol)
    }
  }, [])

  // Get current time
  const getCurrentTime = useCallback(() => {
    if (playerInstance) {
      return playerInstance.getCurrentTime() || 0
    }
    return 0
  }, [])

  // Get duration
  const getDuration = useCallback(() => {
    if (playerInstance) {
      return playerInstance.getDuration() || 0
    }
    return 0
  }, [])

  // Get video duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerInstance && isPlaying) {
        setCurrentTime(getCurrentTime())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, getCurrentTime])

  return {
    isReady,
    currentVideoId,
    isPlaying,
    duration,
    currentTime,
    volume,
    loadVideo,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    getCurrentTime,
    getDuration
  }
}

export default useYouTubePlayer