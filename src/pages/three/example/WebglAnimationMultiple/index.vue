<template>
  <div ref="threeElRef" class="threeEl"></div>
  <t-loading :loading="GLFTLoading.loading" :text="GLFTLoading.loadText" fullscreen />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useThree } from './useThree';

const threeElRef = ref<HTMLDivElement>();

const { init, animate, GLFTLoading } = useThree();

onMounted(() => {
  if (threeElRef.value) {
    init(threeElRef.value);
    animate();
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
