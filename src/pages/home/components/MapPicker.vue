<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '84vh' }"
    round
    closeable
    close-icon-position="top-right"
    @close="handleClose"
  >
    <div class="map-picker">
      <div class="map-header">
        <h3 class="map-title">选择位置</h3>
        <p class="map-subtitle">拖动地图选择您的位置</p>
      </div>

      <div class="map-container" ref="mapContainerRef"></div>

      <div class="map-marker">
        <div class="marker-icon">
          <van-icon name="location-o" />
        </div>
        <div class="marker-pulse"></div>
      </div>

      <div class="map-footer">
        <van-button
          type="primary"
          block
          round
          :loading="confirming"
          @click="handleConfirm"
          class="confirm-btn"
        >
          确认选择
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { showToast } from 'vant'
import { loadLocationFromLocal } from '../utils'

interface Location {
  latitude: number
  longitude: number
  address: string
}

const props = defineProps<{
  show: boolean
  initialLocation?: {
    latitude: number
    longitude: number
  }
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: [location: Location]
}>()

const visible = ref(false)
const mapContainerRef = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const geocoder = ref<any>(null)
const selectedLocation = ref<Location | null>(null)
const confirming = ref(false)

// ------------------------------
// 替换为你的 Key
// ------------------------------
const AMAP_KEY = 'bdf0243e6e4ee01f862e5e9004e3b580'

// 加载高德地图 SDK
const loadSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=initAMap`
    script.async = true
    ;(window as any).initAMap = () => {
      let attempts = 0
      const t = setInterval(() => {
        if ((window as any).AMap) {
          clearInterval(t)
          delete (window as any).initAMap
          resolve()
        } else if (++attempts > 50) {
          clearInterval(t)
          delete (window as any).initAMMap
          reject(new Error('地图加载失败'))
        }
      }, 100)
    }

    script.onerror = () => reject(new Error('地图加载失败'))
    document.head.appendChild(script)
  })
}

// 加载插件
const loadPlugins = (AMap: any): Promise<void> => {
  return new Promise((resolve) => {
    // 异步加载逆地理编码插件
    AMap.plugin('AMap.Geocoder', () => {
      resolve()
    })
  })
}

// 异步加载 ToolBar 控件（缩放工具条）
const loadToolBar = (AMap: any, map: any): Promise<void> => {
  return new Promise((resolve) => {
    AMap.plugin('AMap.ToolBar', () => {
      const toolbar = new AMap.ToolBar({
        position: {
          bottom: '100px', // 距离底部100px，避免与确认按钮重叠
          right: '16px' // 距离右边16px
        }
      })
      map.addControl(toolbar) // 添加控件
      resolve()
    })
  })
}

// 获取初始位置（优先使用本地存储，其次使用传入的位置，最后使用默认位置）
// 注意：所有坐标都应该是 GCJ02 坐标系，与微信小程序一致
const getInitialLocation = () => {
  // 1. 优先从本地存储读取位置（本地存储的坐标已经是 GCJ02）
  const savedLocation = loadLocationFromLocal()
  if (savedLocation?.currentLocation?.latitude && savedLocation?.currentLocation?.longitude) {
    return {
      latitude: savedLocation.currentLocation.latitude,
      longitude: savedLocation.currentLocation.longitude
    }
  }

  // 2. 使用传入的位置（getCurrentPosition 已转换为 GCJ02）
  if (props.initialLocation?.latitude && props.initialLocation?.longitude) {
    return props.initialLocation
  }

  // 3. 使用默认位置（北京，GCJ02 坐标）
  return {
    latitude: 39.908823,
    longitude: 116.39747
  }
}

// 初始化地图
const initMap = async () => {
  if (!mapContainerRef.value) return

  try {
    await loadSDK()
    const AMap = (window as any).AMap

    // 获取初始位置（优先本地存储）
    const initialLocation = getInitialLocation()
    const centerLat = initialLocation.latitude
    const centerLng = initialLocation.longitude

    map.value = new AMap.Map(mapContainerRef.value, {
      zoom: 15,
      center: [centerLng, centerLat],
      zoomEnable: true,
      dragEnable: true,
      zooms: [3, 18]
    })

    // 异步加载插件
    await loadPlugins(AMap)

    // 创建逆地理编码实例
    geocoder.value = new AMap.Geocoder({ city: '全国' })

    // 异步加载 ToolBar 控件（缩放工具条）
    await loadToolBar(AMap, map.value)

    map.value.on('moveend', updateLocation)
    map.value.on('dragend', updateLocation)

    setTimeout(updateLocation, 500)
  } catch (error: any) {
    showToast(error.message || '地图加载失败')
    visible.value = false
  }
}

// 更新位置信息
const updateLocation = () => {
  const center = map.value.getCenter()
  const lng = center.getLng()
  const lat = center.getLat()

  // 高德地图返回的坐标已经是 GCJ02 坐标系，与微信小程序一致
  selectedLocation.value = {
    latitude: lat,
    longitude: lng,
    address: '正在获取地址...'
  }

  // 高德地图逆地理编码接口使用 GCJ02 坐标系
  geocoder.value.getAddress([lng, lat], (status: string, result: any) => {
    if (status === 'complete' && result?.regeocode) {
      selectedLocation.value!.address = result.regeocode.formattedAddress || `${lat},${lng}`
    } else {
      selectedLocation.value!.address = `${lat},${lng}`
    }
  })
}

// 确认选择
const handleConfirm = () => {
  if (!selectedLocation.value) return
  confirming.value = true
  emit('confirm', selectedLocation.value)
  visible.value = false
  confirming.value = false
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

// 销毁地图
const destroyMap = () => {
  if (map.value && map.value.destroy) {
    map.value.destroy()
  }
  map.value = null
  geocoder.value = null
}

watch(
  () => props.show,
  (val) => {
    visible.value = val

    if (val) nextTick(initMap)
    else destroyMap()
  },
  { immediate: true }
)

watch(visible, (val) => {
  emit('update:show', val)
})

onUnmounted(() => {
  destroyMap()
})
</script>

<style lang="less" scoped>
.map-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
}

.map-header {
  padding: 20px 16px 12px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;

  .map-title {
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    margin: 0 0 4px;
  }

  .map-subtitle {
    font-size: 12px;
    color: #969799;
    margin: 0;
  }
}

.map-container {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;

  // 移动端优化 ToolBar 样式
  :deep(.amap-toolbar) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    overflow: hidden;
    background: transparent;

    .amap-toolbar-item {
      width: 44px !important;
      height: 44px !important;
      line-height: 44px !important;
      font-size: 20px !important;
      background-color: rgba(255, 255, 255, 0.95) !important;
      color: #323233 !important;
      border: 1px solid #e8e8e8 !important;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5 !important;
      }

      &:active {
        background-color: #e8e8e8 !important;
        transform: scale(0.95);
      }
    }
  }
}

.map-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  z-index: 1000;
  pointer-events: none;

  .marker-icon {
    width: 40px;
    height: 40px;
    background: #00cec9;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;

    :deep(.van-icon) {
      color: #fff;
      font-size: 20px;
      transform: rotate(45deg);
    }
  }

  .marker-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: rgba(0, 206, 201, 0.3);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
}

.map-footer {
  padding: 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;

  .confirm-btn {
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(0, 206, 201, 0.25);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
</style>
