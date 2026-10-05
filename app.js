const sceneEl = document.querySelector("#arScene");
const startButton = document.querySelector("#startButton");
const statusEl = document.querySelector("#status");
const helpEl = document.querySelector("#help");
const targetEl = document.querySelector("#target");

let arStarted = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function setHelp(text) {
  helpEl.textContent = text;
}

async function waitForScene() {
  if (sceneEl.hasLoaded) return;

  await new Promise((resolve) => {
    sceneEl.addEventListener("loaded", resolve, { once: true });
  });
}

async function startAR() {
  if (arStarted) return;

  startButton.disabled = true;

  setStatus("Checking camera...");
  setHelp("Please allow camera permission when your browser asks.");

  try {
    if (!window.isSecureContext) {
      throw new Error("This page must be opened over HTTPS.");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera access is not supported in this browser.");
    }

    await waitForScene();

    const mindarSystem =
      sceneEl.systems["mindar-image-system"];

    if (!mindarSystem) {
      throw new Error("MindAR did not load correctly.");
    }

    setStatus("Opening camera...");

    await mindarSystem.start();

    arStarted = true;

    startButton.classList.add("hidden");

    setStatus("Camera ready — find the target image");
    setHelp("Point the phone at the test target image.");

  } catch (error) {
    console.error("AR START ERROR:", error);

    startButton.disabled = false;
    startButton.classList.remove("hidden");

    setStatus(
      "AR error: " +
      (error && error.message ? error.message : String(error))
    );

    setHelp(
      "Open directly in Chrome on Android or Safari on iPhone, then allow camera access."
    );
  }
}

startButton.addEventListener("click", startAR);


targetEl.addEventListener("targetFound", () => {
  setStatus("Target found ✓");

  setHelp(
    "3D model is now attached to the target image."
  );
});


targetEl.addEventListener("targetLost", () => {
  if (!arStarted) return;

  setStatus("Target lost");

  setHelp(
    "Point the camera back at the target image."
  );
});


sceneEl.addEventListener("arReady", () => {
  console.log("MindAR AR ready");
});


sceneEl.addEventListener("arError", (event) => {
  console.error("MindAR AR error:", event);

  setStatus("MindAR camera error");

  setHelp(
    "Check camera permission, HTTPS, and browser compatibility."
  );

  startButton.disabled = false;
  startButton.classList.remove("hidden");
});


window.addEventListener("pagehide", () => {
  try {
    const mindarSystem =
      sceneEl.systems["mindar-image-system"];

    if (mindarSystem && arStarted) {
      mindarSystem.stop();
    }
  } catch (error) {
    console.warn(error);
  }
});
