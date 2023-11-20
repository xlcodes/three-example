<template>
  <div ref="threeElRef" class="threeEl"></div>
  <t-loading :loading="GLTFLoading.loading" :text="GLTFLoading.msg" fullscreen />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useThree } from './useThree';

const threeElRef = ref<HTMLDivElement>();

const { init, GLTFLoading } = useThree();

onMounted(() => {
  if (threeElRef.value) {
    init(threeElRef.value);
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
