import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import asyncio
import aiohttp
import json
from datetime import datetime
import time
from collections import defaultdict
from typing import Dict, List, Optional
import platform

class LastFMTrackAnalyzer:
    def __init__(self, root):
        self.root = root
        self.root.title("Last.FM Album Track Analyzer")
        self.root.geometry("800x800")  # Increased height for detailed progress
        
        # Users and Albums Data
        self.users = [
            'alauerbach03', 'wap_king', 'liverbagg', 'apppapapapiss',
            'fergo555', 'McBungus', 'Arisenstring956', 'CaptainOnion13',
            'lucyacheson', 'jontomdotcom', 'Flamboh', 'bob10234', 'Scroetm'
        ]
        
        self.albums = [
            {'artist': 'Geese', 'name': '3D Country [Explicit]'},
            {'artist': 'Jim Sullivan', 'name': 'UFO'},
            {'artist': 'Can', 'name': 'Future Days (Remastered)'},
            {'artist': 'Rage Against the Machine', 'name': 'Rage Against the Machine'},
            {'artist': 'Slint', 'name': 'Spiderland (Remastered)'},
            {'artist': 'underscores', 'name': 'Wallsocket'},
            {'artist': 'Ferkat Al Ard', 'name': 'Oghneya (Habibi Funk 019)'},
            {'artist': 'Erykah Badu', 'name': "Mama's Gun"},
            {'artist': 'Geese', 'name': '3D Country'},
            {'artist': 'Fiona Apple', 'name': 'Fetch the Bolt Cutters'},
            {'artist': 'Ogre', 'name': 'Ogre 3'},
            {'artist': 'Childish Gambino', 'name': 'Atavista'},
            {'artist': 'A Perfect Circle', 'name': 'Mer de noms'},
            {'artist': 'Games We Play', 'name': "Life's Going Great"},
            {'artist': 'ESG', 'name': 'Come Away With ESG'},
            {'artist': 'Herbie Hancock', 'name': 'Head Hunters'},
            {'artist': 'Kobo Town', 'name': 'Jumbie In The Jukebox'},
            {'artist': 'Isabella Lovestory', 'name': 'Amor Hardcore'},
            {'artist': 'Flogging Molly', 'name': 'Swagger'},
            {'artist': 'Aphex Twin', 'name': '...I Care Because You Do'},
            {'artist': 'City of Caterpillar', 'name': 'City of Caterpillar'},
            {'artist': 'Congo Natty', 'name': 'Jungle Revolution'},
            {'artist': 'Santana', 'name': 'Santana: The Woodstock Experience'},
            {'artist': 'Robert Johnson', 'name': 'King Of The Delta Blues Singers'},
            {'artist': 'Little Simz', 'name': 'Sometimes I Might Be Introvert'},
            {'artist': 'Invisible', 'name': 'El Jardin De Los Presentes'},
            {'artist': 'Baths', 'name': 'Obsidian'},
            {'artist': 'Nina Hagen', 'name': 'Nunsexmonkrock'}
        ]

        self.setup_gui()
        self.session = None
        self.total_requests = 0
        self.completed_requests = 0

    def setup_gui(self):
        # API Key Frame
        api_frame = ttk.LabelFrame(self.root, text="Last.FM API Key", padding="5")
        api_frame.pack(fill="x", padx=5, pady=5)
        
        ttk.Label(api_frame, text="API Key:").pack(side="left", padx=5)
        self.api_key = tk.StringVar()
        ttk.Entry(api_frame, textvariable=self.api_key, width=50).pack(side="left", padx=5)
        
        # Progress Frames
        self.progress_frames = {}
        progress_container = ttk.LabelFrame(self.root, text="Progress", padding="5")
        progress_container.pack(fill="x", padx=5, pady=5)
        
        # Overall progress
        overall_frame = ttk.Frame(progress_container)
        overall_frame.pack(fill="x", padx=5, pady=5)
        ttk.Label(overall_frame, text="Overall Progress:").pack(fill="x")
        self.overall_progress = ttk.Progressbar(overall_frame, length=400, mode='determinate')
        self.overall_progress.pack(fill="x")
        
        # Current album progress
        album_frame = ttk.Frame(progress_container)
        album_frame.pack(fill="x", padx=5, pady=5)
        ttk.Label(album_frame, text="Current Album:").pack(fill="x")
        self.album_progress = ttk.Progressbar(album_frame, length=400, mode='determinate')
        self.album_progress.pack(fill="x")
        
        self.status_var = tk.StringVar(value="Ready to fetch data...")
        self.detailed_status = tk.StringVar(value="")
        ttk.Label(progress_container, textvariable=self.status_var).pack(pady=2)
        ttk.Label(progress_container, textvariable=self.detailed_status).pack(pady=2)
        
        # Results Text Area
        results_frame = ttk.LabelFrame(self.root, text="Results", padding="5")
        results_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        self.results_text = scrolledtext.ScrolledText(results_frame, height=20)
        self.results_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Buttons
        button_frame = ttk.Frame(self.root)
        button_frame.pack(fill="x", padx=5, pady=5)
        
        self.fetch_button = ttk.Button(button_frame, text="Fetch Track Data", command=self.start_fetch)
        self.fetch_button.pack(side="left", padx=5)
        
        self.save_button = ttk.Button(button_frame, text="Save Results", command=self.save_results)
        self.save_button.pack(side="left", padx=5)
        self.save_button.state(['disabled'])

    async def get_album_tracks(self, session: aiohttp.ClientSession, artist: str, album: str) -> List[str]:
        """Get all tracks from an album using Last.FM API"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        
        # Special handling for Wallsocket album
        if artist.lower() == 'underscores' and 'wallsocket' in album.lower():
            try:
                # Get tracks from both album versions
                standard_tracks = await self._fetch_album_tracks(session, artist, 'Wallsocket')
                directors_tracks = await self._fetch_album_tracks(session, artist, 'Wallsocket (Director\'s cut)')
                
                # Combine tracks, replacing 'Track #' with actual track names
                combined_tracks = []
                track_map = {}
                
                # Create a map of non-"Track #" tracks
                for track in standard_tracks + directors_tracks:
                    if not track.startswith('Track #'):
                        track_map[track.lower()] = track
                
                # Add all unique tracks
                for track in standard_tracks + directors_tracks:
                    if track.startswith('Track #'):
                        continue
                    if track.lower() not in [t.lower() for t in combined_tracks]:
                        combined_tracks.append(track)
                
                return combined_tracks
            except Exception as e:
                self.log_error(f"Error combining Wallsocket album tracks: {str(e)}")
                return []
        
        return await self._fetch_album_tracks(session, artist, album)

    async def _fetch_album_tracks(self, session: aiohttp.ClientSession, artist: str, album: str) -> List[str]:
        """Helper function to fetch tracks from a single album version"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        
        clean_album = album
        for suffix in [' (Remastered)', ' (Remastered Version)', ' (Deluxe Edition)', 
                      ' (Deluxe)', ' (Expanded)', ' (Anniversary Edition)']:
            clean_album = clean_album.replace(suffix, '')
        
        params = {
            'method': 'album.getinfo',
            'artist': artist,
            'album': clean_album,
            'api_key': self.api_key.get(),
            'format': 'json'
        }
        
        try:
            async with session.get(base_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'album' in data and 'tracks' in data['album']:
                        tracks = data['album']['tracks']['track']
                        if isinstance(tracks, dict):
                            return [tracks['name']]
                        return [track['name'] for track in tracks]
            return []
        except Exception as e:
            self.log_error(f"Error getting tracks for {artist} - {album}: {str(e)}")
            return []

    async def get_track_scrobbles(
        self, 
        session: aiohttp.ClientSession, 
        username: str, 
        artist: str, 
        track: str,
        retries: int = 3
    ) -> int:
        """Get user's scrobbles for a specific track using Last.FM API with retry logic"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        
        params = {
            'method': 'track.getInfo',
            'username': username,
            'artist': artist,
            'track': track,
            'api_key': self.api_key.get(),
            'format': 'json'
        }
        
        for attempt in range(retries):
            try:
                async with session.get(base_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'track' in data and 'userplaycount' in data['track']:
                            self.completed_requests += 1
                            self.update_progress()
                            return int(data['track']['userplaycount'])
                    elif response.status == 429:  # Rate limit
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    return 0
            except Exception as e:
                if attempt == retries - 1:
                    self.log_error(f"Error getting track scrobbles for {username}: {str(e)}")
                await asyncio.sleep(1)
        return 0

    def update_progress(self):
        """Update all progress bars and status text"""
        if self.total_requests > 0:
            progress = (self.completed_requests / self.total_requests) * 100
            self.overall_progress['value'] = progress
            self.status_var.set(f"Overall Progress: {progress:.1f}% ({self.completed_requests}/{self.total_requests} requests)")
        self.root.update()

    def log_error(self, message: str):
        """Log error message to results text area"""
        self.results_text.insert(tk.END, f"ERROR: {message}\n")
        self.results_text.see(tk.END)
        self.root.update()

    def generate_typescript(self, data: List[Dict]) -> str:
        """Generate TypeScript interface and data"""
        typescript_content = """// Generated on {timestamp}

export interface TrackScrobbles {{
    artist: string;
    album: string;
    mostScrobbledTrack: string;
    totalScrobbles: number;
    trackScrobbles: {{ [key: string]: number }};
}}

export const trackData: TrackScrobbles[] = {content};
""".format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            content=json.dumps([{
                'artist': item['artist'],
                'album': item['album'],
                'mostScrobbledTrack': item['most_scrobbled_track'],
                'totalScrobbles': item['total_scrobbles'],
                'trackScrobbles': item['all_tracks']
            } for item in data], indent=2)
        )
        
        return typescript_content

    async def process_album(self, session: aiohttp.ClientSession, album: Dict[str, str]) -> Optional[Dict]:
        """Process a single album"""
        tracks = await self.get_album_tracks(session, album['artist'], album['name'])
        if not tracks:
            return None

        track_scrobbles = defaultdict(int)
        tasks = []

        # Create tasks for all user/track combinations
        for track in tracks:
            for username in self.users:
                tasks.append(self.get_track_scrobbles(session, username, album['artist'], track))

        # Process tasks in batches to avoid overwhelming the API
        batch_size = 5
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            results = await asyncio.gather(*batch)
            
            # Update track_scrobbles with results
            for j, scrobbles in enumerate(results):
                track_idx = (i + j) // len(self.users)
                track_scrobbles[tracks[track_idx]] += scrobbles

        if track_scrobbles:
            most_scrobbled = max(track_scrobbles.items(), key=lambda x: x[1])
            return {
                'artist': album['artist'],
                'album': album['name'],
                'most_scrobbled_track': most_scrobbled[0],
                'total_scrobbles': most_scrobbled[1],
                'all_tracks': dict(track_scrobbles)
            }
        return None

    async def fetch_data_async(self):
        """Main async function to fetch all data"""
        self.results_text.delete(1.0, tk.END)
        self.results_data = []
        
        # Calculate total number of potential requests
        self.total_requests = len(self.albums) * len(self.users) * 10  # Approximate tracks per album
        self.completed_requests = 0
        
        async with aiohttp.ClientSession() as session:
            for i, album in enumerate(self.albums):
                self.status_var.set(f"Processing {album['artist']} - {album['name']}")
                self.album_progress['value'] = (i / len(self.albums)) * 100
                self.detailed_status.set(f"Album {i + 1} of {len(self.albums)}")
                self.root.update()

                album_data = await self.process_album(session, album)
                if album_data:
                    self.results_data.append(album_data)
                    self.display_album_results(album_data)
                
                # Small delay between albums to respect rate limits
                await asyncio.sleep(0.5)

        # Generate and save files
        self.save_results()
        self.status_var.set("Data fetching complete!")
        self.overall_progress['value'] = 100
        self.album_progress['value'] = 100

    def display_album_results(self, album_data: Dict):
        """Display results for a single album"""
        self.results_text.insert(tk.END, f"\n{album_data['artist']} - {album_data['album']}\n")
        self.results_text.insert(tk.END, 
                               f"Most Scrobbled Track: {album_data['most_scrobbled_track']} "
                               f"({album_data['total_scrobbles']} total scrobbles)\n")
        self.results_text.insert(tk.END, "All Tracks:\n")
        
        for track, count in sorted(album_data['all_tracks'].items(), key=lambda x: x[1], reverse=True):
            self.results_text.insert(tk.END, f"  {track}: {count} scrobbles\n")
        self.results_text.insert(tk.END, "-" * 50 + "\n")
        self.results_text.see(tk.END)
        self.root.update()

    def start_fetch(self):
        """Start the async data fetching process"""
        if not self.api_key.get():
            messagebox.showerror("Error", "Please enter your Last.FM API key")
            return

        self.fetch_button.state(['disabled'])
        self.save_button.state(['disabled'])

        # Set up asyncio loop
        if platform.system() == 'Windows':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        try:
            asyncio.run(self.fetch_data_async())
            self.save_button.state(['!disabled'])
            messagebox.showinfo("Success", "Data fetching complete!")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            self.status_var.set("Error occurred during data fetch")
        finally:
            self.fetch_button.state(['!disabled'])

    def save_results(self):
        """Save results to TypeScript and JSON files"""
        if not hasattr(self, 'results_data') or not self.results_data:
            messagebox.showerror("Error", "No data to save")
            return

        try:
            # Save TypeScript file
            typescript_content = self.generate_typescript(self.results_data)
            with open('Tracks.ts', 'w', encoding='utf-8') as f:
                f.write(typescript_content)
            
            # Save JSON backup
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            json_filename = f"track_results_{timestamp}.json"
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(self.results_data, f, indent=2)
            
            messagebox.showinfo("Success", 
                              "Files generated successfully!\n\n"
                              f"1. Tracks.ts\n"
                              f"2. {json_filename} (backup)")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save results: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = LastFMTrackAnalyzer(root)
    root.mainloop()