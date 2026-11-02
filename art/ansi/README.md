# Nightlink ANSI and ASCII art

Original text-mode logo and banner art for Nightlink. These files are not loaded by the application.

| File | Content | Encoding |
| --- | --- | --- |
| `nightlink-logo.ans` | 80-column, 7-line block-letter "NIGHTLINK" logo with an antenna and mesh-node motif. Uses ESC[ SGR color codes only, CRLF line endings, and a 128-byte SAUCE record (after a 0x1A EOF marker) declaring 80x7, IBM VGA font. | CP437 |
| `nightlink-logo.txt` | The same logo using 7-bit ASCII only, 78 columns. | ASCII (valid UTF-8) |
| `nightlink-banner-small.txt` | Two-line compact banner, 29 columns. | ASCII (valid UTF-8) |
| `nightlink-logo.irc.txt` | The ASCII logo with mIRC formatting codes (`\x03fg,bg` color, `\x02` bold, `\x0f` reset). Uses colors 14 (grey), 11 (light cyan), 08 (yellow) and 07 (orange) on 01 (black). | ASCII (valid UTF-8) |
| `nightlink-logo.png` | Preview of `nightlink-logo.ans` produced by `render-ansi.cjs`. | PNG |
| `render-ansi.cjs` | Renders a CP437 ANSI file to PNG. | JavaScript |

## Colors

The 16-color palette cannot reproduce the brand colors exactly. Bright yellow and brown (VGA amber) approximate the Switchboard amber accent. Bright cyan approximates the Signal Bridge ice blue (#87E3F8). The frame uses dark grey on black, matching the dark workspace background.

## Regenerating the preview

`render-ansi.cjs` strips the SAUCE record, interprets SGR codes (reset, bold/bright, foreground 30-37, background 40-47), maps CP437 bytes to Unicode, and takes a Playwright Chromium screenshot with a monospace font on a black background using the standard VGA palette. It adds no dependencies to `package.json`.

```
NODE_PATH=$(npm root -g) node art/ansi/render-ansi.cjs [input.ans] [output.png]
```

`NIGHTLINK_PLAYWRIGHT` can point to a local Playwright module, and `NIGHTLINK_BROWSER` to a Chromium executable. Glyph shapes in the PNG depend on the installed monospace font (DejaVu Sans Mono or Consolas), so the preview approximates the appearance in a CP437 terminal or ANSI viewer.

## License

These files are distributed under the same terms as the rest of the Nightlink repository.
