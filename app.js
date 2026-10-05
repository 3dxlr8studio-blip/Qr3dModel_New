// ==============================
// CREATE ANCHOR
// ==============================

const anchor = new THREE.Group();

// Place anchor in front of camera
anchor.position.set(
  0,
  0,
  -2
);

scene.add(anchor);


// ==============================
// OPTIONAL ANCHOR MARKER
// ==============================
// Small ring so you can see where anchor is.

const anchorRing = new THREE.Mesh(

  new THREE.RingGeometry(
    0.45,
    0.5,
    48
  ),

  new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    side: THREE.DoubleSide
  })

);

anchorRing.position.set(
  0,
  -0.6,
  0
);

anchor.add(anchorRing);


// ==============================
// LOAD MODEL
// ==============================

const loader = new GLTFLoader();

let model = null;

loader.load(

  "./models/model.glb",

  function(gltf) {

    console.log("MODEL LOADED");

    model = gltf.scene;


    // IMPORTANT:
    // model is added to anchor,
    // NOT directly to scene

    anchor.add(model);


    // ==============================
    // GET SIZE
    // ==============================

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


    // ==============================
    // AUTO SCALE
    // ==============================

    if (maxDimension > 0) {

      const desiredSize = 1;

      const scale =
        desiredSize /
        maxDimension;

      model.scale.setScalar(scale);

    }


    // ==============================
    // CENTER MODEL
    // ==============================

    const scaledBox =
      new THREE.Box3()
      .setFromObject(model);

    const center =
      new THREE.Vector3();

    scaledBox.getCenter(center);


    model.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    // raise model slightly
    model.position.y += 0.1;


    model.rotation.set(
      0,
      0,
      0
    );


    statusEl.textContent =
      "Model anchored ✓";

    hintEl.textContent =
      "3D model is attached to the anchor.";

  },


  undefined,


  function(error) {

    console.error(
      "MODEL ERROR:",
      error
    );


    statusEl.textContent =
      "Model failed to load";

  }

);
