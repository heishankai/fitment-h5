// 获取路径参数
export const getUrlParame = () => {
  const route = useRoute()
  return route?.query
}

// Token 管理
const TOKEN_KEY = 'auth_token'

/**
 * 设置 token
 */
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * 获取 token
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 token
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// 地理位置相关类型定义
export interface GeolocationPosition {
  latitude: number // 纬度
  longitude: number // 经度
  accuracy?: number // 精度（米）
  altitude?: number | null // 海拔（米）
  altitudeAccuracy?: number | null // 海拔精度（米）
  heading?: number | null // 方向（度）
  speed?: number | null // 速度（米/秒）
  timestamp?: number // 时间戳
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean // 是否启用高精度
  timeout?: number // 超时时间（毫秒）
  maximumAge?: number // 缓存位置的最大时间（毫秒）
  coordinateSystem?: 'WGS84' | 'GCJ02' // 坐标系，默认 GCJ02（与小程序一致）
}

/**
 * 检查浏览器是否支持地理位置API
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator
}

/**
 * 检测是否在 WebView 环境中
 */
export const isWebView = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  return (
    /(iPhone|iPod|iPad|Android|Windows Phone)/i.test(userAgent) &&
    !(window as any).chrome &&
    !(window as any).safari
  )
}

/**
 * WGS84 转 GCJ02（GPS坐标转火星坐标，用于匹配小程序）
 * @param wgsLat WGS84 纬度
 * @param wgsLon WGS84 经度
 * @returns GCJ02 坐标 { latitude, longitude }
 */
const wgs84ToGcj02 = (wgsLat: number, wgsLon: number): { latitude: number; longitude: number } => {
  const a = 6378245.0 // 长半轴
  // eslint-disable-next-line no-loss-of-precision
  const ee = 0.00669342162296594323 // 偏心率平方
  let dLat = transformLat(wgsLon - 105.0, wgsLat - 35.0)
  let dLon = transformLon(wgsLon - 105.0, wgsLat - 35.0)
  const radLat = (wgsLat / 180.0) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI)
  dLon = (dLon * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI)
  return {
    latitude: wgsLat + dLat,
    longitude: wgsLon + dLon
  }
}

