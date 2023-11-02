import * as THREE from 'three';
import { onUnmounted } from 'vue';
import { useThreeBase } from '@/hooks/useThreeBase';
import { getGUIStore } from '@/store/modules/gui';

export const useThree = () => {
  const guiStore = getGUIStore();

  const { scene, stats, camera, renderer, clock, loader, GLFTLoading } = useThreeBase();

  let mixer;
  let actions;
  let activeAction;
  let previousAction;
  let model;

  const api = { state: 'Walking' };

  const init = () => {
    // 重置相机参数
    camera.fov = 45;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 0.25;
    camera.far = 100;
    camera.position.set(-5, 3, 10);
    camera.lookAt(0, 2, 0);

    // 设置场景参数
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);
    // 创建半球光光源
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 创建平行光光源
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 20, 10);
    scene.add(dirLight);

    // 创建网格
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
    );

    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    // 坐标格辅助对象，也就是平面上的二维网格
    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    GLFTLoading.loading = true;
    GLFTLoading.loadText = '';

    loader.load(
      'models/gltf/RobotExpressive.glb',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        createGUI(model, gltf.animations);
        GLFTLoading.loading = false;
        GLFTLoading.loadText = '';
      },
      (xhr) => {
        GLFTLoading.loadText = `模型加载进度：${Math.floor((xhr.loaded / xhr.total) * 100)}%，请稍等！`;
      },
      (e) => {
        GLFTLoading.loading = false;
        GLFTLoading.loadText = '';
        console.error(e);
      },
    );
  };

  const animate = () => {
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    stats.update();
  };

  const fadeToAction = (name, duration) => {
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {
      previousAction.fadeOut(duration);
    }

    activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
  };

  const createGUI = (model, animations) => {
    const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];

    const statesText = {
      空闲: 'Idle',
      走路: 'Walking',
      跑步: 'Running',
      跳舞: 'Dance',
      死亡: 'Death',
      坐着: 'Sitting',
      站立: 'Standing',
    };

    const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

    const emotesText = {
      Jump: '跳跃',
      Yes: '点头',
      No: '摇头',
      Wave: '挥手',
      Punch: '左钩拳',
      ThumbsUp: '点赞',
    };

    const expressionsText = {
      Angry: '生气',
      Surprised: '吃惊',
      Sad: '伤心',
    };

    guiStore.createGUI({});

    guiStore.GUI.title('参数控制');

    mixer = new THREE.AnimationMixer(model);

    actions = {};

    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i];
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    }

    const statesFolder = guiStore.GUI.addFolder('States').title('当前状态');

    const clipCtrl = statesFolder.add(api, 'state').name('所处状态').options(statesText);

    clipCtrl.onChange(() => {
      fadeToAction(api.state, 0.5);
    });

    statesFolder.open();

    const emoteFolder = guiStore.GUI.addFolder('Emotes').title('动作');

    const createEmoteCallback = (name) => {
      api[name] = () => {
        fadeToAction(name, 0.2);
        mixer.addEventListener('finished', restoreState);
      };

      emoteFolder.add(api, name).name(emotesText[name]);
    };

    const restoreState = () => {
      mixer.removeEventListener('finished', restoreState);
      fadeToAction(api.state, 0.2);
    };

    for (let i = 0; i < emotes.length; i++) {
      createEmoteCallback(emotes[i]);
    }

    emoteFolder.open();

    const face = model.getObjectByName('Head_4');

    const expressions = Object.keys(face.morphTargetDictionary);
    const expressionFolder = guiStore.GUI.addFolder('Expressions').title('表情控制');

    for (let i = 0; i < expressions.length; i++) {
      expressionFolder.add(face.morphTargetInfluences, `${i}`, 0, 1, 0.01).name(expressionsText[expressions[i]]);
    }

    activeAction = actions.Walking;
    activeAction.play();

    expressionFolder.open();
  };

  onUnmounted(() => {
    guiStore.destroyGUI();
  });

  return {
    renderer,
    stats,
    init,
    animate,
    GLFTLoading,
  };
};
