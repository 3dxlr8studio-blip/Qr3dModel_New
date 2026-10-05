import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container =
  document.querySelector("#ar-container");

const startButton =
  document.querySelector("#start");

const statusEl =
  document.querySelector("#status");

const hintEl =
  document.querySelector("#hint");


// ==============================
// THREE.JS SETUP
// ==============================

const scene =
  new THREE.Scene();

const camera =
  new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );

camera.position.set(0, 0, 0);


// ==============================
// RENDERER
// ==============================

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
  Math.min(window.devicePixelRatio, 2)
);

renderer.domElement.style.position =
  "fixed";

renderer.domElement.style.top =
  "0";

renderer.domElement.style.left =
  "0";

renderer.domElement.style.width =
  "100%";

renderer.domElement.style.height =
  "100%";

renderer.domElement.style.zIndex =
  "1";

renderer.domElement.style.pointerEvents =
  "none";

container.appendChild(
  renderer.domElement
);


// ==============================
// CAMERA VIDEO
// ==============================

const video =
  document.createElement("video");

video.autoplay = true;
video.muted = true;
video.playsInline = true;

video.style.position =
  "fixed";

video.style.top =
  "0";

video.style.left =
  "0";

video.style.width =
  "100%";

video.style.height =
  "100%";

video.style.objectFit =
  "cover";

video.style.zIndex =
  "0";

container.appendChild(
  video
);


// ==============================
// LIGHTING
// ==============================

const ambient =
  new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2
  );

scene.add(ambient);


const light =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

light.position.set(
  2,
  3,
  4
);

scene.add(light);


// ==============================
// LOAD MODEL
// ==============================

const modelContainer =
  new THREE.Group();

scene.add(
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


    model.scale.set(
      0.5,
      0.5,
      0.5
    );


    model.position.set(
      0,
      -0.3,
      -2
    );


    model.rotation.set(
      0,
      0,
      0
    );


    statusEl.textContent =
      "Model ready — press Start AR";

  },


  undefined,


  function(error) {

    console.error(
      "MODEL ERROR:",
      error
    );


    // fallback test cube

    const cube =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.6,
          0.6,
          0.6
        ),

        new THREE.MeshStandardMaterial({
          color: 0xff0000
        })

      );


    cube.position.set(
      0,
      0,
      -2
    );


    modelContainer.add(
      cube
    );


    statusEl.textContent =
      "Demo cube ready";

  }

);


// ==============================
// START CAMERA
// ==============================

async function startAR() {

  startButton.classList.add(
    "hidden"
  );


  statusEl.textContent =
    "Opening camera…";


  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({

        audio: false,

        video: {
          facingMode: {
            ideal: "environment"
          }
        }

      });


    video.srcObject =
      stream;


    await video.play();


    statusEl.textContent =
      "Camera ready";


    hintEl.textContent =
      "3D model should appear in front of you.";


    animate();

  }


  catch(error) {

    console.error(error);


    statusEl.textContent =
      "Camera error: " +
      error.message;


    startButton.classList.remove(
      "hidden"
    );

  }

}


// ==============================
// BUTTON
// ==============================

startButton.addEventListener(

  "click",

  startAR

);


// ==============================
// ANIMATION LOOP
// ==============================

function animate() {

  requestAnimationFrame(
    animate
  );


  renderer.render(
    scene,
    camera
  );

}


// ==============================
// RESIZE
// ==============================

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
