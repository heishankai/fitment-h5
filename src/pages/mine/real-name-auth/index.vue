<template>
  <van-form class="page" @submit="onSubmit" :readonly="cardInfo?.isVerified">
    <custom-van-navbar />
    <main class="work-kind-info fade-in-up">
      <div class="form-section">
        <h3 class="section-title">上传证件照片</h3>
        <div class="upload-group">
          <div class="upload-item">
            <div class="upload-label">身份证正面</div>
            <van-uploader
              v-model="cardInfo.card_front_image"
              :max-count="1"
              :after-read="handleFrontImageSelect"
              accept="image/*"
              :deletable="!cardInfo?.isVerified"
            />
          </div>
          <div class="upload-item">
            <div class="upload-label">身份证反面</div>
            <van-uploader
              v-model="cardInfo.card_reverse_image"
              :max-count="1"
              :after-read="handleReverseImageSelect"
              accept="image/*"
              :deletable="!cardInfo?.isVerified"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">证件信息</h3>
        <van-field
          v-model="cardInfo.card_name"
          name="card_name"
          label="证件名称"
          placeholder="请填写证件名称"
          :rules="[{ required: true, message: '请填写证件名称' }]"
        />
        <van-field
          v-model="cardInfo.card_number"
          name="card_number"
          label="证件号码"
          placeholder="请填写证件号码"
          :rules="[{ required: true, message: '请填写证件号码' }]"
        />
        <van-field
          v-model="cardInfo.card_address"
          name="card_address"
          label="证件住址"
          placeholder="请填写证件住址"
          :rules="[{ required: true, message: '请填写证件住址' }]"
        />
      </div>

      <div class="form-section">
        <h3 class="section-title">有效期</h3>
        <van-field
          v-model="cardInfo.card_start_date"
          :is-link="!cardInfo?.isVerified"
          readonly
          name="card_start_date"
          label="开始日期"
          placeholder="点击选择时间"
          @click="!cardInfo?.isVerified && (showStartPicker = true)"
        />
        <van-field
          v-model="cardInfo.card_end_date"
          :is-link="!cardInfo?.isVerified"
          readonly
          name="card_end_date"
          label="结束日期"
          placeholder="点击选择时间"
          @click="!cardInfo?.isVerified && (showEndDatePicker = true)"
        />
      </div>
    </main>
    <footer class="fade-in-up">
      <van-button type="primary" size="large" round block native-type="submit" class="save-btn">
        提交认证
      </van-button>
    </footer>
    <van-popup v-model:show="showStartPicker" destroy-on-close position="bottom">
      <van-date-picker @confirm="onConfirmStartPicker" @cancel="showStartPicker = false" />
    </van-popup>
    <van-popup v-model:show="showEndDatePicker" destroy-on-close position="bottom">
      <van-date-picker @confirm="onConfirmEndPicker" @cancel="showEndDatePicker = false" />
    </van-popup>
  </van-form>
</template>

<script setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'

import { uploadImage } from '@/service'
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
  // 证件有效期开始日期
  card_start_date: '',
  // 证件有效期结束日期
  card_end_date: ''
})

const showStartPicker = ref(false)
const showEndDatePicker = ref(false)

const onConfirmStartPicker = ({ selectedValues }) => {
  cardInfo.value.card_start_date = selectedValues.join('-')
  showStartPicker.value = false
}

const onConfirmEndPicker = ({ selectedValues }) => {
  cardInfo.value.card_end_date = selectedValues.join('-')
  showEndDatePicker.value = false
}

const handleFrontImageSelect = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  cardInfo.value.card_front_image = [{ url: data.url }]
}

const handleReverseImageSelect = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  cardInfo.value.card_reverse_image = [{ url: data.url }]
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

  :deep(.van-uploader) {
    width: 100%;
  }

  :deep(.van-uploader__upload) {
    width: 100%;
    height: 120px;
    margin: 0;
    background: #f7f8fa;
    border: 1px dashed #dcdee0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &:active {
      background: #f2f3f5;
      border-color: var(--van-primary-color);
    }
  }

  :deep(.van-uploader__preview) {
    width: 100%;
    height: 120px;
    margin: 0;
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.van-uploader__preview-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.van-uploader__preview-delete) {
    background: rgba(0, 0, 0, 0.5);
  }
}

.upload-label {
  font-size: 13px;
  color: #646566;
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
