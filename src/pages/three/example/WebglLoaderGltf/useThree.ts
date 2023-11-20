import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { onMounted, onUnmounted, reactive } from 'vue';

interface IThreeOpt {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
}

export const useThree = () => {
  const GLTFLoading = reactive({
    loading: false,
    msg: '',
  });

  const opt: Partial<IThreeOpt> = {};

  const init = (element: HTMLDivElement) => {
    opt.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
    opt.camera.position.set(-1.8, 0.6, 2.7);

    opt.scene = new THREE.Scene();

    GLTFLoading.loading = true;
    GLTFLoading.msg = '';

    new RGBELoader().setPath('/textures/equirectangular/').load('royal_esplanade_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      opt.scene.background = texture;
      opt.scene.environment = texture;

      render();

      const loader = new GLTFLoader().setPath('/models/gltf/DamagedHelmet/glTF/');

      loader.load(
        'DamagedHelmet.gltf',
        async (gltf) => {
          const model = gltf.scene;

          await opt.renderer.compile(model, opt.camera, opt.scene);

          opt.scene.add(model);
          render();

          GLTFLoading.loading = false;
        },
        (xhr) => {
          GLTFLoading.msg = `模型加载进度：${Math.floor((xhr.loaded / xhr.total) * 100)}%，请稍等！`;
        },
        (err) => {
          GLTFLoading.msg = '';
          GLTFLoading.loading = false;
          console.error(`【DamagedHelmet.glb】加载失败：`, err);
        },
      );
    });

    opt.renderer = new THREE.WebGLRenderer({ antialias: true });
    opt.renderer.setPixelRatio(window.devicePixelRatio || 1);
    opt.renderer.setSize(window.innerWidth, window.innerHeight);
    opt.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    opt.renderer.toneMappingExposure = 1;
    element.appendChild(opt.renderer.domElement);

    const controls = new OrbitControls(opt.camera, opt.renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, -0.2);
    controls.update();
  };

  const onWindowResize = () => {
    opt.camera.aspect = window.innerWidth / window.innerHeight;
    opt.camera.updateProjectionMatrix();
    opt.renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  };

  const render = () => {
    opt.renderer.render(opt.scene, opt.camera);
  };

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
  });

  return {
    GLTFLoading,
    init,
  };
};
