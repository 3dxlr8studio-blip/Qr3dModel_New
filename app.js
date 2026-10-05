import * as THREE from "three";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


// ======================================================
// UI
// ======================================================

const startButton =
  document.querySelector("#start");

const statusEl =
  document.querySelector("#status");

const hintEl =
  document.querySelector("#hint");


statusEl.textContent =
  "Checking WebXR...";


// ======================================================
// THREE.JS SETUP
// ======================================================

const scene =
  new THREE.Scene();


const camera =
  new THREE.PerspectiveCamera();


scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x555555,
    2.5
  )
);


const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );


directionalLight.position.set(
  1,
  2,
  3
);


scene.add(
  directionalLight
);


// ======================================================
// RENDERER
// ======================================================

const renderer =
  new THREE.WebGLRenderer({

    alpha: true,

    antialias: true

  });


renderer.setPixelRatio(

  Math.min(
    window.devicePixelRatio,
    2
  )

);


renderer.setSize(

  window.innerWidth,

  window.innerHeight

);


renderer.xr.enabled =
  true;


renderer.setClearColor(
  0x000000,
  0
);


document.body.appendChild(
  renderer.domElement
);


// ======================================================
// RETICLE
// ======================================================

const reticle =
  new THREE.Mesh(

    new THREE.RingGeometry(
      0.08,
      0.11,
      32
    )
    .rotateX(
      -Math.PI / 2
    ),

    new THREE.MeshBasicMaterial({

      color:
        0x00ff88,

      side:
        THREE.DoubleSide

    })

  );


reticle.matrixAutoUpdate =
  false;


reticle.visible =
  false;


scene.add(
  reticle
);


// ======================================================
// MODEL VARIABLES
// ======================================================

let model =
  null;


let modelReady =
  false;


let modelScale =
  1;


// Model position inside its own local group
let modelLocalOffset =
  new THREE.Vector3();


// ======================================================
// MODEL PIVOT
// ======================================================
//
// We place this group at the hit-test position.
// The GLB itself stays inside it.
//
// This is safer than directly applying the reticle
// transform to the GLB.

const modelAnchor =
  new THREE.Group();


modelAnchor.visible =
  false;


scene.add(
  modelAnchor
);


// ======================================================
// LOAD GLB
// ======================================================

const loader =
  new GLTFLoader();


loader.load(

  "./models/model.glb",


  function(gltf) {


    console.log(
      "MODEL LOADED"
    );


    model =
      gltf.scene;


    modelAnchor.add(
      model
    );


    // ==================================================
    // ORIGINAL SIZE
    // ==================================================

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


    const maxDimension =
      Math.max(

        size.x,

        size.y,

        size.z

      );


    // ==================================================
    // AUTO SCALE
    // ==================================================

    if (
      maxDimension > 0
    ) {


      const desiredSize =
        0.6;


      modelScale =
        desiredSize /
        maxDimension;


      model.scale.setScalar(
        modelScale
      );

    }


    // ==================================================
    // RECALCULATE AFTER SCALE
    // ==================================================

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


    // ==================================================
    // PLACE MODEL BASE ON Y=0
    // ==================================================

    model.position.set(

      -center.x,

      -scaledBox.min.y,

      -center.z

    );


    modelLocalOffset.copy(
      model.position
    );


    model.rotation.set(
      0,
      0,
      0
    );


    modelReady =
      true;


    statusEl.textContent =
      "Model ready — Start AR";


    hintEl.textContent =
      "Tap Start AR, then move phone around.";

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
      "Model failed to load";


    hintEl.textContent =
      "Check models/model.glb";

  }

);


// ======================================================
// XR VARIABLES
// ======================================================

let xrSession =
  null;


let referenceSpace =
  null;


let viewerSpace =
  null;


let hitTestSource =
  null;


let placed =
  false;


// Store the latest detected pose
let currentHitPose =
  null;


// ======================================================
// CHECK XR SUPPORT
// ======================================================

async function checkXR() {


  if (
    !window.isSecureContext
  ) {


    statusEl.textContent =
      "HTTPS required";


    hintEl.textContent =
      "WebXR requires HTTPS.";


    startButton.disabled =
      true;


    return;

  }


  if (
    !navigator.xr
  ) {


    statusEl.textContent =
      "WebXR unavailable";


    hintEl.textContent =
      "Use Android Chrome on an ARCore-compatible phone.";


    startButton.disabled =
      true;


    return;

  }


  try {


    const supported =

      await navigator.xr
      .isSessionSupported(
        "immersive-ar"
      );


    if (
      supported
    ) {


      statusEl.textContent =
        modelReady
          ? "Ready — Start AR"
          : "WebXR supported ✓";


      startButton.disabled =
        false;

    }


    else {


      statusEl.textContent =
        "Immersive AR not supported";


      hintEl.textContent =
        "This phone/browser does not support WebXR AR.";


      startButton.disabled =
        true;

    }

  }


  catch(error) {


    console.error(
      "XR SUPPORT CHECK ERROR:",
      error
    );


    statusEl.textContent =
      "Could not check WebXR";


    startButton.disabled =
      true;

  }

}


// ======================================================
// START AR
// ======================================================

