<template>
  <div class="page">
    <custom-van-navbar />
    <van-steps :active="active">
      <van-step>上传承诺书</van-step>
      <van-step>上传实操视频</van-step>
      <van-step>认证审核</van-step>
    </van-steps>
    <main class="fade-in-up">
      <div class="info-card fade-in-up shine-effect" style="animation-delay: 0.1s">
        <div class="info-label">已选择工种</div>
        <div class="info-value">{{ selectedWorkKind.workKindName }}</div>
      </div>

      <section v-show="active === 0 || active === 2">
        <section-title title="上传承诺书" />
        <van-uploader
          class="upload-item"
          v-model="skillInfo.promise_image"
          :max-count="1"
          :after-read="handlePromiseImageUpload"
          accept="image/*"
          :deletable="!skillInfo?.isSkillVerified"
        />
      </section>

      <section v-show="active === 1 || active === 2">
        <section-title title="上传实操视频" />
        <van-uploader
          class="upload-item"
          v-model="skillInfo.operation_video"
          :max-count="1"
          :after-read="handleOperationVideoUpload"
          accept="video/*"
          :deletable="!skillInfo?.isSkillVerified"
        >
          <template #preview-cover>
            <div class="video-preview-cover">
              <video
                v-if="skillInfo.operation_video[0]?.url"
                :src="skillInfo.operation_video[0]?.url"
                class="video-thumbnail"
                controls
              />
            </div>
          </template>
        </van-uploader>
      </section>
    </main>
    <footer>
      <van-button
        v-if="active > 0"
        type="primary"
        size="large"
        round
        block
        native-type="submit"
        class="save-btn"
        @click="prevStep"
      >
        上一步
      </van-button>
      <van-button
        v-if="active < 2"
        type="primary"
        size="large"
        round
        block
        native-type="submit"
        class="save-btn"
        @click="nextStep"
      >
        下一步
      </van-button>
      <van-button
        v-if="active === 2"
        v-show="!skillInfo?.isSkillVerified"
        type="primary"
        size="large"
        round
        block
        native-type="submit"
        class="save-btn"
        @click="submit"
      >
        提交认证
      </van-button>
    </footer>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
import SectionTitle from '@/components/section-title.vue'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { uploadImage } from '@/service'
import { isSkillVerifiedService, getIsSkillVerifiedService } from './service'
import { useRouter } from 'vue-router'

const router = useRouter()

const active = ref(0)
const selectedWorkKind = ref({
  workKindId: '',
  workKindName: ''
})

const skillInfo = ref({
  promise_image: [],
  operation_video: []
})

// 下一步
const nextStep = () => {
  active.value++
}

// 上一步
const prevStep = () => {
  if (active.value > 0) {
    active.value--
  }
}

/**
 * 上传承诺书
 * @param file
 */
const handlePromiseImageUpload = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  skillInfo.value.promise_image = [{ url: data.url }]
}

/**
 * 上传实操视频
 * @param file
 */
const handleOperationVideoUpload = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  skillInfo.value.operation_video = [{ url: data.url }]
}

// 提交认证
const submit = async () => {
  const { promise_image, operation_video } = skillInfo.value

  if (!promise_image?.length || !operation_video?.length) {
    showToast('请上传承诺书和实操视频')
    return
  }

  const { success } = await isSkillVerifiedService({
    ...skillInfo.value,
    ...selectedWorkKind.value
  })

  if (!success) return
  showToast('提交成功，审核中......')
  router.back()
}

// 获取用户信息
const getisSkillVerified = async () => {
  const { success, data } = await getIsSkillVerifiedService()
  if (!success) return

  selectedWorkKind.value.workKindId = data.workKindId || route?.query?.workKindId
  selectedWorkKind.value.workKindName = data.workKindName || route?.query?.workKindName

  skillInfo.value.promise_image = data.promise_image
  skillInfo.value.operation_video = data.operation_video
  skillInfo.value.isSkillVerified = data.isSkillVerified
}

onMounted(() => {
  getisSkillVerified()
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

footer {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 12px;

  .save-btn {
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
}

.info-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.info-label {
  font-size: 13px;
  color: #969799;
  margin-bottom: 8px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

section {
  margin: 12px 0px;
  padding: 12px;

  background: #fff;
  border-radius: 12px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  pointer-events: none;
}

.upload-item {
  margin: 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;

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
</style>
