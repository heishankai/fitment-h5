<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    class="production-popup"
  >
    <div class="popup-inner">
      <!-- 弹窗顶部 -->
      <div class="popup-header">
        <button class="close-btn" @click="handleClose"><van-icon name="cross" size="24" /></button>
        <h2 class="popup-title">发布作品</h2>
        <button
          class="publish-btn"
          :class="{ disabled: !canPublish }"
          :disabled="!canPublish"
          @click="handlePublish"
        >
          发布
        </button>
      </div>

      <div class="popup-body">
        <!-- 文本输入区 -->
        <div class="text-area-wrapper">
          <textarea
            v-model="publish_text"
            placeholder="分享工地的进度或心得（选填，最多200字）..."
            maxlength="200"
            class="text-input"
          />
          <div class="char-count">{{ publish_text.length }}/200</div>
        </div>

        <!-- 图片上传区 -->
        <div class="upload-section">
          <div class="upload-header">
            <span class="upload-label">工地图片</span>
            <span class="upload-count">{{ publish_images.length }}/5</span>
          </div>

          <div class="image-grid">
            <div v-for="(img, index) in publish_images" :key="index" class="image-item">
              <van-image :src="img" fit="cover" class="preview-image" />
              <button class="remove-btn" @click="handleRemoveImage(index)">
                <van-icon name="cross" size="14" color="#fff" />
              </button>
            </div>

            <button v-if="publish_images.length < 5" class="add-btn" @click="handleAddImage">
              <van-icon name="photo-o" size="32" />
              <span>添加图片</span>
            </button>
          </div>

          <p class="upload-tip">
            请上传真实的工地施工图片，最多支持 5 张。作品发布后需等待管理员审核。
          </p>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { getToken, waitForFitmentFlutter } from '@/utils'

const props = withDefaults(
  defineProps<{
    show: boolean
  }>(),
  { show: false }
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  publish: [payload: { publish_text: string; publish_images: string[] }]
}>()

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v)
})

const publish_text = ref('')
const publish_images = ref<string[]>([])

const canPublish = computed(
  () => publish_images.value.length > 0 || publish_text.value.trim() !== ''
)

const handleClose = () => {
  emit('update:show', false)
}

/**
 * 选择并上传图片（使用 Flutter 原生 bridge.chooseImage）
 */
const handleAddImage = async () => {
  if (publish_images.value.length >= 5) return

  const bridge = await waitForFitmentFlutter()
  if (!bridge) {
    showToast('请在 App 中使用此功能')
    return
  }

  const remainCount = 5 - publish_images.value.length

  try {
    const res = await bridge.chooseImage({
      count: remainCount,
      upload: {
        url: '/upload',
        name: 'file',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        formData: {
          biz: 'work'
        }
      }
    })

    if (!res?.tempFiles?.length) return

    const urls: string[] = []
    for (const fileInfo of res.tempFiles) {
      if (fileInfo.error) {
        showToast(fileInfo.error || '上传失败，请重试')
        return
      }
      if (fileInfo.url) {
        urls.push(fileInfo.url)
      }
    }

    if (urls.length) {
      publish_images.value = [...publish_images.value, ...urls]
      showToast('上传成功')
    }
  } catch (error) {
    console.error('选择或上传图片失败:', error)
    showToast('操作失败，请重试')
  }
}

const handleRemoveImage = (index: number) => {
  publish_images.value = publish_images.value.filter((_, i) => i !== index)
}

const handlePublish = () => {
  if (!canPublish.value) return
  emit('publish', {
    publish_text: publish_text.value,
    publish_images: [...publish_images.value]
  })
  publish_text.value = ''
  publish_images.value = []
  emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.production-popup {
  background: var(--color-bg);

  .popup-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
  }

  .popup-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--color-border);

    .close-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      margin: -8px 0 0 -8px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
    }

    .popup-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
      margin: 0;
    }

    .publish-btn {
      flex-shrink: 0;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      background: var(--color-primary);
      color: #fff;

      &.disabled {
        background: var(--color-background);
        color: var(--color-text-disabled);
        cursor: not-allowed;
      }
    }
  }

  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .text-area-wrapper {
    position: relative;
    margin-bottom: 24px;

    .text-input {
      width: 100%;
      height: 108px;
      background: transparent;
      font-size: 15px;
      color: var(--color-text);
      resize: none;
      outline: none;
      line-height: 1.6;
      border: none;
      font-family: inherit;

      &::placeholder {
        color: var(--color-text-placeholder);
      }
    }

    .char-count {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 12px;
      color: var(--color-text-placeholder);
    }
  }

  .upload-section {
    .upload-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .upload-label {
        font-size: 15px;
        font-weight: 500;
        color: var(--color-text);
      }

      .upload-count {
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .image-item {
      position: relative;
      aspect-ratio: 1;
      min-width: 0;

      .preview-image {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        overflow: hidden;
        display: block;

        :deep(.van-image) {
          width: 100%;
          height: 100%;
        }

        :deep(.van-image__img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .remove-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 1;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .add-btn {
      aspect-ratio: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
      border: 1px dashed var(--color-border);
      border-radius: 8px;
      color: var(--color-text-placeholder);
      cursor: pointer;
      transition: background 0.2s;

      &:active {
        background: var(--color-bg-hover);
      }

      span {
        font-size: 12px;
        margin-top: 4px;
      }
    }

    .upload-tip {
      font-size: 12px;
      color: var(--color-text-placeholder);
      margin-top: 12px;
      line-height: 1.5;
    }
  }
}
</style>
