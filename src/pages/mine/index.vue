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
              <img v-if="userInfoData?.avatar" :src="userInfoData?.avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">👤</div>
            </div>
          </div>

          <div class="profile-info">
            <div class="nickname">{{ userInfoData?.nickname || '未设置昵称' }}</div>

            <div class="badges">
              <div class="badge blue">
                <van-icon name="checked" size="14px" />
                已实名
              </div>

              <div class="badge orange">
                <van-icon name="medal" size="14px" />
                技能认证
              </div>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="stats">
          <div class="stat-item">
            <div class="value">{{ completedOrders }}</div>
            <div class="label">已完成订单</div>
          </div>

          <div class="divider"></div>

          <div class="stat-item">
            <div class="value">{{ rating }}</div>
            <div class="label">综合评分</div>
          </div>
        </div>

        <!-- 编辑按钮 -->
        <EditProfileButton @click="goEdit" />
      </div>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <MenuItem icon="shield-o" color="#007bff" title="实名认证" @click="goRealNameAuth" />
      <MenuItem icon="medal-o" color="#ff9800" title="技能认证" @click="goSkillAuth" />
      <MenuItem icon="contact-o" color="#4caf50" title="个人主页" @click="goPersonalHomepage" />
      <MenuItem icon="location-o" color="#f44336" title="我的工地" @click="goMyConstruction" />
      <MenuItem icon="orders-o" color="#8a2be2" title="我的订单" @click="goMyOrders" />
      <MenuItem icon="setting-o" color="#2196f3" title="屏幕适配测试" />
    </div>
  </div>
</template>

<script setup>
import EditProfileButton from './components/EditProfileButton.vue'
import MenuItem from './components/MenuItem.vue'
import router from '@/router'
import { getCaseListService } from './service'

// 数据
const completedOrders = ref(156)
const rating = ref(4.9)

const userInfoData = ref({})

// 加载用户信息
const loadUserInfo = () => {
  const info = JSON.parse(localStorage.getItem('userInfo')) ?? {}
  userInfoData.value = info

  getCaseListService({
    pageIndex: 1,
    pageSize: 10
  }).then((res) => {
    console.log(res)
  })
}

onMounted(() => {
  loadUserInfo()
})

const goEdit = () => router.push('/mine/edit-info')

const goRealNameAuth = () => router.push('/mine/real-name-auth')

const goSkillAuth = () => router.push('/mine/skill-auth')

const goPersonalHomepage = () => router.push('/mine/personal-homepage')

const goMyConstruction = () => router.push('/mine/my-construction')

const goMyOrders = () => router.push('/mine/my-orders')
</script>

<style lang="less" scoped>
.mine-page {
  background: #f5f5f5;
  min-height: 100vh;
}

/* 顶部渐变背景 */
.header-wrapper {
  position: relative;
}

.header-bg {
  height: 120px;
  background: #00cec9;
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
  background: linear-gradient(to bottom right, #00cec9, #00b4d8);
  border-radius: 50%;
  padding: 3px;
  box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
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
  color: #333;
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
  color: #2196f3;
  background: rgba(33, 150, 243, 0.12);
  border-color: rgba(33, 150, 243, 0.3);
}

.badge.orange {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.12);
  border-color: rgba(255, 152, 0, 0.3);
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
  color: #333;
}

.label {
  font-size: 13px;
  color: #777;
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
