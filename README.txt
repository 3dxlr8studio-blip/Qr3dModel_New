XLR8 WEBAR — TARGET IMAGE PROTOTYPE
===================================

FINAL INTENDED FLOW
-------------------
1. User scans QR with the NORMAL phone Camera.
2. QR opens an XLR8-hosted web page.
3. User taps "Start AR Camera".
4. Browser asks for camera permission.
5. Camera opens.
6. WebAR looks for a target image.
7. When the target is recognized, the GLB model appears locked to it.

NO APP INSTALLATION.

FILES
-----
index.html
style.css
app.js
models/model.glb

PROTOTYPE TEST TARGET
---------------------
This build uses the official MindAR sample target definition so it can be tested quickly.

Target image:
https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.png

Open/print that image on another screen or paper and point the AR camera at it.

YOUR OWN TARGET — FINAL VERSION
-------------------------------
For production:
1. Choose a distinctive target image/poster/artwork.
2. Compile it into a MindAR .mind file.
3. Put it in:
   targets/target.mind
4. Change app.js:

FROM:
imageTargetSrc: "https://cdn.../card.mind"

TO:
imageTargetSrc: "./targets/target.mind"

YOUR OWN MODEL
--------------
Replace:
models/model.glb

with your own GLB using the same filename.

HOSTING
-------
Upload all files/folders to XLR8's HTTPS hosting, for example:

https://xlr8studio.com/ar/demo/

HTTPS is required for browser camera access.

ABOUT THIRD-PARTY SERVICES
--------------------------
The user never leaves your website.

This prototype loads open-source Three.js and MindAR JavaScript libraries from public CDNs.
For final production, those JavaScript files can also be downloaded and hosted locally on the
XLR8 server so the entire experience is served from your own domain.

MODEL POSITION / SCALE
----------------------
Edit app.js:

model.scale.setScalar(0.8);
model.position.set(0, 0, 0.25);
model.rotation.set(Math.PI / 2, 0, 0);

Adjust these for your real GLB.
