<template>
  <div class="withdraw-page">
    <custom-van-navbar />
    <div class="content-wrapper">
      <div class="content">
        <!-- 可提现金额 -->
        <div class="amount-card fade-in-up">
          <div class="amount-label">可提现金额</div>
          <div class="amount-value">¥{{ walletInfo?.balance }}</div>
        </div>

        <!-- 提现金额输入 -->
        <div class="input-section fade-in-up" :style="{ animationDelay: '0.1s' }">
          <div class="input-label">提现金额</div>
          <div class="input-wrapper">
            <span class="currency">¥</span>
            <van-field
              v-model="withdrawAmount"
              type="number"
              placeholder="请输入提现金额"
              class="amount-input"
              @input="handleAmountInput"
            />
          </div>
          <div class="quick-amounts">
            <van-button
              v-for="amount in quickAmounts"
              :key="amount"
              size="mini"
              round
              class="quick-btn"
              @click="setQuickAmount(amount)"
            >
              {{ amount === 'all' ? '全部' : `¥${amount}` }}
            </van-button>
          </div>
        </div>

        <!-- 银行卡信息 -->
        <div
          class="bank-info-card fade-in-up"
          :style="{ animationDelay: '0.2s' }"
          @click="goToBankCard"
        >
          <div class="bank-info-header">
            <van-icon name="credit-pay" size="20" color="#00cec9" />
            <span class="bank-info-title">提现到</span>
            <van-icon name="arrow" size="16" color="#999" />
          </div>
          <div v-if="bankCardInfo?.card_number" class="bank-info-content">
            <div class="bank-name">{{ bankCardInfo?.bank_name }}</div>
            <div class="bank-card-number">{{ formatBankCard(bankCardInfo?.card_number) }}</div>
          </div>
          <div v-else class="bank-info-empty">
            <span>请先绑定银行卡</span>
          </div>
        </div>

        <!-- 提现说明 -->
        <div class="notice-section fade-in-up" :style="{ animationDelay: '0.3s' }">
          <van-icon name="info-o" size="16" color="#999" />
          <div class="notice-text">
            <div>• 每周发起一次提现，周五统一到账</div>
            <div>• 20000元以内提现有0.5%（千分之五），20000以上提现免手续费</div>
            <div>• 平台不额外收取押金，质保金用于保证售后，这笔钱在最后一单保修期满才可提现</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section fade-in-up" :style="{ animationDelay: '0.4s' }">
      <van-button
        type="primary"
        round
        block
        class="submit-btn"
        @click="handleSubmit"
        :disabled="!canSubmit"
        :loading="submitting"
      >
        确认提现
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { getWalletInfoService, getBankCardService, applyWithdrawService } from './service'

const router = useRouter()

const walletInfo = ref<any>({})
const bankCardInfo = ref<any>({})

const withdrawAmount = ref('')
const submitting = ref(false)

// 快速金额选项
const quickAmounts = computed(() => {
  const amount = Number(walletInfo.value?.balance || 0)
  if (amount < 100) return []
  const amounts: (number | 'all')[] = []
  if (amount >= 100) amounts.push(100)
  if (amount >= 500) amounts.push(500)
  if (amount >= 1000) amounts.push(1000)
  amounts.push('all')
  return amounts
})

// 是否可以提交
const canSubmit = computed(() => {
  const amount = Number(withdrawAmount.value)
  return (
    amount <= Number(walletInfo.value?.balance || 0) &&
    bankCardInfo.value?.card_number &&
    !submitting.value
  )
})

// 格式化银行卡号
const formatBankCard = (cardNumber: string) => {
  if (!cardNumber) return ''
  if (cardNumber.length <= 4) return cardNumber
  return `****${cardNumber.slice(-4)}`
}

// 设置快速金额
const setQuickAmount = (amount: number | 'all') => {
  if (amount === 'all') {
    withdrawAmount.value = Number(walletInfo.value?.balance || 0).toFixed(2)
  } else {
    withdrawAmount.value = amount.toString()
  }
}

// 处理金额输入
const handleAmountInput = () => {
  if (Number(withdrawAmount.value) > Number(walletInfo.value?.balance || 0)) {
    withdrawAmount.value = Number(walletInfo.value?.balance || 0).toFixed(2)
    showToast('提现金额不能超过可提现金额')
  }
}

// 加载数据
const loadData = async () => {
  const [walletRes, bankRes] = await Promise.all([getWalletInfoService(), getBankCardService()])
  if (walletRes.success && walletRes.data) {
    walletInfo.value = walletRes.data
  }
  if (bankRes.success && bankRes.data) {
    bankCardInfo.value = bankRes.data
  }
}

// 跳转到银行卡页面
const goToBankCard = () => {
  router.push('/wallet/craftsman_bank_card')
}

// 提交提现
const handleSubmit = async () => {
  console.log(Number(withdrawAmount.value), 'Number(withdrawAmount.value)')

  try {
    submitting.value = true
    const { success } = await applyWithdrawService({
      amount: Number(withdrawAmount.value)
    })

    if (!success) return

    showToast('提现申请成功')
    router.back()
  } catch (error: any) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.withdraw-page {
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

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.content {
  padding: 16px;
  padding-bottom: 20px;
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

// 可提现金额卡片
.amount-card {
  background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 206, 201, 0.3);
}

.amount-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.amount-value {
  font-size: 36px;
  font-weight: bold;
  letter-spacing: 1px;
}

// 输入区域
.input-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 16px;

  .currency {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-right: 8px;
  }

  .amount-input {
    flex: 1;
    padding: 0;

    :deep(.van-field__control) {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
  }
}

.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #666;
  font-size: 13px;

  &:active {
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border-color: #00cec9;
    color: #fff;
  }
}

// 银行卡信息卡片
.bank-info-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.bank-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.bank-info-title {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.bank-info-content {
  .bank-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .bank-card-number {
    font-size: 14px;
    color: #999;
  }
}

.bank-info-empty {
  color: #999;
  font-size: 14px;
}

// 说明区域
.notice-section {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #fff9e6;
  border-radius: 12px;
  margin-bottom: 24px;
}

.notice-text {
  flex: 1;
  font-size: 12px;
  color: #666;
  line-height: 1.8;

  div {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 提交按钮
.submit-section {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.submit-btn {
  height: 48px;
  background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
  font-weight: 600;
  font-size: 16px;

  &:disabled {
    opacity: 0.5;
  }
}
</style>
