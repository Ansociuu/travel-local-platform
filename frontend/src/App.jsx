import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import HomestayList from './pages/HomestayList'
import HomestayDetail from './pages/HomestayDetail'
import Experiences from './pages/Experiences'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Translate from './pages/Translate'
import ExperienceDetail from './pages/ExperienceDetail'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get current view based on pathname for active styling in Navbar/BottomNav
  const getCurrentView = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path.startsWith('/homestay/')) return 'detail'
    if (path === '/homestay') return 'homestays'
    if (path === '/experiences') return 'experiences'
    if (path.startsWith('/experiences/')) return 'experience_detail'
    if (path === '/community') return 'community'
    if (path === '/messages') return 'translate'
    if (path === '/profile') return 'profile'
    if (path === '/login') return 'login'
    if (path === '/register') return 'register'
    if (path === '/admin') return 'admin'
    return 'home'
  }

  const handleNavigate = (view, id) => {
    switch (view) {
      case 'home': navigate('/'); break
      case 'homestays': navigate('/homestay'); break
      case 'experiences': navigate('/experiences'); break
      case 'experience_detail': navigate(`/experiences/${id || '1'}`); break
      case 'community': navigate('/community'); break
      case 'translate': navigate('/messages'); break
      case 'profile': navigate('/profile'); break
      case 'detail': navigate(`/homestay/${id || '1'}`); break
      case 'login': navigate('/login'); break
      case 'register': navigate('/register'); break
      case 'admin': navigate('/admin'); break
      default: navigate('/'); break
    }
  }

  const view = getCurrentView()
  const isAuthPage = view === 'login' || view === 'register'
  const isAdminPage = view === 'admin'
  const shouldHideUI = isAuthPage || isAdminPage

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <ScrollToTop />
      {/* Fixed Header Navbar */}
      {!shouldHideUI && <Navbar view={view} onNavigate={handleNavigate} />}

      {/* Main Content Area */}
      <div className={`flex-grow ${(!shouldHideUI) ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Home onNavigate={handleNavigate} />} />
          <Route path="/homestay" element={<HomestayList onNavigate={handleNavigate} />} />
          <Route path="/homestay/:id" element={<HomestayDetail onNavigate={handleNavigate} />} />
          <Route path="/experiences" element={<Experiences onNavigate={handleNavigate} />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/messages" element={<Translate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard onNavigate={handleNavigate} />} />
        </Routes>
      </div>

      {/* Footer & Navigation for Mobile */}
      {!shouldHideUI && (
        <>
          <Footer />
          <BottomNav view={view} onNavigate={handleNavigate} />
        </>
      )}
    </div>
  )
}

export default App
