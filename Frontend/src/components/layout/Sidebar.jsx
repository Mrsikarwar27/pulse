import { NavLink, useNavigate } from "react-router-dom"
import {
  Home,
  Search,
  Heart,
  PlaySquare,
  Clock,
  Music2,
  LogOut,
  User
} from "lucide-react"
import { useAuthStore } from "../../store/playerStore"
import { signOut } from "../../lib/auth"

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/search' },
]

const libraryItems = [
  { icon: PlaySquare, label: 'Library', path: '/playlists' },
  { icon: Heart, label: 'Liked Songs', path: '/liked', filled: true },
  { icon: Clock, label: 'Recently Played', path: '/recent' },
]

export default function Sidebar({ onClose, isMobile }) {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleNavClick = () => {
    if (isMobile) onClose?.()
  }

  const handleSignOut = async () => {
    await signOut()
    clearAuth()
    navigate('/login')
    if (isMobile) onClose?.()
  }

  // Mobile full sidebar
  if (isMobile) {
    return (
      <div className="h-full flex flex-col px-3 pt-4 pb-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#fc3c44] flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <span className="text-[18px] font-semibold text-white">Pulse</span>
        </div>

        {/* Main Nav */}
        <nav className="space-y-0.5 mb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Library */}
        <div className="mb-4">
          <p className="px-3 mb-2 text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">Library</p>
          <nav className="space-y-0.5">
            {libraryItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <item.icon size={18} className={item.filled ? 'text-[#fc3c44]' : ''} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User + Logout */}
        {user && (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-[13px] text-[#a1a1a6] truncate">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#ff6b6b] hover:bg-white/[0.06] transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    )
  }

  // Desktop icon-only sidebar
  return (
    <div className="h-full flex flex-col items-center py-3 gap-1">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-[#fc3c44] flex items-center justify-center mb-3">
        <Music2 size={18} className="text-white" />
      </div>

      {/* Main Nav Icons */}
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          title={item.label}
          className={({ isActive }) =>
            `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
            }`
          }
        >
          <item.icon size={20} />
        </NavLink>
      ))}

      <div className="w-6 border-t border-white/[0.08] my-1.5" />

      {/* Library Icons */}
      {libraryItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          title={item.label}
          className={({ isActive }) =>
            `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
            }`
          }
        >
          <item.icon size={20} className={item.filled ? 'text-[#fc3c44]' : ''} />
        </NavLink>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Profile */}
      <NavLink
        to="/profile"
        title="Profile"
        className={({ isActive }) =>
          `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
            isActive
              ? 'bg-white/10 text-white'
              : 'text-[#a1a1a6] hover:text-white hover:bg-white/[0.06]'
          }`
        }
      >
        <User size={20} />
      </NavLink>

      {/* Logout */}
      {user && (
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[#a1a1a6] hover:text-[#ff6b6b] hover:bg-white/[0.06] transition-colors"
        >
          <LogOut size={20} />
        </button>
      )}
    </div>
  )
}
