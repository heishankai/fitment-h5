import dayjs from 'dayjs'
import { getCurrentPosition, isWebView } from '@/utils/index'
import { getReverseGeocode } from './service'

// 格式化时间（精确到分钟）
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

// 获取用户位置
export const getUserLocation = async (construction_progress: any) => {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: isWebView() ? 30000 : 15000,
      maximumAge: isWebView() ? 60000 : 0
    })

    const { success, data } = await getReverseGeocode(position)

    if (success && data) {
      // 接收 ref 对象，使用 .value 访问
      construction_progress.value.location = data.address || data.formatted_address
    }
  } catch (error) {
    console.error('获取位置失败:', error)
  }
}

// 校验必填项
export const validateProgress = (progress: {
  start_time: string
  end_time: string
  location: string
  photos: Array<{ url: string }>
}): string | null => {
  if (!progress.start_time) {
    return '请先完成上班打卡'
  }

  if (!progress.end_time) {
    return '请先完成下班打卡'
  }

  if (!progress.location) {
    return '请等待位置信息加载完成'
  }

  if (!progress.photos || progress.photos.length === 0) {
    return '请至少上传一张施工照片'
  }

  return null
}
