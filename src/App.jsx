import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Navigation from './components/Navigation'
import CelebrationModal from './components/CelebrationModal'
import Welcome from './pages/Welcome'
import ChildDashboard from './pages/ChildDashboard'
import BookLibrary from './pages/BookLibrary'
import BookDetail from './pages/BookDetail'
import TrailNoteForm from './pages/TrailNoteForm'
import TrailNotesList from './pages/TrailNotesList'
import VocabularyPage from './pages/VocabularyPage'
import BadgesPage from './pages/BadgesPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminBooks from './pages/AdminBooks'
import AdminTemplates from './pages/AdminTemplates'
import AdminProfiles from './pages/AdminProfiles'

function AppContent() {
  const {
    activeProfile,
    currentPage,
    showCelebration,
    setShowCelebration,
  } = useApp()

  // Update CSS variables whenever activeProfile changes
  useEffect(() => {
    if (activeProfile) {
      const root = document.documentElement
      root.style.setProperty('--theme-color', activeProfile.themeColor)
      root.style.setProperty('--theme-light', activeProfile.themeColorLight)
      root.style.setProperty('--theme-dark', activeProfile.themeColorDark)
    }
  }, [activeProfile])

  const renderPage = () => {
    if (!activeProfile && currentPage !== 'welcome') {
      return <Welcome />
    }

    switch (currentPage) {
      case 'welcome':
        return <Welcome />
      case 'dashboard':
        return <ChildDashboard />
      case 'books':
        return <BookLibrary />
      case 'book-detail':
        return <BookDetail />
      case 'trail-notes':
        return <TrailNotesList />
      case 'add-trail-note':
        return <TrailNoteForm />
      case 'vocabulary':
        return <VocabularyPage />
      case 'badges':
        return <BadgesPage />
      case 'admin':
        return <AdminDashboard />
      case 'admin-books':
        return <AdminBooks />
      case 'admin-templates':
        return <AdminTemplates />
      case 'admin-profiles':
        return <AdminProfiles />
      default:
        return <Welcome />
    }
  }

  const showNav = activeProfile && currentPage !== 'welcome'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showNav && <Navigation />}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderPage()}
      </main>

      {showCelebration && (
        <CelebrationModal
          bookId={showCelebration}
          onClose={() => setShowCelebration(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
