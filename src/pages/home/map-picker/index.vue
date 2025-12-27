<template>
  <div class="map-picker-page">
    <custom-van-navbar />

    <!-- 搜索栏 -->
    <div class="search-wrapper" ref="searchWrapperRef">
      <van-search
        v-model="searchKey"
        shape="round"
        placeholder="搜索地点"
        @input="handleSearchInput"
        @clear="handleClear"
      />
      <!-- 隐藏的 input，用于高德地图 AutoComplete -->
      <input
        ref="searchInputRef"
        id="tipinput"
        type="text"
        v-model="searchKey"
        class="hidden-input"
        autocomplete="off"
      />
      <!-- 搜索结果列表 -->
      <div v-if="searchResults.length" class="search-results">
        <div
          v-for="(item, idx) in searchResults"
          :key="item.id || idx"
          class="search-item"
          @click="handleSelectPlace(item)"
        >
          <van-icon name="location-o" class="item-icon" />
          <div class="item-content">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-address">{{ item.district || item.address || '' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainerRef" @click="handleClickOutside"></div>

    <!-- 中心标记 -->
    <div class="center-marker">
      <van-icon name="location" />
    </div>

    <!-- 底部操作栏 -->
    <div class="footer">
      <div v-if="selectedLocation" class="address-bar">
        <van-icon name="location-o" />
        <span class="address-text">{{ selectedLocation.address }}</span>
      </div>
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
</template>

<script lang="ts" setup>
import { ref, onUnmounted, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { getReverseGeocode, updateCraftsmanUser } from '../service'
import { loadLocationFromLocal, saveLocationToLocal } from '../utils'
import { getCurrentPosition } from '@/utils/index'

interface Location {
  latitude: number
  longitude: number
  address: string
}

const router = useRouter()
const route = useRoute()

const mapContainerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchWrapperRef = ref<HTMLElement | null>(null)
const searchKey = ref('')
const searchResults = ref<any[]>([])
const map = ref<any>(null)
const geocoder = ref<any>(null)
const autoComplete = ref<any>(null)
const selectedLocation = ref<Location | null>(null)
const confirming = ref(false)
const isMapInitialized = ref(false) // 标志位：地图是否已初始化完成

// 点击外部关闭搜索结果的处理函数
const handleDocumentClick = (e: MouseEvent) => {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target as Node)) {
    if (searchResults.value.length > 0) {
      searchResults.value = []
    }
  }
}

const AMAP_KEY = 'bdf0243e6e4ee01f862e5e9004e3b580'
const AMAP_SECURITY_JS_CODE = '1308437424b2de6d3803df74c3650d80'

// 加载地图 SDK
const loadSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).AMap) {
      resolve()
      return
    }

    if (AMAP_SECURITY_JS_CODE) {
      ;(window as any)._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY_JS_CODE
      }
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
          delete (window as any).initAMap
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
    AMap.plugin(['AMap.Geocoder', 'AMap.AutoComplete', 'AMap.ToolBar'], () => {
      resolve()
    })
  })
}

// 获取初始位置
const getInitialLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  const savedLocation = loadLocationFromLocal()
  if (savedLocation?.currentLocation?.latitude && savedLocation?.currentLocation?.longitude) {
    return {
      latitude: savedLocation.currentLocation.latitude,
      longitude: savedLocation.currentLocation.longitude
    }
  }

  const lat = route.query.latitude ? parseFloat(route.query.latitude as string) : null
  const lng = route.query.longitude ? parseFloat(route.query.longitude as string) : null
  if (lat && lng) {
    return { latitude: lat, longitude: lng }
  }

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000
    })
    return {
      latitude: position.latitude,
      longitude: position.longitude
    }
  } catch {
    return null
  }
}

