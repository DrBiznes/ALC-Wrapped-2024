import { DvdScreensaver } from 'react-dvd-screensaver';
import { useMemo } from 'react';
import './HeadScreensaver.css';

interface HeadScreensaverProps {
  speed?: number;
}

const HeadScreensaver = ({ speed = 0.8 }: HeadScreensaverProps) => {
  const images = [
    '/head.png',
    '/head2.png',
    '/head3.png'
  ];

  const randomImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }, []); // Empty dependency array ensures this only runs once when component mounts

  return (
    <div className="screensaver-wrapper">
      <DvdScreensaver
        speed={speed}
        className="screensaver-container"
      >
        <div className="head-container">
          <img 
            src={randomImage} 
            alt="Floating head" 
            className="floating-head"
          />
          <div className="head-text">My Honest Reaction</div>
        </div>
      </DvdScreensaver>
    </div>
  );
};

export default HeadScreensaver; 