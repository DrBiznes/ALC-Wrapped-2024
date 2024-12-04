import Layout from './components/Layout'
import { AlbumGrid } from './components/AlbumGrid/AlbumGrid'
import { FlipProvider } from './context/FlipContext'
import './App.css'

function App() {
  return (
    <FlipProvider>
      <Layout>
        <AlbumGrid />
      </Layout>
    </FlipProvider>
  )
}

export default App
