/* ============================ MUSIK & SOUND ============================
   Alles wird live mit der Web-Audio-API erzeugt – keine Audiodateien nötig.
   Musik: „menu“ (ruhiger Groove) und „battle“ (treibende Kampfmusik, wird bei wenig LP intensiver).
   Sound.play(name) spielt einen Effekt (Angriff, Treffer, Explosion, Sirene, Fanfare …).
   ======================================================================= */
const Sound = {
  ctx:null, master:null, musicGain:null, sfxGain:null, noiseBuf:null,
  cfg:null, mode:null, step:0, nextT:0, timer:null, intense:false, _last:{},
  conf(){ if(!this.cfg) this.cfg=Object.assign({music:true,sfx:true,vol:.8}, Store.get("audio",{})); return this.cfg; },
  save(){ Store.set("audio",this.cfg); },
  init(){
    if(this.ctx) return this.ctx.state==="suspended" ? this.ctx.resume() : null;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    const c=this.ctx=new AC();
    this.master=c.createGain(); this.master.gain.value=this.conf().vol; this.master.connect(c.destination);
    const comp=c.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.connect(this.master);
    this.musicGain=c.createGain(); this.musicGain.gain.value=this.cfg.music?.32:0; this.musicGain.connect(comp);
    this.sfxGain=c.createGain(); this.sfxGain.gain.value=this.cfg.sfx?.9:0; this.sfxGain.connect(comp);
    // Echo für die Melodie
    this.delay=c.createDelay(); this.delay.delayTime.value=.27; const fb=c.createGain(); fb.gain.value=.28; const dw=c.createGain(); dw.gain.value=.35;
    this.delay.connect(fb); fb.connect(this.delay); this.delay.connect(dw); dw.connect(this.musicGain);
    const len=c.sampleRate; this.noiseBuf=c.createBuffer(1,len,c.sampleRate); const d=this.noiseBuf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    if(this.mode) this.startLoop();
  },
  /* ---------- Einstellungen ---------- */
  toggle(kind){ const c=this.conf(); c[kind]=!c[kind]; this.save(); this.init();
    if(this.musicGain) this.musicGain.gain.setTargetAtTime(c.music?.32:0,this.ctx.currentTime,.1);
    if(this.sfxGain) this.sfxGain.gain.setTargetAtTime(c.sfx?.9:0,this.ctx.currentTime,.05);
    this.renderButtons(); if(kind==="sfx"&&c.sfx) this.play("click"); toast(`${kind==="music"?"🎵 Musik":"🔊 Soundeffekte"} ${c[kind]?"an":"aus"}`); },
  renderButtons(){ const c=this.conf(); document.querySelectorAll("[data-snd]").forEach(b=>{ const k=b.dataset.snd; b.textContent=(k==="music"?(c.music?"🎵":"🔇"):(c.sfx?"🔊":"🔈")); b.classList.toggle("off",!c[k]); }); },

  /* ---------- Bausteine ---------- */
  osc(type,f,t,dur,vol,dest,{to=null,attack=.005,q=null,cut=null}={}){
    const c=this.ctx, o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
    if(to) o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+dur);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+attack); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    let n=o; if(cut){ const fl=c.createBiquadFilter(); fl.type="lowpass"; fl.frequency.value=cut; if(q) fl.Q.value=q; o.connect(fl); n=fl; }
    n.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+.05); return o;
  },
  noise(t,dur,vol,dest,{type="highpass",freq=6000,q=1,to=null}={}){
    const c=this.ctx, s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=this.noiseBuf;
    f.type=type; f.frequency.setValueAtTime(freq,t); if(to) f.frequency.exponentialRampToValueAtTime(to,t+dur); f.Q.value=q;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t,Math.random()*.5); s.stop(t+dur+.05);
  },
  kick(t,d,v=1){ this.osc("sine",150,t,.32,.9*v,d,{to:42}); this.osc("triangle",80,t,.08,.4*v,d,{to:40}); },
  snare(t,d,v=1){ this.noise(t,.18,.5*v,d,{type:"bandpass",freq:1900,q:.7}); this.osc("triangle",230,t,.09,.25*v,d,{to:160}); },
  hat(t,d,v=1,open){ this.noise(t,open?.16:.04,.22*v,d,{type:"highpass",freq:8000}); },
  nf(n){ return 440*Math.pow(2,(n-69)/12); },

  /* ---------- Musik ---------- */
  music(mode){
    if(this.mode===mode) return; this.mode=mode; this.step=0;
    if(!this.ctx) return;                        // startet nach der ersten Berührung
    this.startLoop();
  },
  setIntense(on){ this.intense=!!on; },
  startLoop(){
    clearInterval(this.timer); if(!this.mode||!this.ctx) return;
    this.nextT=this.ctx.currentTime+.08;
    this.timer=setInterval(()=>this.schedule(),25);
  },
  schedule(){
    const c=this.ctx; if(!c||!this.mode) return;
    if(c.state!=="running"){ this.nextT=c.currentTime+.08; return; }
    const battle=this.mode==="battle", bpm=battle?(this.intense?150:138):96, sp=60/bpm/4;
    while(this.nextT < c.currentTime+.12){ this.note(this.step, this.nextT, battle); this.nextT+=sp; this.step=(this.step+1)%256; }
  },
  /* Akkordfolge in a-Moll: Am – F – G – E (Kampf) bzw. Am – F – C – G (Menü) */
  note(s,t,battle){
    const M=this.musicGain, bar=Math.floor(s/16)%4, st=s%16;
    const prog = battle ? [[57,60,64],[53,57,60],[55,59,62],[52,56,59]] : [[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
    const ch=prog[bar], root=ch[0]-24;
    if(battle){
      if(st%4===0 || (this.intense && st===14)) this.kick(t,M, st===0?1:.85);
      if(st===4||st===12) this.snare(t,M);
      if(this.intense && st===15) this.snare(t,M,.5);
      this.hat(t,M, st%2?.5:.9, st===6||st===14);
      // treibender Bass in Achteln
      if(st%2===0) this.osc("sawtooth",this.nf(root+(st%8===6?12:0)),t,.16,.32,M,{cut:700,q:6});
      // Arpeggio (16tel)
      const arp=[0,1,2,1,0,2,1,2][st%8], oct=this.intense?24:12;
      const n=ch[arp]+oct-12+(st>=8&&bar===3?0:0);
      const o=this.osc("square",this.nf(n),t,.11,.07,M,{cut:2600});
      if(st%4===0){ const g=this.ctx.createGain(); g.gain.value=.5; }
      // Sirenen-Motiv alle 4 Takte
      if(bar===3 && st===0){ const o2=this.ctx.createOscillator(), g2=this.ctx.createGain(); o2.type="triangle";
        o2.frequency.setValueAtTime(this.nf(76),t); o2.frequency.linearRampToValueAtTime(this.nf(81),t+.35); o2.frequency.linearRampToValueAtTime(this.nf(76),t+.7);
        g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(.05,t+.05); g2.gain.linearRampToValueAtTime(0,t+.75);
        o2.connect(g2); g2.connect(M); g2.connect(this.delay); o2.start(t); o2.stop(t+.8); }
      // Lead-Melodie (kurze Rufe)
      const mel={0:12,3:11,6:7,10:12,12:14}; if(st in mel && (bar%2===1)) { this.osc("sawtooth",this.nf(ch[0]+mel[st]),t,.22,.05,M,{cut:3000}); this.osc("sawtooth",this.nf(ch[0]+mel[st]),t,.22,.05,this.delay,{cut:3000}); }
    } else {
      if(st===0||st===10) this.kick(t,M,.55);
      if(st===8) this.snare(t,M,.35);
      if(st%4===2) this.hat(t,M,.35);
      if(st===0||st===8) this.osc("triangle",this.nf(root+12),t,.5,.22,M,{cut:900});
      if(st%4===0){ const n=ch[(st/4)%3]+12; this.osc("triangle",this.nf(n),t,.35,.06,M); this.osc("triangle",this.nf(n),t,.35,.05,this.delay); }
    }
  },

  /* ---------- Soundeffekte ---------- */
  play(name){
    const c=this.conf(); if(!c.sfx) return; this.init(); if(!this.ctx||this.ctx.state!=="running") return;
    const now=this.ctx.currentTime, last=this._last[name]||0; if(now-last<.06) return; this._last[name]=now;
    const t=now+.01, D=this.sfxGain, f=this.SFX[name]; if(f) try{ f.call(this,t,D); }catch(e){}
  },
  SFX:{
    click(t,D){ this.osc("square",1200,t,.04,.08,D,{cut:3000}); },
    summon(t,D){ this.noise(t,.3,.35,D,{type:"bandpass",freq:600,to:3000,q:1.2}); [57,64,69].forEach((n,i)=>this.osc("triangle",this.nf(n+12),t+.05+i*.05,.3,.12,D)); },
    set(t,D){ this.noise(t,.12,.25,D,{type:"lowpass",freq:1200}); this.osc("sine",300,t,.08,.15,D,{to:180}); },
    attack(t,D){ this.noise(t,.22,.5,D,{type:"bandpass",freq:800,to:4000,q:2}); this.osc("sawtooth",220,t,.18,.12,D,{to:880,cut:2000}); },
    hit(t,D){ this.kick(t,D,.9); this.noise(t,.12,.45,D,{type:"bandpass",freq:2500,q:.8}); this.osc("square",140,t,.1,.12,D,{to:60,cut:900}); },
    boom(t,D){ this.osc("sine",120,t,.7,1,D,{to:30}); this.noise(t,.8,.6,D,{type:"lowpass",freq:2500,to:120}); },
    damage(t,D){ this.osc("sine",90,t,.35,.8,D,{to:45}); this.noise(t,.15,.25,D,{type:"lowpass",freq:900}); },
    heal(t,D){ [72,76,79,84].forEach((n,i)=>this.osc("sine",this.nf(n),t+i*.06,.4,.12,D)); },
    stamp(t,D){ this.osc("sine",110,t,.18,.9,D,{to:50}); this.noise(t,.07,.6,D,{type:"lowpass",freq:3000}); this.osc("square",880,t+.12,.12,.06,D,{cut:2500}); },
    trick(t,D){ [84,88,91,96,91].forEach((n,i)=>this.osc("triangle",this.nf(n),t+i*.045,.18,.07,D)); this.noise(t,.4,.15,D,{type:"highpass",freq:6000}); },
    alarm(t,D){ for(let i=0;i<2;i++){ this.osc("sawtooth",700,t+i*.36,.34,.12,D,{to:1150,cut:3000}); } },
    siren(t,D){ const c=this.ctx,o=c.createOscillator(),g=c.createGain(); o.type="triangle"; o.frequency.setValueAtTime(650,t);
      for(let i=0;i<4;i++){ o.frequency.linearRampToValueAtTime(i%2?650:980,t+.25*(i+1)); }
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.12,t+.05); g.gain.linearRampToValueAtTime(0,t+1); o.connect(g); g.connect(D); o.start(t); o.stop(t+1.05); },
    turn(t,D){ this.osc("square",1900,t,.09,.07,D,{cut:4000}); this.osc("square",1900,t+.13,.16,.07,D,{cut:4000}); },
    celestial(t,D){ for(let i=0;i<10;i++) this.osc("sine",this.nf(84+[0,4,7,12,16,19,24,19,16,12][i]),t+i*.05,.5,.06,D); this.noise(t,1,.12,D,{type:"highpass",freq:9000}); },
    win(t,D){ [[60,0],[64,.14],[67,.28],[72,.42],[72,.62],[76,.74],[79,.9]].forEach(([n,d])=>{ this.osc("sawtooth",this.nf(n),t+d,.35,.09,D,{cut:3000}); this.osc("square",this.nf(n+12),t+d,.3,.04,D,{cut:4000}); }); this.kick(t+.42,D); this.kick(t+.9,D); },
    lose(t,D){ [[64,0],[63,.3],[62,.6],[61,.9]].forEach(([n,d])=>this.osc("sawtooth",this.nf(n-12),t+d,.45,.1,D,{cut:1200})); },
    coin(t,D){ this.osc("square",this.nf(88),t,.08,.07,D,{cut:5000}); this.osc("square",this.nf(95),t+.07,.25,.07,D,{cut:5000}); },
    reveal(t,D){ this.noise(t,.18,.3,D,{type:"bandpass",freq:1500,to:5000}); },
    rare(t,D){ [79,83,86,91].forEach((n,i)=>this.osc("triangle",this.nf(n),t+i*.07,.35,.1,D)); this.noise(t,.5,.12,D,{type:"highpass",freq:8000}); },
    merge(t,D){ [67,71,74,79,83].forEach((n,i)=>this.osc("square",this.nf(n),t+i*.05,.2,.06,D,{cut:3500})); },
    shot(t,D){ this.noise(t,.12,.6,D,{type:"bandpass",freq:1200,q:.6}); this.osc("square",400,t,.06,.15,D,{to:90}); },
  },
};
// Browser erlauben Ton erst nach einer Berührung
["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,()=>{ try{ Sound.init(); }catch(e){} },{passive:true}));
