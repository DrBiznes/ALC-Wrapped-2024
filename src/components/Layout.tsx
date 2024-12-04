import HeaderMarquee from './HeaderMarquee';
import Turntable from './Turntable/Turntable';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <HeaderMarquee />
      <Turntable />
      {children}
    </div>
  );
}

export default Layout; 