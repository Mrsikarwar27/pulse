import express from 'express'
import LikedSong from '../models/LikedSong.js'
import Song from '../models/Song.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authRequired, async (req, res) => {
  try {
    const likedSongs = await LikedSong.find({ user_id: req.userId }).sort({ created_at: -1 })

    if (likedSongs?.length > 0) {
      const songIds = likedSongs.map(ls => ls.song_id)
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

    await LikedSong.updateOne(
      { user_id: req.userId, song_id: songId },
      { $setOnInsert: { user_id: req.userId, song_id: songId } },
      { upsert: true }
    )

    await Song.findByIdAndUpdate(songId, { $inc: { likes_count: 1 } })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:songId', authRequired, async (req, res) => {
  try {
    const { songId } = req.params

    const result = await LikedSong.deleteOne({ user_id: req.userId, song_id: songId })
    if (result.deletedCount > 0) {
      await Song.findByIdAndUpdate(songId, {
        $inc: { likes_count: -1 },
      })
      await Song.updateOne({ _id: songId, likes_count: { $lt: 0 } }, { $set: { likes_count: 0 } })
    }

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/check/:songId', optionalAuth, async (req, res) => {
  try {
    if (!req.user) return res.json({ isLiked: false })

    const { songId } = req.params
    const data = await LikedSong.findOne({ user_id: req.userId, song_id: songId })

    res.json({ isLiked: !!data })
  } catch (error) {
    res.json({ isLiked: false })
  }
})

export default router
