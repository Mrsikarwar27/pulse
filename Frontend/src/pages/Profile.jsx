import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, LogOut, Music2, PlaySquare, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/playerStore'
import { signOut } from '../lib/auth'

export default function Profile() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')

  const handleSignOut = async () => {
    await signOut()
    clearAuth()
    navigate('/login')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'playlists', label: 'Playlists', icon: PlaySquare },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'history', label: 'History', icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center shadow-2xl">
          <span className="text-4xl font-bold text-white">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#a1a1a6] uppercase tracking-wider">Profile</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            {user?.email?.split('@')[0] || 'User'}
          </h1>
          <div className="flex items-center gap-4 text-[#a1a1a6] text-sm">
            <span>Free Plan</span>
            <span>•</span>
            <span>{user?.email}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-56 flex-shrink-0">
          <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider mb-3 px-1">Settings</p>
          <div className="flex flex-col gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <div className="border-t border-white/[0.06] my-2" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-left text-[#ff6b6b] hover:bg-white/[0.06] transition-colors"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <section className="p-6 rounded-2xl bg-gradient-to-br from-[#fc3c44]/10 to-[#ff6b6b]/10 border border-white/[0.06]">
                <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1a6]">Plan</span>
                    <span className="text-white font-medium">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1a6]">Email</span>
                    <span className="text-white font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a1a1a6]">Member Since</span>
                    <span className="text-white font-medium">Recently</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 rounded-xl bg-[#fc3c44] hover:bg-[#ff5c5c] text-white font-semibold transition-colors">
                  Upgrade to Premium
                </button>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-2xl bg-[#1d1d1f]">
                    <div className="text-3xl font-bold text-[#fc3c44] mb-1">12</div>
                    <div className="text-[#a1a1a6] text-sm">Playlists</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#1d1d1f]">
                    <div className="text-3xl font-bold text-[#fc3c44] mb-1">48</div>
                    <div className="text-[#a1a1a6] text-sm">Liked Songs</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#1d1d1f]">
                    <div className="text-3xl font-bold text-[#fc3c44] mb-1">256</div>
                    <div className="text-[#a1a1a6] text-sm">Minutes Listened</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {['Chill Vibes', 'Workout Mix', 'Late Night', 'Focus Flow'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/playlist/${name.toLowerCase().replace(' ', '-')}`)}
                  className="p-4 rounded-2xl bg-[#1d1d1f] hover:bg-[#2d2d2f] cursor-pointer transition-colors"
                >
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] mb-4 flex items-center justify-center">
                    <Music2 size={40} className="text-white/70" />
                  </div>
                  <h3 className="font-bold text-white truncate">{name}</h3>
                  <p className="text-[#a1a1a6] text-sm">5 songs</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-16">
              <Heart size={48} className="mx-auto text-[#6e6e73] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Liked Songs</h3>
              <p className="text-[#a1a1a6] mb-4">Songs you've liked will appear here</p>
              <button
                onClick={() => navigate('/liked')}
                className="px-6 py-2.5 rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white font-semibold transition-all"
              >
                View All Liked Songs
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-16">
              <Clock size={48} className="mx-auto text-[#6e6e73] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Listening History</h3>
              <p className="text-[#a1a1a6] mb-4">Your recently played songs</p>
              <button
                onClick={() => navigate('/recent')}
                className="px-6 py-2.5 rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white font-semibold transition-all"
              >
                View History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}