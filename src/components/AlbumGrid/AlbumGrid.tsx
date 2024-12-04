import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { albumsData } from '../../config/albums';
import { scrobbleData } from '../../config/scrobbles';
import { AlbumCard } from '../AlbumCard/AlbumCard';
import './AlbumGrid.css';

const sortOptions = [
  { value: 'reviewDate', label: 'Review Date' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'rating', label: 'Rating' },
  { value: 'topListener', label: 'Top Listener' },
];

export const AlbumGrid = () => {
  const [sortType, setSortType] = useState('reviewDate');

  const getSortedAlbums = () => {
    return [...albumsData].sort((a, b) => {
      switch (sortType) {
        case 'releaseDate':
          return parseInt(b.releaseDate) - parseInt(a.releaseDate);
        case 'rating':
          return parseFloat(b.alcRating) - parseFloat(a.alcRating);
        case 'reviewDate':
          return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
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
        <AnimatePresence>
          {getSortedAlbums().map(album => {
            const albumScrobbles = scrobbleData.find(
              s => s.album === album.name && s.artist === album.artist
            );
            
            return (
              <AlbumCard
                key={`${album.name}-${album.artist}`}
                album={album}
                scrobbleData={albumScrobbles || {
                  artist: album.artist,
                  album: album.name,
                  topListener: 'None',
                  topScrobbles: 0,
                  userScrobbles: {}
                }}
                sortType={sortType}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 