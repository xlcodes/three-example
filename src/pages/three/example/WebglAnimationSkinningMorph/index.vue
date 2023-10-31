<template>
  <div class="threeEl" ref="threeElRef"></div>
  <t-loading :loading="GLFTLoading.loading" :text="GLFTLoading.loadText" fullscreen/>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {useThree} from './useThree'

const threeElRef = ref<HTMLDivElement>()

const {renderer, stats, init, animate, resizeHandle, GLFTLoading} = useThree()

onMounted(() => {
  if (threeElRef.value) {
    init()
    animate()
    threeElRef.value.appendChild(renderer.domElement)
    threeElRef.value.appendChild(stats.dom)
  }

  window.addEventListener('resize', resizeHandle)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandle)
})

</script>

<style scoped lang="less">
.threeEl {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
