import * as THREE from 'three';
import { onMounted, onUnmounted } from 'vue';

interface IThreeParams {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  plane: THREE.Mesh;
  pointer: THREE.Vector2;
  raycaster: THREE.Raycaster;
  cubeMaterial: THREE.MeshBasicMaterial;
  rollOverMesh: THREE.Mesh;
  cubeGeo: THREE.BoxGeometry;
  rollOverMaterial: THREE.MeshBasicMaterial;
  isShiftDown: boolean;
  isEditor: boolean;
}

export const useThree = () => {
  const params: Partial<IThreeParams> = {
    isEditor: false,
    isShiftDown: false,
  };

  const objects: Array<THREE.Mesh> = [];

  const init = (element: HTMLDivElement) => {
    params.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    params.camera.position.set(500, 800, 1300);
    params.camera.lookAt(0, 0, 0);

    params.scene = new THREE.Scene();
    params.scene.background = new THREE.Color(0xf0f0f0);

    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    params.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    params.rollOverMesh = new THREE.Mesh(rollOverGeo, params.rollOverMaterial);
    params.scene.add(params.rollOverMesh);

    const cubeTexture = new THREE.TextureLoader().load('/textures/square-outline-textured.png');
    cubeTexture.colorSpace = THREE.SRGBColorSpace;

    params.cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    params.cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xfeb74c, map: cubeTexture });

    // 网格辅助对象
    const gridHelper = new THREE.GridHelper(1000, 20);
    params.scene.add(gridHelper);

    params.raycaster = new THREE.Raycaster();
    params.pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);

    params.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    params.scene.add(params.plane);

    objects.push(params.plane);

    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    params.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    params.scene.add(directionalLight);

    params.renderer = new THREE.WebGLRenderer({ antialias: true });
    params.renderer.setPixelRatio(window.devicePixelRatio || 1);
    params.renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(params.renderer.domElement);
  };

  const onPointerMove = (event: PointerEvent) => {
    params.pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    params.raycaster.setFromCamera(params.pointer, params.camera);

    const intersects = params.raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      params.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      params.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      render();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!params.isEditor) return;

    params.pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    params.raycaster.setFromCamera(params.pointer, params.camera);

    const intersects = params.raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (params.isShiftDown) {
        if (intersect.object !== params.plane) {
          params.scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object as any), 1);
        }
      } else {
        const voxel = new THREE.Mesh(params.cubeGeo, params.cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        params.scene.add(voxel);

        objects.push(voxel);
      }

      render();
    }
  };

  const onDocumentKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        params.isShiftDown = true;
        break;
      case 'KeyI':
        params.isEditor = !params.isEditor;
        break;
      default:
        console.warn(`按键【${event.code}】不符合指定类型`);
    }
  };

  const onDocumentKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        params.isShiftDown = false;
        break;
      default:
        console.warn(`按键【${event.code}】不符合指定类型`);
    }
  };

  const render = () => {
    params.renderer.render(params.scene, params.camera);
  };

  const onWindowResize = () => {
    params.camera.aspect = window.innerWidth / window.innerHeight;
    params.camera.updateProjectionMatrix();

    params.renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  };

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onDocumentKeyDown);
    document.removeEventListener('keyup', onDocumentKeyUp);
  });

  return {
    init,
    render,
  };
};
