<template>
  <div ref="threeElRef" class="threeEl"></div>
  <div class="op-dialog">
    <p>点击 【i】进入编辑模式，再次点击退出编辑模式</p>
    <p>单击添加盒子</p>
    <p>按住【shift】单击，删除当前盒子</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useThree } from './useThree';

const threeElRef = ref<HTMLDivElement>();

const { init, render } = useThree();

const threeInit = () => {
  if (threeElRef.value) {
    init(threeElRef.value);
    render();
  }
};

onMounted(() => {
  threeInit();
});
</script>

<style scoped lang="less">
.threeEl {
  position: relative;
  width: 100%;
  height: 100%;
}
.op-dialog {
  position: absolute;
  padding: 8px;
  top: 12px;
  right: 12px;
  width: 320px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
}
</style>
