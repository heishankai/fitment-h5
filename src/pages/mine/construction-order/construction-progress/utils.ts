import dayjs from 'dayjs'

// 时间显示统一到分钟，避免页面里散落格式化规则。
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}
