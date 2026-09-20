import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Search results cache - max 20 queries
const searchCache = new Map()
const MAX_CACHE_SIZE = 20

// Abort controller for cancelling in-flight requests
let currentController = null

function getCacheKey(query) {
  return query.trim().toLowerCase()
}

function getCachedResult(query) {
  return searchCache.get(getCacheKey(query))
}

function setCachedResult(query, results) {
  const key = getCacheKey(query)

  // Evict oldest entry if cache is full
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value
    searchCache.delete(firstKey)
  }

  searchCache.set(key, results)
}

export const searchSongs = async (query, signal) => {
  const cached = getCachedResult(query)
  if (cached) return cached

  try {
    const url = `${API_URL}/youtube/search`
    const response = await axios.get(url, {
      params: { q: query },
      timeout: 60000,
      signal,
    })

    const songs = response.data?.songs
    if (!Array.isArray(songs)) {
      console.error('Invalid response - songs is not array:', songs)
      return []
    }

    setCachedResult(query, songs)
    return songs
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw error // rethrow abort so caller can handle it
    }
    console.error('Search failed:', error.message, error.response?.status)
    return []
  }
}

export const searchSongsWithAbort = async (query) => {
  // Cancel previous in-flight request
  if (currentController) {
    currentController.abort()
  }

  currentController = new AbortController()

  try {
    const results = await searchSongs(query, currentController.signal)
    return results
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return null // signal that this was aborted, not a real error
    }
    throw error
  }
}

export const getSongInfo = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/youtube/info`, {
      params: { q: query }
    })
    return response.data
  } catch (error) {
    console.error('Get info error:', error)
    return null
  }
}

export const playSongFromYouTube = (song) => {
  return {
    id: song.id,
    video_id: song.id,
    title: song.title,
    channel_name: song.artist,
    thumbnail: song.thumbnail,
    duration: song.duration || 180
  }
}
