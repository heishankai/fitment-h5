<template>
  <div class="amount-summary-card fade-in-up" :style="{ animationDelay: '0s' }">
    <header>我的钱包</header>

    <!-- 金额区块 -->
    <section class="amount-grid">
      <article class="amount-item">
        <div class="amount-label">
          <van-icon name="balance-o" size="16" />
          <span>余额</span>
        </div>
        <p class="amount-value">¥{{ totalBalance }}</p>
      </article>

      <div class="amount-divider"></div>

      <article class="amount-item">
        <div class="amount-label">
          <van-icon name="shield-o" size="16" />
          <span>质保金</span>
        </div>
        <p class="amount-value">¥{{ formatMoney(walletInfo?.freeze_money || 0) }}</p>
      </article>
    </section>

    <!-- 可提现 -->
    <section class="withdraw-section">
      <div class="withdraw-info">
        <p class="withdraw-label">可提现</p>
        <p class="withdraw-amount">¥{{ formatMoney(walletInfo?.balance || 0) }}</p>
      </div>

      <van-button
        type="primary"
        round
        size="small"
        class="withdraw-btn"
        :disabled="Number(walletInfo?.balance || 0) <= 0"
        @click="$emit('withdraw')"
      >
        <van-icon name="cash" size="14" />
        提现
      </van-button>
    </section>

    <!-- 底部提示 -->
    <footer class="deposit-tip">
      <van-icon name="info-o" size="12" />
      <span>质保金将用于用户售后质量保障</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  walletInfo: {
    balance?: number | string
    freeze_money?: number | string
  }
}>()

defineEmits<{ withdraw: [] }>()

/**
 * 金额格式化 & 防御性处理
 */
const formatMoney = (val: number | string | null | undefined) => {
  const num = Number(val)
  return isFinite(num) ? num.toFixed(2) : '0.00'
}

// 余额
const totalBalance = computed(() =>
  formatMoney(Number(props.walletInfo?.balance || 0) + Number(props.walletInfo?.freeze_money || 0))
)
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

.amount-summary-card {
  margin: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #00cec9, #00b4d8);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 206, 201, 0.2);
  color: #fff;
}

header {
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.95;
  font-weight: 500;
}

.amount-grid {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.amount-item {
  flex: 1;
  text-align: center;
}

.amount-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 12px;
}

.amount-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;

  :deep(.van-icon) {
    opacity: 0.9;
  }
}

.amount-value {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.withdraw-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.withdraw-info {
  flex: 1;
}

.withdraw-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.withdraw-amount {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.withdraw-btn {
  height: 32px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 500;
  font-size: 13px;
  color: #fff;

  :deep(.van-icon) {
    margin-right: 4px;
  }

  &:disabled {
    opacity: 0.5;
  }
  &:active {
    background: rgba(255, 255, 255, 0.35);
  }
}

.deposit-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  opacity: 0.85;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
