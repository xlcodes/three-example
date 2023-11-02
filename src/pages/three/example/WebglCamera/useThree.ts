import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { CameraHelper } from 'three';
import { useThreeBase } from '@/hooks/useThreeBase';

export const useThree = () => {
  const { stats, camera, scene, renderer } = useThreeBase();

  const SCREEN_WIDTH = window.innerWidth;
  const SCREEN_HEIGHT = window.innerHeight;
  const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  let mesh;
  let cameraRig;
  let activeCamera;
  let activeHelper;
  let cameraPerspective;
  let cameraPerspectiveHelper;
  let cameraOrtho;
  let cameraOrthoHelper;

  const frustumSize = 600;

  const init = () => {
    // 重置相机参数
    camera.fov = 50;
    camera.aspect = aspect * 0.5;
    camera.near = 1;
    camera.far = 10000;
    camera.position.z = 2500;
    // 更新相机矩阵
    camera.updateProjectionMatrix();

    // 透视相机
    cameraPerspective = new THREE.PerspectiveCamera(50, 0.5 * aspect, 150, 1000);
    // 用于模拟相机视锥体的辅助对象
    cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
    scene.add(cameraPerspectiveHelper);

    // 正交相机
    cameraOrtho = new THREE.OrthographicCamera(
      (0.5 * frustumSize * aspect) / -2,
      (0.5 * frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      150,
      1000,
    );
    // 正交相机辅助对象
    cameraOrthoHelper = new CameraHelper(cameraOrtho);
    scene.add(cameraOrthoHelper);

    // 当前相机类型
    activeCamera = cameraPerspective;
    // 当前相机辅助对象
    activeHelper = cameraPerspectiveHelper;

    cameraOrtho.rotation.y = Math.PI;
    cameraPerspective.rotation.y = Math.PI;

    // 相机对象分组
    cameraRig = new THREE.Group();
    cameraRig.add(cameraPerspective);
    cameraRig.add(cameraOrtho);

    scene.add(cameraRig);

    // 白色网格球
    mesh = new THREE.Mesh(
      new THREE.SphereGeometry(100, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
    );
    scene.add(mesh);

    // 绿色网格球
    const mesh2 = new THREE.Mesh(
      new THREE.SphereGeometry(50, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
    );

    mesh2.position.y = 150;
    mesh.add(mesh2);

    // 蓝色网格球
    const mesh3 = new THREE.Mesh(
      new THREE.SphereGeometry(5, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }),
    );

    mesh3.position.z = 150;
    cameraRig.add(mesh3);

    // 创建雪花
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
      // 在区间 [-1000, 1000] 内创建一个随机数
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    }

    // 设置点位信息
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    // 创建顶点
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888 }));
    scene.add(particles);
    // 定义渲染器在渲染每一帧之前自动清除其输出
    renderer.autoClear = false;
  };

  /**
   * 键盘事件
   * @param event
   */
  const onKeyDown = (event) => {
    const KEY_CODE = {
      O: 79, // 【O】键
      P: 80, // 【P】键
    };
    switch (event.keyCode) {
      case KEY_CODE.O:
        activeCamera = cameraOrtho;
        activeHelper = cameraOrthoHelper;
        break;
      case KEY_CODE.P:
        activeCamera = cameraPerspective;
        activeHelper = cameraPerspectiveHelper;
        break;
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
    stats.update();
  };

  const render = () => {
    const r = Date.now() * 0.0005;

    // 物体位置随机变换
    mesh.position.x = 700 * Math.cos(r);
    mesh.position.z = 700 * Math.sin(r);
    mesh.position.y = 700 * Math.sin(r);

    mesh.children[0].position.x = 70 * Math.cos(2 * r);
    mesh.children[0].position.z = 70 * Math.sin(r);

    // 判断相机类型，处理相机视角
    if (activeCamera === cameraPerspective) {
      cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
      cameraPerspective.far = mesh.position.length();
      cameraPerspective.updateProjectionMatrix();

      cameraPerspectiveHelper.update();
      cameraPerspectiveHelper.visible = true;

      cameraOrthoHelper.visible = false;
    } else {
      cameraOrtho.far = mesh.position.length();
      cameraOrtho.updateProjectionMatrix();

      cameraOrthoHelper.update();
      cameraOrthoHelper.visible = true;

      cameraPerspectiveHelper.visible = false;
    }

    // 锁定当前位置
    cameraRig.lookAt(mesh.position);
    // 渲染器执行清除
    renderer.clear();

    // 焦点相机辅助对象可见性
    activeHelper.visible = false;

    // 将视口大小设置为(x, y)到 (x + width, y + height).
    renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // 渲染左侧窗口
    renderer.render(scene, activeCamera);

    activeHelper.visible = true;

    renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
    // 渲染右侧窗口
    renderer.render(scene, camera);
  };

  const onWindowResize = () => {
    const aspect = window.innerWidth / window.innerHeight;

    // 更新画布所在相机
    camera.aspect = 0.5 * aspect;
    camera.updateProjectionMatrix();

    // 更新透视相机
    cameraPerspective = 0.5 * aspect;
    cameraPerspective.updateProjectionMatrix();
    // 更新正交相机
    cameraOrtho.left = (-0.5 * frustumSize * aspect) / 2;
    cameraOrtho.right = (0.5 * frustumSize * aspect) / 2;
    cameraOrtho.top = frustumSize / 2;
    cameraOrtho.bottom = -frustumSize / 2;
    cameraOrtho.updateProjectionMatrix();
  };

  onMounted(() => {
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onWindowResize);
  });

  return {
    renderer,
    stats,
    init,
    animate,
  };
};
