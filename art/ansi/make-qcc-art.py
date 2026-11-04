"""Generate Queen City Con VGA/ANSI and installer branding from the ConHam ASCII style.
Reference: https://conham.radio/qcc (QUEEN CITY); append CON explicitly.
"""
import json,re,html
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'installer-assets'
VGA=[(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),(85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
FG=['30','34','32','36','31','35','33','37','1;30','1;34','1;32','1;36','1;31','1;35','1;33','1;37']
BG=(0,0,0);CYAN=VGA[11];BLUE=VGA[1];WHITE=VGA[15]
lines=(ROOT/'art/ansi/source/queen-city-con-wordmark.txt').read_text().splitlines()
font=ImageFont.truetype('C:/Windows/Fonts/consolab.ttf',20)
cw=round(font.getlength('M'));im=Image.new('RGB',(max(map(len,lines))*cw,len(lines)*24),BG);d=ImageDraw.Draw(im);d.fontmode='1'
for y,line in enumerate(lines):
    for x,c in enumerate(line):d.text((x*cw,y*24),c,font=font,fill=CYAN)
rows=[''.join('b' if im.getpixel((x,y))!=BG else '0' for x in range(im.width)) for y in range(im.height)]
art={'width':im.width,'height':im.height,'text':'QUEEN CITY CON','ascii':lines,'rows':rows}
(ROOT/'queen-city-logo-art.js').write_text('/* Generated ASCII-style QUEEN CITY CON logo. Reference: https://conham.radio/qcc */\n(function(root){const art='+json.dumps(art,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=art;else root.QueenCityLogoArt=art;})(typeof window==='object'?window:globalThis);\n",encoding='utf-8')
im.resize((im.width,im.height),Image.Resampling.NEAREST).save(ROOT/'art/ansi/queen-city-con-preview.png')
credit='By: Nightlink / Sysop SN0WMAN'
for width in [80,240]:
    ansi='\x1b[0;1;36m'+'\r\n'.join(lines)+'\x1b[0m\r\n'
    for text,color in [(credit,'1;36'),('queencitycon.org','37')]:ansi+=' '*max(0,min(width,max(map(len,lines)))-len(text))+'\x1b[0;'+color+'m'+text+'\x1b[0m\r\n'
    (ROOT/f'art/ansi/queen-city-con-{width}.utf8.ans').write_text(ansi,encoding='utf-8',newline='')
    (ROOT/f'art/ansi/queen-city-con-{width}.ans').write_bytes(ansi.encode('cp437'))
def font_at(n):return ImageFont.truetype('C:/Windows/Fonts/consolab.ttf',n)
def stamp(canvas,box):
    x,y,w,h=box;scale=min(w/im.width,h/im.height);size=(round(im.width*scale),round(im.height*scale));canvas.paste(im.resize(size,Image.Resampling.NEAREST),(x+(w-size[0])//2,y+(h-size[1])//2))
def save(canvas,name):canvas.save(OUT/name,format='BMP')
canvas=Image.new('RGB',(960,156),BG);stamp(canvas,(0,0,960,156));save(canvas,'wordmark.bmp')
canvas=Image.new('RGB',(450,171),BG);d=ImageDraw.Draw(canvas);d.fontmode='1';stamp(canvas,(8,12,434,76));d.text((18,107),'QUEEN CITY CON',font=font_at(29),fill=CYAN);d.line((8,163,442,163),fill=BLUE,width=3);save(canvas,'header.bmp')
canvas=Image.new('RGB',(492,942),BG);d=ImageDraw.Draw(canvas);d.fontmode='1';d.rectangle((20,20,472,922),outline=BLUE,width=3);d.rectangle((24,24,468,68),fill=BLUE);d.text((42,30),'QUEEN CITY CON',font=font_at(36),fill=WHITE);stamp(canvas,(38,130,416,110))
for y,text,color in [(320,'QCC / SHOWCASE',CYAN),(380,'ANSI TERMINAL',WHITE),(560,'[01] PREPARE',CYAN),(630,'[02] INSTALL',CYAN),(700,'[03] READY',CYAN),(830,'By: Nightlink',WHITE),(872,'Sysop SN0WMAN',WHITE)]:d.text((42,y),text,font=font_at(31),fill=color)
save(canvas,'sidebar.bmp');canvas.resize((164,314),Image.Resampling.NEAREST).save(OUT/'sidebar-preview.png')
icon=Image.new('RGB',(256,256),BG);d=ImageDraw.Draw(icon);d.fontmode='1';d.rectangle((6,6,249,249),outline=BLUE,width=10);d.text((29,37),'QCC',font=font_at(105),fill=CYAN);d.text((47,161),'CON',font=font_at(79),fill=WHITE);icon.save(ROOT/'icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
(ROOT/'icon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><title>Queen City Con</title><rect width="256" height="256" fill="black"/><rect x="6" y="6" width="244" height="244" fill="none" stroke="#0000aa" stroke-width="10"/><text x="128" y="126" text-anchor="middle" fill="#55ffff" font-family="Consolas,monospace" font-size="104" font-weight="bold">QCC</text><text x="128" y="220" text-anchor="middle" fill="white" font-family="Consolas,monospace" font-size="80" font-weight="bold">CON</text></svg>\n')
print('Generated QUEEN CITY CON ASCII/VGA branding, ANSI exports, installer BMP and event icons:',im.size)
