<template>
  <van-button type="primary" block round class="edit-btn" @click="$emit('click')">
    <van-icon name="edit" />
    编辑资料
  </van-button>
</template>

<script setup></script>

<style scoped>
.edit-btn {
  margin-top: 20px;
  height: 48px;
  background: linear-gradient(to right, #00cec9, #00b4d8);
  box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
  font-weight: 600;
  font-size: 16px;
  border: none;
}

.edit-btn :deep(.van-icon) {
  margin-right: 6px;
}
</style>
