import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

const checkAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) return res.status(403).json({ error: 'Forbidden' })

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

router.get('/stats', checkAdmin, async (req, res) => {
  try {
    const { count: songCount } = await supabaseAdmin
      .from('songs')
      .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: likeCount } = await supabaseAdmin
      .from('liked_songs')
      .select('*', { count: 'exact', head: true })

    res.json({
      totalSongs: songCount || 0,
      totalUsers: userCount || 0,
      totalLikes: likeCount || 0,
      activeListeners: Math.floor(Math.random() * 50) + 10
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/users', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error

    res.json({ users: data?.users || [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { role, metadata } = req.body

    const { data, error } = await supabaseAdmin.auth.admin.updateUser(id, {
      data: { ...metadata, role }
    })

    if (error) throw error
    res.json({ user: data.user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router