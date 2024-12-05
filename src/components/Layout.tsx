import HeaderMarquee from './HeaderMarquee';
import Turntable from './Turntable/Turntable';
import ScrollToTop from './ScrollToTop/ScrollToTop';
import HeadScreensaver from './HeadScreensaver/HeadScreensaver';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout">
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