import express from 'express'
import Song from '../models/Song.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ created_at: -1 })
    res.json({ songs: songs || [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ songs: [], artists: [] })

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const songs = await Song.find({
      $or: [{ title: regex }, { artist: regex }, { genre: regex }],
    }).limit(20)

    const artists = [...new Set(songs.map(s => s.artist))].map(name => ({ name }))

    res.json({ songs: songs || [], artists })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
    if (!song) return res.status(404).json({ error: 'Song not found' })
    res.json({ song })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, artist, genre, cover_url, audio_url, duration } = req.body

    const song = await Song.create({
      title,
      artist,
      genre,
      cover_url,
      audio_url,
      duration,
      play_count: 0,
      likes_count: 0,
    })

    res.json({ song })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { title, artist, genre, cover_url, audio_url, duration } = req.body

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, genre, cover_url, audio_url, duration },
      { new: true }
    )
    if (!song) return res.status(404).json({ error: 'Song not found' })

    res.json({ song })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/:id/play', async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { play_count: 1 } })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
