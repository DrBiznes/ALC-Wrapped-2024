import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import pylast
import json
import time
from datetime import datetime
import os
import requests

class LastFMDataFetcher:
    def __init__(self, root):
        self.root = root
        self.root.title("Last.FM Data Fetcher")
        self.root.geometry("600x450")
        
        # Store API key info
        self.api_key = tk.StringVar()
        
        # Create GUI elements
        self.create_gui()
        
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
            {'artist': 'Games We Play', 'name': 'Life\'s Going Great'},
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

    def create_gui(self):
        # API Key Frame
        api_frame = ttk.LabelFrame(self.root, text="API Configuration", padding="10")
        api_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(api_frame, text="Last.FM API Key:").pack(side="left")
        ttk.Entry(api_frame, textvariable=self.api_key, width=40).pack(side="left", padx=5)
        
        # Control Frame
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(fill="x", padx=10, pady=5)
        
        self.fetch_button = ttk.Button(control_frame, text="Fetch Data", command=self.fetch_data)
        self.fetch_button.pack(side="left")
        
        # Progress Frame
        progress_frame = ttk.LabelFrame(self.root, text="Progress", padding="10")
        progress_frame.pack(fill="x", padx=10, pady=5)
        
        self.progress = ttk.Progressbar(progress_frame, length=300, mode='determinate')
        self.progress.pack(fill="x")
        
        # Status Frame
        status_frame = ttk.Frame(self.root, padding="10")
        status_frame.pack(fill="x", padx=10, pady=5)
        
        self.status_var = tk.StringVar(value="Ready to fetch data...")
        ttk.Label(status_frame, textvariable=self.status_var).pack(fill="x")

    def get_album_info_direct(self, artist, album):
        """Get album info using direct Last.FM API call"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            'method': 'album.getInfo',
            'api_key': self.api_key.get(),
            'artist': artist,
            'album': album,
            'format': 'json'
        }
        
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return None

    def get_track_info(self, artist, track):
        """Get track duration using direct Last.FM API call"""
        base_url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            'method': 'track.getInfo',
            'api_key': self.api_key.get(),
            'artist': artist,
            'track': track,
            'format': 'json'
        }
        
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            return response.json()
        return None

    def fetch_data(self):
        if not self.api_key.get():
            messagebox.showerror("Error", "Please enter your Last.FM API key")
            return

        try:
            self.fetch_button.state(['disabled'])
            albums_data = []

            for i, album_info in enumerate(self.albums):
                self.progress['value'] = (i / len(self.albums)) * 100
                self.update_status(f"Fetching data for {album_info['artist']} - {album_info['name']}...")

                # Simplified album data structure
                album_data = {
                    'name': album_info['name'],
                    'artist': album_info['artist'],
                    'albumCoverUrl': '',
                    'duration': 0,
                    'releaseDate': '',
                    'reviewDate': '',  # Kept empty as requested
                    'alcRating': ''    # Kept empty as requested
                }

                # Get album info including cover art and release date
                album_info_data = self.get_album_info_direct(album_info['artist'], album_info['name'])
                if album_info_data and 'album' in album_info_data:
                    album = album_info_data['album']
                    album_data['albumCoverUrl'] = album['image'][-1]['#text']
                    if 'wiki' in album:
                        album_data['releaseDate'] = album['wiki'].get('published', '')

                    # Get track durations
                    if 'tracks' in album and 'track' in album['tracks']:
                        tracks = album['tracks']['track']
                        if not isinstance(tracks, list):
                            tracks = [tracks]
                        
                        total_duration = 0
                        for track in tracks:
                            track_info = self.get_track_info(album_info['artist'], track['name'])
                            if track_info and 'track' in track_info:
                                duration = int(track_info['track'].get('duration', 0))
                                total_duration += duration
                            time.sleep(0.25)  # Rate limiting
                        
                        album_data['duration'] = total_duration

                albums_data.append(album_data)
                time.sleep(0.5)  # Rate limiting between albums

            # Write to file
            typescript_output = f"// Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            typescript_output += "export const albumsData = " + json.dumps(albums_data, indent=2) + ";\n"

            with open('Albums.ts', 'w', encoding='utf-8') as f:
                f.write(typescript_output)

            self.progress['value'] = 100
            self.update_status("Data fetching complete! Check Albums.ts")
            messagebox.showinfo("Success", "Data has been saved to Albums.ts")

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            self.update_status("Error occurred during data fetch")
        finally:
            self.fetch_button.state(['!disabled'])

    def update_status(self, message):
        self.status_var.set(message)
        self.root.update()

if __name__ == "__main__":
    root = tk.Tk()
    app = LastFMDataFetcher(root)
    root.mainloop()