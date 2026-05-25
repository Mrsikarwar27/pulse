import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Play, Search, Plus, RefreshCw } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { searchSongs, playSongFromYouTube } from '../services/youtube'
import SongCard from '../components/ui/SongCard'
import ArtistCard from '../components/ui/ArtistCard'
import PlaylistCard from '../components/ui/PlaylistCard'

const categories = [
  { name: "Hindi Hits", query: "latest Hindi hits 2025" },
  { name: "Bollywood", query: "Bollywood songs 2025" },
  { name: "Punjabi", query: "latest Punjabi songs 2025" },
  { name: "Pop", query: "Hindi pop songs 2025" },
  { name: "Romantic", query: "Bollywood romantic songs 2025" },
  { name: "Party", query: "Bollywood party songs 2025" },
]

const artistsData = [
  { id: 1, name: "Arijit Singh", image: "https://picsum.photos/seed/artist1/200" },
  { id: 2, name: "Badshah", image: "https://picsum.photos/seed/artist2/200" },
  { id: 3, name: "Diljit Dosanjh", image: "https://picsum.photos/seed/artist3/200" },
  { id: 4, name: "Neha Kakkar", image: "https://picsum.photos/seed/artist4/200" },
  { id: 5, name: "Guru Randhawa", image: "https://picsum.photos/seed/artist5/200" },
]

const SectionHeader = ({ title, action, onAction }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-[22px] font-bold text-white">{title}</h2>
    {action && (
      <button onClick={onAction} className="text-[#a1a1a6] hover:text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors">
        {action} <ArrowRight size={14} />
      </button>
    )}
  </div>
)