// 初始化地图
const initMap = async () => {
  if (!mapContainerRef.value) return

  try {
    await loadSDK()
    const AMap = (window as any).AMap
    const initialLocation = await getInitialLocation()

    const mapOptions: any = {
      zoom: initialLocation ? 15 : 10,
      zoomEnable: true,
      dragEnable: true,
      zooms: [3, 18]
    }

    if (initialLocation) {
      mapOptions.center = [initialLocation.longitude, initialLocation.latitude]
      // 初始化时设置选中位置，避免闪烁
      selectedLocation.value = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        address: '正在获取地址...'
      }
    }

    map.value = new AMap.Map(mapContainerRef.value, mapOptions)
    await loadPlugins(AMap)

    geocoder.value = new AMap.Geocoder({ city: '全国' })

    // 创建 AutoComplete
    await nextTick()
    if (searchInputRef.value) {
      searchInputRef.value.value = ''
      searchKey.value = ''

      autoComplete.value = new AMap.AutoComplete({
        input: 'tipinput',
        city: '全国'
      })

      autoComplete.value.on('select', (e: any) => {
        if (e.tip?.location) {
          const { lng, lat } = e.tip.location
          if (lng && lat && map.value) {
            // 先设置中心点，再设置缩放级别
            map.value.setCenter([lng, lat])
            map.value.setZoom(16)
            // 等待地图移动完成后再更新位置
            setTimeout(() => {
              updateLocation()
            }, 100)
            searchKey.value = e.tip.name || ''
          }
        }
      })

      autoComplete.value.on('complete', (result: any) => {
        if (result?.tips?.length) {
          searchResults.value = result.tips.map((tip: any) => ({
            id: tip.id,
            name: tip.name,
            district: tip.district,
            address: tip.address || tip.district || '',
            location: tip.location
          }))
        } else {
          searchResults.value = []
        }
      })
    }

    // 添加工具栏
    const toolbar = new AMap.ToolBar({
      position: { bottom: '120px', right: '16px' }
    })
    map.value.addControl(toolbar)

    // 如果已有初始位置，直接更新地址信息，不改变地图中心点
    if (initialLocation && selectedLocation.value) {
      if (geocoder.value?.getAddress) {
        geocoder.value.getAddress(
          [initialLocation.longitude, initialLocation.latitude],
          (status: string, result: any) => {
            if (status === 'complete' && result?.regeocode && selectedLocation.value) {
              selectedLocation.value.address =
                result.regeocode.formattedAddress ||
                `${initialLocation.latitude},${initialLocation.longitude}`
            } else if (selectedLocation.value) {
              selectedLocation.value.address = `${initialLocation.latitude},${initialLocation.longitude}`
            }
          }
        )
      }
    }

    // 延迟绑定移动事件，确保地图完全加载，避免初始化时的 moveend 事件触发导致闪烁
    setTimeout(() => {
      isMapInitialized.value = true
      map.value.on('moveend', updateLocation)
      map.value.on('dragend', updateLocation)
    }, 800) // 延迟足够长的时间，确保地图完全渲染完成
  } catch (error: any) {
    showToast(error.message || '地图加载失败')
  }
}

// 更新位置信息（防抖）
let updateTimer: number | null = null
const updateLocation = () => {
  if (!map.value || !isMapInitialized.value) return // 只有在地图初始化完成后才更新位置

  if (updateTimer) clearTimeout(updateTimer)

  updateTimer = window.setTimeout(() => {
    const center = map.value.getCenter()
    const lng = center.getLng()
    const lat = center.getLat()

    selectedLocation.value = {
      latitude: lat,
      longitude: lng,
      address: '正在获取地址...'
    }

    if (geocoder.value?.getAddress) {
      geocoder.value.getAddress([lng, lat], (status: string, result: any) => {
        if (status === 'complete' && result?.regeocode && selectedLocation.value) {
          selectedLocation.value.address = result.regeocode.formattedAddress || `${lat},${lng}`
        } else if (selectedLocation.value) {
          selectedLocation.value.address = `${lat},${lng}`
        }
      })
    }
  }, 300)
}

// 确认选择
const handleConfirm = async () => {
  if (!selectedLocation.value) {
    showToast('请先选择位置')
    return
  }

  confirming.value = true
  try {
    const { success, data } = await getReverseGeocode({
      latitude: selectedLocation.value.latitude,
      longitude: selectedLocation.value.longitude
    })

    if (success && data) {
      const address = data.formatted_address || data.address || selectedLocation.value.address
      const locationData = { ...data, address }
      const currentLocationData = {
        latitude: selectedLocation.value.latitude,
        longitude: selectedLocation.value.longitude
      }

      saveLocationToLocal(locationData, currentLocationData)

      await updateCraftsmanUser({
        latitude: selectedLocation.value.latitude,
        longitude: selectedLocation.value.longitude,
        province: data.province,
        city: data.city,
        district: data.district,
        address
      })

      showToast('位置更新成功')
      router.back()
    } else {
      showToast('获取位置信息失败')
    }
  } catch (error) {
    console.error('更新位置失败:', error)
    showToast('更新位置失败')
  } finally {
    confirming.value = false
  }
}

