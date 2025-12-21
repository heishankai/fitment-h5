<template>
  <div class="page-container">
    <custom-van-navbar />

    <main>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 空状态 -->
        <van-empty
          v-if="!loading && constructionProgressList.length === 0"
          description="暂无施工进度记录"
          class="empty-state"
        />

        <!-- 施工进度列表 -->
        <div v-else class="progress-list">
          <div
            v-for="(item, index) in constructionProgressList"
            :key="item.id || index"
            class="progress-card fade-in-up"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-header">
              <div class="date-info">
                <van-icon name="calendar-o" />
                <time class="date-text" :datetime="item.createdAt">
                  {{ formatDate(item.createdAt) }}
                </time>
              </div>
            </div>

            <div class="card-content">
              <!-- 位置信息 -->
              <div class="info-row">
                <van-icon name="location-o" class="info-icon" />
                <span class="info-text">{{ item.location || '未记录位置' }}</span>
              </div>

              <!-- 打卡时间 -->
              <div class="time-section">
                <div class="time-item">
                  <div class="time-header">
                    <van-icon name="clock-o" class="time-icon start-icon" />
                    <span class="time-label">上班打卡</span>
                  </div>
                  <time v-if="item.start_time" class="time-value" :datetime="item.start_time">
                    {{ formatTime(item.start_time) }}
                  </time>
                  <span v-else class="time-placeholder">未打卡</span>
                </div>
                <div class="time-item">
                  <div class="time-header">
                    <van-icon name="clock-o" class="time-icon end-icon" />
                    <span class="time-label">下班打卡</span>
                  </div>
                  <time v-if="item.end_time" class="time-value" :datetime="item.end_time">
                    {{ formatTime(item.end_time) }}
                  </time>
                  <span v-else class="time-placeholder">未打卡</span>
                </div>
              </div>

              <!-- 施工照片 -->
              <div v-if="item.photos && item.photos.length > 0" class="photos-section">
                <div class="photos-title">
                  <van-icon name="photo-o" />
                  <span>施工照片 ({{ item.photos.length }})</span>
                </div>
                <div class="photos-grid">
                  <div
                    v-for="(photo, photoIndex) in item.photos"
                    :key="photoIndex"
                    class="photo-item"
                    @click="previewPhoto(item.photos, photoIndex)"
                  >
                    <van-image :src="photo" fit="cover" width="100%" height="100%" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </main>

    <van-loading v-if="loading" class="loading-overlay" vertical>加载中...</van-loading>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showImagePreview } from 'vant'
import dayjs from 'dayjs'
// components
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
// utils
import { getConstructionProgressByOrderId } from '../construction-order/service'

const route = useRoute()

const loading = ref(false)
const refreshing = ref(false)
const constructionProgressList = ref<any[]>([])

// 加载施工进度数据
const loadData = async () => {
  try {
    loading.value = true
    const orderId = Number(route.params.id)
    const { success, data } = await getConstructionProgressByOrderId(orderId)
    if (success) {
      constructionProgressList.value = Array.isArray(data) ? data : data ? [data] : []
    }
  } catch (error) {
    console.error('加载施工进度失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadData()
}

// 预览照片
const previewPhoto = (photos: string[], index: number) => {
  showImagePreview({
    images: photos,
    startPosition: index
  })
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY年MM月DD日')
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  return dayjs(timeStr).format('HH:mm')
}

onMounted(() => {
  loadData()
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
}

main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  gap: 12px;
}

.empty-state {
  margin-top: 100px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    padding: 16px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-bottom: 1px solid #f0f0f0;

    .date-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .van-icon {
        font-size: 16px;
        color: #00cec9;
      }

      .date-text {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }
  }

  .card-content {
    padding: 16px;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 16px;

    .info-icon {
      font-size: 16px;
      color: #00cec9;
      flex-shrink: 0;
    }

    .info-text {
      font-size: 14px;
      color: #323233;
      flex: 1;
      word-break: break-all;
    }
  }

  .time-section {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .time-item {
      flex: 1;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .time-header {
        display: flex;
        align-items: center;
        gap: 6px;

        .time-icon {
          font-size: 16px;

          &.start-icon {
            color: #1989fa;
          }

          &.end-icon {
            color: #07c160;
          }
        }

        .time-label {
          font-size: 12px;
          color: #969799;
        }
      }

      .time-value {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }

      .time-placeholder {
        font-size: 14px;
        color: #c8c9cc;
      }
    }
  }

  .photos-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .photos-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 12px;

      .van-icon {
        font-size: 16px;
        color: #00cec9;
      }
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .photo-item {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fade-in-up 0.4s ease-out both;
}
</style>
