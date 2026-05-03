<template>
  <van-popup
    :show="show"
    destroy-on-close
    round
    position="bottom"
    close-on-click-overlay
    class="work-kind-picker-popup"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)', maxHeight: '70vh' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="picker-header">
      <span class="picker-drag-bar" />
    </div>
    <van-picker
      title="选择工种"
      :columns="columns"
      :show-toolbar="true"
      confirm-button-text="确定"
      cancel-button-text="取消"
      @cancel="close"
      @confirm="onPickerConfirm"
    />
  </van-popup>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const close = () => emit('update:show', false)

const onPickerConfirm = (payload) => {
  emit('confirm', payload)
  close()
}
</script>

<style lang="less" scoped>
.work-kind-picker-popup {
  background: var(--color-bg);
  overflow: visible;

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px 4px;
  }

  .picker-drag-bar {
    display: block;
    width: 40px;
    height: 4px;
    margin: 0 auto;
    background: var(--color-border);
    border-radius: 2px;
  }

  :deep(.van-picker) {
    --van-picker-background: transparent;
    --van-picker-toolbar-height: 44px;
    --van-picker-title-font-size: 16px;
  }

  :deep(.van-picker__toolbar) {
    height: 44px;
    padding: 0 20px;
  }

  :deep(.van-picker__cancel) {
    font-size: 15px;
    color: var(--color-text-secondary);
  }

  :deep(.van-picker__confirm) {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-primary);
  }

  :deep(.van-picker-column__item) {
    font-size: 16px;
  }

  :deep(.van-picker-column__item--selected) {
    font-weight: 600;
    color: var(--color-text);
  }
}
</style>
