import { DvdScreensaver } from 'react-dvd-screensaver';
import './HeadScreensaver.css';

const HeadScreensaver = () => {
  return (
    <div className="screensaver-wrapper">
      <DvdScreensaver
        speed={1.5}
        className="screensaver-container"
      >
        <div className="head-container">
          <img 
            src="/head.png" 
            alt="Floating head" 
            className="floating-head"
          />
        </div>
      </DvdScreensaver>
    </div>
  );
};

export default HeadScreensaver; 