import express from 'express'
import Song from '../models/Song.js'
import User, { toAuthUser } from '../models/User.js'
import LikedSong from '../models/LikedSong.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = express.Router()

router.use(authRequired, adminRequired)

router.get('/stats', async (req, res) => {
  try {
    const [songCount, userCount, likeCount] = await Promise.all([
      Song.countDocuments(),
      User.countDocuments(),
      LikedSong.countDocuments(),
    ])

    res.json({
      totalSongs: songCount || 0,
      totalUsers: userCount || 0,
      totalLikes: likeCount || 0,
      activeListeners: Math.floor(Math.random() * 50) + 10,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 })
    res.json({ users: users.map(toAuthUser) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { role, metadata, full_name, avatar_url } = req.body

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (role) user.role = role
    const meta = metadata || {}
    if (full_name !== undefined || meta.full_name !== undefined) {
      user.fullName = full_name ?? meta.full_name
    }
    if (avatar_url !== undefined || meta.avatar_url !== undefined) {
      user.avatarUrl = avatar_url ?? meta.avatar_url
    }
    await user.save()

    res.json({ user: toAuthUser(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
