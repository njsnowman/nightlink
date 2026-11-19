"""Generate installer RGB24 artwork from Nightlink's approved VGA16 block wordmark."""
from pathlib import Path
import json, re, subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'installer-assets'
BG='#000000';BLUE='#0000aa';CYAN='#55ffff';WHITE='#ffffff';GREY='#aaaaaa';DARK='#555555'
VGA=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff']
art=json.loads(subprocess.check_output(['node','-e','process.stdout.write(JSON.stringify(require("./terminal-logo-art.js")))'],cwd=ROOT))
logo=Image.new('RGB',(art['width'],art['height']),BG)
for y,row in enumerate(art['rows']):
    for x,v in enumerate(row):logo.putpixel((x,y),tuple(bytes.fromhex(VGA[int(v,16)][1:])))
def font(size,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('consolab.ttf' if bold else 'consola.ttf'),size)
def stamp(im,box):
    w,h=box[2]-box[0],box[3]-box[1];scale=min(w/logo.width,h/logo.height)
    size=(int(logo.width*scale),int(logo.height*scale));im.paste(logo.resize(size,Image.Resampling.NEAREST),(box[0]+(w-size[0])//2,box[1]+(h-size[1])//2))
def save(im,name):
    palette=Image.new('P',(1,1));palette.putpalette([c for v in VGA for c in bytes.fromhex(v[1:])]+[0]*720)
    im=im.quantize(palette=palette,dither=Image.Dither.NONE).convert('RGB')
    im.save(OUT/name,format='BMP');b=(OUT/name).read_bytes();assert int.from_bytes(b[28:30],'little')==24 and int.from_bytes(b[30:34],'little')==0
im=Image.new('RGB',(960,156),BG);stamp(im,(0,0,960,156));save(im,'wordmark.bmp')
im=Image.new('RGB',(450,171),BG);d=ImageDraw.Draw(im);stamp(im,(12,18,438,94));d.text((17,116),'[ NIGHTLINK / SETUP ]',font=font(26,True),fill=CYAN);d.line((12,162,438,162),fill=BLUE,width=4);save(im,'header.bmp')
im=Image.new('RGB',(492,942),BG);d=ImageDraw.Draw(im)
d.rectangle((20,20,472,922),outline=BLUE,width=3);d.rectangle((26,26,466,66),fill=BLUE);d.text((42,30),'[ NIGHTLINK SETUP ]',font=font(30,True),fill=WHITE);stamp(im,(40,106,452,180))
d.text((44,216),'MESHCORE TERMINAL',font=font(32,True),fill=CYAN)
# Cell-grid antenna and mesh paths, matching the ANSI radio/map vocabulary.
for y,row in enumerate(['        /\\        ','       /  \\       ','      / /\\ \\      ','     / /  \\ \\     ','    /_/ /\\ \\_\\    ','        ||        ','        ||        ','   +----++----+   ','   |    ||    |   ','  [#]  [##]  [#]  ']):d.text((40,310+y*34),row,font=font(32,True),fill=CYAN if y<7 else '#5555ff')
for y,title,sub in [(714,'01  PREPARE','Choose install folder'),(780,'02  INSTALL','Copy application files'),(846,'03  READY','Open Nightlink')]:
    d.text((44,y),title,font=font(27,True),fill=WHITE);d.text((44,y+32),sub,font=font(22),fill=GREY)
save(im,'sidebar.bmp');im.resize((164,314)).save(OUT/'sidebar-preview.png')
# Design references only. Native NSIS screenshots are recorded separately.
source=(ROOT/'installer.nsh').read_text(encoding='utf-8-sig')
for fn,label in [('NightlinkWelcome','welcome'),('NightlinkShortcutPage','options'),('NightlinkFinish','finish')]:
    body=source.split('Function '+fn+'\n',1)[1].split('FunctionEnd',1)[0];canvas=Image.new('RGB',(1000,720),BG);draw=ImageDraw.Draw(canvas)
    draw.rectangle((0,0,1000,36),fill=BLUE);draw.text((16,5),'NIGHTLINK / WINDOWS SETUP',font=font(18,True),fill=WHITE)
    title,subtitle=re.search(r'MUI_HEADER_TEXT "([^"]+)" "([^"]+)"',body).groups()
    draw.text((32,61),title,font=font(23,True),fill=WHITE);draw.text((32,98),subtitle,font=font(18),fill=GREY)
    with Image.open(OUT/'header.bmp') as header:canvas.paste(header.resize((225,86)),(750,46))
    draw.line((0,150,1000,150),fill=BLUE,width=3)
    if 'NightlinkWordmark' in body:stamp(canvas,(40,219,960,327))
    for y,h,text,color,face in re.findall(r'NightlinkLabel 0 (\d+)u 100% (\d+)u "([^"]+)" ([A-F0-9]+) \$(\w+)',body):
        f=font(31,True) if face=='NightlinkTitleFont' else font(20)
        words=text.split();lines=[];line=''
        for word in words:
            trial=(line+' '+word).strip()
            if draw.textlength(trial,font=f)>920:lines.append(line);line=word
            else:line=trial
        lines.append(line);draw.multiline_text((40,170+int(y)*3),'\n'.join(lines),font=f,fill='#'+color,spacing=5)
    for y in re.findall(r'NightlinkRule (\d+)u',body):draw.line((40,170+int(y)*3,960,170+int(y)*3),fill=BLUE,width=3)
    if label=='options':draw.rectangle((40,390,60,410),outline=CYAN,width=2);draw.text((76,386),'Create a desktop shortcut',font=font(20),fill=WHITE)
    draw.line((0,620,1000,620),fill=BLUE,width=3)
    for box,text in [((620,650,790,697),'Finish' if label=='finish' else 'Continue >' if label=='welcome' else 'Install'),((815,650,975,697),'Cancel')]:
        if label=='finish' and text=='Cancel':continue
        draw.rectangle(box,fill=BLUE if text!='Cancel' else BG,outline=CYAN,width=2);draw.text((box[0]+18,box[1]+10),text,font=font(20),fill=WHITE)
    canvas.save(OUT/('ansi-installer-'+label+'.png'))
print('Generated RGB24 ANSI wordmark, header, sidebar and design references.')


