<template>
  <div class="page">
    <main class="fade-in-up">
      <section>
        <section-title title="个人简介" />
        <div class="field-item">
          <div class="field-label">个人简介：</div>
          <van-field
            v-model="personalInfo.intro"
            rows="3"
            autosize
            type="textarea"
            maxlength="300"
            placeholder="请输入个人简介"
            show-word-limit
          />
        </div>
      </section>
      <section>
        <section-title title="荣誉奖项" />
        <div class="field-item">
          <div class="field-label">奖项名称：</div>
          <van-field
            v-model="personalInfo.awards"
            name="awards"
            placeholder="请填写奖项名称"
            maxlength="20"
            show-word-limit
            :rules="[{ required: true, message: '请填写奖项名称' }]"
          />
        </div>

        <div class="upload-item" @click="handleChooseImage">
          <div class="upload-label">上传荣誉证书：</div>
          <div v-if="personalInfo.awards_image?.[0]?.url" class="image-preview">
            <img :src="personalInfo.awards_image[0].url" alt="荣誉证书" />
            <div
              v-if="!personalInfo?.isHomePageVerified"
              class="delete-btn"
              @click.stop="handleDeleteImage"
            >
              <van-icon name="cross" />
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <van-icon name="photograph" size="24" />
            <span>点击上传</span>
          </div>
        </div>
      </section>
    </main>
    <footer class="fade-in-up">
      <van-button type="primary" size="large" round block @click="handleSubmit" class="save-btn">
        <van-icon name="success" />
        提交审核
      </van-button>
    </footer>
  </div>
</template>

<script setup>
import SectionTitle from '@/components/section-title.vue'
import { showToast } from 'vant'
import { getToken, waitForFitmentFlutter } from '@/utils'
import { homePageAuditService, getHomePageAuditService } from './service'

const personalInfo = ref({
  intro: '',
  awards: '',
  awards_image: []
})

/**
 * 选择并上传图片（使用 Flutter 原生方法，支持自动上传）
 */
const handleChooseImage = async () => {
  const bridge = await waitForFitmentFlutter()
  if (!bridge) {
    showToast('请在 App 中使用此功能')
    return
  }

  try {
    // 使用 Flutter 原生方法选择图片并自动上传
    const res = await bridge.chooseImage({
      count: 1,
      upload: {
        url: '/upload', // 上传接口路径（Flutter 会自动处理环境配置）
        name: 'file', // 文件字段名
        headers: {
          Authorization: `Bearer ${getToken()}` // 添加 token
        },
        formData: {
          biz: 'awards' // 业务标识（可选）
        }
      }
    })

    if (!res?.tempFiles?.length) {
      // 用户取消选择或上传失败
      return
    }

    const fileInfo = res.tempFiles[0]
    // window.alert(JSON.stringify(fileInfo))

    // 检查是否有错误
    if (fileInfo.error) {
      showToast(fileInfo.error || '上传失败，请重试')
      return
    }

    // 更新 awards_image
    if (fileInfo.url) {
      personalInfo.value.awards_image = [{ url: fileInfo.url }]
      showToast('上传成功')
    }
  } catch (error) {
    console.error('选择或上传图片失败:', error)
    showToast('操作失败，请重试')
  }
}

/**
 * 删除图片
 */
const handleDeleteImage = () => {
  if (personalInfo.value?.isHomePageVerified) {
    return
  }
  personalInfo.value.awards_image = []
}

/**
 * 提交审核
 */
const handleSubmit = async () => {
  const { awards_image, intro, awards } = personalInfo.value

  if (!awards_image?.length || !awards || !intro) {
    showToast('请上传荣誉证书和奖项名称')
    return
  }

  const { success } = await homePageAuditService({
    ...personalInfo.value
  })

  if (success) {
    showToast('提交成功，审核中......')
  }
}

const getHomePageAudit = async () => {
  const { success, data } = await getHomePageAuditService()
  if (!success) return
  personalInfo.value = data ?? {}
}

onMounted(() => {
  getHomePageAudit()
})
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
  /* 防止整个页面被拉动 */
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
  /* 阻止过度滚动 */
}

main {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* iOS 平滑滚动 */
  overscroll-behavior: contain;
  /* 防止滚动穿透 */
}

footer {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  display: flex;
  gap: 8px;

  .save-btn {
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

section {
  margin: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;

  :deep(.van-cell) {
    margin-top: 12px;
    padding: 0;
    font-size: 14px;
    font-weight: 500;

    &::after {
      left: 0;
      right: 0;
    }
  }

  .field-item,
  .upload-item {
    margin: 12px 0px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .field-label,
    .upload-label {
      font-size: 14px;
      color: var(--color-text-placeholder);
      font-weight: 500;
    }
  }

  .upload-item {
    cursor: pointer;
    min-height: 150px;
    position: relative;

    .image-preview {
      width: 100%;
      height: 150px;
      position: relative;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 30px;
        height: 30px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;

        .van-icon {
          color: #fff;
          font-size: 18px;
        }
      }
    }

    .upload-placeholder {
      width: 100%;
      height: 150px;
      background: #f7f8fa;
      border: 1px dashed #dcdee0;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
      color: var(--color-text-secondary);

      &:active {
        background: #f2f3f5;
        border-color: var(--van-primary-color);
      }

      span {
        font-size: 14px;
      }
    }
  }
}
</style>
