/* ============================ 3D-ARENA (Kombi-Einsatz) ============================
   Spielfeld im Stil von Clash Royale (Fluss, zwei Brücken, je drei Türme) mit three.js.
   Die Figuren werden aus Name, Emoji, Fraktion und Einheiten-Art zusammengesetzt:
   Menschen (Uniform/Kleidung, Kopfbedeckung, Ausrüstung), Hunde, Fahrzeuge, Hubschrauber.
   Jede Art hat eigene Lauf- und Angriffsanimationen. Die Spiellogik bleibt in Kombi.step –
   die Arena zeigt nur an (Positionen werden weich nachgeführt, Ereignisse lösen Animationen aus).
   ================================================================================== */
const A3D_STYLE = {
  streife:{shirt:0x2b6cd6,pants:0x1d2f5e,hat:"cap",hatC:0x1d2f5e,tool:"baton",atk:"swing"},
  kripo:  {shirt:0xc9b48a,pants:0x4a4a4a,hat:"fedora",hatC:0x5a4a2e,tool:"pistol",atk:"shoot",proj:"bullet"},
  sek:    {shirt:0x26282c,pants:0x1c1d20,hat:"helmet",hatC:0x15161a,tool:"rifle",atk:"lunge",vest:0x111111},
  verkehr:{shirt:0xf4e01a,pants:0x1d2f5e,hat:"cap",hatC:0xf5f5f5,tool:"radar",atk:"shoot",proj:"laser"},
  hunde:  {fur:0x8a5a2b,vest:0x2b6cd6,atk:"bite",shirt:0x2b6cd6,pants:0x1d2f5e,hat:"cap",hatC:0x1d2f5e,tool:"baton",humanAtk:"swing"},
  bepo:   {shirt:0x3b4d3b,pants:0x2a352a,hat:"helmet",hatC:0x2b6cd6,tool:"shield",atk:"bash"},
  dieb:   {shirt:0x34344a,pants:0x1e1e26,hat:"beanie",hatC:0x111111,tool:"sack",atk:"swipe"},
  betrug: {shirt:0x6a2c91,pants:0x2a1040,hat:"tophat",hatC:0x151515,tool:"none",atk:"throw",proj:"card"},
  bande:  {shirt:0x3a2a1a,pants:0x2a3a5a,hat:"capback",hatC:0xcc2222,tool:"bat",atk:"swing"},
  hehler: {shirt:0x7a5230,pants:0x3a3a3a,hat:"flatcap",hatC:0x5a4030,tool:"box",atk:"throw",proj:"box"},
  raub:   {shirt:"stripes",pants:0x151515,hat:"mask",hatC:0x111111,tool:"crowbar",atk:"swing"},
  drogen: {shirt:0x2f9e44,pants:0x333333,hat:"hood",hatC:0x2f9e44,tool:"none",atk:"swipe",glasses:true,puff:true},
};
const A3D_SKIN=[0xf2c9a0,0xe0ac80,0xc68a5e,0x9a6440,0x6e4a30,0xf7d7b8];
const A3D_HAIR=[0x2a1a10,0x5a3a20,0xd9b45a,0x111111,0x8a3a1a,0x777777];

