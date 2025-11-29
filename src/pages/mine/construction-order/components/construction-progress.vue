<template>
  <section class="section" v-if="construction_progress?.length">
    <detail-section-title title="施工进度" icon="orders-o" />
    <van-steps :active="construction_progress.length" direction="vertical" class="progress-steps">
      <van-step v-for="(day, index) in construction_progress" :key="index" :status="'finish'">
        <div class="day-card">
          <header class="day-header">
            <time class="day-date" :datetime="day.start_time">
              {{ formatDate(day.start_time) }}
            </time>
          </header>

          <!-- 打卡记录 -->
          <div class="check-in-section">
            <div class="check-in-item" v-if="day.start_time">
              <div class="check-in-label">
                <van-icon name="clock-o" />
                <span>上班</span>
              </div>
              <time class="check-in-time">{{ formatTime(day.start_time) }}</time>
            </div>
            <div class="check-in-item" v-if="day.end_time">
              <div class="check-in-label">
                <van-icon name="clock-o" />
                <span>下班</span>
              </div>
              <time class="check-in-time">{{ formatTime(day.end_time) }}</time>
            </div>
            <address v-if="day.location" class="location-info">
              <van-icon name="location-o" />
              <span>{{ day.location }}</span>
            </address>
          </div>

          <!-- 施工照片 -->
          <div v-if="day.photos?.length" class="photos-preview">
            <div
              v-for="(photo, photoIndex) in day.photos"
              :key="photoIndex"
              class="photo-item"
              @click="previewPhoto(day.photos, photoIndex)"
            >
              <van-image :src="photo" fit="cover" width="60" height="60" round />
            </div>
          </div>
        </div>
      </van-step>
    </van-steps>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showImagePreview } from 'vant'
import DetailSectionTitle from '@/components/detail-section-title.vue'
import { formatTime } from '@/pages/mine/construction-progress/utils'

defineProps<{
  construction_progress: Array<{
    photos: string[]
    end_time: string
    location: string
    start_time: string
  }>
}>()

// 格式化日期
const formatDate = (timeStr: string): string => {
  if (!timeStr) return ''
  return dayjs(timeStr).format('M月D日')
}

// 预览照片
const previewPhoto = (photos: string[], index: number) => {
  showImagePreview({
    images: photos,
    startPosition: index
  })
}
</script>

<style lang="less" scoped>
.section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.progress-steps {
  margin-top: 16px;
}

.day-card {
  padding: 12px 0;

  .day-header {
    margin-bottom: 12px;

    .day-date {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
    }
  }

  .check-in-section {
    margin-bottom: 12px;

    .check-in-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .check-in-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #646566;

        .van-icon {
          font-size: 14px;
          color: #00cec9;
        }
      }

      .check-in-time {
        font-size: 14px;
        color: #323233;
        font-weight: 500;
      }
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #969799;
      font-style: normal;
      margin-top: 8px;

      .van-icon {
        font-size: 12px;
        color: #00cec9;
      }
    }
  }

  .photos-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    .photo-item {
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
    }
  }
}
</style>
