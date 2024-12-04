import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { albumsData } from '../../config/albums';
import { scrobbleData } from '../../config/scrobbles';
import { trackData } from '../../config/tracks';
import { AlbumCard } from '../AlbumCard/AlbumCard';
import './AlbumGrid.css';

const sortOptions = [
  { value: 'reviewDate', label: 'Review Date' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'rating', label: 'Rating' },
  { value: 'plays', label: 'Total Plays' },
  { value: 'topTrack', label: 'Most Played Track' },
];

export const AlbumGrid = () => {
  const [sortType, setSortType] = useState('reviewDate');

  const getSortedAlbums = () => {
    return [...albumsData].sort((a, b) => {
      const aScrobbles = scrobbleData.find(s => s.album === a.name && s.artist === a.artist);
      const bScrobbles = scrobbleData.find(s => s.album === b.name && s.artist === b.artist);
      const aTrackData = trackData.find(t => t.album === a.name && t.artist === a.artist);
      const bTrackData = trackData.find(t => t.album === b.name && t.artist === b.artist);

      const getAlbumPlays = (scrobbles: typeof scrobbleData[0] | undefined) => {
        if (!scrobbles) return 0;
        return Object.values(scrobbles.userScrobbles).reduce((sum, plays) => sum + plays, 0);
      };

      switch (sortType) {
        case 'plays': {
          const aPlays = getAlbumPlays(aScrobbles);
          const bPlays = getAlbumPlays(bScrobbles);
          return bPlays - aPlays;
        }
        case 'releaseDate':
          return parseInt(b.releaseDate) - parseInt(a.releaseDate);
        case 'rating':
          return parseFloat(b.alcRating) - parseFloat(a.alcRating);
        case 'reviewDate':
          return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
        case 'topTrack': {
          const aPlays = aTrackData?.totalScrobbles || 0;
          const bPlays = bTrackData?.totalScrobbles || 0;
          return bPlays - aPlays;
        }
        default:
          return 0;
      }
    });
  };

  return (
    <div className="album-grid-container">
      <div className="sort-controls">
        <select 
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="sort-select"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <motion.div 
        className="album-grid"
        layout
      >
        <AnimatePresence mode="popLayout">
          {getSortedAlbums().map((album, index) => {
            const albumScrobbles = scrobbleData.find(
              s => s.album === album.name && s.artist === album.artist
            );
            const albumTrackData = trackData.find(
              t => t.album === album.name && t.artist === album.artist
            );
            
            return (
              <motion.div
                key={`${album.name}-${album.artist}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'relative', zIndex: 0 }}
                whileHover={{ zIndex: 1 }}
              >
                <AlbumCard
                  album={album}
                  scrobbleData={albumScrobbles || {
                    artist: album.artist,
                    album: album.name,
                    topListener: 'None',
                    topScrobbles: 0,
                    userScrobbles: {}
                  }}
                  sortType={sortType}
                  trackData={albumTrackData}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};