<template>
  <div class="page-container">
    <custom-van-navbar />

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
          <van-uploader
            v-model="construction_progress.photos"
            :max-count="5"
            :after-read="handleUploadPhoto"
            accept="image/*"
            :preview-full-image="true"
            class="photo-uploader"
          />
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
import { showToast } from 'vant'
import dayjs from 'dayjs'
// components
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
// utils
import { saveConstructionProgress } from './service'
import { uploadImage } from '@/service'
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

// 上传照片
const handleUploadPhoto = async (file: any) => {
  const res: any = await uploadImage(file.file)
  if (!res?.success || !res?.data?.url) return
  file.url = res.data.url
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
      progress: {
        ...construction_progress.value,
        photos: construction_progress.value.photos.map((p) => p.url)
      }
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
  color: #323233;
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
      color: #00cec9;
      flex-shrink: 0;
      transition: transform 0.3s ease;
      animation: pulse 2s infinite;
    }

    .location-text {
      font-size: 14px;
      color: #323233;
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    animation: fadeInUp 0.4s ease-out both;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #00cec9;

      .check-in-icon {
        transform: rotate(15deg) scale(1.1);
      }
    }

    .check-in-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      .check-in-icon {
        font-size: 18px;
        color: #00cec9;
        transition: transform 0.3s ease;
      }

      .check-in-label {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
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
        color: #323233;
        text-align: center;
      }

      .check-in-placeholder {
        font-size: 12px;
        color: #969799;
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
      color: #969799;
      margin-bottom: 8px;
      text-align: right;
    }

    .photo-uploader {
      flex: 1;
      min-height: 0;

      :deep(.van-uploader__upload) {
        background: #f7f8fa;
        border: 1px dashed #dcdee0;
        border-radius: 6px;
        width: 60px;
        height: 60px;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.95);
          border-color: #00cec9;
          background: rgba(0, 206, 201, 0.05);
        }
      }

      :deep(.van-uploader__preview-image) {
        border-radius: 6px;
        width: 60px;
        height: 60px;
        transition: transform 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }

      :deep(.van-uploader__preview) {
        margin-right: 8px;
        margin-bottom: 8px;
        animation: fadeInUp 0.4s ease-out both;
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
  animation: slideUp 0.5s ease-out both;
  animation-delay: 0.3s;

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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:active {
      transform: scale(0.96);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    .van-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    &:active .van-icon {
      transform: scale(1.1);
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
