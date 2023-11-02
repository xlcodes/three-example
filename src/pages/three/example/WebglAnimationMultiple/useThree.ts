import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { onMounted, onUnmounted, reactive } from 'vue';
import { debug } from 'util';

export const useThree = () => {
  // GLFT 加载对象
  const GLFTLoading = reactive({
    loadText: '',
    loading: false,
  });

  let camera: THREE.PerspectiveCamera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let clock: THREE.Clock;
  let model: THREE.Group;
  let animations;

  const mixers: THREE.AnimationMixer[] = [];
  const objects = [];

  const params = {
    sharedSkeleton: false,
  };

  const init = (element: HTMLDivElement) => {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(2, 3, -6);
    camera.lookAt(0, 1, 0);

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: true }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const loader = new GLTFLoader();
    GLFTLoading.loading = true;
    loader.load(
      'models/gltf/Soldier.glb',
      (gltf) => {
        GLFTLoading.loading = false;
        GLFTLoading.loadText = '';
        model = gltf.scene;
        animations = gltf.animations;
        model.traverse((object: any) => {
          if (object.isMesh) object.castShadow = true;
        });
        setupDefaultScene();
      },
      (xhr) => {
        GLFTLoading.loadText = `模型加载进度：${Math.floor((xhr.loaded / xhr.total) * 100)}%，请稍等！`;
      },
      (error) => {
        GLFTLoading.loadText = '';
        GLFTLoading.loading = false;
        console.error(error);
      },
    );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    element.appendChild(renderer.domElement);

    const gui = new GUI();

    gui.add(params, 'sharedSkeleton').onChange(function () {
      clearScene();

      if (params.sharedSkeleton === true) {
        setupSharedSkeletonScene();
      } else {
        setupDefaultScene();
      }
    });

    gui.open();
  };

  const clearScene = () => {
    for (const mixer of mixers) {
      mixer.stopAllAction();
    }

    mixers.length = 0;

    for (const object of objects) {
      scene.remove(object);

      scene.traverse((child) => {
        if (child.isSkinnedMesh) child.skeleton.dispose();
      });
    }
  };

  const setupDefaultScene = () => {
    const model1 = SkeletonUtils.clone(model);
    const model2 = SkeletonUtils.clone(model);
    const model3 = SkeletonUtils.clone(model);

    model1.position.x = -2;
    model2.position.x = 0;
    model3.position.x = 2;

    const mixer1 = new THREE.AnimationMixer(model1);
    const mixer2 = new THREE.AnimationMixer(model2);
    const mixer3 = new THREE.AnimationMixer(model3);

    mixer1.clipAction(animations[0]).play(); // idle
    mixer2.clipAction(animations[1]).play(); // run
    mixer3.clipAction(animations[3]).play(); // walk

    scene.add(model1, model2, model3);
    objects.push(model1, model2, model3);
    mixers.push(mixer1, mixer2, mixer3);
  };

  const setupSharedSkeletonScene = () => {
    const sharedModel = SkeletonUtils.clone(model);
    const shareSkinnedMesh = sharedModel.getObjectByName('vanguard_Mesh');
    // @ts-ignore
    const sharedSkeleton = shareSkinnedMesh.skeleton;
    const sharedParentBone = sharedModel.getObjectByName('mixamorigHips');
    scene.add(sharedParentBone);

    const model1 = shareSkinnedMesh.clone();
    const model2 = shareSkinnedMesh.clone();
    const model3 = shareSkinnedMesh.clone();

    model1.bindMode = THREE.DetachedBindMode;
    model2.bindMode = THREE.DetachedBindMode;
    model3.bindMode = THREE.DetachedBindMode;

    const identity = new THREE.Matrix4();

    model1.bind(sharedSkeleton, identity);
    model2.bind(sharedSkeleton, identity);
    model3.bind(sharedSkeleton, identity);

    model1.position.x = -2;
    model2.position.x = 0;
    model3.position.x = 2;

    model1.scale.setScalar(0.01);
    model1.rotation.x = -Math.PI * 0.5;
    model2.scale.setScalar(0.01);
    model2.rotation.x = -Math.PI * 0.5;
    model3.scale.setScalar(0.01);
    model3.rotation.x = -Math.PI * 0.5;

    const mixer = new THREE.AnimationMixer(sharedParentBone);
    mixer.clipAction(animations[1]).play();

    scene.add(sharedParentBone, model1, model2, model3);

    objects.push(sharedParentBone, model1, model2, model3);
    mixers.push(mixer);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    for (const mixer of mixers) {
      mixer.update(delta);
    }
    renderer.render(scene, camera);
  };

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  return {
    init,
    animate,
    GLFTLoading,
  };
};
