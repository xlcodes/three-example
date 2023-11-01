<template>
  <div class="threeEl" ref="threeElRef"></div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, render} from "vue";
import {useThree} from './useThree'

const threeElRef = ref<HTMLDivElement>()

const {renderer, stats, init, animate} = useThree()

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
