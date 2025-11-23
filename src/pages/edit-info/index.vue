<template>
  <div class="page">
    <custom-van-navbar />
    <main class="fade-in-up">
      <div class="avatar">
        <van-uploader
          :after-read="handleImageSelect"
          accept="image/*"
          :max-count="1"
          :show-upload="false"
        >
          <div class="avatar-wrapper">
            <img :src="userInfo.avatar" />
          </div>
        </van-uploader>
        <div class="camera-icon">
          <van-icon name="photograph" size="16" />
        </div>
      </div>
      <van-form ref="formRef">
        <van-cell-group inset>
          <van-field
            left-icon="contact-o"
            v-model="userInfo.nickname"
            name="nickname"
            label="昵称"
            placeholder="请填写昵称"
            :rules="[{ required: true, message: '请填写昵称' }]"
          />
          <van-field
            readonly
            disabled
            left-icon="phone-o"
            v-model="userInfo.phone"
            name="phone"
            label="手机号"
            placeholder="请填写手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
          />
        </van-cell-group>
      </van-form>
    </main>
    <footer class="fade-in-up">
      <van-button type="danger" size="large" round block @click="handleLogout" class="logout-btn">
        <van-icon name="revoke" />
        退出登录
      </van-button>
      <van-button type="primary" size="large" round block @click="handleSubmit" class="save-btn">
        <van-icon name="success" />
        保存
      </van-button>
    </footer>
  </div>
</template>

<script setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getUserInfoService, updatInfoService } from './service'
import { uploadImage } from '@/service'
import { useRouter } from 'vue-router'

const router = useRouter()

const userInfo = ref({
  nickname: '',
  phone: '',
  avatar: ''
})
const formRef = ref(null)

onMounted(() => {
  getUserInfo()
})

// 退出登录
const handleLogout = async () => {
  window?.FlutterBridge?.logout()
}

// 获取用户信息
const getUserInfo = async () => {
  const { success, data } = await getUserInfoService()
  if (!success) return
  userInfo.value = data
}

// 手动触发表单提交
const handleSubmit = async () => {
  await formRef.value?.submit()
  const { success } = await updatInfoService({ ...userInfo.value })
  if (!success) return
  router.back()
}

// 上传头像
const handleImageSelect = async (file) => {
  const { success, data } = await uploadImage(file.file)
  if (!success) return
  userInfo.value.avatar = data.url
}
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8f9fa;
  /* 防止整个页面被拉动 */
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none; /* 阻止过度滚动 */
}

main {
  flex: 1;
  padding: 16px 0px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  overscroll-behavior: contain; /* 防止滚动穿透 */

  // 头像区域
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: visible;
    margin: 0 auto 24px;
    position: relative;

    :deep(.van-uploader) {
      width: 100%;
      height: 100%;
    }

    :deep(.van-uploader__wrapper) {
      width: 100%;
      height: 100%;
    }

    :deep(.van-uploader__preview) {
      width: 100%;
      height: 100%;
      margin: 0;
    }

    .avatar-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      border: 4rpx solid #fff;
      box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .camera-icon {
      position: absolute;
      top: 6px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: #00cec9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 10;
      transform: translate(25%, -25%);

      .van-icon {
        color: #fff;
      }
    }
  }
}

footer {
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  display: flex;
  gap: 8px;
}
</style>
