import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { data: recentSongs, error } = await supabaseAdmin
      .from('recently_played')
      .select('song_id, played_at')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(50)

    if (error) throw error

    if (recentSongs?.length > 0) {
      const songIds = [...new Set(recentSongs.map(rs => rs.song_id))]
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

    await supabaseAdmin
      .from('recently_played')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)

    const { error } = await supabaseAdmin
      .from('recently_played')
      .insert([{ user_id: user.id, song_id: songId, played_at: new Date().toISOString() }])

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { error } = await supabaseAdmin
      .from('recently_played')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router