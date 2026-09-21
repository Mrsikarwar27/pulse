import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Song from './models/Song.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const sampleSongs = [
  { title: 'Summer Vibes', artist: 'Chill Wave', genre: 'Electronic', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 210, play_count: 150, likes_count: 45 },
  { title: 'Night Drive', artist: 'Neon Dreams', genre: 'Synthwave', cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 185, play_count: 89, likes_count: 32 },
  { title: 'Ocean Breeze', artist: 'Sea Tides', genre: 'Ambient', cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 240, play_count: 67, likes_count: 28 },
  { title: 'Electric Soul', artist: 'DJ Pulse', genre: 'House', cover_url: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 195, play_count: 112, likes_count: 51 },
  { title: 'Sunset Dreams', artist: 'LoFi Beats', genre: 'Chillhop', cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 220, play_count: 203, likes_count: 78 },
  { title: 'Midnight City', artist: 'Urban Echo', genre: 'Pop', cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 175, play_count: 145, likes_count: 62 },
  { title: 'Floating', artist: 'Cloud Nine', genre: 'Dream Pop', cover_url: 'https://images.unsplash.com/photo-1446057032654-9d8885fef76d?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 265, play_count: 98, likes_count: 41 },
  { title: 'Energy', artist: 'Power Beat', genre: 'EDM', cover_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 200, play_count: 76, likes_count: 33 },
  { title: 'Calm Waters', artist: 'Zen Garden', genre: 'Meditation', cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration: 300, play_count: 54, likes_count: 19 },
  { title: 'Dance Floor', artist: 'Party Starters', genre: 'Dance', cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 188, play_count: 167, likes_count: 73 },
]

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const count = await Song.countDocuments()
  if (count === 0) {
    await Song.insertMany(sampleSongs)
    console.log('✅ Seeded 10 sample songs')
  } else {
    console.log(`ℹ️ Songs already exist (${count}), skipping seed`)
  }
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
