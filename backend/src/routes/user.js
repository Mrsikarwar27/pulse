import express from 'express'
import LikedSong from '../models/LikedSong.js'
import Playlist from '../models/Playlist.js'
import RecentlyPlayed from '../models/RecentlyPlayed.js'
import { toAuthUser } from '../models/User.js'
import { authRequired } from '../middleware/auth.js'

const router = express.Router()

router.get('/profile', authRequired, async (req, res) => {
  try {
    res.json({ user: toAuthUser(req.user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/profile', authRequired, async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body

    if (full_name !== undefined) req.user.fullName = full_name
    if (avatar_url !== undefined) req.user.avatarUrl = avatar_url
    await req.user.save()

    res.json({ user: toAuthUser(req.user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/stats', authRequired, async (req, res) => {
  try {
    const [likedCount, playlistCount, recentCount] = await Promise.all([
      LikedSong.countDocuments({ user_id: req.userId }),
      Playlist.countDocuments({ user_id: req.userId }),
      RecentlyPlayed.countDocuments({ user_id: req.userId }),
    ])

    res.json({
      totalSongs: recentCount || 0,
      likedSongs: likedCount || 0,
      playlists: playlistCount || 0,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
