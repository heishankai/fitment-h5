<template>
  <div class="section-title">
    <div class="section-bar"></div>
    <span>{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="less" scoped>
.section-title {
  display: flex;
  align-items: center;

  .section-bar {
    width: 4px;
    height: 20px;
    background: #00cec9;
    border-radius: 2px;
    margin-right: 8px;
  }

  span {
    font-size: 18px;
    font-weight: 600;
    color: #00cec9;
  }
}
</style>
