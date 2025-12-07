<template>
  <div class="detail-section fade-in-up" :style="{ animationDelay: '0.2s' }">
    <section-title title="账户明细" />

    <van-empty description="暂无明细记录" v-if="!details?.length" />

    <div v-else class="detail-list">
      <van-cell v-for="item in details" :key="item.id" class="detail-item" :border="false">
        <template #icon>
          <div class="detail-icon" :class="getTypeClass(item.type)">
            <van-icon :name="getTypeIcon(item.type)" size="16" color="#fff" />
          </div>
        </template>

        <template #title>
          <div class="detail-title">{{ item.description || item.type_text || '未知' }}</div>
          <div class="detail-time">{{ formatTime(item.createdAt) }}</div>
        </template>

        <template #value>
          <div class="detail-amount" :class="getTypeClass(item.type)">
            {{ item.type === 1 ? '+' : '-' }}¥{{ formatMoney(item.amount || 0) }}
          </div>
        </template>
      </van-cell>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import SectionTitle from '@/components/section-title.vue'

defineProps<{
  details: Array<{
    id: number | string
    type: number // 1: 收入, 2: 支出
    type_text?: string
    description?: string
    amount: number
    createdAt: string
  }>
}>()

const formatTime = (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '')

const formatMoney = (amount: number) => Number(amount).toFixed(2)

// 获取类型样式类
const getTypeClass = (type: number) => {
  return type === 1 ? 'income' : 'expense'
}

// 获取类型图标
const getTypeIcon = (type: number) => {
  return type === 1 ? 'plus' : 'minus'
}
</script>

<style lang="less" scoped>
.fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-section {
  margin: 0 12px;
}

.detail-list {
  margin-top: 12px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.detail-item {
  padding: 10px 12px !important;
  border-bottom: 1px solid #f0f0f0;
}

.detail-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.detail-icon.income {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
}
.detail-icon.expense {
  background: linear-gradient(135deg, #ff9800, #ffb74d);
}

.detail-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 3px;
}

.detail-time {
  font-size: 11px;
  color: #999;
}

.detail-amount {
  font-size: 15px;
  font-weight: 600;
}
.detail-amount.income {
  color: #4caf50;
}
.detail-amount.expense {
  color: #ff9800;
}
</style>
