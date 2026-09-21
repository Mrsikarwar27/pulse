import mongoose from 'mongoose'

const likedSongSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

likedSongSchema.index({ user_id: 1, song_id: 1 }, { unique: true })

export default mongoose.model('LikedSong', likedSongSchema)
