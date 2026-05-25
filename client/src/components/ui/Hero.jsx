import { motion } from 'framer-motion'
import { Play, Heart } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function Hero({ onPlayAll }) {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore()

  const handlePlay = () => {
    if (currentSong) togglePlay()
    else onPlayAll?.()
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl h-[240px] md:h-[280px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#fc3c44]/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[60px]" />
      
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-[#fc3c44] text-white text-[10px] font-semibold rounded">NEW</span>
        </div>
        
        <h1 className="text-[32px] md:text-[40px] font-bold text-white mb-2">
          Listen Now
        </h1>
        
        <p className="text-[14px] text-[#a1a1a6] mb-4 max-w-md">
          Fresh music curated for you. Updated daily.
        </p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePlay}
            className="h-9 px-5 rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white text-[13px] font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Play size={14} fill="white" />
            Play
          </button>
          <button className="h-9 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium backdrop-blur-sm transition-all hover:scale-[1.02] flex items-center gap-2">
            <Heart size={14} />
            Save
          </button>
        </div>
      </div>

      <div className="absolute right-5 bottom-5 hidden lg:flex items-end gap-2">
        <img src="https://picsum.photos/seed/cover1/100" className="w-20 h-20 rounded-lg shadow-lg" alt="" />
        <img src="https://picsum.photos/seed/cover2/100" className="w-20 h-20 rounded-lg shadow-lg" alt="" />
      </div>
    </motion.section>
  )
}