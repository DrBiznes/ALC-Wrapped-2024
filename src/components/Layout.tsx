import { useLocation } from 'react-router-dom';
import HeaderMarquee from './HeaderMarquee';
import Turntable from './Turntable/Turntable';
import ScrollToTop from './ScrollToTop/ScrollToTop';
import HeadScreensaver from './HeadScreensaver/HeadScreensaver';
import SEO from './SEO';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Get sort type from path
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
      <div className="copyright">
        © {currentYear} jamino
      </div>
    </div>
  );
}

export default Layout; 