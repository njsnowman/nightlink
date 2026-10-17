# Offline raster map packs

Diagnostics → Maps imports one active JSON pack into IndexedDB, separate from message history. Online maps request visible OpenStreetMap tiles. Offline or failed tile requests use the imported pack. CoreScope automatically switches to the local radio map when Windows/browser reports offline, the frame errors, or its initial load times out. A successfully loaded cross-origin frame can still contain a service error that Nightlink cannot inspect; Radio map remains available manually.

Packs must contain street-map raster images from a provider permitting offline redistribution/use. Do not bulk-download tile.openstreetmap.org. Nightlink does not download packs automatically or imply a license to a provider's tiles.

Format:

```json
{"format":"nightlink-map-pack","version":1,"name":"Area street map","attribution":"Provider and required attribution","tiles":[{"z":12,"x":1000,"y":1500,"image":"data:image/png;base64,..."}]}
```

XYZ coordinates use Web Mercator, zoom 0–19. Images must be embedded PNG/JPEG/WebP, not URLs or SVG. Maximum file/embedded data size: 100 MB, 12,000 tiles, 1.5 MB per encoded tile. Imports replace the previous pack atomically; failure retains it. Coverage is limited to supplied tile coordinates and zooms. The app states when a tile is missing; it cannot manufacture streets outside the pack. Message-path, Overview and Network maps share the same tile source. Map packs are not included in message backups.

A pack import does not alter radio settings or share anything with CoreScope. CoreScope observer data and local radio contacts remain separate.

## Windows import and coverage

Choose MBTiles or JSON map opens a file picker. Raster MBTiles is read-only through built-in SQLite; TMS rows are converted to XYZ. PNG, JPEG and WebP are accepted. Vector PBF/MVT packs are rejected with guidance. Attribution metadata is required. Limits also apply after base64 conversion. No extensions or arbitrary SQL are loaded. The original map file is unchanged.

The installed pack summary lists name, tile count, zoom range, import date and attribution. Show downloaded area opens the local map on an actual supplied tile and outlines the outer tile extent. The rectangle can contain gaps; it is not a guarantee of full coverage. Browser preview retains JSON import.
