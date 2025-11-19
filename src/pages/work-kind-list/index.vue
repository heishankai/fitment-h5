<template>
  <div class="page">
    <custom-van-navbar />
    <main>
      <div class="header-tip slide-down">
        <div class="tip-icon bounce">🎯</div>
        <div class="tip-text">请选择您的专业技能工种</div>
      </div>
      <div class="work-kind-grid">
        <div
          v-for="(item, index) in workKindList"
          :key="item.id"
          class="work-kind-card fade-in-up shine-effect"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="handleSelectWorkKind(item)"
        >
          <div class="card-bg" :class="`bg-${(index % 6) + 1}`"></div>
          <div class="card-content">
            <div class="work-kind-name">{{ item.work_kind_name }}</div>
            <div class="arrow-wrapper">
              <van-icon name="arrow" class="arrow-icon" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="!workKindList?.length" class="empty-state">
        <van-empty description="暂无数据" />
      </div>
    </main>
  </div>
</template>

<script setup>
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getWorkKindListService } from './service'
import { useRouter } from 'vue-router'

const router = useRouter()
const workKindList = ref([])

// 获取工种信息
const getWorkKindList = async () => {
  const { success, data } = await getWorkKindListService()
  if (!success) return
  workKindList.value = data || []
}

// 选择工种，跳转到技能认证页面
const handleSelectWorkKind = (workKind) => {
  router.push({
    path: '/mine/skill-auth',
    query: {
      workKindId: workKind?.id,
      workKindName: workKind?.work_kind_name
    }
  })
}

onMounted(() => {
  getWorkKindList()
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
  padding: 16px 12px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.header-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  margin-bottom: 20px;
  .tip-icon {
    font-size: 24px;
  }

  .tip-text {
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    letter-spacing: 0.5px;
  }
}

.work-kind-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.work-kind-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &:active {
    transform: scale(0.96) translateY(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  transition: opacity 0.3s;

  &.bg-1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.bg-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.bg-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.bg-4 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  &.bg-5 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  &.bg-6 {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  }
}

.work-kind-card:active .card-bg {
  opacity: 0.15;
}

.work-kind-card:active .card-decoration {
  width: 6px;
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  min-height: 80px;
}

.work-kind-name {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  flex: 1;
  letter-spacing: 0.5px;
  transition: transform 0.3s;
}

.work-kind-card:active .work-kind-name {
  transform: translateX(4px);
}

.arrow-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: 12px;
}

.work-kind-card:active .arrow-wrapper {
  background: rgba(102, 126, 234, 0.15);
  transform: translateX(4px);
}

.arrow-icon {
  color: #969799;
  font-size: 16px;
  transition: all 0.3s;
}

.work-kind-card:active .arrow-icon {
  color: #667eea;
  transform: translateX(2px);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
