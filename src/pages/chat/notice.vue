<template>
  <header>
    <div class="quick-item" @click="handleClickSystem">
      <div class="icon-wrapper">
        <div class="quick-icon system-icon">
          <van-icon name="chat-o" size="22" />
        </div>
        <van-badge
          v-if="system_unread > 0"
          :content="system_unread > 99 ? '99+' : system_unread"
          class="quick-badge"
        />
      </div>
      <div class="quick-title">系统通知</div>
    </div>
    <div class="quick-item" @click="handleClickService">
      <div class="icon-wrapper">
        <div class="quick-icon service-icon">
          <van-icon name="service-o" size="22" />
        </div>
        <van-badge
          v-if="serviceMessage.unread > 0"
          :content="serviceMessage.unread > 99 ? '99+' : serviceMessage.unread"
          class="quick-badge"
        />
      </div>
      <div class="quick-title">客服消息</div>
    </div>
    <div class="quick-item" @click="handleClickNotice">
      <div class="icon-wrapper">
        <div class="quick-icon announcement-icon">
          <van-icon name="bullhorn-o" size="22" />
        </div>
      </div>
      <div class="quick-title">平台公告</div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { getUnreadNotificationCountService } from './service'

const router = useRouter()
const route = useRoute()

// 工匠师傅系统消息
const system_unread = ref(0)

// 客服消息
const serviceMessage = ref({
  unread: 0
})

// 获取用户未读通知数量
const getUnreadNotificationCount = async () => {
  const { success, data } = await getUnreadNotificationCountService()
  if (success) {
    system_unread.value = data.count
  }
}

// 点击客服消息
const handleClickService = () => {
  if (route.path.includes('wechat')) {
    router.push(`/wechat-msg`)
  } else {
    router.push(`/craftsman-msg`)
  }
}

// 点击平台公告
const handleClickNotice = () => {
  if (route.path.includes('wechat')) {
    router.push(`/notice/notice-list?notice_type=1`)
  } else {
    router.push(`/notice/notice-list?notice_type=2`)
  }
}

// 点击系统消息
const handleClickSystem = () => {
  if (route.path.includes('wechat')) {
    router.push(`/notice/wechat-system-message`)
  } else {
    router.push(`/notice/craftsman-system-message`)
  }
}

onMounted(() => {
  if (route.path.includes('wechat')) {
    //
  } else {
    getUnreadNotificationCount()
  }
})
</script>

<style lang="less" scoped>
header {
  display: flex;
  gap: 8px;
  background: #f7f8fa;
  padding: 12px;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  background: #fff;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;

  &:active {
    background: #f2f3f5;
    transform: scale(0.96);
  }
}

.icon-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &.system-icon {
    background: #f0f4ff;
    color: #1989fa;
  }

  &.service-icon {
    background: #fff0f6;
    color: #ff6b9d;
  }

  &.announcement-icon {
    background: #f0f9ff;
    color: #00b4d8;
  }
}

.quick-item:active .quick-icon {
  transform: scale(0.95);
}

.quick-title {
  font-size: 12px;
  font-weight: 500;
  color: #323233;
  text-align: center;
  line-height: 1.4;
}

.quick-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
}
</style>
