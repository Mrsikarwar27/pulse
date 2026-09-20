import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pulse_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const songService = {
  getAll: () => api.get('/songs'),
  getById: (id) => api.get(`/songs/${id}`),
  create: (data) => api.post('/songs', data),
  update: (id, data) => api.put(`/songs/${id}`, data),
  delete: (id) => api.delete(`/songs/${id}`),
  incrementPlayCount: (id) => api.post(`/songs/${id}/play`),
  search: (query) => api.get(`/songs/search?q=${query}`)
}

export const playlistService = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (playlistId, songId) => api.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSong: (playlistId, songId) => api.delete(`/playlists/${playlistId}/songs/${songId}`)
}

export const likedService = {
  getAll: () => api.get('/liked'),
  add: (songId) => api.post('/liked', { songId }),
  remove: (songId) => api.delete(`/liked/${songId}`),
  check: (songId) => api.get(`/liked/check/${songId}`)
}

export const recentlyPlayedService = {
  getAll: () => api.get('/recent'),
  add: (songId) => api.post('/recent', { songId }),
  clear: () => api.delete('/recent')
}

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getStats: () => api.get('/user/stats')
}

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data)
}

export default api