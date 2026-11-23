"""Zerschneidet Gemini-Raster (3x3) in Einzelbilder und speichert sie als src/art/<kartenid>.webp.
Aufruf: python3 tools/slice_art.py BILD.jpg B07 [BILD2.jpg B08 ...]"""
import sys, json, numpy as np
from PIL import Image
MAP=json.load(open('store/gemini/zuordnung.json'))['felder']

def runs(mask, minlen):
    out=[]; s=None
    for i,v in enumerate(list(mask)+[False]):
        if v and s is None: s=i
        if not v and s is not None:
            if i-s>=minlen: out.append((s,i))
            s=None
    return out

def split(prof, n, size):
    """Trennlinien: helle Streifen; liefert n Segmente (Start, Ende)."""
    gut=runs(prof>0.93, 2)
    # Rand-Streifen abziehen
    inner=[g for g in gut if g[0]>size*0.08 and g[1]<size*0.92]
    # wähle n-1 Gutters nahe den erwarteten Positionen
    cuts=[]
    for k in range(1,n):
        exp=size*k/n
        cand=sorted(inner,key=lambda g:abs((g[0]+g[1])/2-exp))
        g=cand[0] if cand and abs((cand[0][0]+cand[0][1])/2-exp)<size*0.08 else (int(exp)-2,int(exp)+2)
        cuts.append(g)
    lo=next((g[1] for g in gut if g[0]<=2),0); hi=next((g[0] for g in gut if g[1]>=size-2),size)
    segs=[]; a=lo
    for g in cuts: segs.append((a,g[0])); a=g[1]
    segs.append((a,hi)); return segs

def _edge(white, dark, h):
    for y in range(int(h*.03),int(h*.32)):
        if dark[y]>0.3 and white[y]<0.3 and white[int(h*.01):y].mean()>0.4:
            while y+1<h and dark[y+1]>0.25: y+=1
            return y+2
    return 0

def label_cut(cell):
    """Weißes Namensfeld oben bzw. unten im Feld finden (von schwarzer Linie begrenzt) → (oben, unten) abschneiden."""
    g=np.asarray(cell.convert('L'),dtype=float); h=g.shape[0]
    white=(g>215).mean(axis=1); dark=(g<80).mean(axis=1)
    t,b=_edge(white,dark,h), _edge(np.ascontiguousarray(white[::-1]),np.ascontiguousarray(dark[::-1]),h)
    if t+b>h*.45: b=0
    return min(t,int(h*.35)), min(b,int(h*.35))

def slice_img(path, batch, out='src/art'):
    im=Image.open(path).convert('RGB'); a=np.asarray(im.convert('L'),dtype=float)/255
    W,H=im.size
    colp=(a>0.9).mean(axis=0); rowp=(a>0.9).mean(axis=1)
    cols=split(colp,3,W); rows=split(rowp,3,H); res=[]
    for r,(y0,y1) in enumerate(rows):
        for c,(x0,x1) in enumerate(cols):
            cell=im.crop((x0+2,y0+2,x1-2,y1-2)); t,b=label_cut(cell)
            cell=cell.crop((3,t+2,cell.size[0]-3,cell.size[1]-3-b))
            key=f"{batch}/{r*3+c+1}"; cid=MAP.get(key)
            if not cid: continue
            w=360; cell=cell.resize((w,round(cell.size[1]*w/cell.size[0])),Image.LANCZOS)
            cell.save(f"{out}/{cid}.webp","WEBP",quality=72,method=6); res.append((cid,cell.size))
    return res

if __name__=="__main__":
    a=sys.argv[1:]
    for p,b in zip(a[::2],a[1::2]): print(b, slice_img(p,b))
