import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, onUnmounted } from 'vue';

export const useThree = () => {
  let camera: THREE.PerspectiveCamera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let plane: THREE.Mesh;
  let pointer: THREE.Vector2;
  let raycaster: THREE.Raycaster;
  let isShiftDown = false;
  let isEdit = false;

  let rollOverMesh: THREE.Mesh;
  let rollOverMaterial: THREE.MeshBasicMaterial;
  let cubeGeo: THREE.BoxGeometry;
  let cubeMaterial: THREE.MeshBasicMaterial;

  const objects: Array<THREE.Mesh> = [];

  const init = (element: HTMLDivElement) => {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    const cubeTexture = new THREE.TextureLoader().load('/textures/square-outline-textured.png');
    cubeTexture.colorSpace = THREE.SRGBColorSpace;

    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xfeb74c, map: cubeTexture });

    // 网格辅助对象
    const gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);

    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    objects.push(plane);

    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
  };

  const onPointerMove = (event: MouseEvent) => {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      render();
    }
  };

  const onPointerDown = (event: MouseEvent) => {
    if (!isEdit) return;

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (isShiftDown) {
        if (intersect.object !== plane) {
          scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object as any), 1);
        }
      } else {
        const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        scene.add(voxel);

        objects.push(voxel);
      }

      render();
    }
  };

  const onDocumentKeyDown = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 16: // shift
        isShiftDown = true;
        break;
      case 73: // I or i
        isEdit = !isEdit;
        break;
      default:
        break;
    }
  };

  const onDocumentKeyUp = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 16:
        isShiftDown = false;
        break;
      default:
        break;
    }
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
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
