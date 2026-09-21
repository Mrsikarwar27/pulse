import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Music2, Skull } from 'lucide-react'
import { signIn } from '../lib/auth'
import { useAuthStore } from '../store/playerStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      setUser(data.user, data.session)
      localStorage.setItem('pulse_token', data.session.access_token)
      navigate('/')
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
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-[2]">
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Logo - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-8 left-8 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fc3c44] flex items-center justify-center shadow-lg shadow-[#fc3c44]/40">
            <Music2 size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Pulse</span>
        </motion.div>

        {/* Center Content - Before Form */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-6"
            >
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight"
              >
                Pulse
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-[#a1a1a6] mb-12 max-w-md"
              >
                Yohohoho! Experience music like never before
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="flex-1 flex items-center justify-center px-6"
            >
              <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/50 backdrop-blur-2xl shadow-[0_0_100px_rgba(252,60,68,0.2)] p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">Welcome back</h2>
                  <p className="text-[#a1a1a6] text-base">Sign in to continue listening</p>
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
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#a1a1a6] mb-2.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
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
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#6e6e73] bg-white/[0.06] text-[#fc3c44] focus:ring-0 focus:ring-offset-0" />
                      <span className="text-sm text-[#a1a1a6]">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-[#fc3c44] hover:text-[#ff6b6b] transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-6 py-3.5 text-center w-full disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                </form>

                {/* Back Button */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-[#6e6e73] hover:text-white text-sm transition-colors"
                  >
                    Back to video
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="text-[#a1a1a6]">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#fc3c44] hover:text-[#ff6b6b] font-medium transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - Brook Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 z-20"
        >
          <div className="h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 pb-10 flex flex-col items-center gap-6">

            {!showForm && (
              <>
                <motion.button
                  onClick={() => setShowForm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ padding: '14px 32px', whiteSpace: 'nowrap', minWidth: '260px' }}
                  className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl font-medium rounded-full text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-pink-500/30"
                >
                  <Skull size={18} />
                  <span>Yohohoho! Let Me In</span>
                </motion.button>

                <p className="text-[#6e6e73] text-sm">
                  "Can I see your panties?" - Brook
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
