import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";


// ================================
// HTML ELEMENTS
// ================================

const container =
  document.querySelector("#ar-container");

const startButton =
  document.querySelector("#start");

const statusEl =
  document.querySelector("#status");

const hintEl =
  document.querySelector("#hint");


// ================================
// MINDAR
// ================================

const mindarThree =
  new MindARThree({

    container: container,

    // SAME QR compiled into target.mind
    imageTargetSrc:
      "./targets/target.mind",

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


// ================================
// RENDERER
// ================================

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);


// ================================
// LIGHTING
// ================================

const hemi =
  new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2.5
  );

scene.add(hemi);


const light =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

light.position.set(
  1,
  2,
  3
);

scene.add(light);


// ================================
// QR TARGET
// ================================

const anchor =
  mindarThree.addAnchor(0);


// ================================
// MODEL
// ================================

const modelContainer =
  new THREE.Group();

anchor.group.add(
  modelContainer
);


const loader =
  new GLTFLoader();


loader.load(

  "./models/model.glb",

  function(gltf) {

    const model =
      gltf.scene;

    modelContainer.add(
      model
    );


    // SIZE
    model.scale.set(
      0.8,
      0.8,
      0.8
    );


    // POSITION ABOVE QR
    model.position.set(
      0,
      0,
      0.2
    );


    // ROTATION
    model.rotation.set(
      Math.PI / 2,
      0,
      0
    );


    statusEl.textContent =
      "Model loaded — press Start AR";

  },


  undefined,


  function(error) {

    console.error(
      "MODEL ERROR:",
      error
    );


    // fallback cube

    const cube =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.5,
          0.5,
          0.5
        ),

        new THREE.MeshStandardMaterial({
          color: 0x35a7ff
        })

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
      "Demo cube loaded";

  }

);


// ================================
// TARGET EVENTS
// ================================

anchor.onTargetFound =
  () => {

    console.log(
      "QR TARGET FOUND"
    );


    statusEl.textContent =
      "QR detected ✓";


    hintEl.textContent =
      "3D model is attached to the QR.";

  };


anchor.onTargetLost =
  () => {

    console.log(
      "QR TARGET LOST"
    );


    statusEl.textContent =
      "QR lost";


    hintEl.textContent =
      "Point camera back at the QR.";

  };


// ================================
// CAMERA DISPLAY FIX
// ================================

function fixCameraDisplay() {

  const videos =
    document.querySelectorAll(
      "video"
    );


  videos.forEach(
    (video) => {

      video.setAttribute(
        "playsinline",
        ""
      );


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

    }
  );


  if (
    renderer.domElement
  ) {

    renderer.domElement.style.position =
      "fixed";

    renderer.domElement.style.inset =
      "0";

    renderer.domElement.style.width =
      "100vw";

    renderer.domElement.style.height =
      "100vh";

    renderer.domElement.style.zIndex =
      "1";

    renderer.domElement.style.background =
      "transparent";

  }

}


// ================================
// START AR
// ================================

let arStarted =
  false;


async function startAR() {


  if (arStarted) {
    return;
  }


  if (!window.isSecureContext) {

    statusEl.textContent =
      "HTTPS required";

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


  startButton.classList.add(
    "hidden"
  );


  statusEl.textContent =
    "Opening camera…";


  hintEl.textContent =
    "Allow camera permission.";


  try {


    await mindarThree.start();


    arStarted =
      true;


    fixCameraDisplay();


    setTimeout(
      fixCameraDisplay,
      300
    );


    setTimeout(
      fixCameraDisplay,
      1000
    );


    statusEl.textContent =
      "Camera ready — point at QR";


    hintEl.textContent =
      "Point camera at the same QR you scanned.";


    renderer.setAnimationLoop(
      () => {

        renderer.render(
          scene,
          camera
        );

      }
    );


  }


  catch(error) {


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
      "Check camera permission and reload.";

  }

}


// ================================
// START BUTTON
// ================================

startButton.addEventListener(

  "click",

  startAR

);


// ================================
// STOP CAMERA
// ================================

window.addEventListener(

  "pagehide",

  () => {

    try {

      if (arStarted) {

        mindarThree.stop();

      }

    }

    catch(error) {

      console.warn(
        error
      );

    }

  }

);