export default function Home() {
  const { playSong, currentSong } = usePlayerStore()
  const [categorySongs, setCategorySongs] = useState({})
  const [loading, setLoading] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [error, setError] = useState(null)

  const fetchCategorySongs = async (category) => {
    const catName = category.name

    // Skip if already loaded and active
    if (categorySongs[catName]?.length > 0 && activeCategory === catName) {
      return
    }

    // Skip if already loaded (just show existing)
    if (categorySongs[catName]?.length > 0) {
      setActiveCategory(catName)
      return
    }

    setLoading(prev => ({ ...prev, [catName]: true }))
    setActiveCategory(catName)

    console.log(`Fetching category: ${catName} with query: ${category.query}`)

    try {
      const songs = await searchSongs(category.query)
      console.log(`Got ${songs?.length || 0} songs for ${catName}:`, songs)

      if (!Array.isArray(songs) || songs.length === 0) {
        console.log(`No songs found for ${catName}, showing fallback`)
        const fallback = Array.from({ length: 5 }).map((_, i) => ({
          id: `fallback-${catName}-${i}`,
          video_id: 'dQw4w9WgXcQ',
          title: `${catName} Song ${i + 1}`,
          channel_name: 'Sample Artist',
          thumbnail: `https://picsum.photos/seed/${catName}${i}/300`,
          duration: 180
        }))
        setCategorySongs(prev => ({ ...prev, [catName]: fallback }))
        setLoading(prev => ({ ...prev, [catName]: false }))
        return
      }

      const playableSongs = songs.map(song => ({
        id: song.id,
        video_id: song.id,
        title: song.title,
        channel_name: song.artist,
        thumbnail: song.thumbnail || `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`,
        duration: song.duration || 180
      }))

      console.log(`Mapped ${playableSongs.length} songs for ${catName}`)
      setCategorySongs(prev => ({ ...prev, [catName]: playableSongs }))
    } catch (error) {
      console.error(`Failed to fetch ${catName}:`, error.message)
      setError(error.message)
    }

    setLoading(prev => ({ ...prev, [catName]: false }))
  }

  const handleCategoryClick = (category) => {
    // Always fetch when clicking a category
    fetchCategorySongs(category)
  }

  const handlePlaySong = (song) => {
    const songs = categorySongs[activeCategory] || []
    playSong(song, songs)
  }

  const handlePlayAll = () => {
    if (activeCategory && categorySongs[activeCategory]?.length > 0) {
      playSong(categorySongs[activeCategory][0], categorySongs[activeCategory])
    }
  }

  useEffect(() => {
    const loadAndPlay = async () => {
      await fetchCategorySongs(categories[0])
      // Auto-play Hindi Hits after loading
      setTimeout(() => {
        const songs = categorySongs['Hindi Hits']
        if (songs && songs.length > 0) {
          playSong(songs[0], songs)
        }
      }, 1000)
    }
    loadAndPlay()
  }, [])

  return (
    <div className="space-y-10">
      {/* Hero Section - Blurred Background Only */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          height: '280px',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Blurred Background Image */}
        {currentSong?.thumbnail && (
          <div style={{
            position: 'absolute',
            inset: '-20px',
            backgroundImage: `url(${currentSong.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.5)',
            transition: 'background-image 0.5s ease'
          }} />
        )}

        {/* Default Gradient Fallback */}
        {!currentSong?.thumbnail && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom right, #1a1a2e, #16213e, #0f3460)'
          }} />
        )}

        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.4) 100%)'
        }} />

        {/* Bottom Fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: '#fc3c44',
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '9999px',
            marginBottom: '12px',
            width: 'fit-content'
          }}>
            {currentSong ? 'NOW PLAYING' : 'NEW'}
          </span>

          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
            lineHeight: 1.2,
            maxWidth: '500px'
          }}>
            {currentSong?.title || 'Listen Now'}
          </h1>

          <p style={{
            fontSize: '15px',
            color: '#a1a1a6',
            marginBottom: '20px',
            maxWidth: '400px'
          }}>
            {currentSong?.channel_name || 'Fresh music curated for you. Updated daily from YouTube.'}
          </p>

          {/* Play Button */}
          <div className="flex items-center">
            <button
              onClick={() => {
                const songs = categorySongs['Hindi Hits']
                if (songs && songs.length > 0) {
                  playSong(songs[0], songs)
                }
              }}
              style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              className="rounded-full bg-[#fc3c44] hover:bg-[#ff5c5c] text-white text-[14px] font-bold inline-flex items-center gap-2 transition-all hover:scale-[1.05] active:scale-[0.98]"
            >
              <Play size={16} fill="white" />
              <span>Play Hindi Hits</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          Failed to load songs: {error}
          <button onClick={() => { setError(null); fetchCategorySongs(categories[0]) }} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <section style={{ padding: '12px 0' }}>
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleCategoryClick(cat)}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
              className={`text-[13px] font-medium transition-all ${
                activeCategory === cat.name
                  ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/[0.06] text-[#a1a1a6] hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Section Heading */}
      {activeCategory && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }} className="text-white">{activeCategory}</h2>
        </div>
      )}

      {/* Active Category Results */}
      {activeCategory && categorySongs[activeCategory] && (
        <section>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <button
              onClick={handlePlayAll}
              style={{ padding: '6px 16px', borderRadius: '20px' }}
              className="flex items-center gap-2 bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white text-[12px] font-semibold transition-all hover:scale-[1.03]"
            >
              <Play size={12} fill="white" />
              Play All
            </button>
          </div>

          {loading[activeCategory] ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="text-[#fc3c44] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {categorySongs[activeCategory].map((song, i) => (
                <SongCard key={song.id} song={song} index={i} onPlay={handlePlaySong} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending Artists */}
      <section>
        <SectionHeader title="Popular Artists" />
        <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar">
          {artistsData.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} index={i} />
          ))}
        </div>
      </section>

      {/* More Categories - Skeleton Loaders */}
      {categories.slice(1).map((cat) => (
        !categorySongs[cat.name] && (
          <section key={cat.name}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-bold text-white">{cat.name}</h2>
              <button
                onClick={() => handleCategoryClick(cat)}
                className="text-[#a1a1a6] hover:text-white text-[13px] font-medium flex items-center gap-1.5"
              >
                Explore <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-white/[0.06] mb-3" />
                  <div className="h-4 w-3/4 bg-white/[0.06] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-white/[0.06] rounded" />
                </div>
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  )
}
