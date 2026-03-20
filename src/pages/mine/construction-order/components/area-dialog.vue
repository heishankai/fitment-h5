<template>
  <van-popup
    :show="modelValue"
    position="center"
    round
    class="area-dialog-popup"
    style="width: 80%"
    @update:show="handleUpdateShow"
  >
    <div class="area-dialog">
      <div class="area-dialog-header">
        <h3>修改平米数</h3>
        <p class="area-dialog-desc">订单暂无工价清单，请先确认或修改平米数</p>
      </div>
      <div class="area-dialog-body">
        <van-field
          v-model="areaInput"
          type="digit"
          label="平米数"
          placeholder="请输入平米数"
          class="area-field"
        />
      </div>
      <div class="area-dialog-footer">
        <van-button block round class="cancel-btn" @click="handleCancel">继续创建</van-button>
        <van-button block round type="primary" class="confirm-btn" @click="handleConfirm">
          确定修改
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps<{
  modelValue: boolean
  defaultArea?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [area: string]
  cancel: []
}>()

const areaInput = ref('')

watch(
  () => props.modelValue,
  (show) => {
    if (show) {
      areaInput.value = String(props.defaultArea ?? '')
    }
  },
  { immediate: true }
)

const handleUpdateShow = (show: boolean) => {
  emit('update:modelValue', show)
  // 仅同步关闭状态，不在此处 emit cancel，避免与父组件主动关闭冲突
}

const handleConfirm = () => {
  const areaVal = areaInput.value?.trim()
  if (!areaVal) {
    showToast('请输入平米数')
    return
  }
  emit('confirm', areaVal)
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style lang="less" scoped>
.area-dialog-popup {
  background: #fff;
}

.area-dialog {
  padding: 16px 16px 14px;

  .area-dialog-header {
    margin-bottom: 12px;

    h3 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }

    .area-dialog-desc {
      margin: 0;
      font-size: 12px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }
  }

  .area-dialog-body {
    margin-bottom: 16px;

    :deep(.area-field) {
      padding: 10px 12px;
      background: var(--color-background);
      border-radius: 8px;

      .van-field__label {
        width: 56px;
        font-size: 14px;
        color: var(--color-text-secondary);
      }

      .van-field__control {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .area-dialog-footer {
    display: flex;
    gap: 8px;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 36px;
      font-size: 14px;
    }

    .cancel-btn {
      font-weight: 500;
      color: var(--color-text-secondary);
      background: var(--color-background);
      border: none;
    }

    .confirm-btn {
      font-weight: 600;
    }
  }
}

:deep(.van-popup__close-icon) {
  top: 12px;
  right: 12px;
  font-size: 18px;
  color: var(--color-text-placeholder);
}
</style>
