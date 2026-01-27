<template>
  <div class="custom-tabs">
    <!-- Tabs 头部 -->
    <div class="tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item"
        :class="{ active: activeTab === tab.name }"
        @click="handleTabChange(tab.name)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <div v-if="activeTab === tab.name" class="tab-indicator" />
      </div>
    </div>

    <!-- Tabs 内容 -->
    <div class="tabs-content">
      <van-swipe
        :loop="false"
        :duration="300"
        :touchable="true"
        :current="currentSwiperIndex"
        :show-indicators="false"
        @change="handleSwiperChange"
        class="swiper-wrapper"
      >
        <van-swipe-item v-for="tab in tabs" :key="tab.name" class="swipe-item">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh-wrapper">
            <div class="tab-panel-wrapper">
              <slot :active-tab="activeTab" />
            </div>
          </van-pull-refresh>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Tab {
  name: string
  title: string
}

const props = defineProps<{
  tabs: Tab[]
  activeTab: string
  refreshing: boolean
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
  'update:refreshing': [value: boolean]
  refresh: []
}>()

const refreshing = computed({
  get: () => props.refreshing,
  set: (value) => {
    emit('update:refreshing', value)
  }
})

const activeTab = computed({
  get: () => props.activeTab,
  set: (value) => {
    emit('update:activeTab', value)
  }
})

// 获取当前 tab 在数组中的索引
const currentSwiperIndex = computed(() => {
  return props.tabs.findIndex((tab) => tab.name === props.activeTab) || 0
})

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

// 处理 Swiper 的切换事件
const handleSwiperChange = (index: number) => {
  if (props.tabs[index]) {
    activeTab.value = props.tabs[index].name
  }
}

const onRefresh = () => {
  emit('refresh')
}
</script>

<style lang="less" scoped>
.custom-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .tabs-header {
    display: flex;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
    border-bottom: 1px solid #f0f0f0;

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 12px;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;

      .tab-title {
        font-size: 15px;
        color: #969799;
        font-weight: 500;
        transition: color 0.3s ease;
      }

      .tab-indicator {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: linear-gradient(90deg, #00cec9 0%, #00b4d8 100%);
        border-radius: 1.5px;
        animation: slideIn 0.3s ease;
      }

      &.active {
        .tab-title {
          color: #323233;
          font-weight: 600;
        }
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .tabs-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .swiper-wrapper {
      flex: 1;
      height: 100%;

      :deep(.van-swipe__track) {
        height: 100%;
      }

      .swipe-item {
        height: 100%;
        display: flex;
        flex-direction: column;

        .pull-refresh-wrapper {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;

          .tab-panel-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
        }
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    width: 0;
  }
  to {
    opacity: 1;
    width: 24px;
  }
}
</style>
