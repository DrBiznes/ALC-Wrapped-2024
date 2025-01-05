import { FaGithub, FaGlobe, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  
  return (
    <footer className="footer">
      <h2 className="footer-text">I ♡ MUSIC</h2>
      <div className="social-links">
        <a 
          href="https://github.com/DrBiznes/ALC-Wrapped-2024" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
        >
          <FaGithub />
        </a>
        <a 
          href="https://jamino.me" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Personal Website"
        >
          <FaGlobe />
        </a>
        <a 
          href="https://instagram.com/uoalbumclub" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
      </div>
      <div className="footer-legal">
        <span>© 2024 jamino</span>
        <span className="separator">|</span>
        <span>MIT License</span>
      </div>
    </footer>
  );
};

export default Footer; 