'use strict';
// Renders a CP437 ANSI file (SGR colors only) to PNG with the standard 16-color VGA palette.
// Usage: NODE_PATH=$(npm root -g) node art/ansi/render-ansi.cjs [input.ans] [output.png]
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.NIGHTLINK_PLAYWRIGHT || 'playwright');

const input = process.argv[2] || path.join(__dirname, 'nightlink-logo.ans');
const output = process.argv[3] || path.join(__dirname, 'nightlink-logo.png');

const VGA = ['#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff'];
// CP437 0x80-0xFF to Unicode.
const HIGH = 'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';

function stripSauce(buf) {
  const eof = buf.indexOf(0x1a);
  return eof >= 0 ? buf.subarray(0, eof) : buf;
}

function parse(buf) {
  const cells = [];
  let row = [];
  let fg = 7, bg = 0, bold = false;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b === 0x1b && buf[i + 1] === 0x5b) {
      let j = i + 2, params = '';
      while (j < buf.length && !(buf[j] >= 0x40 && buf[j] <= 0x7e)) params += String.fromCharCode(buf[j++]);
      if (buf[j] === 0x6d) {
        for (const p of (params || '0').split(';').map(Number)) {
          if (p === 0) { fg = 7; bg = 0; bold = false; }
          else if (p === 1) bold = true;
          else if (p >= 30 && p <= 37) fg = p - 30;
          else if (p >= 40 && p <= 47) bg = p - 40;
        }
      }
      i = j;
    } else if (b === 0x0d) {
      continue;
    } else if (b === 0x0a) {
      cells.push(row); row = [];
    } else {
      const ch = b < 0x80 ? String.fromCharCode(b) : HIGH[b - 0x80];
      row.push({ ch, fg: VGA[fg + (bold ? 8 : 0)], bg: VGA[bg] });
    }
  }
  if (row.length) cells.push(row);
  return cells;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

(async () => {
  const rows = parse(stripSauce(fs.readFileSync(input)));
  const html = rows.map((r) => r.map((c) =>
    `<span style="color:${c.fg};background:${c.bg}">${esc(c.ch)}</span>`).join('')).join('\n');
  const doc = `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;background:#000}
    pre{margin:0;padding:16px;display:inline-block;font:18px/1 "DejaVu Sans Mono","Consolas",monospace;color:#aaa;background:#000}
  </style><pre id="a">${html}</pre>`;
  const browser = await chromium.launch(process.env.NIGHTLINK_BROWSER ? { executablePath: process.env.NIGHTLINK_BROWSER } : {});
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.setContent(doc);
  await page.locator('#a').screenshot({ path: output });
  await browser.close();
  console.log(`wrote ${output}`);
})().catch((e) => { console.error(e); process.exit(1); });