const Arena = {
  ok:null, R:null, scene:null, cam:null, units:new Map(), fx:[], raf:0, B:null, host:null, t:0, lastT:0, water:null, lights:[],
  supported(){
    if(this.ok!==null) return this.ok;
    try{ const c=document.createElement("canvas"), gl=c.getContext("webgl2")||c.getContext("webgl"); this.ok=!!(window.THREE && gl);
      const ext=gl&&gl.getExtension("WEBGL_lose_context"); ext&&ext.loseContext(); }catch(e){ this.ok=false; }
    return this.ok;
  },
  enabled(){ return this.supported() && Store.get("kb3d",true)!==false; },
  hash(s){ let h=0; for(const ch of String(s)) h=(h*31+ch.codePointAt(0))|0; return Math.abs(h); },

  /* ---------------- Szene einmalig aufbauen ---------------- */
  setup(){
    if(this.R) return;
    const T=THREE;
    const low=Store.get("kb3dq","high")==="low";
    const R=new T.WebGLRenderer({antialias:!low, powerPreference:"default"});
    R.setPixelRatio(low?1:Math.min(window.devicePixelRatio||1,1.75));
    R.shadowMap.enabled=!low; R.shadowMap.type=T.PCFShadowMap; this.R=R; this.low=low;
    // Grafik abgestürzt (manche Handys) → erst einfache Grafik, dann 2D
    R.domElement.addEventListener("webglcontextlost",e=>{ e.preventDefault(); this.fail("lost"); },false);
    const S=new T.Scene(); S.background=new T.Color(0x2c1a57); this.scene=S;
    this.cam=new T.PerspectiveCamera(38,1,.1,120);
    S.add(new T.HemisphereLight(0xffffff,0x4a6a3a,.95));
    const sun=new T.DirectionalLight(0xffffff,.95); sun.position.set(6,14,-5); sun.castShadow=true;
    sun.shadow.mapSize.set(low?256:1024,low?256:1024); Object.assign(sun.shadow.camera,{left:-9,right:9,top:11,bottom:-11,near:1,far:40}); S.add(sun);
    this.buildField();
  },
  tex(w,h,draw){ const c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; },
  M(c,opt){ return new THREE.MeshLambertMaterial(Object.assign({color:c},opt||{})); },
  box(w,h,d,mat){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.castShadow=true; m.receiveShadow=true; return m; },
  cyl(rt,rb,h,mat,seg=14){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.castShadow=true; m.receiveShadow=true; return m; },
  sph(r,mat,seg=14){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.round(seg*.75)),mat); m.castShadow=true; return m; },

  buildField(){
    const T=THREE, S=this.scene, W=9.6, L=16.4;
    // Umgebung
    const outer=new T.Mesh(new T.PlaneGeometry(40,50),this.M(0x4f8a35)); outer.rotation.x=-Math.PI/2; outer.position.y=-.02; outer.receiveShadow=true; S.add(outer);
    // Kachel-Rasen wie in der Arena
    const grass=this.tex(256,436,(g,w,h)=>{ const n=12, m=Math.round(n*L/W), sw=w/n, sh=h/m;
      for(let i=0;i<n;i++) for(let j=0;j<m;j++){ g.fillStyle=(i+j)%2?"#86c955":"#7aba4b"; g.fillRect(i*sw,j*sh,sw+1,sh+1); }
      g.strokeStyle="rgba(255,255,255,.35)"; g.lineWidth=3; g.setLineDash([10,8]); g.strokeRect(6,6,w-12,h-12); });
    const field=new T.Mesh(new T.PlaneGeometry(W,L),new T.MeshLambertMaterial({map:grass})); field.rotation.x=-Math.PI/2; field.receiveShadow=true; S.add(field);
    // Spielhälften leicht einfärben
    [[-1,0x3fa9ff],[1,0xff3b3b]].forEach(([s,c])=>{ const p=new T.Mesh(new T.PlaneGeometry(W,L/2-.6),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.07}));
      p.rotation.x=-Math.PI/2; p.position.set(0,.005,s*(L/4+.3)); S.add(p); });
    // Fluss
    const wt=this.tex(128,64,(g,w,h)=>{ g.fillStyle="#2f8fe0"; g.fillRect(0,0,w,h); g.strokeStyle="rgba(255,255,255,.45)"; g.lineWidth=3;
      for(let y=10;y<h;y+=20){ g.beginPath(); for(let x=0;x<=w;x+=8) g.lineTo(x,y+Math.sin(x/12)*4); g.stroke(); } });
    wt.wrapS=wt.wrapT=T.RepeatWrapping; wt.repeat.set(4,1); this.water=wt;
    const river=new T.Mesh(new T.PlaneGeometry(W+6,1.2),new T.MeshLambertMaterial({map:wt})); river.rotation.x=-Math.PI/2; river.position.y=.02; S.add(river);
    [-.62,.62].forEach(z=>{ const bank=this.box(W+6,.1,.1,this.M(0x8b6b3d)); bank.position.set(0,.05,z); S.add(bank); });
    // Brücken
    const plank=this.tex(64,128,(g,w,h)=>{ g.fillStyle="#a8743a"; g.fillRect(0,0,w,h); g.strokeStyle="#6b4520"; g.lineWidth=3; for(let y=0;y<h;y+=16){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } });
    [-2.7,2.7].forEach(x=>{ const b=this.box(1.3,.14,1.8,new T.MeshLambertMaterial({map:plank})); b.position.set(x,.07,0); S.add(b);
      [-.66,.66].forEach(dx=>{ const r=this.box(.08,.25,1.8,this.M(0x6b4520)); r.position.set(x+dx,.2,0); S.add(r); }); });
    // Mauer
    const stone=this.M(0x8d8f99);
    [[0,-L/2-.15,W+.6,.3],[0,L/2+.15,W+.6,.3]].forEach(([x,z,w,d])=>{ const m=this.box(w,.45,d,stone); m.position.set(x,.22,z); S.add(m); });
    [-1,1].forEach(s=>[-1,1].forEach(h=>{ const m=this.box(.3,.45,L/2-.6,stone); m.position.set(s*(W/2+.15),.22,h*(L/4+.3)); S.add(m); }));
    // Türme: unten Polizeiwache (blau), oben Gauner-Versteck (rot)
    this.lights=[];
    [[-1,"police"],[1,"crook"]].forEach(([s,k])=>{
      this.tower(-3.3,s*6.15,k,false); this.tower(3.3,s*6.15,k,false); this.tower(0,s*7.45,k,true); });
    // Bäume und Büsche außen
    const rnd=(()=>{ let x=7; return ()=>(x=(x*16807)%2147483647)/2147483647; })();
    for(let i=0;i<26;i++){ const side=i%2?1:-1, x=side*(W/2+1+rnd()*2.5), z=(rnd()-.5)*L*1.05;
      const tr=new T.Group(); const trunk=this.cyl(.12,.15,.6,this.M(0x6b4520),6); trunk.position.y=.3; tr.add(trunk);
      const crown=new T.Mesh(new T.ConeGeometry(.6+rnd()*.3,1.4,7),this.M(rnd()<.5?0x2f7a2f:0x3d8f3a)); crown.position.y=1.2; crown.castShadow=true; tr.add(crown);
      tr.position.set(x,0,z); S.add(tr); }
  },
  tower(x,z,kind,king){
    const T=THREE, g=new T.Group(), police=kind==="police";
    const r=king?1.05:.8, h=king?1.3:1.05;
    const base=this.cyl(r,r*1.1,h,this.M(0x9a9ca6),10); base.position.y=h/2; g.add(base);
    const ring=this.cyl(r*1.12,r*1.12,.18,this.M(0x6f717a),10); ring.position.y=h; g.add(ring);
    // Zinnen
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const c=this.box(.2,.22,.2,this.M(0x6f717a)); c.position.set(Math.cos(a)*r,h+.2,Math.sin(a)*r); g.add(c); }
    const roof=new T.Mesh(new T.ConeGeometry(r*.85,king?1.1:.8,8),this.M(police?0x2b6cd6:0xb3262b)); roof.position.y=h+(king?.75:.6); roof.castShadow=true; g.add(roof);
    if(police){ // Blaulicht
      const bl=new T.Mesh(new T.SphereGeometry(.16,10,8),new T.MeshBasicMaterial({color:0x4fb4ff})); bl.position.y=h+(king?1.38:1.05); g.add(bl); this.lights.push(bl); }
    else { // Fahne
      const pole=this.cyl(.03,.03,.9,this.M(0x333333),5); pole.position.y=h+(king?1.6:1.3); g.add(pole);
      const flag=this.box(.45,.28,.03,this.M(0x111111)); flag.position.set(.24,h+(king?1.9:1.6),0); g.add(flag); }
    if(king){ const sign=this.sprite(police?"🚔 WACHE":"🏚️ VERSTECK",256,64,"#fff",police?"#1d4fa3":"#7a1a1d",28); sign.scale.set(1.9,.48,1); sign.position.y=h+.45; sign.position.z=-Math.sign(z)*1.1; g.add(sign); }
    g.position.set(x,0,z); this.scene.add(g);
  },
  sprite(text,w,h,fg,bg,size){
    const t=this.tex(w,h,(g,W,H)=>{ if(bg){ g.fillStyle=bg; const r=H/2.6; g.beginPath(); g.roundRect?g.roundRect(2,2,W-4,H-4,r):g.rect(2,2,W-4,H-4); g.fill(); g.lineWidth=4; g.strokeStyle="#111"; g.stroke(); }
      g.fillStyle=fg; g.font=`bold ${size}px system-ui,"Segoe UI Emoji","Noto Color Emoji",sans-serif`; g.textAlign="center"; g.textBaseline="middle"; g.fillText(text,W/2,H/2+2); });
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true})); s.renderOrder=10; return s;
  },

  /* ---------------- Figuren ---------------- */
  style(c){
    const st=Object.assign({},A3D_STYLE[c.attr]||A3D_STYLE.streife), h=this.hash(c.name);
    if(st.humanAtk && Kombi.body(c)==='human') st.atk=st.humanAtk;
    st.skin=A3D_SKIN[h%A3D_SKIN.length]; st.hair=A3D_HAIR[(h>>3)%A3D_HAIR.length];
    const first=c.name.split(" ")[0]; st.female=/in$/.test(first)&&first.length>5 || /\b(lea|lisa|anna|gabi|paula|hanna|sabine|nina|jana|tina|sandra|petra|olga|mia|lena|sophie|kim)\b/i.test(c.name);
    // Fraktionsfarben der Karte für Fahrzeuge
    const a=c.art||{}; st.c1=a.c1||"#ffffff"; st.c2=a.c2||"#2b6cd6";
    return st;
  },
  build(f){
    const c=Kombi.card(f.u), st=this.style(c), body=f.body;
    const U={f,c,st,body,mats:[],root:new THREE.Group(),model:new THREE.Group(),hud:new THREE.Group(),atk:-1,dead:-1,flash:0,phase:Math.random()*6};
    const M=(col,opt)=>{ const m=this.M(col,opt); U.mats.push(m); return m; };
    U.root.add(U.model); U.root.add(U.hud);
    if(body==="dog") this.dog(U,M); else if(body==="car") this.car(U,M); else if(body==="heli") this.heli(U,M); else this.human(U,M);
    // Abzeichen (Emoji + Sterne) und Lebensbalken
    const a=c.art||{}, mine=f.side==="a";
    const badge=this.sprite(`${a.emoji||"❓"}${"★".repeat(f.u.star)}`,160,64,"#ffd23f",mine?"#1d4fa3":"#8a1c1c",34);
    badge.scale.set(.95,.38,1); U.hud.add(badge);
    const bg=new THREE.Sprite(new THREE.SpriteMaterial({color:0x220000,depthTest:false})); bg.scale.set(.9,.1,1); bg.renderOrder=11;
    const fg=new THREE.Sprite(new THREE.SpriteMaterial({color:mine?0x3ddc84:0xff4d4d,depthTest:false})); fg.center.set(0,.5); fg.scale.set(.86,.07,1); fg.renderOrder=12;
    const top=U.top||1.9; badge.position.y=top+.38; bg.position.y=top+.12; fg.position.set(.43,top+.12,0);
    U.hud.add(bg); U.hud.add(fg); U.hpFg=fg;
    U.root.position.set(f.x,0,f.z); U.model.rotation.y=f.side==="a"?0:Math.PI;
    U.model.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    this.scene.add(U.root); return U;
  },
  human(U,M){
    const T=THREE, st=U.st, m=U.model, s=1;
    const stripes = st.shirt==="stripes";
    const shirtMat = stripes ? new T.MeshLambertMaterial({map:this.tex(32,32,(g)=>{ for(let y=0;y<32;y+=8){ g.fillStyle=(y/8)%2?"#111":"#eee"; g.fillRect(0,y,32,8); } })}) : M(st.shirt);
    if(stripes) U.mats.push(shirtMat);
    const leg=x=>{ const p=new T.Group(); p.position.set(x,.56,0); const l=this.box(.17,.48,.19,M(st.pants)); l.position.y=-.24; p.add(l);
      const shoe=this.box(.19,.1,.28,M(0x1a1a1a)); shoe.position.set(0,-.5,.05); p.add(shoe); m.add(p); return p; };
    U.legL=leg(-.12); U.legR=leg(.12);
    const torso=new T.Group(); torso.position.y=.56; m.add(torso); U.torso=torso;
    const chest=this.box(.52,.56,.32,shirtMat); chest.position.y=.3; torso.add(chest);
    const belt=this.box(.54,.08,.34,M(0x1a1a1a)); belt.position.y=.04; torso.add(belt);
    if(st.vest){ const v=this.box(.56,.4,.36,M(st.vest)); v.position.y=.33; torso.add(v); }
    if(U.c.faction==="polizei" && U.c.attr!=="sek"){ const badge=this.box(.09,.1,.02,M(0xffd23f)); badge.position.set(-.13,.42,.17); torso.add(badge); }
    if(U.c.attr==="verkehr"){ [.2,.4].forEach(y=>{ const r=this.box(.53,.04,.33,M(0xdddddd)); r.position.y=y; torso.add(r); }); }
    const arm=x=>{ const p=new T.Group(); p.position.set(x,.52,0); torso.add(p);
      const a=this.box(.14,.44,.15,stripes?shirtMat:M(st.shirt==="stripes"?0xeeeeee:st.shirt)); a.position.y=-.2; p.add(a);
      const hand=this.sph(.085,M(st.skin),8); hand.position.y=-.45; p.add(hand); const h=new T.Group(); h.position.y=-.46; p.add(h); p.hand=h; return p; };
    U.armL=arm(-.34); U.armR=arm(.34);
    const head=new T.Group(); head.position.y=.92; torso.add(head); U.head=head;
    const skull=this.sph(.3,M(st.skin),16); skull.position.y=.18; head.add(skull);
    [-.1,.1].forEach(x=>{ const e=new T.Mesh(new T.SphereGeometry(.045,8,6),M(0x111111)); e.position.set(x,.21,.27); head.add(e); });
    const mouth=this.box(.1,.025,.02,M(0x7a2a2a)); mouth.position.set(0,.07,.29); head.add(mouth);
    if(st.glasses){ const gl=this.box(.34,.08,.04,M(0x050505)); gl.position.set(0,.22,.29); head.add(gl); }
    // Haare
    if(!["helmet","hood","tophat","beanie","mask"].includes(st.hat)){ const hair=this.sph(.31,M(st.hair),14); hair.scale.set(1,.55,1); hair.position.set(0,.3,-.04); head.add(hair); }
    if(st.female){ const pt=this.sph(.14,M(st.hair),10); pt.scale.set(.8,1.3,.8); pt.position.set(0,.12,-.32); head.add(pt); }
    this.hat(head,st,M);
    this.tool(U,M);
    U.top=1.95;
  },
  hat(head,st,M){
    const T=THREE, y=.38;
    const add=o=>{ head.add(o); return o; };
    switch(st.hat){
      case "cap": case "capback": { const c=add(this.cyl(.3,.31,.14,M(st.hatC),16)); c.position.y=y;
        const v=add(this.box(.36,.03,.22,M(0x111111))); v.position.set(0,y-.06,st.hat==="cap"?.3:-.3);
        if(st.hat==="cap"){ const b=add(this.box(.08,.07,.02,M(0xffd23f))); b.position.set(0,y+.01,.31); } break; }
      case "fedora": { const b=add(this.cyl(.44,.44,.03,M(st.hatC),18)); b.position.y=y-.02; const c=add(this.cyl(.24,.28,.24,M(st.hatC),14)); c.position.y=y+.1;
        const band=add(this.cyl(.285,.285,.05,M(0x111111),14)); band.position.y=y+.02; break; }
      case "helmet": { const h=add(new T.Mesh(new T.SphereGeometry(.34,16,10,0,Math.PI*2,0,Math.PI/2),M(st.hatC))); h.position.y=.2; h.castShadow=true;
        const vis=add(this.box(.46,.14,.06,new T.MeshLambertMaterial({color:0x223344,transparent:true,opacity:.6}))); vis.position.set(0,.2,.29); break; }
      case "beanie": { const h=add(new T.Mesh(new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI/2),M(st.hatC))); h.position.y=.22;
        const r=add(this.cyl(.33,.33,.08,M(0x222222),16)); r.position.y=.24; const pom=add(this.sph(.07,M(0xcc2222),8)); pom.position.y=.56; break; }
      case "tophat": { const b=add(this.cyl(.42,.42,.03,M(st.hatC),18)); b.position.y=y-.02; const c=add(this.cyl(.24,.24,.46,M(st.hatC),14)); c.position.y=y+.22;
        const band=add(this.cyl(.245,.245,.06,M(0xaa2233),14)); band.position.y=y+.05; break; }
      case "flatcap": { const c=add(this.sph(.33,M(st.hatC),14)); c.scale.set(1,.35,1.05); c.position.y=y; const v=add(this.box(.3,.03,.16,M(st.hatC))); v.position.set(0,y-.04,.3); break; }
      case "mask": { const h=add(new T.Mesh(new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI/2),M(0x111111))); h.position.y=.22;
        const band=add(this.cyl(.315,.315,.12,M(0x111111),16)); band.position.y=.21;
        [-.1,.1].forEach(x=>{ const e=add(new T.Mesh(new T.SphereGeometry(.05,8,6),M(0xffffff))); e.position.set(x,.21,.29); }); break; }
      case "hood": { const h=add(new T.Mesh(new T.SphereGeometry(.37,16,12,0,Math.PI*2,0,Math.PI*.62),M(st.hatC))); h.position.set(0,.16,-.06); h.rotation.x=-.25; break; }
    }
  },
  tool(U,M){
    const T=THREE, h=U.armR.hand, hl=U.armL.hand, st=U.st; let t=null;
    switch(st.tool){
      case "baton": t=this.cyl(.035,.035,.55,M(0x111111),6); t.rotation.x=Math.PI/2; t.position.z=.22; h.add(t); break;
      case "pistol": t=new T.Group(); { const b=this.box(.07,.09,.24,M(0x222222)); b.position.z=.1; t.add(b); } h.add(t); break;
      case "rifle": t=this.box(.08,.11,.75,M(0x1a1a1a)); t.position.z=.25; h.add(t); { const m=this.box(.06,.15,.08,M(0x1a1a1a)); m.position.set(0,-.1,.12); h.add(m); } break;
      case "radar": t=new T.Group(); { const b=this.box(.16,.14,.24,M(0x666a70)); b.position.z=.1; t.add(b); const l=new T.Mesh(new T.CylinderGeometry(.05,.05,.03,10),new T.MeshBasicMaterial({color:0xff2222})); l.rotation.x=Math.PI/2; l.position.z=.23; t.add(l); } h.add(t); break;
      case "shield": { const s=this.box(.55,.75,.05,new T.MeshLambertMaterial({color:0x9fd0ff,transparent:true,opacity:.7})); s.position.set(0,.05,.2); hl.add(s); U.shieldMesh=s;
        const bt=this.cyl(.035,.035,.5,M(0x111111),6); bt.rotation.x=Math.PI/2; bt.position.z=.2; h.add(bt); t=bt; } break;
      case "sack": { const s=this.sph(.26,M(0x9a7a4a),10); s.position.set(.15,.75,-.28); U.torso.add(s); } break;
      case "bat": t=this.cyl(.06,.03,.6,M(0xb07a3a),8); t.rotation.x=Math.PI/2; t.position.z=.28; h.add(t); break;
      case "box": t=this.box(.3,.26,.3,M(0xb8894a)); t.position.set(-.17,0,.18); h.add(t); break;
      case "crowbar": t=new T.Group(); { const a=this.cyl(.03,.03,.6,M(0xc22020),6); a.rotation.x=Math.PI/2; a.position.z=.28; t.add(a); const b=this.cyl(.03,.03,.16,M(0xc22020),6); b.position.set(0,.06,.57); t.add(b); } h.add(t); break;
    }
    U.toolMesh=t;
  },
  dog(U,M){
    const T=THREE, m=U.model, fur=U.st.fur||0x8a5a2b, dark=0x3a2614, h=this.hash(U.c.name);
    const col=[0x8a5a2b,0x2a2a2a,0xc9a26a,0x5a4030][h%4];
    const body=this.box(.38,.36,.85,M(col)); body.position.y=.5; m.add(body); U.torso=body;
    const vest=this.box(.4,.25,.45,M(U.st.vest)); vest.position.set(0,.55,.05); m.add(vest);
    const k9=this.sprite("K9",64,32,"#fff",null,22); k9.scale.set(.3,.15,1); k9.position.set(0,.69,.05); m.add(k9);
    const head=new T.Group(); head.position.set(0,.72,.48); m.add(head); U.head=head;
    const sk=this.box(.32,.3,.32,M(col)); head.add(sk);
    const snout=this.box(.18,.15,.22,M(dark)); snout.position.set(0,-.05,.24); head.add(snout);
    const nose=this.box(.08,.06,.04,M(0x050505)); nose.position.set(0,0,.36); head.add(nose);
    [-.1,.1].forEach(x=>{ const e=this.box(.06,.06,.02,M(0x111111)); e.position.set(x,.06,.17); head.add(e);
      const ear=new T.Mesh(new T.ConeGeometry(.07,.2,4),M(dark)); ear.position.set(x,.22,-.02); head.add(ear); });
    const legs=[]; [[-.13,.3],[.13,.3],[-.13,-.3],[.13,-.3]].forEach(([x,z])=>{ const p=new T.Group(); p.position.set(x,.38,z); const l=this.box(.1,.38,.1,M(col)); l.position.y=-.19; p.add(l); m.add(p); legs.push(p); });
    U.legs=legs;
    const tail=this.cyl(.03,.05,.35,M(col),6); tail.position.set(0,.68,-.5); tail.rotation.x=-.8; m.add(tail); U.tail=tail;
    U.top=1.05;
  },
  car(U,M){
    const T=THREE, m=U.model, police=U.c.faction==="polizei";
    const bodyCol = police ? 0xf2f2f2 : new T.Color(U.st.c2).getHex();
    const chassis=this.box(1.0,.42,1.7,M(bodyCol)); chassis.position.y=.42; m.add(chassis); U.torso=chassis;
    if(police){ const stripe=this.box(1.02,.12,1.5,M(0x2b6cd6)); stripe.position.y=.45; m.add(stripe); }
    const cabin=this.box(.86,.36,.85,new T.MeshLambertMaterial({color:0x9fd0ff,transparent:true,opacity:.85})); cabin.position.set(0,.8,-.1); m.add(cabin); U.mats.push(cabin.material);
    const roof=this.box(.88,.05,.86,M(bodyCol)); roof.position.set(0,1.0,-.1); m.add(roof);
    U.wheels=[]; [[-.5,.5],[.5,.5],[-.5,-.55],[.5,-.55]].forEach(([x,z])=>{ const w=this.cyl(.2,.2,.14,M(0x151515),12); w.rotation.z=Math.PI/2; w.position.set(x,.2,z); m.add(w); U.wheels.push(w); });
    [-.3,.3].forEach(x=>{ const l=new T.Mesh(new T.BoxGeometry(.18,.08,.03),new T.MeshBasicMaterial({color:0xfff6b0})); l.position.set(x,.48,.86); m.add(l); });
    if(police){ U.siren=[]; [[-.18,0xff2a2a],[.18,0x2a6bff]].forEach(([x,c])=>{ const s=new T.Mesh(new T.BoxGeometry(.3,.12,.18),new T.MeshBasicMaterial({color:c})); s.position.set(x,1.09,-.1); m.add(s); U.siren.push(s); }); }
    if(Kombi.card(U.f.u).attr==="verkehr"||/video|mess|kamera|blitz/i.test(U.c.name)){ const cam=this.box(.22,.18,.3,M(0x333333)); cam.position.set(0,1.17,.15); m.add(cam); U.muzzle=cam; }
    if(/lautsprecher/i.test(U.c.name)){ const hn=new T.Mesh(new T.ConeGeometry(.15,.35,10,1,true),M(0xdddddd)); hn.rotation.x=Math.PI/2; hn.position.set(0,1.18,.2); m.add(hn); }
    U.top=1.45;
  },
  heli(U,M){
    const T=THREE, m=U.model, police=U.c.faction==="polizei";
    const fly=new T.Group(); fly.position.y=2.1; m.add(fly); U.fly=fly; U.torso=fly;
    const body=this.sph(.5,M(police?0x2b6cd6:0x333333),16); body.scale.set(1,.85,1.5); fly.add(body);
    const glass=this.sph(.38,new T.MeshLambertMaterial({color:0xbfe6ff,transparent:true,opacity:.8}),14); glass.scale.set(1,.8,1); glass.position.set(0,.08,.38); fly.add(glass); U.mats.push(glass.material);
    const boom=this.cyl(.08,.13,1.3,M(police?0xf2f2f2:0x222222),8); boom.rotation.x=Math.PI/2; boom.position.set(0,.08,-1.15); fly.add(boom);
    const fin=this.box(.05,.4,.25,M(police?0x2b6cd6:0x333333)); fin.position.set(0,.25,-1.75); fly.add(fin);
    const rotor=new T.Group(); rotor.position.y=.52; fly.add(rotor); U.rotor=rotor;
    [0,Math.PI/2].forEach(a=>{ const b=this.box(2.3,.03,.12,M(0x222222)); b.rotation.y=a; rotor.add(b); });
    const tr=this.box(.04,.5,.08,M(0x222222)); tr.position.set(.1,.25,-1.78); fly.add(tr); U.tailRotor=tr;
    [-.32,.32].forEach(x=>{ const sk=this.box(.05,.05,1.1,M(0x444444)); sk.position.set(x,-.55,0); fly.add(sk); });
    const shadow=new T.Mesh(new T.CircleGeometry(.6,16),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.25})); shadow.rotation.x=-Math.PI/2; shadow.position.y=.02; m.add(shadow);
    U.top=2.9;
  },

  /* ---------------- Ein-/Ausblenden ---------------- */
  mount(el,B){
    this.setup(); this.unmount(true); this.B=B; this.host=el;
    el.appendChild(this.R.domElement); this.resize();
    [...B.a,...B.b].forEach(f=>this.units.set(f,this.build(f)));
    this.lastT=performance.now();
    const loop=now=>{ this.raf=requestAnimationFrame(loop); const dt=Math.min(.05,(now-this.lastT)/1000); this.lastT=now;
      try{ this.frame(dt); }catch(e){ console.error("3D-Fehler:",e); this.fail("error"); } };
    this.raf=requestAnimationFrame(loop);
    this._rs=()=>this.resize(); window.addEventListener("resize",this._rs);
    setTimeout(()=>{ try{ if(this.R && this.B===B && this.R.getContext().isContextLost()) this.fail("lost"); }catch(e){} },1200);
  },
  /* Grafikproblem: auf einfache Grafik zurückschalten, beim zweiten Mal auf 2D */
  fail(why){
    if(this._failing) return; this._failing=true;
    const wasLow=Store.get("kb3dq","high")==="low";
    this.destroy();
    if(!wasLow){ Store.set("kb3dq","low"); toast("3D-Grafik wird vereinfacht …"); }
    else { Store.set("kb3d",false); this.ok=false; toast("3D läuft auf diesem Gerät nicht – zeige 2D-Ansicht"); }
    setTimeout(()=>{ this._failing=false; Kombi._3d=null; if(Kombi.anim) Kombi.drawBattle([]); },300);
  },
  destroy(){
    try{ this.unmount(); }catch(e){}
    try{ this.R&&this.R.dispose(); }catch(e){}
    this.R=null; this.scene=null; this.lights=[]; this.water=null;
  },
  unmount(keep){
    cancelAnimationFrame(this.raf); this.raf=0;
    if(this._rs) window.removeEventListener("resize",this._rs);
    if(this.scene) this.units.forEach(U=>{ this.scene.remove(U.root); U.root.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material&&o.material.map&&o.isSprite) o.material.map.dispose(); }); U.mats.forEach(m=>m.dispose()); });
    this.units.clear();
    if(this.scene) this.fx.forEach(x=>this.scene.remove(x.obj)); this.fx=[]; this.units.clear();
    if(!keep && this.R && this.R.domElement.parentNode) this.R.domElement.parentNode.removeChild(this.R.domElement);
    this.B=null;
  },
  resize(){
    if(!this.host) return;
    const w=this.host.clientWidth||360, h=Math.round(Math.min(window.innerHeight*.66, w*1.62));
    this.host.style.height=h+"px"; this.R.setSize(w,h); this.cam.aspect=w/h;
    // ganzes Feld im Bild halten (schmale Bildschirme → weiter weg)
    const dist = Math.max(18.5, 11.2/Math.tan(THREE.MathUtils.degToRad(this.cam.fov/2))/Math.max(this.cam.aspect,.3)*.5);
    this.cam.position.set(0, dist*.78, -dist*.62); this.cam.lookAt(0,0,.55); this.cam.updateProjectionMatrix();
  },

  /* ---------------- Ereignisse aus der Simulation ---------------- */
  onEvents(ev){
    ev.forEach(e=>{ if(e.k==="hit") Sound.play(e.f.ranged?"shot":"hit"); if(e.k==="die") Sound.play("boom"); });
    ev.forEach(e=>{
      if(e.k==="hit"){ const A=this.units.get(e.f), Tg=this.units.get(e.t); if(!A||!Tg) return;
        A.atk=0;
        const st=A.st, ranged=e.f.ranged;
        if(ranged){ this.projectile(A,Tg, A.body==="car"||A.body==="heli" ? (A.c.faction==="polizei"?"laser":"bullet") : (st.proj||"bullet"), e.d); }
        else { setTimeout(()=>{ this.hitFx(Tg,e.d,st.puff); },A.body==="human"?170:110); }
      }
      else if(e.k==="miss"){ const U=this.units.get(e.f); if(U) this.label(U,"weg!","#fff"); }
      else if(e.k==="die"){ const U=this.units.get(e.f); if(U&&U.dead<0){ U.dead=0; U.hud.visible=false; this.puff(U.root.position,0x999999,1.2); } }
    });
  },
  hitFx(U,d,poison){ if(!U) return; U.flash=.16; this.label(U,"-"+d, poison?"#6dff7a":"#ff4040"); if(poison) this.puff(U.root.position,0x4be36b,.9); },
  label(U,text,color){
    if(!this.host) return;
    const p=U.root.position.clone(); p.y+=(U.top||1.9)+.2; p.project(this.cam);
    const w=this.host.clientWidth, h=this.host.clientHeight;
    const el=document.createElement("div"); el.className="kb3-dmg"; el.textContent=text; el.style.color=color;
    el.style.left=((p.x+1)/2*w)+"px"; el.style.top=((1-p.y)/2*h)+"px"; this.host.appendChild(el);
    setTimeout(()=>el.remove(),800);
  },
  puff(pos,color,size){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}));
    m.position.copy(pos); m.position.y+=.5; this.scene.add(m); this.fx.push({obj:m,t:0,dur:.5,kind:"puff",size});
  },
  projectile(A,Tg,kind,d){
    const T=THREE; let obj;
    if(kind==="laser"){ obj=new T.Mesh(new T.CylinderGeometry(.04,.04,1,6),new T.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.9})); }
    else if(kind==="card"){ obj=new T.Mesh(new T.BoxGeometry(.2,.02,.28),new T.MeshBasicMaterial({color:0xffffff})); const r=new T.Mesh(new T.BoxGeometry(.06,.025,.06),new T.MeshBasicMaterial({color:0xd01020})); obj.add(r); }
    else if(kind==="box"){ obj=new T.Mesh(new T.BoxGeometry(.25,.22,.25),this.M(0xb8894a)); }
    else { obj=new T.Mesh(new T.SphereGeometry(.07,8,6),new T.MeshBasicMaterial({color:0xffe066})); }
    const from=A.root.position.clone(); from.y+=A.body==="heli"?2:A.body==="car"?1.1:1.1;
    obj.position.copy(from); this.scene.add(obj);
    this.fx.push({obj,t:0,dur:kind==="laser"?.15:kind==="bullet"?.18:.35,kind,from,to:Tg,d,A});
  },

  /* ---------------- Animation pro Bild ---------------- */
  frame(dt){
    this.t+=dt; const t=this.t;
    if(this.water) this.water.offset.x=(t*.06)%1;
    this.lights.forEach((l,i)=>{ const on=Math.sin(t*6+i)>0; l.material.color.setHex(on?0x4fb4ff:0x0b2a66); });
    const k=1-Math.pow(.0005,dt);
    this.units.forEach(U=>{
      const f=U.f, r=U.root;
      // Position weich nachführen
      r.position.x+=(f.x-r.position.x)*k; r.position.z+=(f.z-r.position.z)*k;
      if(f.dir!=null && U.dead<0){ let d=f.dir-U.model.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); U.model.rotation.y+=d*Math.min(1,dt*10); }
      if(U.hpFg) U.hpFg.scale.x=.86*Math.max(0,f.hp/f.maxhp);
      const walk=f.moving&&U.dead<0, ph=(U.phase+=dt*(walk?(U.body==="dog"?16:11):2));
      // Treffer-Aufblitzen
      if(U.flash>0){ U.flash-=dt; U.mats.forEach(m=>m.emissive&&m.emissive.setHex(U.flash>0?0x992222:0)); }
      // Angriff
      let a=-1; if(U.atk>=0){ U.atk+=dt/.36; a=U.atk; if(a>=1){ U.atk=-1; a=-1; } }
      if(U.dead>=0){ this.dying(U,dt); return; }
      if(U.body==="human") this.animHuman(U,walk,ph,a);
      else if(U.body==="dog") this.animDog(U,walk,ph,a);
      else if(U.body==="car") this.animCar(U,walk,ph,a,dt);
      else this.animHeli(U,walk,ph,a,dt);
    });
    // Effekte
    this.fx=this.fx.filter(x=>{
      x.t+=dt; const p=Math.min(1,x.t/x.dur);
      if(x.kind==="puff"){ x.obj.scale.setScalar(.5+p*(x.size||1)*1.6); x.obj.material.opacity=.7*(1-p); }
      else if(x.to){ const to=x.to.root.position.clone(); to.y+=x.to.body==="heli"?2.1:.8;
        if(x.kind==="laser"){ const mid=x.from.clone().lerp(to,.5), len=x.from.distanceTo(to); x.obj.position.copy(mid); x.obj.scale.set(1,len,1);
          x.obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(x.from).normalize()); x.obj.material.opacity=.9*(1-p); }
        else { x.obj.position.copy(x.from).lerp(to,p); if(x.kind!=="bullet") x.obj.position.y+=Math.sin(p*Math.PI)*1.1; x.obj.rotation.y+=dt*18; x.obj.rotation.x+=dt*6; }
        if(p>=1 && !x.done){ x.done=true; this.hitFx(x.to,x.d,x.A&&x.A.st.puff); } }
      if(p>=1){ this.scene.remove(x.obj); x.obj.geometry&&x.obj.geometry.dispose(); return false; }
      return true; });
    this.R.render(this.scene,this.cam);
  },
  off(U,o){ const r=U.model.rotation.y; U.model.position.x=Math.sin(r)*o; U.model.position.z=Math.cos(r)*o; },
  animHuman(U,walk,ph,a){
    const sw=walk?Math.sin(ph)*.7:0;
    U.legL.rotation.x=sw; U.legR.rotation.x=-sw;
    U.torso.position.y=.56+(walk?Math.abs(Math.cos(ph))*.05:Math.sin(ph)*.01);
    U.armL.rotation.set(walk?-sw*.8:0,0,0); U.armR.rotation.set(walk?sw*.8:0,0,0); U.torso.rotation.set(0,0,0); this.off(U,0);
    if(a<0) return;
    const e=Math.sin(a*Math.PI);           // 0 → 1 → 0
    switch(U.st.atk){
      case "swing": U.armR.rotation.x = a<.35 ? -2.6*(a/.35) : -2.6+3.3*((a-.35)/.65); U.torso.rotation.y=-.3*e; break;
      case "lunge": U.armR.rotation.x=-1.5; U.armL.rotation.x=-1.3; this.off(U,.45*e); U.torso.rotation.x=.2*e; break;
      case "shoot": U.armR.rotation.x=-1.55; U.armR.rotation.z=.05; U.torso.rotation.x=-.12*e*(a>.2?1:0); break;
      case "throw": U.armR.rotation.x = a<.4 ? -3*(a/.4) : -3+2.6*((a-.4)/.6); U.torso.rotation.x=.18*e; break;
      case "bash": U.armL.rotation.x=-1.4; this.off(U,.4*e); U.torso.rotation.y=.25*e; break;
      case "swipe": U.armR.rotation.x=-1.4; U.armR.rotation.z=-1.2+2.2*a; U.torso.rotation.y=.5-1*a; break;
    }
  },
  animDog(U,walk,ph,a){
    U.legs.forEach((l,i)=>l.rotation.x=walk?Math.sin(ph+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*.8:0);
    U.torso.position.y=.5+(walk?Math.abs(Math.sin(ph))*.06:0);
    U.tail.rotation.z=Math.sin(ph*2)*.6; this.off(U,0); U.head.rotation.x=0; U.head.position.z=.48;
    if(a>=0){ const e=Math.sin(a*Math.PI); this.off(U,.5*e); U.head.rotation.x=.5*e; U.head.position.z=.48+.12*e; }
  },
  animCar(U,walk,ph,a,dt){
    U.wheels.forEach(w=>w.rotation.x+=walk?dt*14:0);
    U.torso.position.y=.42+(walk?Math.sin(ph*2)*.015:0); this.off(U,0);
    if(U.siren) U.siren.forEach((s,i)=>s.material.color.setHex(Math.sin(this.t*12+i*Math.PI)>0?(i?0x2a6bff:0xff2a2a):0x222222));
    if(a>=0 && !U.f.ranged) this.off(U,.6*Math.sin(a*Math.PI));
  },
  animHeli(U,walk,ph,a,dt){
    U.rotor.rotation.y+=dt*28; U.tailRotor.rotation.x+=dt*30;
    U.fly.position.y=2.1+Math.sin(this.t*2.4+U.phase)*.08; U.fly.rotation.x=walk?.18:0;
    if(a>=0) U.fly.rotation.x=-.15*Math.sin(a*Math.PI);
  },
  dying(U,dt){
    U.dead+=dt; const d=U.dead;
    if(U.body==="heli"){ U.fly.position.y=Math.max(.4,2.1-d*3); U.fly.rotation.z=d*2; }
    else if(U.body==="car"){ U.model.rotation.z=Math.min(.4,d); }
    else U.model.rotation.x=-Math.min(Math.PI/2,d*4);
    if(d>.8){ U.mats.forEach(m=>{ m.transparent=true; m.opacity=Math.max(0,1-(d-.8)*1.5); }); }
    if(d>1.6) U.root.visible=false;
  },
};
