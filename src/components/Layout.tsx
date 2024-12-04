import HeaderMarquee from './HeaderMarquee';
import Turntable from './Turntable/Turntable';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout">
      <div style={{ marginTop: '-3rem' }}>
        <HeaderMarquee />
      </div>
      <Turntable />
      {children}
      <div className="copyright">
        © {currentYear} jamino
      </div>
    </div>
  );
}

export default Layout; 