import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      isMuted: false,
      repeat: 'none',
      isShuffled: false,
      queue: [],
      queueIndex: 0,
      history: [],
      likedSongs: [],
      isPlayerReady: false,

      // Play song from queue
      playSong: (song, queue = []) => {
        const newQueue = queue.length > 0 ? queue : [song]
        const index = queue.length > 0 ? newQueue.findIndex(s => s.id === song.id) : 0
        const { history } = get()
        
        set({
          currentSong: song,
          isPlaying: true,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          currentTime: 0,
          history: [...history.slice(-49), song]
        })
      },

      // Update playback state from YouTube player
      updatePlaybackState: (state) => set(state),

      togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)), isMuted: volume === 0 }),

      toggleMute: () => set(state => ({ 
        isMuted: !state.isMuted
      })),

      setRepeat: (mode) => set({ repeat: mode }),

      toggleRepeat: () => set(state => ({ 
        repeat: state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none' 
      })),

      toggleShuffle: () => set(state => ({ isShuffled: !state.isShuffled })),

      // Next song
      nextSong: () => {
        const { queue, queueIndex, repeat } = get()
        if (queue.length === 0) return

        let nextIndex
        if (repeat === 'one') {
          nextIndex = queueIndex
        } else if (get().isShuffled) {
          const availableIndices = queue.map((_, i) => i).filter(i => i !== queueIndex)
          nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? queueIndex
        } else {
          if (queueIndex + 1 >= queue.length) {
            nextIndex = repeat === 'all' ? 0 : queue.length - 1
          } else {
            nextIndex = queueIndex + 1
          }
        }

        set({
          queueIndex: nextIndex,
          currentSong: queue[nextIndex],
          currentTime: 0,
          isPlaying: true
        })
      },

      // Previous song
      previousSong: () => {
        const { queue, queueIndex, currentTime } = get()
        if (queue.length === 0) return

        // If more than 3 seconds in, restart current
        if (currentTime > 3) {
          set({ currentTime: 0 })
          return
        }

        const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1
        set({
          queueIndex: prevIndex,
          currentSong: queue[prevIndex],
          currentTime: 0,
          isPlaying: true
        })
      },

      addToQueue: (song) => set(state => ({ queue: [...state.queue, song] })),

      removeFromQueue: (index) => set(state => ({
        queue: state.queue.filter((_, i) => i !== index),
        queueIndex: index < state.queueIndex ? state.queueIndex - 1 : state.queueIndex
      })),

      clearQueue: () => set({ queue: [], queueIndex: 0 }),

      playNext: (song) => set(state => {
        const newQueue = [...state.queue]
        newQueue.splice(state.queueIndex + 1, 0, song)
        return { queue: newQueue }
      }),

      toggleLikeSong: (song) => set(state => {
        const isLiked = state.likedSongs.some(s => s.id === song.id)
        return {
          likedSongs: isLiked 
            ? state.likedSongs.filter(s => s.id !== song.id)
            : [...state.likedSongs, song]
        }
      }),

      isSongLiked: (songId) => get().likedSongs.some(s => s.id === songId),

      setQueue: (queue, startIndex = 0) => set({ 
        queue, 
        queueIndex: startIndex,
        currentSong: queue[startIndex],
        isPlaying: true,
        currentTime: 0
      })
    }),
    {
      name: 'pulse-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        likedSongs: state.likedSongs,
        history: state.history 
      })
    }
  )
)

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,

  setUser: (user, session) => set({
    user,
    session,
    isLoading: false,
    isAdmin: user?.user_metadata?.role === 'admin'
  }),

  clearAuth: () => set({ user: null, session: null, isAdmin: false })
}))

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  searchQuery: '',
  isSearchFocused: false,
  isMobileMenuOpen: false,
  queueDrawerOpen: false,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchFocused: (focused) => set({ isSearchFocused: focused }),
  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleQueueDrawer: () => set(state => ({ queueDrawerOpen: !state.queueDrawerOpen })),
  setQueueDrawerOpen: (open) => set({ queueDrawerOpen: open })
}))