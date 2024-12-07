import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  sortType?: string;
}

const getSortTypeTitle = (sortType: string = 'reviewDate'): string => {
  switch (sortType) {
    case 'plays':
      return 'Most Played Albums | ALC Wrapped 2024';
    case 'topTrack':
      return 'Biggest Hits | ALC Wrapped 2024';
    case 'rating':
      return 'Highest Rated Albums | ALC Wrapped 2024';
    case 'releaseDate':
      return 'Albums by Age | ALC Wrapped 2024';
    case 'topListener':
      return 'Top Listeners | ALC Wrapped 2024';
    default:
      return 'ALC Wrapped 2024';
  }
};

const SEO = ({
  description = "University of Oregon Album Listening Club's year-end music review and statistics for 2024. Explore our favorite albums, most played tracks, and listener statistics.",
  keywords = "UO Album Listening Club, University of Oregon, ALC Wrapped 2024, Music Review, Album Reviews, Music Statistics",
  image = "/alcbanner.png",
  url = "https://alc.jamino.me",
  type = "website",
  sortType
}: SEOProps) => {
  const title = getSortTypeTitle(sortType);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "UO Album Listening Club",
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/alciconpng.png`
      }
    }
  };

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <meta name="theme-color" content="#8332AC" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="UO Album Listening Club" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO tags */}
      <link rel="canonical" href={url} />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="jamino" />
      
      {/* Favicons */}
      <link rel="icon" type="image/ico" href="/alcicon.ico" />
      <link rel="icon" type="image/png" href="/alciconpng.png" />
      <link rel="apple-touch-icon" href="/alciconpng.png" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO; 