<template>
  <div class="detail-section-title">
    <div v-if="icon" class="title-icon-wrapper">
      <van-icon :name="icon" />
    </div>
    <span>{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<style lang="less" scoped>
.detail-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #323233;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;

  .title-icon-wrapper {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 206, 201, 0.2);
    flex-shrink: 0;

    .van-icon {
      color: #fff;
      font-size: 18px;
    }
  }

  span {
    flex: 1;
  }
}
</style>
