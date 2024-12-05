import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import { AlbumGrid } from './components/AlbumGrid/AlbumGrid'
import { FlipProvider } from './context/FlipContext'
import { ColorProvider } from './context/ColorContext'
import './App.css'

function App() {
  return (
    <Router>
      <ColorProvider>
        <FlipProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<AlbumGrid defaultSort="reviewDate" />} />
              <Route path="/leaderboard" element={<AlbumGrid defaultSort="plays" />} />
              <Route path="/album-age" element={<AlbumGrid defaultSort="releaseDate" />} />
              <Route path="/highest-rated" element={<AlbumGrid defaultSort="rating" />} />
              <Route path="/biggest-hits" element={<AlbumGrid defaultSort="topTrack" />} />
              <Route path="/top-listener" element={<AlbumGrid defaultSort="topListener" />} />
            </Routes>
          </Layout>
        </FlipProvider>
      </ColorProvider>
    </Router>
  )
}

export default App
