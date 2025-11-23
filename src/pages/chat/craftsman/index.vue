<template>
  <div class="page">
    <Notice />
    <main>
      <van-empty v-if="!msgList?.length" description="暂无消息" class="empty-state" />

      <van-swipe-cell v-for="item in msgList" :key="item.id">
        <div @click="handleClick(item)" class="notice-card fade-in-up">
          <img class="card-icon" :src="item.wechat_user?.avatar" />
          <van-badge v-if="item.unreadCount > 0" :content="item.unreadCount" class="unread-badge" />
          <div class="card-content-wrapper">
            <div class="card-title">{{ item.wechat_user?.nickname || '微信用户' }}</div>
            <div class="card-content" v-if="item.lastMessage">
              {{ item.lastMessage.content }}
            </div>
            <div class="card-time">
              <van-icon name="clock-o" size="12" />
              {{
                item.lastMessage
                  ? dayjs(item.lastMessage.createdAt).format('MM-DD HH:mm')
                  : dayjs(item.updatedAt).format('MM-DD HH:mm')
              }}
            </div>
          </div>
        </div>
        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            class="delete-button"
            @click="handleDelete(item)"
          />
        </template>
      </van-swipe-cell>
    </main>
  </div>
</template>

<script lang="ts" setup>
import Notice from '../notice.vue'
import { getCraftsmanRooms, deleteRoom } from '../service'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()

const msgList = ref<any[]>([])

// 加载数据
const loadData = async () => {
  const { success, data } = await getCraftsmanRooms()
  if (success && data) {
    msgList.value = data
  }
}

const handleClick = (item: any) => {
  router.push({
    path: `/chat/craftsman/${item.id}`,
    query: {
      wechatUserId: item.wechat_user_id,
      wechatUserName: item.wechat_user?.nickname || '微信用户'
    }
  })
}

const handleDelete = async (item: any) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个聊天记录吗？'
    })

    const res = await deleteRoom(item.id)
    if (res?.success) {
      showToast('删除成功')
      loadData()
    } else {
      showToast(res?.message || '删除失败')
    }
  } catch (error: any) {
    // 用户取消删除
    if (error !== 'cancel') {
      showToast(error?.message || '删除失败')
    }
  }
}

// 页面激活时重新加载数据（从聊天页面返回时）
onActivated(() => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.page {
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
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  margin: 0 16px;
}

:deep(.van-swipe-cell) {
  border-radius: 16px;
  margin-bottom: 12px;
}

.notice-card {
  background: #fff;
  border-radius: 16px 16px 16px 0x;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  border: none !important;

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
    object-fit: cover;
  }

  .card-content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .unread-badge {
    position: absolute;
    top: 14px;
    right: 14px;
  }

  .card-content {
    font-size: 14px;
    color: #646566;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-top: 4px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .card-time {
    font-size: 12px;
    color: #969799;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.delete-button {
  height: 100%;
}
</style>
