<template>
  <div class="page-container">
    <div class="header">
      <h2 class="title">地理位置测试</h2>
      <div class="support-status" :class="{ supported: isSupported }">
        {{ isSupported ? '✓ 浏览器支持地理位置' : '✗ 浏览器不支持地理位置' }}
      </div>
      <div class="env-info">
        <div class="env-item">
          <span>环境:</span>
          <span>{{ isWebView ? 'WebView' : '浏览器' }}</span>
        </div>
        <div class="env-item" v-if="hasNativeBridge">
          <span>原生桥接:</span>
          <span style="color: #07c160">✓ 可用</span>
        </div>
      </div>
    </div>

    <div class="content">
      <van-button
        type="primary"
        size="large"
        block
        :loading="loading"
        @click="handleGetLocation"
        class="action-btn"
      >
        获取当前位置
      </van-button>

      <van-button
        type="success"
        size="large"
        block
        :disabled="!isSupported || !!watchId"
        @click="handleStartWatch"
        class="action-btn"
      >
        {{ watchId ? '正在监听位置变化...' : '开始监听位置变化' }}
      </van-button>

      <van-button
        v-if="watchId"
        type="warning"
        size="large"
        block
        @click="handleStopWatch"
        class="action-btn"
      >
        停止监听
      </van-button>

      <div v-if="error" class="error-message">
        <van-icon name="warning-o" />
        <span>{{ error }}</span>
      </div>

      <div v-if="location" class="location-info">
        <div class="info-card">
          <div class="info-item">
            <span class="label">纬度 (Latitude):</span>
            <span class="value">{{ location.latitude.toFixed(6) }}</span>
          </div>
          <div class="info-item">
            <span class="label">经度 (Longitude):</span>
            <span class="value">{{ location.longitude.toFixed(6) }}</span>
          </div>
          <div class="info-item" v-if="location.accuracy">
            <span class="label">精度:</span>
            <span class="value">{{ Math.round(location.accuracy) }} 米</span>
          </div>
          <div class="info-item" v-if="location.altitude !== null">
            <span class="label">海拔:</span>
            <span class="value">{{ Math.round(location.altitude!) }} 米</span>
          </div>
          <div class="info-item" v-if="location.speed !== null && location.speed !== undefined">
            <span class="label">速度:</span>
            <span class="value">{{ location.speed.toFixed(2) }} 米/秒</span>
          </div>
          <div class="info-item" v-if="location.heading !== null">
            <span class="label">方向:</span>
            <span class="value">{{ Math.round(location.heading!) }}°</span>
          </div>
        </div>

        <div class="map-link">
          <van-button type="default" size="small" block @click="openMap"> 在地图中查看 </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  isGeolocationSupported,
  getCurrentPosition,
  watchPosition,
  clearWatch,
  type GeolocationPosition
} from '@/utils/index'
import { showToast } from 'vant'
import { getReverseGeocode } from '@/pages/home/service'

const isSupported = ref(false)
const location = ref<GeolocationPosition | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const watchId = ref<number | null>(null)
const isWebView = ref(false)
const hasNativeBridge = ref(false)

onMounted(() => {
  isSupported.value = isGeolocationSupported()

  // 检测 WebView 环境
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  isWebView.value =
    /(iPhone|iPod|iPad|Android|Windows Phone)/i.test(userAgent) &&
    !(window as any).chrome &&
    !(window as any).safari

  // 检测原生桥接
  hasNativeBridge.value = !!(
    (window as any).getLocation ||
    (window as any).getCurrentLocation ||
    (window as any).webkit?.messageHandlers?.getLocation ||
    (window as any).Android?.getLocation
  )

  console.log('环境信息:', {
    isSupported: isSupported.value,
    isWebView: isWebView.value,
    hasNativeBridge: hasNativeBridge.value,
    userAgent: userAgent
  })

  if (!isSupported.value && !hasNativeBridge.value) {
    error.value = '您的浏览器不支持地理位置API，且未检测到原生桥接'
  }
})

onUnmounted(() => {
  if (watchId.value !== null) {
    clearWatch(watchId.value)
  }
})

const handleGetLocation = async () => {
  if (!isSupported.value && !hasNativeBridge.value) {
    showToast('浏览器不支持地理位置API，且未检测到原生桥接')
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('开始获取位置...')
    const position = await getCurrentPosition({
      enableHighAccuracy: true, // 启用高精度定位
      timeout: isWebView.value ? 30000 : 15000, // WebView 中延长超时时间
      maximumAge: isWebView.value ? 60000 : 0 // WebView 中允许使用缓存
    })
    location.value = position
    const res = await getReverseGeocode({
      latitude: position.latitude,
      longitude: position.longitude
    })
    console.log('获取位置成功:', position)
    console.log('获取位置成功:1212', res)
    showToast('获取位置成功')
  } catch (err: any) {
    const errorMsg = err.message || '获取位置失败'
    error.value = errorMsg
    console.error('获取位置失败:', err)
    showToast(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleStartWatch = () => {
  if (!isSupported.value) {
    showToast('浏览器不支持地理位置API')
    return
  }

  error.value = null
  const id = watchPosition(
    (position: GeolocationPosition) => {
      location.value = position
      console.log('位置更新:', position)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000 // 允许使用5秒内的缓存
    }
  )

  if (id !== null) {
    watchId.value = id
    showToast('开始监听位置变化')
  } else {
    error.value = '启动位置监听失败'
  }
}

const handleStopWatch = () => {
  if (watchId.value !== null) {
    clearWatch(watchId.value)
    watchId.value = null
    showToast('已停止监听位置变化')
  }
}

const openMap = () => {
  if (location.value) {
    const { latitude, longitude } = location.value
    // 使用高德地图打开
    const amapUrl = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=当前位置`
    window.open(amapUrl, '_blank')
  }
}
</script>

<style lang="less" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  padding: 16px;
}

.header {
  text-align: center;
  margin-bottom: 24px;

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 12px;
  }

  .support-status {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    display: inline-block;
    background: #fff3cd;
    color: #856404;
    margin-bottom: 8px;

    &.supported {
      background: #d4edda;
      color: #155724;
    }
  }

  .env-info {
    font-size: 12px;
    color: #646566;
    margin-top: 8px;

    .env-item {
      display: inline-block;
      margin-right: 16px;
      padding: 4px 8px;
      background: #f7f8fa;
      border-radius: 4px;

      span:first-child {
        margin-right: 4px;
      }
    }
  }
}

.content {
  max-width: 600px;
  margin: 0 auto;
}

.action-btn {
  margin-bottom: 12px;
}

.error-message {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ee0a24;
  font-size: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.location-info {
  margin-top: 24px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: #646566;
    font-weight: 500;
  }

  .value {
    font-size: 14px;
    color: #323233;
    font-weight: 600;
    font-family: 'Courier New', monospace;
  }
}

.map-link {
  margin-top: 12px;
}
</style>
