"""Generate Signal Bridge NSIS artwork; requires Pillow at build time only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path(__file__).resolve().parent/'installer-assets'
BG='#000000'; CYAN='#87e3f8'; ICE='#edfaff'; MUTED='#8da5b2'; LINE='#17313e'
def font(n,b=False,mono=False):
 name=('consolab.ttf' if b else 'consola.ttf') if mono else ('segoeuib.ttf' if b else 'segoeui.ttf')
 return ImageFont.truetype('C:/Windows/Fonts/'+name,n)
def mark(d,x,y,z):
 s=z/256
 p=[(48,208),(48,48),(84,48),(172,148),(172,48),(208,48),(208,208),(172,208),(84,108),(84,208)]
 d.polygon([(x+a*s,y+b*s) for a,b in p],fill=CYAN)
 for a,b in [(56,180),(180,56)]:d.rectangle((x+a*s,y+b*s,x+(a+20)*s,y+(b+20)*s),fill=BG)
def save(im,name):
 import io
 data=io.BytesIO();im.save(data,format='BMP')
 p=OUT/name;t=p.with_suffix('.next');t.write_bytes(data.getvalue());t.replace(p)
 with Image.open(p) as a:assert a.mode=='RGB'
 b=p.read_bytes();assert int.from_bytes(b[28:30],'little')==24 and int.from_bytes(b[30:34],'little')==0
im=Image.new('RGB',(492,942),BG);d=ImageDraw.Draw(im)
d.line((491,0,491,942),fill=LINE,width=1)
d.rectangle((36,44,42,50),fill=CYAN)
d.text((57,27),'NIGHTLINK',font=font(29,True),fill=MUTED)
d.line((36,84,456,84),fill=LINE,width=2)
for x,y,dx,dy in [(72,192,1,1),(420,192,-1,1),(72,540,1,-1),(420,540,-1,-1)]:
 d.line((x,y,x+dx*24,y),fill=CYAN,width=2);d.line((x,y,x,y+dy*24),fill=CYAN,width=2)
mark(d,72,192,348)
d.text((35,590),'Nightlink',font=font(69,True),fill=ICE)
d.text((40,679),'MESHCORE DESKTOP',font=font(25,mono=True),fill=CYAN)
d.line((40,748,452,748),fill=LINE,width=2)
d.text((40,783),'BLUETOOTH / USB',font=font(26,mono=True),fill=MUTED)
d.text((40,839),'Your radio. Your network.',font=font(25),fill=ICE)

save(im,'sidebar.bmp')
im.resize((164,314),Image.Resampling.LANCZOS).save(OUT/'sidebar-preview.png')
im=Image.new('RGB',(450,171),BG);d=ImageDraw.Draw(im)
mark(d,4,10,150)
d.text((156,45),'Nightlink',font=font(52,True),fill=ICE)
d.text((160,111),'MESHCORE DESKTOP',font=font(18,mono=True),fill=CYAN)
save(im,'header.bmp')
print('Verified uncompressed RGB24 sidebar 492x942 and header 450x171')
