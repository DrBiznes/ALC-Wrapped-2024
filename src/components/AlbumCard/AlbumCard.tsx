import { motion } from 'framer-motion';
import { AlbumScrobbles } from '../../config/scrobbles';
import './AlbumCard.css';

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
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, scrobbleData, sortType }) => {
  const getTotalPlays = () => {
    return Object.values(scrobbleData.userScrobbles).reduce((sum, plays) => sum + plays, 0);
  };

  const getSortTypeText = () => {
    switch (sortType) {
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

  return (
    <motion.div 
      className="album-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <img src={album.albumCoverUrl} alt={`${album.name} cover`} className="album-cover" />
      <div className="album-info">
        <h2 className="album-name">{album.name}</h2>
        <h3 className="artist-name">{album.artist}</h3>
        <p className="sort-info">{getSortTypeText()}</p>
        <div className="stats">
          <span>Rating: {album.alcRating}</span>
          <span>Plays: {getTotalPlays()}</span>
        </div>
      </div>
    </motion.div>
  );
};