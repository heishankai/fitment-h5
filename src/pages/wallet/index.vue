<template>
  <div class="wallet-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 金额汇总卡片 -->
      <AmountSummaryCard :wallet-info="walletInfo" @withdraw="handleWithdraw" />

      <!-- 功能菜单 -->
      <main class="fade-in-up" :style="{ animationDelay: '0.1s' }">
        <van-cell class="menu-item" is-link @click="goToWithdrawRecord" center title="提现记录">
          <template #icon>
            <div class="icon-box" style="background: #ff980022">
              <van-icon name="records" color="#ff9800" size="18px" />
            </div>
          </template>
        </van-cell>

        <van-cell class="menu-item" is-link @click="goToBankCard" center title="银行卡">
          <template #icon>
            <div class="icon-box" style="background: #4caf5022">
              <van-icon name="credit-pay" color="#4caf50" size="18px" />
            </div>
          </template>
        </van-cell>
      </main>

      <!-- 账户明细 -->
      <AccountDetails :details="accountDetails" />
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AmountSummaryCard from './components/AmountSummaryCard.vue'
import AccountDetails from './components/AccountDetails.vue'
import { getWalletInfoService, getBankCardService, getWalletTransactionService } from './service'

const router = useRouter()

// 钱包信息
const walletInfo = ref<any>({})

const accountDetails = ref<any[]>([])
const refreshing = ref(false)

// 刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    const [walletRes, accountDetailsRes] = await Promise.all([
      getWalletInfoService(),
      getWalletTransactionService()
    ])
    if (walletRes.success && walletRes.data) {
      walletInfo.value = walletRes.data
    }
    if (accountDetailsRes.success && accountDetailsRes.data) {
      accountDetails.value = accountDetailsRes.data
    }
  } catch (error) {
    console.error(error)
    refreshing.value = false
  } finally {
    refreshing.value = false
  }
}

// 提现
const handleWithdraw = async () => {
  if (Number(walletInfo.value?.balance || 0) <= 0) {
    showToast('可提现金额为0')
    return
  }

  const { success, data } = await getBankCardService()
  if (success && !data?.card_number) {
    showToast('请先绑定银行卡')
    goToBankCard()
    return
  }

  router.push('/wallet/withdraw')
}

// 提现记录
const goToWithdrawRecord = () => router.push('/wallet/withdraw-record')

// 银行卡
const goToBankCard = () => router.push('/wallet/craftsman_bank_card')

onMounted(() => onRefresh())
</script>

<style lang="less" scoped>
.wallet-page {
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

  :deep(.van-pull-refresh) {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: 100%;
  }
}

/* --- 动画 --- */
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

/* --- 菜单 --- */
main {
  margin: 0 12px 10px;

  .menu-item {
    background: #fff;
    margin-bottom: 6px;
    padding: 11px 12px;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  :deep(.van-cell__title) {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .icon-box {
    width: 32px;
    height: 32px;
    padding: 7px;
    border-radius: 8px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
}
</style>
