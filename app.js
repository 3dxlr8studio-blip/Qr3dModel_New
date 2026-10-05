import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const container = document.querySelector("#ar-container");
const startButton = document.querySelector("#start");
const statusEl = document.querySelector("#status");
const hintEl = document.querySelector("#hint");


// ======================================================
// MINDAR SETUP
// ======================================================

const mindarThree = new MindARThree({

  container: container,

  // TEST TARGET
  imageTargetSrc:
    "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind",

  maxTrack: 1,

  uiLoading: "no",
  uiScanning: "no",
  uiError: "no"
});


const {
  renderer,
  scene,
  camera
} = mindarThree;


// ======================================================
// RENDERER
// ======================================================

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);


// ======================================================
// LIGHTING
// ======================================================

const ambientLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2.5
  );

scene.add(ambientLight);


const mainLight =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

mainLight.position.set(
  1,
  2,
  3
);

scene.add(mainLight);


// ======================================================
// TARGET
// ======================================================

const anchor =
  mindarThree.addAnchor(0);


// ======================================================
// MODEL CONTAINER
// ======================================================

const modelContainer =
  new THREE.Group();

anchor.group.add(
  modelContainer
);


// ======================================================
// LOAD GLB
// ======================================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/model.glb",

  function (gltf) {

    const model =
      gltf.scene;


    modelContainer.add(
      model
    );


    // MODEL SIZE
    model.scale.set(
      0.8,
      0.8,
      0.8
    );


    // MODEL POSITION
    model.position.set(
      0,
      0,
      0.2
    );


    // MODEL ROTATION
    model.rotation.set(
      Math.PI / 2,
      0,
      0
    );


    statusEl.textContent =
      "Model loaded — press Start AR";

  },


  undefined,


  function (error) {

    console.error(
      "MODEL LOAD ERROR:",
      error
    );


    /*
      FALLBACK CUBE

      If your GLB fails,
      you should still see this.
    */

    const geometry =
      new THREE.BoxGeometry(
        0.5,
        0.5,
        0.5
      );


    const material =
      new THREE.MeshStandardMaterial({

        color: 0x35a7ff,

        roughness: 0.4,

        metalness: 0.1

      });


    const cube =
      new THREE.Mesh(
        geometry,
        material
      );


    cube.position.set(
      0,
      0,
      0.25
    );


    modelContainer.add(
      cube
    );


    statusEl.textContent =
      "Demo cube loaded — press Start AR";

  }

);


// ======================================================
// TARGET EVENTS
// ======================================================

anchor.onTargetFound = () => {

  console.log(
    "TARGET FOUND"
  );


  statusEl.textContent =
    "Target found ✓";


  hintEl.textContent =
    "3D model is attached to the target.";

};


anchor.onTargetLost = () => {

  console.log(
    "TARGET LOST"
  );


  statusEl.textContent =
    "Target lost";


  hintEl.textContent =
    "Point the camera back at the target image.";

};


// ======================================================
// MAKE CAMERA VIDEO VISIBLE
// ======================================================

function fixCameraDisplay() {

  /*
    MindAR creates its own video element.

    These styles force it to fill
    the phone screen instead of
    remaining black/hidden.
  */

  const videos =
    container.querySelectorAll("video");


  videos.forEach((video) => {

    video.style.position =
      "fixed";

    video.style.top =
      "0";

    video.style.left =
      "0";

    video.style.width =
      "100vw";

    video.style.height =
      "100vh";

    video.style.objectFit =
      "cover";

    video.style.zIndex =
      "0";

    video.style.display =
      "block";

    video.style.visibility =
      "visible";

    video.style.opacity =
      "1";

  });


  /*
    Three.js canvas sits over camera
  */

  if (renderer.domElement) {

    renderer.domElement.style.position =
      "fixed";

    renderer.domElement.style.top =
      "0";

    renderer.domElement.style.left =
      "0";

    renderer.domElement.style.width =
      "100vw";

    renderer.domElement.style.height =
      "100vh";

    renderer.domElement.style.zIndex =
      "1";

  }

}


// ======================================================
// START AR
// ======================================================

let arStarted = false;


async function startAR() {


  if (arStarted) {
    return;
  }


  if (!window.isSecureContext) {

    statusEl.textContent =
      "HTTPS required";

    hintEl.textContent =
      "Camera AR only works through HTTPS.";

    return;

  }


  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    statusEl.textContent =
      "Camera not supported";

    return;

  }


  startButton.disabled =
    true;


  /*
    Hide button immediately.

    If something fails,
    we show it again.
  */

  startButton.classList.add(
    "hidden"
  );


  statusEl.textContent =
    "Opening camera…";


  hintEl.textContent =
    "Allow camera permission if asked.";


  try {


    await mindarThree.start();


    arStarted =
      true;


    console.log(
      "MINDAR STARTED"
    );


    /*
      Force camera/video visibility
    */

    fixCameraDisplay();


    /*
      Run again after a short delay
      because MindAR sometimes creates
      the video slightly later.
    */

    setTimeout(
      fixCameraDisplay,
      300
    );


    setTimeout(
      fixCameraDisplay,
      1000
    );


    statusEl.textContent =
      "Camera ready — point at target image";


    hintEl.textContent =
      "Point camera at the MindAR test card.";


    /*
      Start rendering
    */

    renderer.setAnimationLoop(
      () => {

        renderer.render(
          scene,
          camera
        );

      }
    );


  }


  catch (error) {


    console.error(
      "AR START ERROR:",
      error
    );


    arStarted =
      false;


    startButton.disabled =
      false;


    startButton.classList.remove(
      "hidden"
    );


    statusEl.textContent =

      "AR error: " +

      (
        error?.message ||
        error
      );


    hintEl.textContent =
      "Check camera permission and reload the page.";

  }

}


// ======================================================
// BUTTON
// ======================================================

startButton.addEventListener(

  "click",

  startAR

);


// ======================================================
// STOP CAMERA WHEN PAGE CLOSES
// ======================================================

window.addEventListener(

  "pagehide",

  () => {

    try {

      if (arStarted) {

        mindarThree.stop();

      }

    }

    catch (error) {

      console.warn(
        error
      );

    }

  }

);
