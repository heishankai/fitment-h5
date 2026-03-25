<template>
  <div class="page-container">
    <main>
      <!-- 位置信息 -->
      <section class="section location-section fade-in-up">
        <div class="location-content">
          <van-icon name="location-o" class="location-icon" />
          <span class="location-text">{{ construction_progress.location || '定位中...' }}</span>
        </div>
      </section>

      <!-- 施工照片 -->
      <section class="section photos-section fade-in-up" :style="{ animationDelay: '0.1s' }">
        <h2 class="section-title">施工照片</h2>
        <div class="photos-content">
          <div class="photos-count">{{ construction_progress.photos?.length || 0 }}/5</div>
          <div class="photos-grid">
            <!-- 已上传的照片 -->
            <div
              v-for="(photo, index) in construction_progress.photos"
              :key="index"
              class="photo-item"
            >
              <img :src="photo.url" alt="施工照片" @click="previewImage(photo.url)" />
              <div class="delete-btn" @click.stop="removePhoto(index)">
                <van-icon name="cross" />
              </div>
            </div>
            <!-- 上传按钮 -->
            <div
              v-if="(construction_progress.photos?.length || 0) < 5"
              class="photo-item upload-btn"
              @click="handleChoosePhotos"
            >
              <van-icon name="plus" size="24" />
              <span>添加照片</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 打卡区域 -->
      <section class="section check-in-section fade-in-up" :style="{ animationDelay: '0.2s' }">
        <h2 class="section-title">打卡记录</h2>
        <div class="check-in-wrapper">
          <!-- 上班打卡 -->
          <div class="check-in-card shine-effect">
            <div class="check-in-header">
              <van-icon name="clock-o" class="check-in-icon" />
              <span class="check-in-label">上班打卡</span>
            </div>
            <div class="check-in-content">
              <time
                v-if="construction_progress.start_time"
                class="check-in-time"
                :datetime="construction_progress.start_time"
              >
                {{ formatTime(construction_progress.start_time) }}
              </time>
              <span v-else class="check-in-placeholder">未打卡</span>
            </div>
            <van-button
              type="primary"
              size="normal"
              round
              block
              @click="handleCheckIn('start')"
              :disabled="!!construction_progress.start_time"
              class="check-in-btn"
            >
              {{ construction_progress.start_time ? '已打卡' : '打卡' }}
            </van-button>
          </div>

          <!-- 下班打卡 -->
          <div class="check-in-card shine-effect" :style="{ animationDelay: '0.05s' }">
            <div class="check-in-header">
              <van-icon name="clock-o" class="check-in-icon" />
              <span class="check-in-label">下班打卡</span>
            </div>
            <div class="check-in-content">
              <time
                v-if="construction_progress.end_time"
                class="check-in-time"
                :datetime="construction_progress.end_time"
              >
                {{ formatTime(construction_progress.end_time) }}
              </time>
              <span v-else class="check-in-placeholder">未打卡</span>
            </div>
            <van-button
              type="success"
              size="normal"
              round
              block
              @click="handleCheckIn('end')"
              :disabled="!!construction_progress.end_time"
              class="check-in-btn"
            >
              {{ construction_progress.end_time ? '已打卡' : '打卡' }}
            </van-button>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <van-button
        type="primary"
        size="normal"
        round
        class="action-btn"
        @click="onSave"
        :loading="saving"
      >
        <van-icon name="save-o" />
        保存
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import dayjs from 'dayjs'
// utils
import { getToken, waitForFitmentFlutter } from '@/utils'
import { saveConstructionProgress } from './service'
import { getUserLocation, formatTime, validateProgress } from './utils'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const orderId = Number(route.params.id)
const STORAGE_KEY = `construction_progress_${orderId}`

const construction_progress = ref({
  start_time: '',
  end_time: '',
  location: '',
  photos: [] as Array<{ url: string }>
})

// 从本地存储加载数据
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      const savedDate = data.savedDate
      const today = dayjs().format('YYYY-MM-DD')

      // 如果是隔天，清空数据
      if (savedDate !== today) {
        clearStorage()
        construction_progress.value = {
          start_time: '',
          end_time: '',
          location: '',
          photos: []
        }
        return
      }

      // 同一天，恢复数据
      construction_progress.value = {
        ...construction_progress.value,
        ...data,
        photos: data.photos || []
      }
    }
  } catch (error) {
    console.error('加载本地数据失败:', error)
  }
}

// 保存到本地存储
const saveToStorage = () => {
  try {
    const dataToSave = {
      ...construction_progress.value,
      savedDate: dayjs().format('YYYY-MM-DD') // 保存当前日期
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }
}

// 清除本地存储
const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('清除本地存储失败:', error)
  }
}

// 监听数据变化，自动保存到本地存储
watch(
  () => construction_progress.value,
  () => {
    saveToStorage()
  },
  { deep: true }
)

