# Album Listening Club Wrapped

A Spotify Wrapped-style website for the University of Oregon Album Listening Club, built with React 18 and Vite. The project uses Framer Motion and React-Flip-Toolkit for smooth animations, React Router for navigation, and CSS Modules for styling. Data is sourced from the Last.FM API using Python scripts to generate TypeScript data files, providing a complete view of the club's listening history. The site features interactive album cards, dynamic sorting, and animated transitions.

## Overview

This website displays album listening data and reviews from the Album Listening Club, featuring:
- Album review chronology
- Most played albums and tracks
- Listener leaderboards
- Album age sorting
- Rating-based sorting
- Interactive album cards with detailed statistics

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

## Updating Data for Future Years

The website uses three Python scripts to fetch and format data from Last.FM. These scripts are located in the `lastfm-scripts` directory:

### 1. Album Data Script (`album_grabber.py`)
- Updates basic album information (cover art, release dates, etc.)
- Creates `Albums.ts`

Steps:
1. Update the `albums` list in the script with new albums
2. Run the script: `python album_grabber.py`
3. Enter your Last.FM API key when prompted
4. The script will generate `Albums.ts` with updated album data

### 2. Track Data Script (`track_scrobbles.py`)
- Fetches track-level listening data
- Creates `Tracks.ts`

Steps:
1. Ensure the `albums` list matches `album_grabber.py`
2. Update the `users` list if club membership has changed
3. Run the script: `python track_scrobbles.py`
4. Enter your Last.FM API key
5. The script will generate `Tracks.ts` with track-specific statistics

### 3. User Scrobbles Script (`user_scrobbles.py`)
- Collects user-level listening statistics
- Creates `Scrobbles.ts`

Steps:
1. Verify the `albums` and `users` lists are current
2. Run the script: `python user_scrobbles.py`
3. Enter your Last.FM API key
4. The script will generate `Scrobbles.ts` with user listening data

### Important Notes

- You'll need a Last.FM API key (get one at: https://www.last.fm/api)
- When adding new albums, ensure consistent naming across all three scripts
- Album names should match exactly how they appear on Last.FM
- The scripts create backups with timestamps in case of errors
- Run scripts in order: album_grabber → track_scrobbles → user_scrobbles

### Updating the Website

1. Run all three scripts to generate new data files
2. Copy the generated `.ts` files to `src/config/`
3. Update the review dates and ratings in `Albums.ts` manually
4. Test the website locally with `npm run dev`
5. Deploy using your preferred method

## Manual Data Updates

If needed, you can manually edit the following files in `src/config/`:
- `albums.ts`: Basic album information and ratings
- `tracks.ts`: Track-specific listening data
- `scrobbles.ts`: User listening statistics

## Troubleshooting

Common issues and solutions:

1. **Missing Album Data**
   - Verify album names match Last.FM exactly
   - Check for special characters or alternate versions

2. **Rate Limiting**
   - Scripts include built-in delays to respect Last.FM's API limits
   - If you get rate limit errors, increase delay values in the scripts

3. **Incomplete Track Data**
   - Some albums (especially new releases) might have multiple versions
   - The scripts attempt to combine data from different versions
   - Check the Last.FM API response for debugging
