import { Helmet } from 'react-helmet-async'

const SEO = () => {
  const title = "UO Album Listening Club Wrapped 2024"
  const description = "University of Oregon Album Listening Club's year-end music review and statistics for 2024. Explore our favorite albums, most played tracks, and listener statistics."
  const keywords = "UO Album Listening Club, University of Oregon, ALC Wrapped 2024, Music Review, Album Reviews, Music Statistics"
  const url = "https://alc.jamino.me"

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/alcbanner.png" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/alcbanner.png" />
      
      {/* Additional SEO tags */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="jamino" />
    </Helmet>
  )
}

export default SEO 