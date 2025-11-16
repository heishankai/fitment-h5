<template>
  <van-nav-bar :title="title" left-arrow @click-left="goBack" class="go-back">
    <template #left>
      <van-icon name="down" class="back-icon" size="24" color="#fff" />
    </template>
    <template #title>
      <span class="title">{{ title }}</span>
    </template>
  </van-nav-bar>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const currentRoute = computed(() => router.currentRoute.value)

const title = computed(() => {
  return String(currentRoute.value?.meta?.title || '')
})

const goBack = () => router.back()
</script>

<style scoped lang="less">
.go-back {
  background: #00cec9;
}

.back-icon {
  transform: rotate(90deg);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}
</style>
