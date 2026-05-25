import { useState, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import Sidebar from "../components/layout/Sidebar"
import Navbar from "../components/layout/Navbar"
import MusicPlayer from "../components/player/MusicPlayer"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden"
              onClick={handleSidebarClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[280px] h-screen z-50 bg-[#1d1d1f] lg:hidden"
            >
              <Sidebar onClose={handleSidebarClose} isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Fixed icon bar */}
      <aside className="hidden lg:block w-14 shrink-0 h-screen sticky top-0">
        <div className="h-full bg-black border-r border-white/[0.06]">
          <Sidebar onClose={handleSidebarClose} isMobile={false} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20">

        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-6 py-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Music Player - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <MusicPlayer />
      </div>
    </div>
  )
}
