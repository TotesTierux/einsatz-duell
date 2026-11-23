import sys, json
from PIL import Image, ImageDraw, ImageFont
names=json.load(open('store/gemini/zuordnung.json'))['karten']
ids=sys.argv[2:]; out=sys.argv[1]
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',13)
tw,th=210,150; cols=6; rows=(len(ids)+cols-1)//cols
S=Image.new('RGB',(cols*tw,rows*(th+18)),'#222')
for i,cid in enumerate(ids):
    try: im=Image.open(f'src/art/{cid}.webp')
    except: continue
    # wie in der Karte: Seitenverhältnis 1.68 mittig zuschneiden (object-fit: cover)
    W,H=im.size; tH=int(W/1.68)
    if H>tH: im=im.crop((0,(H-tH)//2,W,(H-tH)//2+tH))
    im=im.resize((tw-6,th-6)); x,y=(i%cols)*tw,(i//cols)*(th+18)
    S.paste(im,(x+3,y+3)); ImageDraw.Draw(S).text((x+4,y+th),f"{cid} {names[cid]}"[:30],fill='#fff',font=f)
S.save(out)
