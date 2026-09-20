import { motion } from 'framer-motion'
import { Play, Music2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PlaylistCard({ playlist, index }) {
  const navigate = useNavigate()

  const colors = [
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-amber-500 to-yellow-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-red-500'
  ]

  const color = colors[index % colors.length]

  const handleClick = () => {
    navigate(`/playlist/${playlist.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
        <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Music2 size={40} className="text-white/70" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-[#fc3c44] flex items-center justify-center shadow-xl hover:bg-[#ff5c5c] transition-colors">
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="font-medium text-white text-[13px] mb-0.5 truncate">
        {playlist.name}
      </h3>
      <p className="text-[11px] text-[#a1a1a6] truncate">{playlist.description}</p>
    </motion.div>
  )
}
