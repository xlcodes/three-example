<template>
  <t-space direction="vertical">
    <t-row :gutter="16">
      <t-col :span="4" v-for="item in threeExample" :key="item.key">
        <t-card theme="poster2" class="card" @click="cardClickHandle(item.path)">
          <template #footer>
            <t-comment :content="item.title"/>
          </template>
        </t-card>
      </t-col>
    </t-row>
  </t-space>
</template>

<script lang="ts">
export default {
  name: 'DashboardBase',
};
</script>

<script setup lang="ts">
import {useRouter} from 'vue-router'
import {threeExample} from "@/config/threeExample";

const router = useRouter()

const cardClickHandle = (path) => {
  router.push({
    path
  })
}

</script>

<style scoped>
.card {
  width: 400px;
  cursor: pointer;
  margin-bottom: 24px;
}
</style>
