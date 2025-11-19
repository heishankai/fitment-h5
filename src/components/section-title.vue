<template>
  <div class="section-title">
    <h3>{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="less" scoped>
.section-title {
  padding: 16px 16px 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--van-primary-color);
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 18px;
    bottom: 10px;
    width: 4px;
    height: 20px;
    background: var(--van-primary-color);
    border-radius: 2px;
  }
}
</style>
