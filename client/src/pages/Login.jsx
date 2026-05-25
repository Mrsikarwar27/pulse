import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Music2, Skull } from 'lucide-react'
import { signIn, signInWithGoogle } from '../lib/supabase'
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

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
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

                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-2xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-white font-medium text-base">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/50 text-[#6e6e73]">or</span>
                  </div>
                </div>

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
