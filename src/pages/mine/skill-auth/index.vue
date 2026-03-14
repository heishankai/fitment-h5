<template>
  <div class="page">
    <van-steps :active="active">
      <van-step>上传承诺书</van-step>
      <van-step>上传实操视频</van-step>
      <van-step>认证审核</van-step>
    </van-steps>
    <main class="fade-in-up">
      <van-field
        class="info-card fade-in-up shine-effect"
        v-model="selectedWorkKind.work_kind_name"
        is-link
        readonly
        label="工种"
        placeholder="请选择工种"
        @click="showPicker = true"
        required
      />

      <van-field
        v-model="skillInfo.work_years"
        class="info-card fade-in-up"
        type="digit"
        label="工龄"
        required
        placeholder="请输入工龄（年）"
        :readonly="skillInfo?.isSkillVerified"
        maxlength="2"
      >
        <template #button>
          <span>年</span>
        </template></van-field
      >

      <van-field
        v-model="skillInfo.skill_intro"
        class="info-card fade-in-up"
        type="textarea"
        label="技能介绍"
        required
        placeholder="请简要介绍您的专业技能与经验"
        rows="4"
        maxlength="200"
        show-word-limit
        :readonly="skillInfo?.isSkillVerified"
      />

      <section v-show="active === 0 || active === 2">
        <section-title title="上传承诺书" />
        <div class="upload-item" @click="handleChoosePromiseImage">
          <div v-if="skillInfo.promise_image?.[0]?.url" class="image-preview">
            <img :src="skillInfo.promise_image[0].url" alt="承诺书" />
            <div
              v-if="!skillInfo?.isSkillVerified"
              class="delete-btn"
              @click.stop="handleDeletePromiseImage"
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

      <section v-show="active === 1 || active === 2">
        <section-title title="上传实操视频" />
        <div class="upload-item" @click="handleChooseOperationVideo">
          <div v-if="skillInfo.operation_video?.[0]?.url" class="video-preview">
            <video
              :src="skillInfo.operation_video[0].url"
              class="video-thumbnail"
              controls
              @click.stop
            />
            <div
              v-if="!skillInfo?.isSkillVerified"
              class="delete-btn"
              @click.stop="handleDeleteOperationVideo"
            >
              <van-icon name="cross" />
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <van-icon name="video-o" size="24" />
            <span>点击上传视频</span>
          </div>
        </div>
      </section>
    </main>
    <footer class="fade-in-up">
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
        v-if="active === 2 && !skillInfo?.isSkillVerified"
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
    <van-popup
      v-model:show="showPicker"
      destroy-on-close
      round
      position="bottom"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom)', maxHeight: '70vh' }"
      class="work-kind-picker-popup"
    >
      <div class="picker-header">
        <span class="picker-drag-bar" />
      </div>
      <van-picker
        title="选择工种"
        :columns="work_kind_list"
        :show-toolbar="true"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
import SectionTitle from '@/components/section-title.vue'
import { getToken, waitForFitmentFlutter } from '@/utils'
import {
  isSkillVerifiedService,
  getIsSkillVerifiedService,
  getWorkKindListService
} from './service'
import { useRouter } from 'vue-router'

const router = useRouter()

const showPicker = ref(false)
const work_kind_list = ref()

const active = ref(0)
const selectedWorkKind = ref({
  work_kind_code: '',
  work_kind_name: ''
})

const skillInfo = ref({
  promise_image: [],
  operation_video: [],
  work_years: '',
  skill_intro: ''
})

const onConfirm = ({ selectedOptions }) => {
  showPicker.value = false
  selectedWorkKind.value.work_kind_code = selectedOptions[0].value
  selectedWorkKind.value.work_kind_name = selectedOptions[0].text
}

// 获取工种信息
const getWorkKindList = async () => {
  const { success, data } = await getWorkKindListService()
  if (!success) return

  work_kind_list.value = (data || [])?.map((item) => ({
    text: item?.work_kind_name,
    value: item?.work_kind_code
  }))
}

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
 * 选择并上传承诺书（使用 Flutter 原生方法）
 */
const handleChoosePromiseImage = async () => {
  if (skillInfo.value?.isSkillVerified) return

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
          biz: 'promise_image'
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
      skillInfo.value.promise_image = [{ url: fileInfo.url }]
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
 * 选择并上传实操视频（使用 Flutter 原生方法）
 */
const handleChooseOperationVideo = async () => {
  if (skillInfo.value?.isSkillVerified) return

  const bridge = await waitForFitmentFlutter()
  if (!bridge) {
    showToast('请在 App 中使用此功能')
    return
  }

  try {
    // 使用 Flutter 原生方法选择视频并自动上传
    const res = await bridge.chooseMedia({
      count: 1,
      allowVideo: true,
      upload: {
        url: '/upload',
        name: 'file',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        formData: {
          biz: 'operation_video'
        }
      }
    })

    if (!res || res.length === 0) {
      return
    }

    const fileInfo = res[0]

    if (fileInfo.error) {
      showToast(fileInfo.error || '上传失败，请重试')
      return
    }

    if (fileInfo.url) {
      skillInfo.value.operation_video = [{ url: fileInfo.url }]
      showToast('上传成功')
    } else {
      showToast('上传失败：未返回视频URL')
    }
  } catch (error) {
    console.error('选择或上传视频失败:', error)
    showToast('操作失败，请重试')
  }
}

/**
 * 删除承诺书
 */
const handleDeletePromiseImage = () => {
  if (skillInfo.value?.isSkillVerified) return
  skillInfo.value.promise_image = []
}

/**
 * 删除实操视频
 */
const handleDeleteOperationVideo = () => {
  if (skillInfo.value?.isSkillVerified) return
  skillInfo.value.operation_video = []
}

// 提交认证
const submit = async () => {
  const { promise_image, operation_video } = skillInfo.value

  if (!selectedWorkKind.value.work_kind_code || !selectedWorkKind.value.work_kind_name) {
    showToast('请选择工种')
    return
  }

  if (!promise_image?.length || !operation_video?.length) {
    showToast('请上传承诺书和实操视频')
    return
  }

  if (!skillInfo.value.work_years?.trim()) {
    showToast('请输入工龄')
    return
  }

  if (!skillInfo.value.skill_intro?.trim()) {
    showToast('请填写技能介绍')
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

  selectedWorkKind.value.work_kind_code = data?.work_kind_code
  selectedWorkKind.value.work_kind_name = data?.work_kind_name

  skillInfo.value.promise_image = data?.promise_image ?? []
  skillInfo.value.operation_video = data?.operation_video ?? []
  skillInfo.value.work_years = data?.work_years ?? ''
  skillInfo.value.skill_intro = data?.skill_intro ?? ''
  skillInfo.value.isSkillVerified = data?.isSkillVerified
}

onMounted(() => {
  getisSkillVerified()
  getWorkKindList()
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
  padding: 24px;
  margin-bottom: 12px;
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
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
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

.upload-item {
  margin: 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  min-height: 150px;

  .image-preview,
  .video-preview {
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

    .video-thumbnail {
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
      pointer-events: auto;

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

/* 工种选择弹窗 */
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
