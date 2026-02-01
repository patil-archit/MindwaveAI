import requests
import os

sounds = {
    "forest": "https://ia800201.us.archive.org/12/items/ForestSounds/Forest%20Sounds.mp3",
    "waves": "https://ia902606.us.archive.org/35/items/ocean-waves_202108/Ocean%20Waves.mp3"
}

os.makedirs("frontend/public/sounds", exist_ok=True)

for name, url in sounds.items():
    print(f"Downloading {name}...")
    try:
        r = requests.get(url, allow_redirects=True)
        path = f"frontend/public/sounds/{name}.mp3" # Saved as MP3
        with open(path, "wb") as f:
            f.write(r.content)
        print(f"Saved {path} ({len(r.content)/1024:.2f} KB)")
    except Exception as e:
        print(f"Error {name}: {e}")
