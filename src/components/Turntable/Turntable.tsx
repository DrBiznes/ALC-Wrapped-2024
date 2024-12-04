import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Turntable.css';
import { useFlip } from '../../context/FlipContext';

const Turntable: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const { toggleGlobalFlip } = useFlip();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    setRotation(angle * (180 / Math.PI));
  };

  const handleClick = () => {
    toggleGlobalFlip();
  };

  return (
    <div className="turntable-container">
      <div 
        className="record-wrapper" 
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <motion.div 
          className="record-grooves"
          animate={{ rotate: rotation }}
          transition={{ type: "tween", duration: 0.1 }}
        />
        <div className="record-label" />
        <motion.div
          className="label-content"
          animate={{ rotate: rotation }}
          transition={{ type: "tween", duration: 0.1 }}
        >
          <span className="label-text top">I</span>
          <div className="heart">❤️</div>
          <span className="label-text bottom">ALC</span>
        </motion.div>
        <div className="center-hole" />
        <div className="tone-arm">
          <div className="tone-arm-base" />
          <div className="tone-arm-body">
            <div className="tone-arm-head" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turntable; 