<template>
  <div class="page">
    <custom-van-navbar />
    <main>
      <div class="detail-card fade-in-up">
        <div class="header">
          <div class="icon-wrapper">
            <van-icon name="volume-o" size="28" />
          </div>
          <div class="title">{{ noticeDetail.notice_title }}</div>
          <div class="time">
            <van-icon name="clock-o" size="14" />
            {{ dayjs(noticeDetail.createdAt).format('YYYY年MM月DD日') }}
          </div>
        </div>
        <div class="content" v-html="noticeDetail.notice_content" />

        <div v-if="noticeDetail?.notice_image?.length" class="image-list">
          <div
            v-for="(img, index) in noticeDetail?.notice_image"
            :key="index"
            class="image-item"
            @click="previewImage(index)"
          >
            <img :src="img" alt="公告图片" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getPlatformNoticeDetailService } from '../service'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { showImagePreview } from 'vant'

const route = useRoute()
const noticeDetail = ref<any>({})

const getPlatformNoticeDetail = async () => {
  const { id } = route.query ?? {}

  const { success, data } = await getPlatformNoticeDetailService(id)
  if (success) {
    noticeDetail.value = data || {}
  }
}

const previewImage = (index: number) => {
  showImagePreview({
    images: noticeDetail.value.notice_image,
    startPosition: index
  })
}

onMounted(() => {
  getPlatformNoticeDetail()
})
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.detail-card {
  padding: 20px;
}

.header {
  padding-bottom: 20px;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.5;
  margin-bottom: 12px;
}

.time {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 6px;
}

.content {
  font-size: 15px;
  color: #646566;
  line-height: 1.8;
  word-break: break-word;
  white-space: pre-line;

  :deep(p) {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 12px 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    font-weight: 600;
    margin: 16px 0 8px;
    color: #323233;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin: 12px 0;
  }

  :deep(li) {
    margin-bottom: 6px;
  }

  :deep(a) {
    color: #00cec9;
    text-decoration: none;
  }
}
</style>