// 辅助函数：纬度转换
function transformLat(lon: number, lat: number): number {
  let ret =
    -100.0 +
    2.0 * lon +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lon * lat +
    0.2 * Math.sqrt(Math.abs(lon))
  ret += ((20.0 * Math.sin(6.0 * lon * Math.PI) + 20.0 * Math.sin(2.0 * lon * Math.PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin((lat / 3.0) * Math.PI)) * 2.0) / 3.0
  ret +=
    ((160.0 * Math.sin((lat / 12.0) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30.0)) * 2.0) /
    3.0
  return ret
}

// 辅助函数：经度转换
function transformLon(lon: number, lat: number): number {
  let ret =
    300.0 + lon + 2.0 * lat + 0.1 * lon * lon + 0.1 * lon * lat + 0.1 * Math.sqrt(Math.abs(lon))
  ret += ((20.0 * Math.sin(6.0 * lon * Math.PI) + 20.0 * Math.sin(2.0 * lon * Math.PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(lon * Math.PI) + 40.0 * Math.sin((lon / 3.0) * Math.PI)) * 2.0) / 3.0
  ret +=
    ((150.0 * Math.sin((lon / 12.0) * Math.PI) + 300.0 * Math.sin((lon / 30.0) * Math.PI)) * 2.0) /
    3.0
  return ret
}

/**
 * 通过原生桥接获取位置（如果原生提供了接口）
 */
const getLocationFromNative = (): Promise<GeolocationPosition> | null => {
  // 检查是否有原生桥接方法（根据实际原生接口调整）
  const nativeMethods = [
    (window as any).getLocation,
    (window as any).getCurrentLocation,
    (window as any).webkit?.messageHandlers?.getLocation,
    (window as any).Android?.getLocation
  ]

  for (const method of nativeMethods) {
    if (typeof method === 'function') {
      return new Promise((resolve, reject) => {
        try {
          // 调用原生方法
          const result = method()
          if (result && typeof result.then === 'function') {
            // 如果返回 Promise
            result
              .then((data: any) => {
                if (
                  data &&
                  typeof data.latitude === 'number' &&
                  typeof data.longitude === 'number'
                ) {
                  resolve({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: data.accuracy || 0,
                    altitude: data.altitude ?? null,
                    altitudeAccuracy: data.altitudeAccuracy ?? null,
                    heading: data.heading ?? null,
                    speed: data.speed ?? null,
                    timestamp: data.timestamp || Date.now()
                  })
                } else {
                  reject(new Error('原生返回的位置数据格式不正确'))
                }
              })
              .catch(reject)
          } else if (result && typeof result.latitude === 'number') {
            // 如果直接返回数据
            resolve({
              latitude: result.latitude,
              longitude: result.longitude,
              accuracy: result.accuracy || 0,
              altitude: result.altitude ?? null,
              altitudeAccuracy: result.altitudeAccuracy ?? null,
              heading: result.heading ?? null,
              speed: result.speed ?? null,
              timestamp: result.timestamp || Date.now()
            })
          } else {
            reject(new Error('原生方法返回数据格式不正确'))
          }
        } catch (error: any) {
          reject(new Error(`调用原生方法失败: ${error.message}`))
        }
      })
    }
  }
  return null
}

/**
 * 获取用户当前位置
 * @param options 地理位置选项
 * @returns Promise<GeolocationPosition>
 */
export const getCurrentPosition = (
  options: GeolocationOptions = {}
): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    // 默认使用 GCJ02 坐标系（与小程序一致）
    const targetSystem = options.coordinateSystem ?? 'GCJ02'

    // 坐标转换函数
    const convertCoordinate = (position: GeolocationPosition): GeolocationPosition => {
      if (targetSystem === 'GCJ02') {
        const gcj02 = wgs84ToGcj02(position.latitude, position.longitude)
        return {
          ...position,
          latitude: gcj02.latitude,
          longitude: gcj02.longitude
        }
      }
      return position
    }

    // 1. 优先尝试原生桥接（WebView 环境）
    const nativeLocation = getLocationFromNative()
    if (nativeLocation) {
      nativeLocation
        .then((position) => {
          // 原生返回的坐标通常是 WGS84，需要转换为 GCJ02
          const converted = convertCoordinate(position)
          console.log('原生定位成功，坐标转换:', {
            original: { lat: position.latitude, lon: position.longitude },
            converted: { lat: converted.latitude, lon: converted.longitude },
            system: targetSystem
          })
          resolve(converted)
        })
        .catch((error) => {
          console.warn('原生定位失败，降级到浏览器API:', error)
          // 降级到浏览器 API
          getBrowserLocation(options).then(resolve).catch(reject)
        })
      return
    }

    // 2. 使用浏览器 Geolocation API
    getBrowserLocation(options).then(resolve).catch(reject)
  })
}

/**
 * 使用浏览器 Geolocation API 获取位置
 */
const getBrowserLocation = (options: GeolocationOptions = {}): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('浏览器不支持地理位置API'))
      return
    }

    // WebView 环境优化参数
    const isWebViewEnv = isWebView()
    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? (isWebViewEnv ? true : false), // WebView 中启用高精度
      timeout: options.timeout ?? (isWebViewEnv ? 30000 : 10000), // WebView 中延长超时时间
      maximumAge: options.maximumAge ?? (isWebViewEnv ? 60000 : 0) // WebView 中允许使用1分钟内的缓存
    }

    // 默认使用 GCJ02 坐标系（与小程序一致）
    const targetSystem = options.coordinateSystem ?? 'GCJ02'

    console.log(
      '获取位置，参数:',
      defaultOptions,
      'WebView环境:',
      isWebViewEnv,
      '目标坐标系:',
      targetSystem
    )

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 浏览器返回的是 WGS84 坐标
        const wgs84Lat = position.coords.latitude
        const wgs84Lon = position.coords.longitude

        // 根据选项决定是否转换为 GCJ02
        let finalLat = wgs84Lat
        let finalLon = wgs84Lon

        if (targetSystem === 'GCJ02') {
          const gcj02 = wgs84ToGcj02(wgs84Lat, wgs84Lon)
          finalLat = gcj02.latitude
          finalLon = gcj02.longitude
          console.log('坐标转换: WGS84 -> GCJ02', {
            wgs84: { lat: wgs84Lat, lon: wgs84Lon },
            gcj02: { lat: finalLat, lon: finalLon }
          })
        }

        const result: GeolocationPosition = {
          latitude: finalLat,
          longitude: finalLon,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? null,
          altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
          heading: position.coords.heading ?? null,
          speed: position.coords.speed ?? null,
          timestamp: position.timestamp ?? Date.now()
        }
        console.log('获取位置成功:', result, '坐标系:', targetSystem)
        resolve(result)
      },
      (error: GeolocationPositionError) => {
        let errorMessage = '获取位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理位置权限，请在设置中开启位置权限'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用，请检查GPS是否开启'
            break
          case error.TIMEOUT:
            errorMessage = '获取位置超时，请重试'
            break
          default:
            errorMessage = `未知错误 (code: ${error.code})`
            break
        }
        console.error('获取位置失败:', errorMessage, error)
        reject(new Error(errorMessage))
      },
      defaultOptions
    )
  })
}

