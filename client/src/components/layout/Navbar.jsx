import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Menu,
  User,
  LogOut,
  Music2,
  Heart,
  Clock,
  PlaySquare,
  Search,
  X
} from "lucide-react"
import { useAuthStore } from "../../store/playerStore"
import { signOut } from "../../lib/supabase"

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const profileRef = useRef(null)
  const { user, clearAuth } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setShowProfileMenu(false)
    await signOut()
    clearAuth()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSearchClear = () => {
    setSearchQuery('')
  }

  const navigateAndClose = (path) => {
    navigate(path)
    setShowProfileMenu(false)
  }

  const hasQuery = searchQuery.length > 0

  return (
    <div style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: 'rgba(0,0,0,0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      zIndex: 50
    }}>

      {/* Logo - Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-white" />
        </button>
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#fc3c44] flex items-center justify-center">
            <Music2 size={14} className="text-white" />
          </div>
          <span className="text-[16px] font-semibold text-white">Pulse</span>
        </Link>
      </div>

      {/* Search Bar - Center */}
      <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6e6e73', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '40px',
              paddingRight: searchQuery ? '36px' : '16px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '9999px',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '13px',
              textAlign: hasQuery || searchFocused ? 'left' : 'center',
              transition: 'background 0.2s'
            }}
            className="search-input-navbar"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleSearchClear}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6e6e73', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Avatar - Far Right */}
      <div
        ref={profileRef}
        style={{
          position: 'relative',
          marginLeft: 'auto',
          flexShrink: 0,
          paddingRight: '16px',
          zIndex: 9999
        }}
      >
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/[0.08] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center">
            <span className="text-[12px] font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <ChevronDown size={14} className={`text-[#a1a1a6] transition-transform hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-[#1d1d1f] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden"
              style={{ zIndex: 9999 }}
            >
              {user && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] font-medium text-white truncate">{user.email}</p>
                  <p className="text-[11px] text-[#6e6e73]">Free Plan</p>
                </div>
              )}

              <div className="py-1">
                <button
                  onClick={() => navigateAndClose('/profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a1a1a6] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => navigateAndClose('/playlists')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a1a1a6] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <PlaySquare size={16} />
                  Library
                </button>
                <button
                  onClick={() => navigateAndClose('/liked')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a1a1a6] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Heart size={16} className="text-[#fc3c44]" />
                  Liked Songs
                </button>
                <button
                  onClick={() => navigateAndClose('/recent')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a1a1a6] hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Clock size={16} />
                  Recently Played
                </button>
              </div>

              <div className="border-t border-white/[0.06] py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ff6b6b] hover:bg-white/[0.06] transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
