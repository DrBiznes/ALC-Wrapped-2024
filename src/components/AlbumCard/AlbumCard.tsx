import { motion } from 'framer-motion';
import React from 'react';
import { AlbumScrobbles } from '../../config/scrobbles';
import './AlbumCard.css';
import { useState, useEffect } from 'react';
import { TrackScrobbles } from '../../config/tracks';
import Marquee from 'react-fast-marquee';
import { useFlip } from '../../context/FlipContext';

interface AlbumCardProps {
  album: {
    name: string;
    artist: string;
    albumCoverUrl: string;
    releaseDate: string;
    reviewDate: string;
    alcRating: string;
  };
  scrobbleData: AlbumScrobbles;
  sortType: string;
  trackData?: TrackScrobbles;
}

const getColorFromImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
      if (!imageData) {
        resolve('hsl(250, 40%, 50%)'); // Fallback color
        return;
      }

      // Get average color from the image
      let r = 0, g = 0, b = 0;
      const step = 4;
      let count = 0;
      
      for (let i = 0; i < imageData.length; i += 4 * step) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      // Convert to HSL
      const [h, s, l] = rgbToHsl(r, g, b);
      
      // Create a harmonious color by shifting the hue by 30-60 degrees
      // and adjusting saturation/lightness for better aesthetics
      const hueShift = 45; // Try different values between 30-60
      const newHue = (h + hueShift) % 360;
      
      // Adjust saturation and lightness based on the original color
      const newSaturation = Math.min(s * 100 + 10, 60);
      const newLightness = Math.min(Math.max(l * 100 + 20, 50), 85);
      
      resolve(`hsl(${newHue}, ${newSaturation}%, ${newLightness}%)`);
    };

    img.onerror = () => {
      resolve('hsl(250, 40%, 50%)'); // Fallback color
    };

    img.src = imageUrl;
  });
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), s, l];
};