// 打卡处理
const handleCheckIn = (type: 'start' | 'end') => {
  // 使用 dayjs 获取当前时间并格式化为 YYYY-MM-DD HH:mm
  const timeStr = dayjs().format('YYYY-MM-DD HH:mm')

  if (type === 'start') {
    construction_progress.value.start_time = timeStr
    showToast('上班打卡成功')
  } else {
    construction_progress.value.end_time = timeStr
    showToast('下班打卡成功')
  }
}

/**
 * 选择并上传照片（使用 Flutter 原生方法，支持多选）
 */
const handleChoosePhotos = async () => {
  const bridge = await waitForFitmentFlutter()
  if (!bridge) {
    showToast('请在 App 中使用此功能')
    return
  }

  const remainingCount = 5 - (construction_progress.value.photos?.length || 0)
  if (remainingCount <= 0) {
    showToast('最多只能上传5张照片')
    return
  }

  try {
    // 使用 Flutter 原生方法选择图片并自动上传
    const res = await bridge.chooseImage({
      count: remainingCount, // 最多选择剩余数量
      upload: {
        url: '/upload',
        name: 'file',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        formData: {
          biz: 'construction_photo'
        }
      }
    })

    if (!res || !res.tempFiles || res.tempFiles.length === 0) {
      return
    }

    // 处理上传结果
    const uploadedPhotos: Array<{ url: string }> = []
    for (const fileInfo of res.tempFiles) {
      if (fileInfo.error) {
        showToast(fileInfo.error || '上传失败，请重试')
        continue
      }

      if (fileInfo.url) {
        uploadedPhotos.push({ url: fileInfo.url })
      }
    }

    // 添加到照片列表
    if (uploadedPhotos.length > 0) {
      construction_progress.value.photos = [
        ...(construction_progress.value.photos || []),
        ...uploadedPhotos
      ]
      showToast(`成功上传${uploadedPhotos.length}张照片`)
    }
  } catch (error) {
    console.error('选择或上传照片失败:', error)
    showToast('操作失败，请重试')
  }
}

/**
 * 删除照片
 */
const removePhoto = (index: number) => {
  construction_progress.value.photos.splice(index, 1)
}

/**
 * 预览图片
 */
const previewImage = (url: string) => {
  const images = construction_progress.value.photos.map((p) => p.url)
  const startPosition = images.indexOf(url)
  showImagePreview({
    images,
    startPosition: startPosition >= 0 ? startPosition : 0
  })
}

const onSave = async () => {
  // 校验必填项
  const errorMsg = validateProgress(construction_progress.value)
  if (errorMsg) {
    showToast(errorMsg)
    return
  }

  try {
    saving.value = true

    const { success } = await saveConstructionProgress({
      orderId,
      ...construction_progress.value,
      photos: construction_progress.value.photos.map((p) => p.url)
    })

    if (!success) return

    // 保存成功后清除本地存储
    clearStorage()
    showToast('保存成功')
    router.back()
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // 先加载本地存储的数据
  loadFromStorage()
  // 然后获取位置信息（如果位置为空）
  if (!construction_progress.value.location) {
    getUserLocation(construction_progress)
  }
})
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 8px;
  display: flex;
  flex-direction: column;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* 位置信息 */
.location-section {
  .location-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;

    .location-icon {
      font-size: 16px;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .location-text {
      font-size: 14px;
      color: var(--color-text);
      flex: 1;
      line-height: 1.5;
      word-break: break-all;
      transition: color 0.3s ease;
    }
  }

  &:hover .location-icon {
    transform: scale(1.2);
  }
}

/* 打卡区域 */
.check-in-section {
  .check-in-wrapper {
    display: flex;
    gap: 10px;
  }

  .check-in-card {
    flex: 1;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .check-in-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      .check-in-icon {
        font-size: 18px;
        color: var(--color-primary);
        transition: transform 0.3s ease;
      }

      .check-in-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .check-in-content {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;

      .check-in-time {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text);
        text-align: center;
      }

      .check-in-placeholder {
        font-size: 12px;
        color: var(--color-text-secondary);
        text-align: center;
      }
    }

    .check-in-btn {
      height: 36px;
      font-weight: 600;
      margin-top: auto;
    }
  }
}

/* 照片区域 */
.photos-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .photos-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .photos-count {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      text-align: right;
    }

    .photos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .photo-item {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
      }

      .delete-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        cursor: pointer;

        .van-icon {
          color: #fff;
          font-size: 12px;
        }
      }

      &.upload-btn {
        background: #f7f8fa;
        border: 1px dashed #dcdee0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--color-text-secondary);

        &:active {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.05);
        }

        span {
          font-size: 10px;
          margin-top: 2px;
        }
      }
    }
  }
}

footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);

  display: flex;
  gap: 10px;

  .action-btn {
    flex: 1;
    height: 44px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .van-icon {
      font-size: 16px;
    }
  }
}
</style>
