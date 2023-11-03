<template>
  <div ref="threeElRef" class="threeEl"></div>
  <t-loading :loading="GLFTLoading.loading" :text="GLFTLoading.loadText" fullscreen />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useThree } from './useThree';

const threeElRef = ref<HTMLDivElement>();
const { stats, renderer, GLFTLoading } = useThree();

onMounted(() => {
  if (threeElRef.value) {
    // 添加性能工具
    threeElRef.value?.appendChild(stats.dom);
    // 添加渲染器
    threeElRef.value?.appendChild(renderer.domElement);
  }
});
</script>

<style scoped lang="less">
.threeEl {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
