// 获取订单状态类型
export const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning' // 待接单
    case 2:
      return 'primary' // 已接单
    case 3:
      return 'success' // 已完成
    case 4:
      return 'danger' // 已取消
    default:
      return 'default'
  }
}

// 本地存储的 key
const LOCATION_STORAGE_KEY = 'user_location_info'

// 保存位置信息到本地存储
export const saveLocationToLocal = (location: any, currentLocation: any) => {
  try {
    const locationData = {
      location,
      currentLocation,
      timestamp: Date.now()
    }
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData))
  } catch (error) {
    console.error('保存位置信息失败:', error)
  }
}

// 从本地存储读取位置信息
export const loadLocationFromLocal = (): { location: any; currentLocation: any } | null => {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return {
        location: data.location,
        currentLocation: data.currentLocation
      }
    }
  } catch (error) {
    console.error('读取位置信息失败:', error)
  }
  return null
}
