import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
// three设置的类似于电影摄像机的插件，extends PerspectiveCamera
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera';
import { onMounted, onUnmounted } from 'vue';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

export const useThree = () => {
  let camera: CinematicCamera;
  let scene: THREE.Scene;
  let raycaster: THREE.Raycaster;
  let renderer: THREE.WebGLRenderer;
  let stats: Stats;

  const mouse = new THREE.Vector2();
  let INTERSECTED;
  const radius = 100;
  let theta = 0;

  let gui: GUI;

  /**
   * 鼠标移动事件
   * @param event
   */
  const onDocumentMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const init = (element: HTMLDivElement) => {
    camera = new CinematicCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    // 初始化焦距
    camera.setLens(5);
    // 初始化位置
    camera.position.set(2, 1, 500);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.add(new THREE.AmbientLight(0xffffff));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // 创建立方缓冲几何体（即正方体）
    const geometry = new THREE.BoxGeometry(20, 20, 20);

    for (let i = 0; i < 1500; i++) {
      // 创建物品对象
      // THREE.MeshLambertMaterial 一种非光泽表面的材质，没有镜面高光
      const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
      // 随机设置物品位置
      object.position.set(Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400);
      scene.add(object);
    }

    //  光线投射
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    stats = new Stats();
    element.appendChild(stats.dom);

    const effectController = {
      focalLength: 15,
      fstop: 2.8,
      showFocus: false,
      focalDepth: 3,
    };

    const matChange = () => {
      for (const e in effectController) {
        if (e in camera.postprocessing.bokeh_uniforms) {
          camera.postprocessing.bokeh_uniforms[e].value = effectController[e];
        }
      }

      camera.postprocessing.bokeh_uniforms.znear.value = camera.near;
      camera.postprocessing.bokeh_uniforms.zfar.value = camera.far;
      // @ts-ignore
      camera.setLens(effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc);
      effectController.focalDepth = camera.postprocessing.bokeh_uniforms.focalDepth.value;
    };

    gui = new GUI();

    gui.add(effectController, 'focalLength', 1, 135, 0.01).name('焦距').onChange(matChange);
    gui.add(effectController, 'fstop', 1.8, 22, 0.01).onChange(matChange);
    gui.add(effectController, 'focalDepth', 0.1, 100, 0.001).name('焦深').onChange(matChange);
    // @ts-ignore
    gui.add(effectController, 'showFocus', true).name('是否显示焦点').onChange(matChange);

    matChange();
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
    stats.update();
  };

  const render = () => {
    theta += 0.1;
    // THREE.MathUtils.degToRad：将度转化为弧度。
    camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.position.z = radius * Math.sin(THREE.MathUtils.degToRad(theta));
    camera.lookAt(scene.position);
    // 更新物体及其后代的全局变换 extends Object3D
    camera.updateMatrixWorld();
    // 使用一个新的原点和方向来更新射线
    raycaster.setFromCamera(mouse, camera);

    // 计算物体和射线的焦点
    const intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0) {
      // 提供当前光线方向的标准化方向向量
      const targetDistance = intersects[0].distance;
      // focusAt 距相机较远的对焦功能
      // focusDistance 表示对焦物体到相机距离
      camera.focusAt(targetDistance);

      // intersects[0].object 检查与射线相交的物体
      if (INTERSECTED !== intersects[0].object) {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = intersects[0].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0xff0000);
      }
    } else if (INTERSECTED) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      INTERSECTED = null;
    }

    if (camera.postprocessing.enabled) {
      // 渲染场景, 代替renderer.render(scene, camera)
      camera.renderCinematic(scene, renderer);
    } else {
      // 如果不为空，它将强制场景中的每个物体使用这里的材质来渲染
      scene.overrideMaterial = null;
      renderer.clear();
      renderer.render(scene, camera);
    }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  onMounted(() => {
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onDocumentMouseMove);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('mousemove', onDocumentMouseMove);

    if (gui) {
      gui.destroy();
    }
  });

  return {
    init,
    animate,
  };
};
