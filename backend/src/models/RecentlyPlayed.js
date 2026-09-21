import mongoose from 'mongoose'

const recentlyPlayedSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  played_at: { type: Date, default: Date.now },
})

recentlyPlayedSchema.index({ user_id: 1, song_id: 1 }, { unique: true })
recentlyPlayedSchema.index({ user_id: 1, played_at: -1 })

export default mongoose.model('RecentlyPlayed', recentlyPlayedSchema)
