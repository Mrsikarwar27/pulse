import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    res.json({ user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { full_name, avatar_url } = req.body

    const { data, error } = await supabaseAdmin.auth.admin.updateUser(user.id, {
      data: { full_name, avatar_url }
    })

    if (error) throw error
    res.json({ user: data.user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { count: likedCount } = await supabaseAdmin
      .from('liked_songs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: playlistCount } = await supabaseAdmin
      .from('playlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: recentCount } = await supabaseAdmin
      .from('recently_played')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    res.json({
      totalSongs: recentCount || 0,
      likedSongs: likedCount || 0,
      playlists: playlistCount || 0
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router