"""Inline the shared prototype assets into every page so each HTML file is self-contained.

assets/ranker.css and assets/ranker.js are the source of truth. Each page holds a
<style data-src="assets/ranker.css"> and a <script data-src="assets/ranker.js"> block;
running this script refreshes their contents. Run it after editing anything in assets/:

    python3 prototype/inline.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
PAGES = ["homepage.html", "category.html", "post.html", "item.html"]
ASSETS = {
    "style": "assets/ranker.css",
    "script": "assets/ranker.js",
}


def inline(page: pathlib.Path) -> None:
    html = page.read_text(encoding="utf-8")
    # First run: turn external references into tagged inline blocks.
    html = html.replace(
        '<link rel="stylesheet" href="assets/ranker.css">',
        '<style data-src="assets/ranker.css"></style>',
    )
    html = html.replace(
        '<script src="assets/ranker.js"></script>',
        '<script data-src="assets/ranker.js"></script>',
    )
    for tag, src in ASSETS.items():
        body = (ROOT / src).read_text(encoding="utf-8").strip()
        pattern = re.compile(
            rf'(<{tag} data-src="{re.escape(src)}">)(.*?)(</{tag}>)', re.S
        )
        if not pattern.search(html):
            raise SystemExit(f"{page.name}: no <{tag} data-src=\"{src}\"> block")
        html = pattern.sub(lambda m: f"{m.group(1)}\n{body}\n{m.group(3)}", html, count=1)
    page.write_text(html, encoding="utf-8")
    print(f"inlined {page.name}")


for name in PAGES:
    inline(ROOT / name)
