<template>
  <div class="page">
    <header>
      <custom-van-navbar title="系统通知" />
      <div class="action-bar" v-if="notificationList.length > 0">
        <div class="unread-info" v-if="unreadCount > 0">
          <div class="unread-dot"></div>
          <span class="unread-text">有 {{ unreadCount }} 条未读消息</span>
        </div>
        <van-button
          v-if="unreadCount > 0"
          size="small"
          type="primary"
          plain
          round
          class="mark-all-btn"
          @click="handleMarkAllAsRead"
        >
          全部已读
        </van-button>
      </div>
    </header>
    <main>
      <!-- 顶部操作栏 -->

      <!-- 通知列表 -->
      <van-pull-refresh class="pull-refresh" v-model="refreshing" @refresh="onRefresh">
        <van-empty v-if="!notificationList?.length && !refreshing" description="暂无通知" />
        <div v-else class="notification-list">
          <div
            v-for="(item, index) in notificationList"
            :key="item.id"
            class="notification-item fade-in-up"
            :class="{ unread: !item.is_read }"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="handleClick(item)"
          >
            <div class="icon" :class="getIconClass(item.notification_type)">
              <van-icon :name="getIconName(item.notification_type)" size="20" />
            </div>
            <div class="unread-dot" v-if="!item.is_read"></div>
            <div class="info">
              <div class="title">
                <span>{{ item.title }}</span>
                <span class="time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <div class="content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </main>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import {
  getSystemNotificationListService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  getUnreadNotificationCountService
} from '../service'
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter()

const notificationList = ref<any[]>([])
const unreadCount = ref(0)
const refreshing = ref(false)

// 获取未读通知数量
const getUnreadCount = async () => {
  const { success, data } = await getUnreadNotificationCountService()
  if (success && data?.count !== undefined) {
    unreadCount.value = data.count
  }
}

// 获取系统通知列表
const getSystemNotificationList = async () => {
  const { success, data } = await getSystemNotificationListService()
  if (success) {
    notificationList.value = data || []
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await Promise.all([getSystemNotificationList(), getUnreadCount()])
  } finally {
    refreshing.value = false
  }
}

// 处理点击通知
const handleClick = async (item: any) => {
  const { notification_type } = item ?? {}

  if (notification_type === 'is-skill-verified') {
    router.push(`/mine/skill-auth`)
  }
  if (notification_type === 'is-verified') {
    router.push(`/mine/real-name-auth`)
  }
  if (notification_type === 'home-page-audit') {
    router.push(`/mine/personal-homepage`)
  }

  // 如果未读，标记为已读
  if (!item.is_read) {
    const { success } = await markNotificationAsReadService(item.id)
    if (success) {
      item.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
}

// 标记全部为已读
const handleMarkAllAsRead = async () => {
  const { success } = await markAllNotificationsAsReadService()
  if (success) {
    showToast('已全部标记为已读')
    // 更新本地状态
    notificationList.value.forEach((item) => {
      item.is_read = true
    })
    unreadCount.value = 0
  }
}

// 获取图标名称
const getIconName = (type: string) => {
  const iconMap: Record<string, string> = {
    'is-verified': 'passed',
    'is-skill-verified': 'medal',
    'home-page-audit': 'contact-o'
  }
  return iconMap[type] || 'bell-o'
}

// 获取图标样式类
const getIconClass = (type: string) => {
  const classMap: Record<string, string> = {
    'is-verified': 'icon-blue',
    'is-skill-verified': 'icon-orange',
    'home-page-audit': 'icon-green'
  }
  return classMap[type] || 'icon-default'
}

// 格式化时间
const formatTime = (time: string) => {
  const now = dayjs()
  const target = dayjs(time)
  const diff = now.diff(target, 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 43200) return `${Math.floor(diff / 1440)}天前`
  return target.format('MM-DD HH:mm')
}

onMounted(async () => {
  await Promise.all([getSystemNotificationList(), getUnreadCount()])
})
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #f0f2f5 100%);
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
  padding-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  .unread-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
    }

    .unread-text {
      font-size: 14px;
      color: #323233;
      font-weight: 500;
    }
  }

  .mark-all-btn {
    font-size: 13px;
    padding: 6px 16px;
    border-color: var(--van-primary-color);
    color: var(--van-primary-color);
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.notification-item {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: transparent;
    transition: all 0.3s ease;
  }

  .icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }

    &.icon-blue {
      background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
    }

    &.icon-orange {
      background: linear-gradient(135deg, #ff9500 0%, #ffad33 100%);
    }

    &.icon-green {
      background: linear-gradient(135deg, #34c759 0%, #5ac8fa 100%);
    }

    &.icon-default {
      background: linear-gradient(135deg, #8e8e93 0%, #aeaeb2 100%);
    }
  }

  .unread-dot {
    position: absolute;
    top: 14px;
    left: 54px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff3b30;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.4);
    animation: pulse 2s ease-in-out infinite;
    z-index: 1;
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
    line-height: 1.5;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .time {
      font-size: 12px;
      color: #8e8e93;
      font-weight: 400;
      white-space: nowrap;
      flex-shrink: 0;
    }
  }

  .content {
    font-size: 14px;
    color: #6e6e73;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.pull-refresh {
  height: 100%;
}
</style>
