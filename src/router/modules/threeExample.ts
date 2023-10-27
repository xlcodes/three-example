import Layout from '@/layouts/index.vue';
import DashboardIcon from '@/assets/assets-slide-dashboard.svg';

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
        meta: {title: 'keyframes'},
      }
    ],
  }
];
