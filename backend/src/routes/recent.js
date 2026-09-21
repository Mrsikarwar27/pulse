import express from 'express'
import RecentlyPlayed from '../models/RecentlyPlayed.js'
import Song from '../models/Song.js'
import { authRequired } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authRequired, async (req, res) => {
  try {
    const recentSongs = await RecentlyPlayed.find({ user_id: req.userId })
      .sort({ played_at: -1 })
      .limit(50)

    if (recentSongs?.length > 0) {
      const songIds = [...new Set(recentSongs.map(rs => rs.song_id.toString()))]
      const songs = await Song.find({ _id: { $in: songIds } })
      return res.json({ songs: songs || [] })
    }

    res.json({ songs: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', authRequired, async (req, res) => {
  try {
    const { songId } = req.body
    if (!songId) return res.status(400).json({ error: 'songId is required' })

    await RecentlyPlayed.deleteOne({ user_id: req.userId, song_id: songId })
    await RecentlyPlayed.create({ user_id: req.userId, song_id: songId, played_at: new Date() })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/', authRequired, async (req, res) => {
  try {
    await RecentlyPlayed.deleteMany({ user_id: req.userId })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
