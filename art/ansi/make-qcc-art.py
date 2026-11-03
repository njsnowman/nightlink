"""Convert the official 2026 Queen City Conference mark to VGA cell art.
Source: https://queencitycon.org/images/0x4_assets/qcc_logo-white_text-2026_0x4.png
The source image is retained for regeneration; runtime branding uses palette-index rows.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
VGA = [(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),
       (85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
FG = ['30','34','32','36','31','35','33','37','1;30','1;34','1;32','1;36','1;31','1;35','1;33','1;37']
source = Image.open(ROOT/'art/ansi/source/queen-city-con-2026.png').convert('RGBA')
black = Image.new('RGBA',source.size,(0,0,0,255));black.alpha_composite(source);source=black.convert('RGB')
palette=Image.new('P',(1,1));palette.putpalette([c for color in VGA for c in color]+[0]*(768-48))
def grid(width):
    height=round(source.height*width/source.width)
    im=source.resize((width,height),Image.Resampling.BOX).quantize(palette=palette,dither=Image.Dither.NONE)
    return im,[''.join(format(im.getpixel((x,y)),'x') for x in range(width)) for y in range(height)]

im,rows=grid(240)
art={'width':240,'height':len(rows),'rows':rows}
(ROOT/'queen-city-logo-art.js').write_text('/* Generated VGA block art by art/ansi/make-qcc-art.py. */\n(function(root){const art='+json.dumps(art,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=art;else root.QueenCityLogoArt=art;})(typeof window==='object'?window:globalThis);\n",encoding='utf-8')
im.convert('RGB').resize((960,len(rows)*4),Image.Resampling.NEAREST).save(ROOT/'art/ansi/queen-city-con-preview.png')
for width in [80,240]:
    _,lines=grid(width)
    if len(lines)%2: lines.append('0'*width)
    ansi='';bg=['40','44','42','46','41','45','43','47']
    for y in range(0,len(lines),2):
        for a,b in zip(lines[y],lines[y+1]):
            top,bot=int(a,16),int(b,16)
            if top==bot: ansi+='\x1b[0m ' if top==0 else '\x1b[0;'+FG[top]+'m█'
            elif bot==0: ansi+='\x1b[0;'+FG[top]+'m▀'
            elif top==0: ansi+='\x1b[0;'+FG[bot]+'m▄'
            elif bot<8: ansi+='\x1b[0;'+FG[top]+';'+bg[bot]+'m▀'
            elif top<8: ansi+='\x1b[0;'+FG[bot]+';'+bg[top]+'m▄'
            else: ansi+='\x1b[0;'+FG[top]+';'+bg[bot-8]+'m▀'
        ansi+='\x1b[0m\r\n'
    for text,color in [('By: Nightlink / Sysop SN0WMAN','1;36'),('queencitycon.org','37')]:
        ansi+=' '*max(0,width-len(text))+'\x1b[0;'+color+'m'+text+'\x1b[0m\r\n'
    (ROOT/f'art/ansi/queen-city-con-{width}.utf8.ans').write_text(ansi,encoding='utf-8',newline='')
    (ROOT/f'art/ansi/queen-city-con-{width}.ans').write_bytes(ansi.encode('cp437'))
print(f'Generated {art["width"]} x {art["height"]} VGA logo and ANSI exports')
