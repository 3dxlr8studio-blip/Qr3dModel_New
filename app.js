import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


// ========================================
// HTML ELEMENTS
// ========================================

const container = document.querySelector("#ar-container");
const startButton = document.querySelector("#start");
const statusEl = document.querySelector("#status");
const hintEl = document.querySelector("#hint");

statusEl.textContent = "JavaScript loaded";


// ========================================
// THREE SCENE
// ========================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

camera.position.set(0, 0, 0);


// ========================================
// RENDERER
// ========================================

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setClearColor(
  0x000000,
  0
);

renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.width = "100vw";
renderer.domElement.style.height = "100vh";
renderer.domElement.style.zIndex = "2";
renderer.domElement.style.pointerEvents = "none";

container.appendChild(renderer.domElement);


// ========================================
// PHONE CAMERA VIDEO
// ========================================

const video = document.createElement("video");

video.autoplay = true;
video.muted = true;
video.playsInline = true;

video.setAttribute(
  "playsinline",
  ""
);

video.style.position = "fixed";
video.style.inset = "0";
video.style.width = "100vw";
video.style.height = "100vh";
video.style.objectFit = "cover";
video.style.zIndex = "0";

container.appendChild(video);


// ========================================
// LIGHTING
// ========================================

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x555555,
    3
  )
);

const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    4
  );

directionalLight.position.set(
  2,
  3,
  4
);

scene.add(directionalLight);


// ========================================
// CREATE ANCHOR
// ========================================

const anchor = new THREE.Group();

anchor.position.set(
  0,
  0,
  -2
);

scene.add(anchor);


// ========================================
// ANCHOR RING
// ========================================

const anchorRing =
  new THREE.Mesh(

    new THREE.RingGeometry(
      0.42,
      0.48,
      48
    ),

    new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide
    })

  );

anchorRing.position.set(
  0,
  -0.65,
  0
);

anchor.add(anchorRing);


// ========================================
// LOAD MODEL
// ========================================

const loader = new GLTFLoader();

let model = null;

loader.load(

  "./models/model.glb",

  function(gltf) {

    console.log("MODEL LOADED");

    model = gltf.scene;

    anchor.add(model);


    // -------------------------------
    // GET MODEL SIZE
    // -------------------------------

    const box =
      new THREE.Box3()
      .setFromObject(model);

    const size =
      new THREE.Vector3();

    box.getSize(size);


    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    // -------------------------------
    // AUTO SCALE
    // -------------------------------

    if (maxDimension > 0) {

      const desiredSize = 1;

      const scale =
        desiredSize /
        maxDimension;

      model.scale.setScalar(scale);

    }


    // -------------------------------
    // RECALCULATE AFTER SCALE
    // -------------------------------

    const scaledBox =
      new THREE.Box3()
      .setFromObject(model);

    const center =
      new THREE.Vector3();

    scaledBox.getCenter(center);


    // -------------------------------
    // CENTER MODEL ON ANCHOR
    // -------------------------------

    model.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // Raise slightly above anchor
    model.position.y += 0.15;


    model.rotation.set(
      0,
      0,
      0
    );


    statusEl.textContent =
      "Model anchored ✓";

    hintEl.textContent =
      "Press Start AR Camera";

  },


  function(progress) {

    if (progress.total) {

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
      "MODEL ERROR:",
      error
    );


    statusEl.textContent =
      "Model failed to load";


    // Fallback cube

    const cube =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.5,
          0.5,
          0.5
        ),

        new THREE.MeshStandardMaterial({
          color: 0xff0000
        })

      );


    cube.position.set(
      0,
      0,
      0
    );


    anchor.add(cube);


    hintEl.textContent =
      "Red cube shown instead.";

  }

);


// ========================================
// START CAMERA
// ========================================

let started = false;

async function startAR() {

  if (started) return;


  statusEl.textContent =
    "Opening camera...";


  try {

    const stream =
      await navigator.mediaDevices
      .getUserMedia({

        audio: false,

        video: {
          facingMode: {
            ideal: "environment"
          }
        }

      });


    video.srcObject = stream;

    await video.play();


    started = true;


    startButton.classList.add(
      "hidden"
    );


    statusEl.textContent =
      "Camera ready ✓";


    hintEl.textContent =
      "Model is attached to anchor";


    animate();

  }


  catch(error) {

    console.error(
      "CAMERA ERROR:",
      error
    );


    statusEl.textContent =
      "Camera error: " +
      error.message;

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
// RENDER LOOP
// ========================================

function animate() {

  requestAnimationFrame(
    animate
  );


  renderer.render(
    scene,
    camera
  );

}


// ========================================
// RESIZE
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

    if (video.srcObject) {

      video.srcObject
        .getTracks()
        .forEach(
          track => track.stop()
        );

    }

  }
);
