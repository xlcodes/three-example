<template>
  <div ref="threeElRef" class="threeEl"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useThree } from './useThree';

const threeElRef = ref<HTMLDivElement>();

const { renderer, init, animate } = useThree();

onMounted(() => {
  if (threeElRef.value) {
    init();
    animate();
    threeElRef.value.appendChild(renderer.domElement);
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
