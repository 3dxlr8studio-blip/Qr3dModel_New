import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// ========================================
// HTML ELEMENTS
// ========================================

const container =
  document.querySelector("#ar-container");

const startButton =
  document.querySelector("#start");

const statusEl =
  document.querySelector("#status");

const hintEl =
  document.querySelector("#hint");


statusEl.textContent =
  "JavaScript loaded";


// ========================================
// THREE SCENE
// ========================================

const scene =
  new THREE.Scene();


// ========================================
// THREE CAMERA
// ========================================

const camera =
  new THREE.PerspectiveCamera(

    60,

    window.innerWidth /
    window.innerHeight,

    0.01,

    100

  );


camera.position.set(
  0,
  0,
  0
);


// ========================================
// RENDERER
// ========================================

const renderer =
  new THREE.WebGLRenderer({

    alpha: true,

    antialias: true

  });


renderer.setSize(

  window.innerWidth,

  window.innerHeight

);


renderer.setPixelRatio(

  Math.min(
    window.devicePixelRatio,
    2
  )

);


// IMPORTANT
// transparent canvas

renderer.setClearColor(
  0x000000,
  0
);


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
  "2";

renderer.domElement.style.pointerEvents =
  "none";


container.appendChild(
  renderer.domElement
);


// ========================================
// PHONE CAMERA VIDEO
// ========================================

const video =
  document.createElement("video");


video.autoplay = true;

video.muted = true;

video.playsInline = true;


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

video.style.background =
  "black";


container.appendChild(
  video
);


// ========================================
// LIGHTING
// ========================================

const hemi =
  new THREE.HemisphereLight(

    0xffffff,

    0x555555,

    3

  );


scene.add(
  hemi
);


const light =
  new THREE.DirectionalLight(

    0xffffff,

    4

  );


light.position.set(
  2,
  3,
  4
);


scene.add(
  light
);


// ========================================
// TEST CUBE
// ========================================

// This tells us Three.js is working.

const testCube =
  new THREE.Mesh(

    new THREE.BoxGeometry(
      0.5,
      0.5,
      0.5
    ),

    new THREE.MeshStandardMaterial({

      color:
        0xff0000

    })

  );


testCube.position.set(

  -0.7,

  0,

  -2

);


scene.add(
  testCube
);


// ========================================
// LOAD GLB
// ========================================

const loader =
  new GLTFLoader();


let model =
  null;


loader.load(

  "./models/model.glb",


  function(gltf) {

    console.log(
      "MODEL LOADED SUCCESSFULLY"
    );


    model =
      gltf.scene;


    scene.add(
      model
    );


    // --------------------------------
    // GET SIZE
    // --------------------------------

    const box =
      new THREE.Box3()
      .setFromObject(
        model
      );


    const size =
      new THREE.Vector3();


    box.getSize(
      size
    );


    // --------------------------------
    // AUTO SCALE
    // --------------------------------

    const maxDimension =
      Math.max(

        size.x,

        size.y,

        size.z

      );


    if (
      maxDimension > 0
    ) {

      const desiredSize =
        1;


      const scale =
        desiredSize /
        maxDimension;


      model.scale.setScalar(
        scale
      );

    }


    // --------------------------------
    // RECALCULATE BOX
    // --------------------------------

    const scaledBox =
      new THREE.Box3()
      .setFromObject(
        model
      );


    const center =
      new THREE.Vector3();


    scaledBox.getCenter(
      center
    );


    // --------------------------------
    // CENTER MODEL
    // --------------------------------

    model.position.x -=
      center.x;

    model.position.y -=
      center.y;

    model.position.z -=
      center.z;


    // --------------------------------
    // PUT MODEL IN FRONT
    // --------------------------------

    model.position.x +=
      0.4;

    model.position.y +=
      0;

    model.position.z +=
      -2;


    // --------------------------------
    // ROTATION
    // --------------------------------

    model.rotation.set(

      0,

      0,

      0

    );


    statusEl.textContent =
      "Model loaded ✓";


    hintEl.textContent =
      "Press Start AR Camera";

  },


  function(progress) {

    if (
      progress.total
    ) {

      const percent =

        progress.loaded /

        progress.total *

        100;


      statusEl.textContent =

        "Loading model " +

        percent.toFixed(0) +

        "%";

    }

  },


  function(error) {

    console.error(
      "MODEL LOAD ERROR:",
      error
    );


    statusEl.textContent =
      "GLB failed to load";


    hintEl.textContent =
      "Red cube should still appear.";

  }

);


// ========================================
// START CAMERA
// ========================================

let started =
  false;


async function startAR() {


  if (started) {

    return;

  }


  if (
    !window.isSecureContext
  ) {

    statusEl.textContent =
      "HTTPS required";

    return;

  }


  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    statusEl.textContent =
      "Camera API unavailable";

    return;

  }


  startButton.disabled =
    true;


  statusEl.textContent =
    "Opening camera...";


  hintEl.textContent =
    "Allow camera permission.";


  try {


    const stream =

      await navigator.mediaDevices
      .getUserMedia({

        audio: false,

        video: {

          facingMode: {

            ideal:
              "environment"

          },

          width: {

            ideal:
              1920

          },

          height: {

            ideal:
              1080

          }

        }

      });


    video.srcObject =
      stream;


    await video.play();


    started =
      true;


    startButton.classList.add(
      "hidden"
    );


    statusEl.textContent =
      "Camera ready ✓";


    hintEl.textContent =
      "Red cube + 3D model should be visible.";


    animate();


  }


  catch(error) {


    console.error(
      "CAMERA ERROR:",
      error
    );


    startButton.disabled =
      false;


    statusEl.textContent =

      "Camera error: " +

      (
        error.message ||
        error
      );


    hintEl.textContent =
      "Check browser camera permission.";

  }

}


// ========================================
// START BUTTON
// ========================================

startButton.addEventListener(

  "click",

  startAR

);


// ========================================
// ANIMATION LOOP
// ========================================

function animate() {


  requestAnimationFrame(
    animate
  );


  // Rotate red cube
  testCube.rotation.x +=
    0.01;

  testCube.rotation.y +=
    0.015;


  renderer.render(

    scene,

    camera

  );

}


// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener(

  "resize",

  () => {


    camera.aspect =

      window.innerWidth /

      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

      window.innerWidth,

      window.innerHeight

    );

  }

);


// ========================================
// CLEANUP
// ========================================

window.addEventListener(

  "pagehide",

  () => {


    if (
      video.srcObject
    ) {


      video.srcObject

        .getTracks()

        .forEach(

          track =>
            track.stop()

        );

    }

  }

);
