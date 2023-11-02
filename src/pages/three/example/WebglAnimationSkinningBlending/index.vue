<template>
  <div ref="threeElRef" class="threeEl"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const threeElRef = ref<HTMLDivElement>();
</script>

<style scoped lang="less">
.threeEl {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
