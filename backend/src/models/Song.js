import mongoose from 'mongoose'

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, default: '' },
    cover_url: { type: String, default: '' },
    audio_url: { type: String, required: true },
    duration: { type: Number, default: 180 },
    play_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

songSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

songSchema.index({ title: 1, artist: 1 })

export default mongoose.model('Song', songSchema)
