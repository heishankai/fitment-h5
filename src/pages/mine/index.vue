<template>
  <div class="mine-page">
    <div class="header-wrapper">
      <div class="header-bg"></div>

      <!-- 用户卡片（向上漂浮） -->
      <div class="user-card">
        <!-- 头像区域 -->
        <div class="profile-section">
          <div class="avatar-wrapper">
            <div class="avatar-border">
              <img v-if="userInfo?.avatar" :src="userInfo?.avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">👤</div>
            </div>
          </div>

          <div class="profile-info">
            <div class="nickname">{{ userInfo?.nickname || '未设置昵称' }}</div>

            <div class="badges">
              <div class="badge blue">
                <van-icon name="checked" size="14px" v-show="userInfo?.isVerified" />
                {{ userInfo?.isVerified ? '已实名' : '未实名认证' }}
              </div>

              <div class="badge orange">
                <van-icon name="medal" size="14px" v-show="userInfo?.isSkillVerified" />
                {{ userInfo?.isSkillVerified ? '技能认证通过' : '技能未认证' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="stats">
          <div class="stat-item">
            <div class="value">{{ userInfo?.completedOrdersCount }}</div>
            <div class="label">已完成订单</div>
          </div>

          <div class="divider"></div>

          <div class="stat-item">
            <div class="value">{{ userInfo?.score }}</div>
            <div class="label">综合评分</div>
          </div>
        </div>

        <!-- 编辑按钮 -->
        <EditProfileButton @click="goEdit" />
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <MenuItem icon="shield-o" color="#2d635e" title="实名认证" @click="goRealNameAuth" />
      <MenuItem icon="medal-o" color="#c89a57" title="技能认证" @click="goSkillAuth" />
      <MenuItem icon="contact-o" color="#4f7a67" title="个人主页" @click="goPersonalHomepage" />
      <MenuItem icon="location-o" color="#c46b6b" title="我的工地订单" @click="goMyConstruction" />
    </div>
  </div>
</template>

<script setup>
import EditProfileButton from './components/EditProfileButton.vue'
import MenuItem from './components/MenuItem.vue'
import { useRouter } from 'vue-router'
import { getUserInfoService } from './service'

const router = useRouter()

// 数据
const userInfo = ref({})

// 加载用户信息
const getUserInfo = async () => {
  const { success, data } = await getUserInfoService()
  if (!success) return
  userInfo.value = data
}

onMounted(() => {
  getUserInfo()
})

const goEdit = () => router.push('/mine/edit-info')

const goRealNameAuth = () => router.push('/mine/real-name-auth')

// 技能认证：如果已通过认证，直接跳转到技能认证页面；否则跳转到工种选择页面
const goSkillAuth = async () => {
  router.push({ path: '/mine/skill-auth' })
}

const goPersonalHomepage = () => router.push('/mine/personal-homepage')

const goMyConstruction = () => router.push('/mine/my-construction')
</script>

<style lang="less" scoped>
.mine-page {
  background: var(--color-background);
  min-height: 100vh;
}

/* 顶部渐变背景 */
.header-wrapper {
  position: relative;
}

.header-bg {
  height: 120px;
  background: var(--color-primary);
}

/* 用户卡片浮动 */
.user-card {
  background: white;
  width: calc(100% - 32px);
  margin: -50px auto 16px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 头像 */
.profile-section {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-primary);
  border-radius: 50%;
  padding: 3px;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.avatar-border {
  background: white;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  font-size: 40px;
  color: grey;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 用户昵称 + 标签 */
.profile-info {
  flex: 1;
  margin-left: 16px;
}

.nickname {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text);
}

.badges {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge :deep(.van-icon) {
  flex-shrink: 0;
}

.badge.blue {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.12);
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.badge.orange {
  color: var(--color-warning);
  background: rgba(var(--color-warning-rgb), 0.12);
  border-color: rgba(var(--color-warning-rgb), 0.3);
}

/* 统计数据 */
.stats {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.value {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
}

.label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.divider {
  width: 1px;
  height: 50px;
  background: #eee;
}

/* 菜单列表 */
.menu-list {
  padding: 0 16px 20px;
}
</style>
