<template>
  <van-popup
    :show="modelValue"
    position="bottom"
    round
    closeable
    class="area-dialog-popup"
    @update:show="handleUpdateShow"
  >
    <div class="area-dialog">
      <div class="area-dialog-header">
        <h3>修改房屋信息</h3>
        <p class="area-dialog-desc">请务必联系用户确认好信息再创建工价！</p>
      </div>
      <div class="area-dialog-body">
        <van-field
          v-model="form.housing_name"
          label="小区名称"
          placeholder="请输入小区名称"
          maxlength="200"
          show-word-limit
          class="area-field"
        />
        <van-field
          v-model="form.location"
          label="详细地址"
          placeholder="请输入详细地址"
          maxlength="200"
          show-word-limit
          class="area-field"
        />
        <van-field
          v-model="form.roomType"
          label="户型"
          placeholder="请输入户型"
          maxlength="50"
          show-word-limit
          class="area-field"
        />
        <van-field
          v-model="form.area"
          type="number"
          label="面积"
          placeholder="请输入平米数"
          class="area-field"
        />
        <van-field
          v-model="form.remark"
          type="textarea"
          label="备注"
          placeholder="请输入备注"
          maxlength="800"
          rows="3"
          autosize
          show-word-limit
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

interface HouseInfoForm {
  housing_name?: string
  location?: string
  roomType?: string
  area?: string
  remark?: string
}

const props = defineProps<{
  modelValue: boolean
  defaultInfo?: HouseInfoForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [form: HouseInfoForm]
  cancel: []
}>()

const form = ref<HouseInfoForm>({
  housing_name: '',
  location: '',
  roomType: '',
  area: '',
  remark: ''
})

const normalizeForm = (value?: HouseInfoForm): HouseInfoForm => ({
  housing_name: String(value?.housing_name ?? ''),
  location: String(value?.location ?? ''),
  roomType: String(value?.roomType ?? ''),
  area: String(value?.area ?? ''),
  remark: String(value?.remark ?? '')
})

watch(
  () => props.modelValue,
  (show) => {
    if (show) {
      form.value = normalizeForm(props.defaultInfo)
    }
  },
  { immediate: true }
)

const handleUpdateShow = (show: boolean) => {
  emit('update:modelValue', show)
  // 仅同步关闭状态，不在此处 emit cancel，避免与父组件主动关闭冲突
}

const handleConfirm = () => {
  emit('confirm', {
    housing_name: form.value.housing_name?.trim(),
    location: form.value.location?.trim(),
    roomType: form.value.roomType?.trim(),
    area: form.value.area?.trim(),
    remark: form.value.remark?.trim()
  })
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style lang="less" scoped>
.area-dialog-popup {
  background: #fff;
  max-height: 86vh;
}

.area-dialog {
  display: flex;
  flex-direction: column;
  max-height: 86vh;
  padding: 18px 16px calc(14px + env(safe-area-inset-bottom));

  .area-dialog-header {
    flex-shrink: 0;
    margin-bottom: 14px;
    text-align: center;

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
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;
    -webkit-overflow-scrolling: touch;

    :deep(.area-field) {
      padding: 10px 12px;
      background: var(--color-background);
      border-radius: 8px;
      margin-bottom: 10px;

      .van-field__label {
        width: 72px;
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
    flex-shrink: 0;
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
