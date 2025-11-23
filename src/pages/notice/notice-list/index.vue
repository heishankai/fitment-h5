<template>
  <div class="page">
    <custom-van-navbar />
    <main>
      <van-pull-refresh class="pull-refresh" v-model="refreshing" @refresh="onRefresh">
        <van-empty v-if="!noticeList?.length && !refreshing" description="暂无公告" />
        <div v-else class="notice-list">
          <van-cell
            v-for="item in noticeList"
            :key="item.id"
            is-link
            @click="handleClick(item.id)"
            class="notice-card fade-in-up"
            :border="false"
          >
            <template #title>
              <div class="card-title">{{ item.notice_title }}</div>
            </template>
            <template #icon>
              <div class="card-icon">
                <van-icon name="volume-o" size="24" />
              </div>
            </template>
            <template #label>
              <div class="card-time">
                <van-icon name="clock-o" size="12" />
                {{ dayjs(item.created_at).format('YYYY年MM月DD日') }}
              </div>
            </template>
          </van-cell>
        </div>
      </van-pull-refresh>
    </main>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getPlatformNoticeListService } from '../service'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const noticeList = ref<any[]>([])
const refreshing = ref(false)

const getPlatformNoticeList = async () => {
  const { notice_type } = route.query ?? {}
  const { success, data } = await getPlatformNoticeListService({ notice_type: notice_type })
  if (success) {
    noticeList.value = data || []
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await getPlatformNoticeList()
  } finally {
    refreshing.value = false
  }
}

const handleClick = (id: number) => {
  router.push(`/notice/notice-detail?id=${id}`)
}

onMounted(() => {
  getPlatformNoticeList()
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
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f5f5f5;
  padding: 12px;

  .notice-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 8px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .card-time {
    font-size: 12px;
    color: #969799;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.pull-refresh {
  height: 100%;
}
</style>
