# Nightlink ANSI and ASCII art

Original text-mode logo and banner art for Nightlink. These files are not loaded by the application.

| File | Content | Encoding |
| --- | --- | --- |
| `nightlink-logo.ans` | 80-column, 7-line block-letter "NIGHTLINK" logo with an antenna and mesh-node motif, with dim stars in the top frame. Uses ESC[ SGR color codes only, CRLF line endings, and a 128-byte SAUCE record (after a 0x1A EOF marker) declaring 80x7, IBM VGA font. | CP437 |
| `nightlink-logo.txt` | The same logo using 7-bit ASCII only, 78 columns. | ASCII (valid UTF-8) |
| `nightlink-banner-small.txt` | Two-line compact banner, 29 columns. | ASCII (valid UTF-8) |
| `nightlink-logo.irc.txt` | The ASCII logo with mIRC formatting codes (`\x03fg,bg` color, `\x02` bold, `\x0f` reset). Uses colors 14 (grey), 00 (white), 11 (light cyan), 12 (light blue), 02 (blue) and 10 (cyan) on 01 (black). | ASCII (valid UTF-8) |
| `nightlink-logo.png` | Preview of `nightlink-logo.ans` produced by `render-ansi.cjs`. | PNG |
| `make-art.py` | Generates the `.ans`, `.txt`, `.irc.txt` and banner files, and with `--app-data` the in-app logo data module `ansi-logo-data.js`. Python 3 standard library only. | Python |
| `render-ansi.cjs` | Renders a CP437 ANSI file to PNG. | JavaScript |

## Colors

The palette follows the Nightlink name: the letters fade from bright white on the top row through bright cyan and bright blue to VGA dark blue on the bottom row. The antenna and nodes use cyan and bright cyan, approximating the Signal Bridge ice blue (#87E3F8). The frame is dark grey with bright-blue stars, and the tagline is dim cyan. The 16-color palette cannot reproduce brand colors exactly.

## Regenerating

Regenerate the text art first, then the preview:

```
python3 art/ansi/make-art.py
```

The application shows the logo as text (connection dialog, Help > About) and a two-line wordmark in the sidebar brand, using `ansi-logo.js` and `ansi-logo.css` in the repository root. Regenerate their data with:

```
python3 art/ansi/make-art.py --app-data ansi-logo-data.js
```

`ansi-logo.test.cjs` checks that the committed data matches the generator output.


`render-ansi.cjs` strips the SAUCE record, interprets SGR codes (reset, bold/bright, foreground 30-37, background 40-47), maps CP437 bytes to Unicode, and takes a Playwright Chromium screenshot with a monospace font on a black background using the standard VGA palette. It adds no dependencies to `package.json`.

```
NODE_PATH=$(npm root -g) node art/ansi/render-ansi.cjs [input.ans] [output.png]
```

`NIGHTLINK_PLAYWRIGHT` can point to a local Playwright module, and `NIGHTLINK_BROWSER` to a Chromium executable. Glyph shapes in the PNG depend on the installed monospace font (DejaVu Sans Mono or Consolas), so the preview approximates the appearance in a CP437 terminal or ANSI viewer.

## License

These files are distributed under the same terms as the rest of the Nightlink repository.
