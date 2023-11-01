<template>
  <div class="threeEl" ref="threeElRef"></div>
  <t-loading :loading="GLFTLoading.loading" :text="GLFTLoading.loadText" fullscreen/>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useThree} from './useThree'
const threeElRef = ref<HTMLDivElement>()
const {renderer, stats, init, animate, GLFTLoading} = useThree()

onMounted(() => {
  if (threeElRef.value) {
    init()
    animate()
    threeElRef.value.appendChild(renderer.domElement)
    threeElRef.value.appendChild(stats.dom)
  }
})
</script>

<style scoped lang="less">
.threeEl {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
