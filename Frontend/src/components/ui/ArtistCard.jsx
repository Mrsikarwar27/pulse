import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function ArtistCard({ artist, index }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/search?q=${encodeURIComponent(artist.name)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      onClick={handleClick}
      className="flex-shrink-0 text-center cursor-pointer group"
    >
      <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-[#fc3c44] group-hover:scale-105 transition-all duration-300 shadow-lg mx-auto">
        <img
          src={artist.image || artist.cover_url}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <h3 className="font-semibold text-white text-[13px] mb-0.5 truncate max-w-[130px] mx-auto">{artist.name}</h3>
      <p className="text-[#6e6e73] text-[11px]">Artist</p>
    </motion.div>
  )
}
