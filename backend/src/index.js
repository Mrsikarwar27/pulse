import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env FIRST - before any imports
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Validate env vars IMMEDIATELY after loading
const required = ['MONGODB_URI', 'JWT_SECRET']
const missing = required.filter(v => !process.env[v])

if (missing.length > 0) {
  console.error('❌ Missing env variables:', missing.join(', '))
  process.exit(1)
}

console.log('✅ Environment loaded - MongoDB configured')

// Connect database BEFORE loading routes
const { connectDB } = await import('./config/db.js')
await connectDB()

// Now import routes AFTER db connects
const authRoutes = (await import('./routes/auth.js')).default
const songRoutes = (await import('./routes/songs.js')).default
const playlistRoutes = (await import('./routes/playlists.js')).default
const likedRoutes = (await import('./routes/liked.js')).default
const recentRoutes = (await import('./routes/recent.js')).default
const userRoutes = (await import('./routes/user.js')).default
const adminRoutes = (await import('./routes/admin.js')).default
const uploadRoutes = (await import('./routes/upload.js')).default
const ytsearchRoutes = (await import('./routes/ytsearch.js')).default
const ytaudioRoutes = (await import('./routes/ytaudio.js')).default

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Uploaded files (covers/audio) served statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/songs', songRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/liked', likedRoutes)
app.use('/api/recent', recentRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/youtube', ytsearchRoutes)
app.use('/api/youtube', ytaudioRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`✅ Pulse API running on port ${PORT}`)
})
