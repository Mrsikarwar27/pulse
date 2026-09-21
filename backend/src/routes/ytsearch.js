import express from 'express'
import ytdlp from 'yt-dlp-exec'

const router = express.Router()

// Search and get audio stream URL
router.get('/search', async (req, res) => {
  const query = req.query.q
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  try {
    // Search for music only - add "music" to query
    const result = await ytdlp(
      `ytsearch10:${query} music`,
      {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
      }
    )

    // Filter out non-music content (videos, movies, etc.)
    const songs = result.entries
      .filter(entry => {
        const title = entry.title.toLowerCase()
        // Filter by title keywords or channel name
        const isMusic = title.includes('song') || 
                       title.includes('music') || 
                       title.includes('ft.') ||
                       title.includes('official') ||
                       title.includes('audio') ||
                       title.includes('lyric') ||
                       title.includes('video') ||
                       !title.includes('movie') &&
                       !title.includes('trailer') &&
                       !title.includes('movie') &&
                       !title.includes('episode') &&
                       !title.includes('game') &&
                       !title.includes('review')
        return isMusic
      })
      .slice(0, 10)
      .map(entry => ({
        id: entry.id,
        title: entry.title,
        artist: entry.uploader || 'Unknown',
        thumbnail: entry.thumbnail || `https://img.youtube.com/vi/${entry.id}/mqdefault.jpg`,
        duration: entry.duration,
        url: entry.url,
        upload_date: entry.upload_date || entry.release_date || null,
      }))

    res.json({ songs })
  } catch (err) {
    console.error('yt-dlp error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Get single song info
router.get('/info', async (req, res) => {
  const query = req.query.q
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  try {
    const result = await ytdlp(
      `ytsearch1:${query}`,
      {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
      }
    )

    const entry = result.entries[0]
    
    res.json({
      id: entry.id,
      title: entry.title,
      artist: entry.uploader || 'Unknown',
      thumbnail: entry.thumbnail || `https://img.youtube.com/vi/${entry.id}/mqdefault.jpg`,
      duration: entry.duration,
      url: entry.url,
      description: entry.description,
      upload_date: entry.upload_date || entry.release_date || null,
    })
  } catch (err) {
    console.error('yt-dlp error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router