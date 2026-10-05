// ==============================
// LOAD MODEL
// ==============================

const loader = new GLTFLoader();

loader.load(

  "./models/model.glb",

  function(gltf) {

    console.log("MODEL LOADED SUCCESSFULLY");

    const model = gltf.scene;

    scene.add(model);


    // --------------------------------
    // AUTOMATICALLY CENTER THE MODEL
    // --------------------------------

    const box =
      new THREE.Box3().setFromObject(model);

    const size =
      new THREE.Vector3();

    const center =
      new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);


    // Move model origin to center
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;


    // --------------------------------
    // AUTOMATIC SCALE
    // --------------------------------

    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    const desiredSize = 1;

    const scale =
      desiredSize /
      maxDimension;


    model.scale.setScalar(scale);


    // --------------------------------
    // PLACE IN FRONT OF CAMERA
    // --------------------------------

    model.position.z -= 2;


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
      "3D model should be visible in front of you.";


    console.log(
      "MODEL SIZE:",
      size
    );

    console.log(
      "MODEL SCALE:",
      scale
    );

  },


  function(progress) {

    if (progress.total) {

      const percent =
        progress.loaded /
        progress.total *
        100;

      console.log(
        "Loading:",
        percent.toFixed(0) + "%"
      );

    }

  },


  function(error) {

    console.error(
      "MODEL LOAD ERROR:",
      error
    );


    statusEl.textContent =
      "GLB failed to load";


    // TEST CUBE

    const cube =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.7,
          0.7,
          0.7
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


    scene.add(cube);


    hintEl.textContent =
      "GLB failed. Red test cube shown.";

  }

);
