import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.resolve(__dirname, '../../uploads')

for (const sub of ['audio', 'covers']) {
  fs.mkdirSync(path.join(uploadDir, sub), { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, file.fieldname === 'cover' ? 'covers' : 'audio'))
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

router.post(
  '/',
  authRequired,
  adminRequired,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const audio = req.files?.audio?.[0]
      const cover = req.files?.cover?.[0]
      if (!audio || !cover) {
        return res.status(400).json({ error: 'audio and cover files are required' })
      }

      const base = `${req.protocol}://${req.get('host')}`
      res.json({
        audioUrl: `${base}/uploads/audio/${audio.filename}`,
        coverUrl: `${base}/uploads/covers/${cover.filename}`,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.message })
    }
  }
)

export default router
