<template>
  <div class="page-container">
    <div class="text-center">
      <img src="@/assets/404.svg" alt="" />
    </div>
    <div class="text-center">
      <h1>抱歉，您访问的页面不存在</h1>
      <van-button type="primary" @click="goHome">回到首页</van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()

const goHome = () => {
  router.push({
    path: '/wechat-msg'
  })
}
</script>

<style lang="less" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .text-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h1 {
      color: #666;
      padding: 80px 0;
    }
  }

  img {
    width: 1500px;
    margin: 0 auto;
  }
}
</style>