async function startAR() {


  if (
    xrSession
  ) {

    return;

  }


  try {


    statusEl.textContent =
      "Starting AR...";


    hintEl.textContent =
      "Allow AR/camera permission.";


    xrSession =

      await navigator.xr
      .requestSession(

        "immersive-ar",

        {

          requiredFeatures: [

            "hit-test"

          ],

          optionalFeatures: [

            "anchors",

            "dom-overlay",

            "local-floor"

          ],

          domOverlay: {

            root:
              document.body

          }

        }

      );


    // ==================================================
    // CONNECT SESSION TO THREE
    // ==================================================

    await renderer.xr.setSession(
      xrSession
    );


    // ==================================================
    // REFERENCE SPACES
    // ==================================================

    try {


      referenceSpace =

        await xrSession
        .requestReferenceSpace(
          "local-floor"
        );


    }


    catch(error) {


      console.warn(
        "local-floor unavailable, using local"
      );


      referenceSpace =

        await xrSession
        .requestReferenceSpace(
          "local"
        );

    }


    viewerSpace =

      await xrSession
      .requestReferenceSpace(
        "viewer"
      );


    // ==================================================
    // HIT TEST SOURCE
    // ==================================================

    hitTestSource =

      await xrSession
      .requestHitTestSource({

        space:
          viewerSpace

      });


    // ==================================================
    // UI
    // ==================================================

    startButton.classList.add(
      "hidden"
    );


    statusEl.textContent =
      "Searching for surface...";


    hintEl.textContent =
      "Move phone slowly over a floor or table.";


    placed =
      false;


    currentHitPose =
      null;


    modelAnchor.visible =
      false;


    // ==================================================
    // TAP EVENT
    // ==================================================

    xrSession.addEventListener(
      "select",
      placeModel
    );


    // ==================================================
    // END EVENT
    // ==================================================

    xrSession.addEventListener(

      "end",

      onSessionEnd

    );


    // ==================================================
    // RENDER LOOP
    // ==================================================

    renderer.setAnimationLoop(
      renderXR
    );


  }


  catch(error) {


    console.error(
      "XR START ERROR:",
      error
    );


    xrSession =
      null;


    statusEl.textContent =

      "AR error: " +

      (
        error?.message ||
        error
      );


    hintEl.textContent =
      "Check Chrome, ARCore support, camera permission, and HTTPS.";


    startButton.classList.remove(
      "hidden"
    );

  }

}


// ======================================================
// XR FRAME LOOP
// ======================================================

function renderXR(

  time,

  frame

) {


  if (
    frame &&
    hitTestSource &&
    referenceSpace &&
    !placed
  ) {


    const results =

      frame.getHitTestResults(
        hitTestSource
      );


    if (
      results.length > 0
    ) {


      const hit =
        results[0];


      const pose =
        hit.getPose(
          referenceSpace
        );


      if (
        pose
      ) {


        currentHitPose =
          pose;


        reticle.visible =
          true;


        reticle.matrix.fromArray(
          pose.transform.matrix
        );


        statusEl.textContent =
          "Surface found ✓";


        hintEl.textContent =
          "Tap screen to place the model.";

      }

    }


    else {


      currentHitPose =
        null;


      reticle.visible =
        false;


      statusEl.textContent =
        "Searching for surface...";


      hintEl.textContent =
        "Move phone slowly over floor or table.";

    }

  }


  renderer.render(
    scene,
    camera
  );

}


// ======================================================
// PLACE MODEL
// ======================================================

function placeModel() {


  if (
    placed ||
    !modelReady ||
    !currentHitPose
  ) {


    return;

  }


  const transform =
    currentHitPose.transform;


  // ==================================================
  // POSITION
  // ==================================================

  modelAnchor.position.set(

    transform.position.x,

    transform.position.y,

    transform.position.z

  );


  // ==================================================
  // ORIENTATION
  // ==================================================

  modelAnchor.quaternion.set(

    transform.orientation.x,

    transform.orientation.y,

    transform.orientation.z,

    transform.orientation.w

  );


  // ==================================================
  // IMPORTANT:
  // KEEP MODEL SCALE + LOCAL OFFSET
  // ==================================================

  model.scale.setScalar(
    modelScale
  );


  model.position.copy(
    modelLocalOffset
  );


  // ==================================================
  // SHOW MODEL
  // ==================================================

  modelAnchor.visible =
    true;


  placed =
    true;


  reticle.visible =
    false;


  statusEl.textContent =
    "Model placed ✓";


  hintEl.textContent =
    "Walk around it — it should stay in this world position.";

}


// ======================================================
// END XR
// ======================================================

function onSessionEnd() {


  renderer.setAnimationLoop(
    null
  );


  xrSession =
    null;


  referenceSpace =
    null;


  viewerSpace =
    null;


  hitTestSource =
    null;


  currentHitPose =
    null;


  placed =
    false;


  reticle.visible =
    false;


  modelAnchor.visible =
    false;


  startButton.classList.remove(
    "hidden"
  );


  statusEl.textContent =
    "AR ended";


  hintEl.textContent =
    "Press Start AR to begin again.";

}


// ======================================================
// START BUTTON
// ======================================================

startButton.addEventListener(
  "click",
  startAR
);


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(

  "resize",

  function() {


    renderer.setSize(

      window.innerWidth,

      window.innerHeight

    );

  }

);


// ======================================================
// INITIAL CHECK
// ======================================================

startButton.disabled =
  true;


checkXR();
