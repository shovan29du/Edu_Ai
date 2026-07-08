#!/usr/bin/env python3
"""
Download and cache museum object images locally.
Run once: python backend/scripts/cache_museum_images.py [--limit 500]

Images are saved to backend/data/museum_resource/images/{object_id}.jpg
The /museum-resource static mount serves them at /museum-resource/images/{id}.jpg
"""
import json
import sys
import time
import argparse
from pathlib import Path
from urllib.request import urlretrieve, Request, urlopen
from urllib.error import HTTPError, URLError

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA = REPO_ROOT / "backend" / "data"
MUSEUM_OBJECTS = DATA / "museum_objects.json"
IMAGE_CACHE = DATA / "museum_resource" / "images"
IMAGE_CACHE.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "EduAI-ImageCache/1.0 (educational; contact@eduai.app)"}


def download(url: str, dest: Path) -> bool:
    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=10) as resp:
            content = resp.read()
        dest.write_bytes(content)
        return True
    except (HTTPError, URLError, Exception) as e:
        print(f"  ✗ {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Cache museum object images locally")
    parser.add_argument("--limit", type=int, default=0, help="Max objects to process (0=all)")
    parser.add_argument("--skip-existing", action="store_true", default=True, help="Skip already-cached images")
    args = parser.parse_args()

    with open(MUSEUM_OBJECTS, encoding="utf-8") as f:
        d = json.load(f)
    objs = d.get("objects", d) if isinstance(d, dict) else d

    if args.limit:
        objs = objs[: args.limit]

    ok = fail = skip = 0
    for i, obj in enumerate(objs, 1):
        oid = obj.get("id", "").replace("/", "_").replace(":", "_")
        img_url = obj.get("image", "")
        if not oid or not img_url:
            continue

        # Try jpg first, then png
        dest = IMAGE_CACHE / f"{oid}.jpg"
        if args.skip_existing and dest.exists():
            skip += 1
            continue

        print(f"[{i}/{len(objs)}] {obj.get('title', oid)[:60]}")
        if download(img_url, dest):
            ok += 1
        else:
            fail += 1
        time.sleep(0.05)  # 50ms between requests to be polite

    print(f"\nDone. OK: {ok}  Failed: {fail}  Skipped: {skip}")
    print(f"Images saved to: {IMAGE_CACHE}")


if __name__ == "__main__":
    main()
