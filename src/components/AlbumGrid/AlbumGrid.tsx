import { useState } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { albumsData } from '../../config/albums';
import { scrobbleData } from '../../config/scrobbles';
import { trackData } from '../../config/tracks';
import { AlbumCard } from '../AlbumCard/AlbumCard';
import './AlbumGrid.css';
import { motion } from 'framer-motion';

const sortOptions = [
  { value: 'reviewDate', label: 'CHRONOLOGICAL ORDER', displayLabel: 'CHRONOLOGICAL ORDER ▼' },
  { value: 'releaseDate', label: 'ALBUM AGE', displayLabel: 'ALBUM AGE ▼' },
  { value: 'rating', label: 'HIGHEST RATED', displayLabel: 'HIGHEST RATED ▼' },
  { value: 'plays', label: 'LEADERBOARD', displayLabel: 'LEADERBOARD ▼' },
  { value: 'topTrack', label: 'BIGGEST HITS', displayLabel: 'BIGGEST HITS ▼' },
];

export const AlbumGrid = () => {
  const [sortType, setSortType] = useState('reviewDate');

  const selectedOption = sortOptions.find(option => option.value === sortType);

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
        <p className="sort-description">Click the record to reveal more info or change the sort order below</p>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <motion.div
            className="sort-select-wrapper"
            initial={{ width: 'auto' }}
            animate={{ width: 'auto' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            layout
          >
            <select 
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="sort-select"
            >
              <option value={selectedOption?.value}>
                {selectedOption?.displayLabel}
              </option>
              {sortOptions
                .filter(option => option.value !== sortType)
                .map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </select>
          </motion.div>
        </div>
      </div>
      
      <Flipper
        flipKey={sortType}
        className="album-grid"
        spring={{ stiffness: 280, damping: 24 }}
      >
        {getSortedAlbums().map((album, index) => {
          const albumScrobbles = scrobbleData.find(
            s => s.album === album.name && s.artist === album.artist
          );
          const albumTrackData = trackData.find(
            t => t.album === album.name && t.artist === album.artist
          );
          
          return (
            <Flipped
              key={`${album.name}-${album.artist}`}
              flipId={`${album.name}-${album.artist}`}
            >
              <div className="album-grid-item">
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
                  index={index}
                />
              </div>
            </Flipped>
          );
        })}
      </Flipper>
    </div>
  );
};