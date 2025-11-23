<template>
  <div class="page">
    <custom-van-navbar />
    <main>
      <div v-for="i in 50" :key="i">内容</div>
    </main>
  </div>
</template>

<script setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
  /* 防止整个页面被拉动 */
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none; /* 阻止过度滚动 */
}

main {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  overscroll-behavior: contain; /* 防止滚动穿透 */
}
</style>
