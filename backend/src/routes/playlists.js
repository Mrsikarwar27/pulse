import express from 'express'
import Playlist from '../models/Playlist.js'
import Song from '../models/Song.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ created_at: -1 })
    res.json({ playlists: playlists || [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs.song')
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    const orderedSongs = [...(playlist.songs || [])]
      .sort((a, b) => a.position - b.position)
      .map(ps => ps.song)
      .filter(Boolean)

    const playlistObj = playlist.toJSON()
    delete playlistObj.songs
    res.json({ playlist: playlistObj, songs: orderedSongs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, description, cover_url, user_id } = req.body

    const playlist = await Playlist.create({
      name,
      description,
      cover_url,
      user_id: req.userId || user_id || null,
      is_public: true,
    })

    res.json({ playlist })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, description, cover_url } = req.body

    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { name, description, cover_url },
      { new: true }
    )
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    res.json({ playlist })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/:playlistId/songs', async (req, res) => {
  try {
    const { playlistId } = req.params
    const { songId } = req.body

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' })

    const songExists = await Song.exists({ _id: songId })
    if (!songExists) return res.status(404).json({ error: 'Song not found' })

    if (playlist.songs.some(ps => ps.song.toString() === songId)) {
      return res.json({ success: true })
    }

    const position =
      playlist.songs.length > 0 ? Math.max(...playlist.songs.map(ps => ps.position)) + 1 : 0

    playlist.songs.push({ song: songId, position })
    await playlist.save()

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params

    await Playlist.findByIdAndUpdate(playlistId, {
      $pull: { songs: { song: songId } },
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router
