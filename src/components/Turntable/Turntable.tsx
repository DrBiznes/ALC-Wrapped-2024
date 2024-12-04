import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Turntable.css';

const Turntable: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    setRotation(angle * (180 / Math.PI));
  };

  return (
    <div className="turntable-container">
      <div className="record-wrapper" onMouseMove={handleMouseMove}>
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
      </div>
    </div>
  );
};

export default Turntable; 