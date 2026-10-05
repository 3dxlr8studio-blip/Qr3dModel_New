import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const statusEl = document.querySelector("#status");
const startBtn = document.querySelector("#start");
const hintEl = document.querySelector("#hint");

const mindarThree = new MindARThree({
  container: document.querySelector("#ar-container"),

  // For this starter, this is MindAR's official sample target.
  // Later replace this URL with your own self-hosted file:
  // imageTargetSrc: "./targets/target.mind"
  imageTargetSrc:
    "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind",

  maxTrack: 1,
  uiLoading: "no",
  uiScanning: "no",
  uiError: "no"
});

const { renderer, scene, camera } = mindarThree;

renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.4));

const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(1.5, 2.5, 3);
scene.add(key);

const anchor = mindarThree.addAnchor(0);

const modelRoot = new THREE.Group();
anchor.group.add(modelRoot);

const loader = new GLTFLoader();

loader.load(
  "./models/model.glb",
  (gltf) => {
    const model = gltf.scene;
    modelRoot.add(model);

    // Adjust these values for your real model.
    model.scale.setScalar(0.8);
    model.position.set(0, 0, 0.25);
    model.rotation.set(Math.PI / 2, 0, 0);

    statusEl.textContent = "Model ready. Start AR.";
  },
  undefined,
  (err) => {
    console.error(err);

    // Visible fallback if the GLB is missing/broken.
    const geometry = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const material = new THREE.MeshStandardMaterial({ color: 0x35a7ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0.25);
    modelRoot.add(cube);

    statusEl.textContent = "Demo object ready. Start AR.";
  }
);

anchor.onTargetFound = () => {
  statusEl.textContent = "Target found ✓";
  hintEl.textContent = "Move the phone slowly; the model is locked to the image.";
};

anchor.onTargetLost = () => {
  statusEl.textContent = "Target lost — point back at the image";
  hintEl.textContent = "Point the camera at the target image again.";
};

async function startAR() {
  startBtn.disabled = true;
  statusEl.textContent = "Opening camera…";

  try {
    await mindarThree.start();

    startBtn.classList.add("hidden");
    statusEl.textContent = "Camera ready — point at the target image";
    hintEl.textContent = "Use the supplied MindAR sample target for this prototype.";

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.error(err);
    startBtn.disabled = false;
    statusEl.textContent =
      "Camera could not start. Use HTTPS and allow camera permission.";
  }
}

startBtn.addEventListener("click", startAR);

window.addEventListener("beforeunload", () => {
  try { mindarThree.stop(); } catch (_) {}
});
