<template>
  <van-cell class="menu-item-cell" is-link @click="$emit('click')">
    <template #icon>
      <div class="icon-box" :style="{ background: color + '22' }">
        <van-icon :name="icon" :style="{ color }" size="22px" />
      </div>
    </template>
    <template #title>
      <span class="menu-item-title">{{ title }}</span>
    </template>
  </van-cell>
</template>

<script setup>
defineProps({
  icon: String,
  color: String,
  title: String
})
</script>

<style scoped>
.menu-item-cell {
  background: white !important;
  margin: 0 0 12px !important;
  padding: 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) !important;
  display: flex !important;
  align-items: center !important;
}

.menu-item-cell :deep(.van-cell__value) {
  display: flex;
  align-items: center;
}

.menu-item-cell :deep(.van-cell__title) {
  margin-left: 0;
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.menu-item-title {
  font-size: 16px;
  font-weight: 500;
}

.icon-box {
  width: 40px;
  height: 40px;
  padding: 10px;
  border-radius: 10px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
