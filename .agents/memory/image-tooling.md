---
name: Image processing tools
description: Which image tools are available in this repo's environment for resizing / WebP generation
---

# Image processing tools

`sharp` is NOT installed (no node module). For resizing images and generating
WebP variants, use ImageMagick, which IS available on PATH as `magick` and
`convert`.

**Example** (generate responsive WebP variants):
```
magick input.webp -resize 600x -quality 80 input-600w.webp
```

**Why:** A responsive-images task needed smaller WebP variants; `require('sharp')`
failed with "Cannot find module 'sharp'", but `magick`/`convert` worked.

**How to apply:** Reach for `magick` (not `sharp`) for any resize/convert/optimize
work unless you've explicitly installed `sharp` first.
