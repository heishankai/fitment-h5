<template>
  <div class="page">
    <custom-van-navbar title="选择工匠" />
    <main>
      <van-empty v-if="!craftsmanList.length" description="暂无工匠" class="empty-state" />

      <div v-else class="craftsman-list">
        <van-cell
          v-for="item in craftsmanList"
          :key="item.id"
          is-link
          @click="handleSelectCraftsman(item)"
          class="craftsman-card fade-in-up"
          :border="false"
        >
          <template #title>
            <div class="card-title">{{ item.nickname || '工匠用户' }}</div>
            <div class="card-phone" v-if="item.phone">
              <van-icon name="phone-o" size="12" />
              {{ item.phone }}
            </div>
          </template>
          <template #icon>
            <div class="card-avatar-wrapper">
              <img
                class="card-avatar"
                :src="item.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                :alt="item.nickname"
              />
              <div class="online-badge" v-if="item.isOnline"></div>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getCraftsmanList, createOrGetRoom } from '../service'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'

const router = useRouter()

const craftsmanList = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const searchKeyword = ref('')
const pageIndex = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

// 加载工匠列表
const loadCraftsmanList = async (reset: boolean = false) => {
  if (reset) {
    pageIndex.value = 1
    craftsmanList.value = []
    hasMore.value = true
  }

  if (loading.value || loadingMore.value) return

  if (reset) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const params: any = {
      pageIndex: pageIndex.value,
      pageSize: pageSize.value
    }

    if (searchKeyword.value.trim()) {
      // 判断是手机号还是昵称
      if (/^1[3-9]\d{9}$/.test(searchKeyword.value.trim())) {
        params.phone = searchKeyword.value.trim()
      } else {
        params.nickname = searchKeyword.value.trim()
      }
    }

    const res = await getCraftsmanList(params)
    console.log('获取工匠列表响应:', res)

    if (res?.success && res.data) {
      craftsmanList.value = res.data
    } else {
      console.error('加载失败:', res)
      showToast(res?.message || '加载失败')
    }
  } catch (error: any) {
    showToast(error?.message || '加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 选择工匠并进入聊天
const handleSelectCraftsman = async (craftsman: any) => {
  try {
    showLoadingToast({
      message: '正在进入聊天...',
      forbidClick: true
    })

    // 创建或获取聊天房间（wechat_user_id 会从token中自动获取）
    const res = await createOrGetRoom(craftsman.id)

    closeToast()

    if (res?.success && res.data) {
      const roomId = res.data.id
      // 跳转到聊天页面
      router.push({
        path: `/chat/wechat/${roomId}`,
        query: {
          craftsmanUserId: craftsman.id,
          craftsmanUserName: craftsman.nickname || '工匠用户'
        }
      })
    } else {
      // 如果房间已存在，尝试从已有房间列表中找到
      // 这里可以优化：如果创建失败是因为房间已存在，应该返回房间信息
      showToast(res?.message || '进入聊天失败')
    }
  } catch (error: any) {
    closeToast()
    showToast(error?.message || '进入聊天失败')
  }
}

onMounted(() => {
  loadCraftsmanList(true)
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
}

.search-bar {
  background: #fff;
  padding: 8px 12px;
  border-bottom: 1px solid #ebedf0;
}

.craftsman-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.craftsman-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  }
}

.card-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.online-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #07c160;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 6px;
  line-height: 1.4;
}

.card-phone {
  font-size: 13px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 4px;
}

.load-more {
  padding: 12px;
}

.fade-in-up {
  animation: fadeInUp 0.3s ease-out;
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
</style>
