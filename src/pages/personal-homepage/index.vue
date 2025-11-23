<template>
  <div class="page">
    <custom-van-navbar />
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

        <div class="upload-item">
          <div class="upload-label">上传荣誉证书：</div>
          <van-uploader
            v-model="personalInfo.awards_image"
            :max-count="1"
            :after-read="handleAwardsImageUpload"
            accept="image/*"
            :deletable="!personalInfo?.isHomePageVerified"
          />
        </div>
      </section>
    </main>
    <footer v-show="!personalInfo?.isHomePageVerified" class="fade-in-up">
      <van-button type="primary" size="large" round block @click="handleSubmit" class="save-btn">
        <van-icon name="success" />
        提交审核
      </van-button>
    </footer>
  </div>
</template>

<script setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import SectionTitle from '@/components/section-title.vue'
import { uploadImage } from '@/service'
import { homePageAuditService, getHomePageAuditService } from './service'
import { useRouter } from 'vue-router'

const router = useRouter()

const personalInfo = ref({
  intro: '',
  awards: '',
  awards_image: []
})

/**
 * 上传奖项图片
 * @param file
 */
const handleAwardsImageUpload = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  personalInfo.value.awards_image = [{ url: data.url }]
}

/**
 * 提交审核
 */
const handleSubmit = async () => {
  console.log(personalInfo.value)

  const { awards_image, intro, awards } = personalInfo.value

  if (!awards_image?.length || !awards || !intro) {
    showToast('请上传荣誉证书和奖项名称')
    return
  }

  const { success } = await homePageAuditService({
    ...personalInfo.value
  })

  if (!success) return
  showToast('提交成功，审核中......')
  router.back()
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
  overscroll-behavior: none; /* 阻止过度滚动 */
}

main {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  overscroll-behavior: contain; /* 防止滚动穿透 */
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
      color: #646566;
      font-weight: 500;
    }
  }

  .upload-item {
    :deep(.van-uploader) {
      width: 100%;
    }

    :deep(.van-uploader__upload) {
      width: 100%;
      height: 150px;
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
      height: 150px;
      margin: 0;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }

    :deep(.van-uploader__preview-image) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    :deep(.van-uploader__preview-delete) {
      background: rgba(0, 0, 0, 0.5);
      z-index: 10;
      position: absolute;
      width: 30px;
      height: 30px;
      font-size: 16px;

      .van-icon {
        font-size: 30px;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
