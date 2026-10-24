"""Generate Switchboard installer artwork and a design preview. Pillow is authoring-only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path(__file__).resolve().parent/'installer-assets'
BG='#080908'; PANEL='#10120f'; AMBER='#ffbe55'; TEXT='#eeeede'; MUTED='#aaa99a'; LINE='#444234'
def font(n,b=False,mono=False):
    name=('consolab.ttf' if b else 'consola.ttf') if mono else ('segoeuib.ttf' if b else 'segoeui.ttf')
    return ImageFont.truetype('C:/Windows/Fonts/'+name,n)
def mark(d,x,y,z):
    s=z/256;p=[(48,208),(48,48),(84,48),(172,148),(172,48),(208,48),(208,208),(172,208),(84,108),(84,208)]
    d.polygon([(x+a*s,y+b*s) for a,b in p],fill=AMBER)
    for a,b in [(56,180),(180,56)]: d.rectangle((x+a*s,y+b*s,x+(a+20)*s,y+(b+20)*s),fill=BG)
def frame(d,box):
    x,y,r,b=box;d.rectangle(box,outline=LINE,width=2)
    for a,c,dx,dy in [(x,y,1,1),(r,y,-1,1),(x,b,1,-1),(r,b,-1,-1)]:
        d.line((a,c,a+dx*22,c),fill=AMBER,width=3);d.line((a,c,a,c+dy*22),fill=AMBER,width=3)
def save(im,name):
    im.save(OUT/name,format='BMP');b=(OUT/name).read_bytes()
    assert int.from_bytes(b[28:30],'little')==24 and int.from_bytes(b[30:34],'little')==0
im=Image.new('RGB',(492,942),BG);d=ImageDraw.Draw(im)
d.text((34,30),'NIGHTLINK / SETUP',font=font(25,mono=True),fill=AMBER);d.line((34,88,458,88),fill=LINE,width=2)
frame(d,(34,136,458,570));mark(d,64,180,362)
d.text((34,618),'Your next',font=font(52,True),fill=TEXT);d.text((34,683),'connection.',font=font(52,True),fill=TEXT)
d.text((36,790),'MESHCORE / WINDOWS',font=font(25,mono=True),fill=AMBER)
d.text((36,844),'BLUETOOTH + USB',font=font(25,mono=True),fill=MUTED)
d.line((34,912,458,912),fill=AMBER,width=3);save(im,'sidebar.bmp');im.resize((164,314)).save(OUT/'sidebar-preview.png')
im=Image.new('RGB',(450,171),BG);d=ImageDraw.Draw(im);mark(d,4,10,150);d.text((158,43),'nightlink',font=font(50,True),fill=TEXT);d.text((160,108),'WINDOWS / SETUP',font=font(18,mono=True),fill=AMBER);save(im,'header.bmp')
# Design reference: mirrors custom-page labels, colors and section hierarchy, not an installer execution capture.
im=Image.new('RGB',(1440,1000),BG);d=ImageDraw.Draw(im)
d.rectangle((0,0,1440,52),fill='#181a17');d.text((24,10),'Nightlink Setup',font=font(23),fill=TEXT)
mark(d,57,88,122);d.text((190,104),'nightlink',font=font(47,True),fill=TEXT);d.text((190,164),'MESHCORE WORKSPACE / WINDOWS',font=font(21,mono=True),fill=AMBER)
d.line((56,235,1384,235),fill=LINE,width=2)
d.text((66,267),'01 / PREPARE',font=font(22,mono=True),fill=AMBER)
d.text((66,318),'Your next connection.',font=font(62,True),fill=TEXT)
d.text((68,411),'Install your MeshCore workspace.',font=font(30),fill=MUTED)
frame(d,(66,498,1374,716));d.text((94,525),'BLUETOOTH + USB',font=font(26,True),fill=TEXT)
d.text((94,579),'Channels, direct messages and radio tools in one workspace.',font=font(24),fill=MUTED)
d.text((94,641),'Existing messages and contact details are retained during upgrades.',font=font(24),fill=MUTED)
d.text((68,758),'01  PREPARE',font=font(21,mono=True),fill=AMBER);d.text((510,758),'02  INSTALL',font=font(21,mono=True),fill=MUTED);d.text((1000,758),'03  READY',font=font(21,mono=True),fill=MUTED)
d.line((56,834,1384,834),fill=LINE,width=2);d.text((68,864),'CURRENT USER / NO RADIO CHANGES',font=font(19,mono=True),fill=MUTED)
d.rectangle((1074,884,1374,958),fill=AMBER);d.text((1140,901),'Continue >',font=font(29,True),fill=BG)
im.save(OUT/'switchboard-installer-design.png')
print('Verified RGB24 sidebar/header; generated design reference.')
# Render custom-page design references from their actual NSIS label coordinates.
import re
source=(OUT.parent/'installer.nsh').read_text(encoding='utf-8-sig')
for fn,label in [('NightlinkWelcome','welcome'),('NightlinkShortcutPage','options'),('NightlinkFinish','finish')]:
    body=source.split('Function '+fn+'\n',1)[1].split('FunctionEnd',1)[0]
    canvas=Image.new('RGB',(1000,720),BG);draw=ImageDraw.Draw(canvas)
    draw.rectangle((0,0,1000,36),fill='#1b1d19');draw.text((16,5),'Nightlink Setup',font=font(18),fill=TEXT)
    title,subtitle=re.search(r'MUI_HEADER_TEXT "([^"]+)" "([^"]+)"',body).groups()
    draw.text((40,61),title,font=font(23,True),fill=TEXT);draw.text((40,98),subtitle,font=font(19),fill=MUTED)
    with Image.open(OUT/'header.bmp') as art:canvas.paste(art.resize((250,95)),(710,43))
    draw.line((0,150,1000,150),fill=LINE,width=2)
    for y,h,text,color,face in re.findall(r'NightlinkLabel 0 (\d+)u 100% (\d+)u "([^"]+)" ([A-F0-9]+) \$(\w+)',body):
        f=font(40,True) if face=='NightlinkTitleFont' else font(19,mono=True) if face=='NightlinkMonoFont' else font(22)
        words=text.split();lines=[];line=''
        for word in words:
            trial=(line+' '+word).strip()
            if draw.textlength(trial,font=f)>900:lines.append(line);line=word
            else:line=trial
        lines.append(line)
        draw.multiline_text((40,170+int(y)*3),'\n'.join(lines),font=f,fill='#'+color,spacing=5)
    for y in re.findall(r'NightlinkRule (\d+)u',body):draw.line((40,170+int(y)*3,960,170+int(y)*3),fill=LINE,width=2)
    if fn=='NightlinkShortcutPage':
        y=170+77*3;draw.rectangle((40,y+4,60,y+24),outline=MUTED,width=2);draw.text((76,y),'Create a desktop shortcut',font=font(22),fill=TEXT)
    draw.line((0,620,1000,620),fill=LINE,width=2)
    for box,text in [((610,650,770,697),'Finish' if label=='finish' else 'Continue >' if label=='welcome' else 'Install'),((795,650,955,697),'Cancel')]:
        if label=='finish' and text=='Cancel':continue
        draw.rectangle(box,fill='#252720',outline=AMBER if text!='Cancel' else LINE,width=2);draw.text((box[0]+22,box[1]+9),text,font=font(20),fill=TEXT)
    canvas.save(OUT/('switchboard-installer-'+label+'.png'))
with Image.open(OUT/'switchboard-installer-welcome.png') as welcome:welcome.save(OUT/'switchboard-installer-design.png')
