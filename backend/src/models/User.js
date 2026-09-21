import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    return ret
  },
})

// Shape kept compatible with previous Supabase auth user
export const toAuthUser = (u) => ({
  id: u._id.toString(),
  email: u.email,
  user_metadata: {
    full_name: u.fullName || '',
    avatar_url: u.avatarUrl || '',
    role: u.role,
  },
})

export default mongoose.model('User', userSchema)
