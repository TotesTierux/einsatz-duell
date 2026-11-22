/* ============================ KARTENBILDER ============================
   Zeichnet zu jeder Karte eine Comic-Illustration als SVG (keine Emojis):
   Charaktere als Brustbild mit Uniform/Outfit je Rolle und Zubehör aus dem Namen,
   Gruppen als Trupp, Fahrzeuge/Tiere eigens, Maßnahmen/Tricks als Gegenstände.
   Gleiche Karte → immer gleiches Bild (Zufall aus der Karten-ID).
   ===================================================================== */
const Art = (()=>{
  const K='stroke="#111" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"', k2='stroke="#111" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  const rng=seed=>{ let h=1779033703; for(const ch of seed) h=Math.imul(h^ch.charCodeAt(0),3432918353), h=h<<13|h>>>19;
    return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; };
  const pick=(r,a)=>a[Math.floor(r()*a.length)];
  const SKIN=["#ffdcbf","#f6c7a0","#e8b086","#d39a6a","#b07a4f","#8a5a3b"], HAIR=["#2b1d14","#4a2f1c","#7a4a24","#c8902f","#e2c15a","#9a9a9a","#1a1a1a","#8c2f1f"];
  const FEM=/(?:in\b|in\s|frau|\b(?:lea|jana|mara|pia|ilka|ines|lu|hanna|steffi|gabi|tina|bella|luna|kira|erna|rose|rosi|lola|elfie|yildiz|aurora|eclipsa|golden|katze|blitz|zucker|baronin|engel|neumann|arndt|grimm|kowalczyk|brenner-voss|saubermann|fingerling)\b)/i;
  const GROUP=/(trupp|team|einheit|duo|ring|kartell|gang\b|staffel(?!leiter)|zug\b|hundertschaft\b(?!sführer)|kommando|netzwerk|kommission|syndikat|imperium|clan der|gruppe|dienst$|wache$|gesamteinsatz|kriminalität|höllenhunde|nachtfalter|großlage|großeinsatz|bande\b)/i;
  const rays=c=>`<g opacity=".28">${Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2, b=a+Math.PI/14; return `<path d="M84 56 L${84+130*Math.cos(a)} ${56+130*Math.sin(a)} L${84+130*Math.cos(b)} ${56+130*Math.sin(b)}Z" fill="${c}"/>`;}).join("")}</g>`;
  const wrap=(inner,ray="#fff")=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 100" preserveAspectRatio="xMidYMax slice">${rays(ray)}${inner}</svg>`;

  /* ---------- Figur (Brustbild) ---------- */
  function face(o){
    const {skin,hair,fem,r,mood}=o; let s="";
    const hx=o.x||84, hy=o.y||44, sc=o.s||1, T=`transform="translate(${hx} ${hy}) scale(${sc})"`;
    // Haare hinten (lang)
    if(fem && !o.noHair && o.longHair && !o.visor) s+=`<path d="M-21 -8 C-26 12 -26 28 -20 36 L-11 36 C-14 24 -14 10 -12 -2Z M21 -8 C26 12 26 28 20 36 L11 36 C14 24 14 10 12 -2Z" fill="${hair}" ${K}/>`;
    s+=`<rect x="-7" y="14" width="14" height="14" fill="${skin}" ${K}/>`;                    // Hals
    s+=`<ellipse cx="-19" cy="2" rx="4" ry="6" fill="${skin}" ${K}/><ellipse cx="19" cy="2" rx="4" ry="6" fill="${skin}" ${K}/>`;
    s+=`<path d="M-18 -8 C-18 -26 18 -26 18 -8 L18 6 C18 20 8 25 0 25 C-8 25 -18 20 -18 6Z" fill="${skin}" ${K}/>`;
    // Haare vorne
    if(!o.noHair){
      if(fem) s+=`<path d="M-19 -2 C-22 -26 22 -28 19 -2 C14 -10 6 -14 -2 -12 C-8 -10 -14 -6 -19 -2Z" fill="${hair}" ${K}/>`;
      else if(o.bald) s+="";
      else s+=`<path d="M-18.5 -4 C-20 -24 20 -26 18.5 -4 C16 -12 10 -15 3 -13 L0 -16 L-3 -13 C-10 -14 -16 -11 -18.5 -4Z" fill="${hair}" ${K}/>`;
    }
    // Augen
    const ang=mood==="bad", ey=-1;
    if(o.visor) s+=`<path d="M-19 -6 L19 -6 L17 6 L-17 6Z" fill="#2a3440" ${K}/><path d="M-12 -3 L-2 -3" stroke="#9fd3ff" stroke-width="2"/>`;
    else if(o.shades) s+=`<path d="M-17 -5 L-2 -5 L-3 3 C-6 6 -14 6 -16 2Z M2 -5 L17 -5 L16 2 C14 6 6 6 3 3Z" fill="#111" ${k2}/><path d="M-2 -3 L2 -3" stroke="#111" stroke-width="2"/><path d="M-13 -3 L-9 -3" stroke="#fff" stroke-width="1.5"/>`;
    else {
      const px=o.look||0;
      s+=`<ellipse cx="-7" cy="${ey}" rx="3.3" ry="${fem?4.2:3.8}" fill="#fff" stroke="#111" stroke-width="1.6"/><ellipse cx="7" cy="${ey}" rx="3.3" ry="${fem?4.2:3.8}" fill="#fff" stroke="#111" stroke-width="1.6"/>`;
      s+=`<circle cx="${-7+px*.7}" cy="${ey+.6}" r="2" fill="#111"/><circle cx="${7+px*.7}" cy="${ey+.6}" r="2" fill="#111"/><circle cx="${-6.2+px*.7}" cy="${ey-.4}" r=".7" fill="#fff"/><circle cx="${7.8+px*.7}" cy="${ey-.4}" r=".7" fill="#fff"/>`;
      if(fem) s+=`<path d="M-10.5 -4.5 L-12.5 -6.5 M-9 -5.5 L-10 -8 M10.5 -4.5 L12.5 -6.5 M9 -5.5 L10 -8" stroke="#111" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="-11" cy="8" rx="3" ry="1.8" fill="#ff8a8a" opacity=".55"/><ellipse cx="11" cy="8" rx="3" ry="1.8" fill="#ff8a8a" opacity=".55"/>`;
      if(o.mask) s+=`<path d="M-20 -6 C-12 -9 -4 -6 0 -4 C4 -6 12 -9 20 -6 L19 4 C12 6 6 5 0 2 C-6 5 -12 6 -19 4Z" fill="#111"/><ellipse cx="-7" cy="${ey}" rx="3.6" ry="3.4" fill="#fff"/><ellipse cx="7" cy="${ey}" rx="3.6" ry="3.4" fill="#fff"/><circle cx="${-7+px}" cy="${ey+.5}" r="2" fill="#111"/><circle cx="${7+px}" cy="${ey+.5}" r="2" fill="#111"/>`;
      if(o.glasses) s+=`<circle cx="-7" cy="${ey}" r="6" fill="none" ${k2}/><circle cx="7" cy="${ey}" r="6" fill="none" ${k2}/><path d="M-1 ${ey} L1 ${ey}" ${k2}/>`;
    }
    // Brauen
    if(!o.visor) s+= ang ? `<path d="M-13 -10 L-2 -6 M13 -10 L2 -6" stroke="#111" stroke-width="3.2" stroke-linecap="round"/>`
                         : `<path d="M-12 -9 Q-7 -12 -2 -9 M12 -9 Q7 -12 2 -9" stroke="${o.hair==="#e2c15a"?"#7a5a1a":"#111"}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    // Nase, Bart, Mund
    s+=`<path d="M0 2 Q-3 9 1 10" fill="none" ${k2}/>`;
    if(o.beard) s+=`<path d="M-17 6 C-16 26 16 26 17 6 C12 12 6 13 0 12 C-6 13 -12 12 -17 6Z" fill="${o.beardCol||hair}" ${K}/>`;
    if(o.stache) s+=`<path d="M-11 13 C-7 9 -2 10 0 12 C2 10 7 9 11 13 C7 13 3 14 0 13 C-3 14 -7 13 -11 13Z" fill="${o.beardCol||hair}" ${k2}/>`;
    if(ang) s+=`<path d="M-7 17 Q0 13 8 16" fill="none" ${K}/>`;
    else if(o.grin) s+=`<path d="M-8 14 Q0 22 8 14Z" fill="#fff" ${k2}/>`;
    else s+=`<path d="M-7 15 Q0 20 7 15" fill="none" ${K}/>`;
    if(fem && !ang) s+=`<path d="M-6 15.5 Q0 19 6 15.5" stroke="#d2334a" stroke-width="2" fill="none"/>`;
    if(o.scar) s+=`<path d="M8 -12 L14 6 M9 -6 L13 -7 M10 -1 L14 -2" stroke="#8a2b2b" stroke-width="1.6"/>`;
    if(o.cigar) s+=`<path d="M6 16 L20 19" stroke="#6b3e1e" stroke-width="4" stroke-linecap="round"/><circle cx="21" cy="19.3" r="1.8" fill="#ff7a1a"/>`;
    s+=(o.hat||"");
    return `<g ${T}>${s}</g>`;
  }
  /* Kopfbedeckungen (Koordinaten relativ zum Kopf) */
  const HATS={
    cap:(c="#1f3f86",band="#111",star="#f4c430")=>`<path d="M-20 -12 C-22 -30 22 -30 20 -12Z" fill="${c}" ${K}/><path d="M-19 -13 L19 -13 L19 -8 L-19 -8Z" fill="${band}" ${K}/><path d="M-20 -8 C-10 -2 10 -2 20 -8 L22 -6 C10 2 -10 2 -22 -6Z" fill="#111"/><path d="M0 -24 L2 -20 L6 -20 L3 -17 L4 -13 L0 -15.5 L-4 -13 L-3 -17 L-6 -20 L-2 -20Z" fill="${star}" ${k2}/>`,
    whitecap:()=>HATS.cap("#f4f4f4","#1f3f86","#f4c430"),
    helmet:(c="#20242b")=>`<path d="M-23 -2 C-25 -34 25 -34 23 -2 L19 -2 C18 -10 -18 -10 -19 -2Z" fill="${c}" ${K}/><path d="M-12 -24 Q0 -30 12 -24" stroke="#555" stroke-width="2" fill="none"/>`,
    riot:()=>`<path d="M-23 -2 C-25 -34 25 -34 23 -2 L19 -2 C18 -10 -18 -10 -19 -2Z" fill="#1f3f86" ${K}/><path d="M-20 -8 C-12 -16 12 -16 20 -8 L20 -14 C12 -22 -12 -22 -20 -14Z" fill="#bfe6ff" opacity=".7" ${k2}/>`,
    beanie:(c="#2b2b2b")=>`<path d="M-20 -6 C-22 -32 22 -32 20 -6Z" fill="${c}" ${K}/><path d="M-21 -8 L21 -8 L21 -2 L-21 -2Z" fill="${c}" ${K}/><path d="M-14 -20 L-14 -10 M-7 -24 L-7 -10 M0 -25 L0 -10 M7 -24 L7 -10 M14 -20 L14 -10" stroke="#000" stroke-width="1" opacity=".5"/>`,
    tophat:()=>`<path d="M-26 -13 C-14 -9 14 -9 26 -13 L24 -8 C10 -4 -10 -4 -24 -8Z" fill="#1d1d1f" ${K}/><path d="M-15 -11 L-17 -46 C-6 -50 6 -50 17 -46 L15 -11Z" fill="#2a2a2e" ${K}/><path d="M-15.5 -18 L15.5 -18 L15.8 -25 L-15.8 -25Z" fill="#c8202f" ${k2}/><path d="M-10 -42 L-11 -28" stroke="#666" stroke-width="3" stroke-linecap="round"/>`,
    fedora:(c="#3a3a40")=>`<path d="M-27 -10 C-14 -4 14 -4 27 -10 L25 -5 C10 0 -10 0 -25 -5Z" fill="${c}" ${K}/><path d="M-17 -9 C-19 -24 -12 -32 0 -28 C12 -32 19 -24 17 -9Z" fill="${c}" ${K}/><path d="M-17 -13 L17 -13 L17 -9 L-17 -9Z" fill="#111"/>`,
    flatcap:(c="#6b5a45")=>`<path d="M-20 -8 C-22 -26 18 -28 22 -12 L28 -6 C14 -2 -6 -4 -20 -8Z" fill="${c}" ${K}/>`,
    santa:()=>`<path d="M-21 -8 C-18 -30 12 -34 26 -18 L22 -12 C14 -20 0 -22 -21 -8Z" fill="#d62828" ${K}/><circle cx="27" cy="-18" r="5" fill="#fff" ${k2}/><path d="M-22 -10 C-8 -14 10 -14 22 -10 L22 -3 C8 -7 -8 -7 -22 -3Z" fill="#fff" ${K}/>`,
    bike:(c="#e53935")=>`<path d="M-22 -2 C-24 -32 24 -32 22 -2Z" fill="${c}" ${K}/><path d="M-10 -26 L-6 -10 M0 -28 L0 -10 M10 -26 L6 -10" stroke="#111" stroke-width="2"/>`,
    sailor:()=>`<path d="M-20 -10 C-20 -24 20 -24 20 -10Z" fill="#fff" ${K}/><path d="M-20 -12 L20 -12 L20 -8 L-20 -8Z" fill="#1f3f86" ${K}/><path d="M-21 -8 C-10 -3 10 -3 21 -8 L23 -6 C10 1 -10 1 -23 -6Z" fill="#111"/><path d="M-4 -19 L4 -19 M0 -23 L0 -15" stroke="#f4c430" stroke-width="2.4"/>`,
    backcap:(c="#2e7d32")=>`<path d="M-20 -8 C-22 -30 22 -30 20 -8Z" fill="${c}" ${K}/><path d="M14 -16 C22 -18 30 -14 31 -9 L20 -9Z" fill="${c}" ${K}/>`,
    crown:()=>`<path d="M-16 -16 L-18 -34 L-9 -24 L0 -38 L9 -24 L18 -34 L16 -16Z" fill="#f4c430" ${K}/><circle cx="0" cy="-26" r="2.5" fill="#d62828"/>`,
    bun:(c)=>`<circle cx="0" cy="-26" r="8" fill="${c}" ${K}/>`,
    horse:()=>"",
  };

  /* Oberkörper / Outfit */
  function torso(o){
    const x=o.x||84, sc=o.s||1, T=`transform="translate(${x} ${o.y||100}) scale(${sc})"`;
    const base=`<path d="M-62 2 C-58 -22 -34 -32 0 -32 C34 -32 58 -22 62 2Z" fill="${o.col}" ${K}/>`;
    let s=base, d="";
    switch(o.kind){
      case "police": d=`<path d="M-14 -32 L0 -16 L14 -32" fill="#9fb8e6" ${k2}/><path d="M0 -16 L0 2" ${k2}/><path d="M-30 -14 l-6 6 l6 6 l6 -6z" fill="#f4c430" ${k2}/><path d="M-48 -24 L-28 -30 M48 -24 L28 -30" stroke="${o.epau||"#dfe6f5"}" stroke-width="5" stroke-linecap="round"/>`;
        if(o.medals) d+=`<rect x="14" y="-22" width="18" height="5" fill="#d62828" ${k2}/><rect x="14" y="-17" width="18" height="5" fill="#1f6fd6" ${k2}/><circle cx="23" cy="-6" r="4" fill="#f4c430" ${k2}/>`; break;
      case "trench": d=`<path d="M-16 -32 L-4 -4 L-26 -24Z M16 -32 L4 -4 L26 -24Z" fill="#a88452" ${k2}/><path d="M-8 -32 L0 -20 L8 -32" fill="#fff" ${k2}/><path d="M0 -20 L-4 -10 L0 2 L4 -10Z" fill="${o.tie||"#8c1d2a"}" ${k2}/><circle cx="-10" cy="-8" r="1.6" fill="#111"/><circle cx="10" cy="-8" r="1.6" fill="#111"/>`; break;
      case "tactical": d=`<rect x="-26" y="-26" width="52" height="28" rx="4" fill="#2c3138" ${K}/><rect x="-18" y="-20" width="12" height="10" fill="#3a4048" ${k2}/><rect x="6" y="-20" width="12" height="10" fill="#3a4048" ${k2}/><text x="0" y="-1" font-family="Arial Black,Arial" font-weight="900" font-size="8" fill="#fff" text-anchor="middle">${o.label||"POLIZEI"}</text>`; break;
      case "vest": d=`<path d="M-40 -26 L-30 -30 L-22 2 L-36 2Z M40 -26 L30 -30 L22 2 L36 2Z" fill="#c6ff2e" ${k2}/><path d="M-50 -10 L50 -10 L50 -4 L-50 -4Z" fill="#e8e8e8" ${k2}/><path d="M-14 -32 L0 -18 L14 -32" fill="#fff" ${k2}/>`; break;
      case "suit": d=`<path d="M-14 -32 L-2 -2 L-26 -22Z M14 -32 L2 -2 L26 -22Z" fill="${o.lapel||"#2a2a33"}" ${k2}/><path d="M-6 -32 L0 -22 L6 -32" fill="#fff" ${k2}/>${o.bow?`<path d="M-8 -26 L0 -22 L-8 -18Z M8 -26 L0 -22 L8 -18Z" fill="#c8202f" ${k2}/>`:`<path d="M0 -22 L-3 -12 L0 -4 L3 -12Z" fill="${o.tie||"#c8202f"}" ${k2}/>`}<path d="M18 -16 L28 -16" stroke="#fff" stroke-width="3"/>`; break;
      case "pearls": d=`<path d="M-14 -32 Q0 -18 14 -32" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="1 4" stroke-linecap="round"/>`; break;
      case "hoodie": d=`<path d="M-24 -30 C-20 -18 20 -18 24 -30" fill="none" ${K}/><path d="M-6 -22 L-7 -8 M6 -22 L7 -8" stroke="#ddd" stroke-width="2"/><path d="M-18 -6 L18 -6 L16 2 L-16 2Z" fill="rgba(0,0,0,.2)" ${k2}/>`; break;
      case "leather": d=`<path d="M-16 -32 L-4 2 L-30 -20Z M16 -32 L4 2 L30 -20Z" fill="#2b2b2b" ${k2}/><path d="M-10 -26 Q0 -12 10 -26" fill="none" stroke="#f4c430" stroke-width="3.4" stroke-dasharray="2 2"/><path d="M-30 -16 L-24 -8" stroke="#888" stroke-width="2"/>`; break;
      case "stripes": d=[-26,-17,-8].map(y=>`<path d="M-60 ${y} L60 ${y}" stroke="#111" stroke-width="5"/>`).join("")+`<path d="M-62 2 C-58 -22 -34 -32 0 -32 C34 -32 58 -22 62 2Z" fill="none" ${K}/>`; break;
      case "vestbrown": d=`<path d="M-18 -32 L-8 2 L-30 2 L-40 -24Z M18 -32 L8 2 L30 2 L40 -24Z" fill="#6b4a2b" ${k2}/><path d="M-6 -32 L0 -24 L6 -32" fill="#fff" ${k2}/>`; break;
      case "doctor": d=`<path d="M-14 -32 L-4 2 M14 -32 L4 2" ${k2}/><path d="M-12 -30 C-20 -4 -6 -2 -4 -14 M-4 -14 m0 0 a4 4 0 1 0 .1 0" fill="none" stroke="#2c3e50" stroke-width="2.4"/><rect x="18" y="-22" width="12" height="10" fill="#fff" ${k2}/><path d="M24 -20 L24 -14 M21 -17 L27 -17" stroke="#d62828" stroke-width="2"/>`; break;
      case "santa": d=`<path d="M-62 -2 L62 -2" stroke="#fff" stroke-width="7"/><path d="M-4 -30 L-4 2 M4 -30 L4 2" stroke="#fff" stroke-width="3"/>`; break;
    }
    if(o.chain) d+=`<path d="M-16 -30 Q0 -8 16 -30" fill="none" stroke="#f4c430" stroke-width="3.4" stroke-dasharray="3 1.5"/>`;
    if(o.badgeText) d+=`<text x="0" y="-4" font-family="Arial Black,Arial" font-weight="900" font-size="7" fill="#fff" text-anchor="middle" stroke="#111" stroke-width=".6">${o.badgeText}</text>`;
    return `<g ${T}>${s}${d}</g>`;
  }

  /* ---------- Requisiten ---------- */
  const P={
    dog:(x,y,s=1,c="#b07a3c")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 30 C-26 6 -18 -8 0 -10 C18 -8 26 6 22 30Z" fill="${c}" ${K}/><path d="M-14 -6 L-22 -34 L-4 -14Z M14 -6 L22 -34 L4 -14Z" fill="#3a2a1a" ${K}/><path d="M-18 -4 C-20 -22 20 -22 18 -4 C18 8 10 12 0 12 C-10 12 -18 8 -18 -4Z" fill="${c}" ${K}/><path d="M-10 -14 C-4 -20 4 -20 10 -14 L8 -2 L-8 -2Z" fill="#3a2a1a"/><path d="M-9 4 C-8 18 8 18 9 4 C5 1 -5 1 -9 4Z" fill="#d9b48a" ${k2}/><ellipse cx="0" cy="5" rx="4.5" ry="3" fill="#111"/><path d="M-3 13 Q0 22 3 13Z" fill="#e85a6b" ${k2}/><circle cx="-8" cy="-6" r="3" fill="#fff" ${k2}/><circle cx="8" cy="-6" r="3" fill="#fff" ${k2}/><circle cx="-7.5" cy="-5.5" r="1.6" fill="#111"/><circle cx="8.5" cy="-5.5" r="1.6" fill="#111"/><path d="M-16 22 L16 22" stroke="#d62828" stroke-width="5"/><circle cx="0" cy="26" r="3.5" fill="#f4c430" ${k2}/></g>`,
    moneybag:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -16 L-6 -24 L6 -24 L14 -16 C30 -6 26 20 0 20 C-26 20 -30 -6 -14 -16Z" fill="#c9a86a" ${K}/><path d="M-12 -16 L12 -16" ${K}/><text x="0" y="10" font-family="Arial Black,Arial" font-size="18" font-weight="900" text-anchor="middle" fill="#2e7d32" stroke="#111" stroke-width="1">$</text></g>`,
    crate:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-18" y="-16" width="36" height="32" fill="#c08a4a" ${K}/><path d="M-18 -16 L18 16 M18 -16 L-18 16 M-18 0 L18 0" stroke="#7a4f22" stroke-width="2.5"/><rect x="-18" y="-16" width="36" height="32" fill="none" ${K}/></g>`,
    pill:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-30)"><rect x="-14" y="-6" width="28" height="12" rx="6" fill="#fff" ${K}/><path d="M0 -6 L0 6 A0 0 0 0 0 0 6 L14 6 A6 6 0 0 0 14 -6Z" fill="#e53935"/><rect x="-14" y="-6" width="28" height="12" rx="6" fill="none" ${K}/></g>`,
    radio:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-14" width="16" height="28" rx="3" fill="#333" ${K}/><path d="M4 -14 L4 -26" ${K}/><rect x="-5" y="-10" width="10" height="7" fill="#9fe39f" ${k2}/><circle cx="-3" cy="4" r="1.5" fill="#bbb"/><circle cx="3" cy="4" r="1.5" fill="#bbb"/></g>`,
    magnifier:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M12 12 L30 30" stroke="#5a3a1a" stroke-width="9" stroke-linecap="round"/><path d="M12 12 L30 30" stroke="#111" stroke-width="3" stroke-linecap="round" opacity=".4"/><circle cx="0" cy="0" r="17" fill="#cfefff" fill-opacity=".75" stroke="#111" stroke-width="5"/><path d="M-9 -7 Q-6 -11 -1 -12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
    cuffs:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-16" cy="4" r="13" fill="none" stroke="#111" stroke-width="9"/><circle cx="-16" cy="4" r="13" fill="none" stroke="#c9d1db" stroke-width="5"/><circle cx="18" cy="2" r="13" fill="none" stroke="#111" stroke-width="9"/><circle cx="18" cy="2" r="13" fill="none" stroke="#c9d1db" stroke-width="5"/><path d="M-4 -2 L6 -4" stroke="#111" stroke-width="7"/><path d="M-4 -2 L6 -4" stroke="#9aa5b1" stroke-width="3" stroke-dasharray="3 2"/><rect x="-24" y="-14" width="10" height="8" fill="#9aa5b1" ${k2}/><rect x="16" y="-16" width="10" height="8" fill="#9aa5b1" ${k2}/></g>`,
    doc:(x,y,s=1,sym="§",stamp="#d62828")=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-6)"><path d="M-22 -30 L14 -30 L24 -20 L24 30 L-22 30Z" fill="#fffdf2" ${K}/><path d="M14 -30 L14 -20 L24 -20" fill="#e8e2c8" ${k2}/><text x="0" y="0" font-family="Georgia,serif" font-weight="700" font-size="26" text-anchor="middle" fill="#1f3f86">${sym}</text><path d="M-14 10 L16 10 M-14 16 L12 16 M-14 22 L8 22" stroke="#888" stroke-width="2"/>${stamp?`<g transform="translate(10 20) rotate(-18)"><rect x="-13" y="-6" width="26" height="12" rx="2" fill="none" stroke="${stamp}" stroke-width="2.5"/><path d="M-8 0 L8 0" stroke="${stamp}" stroke-width="2.5"/></g>`:""}</g>`,
    barrier:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-44" y="-14" width="88" height="16" fill="#fff" ${K}/>${[-36,-20,-4,12,28].map(a=>`<path d="M${a} -14 L${a+10} -14 L${a+2} 2 L${a-8} 2Z" fill="#d62828"/>`).join("")}<rect x="-44" y="-14" width="88" height="16" fill="none" ${K}/><path d="M-34 2 L-40 30 M-34 2 L-28 30 M34 2 L28 30 M34 2 L40 30" ${K}/><circle cx="-40" cy="-20" r="5" fill="#ffb300" ${k2}/><circle cx="40" cy="-20" r="5" fill="#ffb300" ${k2}/></g>`,
    bars:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-34" width="80" height="68" fill="#3b3f46" ${K}/>${[-28,-14,0,14,28].map(a=>`<rect x="${a-3}" y="-34" width="6" height="68" fill="#aeb6bf" ${k2}/>`).join("")}<rect x="-40" y="-6" width="80" height="6" fill="#aeb6bf" ${k2}/></g>`,
    box:(x,y,s=1,label="BEWEIS")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -10 L0 -22 L30 -10 L30 24 L0 34 L-30 24Z" fill="#c8995a" ${K}/><path d="M-30 -10 L0 2 L30 -10 M0 2 L0 34" ${K}/><path d="M-22 -3 L-8 3 L-8 14 L-22 8Z" fill="#fff" ${k2}/><g transform="translate(14 12) rotate(-8)"><rect x="-12" y="-6" width="26" height="11" fill="#d62828" ${k2}/><text x="1" y="3" font-family="Arial Black,Arial" font-size="5.5" font-weight="900" fill="#fff" text-anchor="middle">${label}</text></g></g>`,
    idcard:(x,y,s=1,c="#e8f1ff")=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-5)"><rect x="-34" y="-22" width="68" height="44" rx="5" fill="${c}" ${K}/><rect x="-28" y="-14" width="22" height="28" fill="#c9d6e8" ${k2}/><circle cx="-17" cy="-4" r="6" fill="#8aa0bf"/><path d="M-26 14 C-24 4 -10 4 -8 14Z" fill="#8aa0bf"/><path d="M0 -10 L26 -10 M0 -2 L22 -2 M0 6 L26 6" stroke="#555" stroke-width="2.4"/></g>`,
    headset:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-24 6 C-26 -30 26 -30 24 6" fill="none" stroke="#111" stroke-width="7"/><rect x="-32" y="-2" width="14" height="22" rx="5" fill="#333" ${K}/><rect x="18" y="-2" width="14" height="22" rx="5" fill="#333" ${K}/><path d="M-24 18 C-22 30 -6 32 4 30" fill="none" ${K}/><circle cx="6" cy="30" r="4" fill="#d62828" ${k2}/><path d="M38 -6 q6 6 0 12 M44 -12 q10 12 0 24" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
    newspaper:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-8)"><rect x="-36" y="-28" width="72" height="56" fill="#f6f2e6" ${K}/><rect x="-30" y="-22" width="60" height="12" fill="#111"/><text x="0" y="-13" font-family="Arial Black,Arial" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">GESUCHT</text><rect x="-30" y="-4" width="24" height="26" fill="#c9d6e8" ${k2}/><text x="-18" y="15" font-family="Arial Black,Arial" font-size="16" font-weight="900" fill="#555" text-anchor="middle">?</text><path d="M0 -2 L28 -2 M0 4 L26 4 M0 10 L28 10 M0 16 L22 16" stroke="#777" stroke-width="2"/></g>`,
    blood:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-30" width="12" height="54" rx="6" fill="#f2f6fa" ${K}/><rect x="-6" y="-2" width="12" height="26" rx="6" fill="#c62828"/><rect x="-6" y="-30" width="12" height="54" rx="6" fill="none" ${K}/><rect x="-9" y="-34" width="18" height="8" rx="2" fill="#7e57c2" ${K}/><path d="M24 -16 C24 -16 34 -2 34 4 A10 10 0 0 1 14 4 C14 -2 24 -16 24 -16Z" fill="#d32f2f" ${K}/></g>`,
    dna:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${Array.from({length:7},(_,i)=>{const yy=-30+i*10, w=Math.sin(i*0.9)*18; return `<path d="M${-w} ${yy} L${w} ${yy}" stroke="${i%2?"#42a5f5":"#ef5350"}" stroke-width="4"/>`;}).join("")}<path d="M0 -34 C-30 -20 30 0 0 14 C-30 28 18 36 0 40" fill="none" ${K}/><path d="M0 -34 C30 -20 -30 0 0 14 C30 28 -18 36 0 40" fill="none" ${K}/></g>`,
    bolt:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M6 -36 L-18 4 L-2 4 L-8 36 L18 -6 L2 -6Z" fill="#ffd23f" ${K}/></g>`,
    monitor:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-38" y="-28" width="76" height="48" rx="4" fill="#263238" ${K}/><rect x="-32" y="-22" width="64" height="36" fill="#0d47a1"/>${[-26,-12,2,16].map((a,i)=>`<rect x="${a}" y="-16" width="10" height="12" fill="${i===2?"#ef5350":"#90caf9"}"/>`).join("")}<path d="M-26 4 L26 4 M-26 10 L12 10" stroke="#90caf9" stroke-width="2"/><path d="M-10 20 L-14 30 L14 30 L10 20" fill="#455a64" ${K}/></g>`,
    camera:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -30 L-10 -30 L-10 -24 L-40 -24Z" fill="#999" ${k2}/><path d="M-26 -24 L-26 -12" ${K}/><rect x="-32" y="-14" width="48" height="22" rx="4" fill="#eceff1" ${K}/><path d="M16 -10 L30 -16 L30 12 L16 6Z" fill="#455a64" ${K}/><circle cx="-24" cy="-3" r="3" fill="#d62828"/></g>`,
    coins:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${[0,1,2,3].map(i=>`<ellipse cx="-14" cy="${18-i*7}" rx="15" ry="5" fill="#f4c430" ${k2}/>`).join("")}<rect x="2" y="-14" width="40" height="22" fill="#7cb342" ${K} transform="rotate(-10)"/><text x="22" y="2" transform="rotate(-10)" font-family="Arial Black,Arial" font-size="12" font-weight="900" text-anchor="middle" fill="#1b5e20">€</text></g>`,
    shield:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -36 L30 -26 C30 6 18 26 0 36 C-18 26 -30 6 -30 -26Z" fill="#1f3f86" ${K}/><path d="M0 -26 L20 -19 C20 2 12 16 0 24Z" fill="#3f6fc4"/><path d="M0 -12 L3 -4 L11 -4 L5 1 L7 9 L0 4 L-7 9 L-5 1 L-11 -4 L-3 -4Z" fill="#f4c430" ${k2}/></g>`,
    calendar:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-32" y="-26" width="64" height="54" rx="4" fill="#fff" ${K}/><rect x="-32" y="-26" width="64" height="14" fill="#d62828" ${K}/>${[0,1,2,3].flatMap(r=>[0,1,2,3,4].map(c=>`<rect x="${-26+c*11}" y="${-6+r*8}" width="8" height="5" fill="${r===2&&c===2?"#d62828":"#cfd8dc"}"/>`)).join("")}<path d="M-18 -32 L-18 -20 M18 -32 L18 -20" ${K}/></g>`,
    spikes:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-50" y="6" width="100" height="8" fill="#555" ${K}/>${Array.from({length:9},(_,i)=>`<path d="M${-46+i*11} 6 L${-41+i*11} -10 L${-36+i*11} 6Z" fill="#cfd8dc" ${k2}/>`).join("")}</g>`,
    door:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-24" y="-40" width="48" height="80" fill="#8d5a2b" ${K}/><rect x="-16" y="-32" width="32" height="26" fill="#a86f39" ${k2}/><rect x="-16" y="0" width="32" height="30" fill="#a86f39" ${k2}/><circle cx="14" cy="-2" r="3" fill="#f4c430" ${k2}/><path d="M30 -30 L46 -36 M30 -16 L50 -16 M30 -2 L46 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`,
    map:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -24 L-14 -30 L14 -22 L40 -28 L40 24 L14 30 L-14 22 L-40 28Z" fill="#e8f5d0" ${K}/><path d="M-14 -30 L-14 22 M14 -22 L14 30" stroke="#111" stroke-width="2"/><path d="M-32 14 C-20 4 -6 16 6 2 S 26 -6 30 -16" fill="none" stroke="#d62828" stroke-width="3" stroke-dasharray="5 4"/><path d="M26 -20 l8 8 m0 -8 l-8 8" stroke="#d62828" stroke-width="3.5"/></g>`,
    hands:(x,y,s=1,a="#f6c7a0",b="#b07a4f")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 8 L-14 -6 L4 4 L-10 16 L-50 22Z" fill="#1f3f86" ${K}/><path d="M50 8 L14 -6 L-4 4 L10 16 L50 22Z" fill="#555" ${K}/><path d="M-16 -8 C-6 -16 8 -14 16 -8 C20 -2 14 8 4 12 C-4 16 -14 12 -18 4Z" fill="${a}" ${K}/><path d="M-8 -6 C0 -2 8 -4 14 -8" fill="none" stroke="${b}" stroke-width="2"/></g>`,
    car:(x,y,s=1,c="#d62828",police)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-48 8 L-44 -6 L-28 -10 L-18 -26 L18 -26 L30 -10 L46 -6 L48 8Z" fill="${c}" ${K}/><path d="M-14 -22 L-22 -10 L-2 -10 L-2 -22Z M2 -22 L2 -10 L24 -10 L14 -22Z" fill="#bfe6ff" ${k2}/>${police?`<rect x="-8" y="-34" width="16" height="8" fill="#2196f3" ${k2}/><path d="M-46 -2 L46 -2" stroke="#2c8f3a" stroke-width="4"/>`:""}<circle cx="-28" cy="10" r="10" fill="#222" ${K}/><circle cx="-28" cy="10" r="4" fill="#bbb"/><circle cx="28" cy="10" r="10" fill="#222" ${K}/><circle cx="28" cy="10" r="4" fill="#bbb"/><path d="M-64 -10 L-54 -10 M-66 -2 L-54 -2 M-62 6 L-54 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
    heli:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-56 -26 L56 -26" stroke="#111" stroke-width="5" stroke-linecap="round"/><path d="M0 -26 L0 -16" ${K}/><path d="M-30 -2 C-30 -18 -10 -18 10 -16 L26 -10 C34 -4 30 10 18 10 L-20 10 C-28 10 -30 6 -30 -2Z" fill="#1f3f86" ${K}/><path d="M-26 -2 C-26 -12 -12 -14 -4 -12 L-4 2 L-26 2Z" fill="#bfe6ff" ${k2}/><path d="M26 -6 L58 -12 L60 -2 L28 2" fill="#1f3f86" ${K}/><path d="M56 -20 L64 2" ${K}/><path d="M-18 10 L-22 18 M14 10 L18 18 M-30 18 L30 18" ${K}/><text x="6" y="4" font-family="Arial Black,Arial" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">POLIZEI</text></g>`,
    boat:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-50 0 L50 0 L36 18 L-40 18Z" fill="#eceff1" ${K}/><path d="M-50 0 L50 0 L46 6 L-46 6Z" fill="#1f3f86"/><path d="M-20 0 L-14 -18 L16 -18 L22 0Z" fill="#fff" ${K}/><rect x="-10" y="-14" width="22" height="8" fill="#bfe6ff" ${k2}/><path d="M-60 24 Q-48 18 -36 24 T-12 24 T12 24 T36 24 T60 24" fill="none" stroke="#fff" stroke-width="3"/></g>`,
    truck:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-50" y="-22" width="64" height="32" fill="#eceff1" ${K}/><path d="M14 -16 L34 -16 L46 -2 L46 10 L14 10Z" fill="#1f3f86" ${K}/><path d="M18 -12 L32 -12 L40 -2 L18 -2Z" fill="#bfe6ff" ${k2}/><path d="M-30 -22 L-30 -32 L-10 -32 M-10 -32 L10 -42" ${K}/><path d="M10 -42 Q40 -50 60 -30" stroke="#64b5f6" stroke-width="6" fill="none" stroke-dasharray="6 4"/><circle cx="-34" cy="12" r="9" fill="#222" ${K}/><circle cx="30" cy="12" r="9" fill="#222" ${K}/></g>`,
    horse:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 40 L-14 6 C-22 -10 -16 -30 0 -36 L8 -44 L10 -34 C22 -28 26 -10 20 0 L30 10 C32 16 26 20 20 16 L12 10 L10 40Z" fill="#8a5a3b" ${K}/><path d="M0 -36 C-12 -30 -16 -10 -10 6" stroke="#2b1d14" stroke-width="6" fill="none"/><circle cx="10" cy="-18" r="2.5" fill="#111"/><circle cx="24" cy="6" r="1.5" fill="#111"/></g>`,
    bike:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-24" cy="10" r="14" fill="none" ${K}/><circle cx="24" cy="10" r="14" fill="none" ${K}/><path d="M-24 10 L-6 -12 L18 -12 L24 10 M-6 -12 L4 10 L18 -12 M-10 -18 L-2 -18 M16 -12 L14 -22 L22 -22" fill="none" stroke="#1f6fd6" stroke-width="3.5" stroke-linecap="round"/></g>`,
    moto:(x,y,s=1,c="#eceff1")=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-28" cy="10" r="13" fill="#222" ${K}/><circle cx="28" cy="10" r="13" fill="#222" ${K}/><path d="M-28 10 L-10 -8 L16 -8 L28 10 M-14 -8 C-10 -20 10 -20 16 -8Z" fill="${c}" ${K}/><path d="M16 -8 L24 -22 L32 -22" ${K}/><circle cx="31" cy="-16" r="4" fill="#ffd23f" ${k2}/></g>`,
    rat:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M30 12 C46 10 50 -6 40 -12" fill="none" stroke="#c48b8b" stroke-width="3"/><ellipse cx="6" cy="4" rx="26" ry="16" fill="#8d8d95" ${K}/><path d="M-16 -2 L-40 6 L-16 14Z" fill="#8d8d95" ${K}/><circle cx="-12" cy="-12" r="8" fill="#b9a2a2" ${K}/><circle cx="-26" cy="2" r="2.4" fill="#111"/><circle cx="-40" cy="6" r="2.5" fill="#e48a9a"/></g>`,
    cat:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -10 L-18 -30 L-4 -18Z M14 -10 L18 -30 L4 -18Z" fill="#222" ${K}/><ellipse cx="0" cy="-4" rx="18" ry="14" fill="#222" ${K}/><ellipse cx="-7" cy="-6" rx="3.5" ry="4.5" fill="#c6ff2e"/><ellipse cx="7" cy="-6" rx="3.5" ry="4.5" fill="#c6ff2e"/><path d="M-7 -9 L-7 -3 M7 -9 L7 -3" stroke="#111" stroke-width="1.6"/></g>`,
    crowbar:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(35)"><path d="M0 -40 L0 34 C0 42 -12 42 -14 34" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round"/><path d="M0 -40 L0 34 C0 42 -12 42 -14 34" fill="none" stroke="#d62828" stroke-width="5" stroke-linecap="round"/><path d="M0 -40 L-8 -46" stroke="#111" stroke-width="10" stroke-linecap="round"/><path d="M0 -40 L-8 -46" stroke="#d62828" stroke-width="5" stroke-linecap="round"/></g>`,
    keys:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-20" r="9" fill="none" stroke="#111" stroke-width="6"/><circle cx="0" cy="-20" r="9" fill="none" stroke="#c9d1db" stroke-width="3"/>${[-24,0,24].map((a,i)=>`<g transform="rotate(${a} 0 -20)"><path d="M0 -12 L0 30 M0 22 L7 22 M0 28 L5 28" stroke="#111" stroke-width="6" stroke-linecap="round"/><path d="M0 -12 L0 30 M0 22 L7 22 M0 28 L5 28" stroke="${["#f4c430","#c9d1db","#b87333"][i]}" stroke-width="3" stroke-linecap="round"/></g>`).join("")}</g>`,
    mask:(x,y,s=1,c="#fff")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -18 C-20 -30 20 -30 30 -18 C34 4 20 30 0 32 C-20 30 -34 4 -30 -18Z" fill="${c}" ${K}/><path d="M-20 -6 C-16 -12 -8 -12 -6 -4 C-10 0 -18 0 -20 -6Z M20 -6 C16 -12 8 -12 6 -4 C10 0 18 0 20 -6Z" fill="#111"/><path d="M-10 14 Q0 24 10 14" fill="none" ${K}/><path d="M-22 -22 C-16 -18 -10 -18 -6 -22" stroke="#d62828" stroke-width="3" fill="none"/></g>`,
    phone:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(10)"><rect x="-16" y="-30" width="32" height="60" rx="6" fill="#263238" ${K}/><rect x="-11" y="-22" width="22" height="38" fill="#4fc3f7"/><circle cx="0" cy="23" r="3" fill="#90a4ae"/><path d="M24 -20 q8 8 0 16 M30 -26 q14 14 0 28" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
    smoke:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${[[-26,6,18],[0,-4,22],[26,6,18],[-12,18,16],[14,18,16],[0,-26,14]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#cfd8dc" ${K}/>`).join("")}${[[-26,6,15],[0,-4,19],[26,6,15],[-12,18,13],[14,18,13],[0,-26,11]].map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#e3eaee"/>`).join("")}<circle cx="0" cy="30" r="10" fill="#333" ${K}/><path d="M0 20 L4 12" stroke="#ff7a1a" stroke-width="3"/></g>`,
    house:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-36 -4 L0 -34 L36 -4Z" fill="#6d4c41" ${K}/><rect x="-28" y="-4" width="56" height="40" fill="#8d6e63" ${K}/><rect x="-8" y="12" width="16" height="24" fill="#3e2723" ${k2}/><rect x="-22" y="4" width="10" height="10" fill="#ffd23f" ${k2}/><path d="M12 4 L22 14 M22 4 L12 14" stroke="#3e2723" stroke-width="3"/></g>`,
    boom:(x,y,s=1,c="#ff7a1a")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="${Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2, r=i%2?18:38; return (i?"L":"M")+(Math.cos(a)*r).toFixed(1)+" "+(Math.sin(a)*r*.8).toFixed(1);}).join(" ")}Z" fill="#ffd23f" ${K}/><path d="${Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2+.2, r=i%2?10:24; return (i?"L":"M")+(Math.cos(a)*r).toFixed(1)+" "+(Math.sin(a)*r*.8).toFixed(1);}).join(" ")}Z" fill="${c}"/></g>`,
    letter:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-6)"><rect x="-36" y="-22" width="72" height="44" fill="#fff8e1" ${K}/><path d="M-36 -22 L0 6 L36 -22" fill="none" ${K}/>${"ERPRESS".split("").map((ch,i)=>`<text x="${-26+i*8}" y="${18}" font-family="Arial Black,Georgia" font-size="${9+(i%3)*2}" font-weight="900" fill="${["#d62828","#1f3f86","#111"][i%3]}">${ch}</text>`).join("")}</g>`,
    bank:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-44 -14 L0 -38 L44 -14Z" fill="#cfd8dc" ${K}/><rect x="-40" y="26" width="80" height="8" fill="#cfd8dc" ${K}/>${[-30,-10,10,30].map(a=>`<rect x="${a-5}" y="-14" width="10" height="40" fill="#eceff1" ${k2}/>`).join("")}<circle cx="0" cy="-22" r="6" fill="#f4c430" ${k2}/></g>`,
    hole:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="10" rx="40" ry="16" fill="#3e2723" ${K}/><ellipse cx="0" cy="12" rx="30" ry="10" fill="#111"/><path d="M-34 4 L-46 -6 M34 4 L46 -8 M20 -4 L28 -16" stroke="#6d4c41" stroke-width="4" stroke-linecap="round"/><path d="M-12 -30 L-6 -6 L6 -6 L12 -30" fill="#a1887f" ${K}/></g>`,
    steps:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${[[-36,16,-20],[-14,-2,20],[8,14,-20],[30,-6,20]].map(([a,b,r])=>`<g transform="translate(${a} ${b}) rotate(${r})"><ellipse cx="0" cy="0" rx="6" ry="10" fill="#3e2723"/><circle cx="-4" cy="-14" r="2" fill="#3e2723"/><circle cx="0" cy="-15" r="2" fill="#3e2723"/><circle cx="4" cy="-14" r="2" fill="#3e2723"/></g>`).join("")}</g>`,
    eyes:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-50" y="-30" width="100" height="60" fill="#111" ${K}/><ellipse cx="-14" cy="0" rx="12" ry="8" fill="#fff"/><ellipse cx="14" cy="0" rx="12" ry="8" fill="#fff"/><circle cx="-10" cy="0" r="4" fill="#111"/><circle cx="18" cy="0" r="4" fill="#111"/></g>`,
    zipper:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="34" fill="#ffd23f" ${K}/><circle cx="-12" cy="-10" r="4" fill="#111"/><circle cx="12" cy="-10" r="4" fill="#111"/><path d="M-18 10 L18 10" ${K}/>${[-14,-8,-2,4,10].map(a=>`<path d="M${a} 6 L${a} 14" ${k2}/>`).join("")}<rect x="16" y="6" width="8" height="10" fill="#bbb" ${k2}/></g>`,
    fire:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 34 C-26 34 -30 10 -16 -8 C-14 4 -8 6 -6 0 C-8 -16 0 -30 8 -36 C8 -20 26 -12 24 10 C24 26 14 34 0 34Z" fill="#ff7a1a" ${K}/><path d="M0 30 C-12 30 -14 16 -6 6 C-4 14 2 12 2 6 C10 12 14 20 10 26 C8 30 4 30 0 30Z" fill="#ffd23f"/></g>`,
    gift:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-26" y="-8" width="52" height="38" fill="#d62828" ${K}/><rect x="-30" y="-18" width="60" height="12" fill="#e53935" ${K}/><path d="M0 -18 L0 30" stroke="#f4c430" stroke-width="7"/><path d="M0 -18 C-14 -34 -24 -20 0 -18 C24 -20 14 -34 0 -18Z" fill="#f4c430" ${k2}/></g>`,
    snow:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-14" cy="6" r="16" fill="#fff" ${K}/><circle cx="16" cy="-6" r="12" fill="#e3f2fd" ${K}/><path d="M30 -20 L44 -32 M28 -30 L40 -40" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
    waves:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-6" width="12" height="40" fill="#455a64" ${K}/><circle cx="0" cy="-12" r="6" fill="#d62828" ${K}/>${[14,24,34].map(r=>`<path d="M${-r} ${-12-r*.7} A${r} ${r} 0 0 0 ${-r} ${-12+r*.7} M${r} ${-12-r*.7} A${r} ${r} 0 0 1 ${r} ${-12+r*.7}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`).join("")}<path d="M-30 -40 L30 16" stroke="#d62828" stroke-width="6" stroke-linecap="round"/></g>`,
    wallet:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-30" y="-18" width="60" height="38" rx="6" fill="#6d4c41" ${K}/><rect x="6" y="-6" width="28" height="14" rx="4" fill="#8d6e63" ${K}/><circle cx="16" cy="1" r="3" fill="#f4c430"/><rect x="-22" y="-28" width="34" height="14" fill="#7cb342" ${k2}/><path d="M-50 -40 C-44 -30 -40 -26 -30 -24" stroke="#f6c7a0" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
    sign:(x,y,s=1,txt="⟵")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 -10 L-4 40 M4 -10 L4 40" ${K}/><path d="M-40 -34 L30 -34 L42 -22 L30 -10 L-40 -10Z" fill="#ffd23f" ${K}/><path d="M-30 -22 L22 -22 M10 -30 L22 -22 L10 -14" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
    stop:(x,y,s=1,txt="STOP")=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -34 L14 -34 L34 -14 L34 14 L14 34 L-14 34 L-34 14 L-34 -14Z" fill="#d62828" ${K}/><path d="M-11 -28 L11 -28 L28 -11 L28 11 L11 28 L-11 28 L-28 11 L-28 -11Z" fill="none" stroke="#fff" stroke-width="2.5"/><text x="0" y="6" font-family="Arial Black,Arial" font-size="${txt.length>4?11:15}" font-weight="900" text-anchor="middle" fill="#fff">${txt}</text></g>`,
    mug:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-18 -16 L18 -16 L14 26 L-14 26Z" fill="#c62828" ${K}/><path d="M18 -8 C34 -8 34 14 16 14" fill="none" stroke="#111" stroke-width="6"/><path d="M-10 -24 q4 -8 0 -14 M2 -24 q4 -8 0 -14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-12 4 L12 4" stroke="#fff" stroke-width="3"/></g>`,
    megaphone:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -8 L10 -26 L10 26 L-30 8Z" fill="#eceff1" ${K}/><rect x="-40" y="-8" width="12" height="16" fill="#d62828" ${K}/><path d="M-24 8 L-20 26" ${K}/><path d="M20 -16 q10 16 0 32 M30 -24 q16 24 0 48" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>`,
    goat:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="6" cy="10" rx="26" ry="16" fill="#eee" ${K}/><path d="M-14 0 C-30 -4 -34 -22 -22 -26 C-10 -26 -8 -10 -14 0Z" fill="#eee" ${K}/><path d="M-26 -24 C-34 -36 -20 -38 -18 -28 M-18 -26 C-16 -38 -4 -34 -10 -24" fill="none" ${K}/><circle cx="-22" cy="-16" r="2" fill="#111"/><path d="M-26 -6 L-26 4" ${K}/><path d="M-6 24 L-8 34 M18 24 L20 34" ${K}/><rect x="-8" y="2" width="28" height="12" fill="#fff" ${k2}/><text x="6" y="11" font-family="Arial Black,Arial" font-size="7" font-weight="900" text-anchor="middle" fill="#d62828">SCHULD</text></g>`,
    lightning:(x,y,s)=>P.bolt(x,y,s),
    puzzle:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -30 L-6 -30 C-8 -40 8 -40 6 -30 L30 -30 L30 -6 C40 -8 40 8 30 6 L30 30 L-30 30Z" fill="#7e57c2" ${K}/><path d="M-30 0 L0 0 L0 30" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/></g>`,
    folder:(x,y,s=1,label="AKTE")=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(-4)"><path d="M-40 -26 L-14 -26 L-8 -20 L40 -20 L40 30 L-40 30Z" fill="#f0b54a" ${K}/><rect x="-32" y="-14" width="64" height="38" fill="#ffd27a" ${k2}/><text x="0" y="10" font-family="Arial Black,Arial" font-size="12" font-weight="900" text-anchor="middle" fill="#7a4a00">${label}</text></g>`,
    binoc:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-30" y="-14" width="22" height="34" rx="6" fill="#263238" ${K}/><rect x="8" y="-14" width="22" height="34" rx="6" fill="#263238" ${K}/><rect x="-10" y="-6" width="20" height="12" fill="#37474f" ${K}/><circle cx="-19" cy="22" r="9" fill="#4fc3f7" ${K}/><circle cx="19" cy="22" r="9" fill="#4fc3f7" ${K}/></g>`,
    ram:(x,y,s=1)=>P.door(x-14,y,s)+`<g transform="translate(${x+30} ${y}) scale(${s}) rotate(-12)"><rect x="-10" y="-8" width="40" height="16" rx="4" fill="#d62828" ${K}/><path d="M0 -8 L0 -14 M20 -8 L20 -14" ${K}/></g>`,
    kaution:(x,y,s)=>P.coins(x,y,s),
    star:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -34 L9 -10 L34 -10 L14 6 L22 30 L0 15 L-22 30 L-14 6 L-34 -10 L-9 -10Z" fill="#f4c430" ${K}/><text x="0" y="6" font-family="Arial Black,Arial" font-size="9" font-weight="900" text-anchor="middle" fill="#1f3f86">POLIZEI</text></g>`,
  };

  /* ---------- Figur nach Rolle + Name ---------- */
  function person(c, r, o={}){
    const n=c.name, pol=c.faction==="polizei", fem=o.fem!=null?o.fem:FEM.test(n.replace(/\bDr\.\s*/,"")), role=o.role||c.attr;
    const f={skin:pick(r,SKIN), hair:fem?pick(r,["#2b1d14","#4a2f1c","#7a4a24","#c8902f","#e2c15a","#8c2f1f","#1a1a1a"]):pick(r,HAIR), fem, r, mood:pol?"good":"bad", longHair:fem, grin:!pol&&r()<.5, x:o.x, y:o.y, s:o.s};
    const t={col:"#2a4f9b", kind:"police", x:o.x, y:o.y?o.y+56*(o.s||1):100, s:o.s};
    if(/Dr\.|Profil|analyt|Forensik|Professor|Laborkoch|Wirtschaft/i.test(n)) f.glasses=true;
    if(/präsident|direktor|kommandant|leiter|staffelleiter|führer\b|chef|boss|revier/i.test(n)) { t.medals=pol; t.epau="#f4c430"; }
    if(pol){
      if(/Bart/.test(n)) f.beard=true; else if(!fem&&r()<.3) f.stache=true;
      switch(role){
        case "kripo": t.kind="trench"; t.col="#c8a46a"; t.tie=pick(r,["#8c1d2a","#1f3f86","#2e7d32","#6a1b9a"]); if(!fem&&r()<.45) f.hat=HATS.fedora("#6b5a45"); else if(fem&&r()<.5) f.hat=HATS.bun(f.hair); if(/Verdeckt|Zivil/i.test(n)){ t.kind="leather"; t.col="#3e2723"; f.shades=true; f.hat=HATS.backcap("#455a64"); } if(/Spurensich/i.test(n)){ t.kind="doctor"; t.col="#f5f5f5"; } break;
        case "sek": t.kind="tactical"; t.col="#2c3138"; t.label=/MEK/.test(n)?"MEK":/GSG/.test(n)?"GSG 9":"SEK"; f.hat=HATS.helmet(); f.visor=!/Verhandlung|Entschärf|MEK/i.test(n); if(/MEK|Observ/i.test(n)){ f.hat=""; f.shades=true; t.kind="leather"; t.col="#263238"; } if(/Verhandlung/i.test(n)){ f.hat=""; t.kind="suit"; t.col="#37474f"; } break;
        case "verkehr": t.kind="vest"; t.col="#2a4f9b"; f.hat=HATS.whitecap(); if(/Motorrad/i.test(n)) f.hat=HATS.bike("#eceff1"); break;
        case "bepo": t.kind="tactical"; t.col="#1f3f86"; t.label="POLIZEI"; f.hat=HATS.riot(); if(/Ärztin/i.test(n)){ t.kind="doctor"; t.col="#f5f5f5"; f.hat=""; } if(/Personensch/i.test(n)){ t.kind="suit"; t.col="#212121"; f.hat=""; f.shades=true; } if(/Einsatzleit|Polizeidirektor|Bereitschaftsführer|Hundertschaftsführer/i.test(n)){ t.kind="police"; f.hat=HATS.cap("#1f3f86","#111","#f4c430"); } break;
        case "hunde": t.kind="police"; f.hat=HATS.cap(); break;
        default: t.kind="police"; f.hat=HATS.cap(); if(/Wasserschutz/i.test(n)) f.hat=HATS.sailor(); if(/Fahrrad/i.test(n)) f.hat=HATS.bike("#1f6fd6"); if(/Weihnacht/i.test(n)) f.hat=HATS.santa(); if(/Kontaktbereich|Wachhab/i.test(n)&&r()<.6) f.hat=""; if(/Streifenführer/i.test(n)) t.kind="vest";
      }
    } else {
      if(/bart\b|Bart/.test(n)) { f.beard=true; f.beardCol="#1a1a1a"; } else if(!fem&&r()<.35) f.stache=true;
      if(/Narbe|Schläger|Vollstreck|Bulle/i.test(n)) f.scar=true;
      switch(role){
        case "dieb": t.kind="hoodie"; t.col=pick(r,["#263238","#37474f","#3e2723"]); f.mask=!/Ladendieb|Fahrrad|Unfall/i.test(n); f.hat=HATS.beanie(pick(r,["#222","#3b3b3b","#5d1a1a"])); if(/Taschendieb/i.test(n)){ f.mask=false; f.hat=HATS.flatcap("#5d4037"); f.look=-2; } if(/Juwelen|Kunst|Monsieur/i.test(n)){ t.kind="suit"; t.col="#111"; t.bow=true; f.hat=""; f.mask=true; f.stache=!fem; } if(/Katze/i.test(n)){ f.hat=HATS.beanie("#111"); } break;
        case "betrug": t.kind=fem?"pearls":"suit"; t.col=pick(r,["#5e35b1","#37474f","#6d4c41","#1b5e20"]); t.lapel="#222"; f.grin=true; f.look=2; if(!fem) f.stache=true; if(/Graf|Hochstapler/i.test(n)) f.hat=HATS.tophat(); if(/Enkeltrick/i.test(n)){ f.hair="#d9d9d9"; f.glasses=true; t.kind="pearls"; t.col="#8e6c88"; } if(/Falscher Polizei/i.test(n)){ t.kind="police"; t.col="#2a4f9b"; f.hat=HATS.cap("#2a4f9b","#111","#9e9e9e"); f.mask=false; } if(/Weihnachtsmann/i.test(n)){ t.kind="santa"; t.col="#d62828"; f.hat=HATS.santa(); f.beard=true; f.beardCol="#fff"; } if(/Phantom/i.test(n)) f.mask=true; if(/Anwalt|Steuer/i.test(n)) f.glasses=true; break;
        case "bande": t.kind="leather"; t.col="#1d1d1f"; t.chain=true; f.shades=r()<.5; f.hair=pick(r,["#1a1a1a","#2b1d14"]); f.bald=!fem&&r()<.4; if(/Pate|Don|Clanchef|Unterboss|Bandenchef/i.test(n)){ t.kind="suit"; t.col="#1a1a1a"; t.lapel="#333"; t.tie="#c8202f"; f.hat=HATS.fedora("#1d1d1f"); f.cigar=true; f.shades=false; } if(/Rocker/i.test(n)) f.hat=HATS.bike("#111"); if(/Türsteher/i.test(n)){ f.bald=true; f.shades=true; t.kind="suit"; t.col="#111"; } break;
        case "hehler": t.kind="vestbrown"; t.col=pick(r,["#5d4037","#4e342e","#455a64"]); f.hat=HATS.flatcap(pick(r,["#6b5a45","#455a64","#3e2723"])); t.chain=r()<.5; if(/König|Baron/i.test(n)){ f.hat=HATS.crown(); t.kind="pearls"; t.col="#6a1b9a"; } if(/Kapitän|Schmuggler/i.test(n)) f.hat=HATS.sailor(); if(/Darknet/i.test(n)){ t.kind="hoodie"; t.col="#111"; f.hat=""; f.mask=true; } break;
        case "raub": t.kind="stripes"; t.col="#f5f5f5"; f.mask=true; f.hat=HATS.beanie("#222"); if(/Hauptmann/i.test(n)){ f.hat=HATS.tophat(); f.mask=false; t.kind="suit"; t.col="#5d1a1a"; t.lapel="#2a0b0b"; t.tie="#f4c430"; } if(/Maskiert/i.test(n)){ f.hat=""; f.mask=true; t.kind="hoodie"; t.col="#111"; } if(/Raser|Fluchtfahr/i.test(n)){ f.hat=HATS.backcap("#d62828"); f.mask=false; f.shades=true; t.kind="leather"; t.col="#c62828"; } if(/Gangsterbraut|Lola/i.test(n)){ f.hat=""; f.mask=false; t.kind="pearls"; t.col="#ad1457"; } break;
        case "drogen": t.kind="hoodie"; t.col=pick(r,["#2e7d32","#4527a0","#424242"]); f.hat=HATS.backcap(pick(r,["#111","#2e7d32","#c62828"])); f.shades=r()<.5; if(/Baron|Jefe|Großhändler/i.test(n)){ t.kind="suit"; t.col="#efe7d2"; t.lapel="#c8b98a"; f.hat=HATS.fedora("#efe7d2"); f.cigar=true; f.stache=true; } if(/Laborkoch|Professor/i.test(n)){ t.kind="doctor"; t.col="#f5f5f5"; f.hat=""; } if(/Phantom ohne/i.test(n)){ f.mask=true; f.hat=HATS.fedora("#111"); } break;
      }
    }
    const fig=torso(t)+face(f);
    return o.x==null ? `<g transform="translate(84 100) scale(1.22) translate(-84 -100)">${fig}</g>` : fig;
  }

  /* ---------- Requisit/Szene je Charakter (aus dem Namen) ---------- */
  function sideProp(c,r){
    const n=c.name;
    const R=[[/Hundeführer|mit Kira|Staffelleiter/i,()=>P.dog(136,72,.85)],[/Hubschrauber|Libelle|Luft/i,()=>P.heli(84,40,1)],[/Fahrrad/i,()=>P.bike(138,80,.8)],
      [/Reiter/i,()=>P.horse(140,58,.9)],[/Wasserschutz|Schmuggler|Kapitän/i,()=>P.boat(136,82,.7)],[/Motorrad|Rocker/i,()=>P.moto(136,84,.75,/Rocker/i.test(n)?"#111":"#eceff1")],
      [/Autobahn|Autoknacker|Raser|Fluchtfahr|Verfolg/i,()=>P.car(134,84,.62,/Autobahn/i.test(n)?"#eceff1":"#d62828",/Autobahn/i.test(n))],[/Laser|Video|Mess/i,()=>P.camera(138,56,.8)],
      [/Geld|Bank|Inkasso|Schutzgeld|Zahltag|Tankstell|Kasse|Räuber/i,()=>P.moneybag(140,76,.9)],[/Hehler|Lager|Kiste|Pfand|Krempel|Antik|Schrott/i,()=>P.crate(140,80,.9)],
      [/Dealer|Kurier|Zucker|Plantage|Kartell|Kilo|Rauschgift/i,()=>P.pill(142,78,.9)],[/Funk|Dienstgruppen|Lautsprecher|Wachhab/i,()=>P.radio(138,76,1)],
      [/Ratte|Spitzel/i,()=>P.rat(138,84,.75)],[/Katze|Fassaden/i,()=>P.cat(140,80,.8)],[/Spurensich|Forensik|Fallanalyt|Profil/i,()=>P.magnifier(136,70,.8)],
      [/Phishing|Darknet|IT-/i,()=>P.monitor(136,72,.7)],[/Tresor|Einbrecher|Dietrich/i,()=>P.keys(140,72,.8)],[/Urkunden|Scheck|Steuer|Bußgeld/i,()=>P.doc(140,70,.75,"€",null)],
      [/Bombe|Spreng/i,()=>P.boom(140,70,.8)],[/Brand/i,()=>P.fire(140,70,.75)],[/Weihnacht/i,()=>P.gift(140,76,.8)],[/Glühwein/i,()=>P.mug(140,76,.8)]];
    for(const [re,f] of R) if(re.test(n)) return f();
    return "";
  }

  /* ---------- Maßnahmen, Reaktionen, Tricks ---------- */
  const OBJ=[[/Haftbefehl/i,()=>P.doc(84,52,1.15,"§","#d62828")],[/Festnahme|Fesselung|Festhalten|Zugriff am|Ausschreibung/i,()=>P.cuffs(84,56,1.15)],[/Durchsuchung|Wiederaufnahme/i,()=>P.magnifier(80,50,1.2)],
    [/Beschlagnahme|Sicherstellung|Beweismittel|Geheimversteck/i,()=>P.box(84,52,1.15,"BEWEIS")],[/Identität|Ausweis|Tarnidentität|Erkennungsdienst/i,()=>P.idcard(84,52,1.2,/Gefälscht|Tarn|tausch/i.test("")?"#fff3e0":"#e8f1ff")],
    [/Telekommunikation|Störsender/i,()=>/Stör/i.test("")?P.waves(84,52,1):P.headset(84,52,1.1)],[/Observation|Schmiere/i,()=>P.binoc(84,50,1.15)],[/Öffentlichkeit|Fahndung$|Lagebild/i,()=>P.newspaper(84,52,1.15)],
    [/Verstärkung|Funkspruch|Großlage/i,()=>P.radio(84,54,1.6)],[/Vernehmung|Belehrung|Gefährderansprache|Vorladung/i,()=>P.megaphone(84,52,1.1)],[/Blutprobe/i,()=>P.blood(84,54,1.1)],
    [/DNA/i,()=>P.dna(84,50,1)],[/ersten Zugriffs|Unmittelbarer Zwang/i,()=>P.bolt(84,50,1.3)],[/Raster|Lagezentrum/i,()=>P.monitor(84,50,1.15)],[/Videoüberwachung/i,()=>P.camera(90,56,1.3)],
    [/Vermögen|Steuer|Kaution|Bestechung|Schutzgeld|Hehlerware|Lösegeld/i,()=>P.coins(80,52,1.2)],[/Absperrung|Fahrzeugsperre|Kontrollstelle/i,()=>P.barrier(84,56,1.15)],
    [/Gewahrsam|Untersuchungshaft|Ingewahrsam/i,()=>P.bars(84,52,1.15)],[/Eigensicherung|Notwehr|Gemeinsamer/i,()=>P.shield(84,52,1.2)],[/Meldeauflage/i,()=>P.calendar(84,52,1.2)],
    [/Nagelgurt|Krähenfüße/i,()=>P.spikes(84,64,1.2)],[/Wohnungsverweisung|Rammbock/i,()=>P.door(84,52,1.05)],[/Einsatzbesprechung|Fluchtroute/i,()=>P.map(84,52,1.15)],
    [/Komplize|Komplizen|Deal\b|Hinterzimmer/i,()=>P.hands(84,56,1.15)],[/Fluchtwagen|Verfolgungsjagd/i,()=>P.car(86,62,1.05,"#d62828")],[/Brechstange/i,()=>P.crowbar(84,52,1)],
    [/Dietrich/i,()=>P.keys(84,48,1.2)],[/Maskierung|Identitätstausch/i,()=>P.mask(84,50,1.1)],[/Handy|Notruf/i,()=>P.phone(84,52,1.15)],[/Rauchbombe|Spuren|Panik/i,()=>P.smoke(84,48,1.05)],
    [/Unterschlupf|Hinterhalt|Hinterhof/i,()=>P.house(84,52,1.15)],[/Bandenkrieg|Feuerwerk|Überfall|Gefängnisausbruch/i,()=>P.boom(84,52,1.3,/Feuerwerk/i.test("")?"#e040fb":"#ff7a1a")],
    [/Erpressung/i,()=>P.letter(84,52,1.1)],[/Großer Coup/i,()=>P.bank(84,56,1.15)],[/Tunnel/i,()=>P.hole(84,58,1.1)],[/Fährte/i,()=>P.steps(84,52,1.1)],[/Schweigerecht/i,()=>P.zipper(84,50,1.2)],
    [/vernichten|Aktenvernichtung/i,()=>P.fire(84,50,1.15)],[/Geschenke/i,()=>P.gift(84,54,1.2)],[/Schneeball/i,()=>P.snow(84,54,1.3)],[/Taschenzug/i,()=>P.wallet(90,56,1.15)],
    [/Umleitung/i,()=>P.sign(84,50,1.1)],[/Platzverweis|Aufenthaltsverbot/i,()=>P.stop(84,50,1.15,"STOP")],[/Glühwein/i,()=>P.mug(84,54,1.3)],[/Sündenbock/i,()=>P.goat(84,52,1.2)],
    [/Sonderkommission|Bandengründung/i,()=>P.puzzle(84,52,1.15)],[/Akten|Revision|Alibi/i,()=>P.folder(84,52,1.15,/Revision/i.test("")?"REVISION":"AKTE")],[/Anwalt/i,()=>P.doc(84,52,1.1,"⚖","#1f3f86")],
    [/Razzia|Großrazzia/i,()=>P.car(84,62,1.05,"#eceff1",true)]];
  function object(c,r){
    const n=c.name; for(const [re,f] of OBJ) if(re.test(n)){ let s=f(); // Feinheiten, die vom Namen abhängen
        if(/Störsender/i.test(n)) s=P.waves(84,52,1); if(/Gefälscht|Tarnidentität/i.test(n)) s=P.idcard(84,52,1.2,"#fff3e0")+P.stop(130,24,.45,"FAKE");
        if(/Feuerwerk/i.test(n)) s=P.boom(60,40,.8,"#e040fb")+P.boom(110,56,1,"#29b6f6"); if(/Revision/i.test(n)) s=P.folder(84,52,1.15,"REVISION");
        if(/Falsches Alibi/i.test(n)) s=P.folder(84,52,1.15,"ALIBI"); return s; }
    // Rückfall je Rechtsgebiet
    if(c.law==="StPO") return P.doc(84,52,1.15,"§");
    if(c.law==="SOG") return P.star(84,52,1.2);
    return P.mask(84,50,1.05,"#fff8e1");
  }

  /* ---------- Gruppen, Tiere, Fahrzeuge ---------- */
  function special(c,r){
    const n=c.name;
    if(c.attr==="hunde" && !/führer|mit Kira|Staffelleiter|Team|Duo/i.test(n)){
      const col=/Bella|Luna/i.test(n)?"#2b2b2b":/Pepper|Krümel/i.test(n)?"#d4a76a":"#b07a3c";
      return P.dog(84,58,1.45,col);
    }
    if(/Hubschrauberstaffel|Luft-Boden/i.test(n)) return P.heli(60,36,.8)+P.heli(118,58,.8);
    if(/^Polizeihubschrauber/i.test(n)) return P.heli(84,48,1.25);
    if(/Wasserwerfer/i.test(n)) return P.truck(80,64,1.05);
    if(/Video-Messfahrzeug/i.test(n)) return P.car(84,64,1,"#9e9e9e")+P.camera(80,30,.6);
    if(/Lautsprecherwagen/i.test(n)) return P.car(84,66,1,"#eceff1",true)+P.megaphone(84,26,.6);
    if(/Fluchthelfer-Ring/i.test(n)) return P.car(84,66,1,"#455a64");
    if(/Bankraub-Kommando|Bankräuber-Duo/i.test(n)) return group(c,r,2)+P.moneybag(140,80,.7);
    if(/Organisierte Kriminalität|Drogenkartell|Hehlernetzwerk|Geldwäsche/i.test(n)) return group(c,r,3);
    if(GROUP.test(n)) return group(c,r,3);
    return null;
  }
  function group(c,r,cnt){
    const pos = cnt===2 ? [[60,52,.82],[110,52,.82]] : [[44,58,.66],[124,58,.66],[84,48,.78]];
    return pos.map(([x,y,s])=>person(c,r,{x,y,s,fem:r()<.4})).join("");
  }

  const cache=new Map();
  function svg(c){
    if(!c||!c.id) return "";
    const key=c.id+"|"+c.name+"|"+(c.attr||c.law); if(cache.has(key)) return cache.get(key);
    const r=rng(c.id+c.name);
    let inner;
    if(isChar(c)) inner = special(c,r) || (person(c,r)+sideProp(c,r));
    else inner = object(c,r);
    const out="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(wrap(inner, c.faction==="verbrecher"?"#ffe08a":"#fff"));
    cache.set(key,out); return out;
  }
  return {svg, raw:c=>decodeURIComponent(svg(c).split(",")[1])};
})();
