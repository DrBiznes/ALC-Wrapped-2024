import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import aiohttp
import asyncio
import json
from datetime import datetime
import time
from typing import Dict, List, Optional, Tuple
import random
from asyncio import Semaphore

class LastFMScrobbleAnalyzer:
    def __init__(self, root):
        self.root = root
        self.root.title("Last.FM User Scrobbles Analyzer")
        self.root.geometry("1000x800")
        
        # Configuration
        self.MAX_CONCURRENT_REQUESTS = 3
        self.RETRY_ATTEMPTS = 3
        self.BASE_DELAY = 1  # Base delay for exponential backoff
        self.REQUEST_DELAY = 0.25  # Delay between requests to respect rate limits
        
        # Users and Albums Data
        self.users = [
            'alauerbach03', 'wap_king', 'liverbagg', 'apppapapapiss',
            'fergo555', 'McBungus', 'Arisenstring956', 'CaptainOnion13',
            'lucyacheson', 'jontomdotcom', 'Flamboh', 'bob10234', 'Scroetm'
        ]
        
        self.albums = [
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
            {'artist': 'Nina Hagen', 'name': 'Nunsexmonkrock'},
            {'artist': 'Geese', 'name': '3D Country [Explicit]'}
        ]
        
        self.setup_gui()
        self.results_data = []
        self.semaphore = None
        self.session = None
        
        # Track names mapping for Wallsocket album versions
        self.wallsocket_track_mapping = {
            'Track 1': 'groupchat 15',
            'Track 2': 'no way !!',
            'Track 3': 'your favorite sidekick',
            'Track 4': 'second hand embarrassment',
            'Track 5': 'making me blush',
            'Track 6': 'boiling point',
            'Track 7': 'monkeytype',
            'Track 8': 'locals (feat. 8485)',
            'Track 9': 'cant say i didnt try',
            'Track 10': 'the fish song',
            'Track 11': 'gunk',
            'Track 12': 'girl inside my tv',
            'Track 13': 'wallsocket',
        }

    def setup_gui(self):
        # Main container with padding
        main_container = ttk.Frame(self.root, padding="10")
        main_container.pack(fill="both", expand=True)
        
        # API Key Frame
        api_frame = ttk.LabelFrame(main_container, text="Last.FM API Key", padding="5")
        api_frame.pack(fill="x", pady=(0, 10))
        
        ttk.Label(api_frame, text="API Key:").pack(side="left", padx=5)
        self.api_key = tk.StringVar()
        ttk.Entry(api_frame, textvariable=self.api_key, width=50).pack(side="left", padx=5)
        
        # Progress Frames
        progress_container = ttk.LabelFrame(main_container, text="Progress", padding="5")
        progress_container.pack(fill="x", pady=(0, 10))
        
        # Overall Progress
        overall_frame = ttk.Frame(progress_container)
        overall_frame.pack(fill="x", pady=5)
        ttk.Label(overall_frame, text="Overall Progress:").pack(side="left", padx=5)
        self.overall_progress = ttk.Progressbar(overall_frame, length=400, mode='determinate')
        self.overall_progress.pack(side="left", fill="x", expand=True, padx=5)
        
        # Current Album Progress
        album_frame = ttk.Frame(progress_container)
        album_frame.pack(fill="x", pady=5)
        ttk.Label(album_frame, text="Current Album:").pack(side="left", padx=5)
        self.album_progress = ttk.Progressbar(album_frame, length=400, mode='determinate')
        self.album_progress.pack(side="left", fill="x", expand=True, padx=5)
        
        # Status Message
        self.status_var = tk.StringVar(value="Ready to fetch data...")
        ttk.Label(progress_container, textvariable=self.status_var, wraplength=900).pack(pady=5)
        
        # Results Area
        results_frame = ttk.LabelFrame(main_container, text="Results", padding="5")
        results_frame.pack(fill="both", expand=True, pady=(0, 10))
        
        self.results_text = scrolledtext.ScrolledText(results_frame, height=20)
        self.results_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_container)
        button_frame.pack(fill="x")
        
        self.fetch_button = ttk.Button(button_frame, text="Fetch Scrobbles", command=self.start_fetch)
        self.fetch_button.pack(side="left", padx=5)
        
        self.save_button = ttk.Button(button_frame, text="Save Results", command=self.save_results)
        self.save_button.pack(side="left", padx=5)
        self.save_button.state(['disabled'])

    def update_status(self, message: str, album_progress: Optional[float] = None, overall_progress: Optional[float] = None):
        """Update GUI status and progress bars"""
        self.status_var.set(message)
        if album_progress is not None:
            self.album_progress['value'] = album_progress
        if overall_progress is not None:
            self.overall_progress['value'] = overall_progress
        self.root.update()

    async def get_user_scrobbles(self, username: str, artist: str, album: str) -> int:
        """Get user's scrobbles for a specific album using Last.FM API with retry logic"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        
        # Clean up album name
        clean_album = album
        for suffix in [' (Remastered)', ' (Remastered Version)', ' (Deluxe Edition)', 
                      ' (Deluxe)', ' (Expanded)', ' (Anniversary Edition)']:
            clean_album = clean_album.replace(suffix, '')
        
        if clean_album == "UFO":
            clean_album = "U.F.O."
        
        total_scrobbles = 0
        
        # Special handling for Underscores' Wallsocket album
        if artist.lower() == 'underscores' and 'wallsocket' in clean_album.lower():
            return await self.get_wallsocket_scrobbles(username)
        
        params = {
            'method': 'album.getinfo',
            'username': username,
            'artist': artist,
            'album': clean_album,
            'api_key': self.api_key.get(),
            'format': 'json'
        }

        async with self.semaphore:
            for attempt in range(self.RETRY_ATTEMPTS):
                try:
                    # Try main version
                    async with self.session.get(base_url, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            if 'album' in data and 'userplaycount' in data['album']:
                                total_scrobbles += int(data['album']['userplaycount'])
                        
                        # Try remastered version
                        params['album'] = clean_album + " (Remastered Version)"
                        async with self.session.get(base_url, params=params) as remastered_response:
                            if remastered_response.status == 200:
                                remastered_data = await remastered_response.json()
                                if 'album' in remastered_data and 'userplaycount' in remastered_data['album']:
                                    total_scrobbles += int(remastered_data['album']['userplaycount'])
                        
                        return total_scrobbles
                
                except Exception as e:
                    if attempt < self.RETRY_ATTEMPTS - 1:
                        delay = self.BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
                        await asyncio.sleep(delay)
                    else:
                        print(f"Error getting scrobbles for {username} - {artist} - {album}: {str(e)}")
                        return 0
                
                await asyncio.sleep(self.REQUEST_DELAY)
        
        return total_scrobbles

    async def get_wallsocket_scrobbles(self, username: str) -> int:
        """Special handler for getting scrobbles from both versions of Wallsocket album"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        total_scrobbles = 0

        # Try both versions of the album
        album_versions = [
            {'album': 'Wallsocket', 'artist': 'underscores'},
            {'album': "Wallsocket (Director's cut)", 'artist': 'underscores'}
        ]

        async with self.semaphore:
            for version in album_versions:
                params = {
                    'method': 'album.getinfo',
                    'username': username,
                    'artist': version['artist'],
                    'album': version['album'],
                    'api_key': self.api_key.get(),
                    'format': 'json'
                }

                for attempt in range(self.RETRY_ATTEMPTS):
                    try:
                        async with self.session.get(base_url, params=params) as response:
                            if response.status == 200:
                                data = await response.json()
                                if 'album' in data and 'userplaycount' in data['album']:
                                    # Get track list to check for "Track #" replacements
                                    tracks = data['album'].get('tracks', {}).get('track', [])
                                    
                                    if isinstance(tracks, dict):
                                        tracks = [tracks]  # Handle single track case
                                    
                                    # Count only valid tracks (not "Track #" unless it's the only version we have)
                                    playcount = int(data['album']['userplaycount'])
                                    
                                    # If this is a valid version (has proper track names), add its count
                                    has_proper_names = any(not track['name'].startswith('Track ') 
                                                         for track in tracks) if tracks else False
                                    
                                    if has_proper_names or version['album'] == 'Wallsocket':
                                        total_scrobbles += playcount
                                    
                                    break  # Success, no need to retry
                                
                    except Exception as e:
                        if attempt < self.RETRY_ATTEMPTS - 1:
                            delay = self.BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
                            await asyncio.sleep(delay)
                        else:
                            print(f"Error getting Wallsocket scrobbles for {username}: {str(e)}")
                            break
                    
                    await asyncio.sleep(self.REQUEST_DELAY)

        return total_scrobbles

    async def process_album(self, album: Dict[str, str], album_index: int) -> Dict:
        """Process a single album for all users"""
        self.update_status(
            f"Processing {album['artist']} - {album['name']} ({album_index + 1}/{len(self.albums)})",
            album_progress=0
        )
        
        user_scrobbles = {}
        total_users = len(self.users)
        
        for i, username in enumerate(self.users):
            scrobbles = await self.get_user_scrobbles(username, album['artist'], album['name'])
            if scrobbles > 0:
                user_scrobbles[username] = scrobbles
            
            # Update album-specific progress
            self.update_status(
                f"Processing {album['artist']} - {album['name']}: User {i + 1}/{total_users}",
                album_progress=((i + 1) / total_users) * 100
            )
        
        # Sort users by scrobble count
        sorted_users = sorted(user_scrobbles.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'artist': album['artist'],
            'album': album['name'],
            'top_listener': sorted_users[0][0] if sorted_users else 'None',
            'top_scrobbles': sorted_users[0][1] if sorted_users else 0,
            'all_scrobbles': sorted_users
        }

    async def fetch_data(self):
        """Main data fetching coroutine"""
        if not self.api_key.get():
            messagebox.showerror("Error", "Please enter your Last.FM API key")
            return

        self.results_text.delete(1.0, tk.END)
        self.fetch_button.state(['disabled'])
        self.save_button.state(['disabled'])
        self.results_data = []

        try:
            # Initialize session and semaphore for concurrent requests
            self.semaphore = Semaphore(self.MAX_CONCURRENT_REQUESTS)
            async with aiohttp.ClientSession() as session:
                self.session = session
                
                for i, album in enumerate(self.albums):
                    # Process album and update overall progress
                    album_data = await self.process_album(album, i)
                    self.results_data.append(album_data)
                    
                    # Update overall progress
                    overall_progress = ((i + 1) / len(self.albums)) * 100
                    self.update_status(
                        f"Completed {i + 1}/{len(self.albums)} albums",
                        album_progress=100,
                        overall_progress=overall_progress
                    )
                    
                    # Display results for this album
                    self.display_album_results(album_data)
                    
                    # Small delay between albums to respect rate limits
                    await asyncio.sleep(self.REQUEST_DELAY)

            # Generate and save files
            await self.generate_files()
            
            self.update_status("Data fetching complete!", overall_progress=100)
            self.save_button.state(['!disabled'])
            
            messagebox.showinfo(
                "Success",
                "Data fetching complete!\n\n"
                f"Generated files:\n"
                f"1. Scrobbles.ts\n"
                f"2. scrobble_results_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
            )

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            self.update_status("Error occurred during data fetch")
        finally:
            self.fetch_button.state(['!disabled'])

    def display_album_results(self, album_data: Dict):
        """Display results for a single album in the text area"""
        self.results_text.insert(tk.END, f"\n{album_data['artist']} - {album_data['album']}\n")
        self.results_text.insert(tk.END, 
            f"Top Listener: {album_data['top_listener']} ({album_data['top_scrobbles']} scrobbles)\n")
        self.results_text.insert(tk.END, "All Users:\n")
        
        for user, count in album_data['all_scrobbles']:
            self.results_text.insert(tk.END, f"  {user}: {count} scrobbles\n")
        
        self.results_text.insert(tk.END, "-" * 50 + "\n")
        self.results_text.see(tk.END)

    async def generate_files(self):
        """Generate TypeScript and JSON output files"""
        # Generate TypeScript content
        typescript_content = self.generate_typescript(self.results_data)
        
        # Save TypeScript file
        with open('Scrobbles.ts', 'w', encoding='utf-8') as f:
            f.write(typescript_content)
        
        # Save JSON file
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        json_filename = f"scrobble_results_{timestamp}.json"
        
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(self.results_data, f, indent=2)

    def generate_typescript(self, data: List[Dict]) -> str:
        """Generate TypeScript interface and data"""
        typescript_content = """// Generated on {timestamp}

export interface AlbumScrobbles {{
    artist: string;
    album: string;
    topListener: string;
    topScrobbles: number;
    userScrobbles: {{ [key: string]: number }};
}}

export const scrobbleData: AlbumScrobbles[] = {content};
""".format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            content=json.dumps([{
                'artist': item['artist'],
                'album': item['album'],
                'topListener': item['top_listener'],
                'topScrobbles': item['top_scrobbles'],
                'userScrobbles': dict(item['all_scrobbles'])
            } for item in data], indent=2)
        )
        
        return typescript_content

    def save_results(self):
        """Save current results to a JSON file"""
        if not hasattr(self, 'results_data') or not self.results_data:
            messagebox.showerror("Error", "No data to save")
            return

        try:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"scrobble_results_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.results_data, f, indent=2)
            
            messagebox.showinfo("Success", f"Results saved to {filename}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save results: {str(e)}")

    def start_fetch(self):
        """Start the async data fetching process"""
        asyncio.run(self.fetch_data())

if __name__ == "__main__":
    root = tk.Tk()
    app = LastFMScrobbleAnalyzer(root)
    root.mainloop()