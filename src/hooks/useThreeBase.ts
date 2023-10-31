import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {reactive} from "vue"

/**
 * 生成 three 必要参数
 */
export const useThreeBase = () => {
  // GLFT 加载对象
  const GLFTLoading = reactive({
    loadText: '',
    loading: false
  })

  // 性能加载器
  const stats = new Stats()
  // 时间对象
  const clock = new THREE.Clock()
  // 场景
  const scene = new THREE.Scene()
  // 相机
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 抗锯齿
  })
  // 控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  // GLTF 加载器
  const loader = new GLTFLoader()

  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(window.innerWidth, window.innerHeight)

  return {
    scene,
    renderer,
    camera,
    stats,
    controls,
    loader,
    clock,
    GLFTLoading,
  }
}
