import requests
import os

# Reliable effects from SoundJay
sounds = {
    "forest": "https://www.soundjay.com/nature/forest-ambience-1.mp3",
    "waves": "https://www.soundjay.com/nature/sea-wave-1.mp3"
}

os.makedirs("frontend/public/sounds", exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

for name, url in sounds.items():
    print(f"Downloading {name}...")
    try:
        r = requests.get(url, headers=headers, allow_redirects=True, timeout=15)
        path = f"frontend/public/sounds/{name}.mp3"
        with open(path, "wb") as f:
            f.write(r.content)
        print(f"Saved {path} ({len(r.content)/1024:.2f} KB)")
    except Exception as e:
        print(f"Error {name}: {e}")
