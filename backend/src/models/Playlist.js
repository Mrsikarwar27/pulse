import mongoose from 'mongoose'

const playlistSongSchema = new mongoose.Schema(
  {
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
    position: { type: Number, default: 0 },
  },
  { _id: false }
)

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    cover_url: { type: String, default: '' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    is_public: { type: Boolean, default: true },
    songs: { type: [playlistSongSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

playlistSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Playlist', playlistSchema)
