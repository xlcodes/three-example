import * as THREE from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import { useThreeBase } from '@/hooks/useThreeBase';

export const useThree = () => {
  const { scene, renderer } = useThreeBase();

  const camera = ref<THREE.ArrayCamera>();

  const AMOUNT = 6;

  let mesh: THREE.Mesh;

  const init = () => {
    const ASPECT_RATIO = window.innerWidth / window.innerHeight;
    const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

    const cameras = [];

    for (let y = 0; y < AMOUNT; y++) {
      for (let x = 0; x < AMOUNT; x++) {
        const subCamera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
        // @ts-ignore
        subCamera.viewport = new THREE.Vector4(
          Math.floor(x * WIDTH),
          Math.floor(y * HEIGHT),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT),
        );
        subCamera.position.x = x / AMOUNT - 0.5;
        subCamera.position.y = 0.5 - y / AMOUNT;
        subCamera.position.z = 1.5;
        subCamera.position.multiplyScalar(2);
        subCamera.lookAt(0, 0, 0);
        subCamera.updateMatrixWorld();

        cameras.push(subCamera);
      }
    }

    camera.value = new THREE.ArrayCamera(cameras);
    camera.value.position.z = 3;

    scene.add(new THREE.AmbientLight(0x999999));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    scene.add(light);

    // 创建平面
    const geometryBackground = new THREE.PlaneGeometry(100, 100);
    // MeshPhongMaterial: 一种用于具有镜面高光的光泽表面材质
    const materialBackground = new THREE.MeshPhongMaterial({ color: 0x000066 });

    const background = new THREE.Mesh(geometryBackground, materialBackground);
    background.receiveShadow = true;
    background.position.set(0, 0, -1);
    scene.add(background);

    const geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    mesh = new THREE.Mesh(geometryCylinder, materialCylinder);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    renderer.shadowMap.enabled = true;
  };

  const onWindowResize = () => {
    const ASPECT_RATIO = window.innerWidth / window.innerHeight;
    const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

    camera.value.aspect = ASPECT_RATIO;
    camera.value.updateProjectionMatrix();

    for (let y = 0; y < AMOUNT; y++) {
      for (let x = 0; x < AMOUNT; x++) {
        const subCamera = camera.value.cameras[AMOUNT * y + x];
        // @ts-ignore
        subCamera.viewport.set(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));
        subCamera.aspect = ASPECT_RATIO;
        subCamera.updateProjectionMatrix();
      }
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    mesh.rotation.x += 0.005;
    mesh.rotation.z += 0.01;

    renderer.render(scene, camera.value);
    requestAnimationFrame(animate);
  };

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  return {
    renderer,
    init,
    animate,
  };
};
