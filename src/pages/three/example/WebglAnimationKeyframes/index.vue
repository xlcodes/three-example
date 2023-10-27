<template>
  <div class="threeEl" ref="threeElRef"></div>
</template>

<script setup lang="ts">
import {useThree} from './useThree'
import {onMounted, onUnmounted, ref} from "vue";

const threeElRef = ref<HTMLDivElement>()
const { stats, renderer, resizeHandle, } = useThree()

onMounted(() => {
  if (threeElRef.value) {
    // 添加性能工具
    threeElRef.value?.appendChild(stats.dom)
    // 添加渲染器
    threeElRef.value?.appendChild(renderer.domElement)
  }
  // 监听窗口变化
  window.addEventListener('resize', resizeHandle)
})

onUnmounted(() => {
  // 移除监听函数
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
