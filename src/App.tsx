import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import { AlbumGrid } from './components/AlbumGrid/AlbumGrid'
import { FlipProvider } from './context/FlipContext'
import './App.css'

function App() {
  return (
    <Router>
      <FlipProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<AlbumGrid defaultSort="reviewDate" />} />
            <Route path="/leaderboard" element={<AlbumGrid defaultSort="plays" />} />
            <Route path="/album-age" element={<AlbumGrid defaultSort="releaseDate" />} />
            <Route path="/highest-rated" element={<AlbumGrid defaultSort="rating" />} />
            <Route path="/biggest-hits" element={<AlbumGrid defaultSort="topTrack" />} />
          </Routes>
        </Layout>
      </FlipProvider>
    </Router>
  )
}

export default App