export const AlbumCard: React.FC<AlbumCardProps> = React.memo(({ album, scrobbleData, sortType, trackData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cardColor, setCardColor] = useState<string>('hsl(250, 40%, 90%)');
  const [isFlipping, setIsFlipping] = useState(false);
  const { isGlobalFlipped, individualFlips, setIndividualFlip } = useFlip();

  const albumId = `${album.name}-${album.artist}`;

  const handleClick = () => {
    if (!isDragging) {
      setIsFlipping(true);
      const currentFlip = individualFlips[albumId] || false;
      setIndividualFlip(albumId, !currentFlip);
      setTimeout(() => setIsFlipping(false), 400);
    }
  };

  const isCardFlipped = individualFlips[albumId] ?? isGlobalFlipped;

  useEffect(() => {
    const controller = new AbortController();
    getColorFromImage(album.albumCoverUrl)
      .then(color => {
        if (!controller.signal.aborted) {
          setCardColor(color);
        }
      });
    return () => controller.abort();
  }, [album.albumCoverUrl]);

  const getTotalPlays = () => {
    return Object.values(scrobbleData.userScrobbles).reduce((sum, plays) => sum + plays, 0);
  };

  const getSortTypeText = () => {
    switch (sortType) {
      case 'topTrack':
        return trackData ? 
          `Most Played: ${trackData.mostScrobbledTrack} (${trackData.totalScrobbles} plays)` : 
          'No track data';
      case 'releaseDate':
        return `Released: ${album.releaseDate}`;
      case 'reviewDate':
        return `Reviewed: ${album.reviewDate}`;
      case 'rating':
        return `Rating: ${album.alcRating}`;
      case 'plays':
        return `Total Plays: ${getTotalPlays()}`;
      default:
        return '';
    }
  };

  const getBottomStats = () => {
    switch (sortType) {
      case 'topTrack':
        return (
          <>
            <span>Released: {album.releaseDate}</span>
            <span>Rating: {album.alcRating}</span>
          </>
        );
      case 'plays':
        return (
          <>
            <span>Released: {album.releaseDate}</span>
            <span>Rating: {album.alcRating}</span>
          </>
        );
      case 'releaseDate':
        return (
          <>
            <span>Rating: {album.alcRating}</span>
            <span>Plays: {getTotalPlays()}</span>
          </>
        );
      case 'rating':
        return (
          <>
            <span>Released: {album.releaseDate}</span>
            <span>Plays: {getTotalPlays()}</span>
          </>
        );
      case 'reviewDate':
        return (
          <>
            <span>Rating: {album.alcRating}</span>
            <span>Released: {album.releaseDate}</span>
          </>
        );
      default:
        return (
          <>
            <span>Rating: {album.alcRating}</span>
            <span>Plays: {getTotalPlays()}</span>
          </>
        );
    }
  };

  const renderCardBack = () => {
    if (sortType === 'plays') {
      return (
        <>
          <h3>Listener Leaderboard</h3>
          <div 
            className="leaderboard-list no-drag"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {Object.entries(scrobbleData.userScrobbles)
              .sort(([, a], [, b]) => b - a)
              .map(([user, plays], index) => (
                <div key={user} className="leaderboard-item">
                  <div className="leaderboard-rank-name">
                    <span className="rank">#{index + 1}</span>
                    <span className="user-name">{user}</span>
                  </div>
                  <span className="user-plays">{plays} plays</span>
                </div>
              ))}
          </div>
        </>
      );
    }

    return (
      <>
        <h3>Track Listing</h3>
        <div 
          className="track-list no-drag"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {trackData && Object.entries(trackData.trackScrobbles).map(([track, plays]) => (
            <div key={track} className="track-item">
              <div className="track-name-container">
                {track.length > 25 ? (
                  <Marquee gradient={false} speed={20}>
                    <span className="track-name">{track}</span>
                  </Marquee>
                ) : (
                  <span className="track-name">{track}</span>
                )}
              </div>
              <span className="track-plays">{plays} plays</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  useEffect(() => {
    const element = document.documentElement;
    element.style.setProperty('--hover-transition-duration', '0.2s');
    element.style.setProperty('--hover-transition-timing', 'cubic-bezier(0.215, 0.61, 0.355, 1)');
  }, []);

  return (
    <motion.div 
      className="album-card-container"
      layoutId={`${album.name}-${album.artist}`}
      layout="position"
      drag={!isCardFlipped}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      dragTransition={{
        bounceStiffness: 600,
        bounceDamping: 50
      }}
      whileDrag={{ scale: 1.02 }}
      whileHover={!isCardFlipped ? { y: -16 } : undefined}
      transition={{
        y: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      data-dragging={isDragging}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onClick={handleClick}
    >
      <motion.div 
        className="album-card"
        initial={false}
        animate={{ 
          rotateY: isCardFlipped ? 180 : 0
        }}
        transition={{ 
          duration: 0.4,
          type: "tween",
          ease: "easeInOut"
        }}
        data-flipped={isCardFlipped}
        data-flipping={isFlipping}
        style={{
          '--card-color': cardColor,
          color: 'rgba(0, 0, 0, 0.8)',
          cursor: isDragging ? 'grabbing' : 'grab',
          willChange: 'transform'
        } as React.CSSProperties}
      >
        {/* Front of card */}
        <div className="card-front">
          <img src={album.albumCoverUrl} alt={`${album.name} cover`} className="album-cover" />
          <div className="album-info">
            <div className="album-name-container">
              {!isFlipping && album.name.length > 25 ? (
                <Marquee gradient={false} speed={20}>
                  <h2 className="album-name">{album.name}</h2>
                </Marquee>
              ) : (
                <h2 className="album-name">{album.name}</h2>
              )}
            </div>
            <h3 className="artist-name">{album.artist}</h3>
            <div className="sort-info-container">
              {!isFlipping && getSortTypeText().length > 35 ? (
                <Marquee gradient={false} speed={20}>
                  <p className="sort-info">{getSortTypeText()}</p>
                </Marquee>
              ) : (
                <p className="sort-info">{getSortTypeText()}</p>
              )}
            </div>
            <div className="stats">
              {getBottomStats()}
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="card-back">
          {renderCardBack()}
        </div>
      </motion.div>
    </motion.div>
  );
});