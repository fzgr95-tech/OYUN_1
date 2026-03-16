import urllib.request
import urllib.parse
import urllib.error
import os
import time

BASE = os.path.join(os.path.dirname(__file__), '..', 'assets', 'maps')

LAYERS = [
    # Lava Factory
    ("lava_factory", "bg_far.png",
     "Top-down 2D game background, molten lava cave with dark rocky walls, glowing orange magma rivers, volcanic atmosphere, no characters, dark mood, game art style"),
    ("lava_factory", "bg_mid.png",
     "Top-down 2D game midground layer, industrial metal platforms and pipes over lava, semi-transparent elements, dark factory interior, game art"),
    ("lava_factory", "bg_fx.png",
     "Top-down 2D game overlay effect, floating ember particles and heat haze over lava, semi-transparent orange glow particles scattered, game art"),

    # Dark Forest
    ("dark_forest", "bg_far.png",
     "Top-down 2D game background, dark enchanted forest at night, moonlight filtering through dense trees, eerie green-blue fog, no characters, game art style"),
    ("dark_forest", "bg_mid.png",
     "Top-down 2D game midground layer, twisted tree trunks and bushes, semi-transparent, dark forest floor with roots and moss, game art"),
    ("dark_forest", "bg_fx.png",
     "Top-down 2D game overlay effect, floating fireflies and misty fog wisps in dark forest, semi-transparent glowing particles, game art"),

    # Space Station
    ("space_station", "bg_far.png",
     "Top-down 2D game background, deep space view with distant stars, nebula and planet visible, dark blue-purple cosmos, no characters, game art style"),
    ("space_station", "bg_mid.png",
     "Top-down 2D game midground layer, metallic space station floor panels with neon blue light strips, semi-transparent, sci-fi interior, game art"),
    ("space_station", "bg_fx.png",
     "Top-down 2D game overlay effect, floating holographic light particles and lens flare in space station, semi-transparent cyan glow, game art"),
]

def download_image(prompt, out_path, width=1920, height=1080, max_retries=3):
    encoded = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&nologo=true"
    for attempt in range(1, max_retries + 1):
        print(f"  Attempt {attempt}: {os.path.basename(out_path)}...")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = resp.read()
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                with open(out_path, 'wb') as f:
                    f.write(data)
                print(f"  OK - {len(data)} bytes -> {out_path}")
                return True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 30 * attempt
                print(f"  Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  HTTP Error: {e}")
                return False
        except Exception as e:
            print(f"  FAILED: {e}")
            time.sleep(10)
    return False

def main():
    total = len(LAYERS)
    success = 0
    for i, (map_name, filename, prompt) in enumerate(LAYERS, 1):
        out_path = os.path.normpath(os.path.join(BASE, map_name, filename))
        print(f"\n[{i}/{total}] {map_name}/{filename}")
        if download_image(prompt, out_path):
            success += 1
        time.sleep(8)  # spacing between requests to avoid rate limits
    print(f"\nDone: {success}/{total} images downloaded successfully.")

if __name__ == "__main__":
    main()