/**
 * 监听位置变化
 * @param callback 位置变化回调函数
 * @param options 地理位置选项
 * @returns watchId 监听ID，用于停止监听
 */
export const watchPosition = (
  // eslint-disable-next-line no-unused-vars
  callback: (position: GeolocationPosition) => void,
  options: GeolocationOptions = {}
): number | null => {
  if (!isGeolocationSupported()) {
    console.error('浏览器不支持地理位置API')
    return null
  }

  // WebView 环境优化参数
  const isWebViewEnv = isWebView()
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? (isWebViewEnv ? true : false),
    timeout: options.timeout ?? (isWebViewEnv ? 30000 : 10000),
    maximumAge: options.maximumAge ?? (isWebViewEnv ? 60000 : 0)
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? null,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
        heading: position.coords.heading ?? null,
        speed: position.coords.speed ?? null,
        timestamp: position.timestamp ?? Date.now()
      })
    },
    (error: GeolocationPositionError) => {
      let errorMessage = '获取位置失败'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '用户拒绝了地理位置权限'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用'
          break
        case error.TIMEOUT:
          errorMessage = '获取位置超时'
          break
        default:
          errorMessage = '未知错误'
          break
      }
      console.error(errorMessage, error)
    },
    defaultOptions
  )

  return watchId
}

/**
 * 停止监听位置变化
 * @param watchId 监听ID
 */
export const clearWatch = (watchId: number): void => {
  if (isGeolocationSupported() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * 格式化时间为相对时间
 * @param timeStr 时间字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

/**
 * 加密手机号码
 * @param phone 手机号码
 * @returns 加密后的手机号码（显示前3位和后4位，中间用*代替）
 */
export const encryptPhone = (phone: string): string => {
  if (!phone) return ''
  const phoneStr = String(phone)
  if (phoneStr.length <= 7) {
    // 如果号码长度小于等于7位，只显示前1位和后1位
    return phoneStr.length > 2
      ? `${phoneStr.substring(0, 1)}${'*'.repeat(phoneStr.length - 2)}${phoneStr.substring(phoneStr.length - 1)}`
      : phoneStr
  }
  // 显示前3位和后4位
  return `${phoneStr.substring(0, 3)}****${phoneStr.substring(phoneStr.length - 4)}`
}

/**
 * 检测是否在微信小程序 web-view 环境中
 */
export const isInMiniProgram = (): boolean => {
  if (typeof window === 'undefined') return false
  // 检查是否存在 wx.miniProgram
  return !!(window as any).wx?.miniProgram
}

/**
 * 向小程序发送消息（用于更新标题等）
 * @param data 要发送的数据
 */
export const postMessageToMiniProgram = (data: any): void => {
  if (!isInMiniProgram()) {
    console.log('不在小程序环境中，跳过消息发送')
    return
  }

  try {
    const wx = (window as any).wx
    if (wx?.miniProgram?.postMessage) {
      wx.miniProgram.postMessage({
        data: data
      })
      console.log('已向小程序发送消息:', data)
    } else {
      console.warn('wx.miniProgram.postMessage 不可用')
    }
  } catch (error) {
    console.error('向小程序发送消息失败:', error)
  }
}

/**
 * 更新小程序导航栏标题
 * @param title 标题文本
 */
export const updateMiniProgramTitle = (title: string): void => {
  if (!title) return
  postMessageToMiniProgram({
    type: 'title',
    title: title
  })
}
