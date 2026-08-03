#!/usr/bin/env python3
"""Stamp a content hash onto every CSS/JS reference so deploys can't serve
a stale mix of old assets with new HTML.

GitHub Pages serves everything with `Cache-Control: max-age=600`. HTML and
assets expire independently, so for up to 10 minutes after a deploy a visitor
can hold new HTML alongside a cached old index.css (or the reverse). Appending
a content hash to each asset URL makes the pair atomic: new HTML asks for a
URL the browser has never seen, so it always fetches the matching asset.

The hash covers index.css and every file in assets/js/. Change any of them and
the hash changes, so every reference must be re-stamped.

Usage:
    python3 tools/stamp-assets.py            # rewrite references in place
    python3 tools/stamp-assets.py --check    # exit 1 if anything is stale (CI)

There is still no build step: the stamped files are the files that ship, and
`?v=` query strings are inert when opening index.html straight off disk.
"""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Assets whose content feeds the hash, and whose references get stamped.
CSS_ASSETS = ["index.css"]
JS_DIR = "assets/js"

# The version line inside site-style.js is itself part of a hashed file, so it
# is normalised away before hashing to avoid a chicken-and-egg dependency.
VERSION_LINE = re.compile(r"var ASSET_V = '[^']*';")
VERSION_PLACEHOLDER = "var ASSET_V = '<STAMP>';"

SKIP_DIRS = {".git", "node_modules", "ai-lab", ".wrangler", "tools"}


def asset_files() -> list[Path]:
    files = [ROOT / c for c in CSS_ASSETS]
    files += sorted((ROOT / JS_DIR).glob("*.js"))
    return [f for f in files if f.is_file()]


def compute_hash() -> str:
    h = hashlib.sha256()
    for f in asset_files():
        text = f.read_text(encoding="utf-8")
        text = VERSION_LINE.sub(VERSION_PLACEHOLDER, text)
        h.update(f.name.encode())
        h.update(text.encode())
    return h.hexdigest()[:10]


def html_files() -> list[Path]:
    out = []
    for p in ROOT.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.relative_to(ROOT).parts):
            continue
        out.append(p)
    return sorted(out)


def stamp_text(text: str, stamp: str) -> str:
    """Add or replace ?v=<stamp> on every local css/js reference."""
    names = [Path(c).name for c in CSS_ASSETS]
    names += [f.name for f in (ROOT / JS_DIR).glob("*.js")]
    pattern = "|".join(re.escape(n) for n in names)

    # href="../index.css"  |  src="assets/js/site-style.js?v=old"
    rx = re.compile(
        r'((?:href|src)=")((?:[^"]*/)?(?:' + pattern + r'))(\?v=[^"]*)?(")'
    )
    return rx.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={stamp}{m.group(4)}", text)


def stamp_site_style(text: str, stamp: str) -> str:
    """Keep the ASSET_V constant in sync; site-style.js injects the rest."""
    if VERSION_LINE.search(text):
        return VERSION_LINE.sub(f"var ASSET_V = '{stamp}';", text)
    return text


def main() -> int:
    check = "--check" in sys.argv
    stamp = compute_hash()

    targets: list[tuple[Path, str, str]] = []

    for f in html_files():
        original = f.read_text(encoding="utf-8")
        updated = stamp_text(original, stamp)
        if updated != original:
            targets.append((f, original, updated))

    site_style = ROOT / JS_DIR / "site-style.js"
    if site_style.is_file():
        original = site_style.read_text(encoding="utf-8")
        updated = stamp_site_style(original, stamp)
        if updated != original:
            targets.append((site_style, original, updated))

    if check:
        if targets:
            print(f"Asset stamp is stale. Expected ?v={stamp} in:")
            for f, _, _ in targets:
                print(f"  {f.relative_to(ROOT)}")
            print("\nRun: python3 tools/stamp-assets.py")
            return 1
        print(f"All asset references carry the current stamp (?v={stamp})")
        return 0

    for f, _, updated in targets:
        f.write_text(updated, encoding="utf-8", newline="")
    print(f"Stamped ?v={stamp} across {len(targets)} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
