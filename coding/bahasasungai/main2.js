import { loadGLTF, loadAudio } from "../../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    try {
      // Initialize MindAR instance
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.body,
        imageTargetSrc: '../../assets/targets/melodieverglade.mind',
      });

      const { renderer, scene, camera } = mindarThree;

      // Add hemisphere light to the scene
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      // Create a single AudioListener
      const listener = new THREE.AudioListener();
      camera.add(listener);

      const setupScene = async (index, modelPath, audioPath, scale, position, rotation) => {
        try {
          console.log(`Loading model from: ${modelPath}`);
          const gltf = await loadGLTF(modelPath);
          const sceneObject = gltf.scene;
          sceneObject.scale.set(scale.x, scale.y, scale.z);
          sceneObject.position.set(position.x, position.y, position.z);
          sceneObject.rotation.set(rotation.x, rotation.y, rotation.z);

          const anchor = mindarThree.addAnchor(index);
          anchor.group.add(sceneObject);

          console.log(`Loading audio from: ${audioPath}`);
          const audioClip = await loadAudio(audioPath);
          const audio = new THREE.PositionalAudio(listener);
          anchor.group.add(audio);

          audio.setBuffer(audioClip);
          audio.setRefDistance(10000);
          audio.setLoop(true);

          anchor.onTargetFound = () => {
            console.log(`Target found for scene ${index + 1}`);
            audio.play();
          };

          anchor.onTargetLost = () => {
            console.log(`Target lost for scene ${index + 1}`);
            audio.stop();
          };

          const mixer = new THREE.AnimationMixer(sceneObject);
          if (gltf.animations.length > 0) {
            console.log(`Animations for scene ${index + 1} loaded`);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          } else {
            console.warn(`No animations found for scene ${index + 1}`);
          }

          return { mixer, sceneObject, audio, animations: gltf.animations };
        } catch (error) {
          console.error(`Error setting up scene ${index + 1}:`, error);
        }
      };

      const scenes = [];

      // Load all scenes
      scenes.push(await setupScene(0, '../../assets/models/group2/scene1.glb', '../../assets/sounds/bahasasungai/bs1.mp3', { x: 0.030, y: 0.030, z: 0.030 }, { x: 0.0, y: -0.2, z: 0 }, { x: 0.0, y: -1.0, z: 0.0 }));
      scenes.push(await setupScene(1, '../../assets/models/group2/scene2.glb', '../../assets/sounds/bahasasungai/bs2.mp3', { x: 0.030, y: 0.030, z: 0.030 }, { x: 0.0, y: -0.4, z: 0 }, { x: 0.0, y: -1.0, z: 0.0 }));
      scenes.push(await setupScene(2, '../../assets/models/group2/scene3.glb', '../../assets/sounds/bahasasungai/bs3.mp3', { x: 0.2, y: 0.2, z: 0.2 }, { x: 0.0, y: -0.2, z: 0 }, { x: 0.0, y: -0.7, z: 0.0 }));
      scenes.push(await setupScene(3, '../../assets/models/group2/scene4.glb', '../../assets/sounds/bahasasungai/bs4.mp3', { x: 0.030, y: 0.030, z: 0.030 }, { x: 0.0, y: -0.4, z: 0 }, { x: 0.0, y: -1.0, z: 0.0 }));
      scenes.push(await setupScene(4, '../../assets/models/group2/scene5.glb', '../../assets/sounds/bahasasungai/bs5.mp3', { x: 0.2, y: 0.2, z: 0.2 }, { x: 0.0, y: -0.2, z: 0 }, { x: 0.0, y: -0.7, z: 0.0 }));
      scenes.push(await setupScene(5, '../../assets/models/group2/scene6.glb', '../../assets/sounds/bahasasungai/bs6.mp3', { x: 0.4, y: 0.4, z: 0.4 }, { x: 0.0, y: -2.3, z: 0 }, { x: 0.0, y: -1.2, z: 0.0 }));
      scenes.push(await setupScene(6, '../../assets/models/group2/scene7.glb', '../../assets/sounds/bahasasungai/bs7.mp3', { x: 0.4, y: 0.4, z: 0.4 }, { x: -1.2, y: -0.8, z: 0 }, { x: 0.2, y: -1.0, z: 0.0 }));
      scenes.push(await setupScene(7, '../../assets/models/group2/scene8.glb', '../../assets/sounds/bahasasungai/bs8.mp3', { x: 0.4, y: 0.4, z: 0.4 }, { x: -2.0, y: -1.0, z: 0 }, { x: 0.0, y: -1.3, z: 0.0 }));
      scenes.push(await setupScene(8, '../../assets/models/group2/scene9.glb', '../../assets/sounds/bahasasungai/bs9.mp3', { x: 0.2, y: 0.2, z: 0.2 }, { x: -1.0, y: -0.4, z: 0 }, { x: 0.0, y: 0.0, z: 0.0 }));
      scenes.push(await setupScene(9, '../../assets/models/group2/scene10.glb', '../../assets/sounds/bahasasungai/bs10.mp3', { x: 0.05, y: 0.05, z: 0.05 }, { x: 0.0, y: -0.4, z: 0 }, { x: 0.0, y: 0.0, z: 0.0 }));

      // Reduce the FOV for more zoom effect for scene 10
      camera.fov = 30;
      camera.updateProjectionMatrix();

      // Clock to manage animations
      const clock = new THREE.Clock();

      // Raycaster and pointer setup for interaction in scene 1
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let currentClipIndex = 0; // Start with the first animation clip

      // Add event listener for pointer down
      window.addEventListener('pointerdown', (event) => {
        // Normalize pointer coordinates
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Use raycaster to detect if the model is tapped
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scenes[0].sceneObject.children, true);

        if (intersects.length > 0 && scenes[0].animations.length > 0) {
          // Stop the previous action
          scenes[0].mixer.stopAllAction();

          // Play the next animation clip
          const clip = scenes[0].animations[currentClipIndex];
          const action = scenes[0].mixer.clipAction(clip);
          action.reset(); // Reset the clip
          action.play(); // Play the clip

          // Log the current clip index and total clips
          console.log(`Playing clip: ${currentClipIndex + 1} of ${scenes[0].animations.length}`);

          // Move to the next clip or loop back to the first one
          currentClipIndex = (currentClipIndex + 1) % scenes[0].animations.length;
        }
      });

      // Start MindAR
      await mindarThree.start();
      console.log("MindARThree started");

      // Animation loop
      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();

        // Update animation mixers for all scenes
        scenes.forEach(scene => {
          if (scene && scene.mixer) scene.mixer.update(delta);
        });

        renderer.render(scene, camera);
      });
    } catch (error) {
      console.error("Error initializing AR experience:", error);
    }
  };

  start();
});