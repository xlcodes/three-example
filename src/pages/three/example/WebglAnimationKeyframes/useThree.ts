import * as THREE from 'three'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {useThreeBase} from "@/hooks/useThreeBase";

export const useThree = () => {

  const { scene, stats, camera, renderer, controls, clock } = useThreeBase()

  let mixer;

  // 渲染器设置像素比
  renderer.setPixelRatio(window.devicePixelRatio || 1)
  // 重新执行渲染
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Mipmapped辐射环境贴图(PMREM)
  const pmremGenerator = new THREE.PMREMGenerator(renderer)

  // 场景颜色
  scene.background = new THREE.Color(0xbfe3dd)
  // 设置环境贴图
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture

  // 设置相机位置
  camera.position.set(5, 2, 8)

  // 设置控制器的焦点
  controls.target.set(0, 0.5, 0)
  // 更新控制器
  controls.update();
  // 禁用摄像机平移
  controls.enablePan = false;
  // 启用阻尼（惯性）
  controls.enableDamping = true;
  // Draco压缩的图形库加载器
  const dracoLoader = new DRACOLoader();
  // 设置包含JS和WASM解压缩库的文件夹路径
  dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
  // GLTF 加载器
  const loader = new GLTFLoader();
  // 解码使用KHR_draco_mesh_compression扩展压缩过的文件
  loader.setDRACOLoader(dracoLoader);
  loader.load('models/gltf/LittlestTokyo.glb', function (gltf) {
    // 获取模型中的场景
    const model = gltf.scene;
    // 设置场景位置
    model.position.set(1, 1, 0);
    // 设置缩放
    model.scale.set(0.01, 0.01, 0.01);
    // 将模型中的场景添加到当前场景
    scene.add(model);
    // 场景中特定对象的动画的播放器对象，控制模型动画播放
    mixer = new THREE.AnimationMixer(model);
    // 返回所传入的剪辑参数的AnimationAction并播放动画
    mixer.clipAction(gltf.animations[0]).play();
    // 执行轮训动画
    animate();
  }, (res) => {
    // TODO: 在这里做加载器的操作
  }, function (e) {
    console.error(e);
  });
  // 轮训执行动画
  const animate = () => {
    requestAnimationFrame(animate);
    // 获取自 .oldTime 设置后到当前的秒数
    // 同时将 .oldTime 设置为当前时间
    const delta = clock.getDelta();
    // 推进混合器时间并更新动画
    mixer.update(delta);
    // 更新控制器
    controls.update();
    // 更新性能工具
    stats.update();
    // 重新渲染
    renderer.render(scene, camera);
  }



  return {
    stats,
    renderer,
  }
}
