import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function AlbumCard({ album, index = 0, onClick }) {
  const { currentSong, isPlaying, playSong } = usePlayerStore()

  const handleClick = () => {
    if (onClick) {
      onClick(album)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      onClick={handleClick}
      className="group relative bg-[#181818] rounded-xl p-3 hover:bg-[#282828] transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
        <img 
          src={album.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'} 
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <motion.div
          initial={{ scale: 0, y: 10 }}
          whileHover={{ scale: 1, y: 0 }}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#fc3c44] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <Play size={20} className="text-black ml-1" fill="black" />
        </motion.div>
      </div>

      <h3 className="font-semibold text-white text-sm truncate mb-1">{album.title}</h3>
      <p className="text-gray-400 text-xs truncate">{album.artist || "Various Artists"}</p>
    </motion.div>
  )
}