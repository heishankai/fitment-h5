<template>
  <div class="bank-card-page">
    <custom-van-navbar />
    <div class="content-wrapper">
      <van-form ref="formRef" @submit="handleSubmit" class="form-wrapper">
        <div class="form-section fade-in-up">
          <van-field
            v-model="bankCardInfo.bank_name"
            name="bank_name"
            label="银行名称"
            placeholder="请输入银行名称"
            :rules="[{ required: true, message: '请输入银行名称' }]"
          />
          <van-field
            v-model="bankCardInfo.card_number"
            name="card_number"
            label="银行卡号"
            placeholder="请输入银行卡号"
            type="number"
            :rules="[{ required: true, message: '请输入银行卡号' }]"
          />
          <van-field
            v-model="bankCardInfo.bank_branch"
            name="bank_branch"
            label="开户行"
            placeholder="请输入开户行"
            :rules="[{ required: true, message: '请输入开户行' }]"
          />
          <van-field
            v-model="bankCardInfo.name"
            name="name"
            label="姓名"
            placeholder="请输入持卡人姓名"
            :rules="[{ required: true, message: '请输入持卡人姓名' }]"
          />
          <van-field
            v-model="bankCardInfo.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
            :rules="[{ required: true, message: '请输入手机号' }]"
          />
        </div>
      </van-form>
    </div>

    <div class="submit-section fade-in-up" :style="{ animationDelay: '0.1s' }">
      <van-button
        type="primary"
        round
        block
        class="submit-btn"
        :loading="submitting"
        @click="handleButtonClick"
      >
        {{ bankCardInfo?.id ? '更新银行卡' : '绑定银行卡' }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { bindBankCardService, getBankCardService, updateBankCardService } from './service'

const router = useRouter()

const submitting = ref(false)
const formRef = ref()

const bankCardInfo = ref<any>({
  bank_name: '',
  card_number: '',
  bank_branch: '',
  name: '',
  phone: ''
})

// 按钮点击处理
const handleButtonClick = async () => {
  try {
    // 手动触发表单校验
    await formRef.value?.validate()
    // 校验通过，执行提交
    handleSubmit()
  } catch (error: any) {
    // 校验失败，显示第一个错误信息
    if (error && typeof error === 'object') {
      const firstError = Object.values(error)[0] as string
      if (firstError) {
        showToast(firstError)
      }
    } else if (typeof error === 'string') {
      showToast(error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitting.value = true

    const bindBankPromise = bankCardInfo.value.id ? updateBankCardService : bindBankCardService

    const { success } = await bindBankPromise(bankCardInfo.value)
    if (!success) return
    showToast('操作成功')
    router.back()
  } catch (error: any) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const loadData = async () => {
  const { success, data } = await getBankCardService()

  if (success && data) {
    bankCardInfo.value = data
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.bank-card-page {
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

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.form-wrapper {
  min-height: 100%;
}

.form-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;

  :deep(.van-cell) {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  :deep(.van-field__label) {
    width: 80px;
    font-weight: 500;
    color: #333;
  }

  :deep(.van-field__control) {
    font-size: 15px;
  }

  // 隐藏默认的错误提示
  :deep(.van-field__error-message) {
    display: none !important;
  }

  :deep(.van-field--error) {
    .van-field__error-message {
      display: none !important;
    }
  }
}

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
}
</style>
