<template>
  <div class="withdraw-record-page">
    <custom-van-navbar />
    <van-pull-refresh class="pull-refresh" v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!withdrawRecords?.length" description="暂无提现记录" />
      <div v-else class="record-list">
        <van-cell
          v-for="item in withdrawRecords"
          :key="item?.id"
          class="record-item fade-in-up"
          :border="false"
        >
          <template #icon>
            <div class="record-icon" :class="getStatusClass(item.status)">
              <van-icon :name="getStatusIcon(item.status)" size="20" color="#fff" />
            </div>
          </template>
          <template #title>
            <div class="record-title">{{ getStatusText(item.status) }}</div>
            <div class="record-time">{{ formatTime(item.createdAt) }}</div>
          </template>
          <template #value>
            <div class="record-amount">¥{{ Number(item?.amount || 0).toFixed(2) }}</div>
          </template>
        </van-cell>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getWithdrawRecordService } from './service'
import dayjs from 'dayjs'

// 数据
const withdrawRecords = ref<any[]>([])
const refreshing = ref(false)

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 状态枚举映射
const statusTextMap: Record<string, string> = {
  1: '审核中',
  2: '已完成',
  3: '已拒绝'
}

const statusIconMap: Record<string, string> = {
  1: 'clock-o', // 审核中
  2: 'success', // 已完成
  3: 'close' // 已拒绝
}

const statusClassMap: Record<string, string> = {
  1: 'pending', // 审核中
  2: 'completed', // 已完成
  3: 'rejected' // 已拒绝
}

// 获取状态文本
const getStatusText = (status: string | number) => {
  return statusTextMap[String(status)]
}

// 获取状态图标
const getStatusIcon = (status: string | number) => {
  return statusIconMap[String(status)]
}

// 获取状态样式类
const getStatusClass = (status: string | number) => {
  return statusClassMap[String(status)]
}

// 加载提现记录
const loadWithdrawRecords = async () => {
  const { success, data } = await getWithdrawRecordService()
  if (success && data) {
    withdrawRecords.value = data || []
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadWithdrawRecords()
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadWithdrawRecords()
})
</script>

<style lang="less" scoped>
.withdraw-record-page {
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

.fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
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

.record-list {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.record-item {
  padding: 16px !important;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;

  &.pending {
    background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  }

  &.completed {
    background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  }

  &.rejected {
    background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
  }
}

.record-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-amount {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.pull-refresh {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}
</style>
