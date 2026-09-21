import express from 'express'
import ytdlp from 'yt-dlp-exec'

const router = express.Router()

// Fast audio URL extraction
router.get('/audio', async (req, res) => {
  const { videoId } = req.query
  
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' })
  }

  try {
    // Use fastest audio format - m4a preferred, low quality for speed
    const result = await ytdlp(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        noWarnings: true,
        noCallHome: true,
        format: 'bestaudio[ext=m4a]/bestaudio/best',
        // Get direct URL only
        getUrl: true,
      }
    )

    const audioUrl = typeof result === 'string'
      ? result.trim().split('\n')[0]
      : (result.url || result.formats?.[0]?.url)
    
    if (!audioUrl) {
      // Fallback - try alternative method
      const fallback = await ytdlp(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
          dumpSingleJson: true,
          noWarnings: true,
          noCallHome: true,
          format: 'bestaudio',
          extractorArgs: {
            youtube: {
              player_client: ['android', 'web']
            }
          }
        }
      )
      
      const bestFormat = fallback.formats?.find(f => {
        const audioExt = f.audio_ext || f.audioExt
        return audioExt === 'm4a' || audioExt === 'mp4'
      })
      
      if (bestFormat?.url) {
        return res.json({ audioUrl: bestFormat.url })
      }
      
      return res.status(404).json({ error: 'No audio found' })
    }

    res.json({ audioUrl })
  } catch (err) {
    console.error('yt-dlp audio error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router