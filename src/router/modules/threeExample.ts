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
        meta: { title: 'Keyframes' },
      },
      {
        path: 'animation/skinning_blending',
        name: 'WebglAnimationSkinningBlending',
        component: () => import('@/pages/three/example/WebglAnimationSkinningBlending/index.vue'),
        meta: { title: 'SkinningBlending' },
      },
      {
        path: 'animation/skinning_additive_blending',
        name: 'WebglAnimationSkinningAdditiveBlending',
        component: () => import('@/pages/three/example/WebglAnimationSkinningAdditiveBlending/index.vue'),
        meta: { title: 'SkinningAdditiveBlending' },
      },
      {
        path: 'animation/skinning_morph',
        name: 'WebglAnimationSkinningMorph',
        component: () => import('@/pages/three/example/WebglAnimationSkinningMorph/index.vue'),
        meta: { title: 'SkinningMorph' },
      },
      {
        path: 'animation/multiple',
        name: 'WebglAnimationMultiple',
        component: () => import('@/pages/three/example/WebglAnimationMultiple/index.vue'),
        meta: { title: 'Multiple' },
      },
      {
        path: 'camera',
        name: 'WebglCamera',
        component: () => import('@/pages/three/example/WebglCamera/index.vue'),
        meta: { title: 'SkinningMorph' },
      },
      {
        path: 'camera/array',
        name: 'WebglCameraArray',
        component: () => import('@/pages/three/example/WebglCameraArray/index.vue'),
        meta: { title: 'WebglCameraArray' },
      },
      {
        path: 'camera/cinematic',
        name: 'WebglCameraCinematic',
        component: () => import('@/pages/three/example/WebglCameraCinematic/index.vue'),
        meta: { title: 'WebglCameraCinematic' },
      },
      {
        path: 'geometry/cube',
        name: 'WebglGeometryCube',
        component: () => import('@/pages/three/example/WebglGeometryCube/index.vue'),
        meta: { title: 'WebglGeometryCube' },
      },
      {
        path: 'interactive/voxelpainter',
        name: 'WebglInteractiveVoxelpainter',
        component: () => import('@/pages/three/example/WebglInteractiveVoxelpainter/index.vue'),
        meta: { title: 'WebglInteractiveVoxelpainter' },
      },
    ],
  },
];
