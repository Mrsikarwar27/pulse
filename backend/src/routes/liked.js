import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { data: likedSongs, error } = await supabaseAdmin
      .from('liked_songs')
      .select('song_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (likedSongs?.length > 0) {
      const songIds = likedSongs.map(ls => ls.song_id)
      const { data: songs } = await supabaseAdmin
        .from('songs')
        .select('*')
        .in('id', songIds)

      return res.json({ songs: songs || [] })
    }

    res.json({ songs: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { songId } = req.body
    if (!songId) return res.status(400).json({ error: 'songId is required' })

    const { error } = await supabaseAdmin
      .from('liked_songs')
      .insert([{ user_id: user.id, song_id: songId }])

    if (error) throw error

    await supabaseAdmin.rpc('increment_likes', { song_id: songId })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:songId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { songId } = req.params

    const { error } = await supabaseAdmin
      .from('liked_songs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/check/:songId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.json({ isLiked: false })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.json({ isLiked: false })

    const { songId } = req.params

    const { data } = await supabaseAdmin
      .from('liked_songs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', songId)
      .single()

    res.json({ isLiked: !!data })
  } catch (error) {
    res.json({ isLiked: false })
  }
})

export default router