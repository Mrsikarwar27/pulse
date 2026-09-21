import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Music2 } from 'lucide-react'
import Button from '../components/ui/Button'
import { signUp } from '../lib/auth'
import { useAuthStore } from '../store/playerStore'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      setUser(data.user, data.session)
      if (data.session) {
        localStorage.setItem('pulse_token', data.session.access_token)
        navigate('/')
      } else {
        navigate('/login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Full Screen Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/brook-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* Accent Gradient Overlay */}
      <div className="absolute inset-0 z-[2]">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">

        {/* Logo - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-8 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fc3c44] flex items-center justify-center shadow-lg shadow-[#fc3c44]/40">
            <Music2 size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Pulse</span>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="w-full rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_80px_rgba(252,60,68,0.15)] p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Create your account</h2>
              <p className="text-[#a1a1a6] text-base">Join millions of music lovers</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#fc3c44]/10 border border-[#fc3c44]/20 rounded-2xl text-[#ff6b6b] text-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#a1a1a6] mb-2.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-[#6e6e73] focus:outline-none focus:border-[#fc3c44]/50 focus:bg-white/[0.1] transition-all text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1a6] mb-2.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-[#6e6e73] focus:outline-none focus:border-[#fc3c44]/50 focus:bg-white/[0.1] transition-all text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-[#6e6e73] mt-2">Must be at least 6 characters</p>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white font-semibold py-4 rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(252,60,68,0.4)] text-base"
              >
                Create Account
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-[#a1a1a6]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#fc3c44] hover:text-[#ff6b6b] font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#6e6e73] text-sm"
        >
          Start your musical journey
        </motion.p>
      </div>
    </div>
  )
}
