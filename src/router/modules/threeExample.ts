export default [
  {
    path: '/webgl',
    redirect: '/webgl/animation/keyframes',
    name: 'webgl',
    children: [
      {
        path: 'animation/keyframes',
        name: 'WebglAnimationKeyframes',
        component: () => import('@/pages/three/example/WebglAnimationKeyframes/index.vue'),
        meta: {title: 'Keyframes'},
      }, {
        path: 'animation/skinning_blending',
        name: 'WebglAnimationSkinningBlending',
        component: () => import('@/pages/three/example/WebglAnimationSkinningBlending/index.vue'),
        meta: {title: 'SkinningBlending'},
      },
      {
        path: 'animation/skinning_additive_blending',
        name: 'WebglAnimationSkinningAdditiveBlending',
        component: () => import('@/pages/three/example/WebglAnimationSkinningAdditiveBlending/index.vue'),
        meta: {title: 'SkinningAdditiveBlending'},
      }
    ],
  }
];
