<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSystemNotificationSocket } from '@/composables/useSystemNotificationSocket'

const route = useRoute()
const { connect: connectSystemNotificationSocket } = useSystemNotificationSocket()

watch(
  () => route.fullPath,
  () => connectSystemNotificationSocket()
)
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
