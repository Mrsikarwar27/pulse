import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Users, Heart, TrendingUp, Upload, Trash2, Edit2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SongCard from '../components/ui/SongCard'
import { SongSkeleton } from '../components/ui/Skeleton'
import { adminService, songService, playlistService } from '../services/api'
import { useAuthStore } from '../store/playerStore'
import { uploadSongFiles } from '../lib/auth'

export default function AdminDashboard() {
  const { isAdmin } = useAuthStore()
  const [stats, setStats] = useState({ totalSongs: 0, totalUsers: 0, totalLikes: 0, activeListeners: 0 })
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    duration: 180
  })
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, songsRes] = await Promise.all([
          adminService.getStats(),
          songService.getAll()
        ])
        setStats(statsRes.data || { totalSongs: 0, totalUsers: 0, totalLikes: 0, activeListeners: 0 })
        setSongs(songsRes.data?.songs || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!audioFile || !coverFile || !formData.title || !formData.artist) {
      return
    }

    setUploading(true)
    try {
      const { audioUrl, coverUrl } = await uploadSongFiles(audioFile, coverFile)

      await songService.create({
        ...formData,
        audio_url: audioUrl,
        cover_url: coverUrl
      })

      setShowUpload(false)
      setFormData({ title: '', artist: '', genre: '', duration: 180 })
      setAudioFile(null)
      setCoverFile(null)

      const { data } = await songService.getAll()
      setSongs(data?.songs || [])
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return
    
    try {
      await songService.delete(songId)
      setSongs(songs.filter(s => s.id !== songId))
    } catch (error) {
      console.error(error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-[#a1a1a6]">You don't have permission to view this page</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-[#a1a1a6]">Manage your music library</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1d1d1f] rounded-xl p-6"
        >
          <Music size={32} className="mb-3 text-[#fc3c44]" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalSongs}</p>
          <p className="text-[#a1a1a6] text-sm">Total Songs</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1d1d1f] rounded-xl p-6"
        >
          <Users size={32} className="mb-3 text-[#fc3c44]" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalUsers}</p>
          <p className="text-[#a1a1a6] text-sm">Total Users</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1d1d1f] rounded-xl p-6"
        >
          <Heart size={32} className="mb-3 text-[#fc3c44]" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.totalLikes}</p>
          <p className="text-[#a1a1a6] text-sm">Total Likes</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1d1d1f] rounded-xl p-6"
        >
          <TrendingUp size={32} className="mb-3 text-[#fc3c44]" />
          <p className="text-2xl font-bold text-white">{loading ? '...' : stats.activeListeners}</p>
          <p className="text-[#a1a1a6] text-sm">Active Listeners</p>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">All Songs</h2>
        <Button onClick={() => setShowUpload(!showUpload)} icon={<Upload size={18} />}>
          Upload Song
        </Button>
      </div>

      {showUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#1d1d1f] rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Upload New Song</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Song Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="Artist Name"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (seconds)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1a6] mb-2">Audio File</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-[#1d1d1f] border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a1a1a6] mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-[#1d1d1f] border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={uploading}>
              {uploading ? 'Uploading...' : 'Upload Song'}
            </Button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <SongSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((song, index) => (
            <div key={song.id} className="group flex items-center">
              <div className="flex-1">
                <SongCard song={song} index={index} showIndex={false} />
              </div>
              <div className="flex items-center gap-2 pr-4">
                <button className="p-2 text-[#a1a1a6] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="p-2 text-[#a1a1a6] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}