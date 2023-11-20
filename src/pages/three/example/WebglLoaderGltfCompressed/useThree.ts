import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';
import { onMounted, onUnmounted, reactive } from 'vue';

interface IThreeOpt {
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
}

export const useThree = () => {
  const opt: Partial<IThreeOpt> = {};

  const GLTFLoading = reactive({
    loading: false,
    msg: '',
  });

  const init = (element: HTMLDivElement) => {
    opt.renderer = new THREE.WebGLRenderer({ antialias: true });
    opt.renderer.setPixelRatio(window.devicePixelRatio || 1);
    opt.renderer.setSize(window.innerWidth, window.innerHeight);
    opt.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    opt.renderer.toneMappingExposure = 1;
    element.appendChild(opt.renderer.domElement);

    opt.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    opt.camera.position.set(0, 100, 0);

    const envieroment = new RoomEnvironment(opt.renderer);
    const pmrenGenerator = new THREE.PMREMGenerator(opt.renderer);

    opt.scene = new THREE.Scene();
    opt.scene.background = new THREE.Color(0xbbbbbb);
    opt.scene.environment = pmrenGenerator.fromScene(envieroment).texture;
    envieroment.dispose();

    const girdHelper = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    girdHelper.material.opacity = 0.5;
    girdHelper.material.depthWrite = false;
    girdHelper.material.transparent = true;
    opt.scene.add(girdHelper);

    // 一种高效压缩的纹理加载器，旨在提供更高效的纹理压缩和传输
    const ktx2Loader = new KTX2Loader().setTranscoderPath('/jsm/libs/basis/').detectSupport(opt.renderer);

    const loader = new GLTFLoader()
      .setPath('/models/gltf/')
      .setKTX2Loader(ktx2Loader)
      .setMeshoptDecoder(MeshoptDecoder);

    GLTFLoading.loading = true;
    GLTFLoading.msg = '';

    loader.load(
      'coffeemat.glb',
      (gltf) => {
        GLTFLoading.loading = false;
        gltf.scene.position.y = 8;
        opt.scene.add(gltf.scene);
        render();
      },
      (xhr) => {
        GLTFLoading.msg = `模型加载进度：${Math.floor((xhr.loaded / xhr.total) * 100)}%，请稍等！`;
      },
      (err) => {
        GLTFLoading.msg = '';
        GLTFLoading.loading = false;
        console.error(`【coffeemat.glb】加载失败：`, err);
      },
    );

    const controls = new OrbitControls(opt.camera, opt.renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 400;
    controls.maxDistance = 1000;
    controls.target.set(10, 90, -16);
    controls.update();
  };

  const render = () => {
    opt.renderer.render(opt.scene, opt.camera);
  };

  const onWindowResize = () => {
    opt.camera.aspect = window.innerWidth / window.innerHeight;
    opt.camera.updateProjectionMatrix();
    opt.renderer.setSize(window.innerWidth, window.innerHeight);

    render();
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