// 处理搜索输入
const handleSearchInput = (val: any) => {
  const inputValue = typeof val === 'string' ? val : val?.target?.value ?? searchKey.value
  searchKey.value = inputValue

  // 如果输入为空，清空搜索结果
  if (!inputValue?.trim()) {
    searchResults.value = []
    return
  }

  if (searchInputRef.value) {
    searchInputRef.value.value = inputValue || ''
    searchInputRef.value.dispatchEvent(new Event('input', { bubbles: true }))
    searchInputRef.value.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }))
  }
}

// 处理清除按钮
const handleClear = () => {
  searchKey.value = ''
  searchResults.value = []
  if (searchInputRef.value) {
    searchInputRef.value.value = ''
  }
}

// 点击外部区域关闭搜索结果
const handleClickOutside = () => {
  if (searchResults.value.length > 0) {
    searchResults.value = []
  }
}

// 处理选择搜索结果
const handleSelectPlace = (item: any) => {
  searchResults.value = []
  searchKey.value = item.name || ''

  let lng: number | null = null
  let lat: number | null = null

  if (item.location) {
    if (Array.isArray(item.location) && item.location.length === 2) {
      lng = Number(item.location[0])
      lat = Number(item.location[1])
    } else if (item.location.lng || item.location.lat) {
      lng = Number(item.location.lng)
      lat = Number(item.location.lat)
    }
  }

  if (lng && lat && map.value) {
    // 先设置中心点，再设置缩放级别
    map.value.setCenter([lng, lat])
    map.value.setZoom(16)

    // 等待地图移动完成后再更新位置
    setTimeout(() => {
      updateLocation()
    }, 100)

    selectedLocation.value = {
      latitude: lat,
      longitude: lng,
      address: item.district || item.address || item.name || '正在获取地址...'
    }

    setTimeout(() => {
      if (geocoder.value?.getAddress) {
        geocoder.value.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result?.regeocode && selectedLocation.value) {
            selectedLocation.value.address =
              result.regeocode.formattedAddress || selectedLocation.value.address
          }
        })
      }
    }, 500)
  } else {
    showToast('未能获取该地点的有效坐标')
  }
}

// 销毁地图
const destroyMap = () => {
  if (map.value?.destroy) {
    map.value.destroy()
  }
  map.value = null
  geocoder.value = null
  isMapInitialized.value = false // 重置标志位
}

onMounted(() => {
  nextTick(initMap)
  // 点击外部区域关闭搜索结果
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  destroyMap()
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style lang="less" scoped>
.map-picker-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.search-wrapper {
  position: absolute;
  top: 56px;
  left: 12px;
  right: 12px;
  z-index: 1000;

  .hidden-input {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .search-results {
    margin-top: 6px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-height: 40vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid #ebedf0;

    .search-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f5f5f5;
      }

      .item-icon {
        color: #00cec9;
        font-size: 14px;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .item-content {
        flex: 1;
        min-width: 0;

        .item-name {
          font-size: 14px;
          color: #323233;
          font-weight: 500;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-address {
          font-size: 12px;
          color: #969799;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.map-container {
  flex: 1;
  width: 100%;
  position: relative;
}

.center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  z-index: 500;
  pointer-events: none;
  margin-top: -56px;

  .van-icon {
    font-size: 24px;
    color: #00cec9;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
}

.footer {
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #ebedf0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .address-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    font-size: 14px;
    color: #323233;

    .van-icon {
      color: #00cec9;
      font-size: 16px;
      flex-shrink: 0;
    }

    .address-text {
      flex: 1;
      min-width: 0;
      word-break: break-all;
      line-height: 1.5;
    }
  }

  .confirm-btn {
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
    border: none;
    box-shadow: 0 2px 8px rgba(0, 206, 201, 0.25);
  }
}

// 优化工具栏样式
:deep(.amap-toolbar) {
  .amap-toolbar-item {
    width: 40px !important;
    height: 40px !important;
    background-color: rgba(255, 255, 255, 0.95) !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
}
</style>
