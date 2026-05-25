import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import LikedSongs from './pages/LikedSongs'
import PlaylistDetails from './pages/PlaylistDetails'
import Playlists from './pages/Playlists'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import RecentlyPlayed from './pages/RecentlyPlayed'
import { useAuthStore } from './store/playerStore'
import { supabase, getSession } from './lib/supabase'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pulse-black">
        <div className="w-8 h-8 border-2 border-pulse-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pulse-black">
        <div className="w-8 h-8 border-2 border-pulse-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  const { setUser } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const { session } = await getSession()
      if (session?.user) {
        setUser(session.user, session)
        localStorage.setItem('pulse_token', session.access_token)
      } else {
        setUser(null, null)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user, session)
        localStorage.setItem('pulse_token', session.access_token)
      } else {
        setUser(null, null)
        localStorage.removeItem('pulse_token')
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="liked" element={<LikedSongs />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlist/:id" element={<PlaylistDetails />} />
          <Route path="recent" element={<RecentlyPlayed />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}