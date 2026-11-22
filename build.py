"""Baut das Spiel.
   python3 build.py                → android/app/src/main/assets/index.html (für die APK)
   python3 build.py --web site     → zusätzlich Webseite: site/index.html (Download-Seite), site/spiel/ (Web-App für iPhone & Browser)
   Umgebungsvariablen (setzt der GitHub-Workflow): APP_VERSION, APP_VERSION_CODE, REPO_URL
   Bei Kartenänderungen vorher: python3 tools/cards_gen.py"""
import base64, json, os, shutil, sys
root=os.path.dirname(os.path.abspath(__file__))
r=lambda p: open(os.path.join(root,p),encoding='utf-8').read()
version=os.environ.get("APP_VERSION","dev"); vcode=int(os.environ.get("APP_VERSION_CODE","1"))
repo=os.environ.get("REPO_URL","https://github.com/TotesTierux/einsatz-duell")
_own,_name=repo.rstrip("/").split("/")[-2:]
site_url=os.environ.get("SITE_URL",f"https://{_own.lower()}.github.io/{_name}")
font=base64.b64encode(open(os.path.join(root,'src/bangers-latin-400-normal.woff2'),'rb').read()).decode()

html=(r('src/head.part')+r('src/body.part').replace('</style>',r('src/kombi.css')+'</style>',1)).replace('__FONT__',font)
fb_path=os.path.join(root,'firebase.json')
fb=json.load(open(fb_path)) if os.path.exists(fb_path) else None
html=html.replace('/*__FIREBASE__*/', 'window.FIREBASE_CONFIG='+json.dumps(fb)+';')
html=html.replace('/*__PEERJS__*/', '/* three.js r158 – MIT-Lizenz, https://threejs.org */\n'+r('src/vendor/three.min.js')+'\n/* PeerJS 1.5.5 – MIT-Lizenz, https://peerjs.com */\n'+r('src/vendor/peerjs.min.js'))
html=html.replace('/*__CARDS__*/', f'window.APP_VERSION={json.dumps(version)};window.APP_REPO={json.dumps(repo)};window.APP_SITE={json.dumps(site_url)};\n'+r('src/cards.js')+'\n'+r('src/flavor.js')).replace('/*__GAME__*/',r('src/meta.js')+'\n'+r('src/game.js')+'\n'+r('src/kombi.js')+'\n'+r('src/arena3d.js'))

out=os.path.join(root,'android/app/src/main/assets/index.html')
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf-8').write(html)
print('APK-Datei ok',len(html))

if '--web' in sys.argv:
    site=os.path.join(root, sys.argv[sys.argv.index('--web')+1]); spiel=os.path.join(site,'spiel')
    shutil.rmtree(site, ignore_errors=True); os.makedirs(spiel)
    pwa_head='''<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Einsatz-Duell">
</head>'''
    sw_reg='''<script>if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{});</script>
</body>'''
    web=html.replace('</head>',pwa_head,1).replace('</body>',sw_reg,1)
    open(os.path.join(spiel,'index.html'),'w',encoding='utf-8').write(web)
    for f in ['manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png']: shutil.copy(os.path.join(root,'web/spiel',f), spiel)
    open(os.path.join(spiel,'sw.js'),'w').write(r('web/spiel/sw.js').replace('__VERSION__',version))
    open(os.path.join(site,'index.html'),'w',encoding='utf-8').write(r('web/index.html').replace('__FONT__',font).replace('__REPO__',repo))
    open(os.path.join(site,'join.html'),'w',encoding='utf-8').write(r('web/join.html').replace('__FONT__',font).replace('__SITE__',site_url))
    has_apk=os.environ.get("APK_AVAILABLE","")=="1"
    json.dump({"versionCode":vcode if has_apk else 0,"versionName":version,"apk":repo+"/releases/latest/download/EinsatzDuell.apk" if has_apk else "",
               "notes":os.environ.get("APP_NOTES","")}, open(os.path.join(site,'version.json'),'w'), ensure_ascii=False)
    open(os.path.join(site,'.nojekyll'),'w').close()
    print('Webseite ok →',site)
