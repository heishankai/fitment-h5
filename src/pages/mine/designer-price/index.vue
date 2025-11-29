<template>
  <div class="page-container">
    <custom-van-navbar />
    <main>111</main>
    <footer>
      <van-button type="primary" size="normal" round class="action-btn" @click="onSubmit">
        <van-icon name="checked" />
        提交
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
const onSubmit = () => {
  console.log('onSubmit')
}
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px;
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

  display: flex;
  gap: 10px;

  .action-btn {
    flex: 1;
    height: 44px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .van-icon {
      font-size: 16px;
    }
  }
}
</style>
