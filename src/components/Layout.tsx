import { useLocation } from 'react-router-dom';
import HeaderMarquee from './HeaderMarquee';
import Turntable from './Turntable/Turntable';
import ScrollToTop from './ScrollToTop/ScrollToTop';
import HeadScreensaver from './HeadScreensaver/HeadScreensaver';
import SEO from './SEO';
import Footer from './Footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const getSortTypeFromPath = (path: string): string => {
    switch (path) {
      case '/most-played':
        return 'plays';
      case '/biggest-hits':
        return 'topTrack';
      case '/highest-rated':
        return 'rating';
      case '/album-age':
        return 'releaseDate';
      case '/leaderboard':
        return 'topListener';
      default:
        return 'reviewDate';
    }
  };

  const currentSortType = getSortTypeFromPath(location.pathname);

  return (
    <div className="layout">
      <SEO sortType={currentSortType} />
      <HeadScreensaver speed={0.5} />
      <div style={{ marginTop: '-3rem' }}>
        <HeaderMarquee />
      </div>
      <Turntable />
      {children}
      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default Layout; 