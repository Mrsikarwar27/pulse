import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ songs: data || [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ songs: [], artists: [] })

    const { data: songs, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .or(`title.ilike.%${q}%,artist.ilike.%${q}%,genre.ilike.%${q}%`)
      .limit(20)

    if (error) throw error

    const artists = [...new Set(songs.map(s => s.artist))].map(name => ({ name }))

    res.json({ songs: songs || [], artists })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json({ song: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, artist, genre, cover_url, audio_url, duration } = req.body

    const { data, error } = await supabaseAdmin
      .from('songs')
      .insert([{ title, artist, genre, cover_url, audio_url, duration, play_count: 0, likes_count: 0 }])
      .select()
      .single()

    if (error) throw error

    res.json({ song: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, artist, genre, cover_url, audio_url, duration } = req.body

    const { data, error } = await supabaseAdmin
      .from('songs')
      .update({ title, artist, genre, cover_url, audio_url, duration })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ song: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('songs')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params

    const { data: song } = await supabaseAdmin
      .from('songs')
      .select('play_count')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin
      .from('songs')
      .update({ play_count: (song?.play_count || 0) + 1 })
      .eq('id', id)

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router