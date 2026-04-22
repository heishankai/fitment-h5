<template>
  <van-form class="page" @submit="onSubmit" :readonly="cardInfo?.isVerified">
    <main class="work-kind-info fade-in-up">
      <div class="form-section">
        <h3 class="section-title">上传证件照片</h3>
        <div class="upload-group">
          <div class="upload-item" @click="handleChooseFrontImage">
            <div class="upload-label">身份证正面</div>
            <div v-if="cardInfo.card_front_image?.[0]?.url" class="image-preview">
              <img :src="cardInfo.card_front_image[0].url" alt="身份证正面" />
              <div
                v-if="!cardInfo?.isVerified"
                class="delete-btn"
                @click.stop="handleDeleteFrontImage"
              >
                <van-icon name="cross" />
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <van-icon name="photograph" size="24" />
              <span>点击上传</span>
            </div>
          </div>
          <div class="upload-item" @click="handleChooseReverseImage">
            <div class="upload-label">身份证反面</div>
            <div v-if="cardInfo.card_reverse_image?.[0]?.url" class="image-preview">
              <img :src="cardInfo.card_reverse_image[0].url" alt="身份证反面" />
              <div
                v-if="!cardInfo?.isVerified"
                class="delete-btn"
                @click.stop="handleDeleteReverseImage"
              >
                <van-icon name="cross" />
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <van-icon name="photograph" size="24" />
              <span>点击上传</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">证件信息</h3>
        <van-field
          v-model="cardInfo.card_name"
          name="card_name"
          label="姓名"
          placeholder="请填写证件姓名"
          :rules="[{ required: true, message: '请填写姓名' }]"
        />
        <van-field
          v-model="cardInfo.card_number"
          name="card_number"
          label="身份证号"
          placeholder="请填写身份证号"
          maxlength="18"
          :rules="[
            { required: true, message: '请填写号码' },
            {
              validator: (v) => (v?.length ?? 0) >= 15 && (v?.length ?? 0) <= 18,
              message: '证件号码长度为15-18位'
            }
          ]"
        />
        <van-field
          v-model="cardInfo.card_address"
          name="card_address"
          label="住址"
          placeholder="请填写证件住址"
          :rules="[{ required: true, message: '请填写住址' }]"
        />
      </div>
    </main>
    <footer class="fade-in-up">
      <van-button type="primary" size="large" round block native-type="submit" class="save-btn">
        提交认证
      </van-button>
    </footer>
  </van-form>
</template>

<script setup>
import { getToken, waitForFitmentFlutter } from '@/utils'
import { showToast } from 'vant'
import { isVerifiedService, getIsVerifiedService } from './service'

const cardInfo = ref({
  // 证件正面图片
  card_front_image: [],
  // 证件反面图片
  card_reverse_image: [],
  // 证件名称
  card_name: '',
  // 证件号码
  card_number: '',
  // 证件住址
  card_address: '',
  // 有效期
  period_of_validity: ''
})

/**
 * 选择并上传身份证正面（使用 Flutter 原生方法）
 */
const handleChooseFrontImage = async () => {
  if (cardInfo.value?.isVerified) return

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
        url: '/upload',
        name: 'file',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        formData: {
          biz: 'id_card_front'
        }
      }
    })

    if (!res || !res.tempFiles || res.tempFiles.length === 0) {
      return
    }

    const fileInfo = res.tempFiles[0]

    if (fileInfo.error) {
      showToast(fileInfo.error || '上传失败，请重试')
      return
    }

    if (fileInfo.url) {
      cardInfo.value.card_front_image = [{ url: fileInfo.url }]
      showToast('上传成功')
    } else {
      showToast('上传失败：未返回图片URL')
    }
  } catch (error) {
    console.error('选择或上传图片失败:', error)
    showToast('操作失败，请重试')
  }
}

/**
 * 选择并上传身份证反面（使用 Flutter 原生方法）
 */
const handleChooseReverseImage = async () => {
  if (cardInfo.value?.isVerified) return

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
        url: '/upload',
        name: 'file',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        formData: {
          biz: 'id_card_reverse'
        }
      }
    })

    if (!res || !res.tempFiles || res.tempFiles.length === 0) {
      return
    }

    const fileInfo = res.tempFiles[0]

    if (fileInfo.error) {
      showToast(fileInfo.error || '上传失败，请重试')
      return
    }

    if (fileInfo.url) {
      cardInfo.value.card_reverse_image = [{ url: fileInfo.url }]
      showToast('上传成功')
    } else {
      showToast('上传失败：未返回图片URL')
    }
  } catch (error) {
    console.error('选择或上传图片失败:', error)
    showToast('操作失败，请重试')
  }
}

/**
 * 删除身份证正面
 */
const handleDeleteFrontImage = () => {
  if (cardInfo.value?.isVerified) return
  cardInfo.value.card_front_image = []
}

/**
 * 删除身份证反面
 */
const handleDeleteReverseImage = () => {
  if (cardInfo.value?.isVerified) return
  cardInfo.value.card_reverse_image = []
}

// 提交认证
const onSubmit = async (values) => {
  const { card_front_image, card_reverse_image } = cardInfo.value

  if (!card_front_image?.length || !card_reverse_image?.length) {
    showToast('请上传身份证照片')
    return
  }

  const { success } = await isVerifiedService({ ...values, card_front_image, card_reverse_image })

  if (!success) return
  showToast('提交成功，审核中......')
}

// 获取用户信息
const getUserInfo = async () => {
  const { success, data } = await getIsVerifiedService()
  if (!success || !data) return
  cardInfo.value = data
}

onMounted(() => {
  getUserInfo()
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
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.form-section {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  padding: 16px 16px 8px;
  font-size: 16px;
  font-weight: 600;
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
    background: var(--van-primary-color);
    border-radius: 2px;
  }
}

.upload-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 16px 16px;
}

.upload-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  min-height: 120px;

  .image-preview {
    width: 100%;
    height: 120px;
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
    height: 120px;
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

.upload-label {
  font-size: 13px;
  color: var(--color-text-placeholder);
  font-weight: 500;
}

:deep(.van-cell) {
  padding: 12px 16px;

  &:not(:last-child)::after {
    left: 16px;
    right: 16px;
  }
}

footer {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);

  .save-btn {
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}
</style>
