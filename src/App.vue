<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['ForemanPrice', 'CreateMaterialOrder']">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<style lang="less" scoped>
// #app {
//   background: #f5f5f5;
// }
</style>
