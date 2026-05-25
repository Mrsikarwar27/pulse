import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ playlists: data || [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: playlistSongs } = await supabaseAdmin
      .from('playlist_songs')
      .select('song_id, position')
      .eq('playlist_id', id)
      .order('position')

    if (playlistSongs?.length > 0) {
      const songIds = playlistSongs.map(ps => ps.song_id)
      const { data: songs } = await supabaseAdmin
        .from('songs')
        .select('*')
        .in('id', songIds)

      const songsMap = songs.reduce((acc, song) => ({ ...acc, [song.id]: song }), {})
      const orderedSongs = playlistSongs.map(ps => songsMap[ps.song_id]).filter(Boolean)

      return res.json({ playlist, songs: orderedSongs })
    }

    res.json({ playlist, songs: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, description, cover_url, user_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('playlists')
      .insert([{ name, description, cover_url, user_id, is_public: true }])
      .select()
      .single()

    if (error) throw error
    res.json({ playlist: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, cover_url } = req.body

    const { data, error } = await supabaseAdmin
      .from('playlists')
      .update({ name, description, cover_url })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ playlist: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await supabaseAdmin.from('playlist_songs').delete().eq('playlist_id', id)
    
    const { error } = await supabaseAdmin
      .from('playlists')
      .delete()
      .eq('id', id)

    if (error) throw error
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

    const { data: existing } = await supabaseAdmin
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)

    const position = existing?.length ? existing[0].position + 1 : 0

    const { error } = await supabaseAdmin
      .from('playlist_songs')
      .insert([{ playlist_id: playlistId, song_id: songId, position }])

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params

    const { error } = await supabaseAdmin
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

export default router