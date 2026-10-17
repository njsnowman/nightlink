"""Generate checked-in NSIS artwork. Requires Pillow; never used at install time."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math
OUT = Path(__file__).resolve().parent / 'installer-assets'
OUT.mkdir(exist_ok=True)
BG='#101715'; GRID='#23342b'; OLIVE='#b6cb86'; AMBER='#e8b467'; WHITE='#edf1e8'; MUTED='#9eafa2'
def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('consolab.ttf' if bold else 'consola.ttf'),size)
def canvas(w,h):
    im=Image.new('RGB',(w,h),BG); d=ImageDraw.Draw(im)
    for x in range(0,w,36): d.line((x,0,x,h),fill=GRID,width=1)
    for y in range(0,h,36): d.line((0,y,w,y),fill=GRID,width=1)
    return im,d
def mesh(d,cx,cy,r):
    for n in (.33,.66,1): d.ellipse((cx-r*n,cy-r*n,cx+r*n,cy+r*n),outline='#3b5040',width=2)
    d.line((cx-r-15,cy,cx+r+15,cy),fill='#52684d',width=2)
    d.line((cx,cy-r-15,cx,cy+r+15),fill='#52684d',width=2)
    pts=[(cx-r*.65,cy+r*.27),(cx-r*.24,cy-r*.38),(cx+r*.15,cy+r*.1),(cx+r*.62,cy-r*.45),(cx+r*.57,cy+r*.55)]
    for a,b in ((0,1),(0,2),(1,2),(1,3),(2,3),(2,4),(3,4)):d.line((*pts[a],*pts[b]),fill=OLIVE,width=3)
    for x,y in pts:
        d.ellipse((x-10,y-10,x+10,y+10),fill=BG,outline=OLIVE,width=3)
        d.ellipse((x-3,y-3,x+3,y+3),fill=AMBER)
im,d=canvas(492,942)
d.rectangle((0,0,8,942),fill=OLIVE)
d.text((38,38),'NIGHTLINK',font=font(54,True),fill=WHITE)
d.text((40,109),'MESHCORE / WINDOWS',font=font(23),fill=OLIVE)
d.line((40,162,450,162),fill=OLIVE,width=3)
d.text((40,190),'RADIO. CONNECTED.',font=font(25,True),fill=AMBER)
mesh(d,246,439,171)
d.text((40,679),'01  PREPARE',font=font(29,True),fill=WHITE)
d.text((40,736),'02  INSTALL',font=font(29,True),fill=WHITE)
d.text((40,793),'03  COMPLETE',font=font(29,True),fill=WHITE)
d.line((40,858,450,858),fill='#52684d',width=2)
d.text((40,886),'DESKTOP RADIO CLIENT',font=font(22),fill=MUTED)
im.save(OUT/'sidebar.bmp')
im,d=canvas(450,171)
mesh(d,77,84,48)
d.text((151,44),'NIGHTLINK',font=font(39,True),fill=WHITE)
d.text((153,96),'RADIO / DESKTOP',font=font(22),fill=OLIVE)
d.rectangle((430,0,450,171),fill=OLIVE)
im.save(OUT/'header.bmp')
