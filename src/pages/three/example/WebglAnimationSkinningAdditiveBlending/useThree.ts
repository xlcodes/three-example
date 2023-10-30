import * as THREE from 'three'
import {useThreeBase} from "@/hooks/useThreeBase";
import {GUI} from "three/examples/jsm/libs/lil-gui.module.min";

export const useThree = () => {
  const {
    scene,
    renderer,
    camera,
    stats,
    clock,
    loader,
    controls,
  } = useThreeBase()

  let model, skeleton, mixer;

  const crossFadeControls = []

  // 当前基础动作
  let currentBaseAction = 'idle'

  // 所有动作
  const allActions = []

  // 基础动作
  const baseActions = {
    idle: {weight: 1},
    walk: {weight: 0},
    run: {weight: 0},
  }

  // 叠加动作
  const additiveActions = {
    sneak_pose: {weight: 0},
    sad_pose: {weight: 0},
    agree: {weight: 0},
    headShake: {weight: 0},
  }

  let panelSettings, numAnimations;

  const init = () => {
    scene.background = new THREE.Color(0xa0a0a0)
    // 加载线性雾
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50)

    // 创建半球光光源
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
    hemiLight.position.set(0, 20, 0)
    scene.add(hemiLight)

    // 创建平行光光源
    const dirLight = new THREE.DirectionalLight(0xffffff, 3)
    dirLight.position.set(3, 10, 10)
    // 灯光将投射阴影
    dirLight.castShadow = true
    dirLight.shadow.camera.top = 2
    dirLight.shadow.camera.bottom = -2
    dirLight.shadow.camera.left = -2
    dirLight.shadow.camera.right = 2
    dirLight.shadow.camera.near = 0.1
    dirLight.shadow.camera.far = 40
    scene.add(dirLight)

    // 创建网格
    const mesh = new THREE.Mesh(
      // 创建平面缓冲几何体
      new THREE.PlaneGeometry(100, 100),
      // 创建一种用于具有镜面高光的光泽表面的材质
      new THREE.MeshPhongMaterial({
        color: 0xcbcbcb, // 材质颜色
        depthWrite: false, // 渲染此材质对深度缓冲区有影响
      })
    )

    // 网格局部旋转，以弧度来表示
    mesh.rotation.x = -Math.PI / 2
    // 网格接受阴影
    mesh.receiveShadow = true
    scene.add(mesh)

    loader.load('models/gltf/Xbot.glb', gltf => {
      model = gltf.scene
      scene.add(model)

      model.traverse(object => {
        if (object.isMesh) object.castShadow = true
      })

      // 用来模拟骨骼 Skeleton 的辅助对象
      skeleton = new THREE.SkeletonHelper(model)
      // 骨骼辅助对象不可见
      skeleton.visible = false
      scene.add(skeleton)

      // 加载动画
      const animations = gltf.animations

      // 创建场景中特定对象的动画的播放器
      mixer = new THREE.AnimationMixer(model)

      numAnimations = animations.length

      for (let i = 0; i !== numAnimations; ++i) {
        let clip = animations[i]
        const name = clip.name

        if (baseActions[name]) {
          // 返回所传入的剪辑参数的AnimationAction
          const action = mixer.clipAction(clip)
          activateAction(action)
          baseActions[name].action = action
          allActions.push(action)
        } else if (additiveActions[name]) {
          // 将给定动画剪辑的关键帧转换为附加格式
          THREE.AnimationUtils.makeClipAdditive(clip)

          if (clip.name.endsWith('_pose')) {
            // 创建一个新的片段，仅包含所给定帧之间的原始剪辑片段
            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 10)
          }

          const action = mixer.clipAction(clip)
          activateAction(action)
          additiveActions[name].action = action
          allActions.push(action)
        }
      }

      createPanel()

      animate()
    })

    // 包含阴影贴图的引用
    renderer.shadowMap.enabled = true

    camera.position.set(-1, 2, 3)

    // 禁用摄像机平移
    controls.enablePan = false
    // 禁用摄像机的缩放
    controls.enableZoom = false
    // 设置控制器的焦点
    controls.target.set(0, 1, 0)
    controls.update()

    window.addEventListener('resize', onWindowResize)
  }

  const createPanel = () => {
    const panel = new GUI({width: 310}).title('参数控制')
    // 添加分组
    const folder1 = panel.addFolder('Base Actions').title('基础动作')
    const folder2 = panel.addFolder('Additive Action Weights').title('附加作用权重')
    const folder3 = panel.addFolder('General Speed').title('速度控制')

    panelSettings = {
      'modify time scale': 1.0
    }

    const baseNames = ['None', ...Object.keys(baseActions)]

    const baseNameTitles = {
      None: '默认动作',
      idle: '站立',
      walk: '行走',
      run: '奔跑'
    }

    for (let i = 0, l = baseNames.length; i !== l; ++i) {
      const name = baseNames[i]
      const settings = baseActions[name]

      panelSettings[name] = () => {
        const currentSettings = baseActions[currentBaseAction];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;

        if (currentAction !== action) {

          prepareCrossFade(currentAction, action, 0.35);

        }
      }

      crossFadeControls.push(folder1.add(panelSettings, name).name(baseNameTitles[name]))
    }

    for (const name of Object.keys(additiveActions)) {
      const settings = additiveActions[name]

      panelSettings[name] = settings.weight
      folder2.add(panelSettings, name, 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(settings.action, weight)
        settings.weight = weight
      })
    }

    folder3.add(panelSettings, 'modify time scale', 0.0, 1.5, 0.01).name('修改时间尺度').onChange(modifyTimeScale)

    folder1.open()
    folder2.open()
    folder3.open()

    crossFadeControls.forEach(function (control) {
      control.setInactive = () => {
        control.domElement.classList.add('control-inactive')
      }

      control.setActive = () => {
        control.domElement.classList.remove('control-inactive')
      }

      const settings = baseActions[control.property]

      if (!settings || !settings.weight) {
        control.setInactive()
      }
    })
  }

  /**
   * 设置全局时间
   * @param speed
   */
  const modifyTimeScale = (speed) => {
    // timeScale: 全局时间(mixer time)的比例因子
    mixer.timeScale = speed
  }

  const synchronizeCrossFade = (startAction, endAction, duration) => {
    const onLoopFinished = (event) => {
      if (event.action === startAction) {
        mixer.removeEventListener('loop', onLoopFinished)
        executeCrossFade(startAction, endAction, duration)
      }
    }

    mixer.addEventListener('loop', onLoopFinished)
  }

  const executeCrossFade = (startAction, endAction, duration) => {
    if (endAction) {
      setWeight(endAction, 1)
      endAction.time = 0

      if (startAction) {
        startAction.crossFadeTo(endAction, duration, true)
      } else {
        endAction.fadeIn(duration)
      }
    } else {
      startAction.fadeOut(duration)
    }
  }

  const prepareCrossFade = (startAction, endAction, duration) => {
    if (currentBaseAction === 'idle' || !startAction || !endAction) {
      executeCrossFade(startAction, endAction, duration)
    } else {
      synchronizeCrossFade(startAction, endAction, duration)
    }

    if (endAction) {
      const clip = endAction.getClip()
      currentBaseAction = clip.name
    } else {
      currentBaseAction = 'None'
    }

    crossFadeControls.forEach(control => {
      const name = control.property
      if (name === currentBaseAction) {
        control.setActive()
      } else {
        control.setInactive()
      }
    })
  }

  const animate = () => {
    requestAnimationFrame(animate)

    for (let i = 0; i !== numAnimations; ++i) {
      const action = allActions[i]
      const clip = action.getClip()
      const settings = baseActions[clip.name] || additiveActions[clip.name]
      // getEffectiveWeight：返回影响权重(考虑当前淡入淡出状态和enabled的值)
      settings.weight = action.getEffectiveWeight()
    }

    // 获取自 .oldTime 设置后到当前的秒数
    const mixerUpdateDelta = clock.getDelta()

    // 推进混合器时间并更新动画
    mixer.update(mixerUpdateDelta)
    // 性能监控器更新
    stats.update()
    // 渲染器更新
    renderer.render(scene, camera)
  }

  const activateAction = (action) => {
    // 获取此动作的动画数据的剪辑
    const clip = action.getClip()
    const setting = baseActions[clip.name] || additiveActions[clip.name]
    setWeight(action, setting.weight)
    // 激活动作
    action.play()
  }

  const setWeight = (action, weight) => {
    // 动作解禁
    action.enabled = true
    // 设置时间比例（timeScale）以及停用所有的变形
    action.setEffectiveTimeScale(1)
    // 设置权重（weight）以及停止所有淡入淡出
    action.setEffectiveWeight(weight)
  }

  /**
   * 监听窗口变化
   */
  const onWindowResize = () => {
    // 重置相机视锥体长宽比
    camera.aspect = window.innerWidth / window.innerHeight
    // 重置相机矩阵
    camera.updateProjectionMatrix()
    // 渲染器重新设置大小
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  return {
    renderer,
    stats,
    init,
  }
}
