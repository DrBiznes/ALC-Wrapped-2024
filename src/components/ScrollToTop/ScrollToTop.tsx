import { motion, useScroll, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const { scrollY } = useScroll();
  const controls = useAnimationControls();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    return scrollY.on('change', (latest) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (latest > 100) {
          controls.start({ 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" }
          });
        } else {
          controls.start({ 
            opacity: 0, 
            y: 20,
            transition: { duration: 0.3, ease: "easeIn" }
          });
          document.activeElement instanceof HTMLElement && document.activeElement.blur();
        }
      }, 50); // 50ms debounce
    });
  }, [scrollY, controls]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.button
      className="scroll-to-top"
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{ 
        color: document.activeElement === document.querySelector('.scroll-to-top') 
          ? '#a76acd' // lighter purple when focused
          : '#8332AC' // original purple
      }}
    >
      <svg 
        width="32"
        height="32"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </motion.button>
  );
};

export default ScrollToTop; 