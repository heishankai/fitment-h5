import Request from '@/utils/request'
import type { BasicResp } from '@/types/common'

/**
 * 获取微信用户的聊天房间信息
 */
export const getWechatUserRoom = (): Promise<BasicResp<any>> => {
  return Request({
    url: `/api/chat/room/my`,
    method: 'GET'
  }) as Promise<BasicResp<any>>
}

/**
 * 获取房间内的消息列表
 * @param roomId 房间ID
 * @param getAll 是否获取全部消息，默认true
 */
export const getRoomMessages = (
  roomId: number,
  getAll: boolean = true
): Promise<BasicResp<any>> => {
  if (getAll) {
    return Request({
      url: `/api/chat/rooms/${roomId}/messages`,
      method: 'GET',
      params: { all: 'true' }
    }) as Promise<BasicResp<any>>
  }

  return Request({
    url: `/api/chat/rooms/${roomId}/messages`,
    method: 'GET',
    params: { page: 1, pageSize: 50 }
  }) as Promise<BasicResp<any>>
}

/**
 * 上传图片
 * 使用公共的 Request
 * 后端有全局 ResponseInterceptor，会自动包装响应为 { success, data, code, message }
 *
 * 注意：后端使用 FileInterceptor('file')，所以 FormData 中的文件字段名必须是 'file'
 * folder 参数通过 FormData 的 body 传递
 */
export const uploadImage = (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  // 文件字段名必须是 'file'（与后端 FileInterceptor('file') 匹配）
  formData.append('file', file)
  // folder 参数通过 FormData body 传递
  formData.append('folder', 'chat')

  // 使用公共 Request，拦截器会自动处理 token 和 FormData
  // 注意：不要手动设置 headers，让拦截器处理 FormData 的 Content-Type
  return Request({
    url: `/api/upload`,
    method: 'POST',
    data: formData,
    timeout: 30000
  })
    .then((res: any) => {
      console.log('上传响应:', res)
      // 后端 ResponseInterceptor 包装后的格式：{ success: true, data: { url, name, ... }, code: 200 }
      if (res?.success && res?.data?.url) {
        return { url: res.data.url }
      }
      throw new Error(res?.message || '上传失败：未获取到图片URL')
    })
    .catch((error: any) => {
      console.error('上传错误详情:', error)
      // 如果是 400 错误，尝试获取更详细的错误信息
      if (error?.response?.data) {
        const errorData = error.response.data
        throw new Error(errorData?.message || errorData?.error || '上传失败：400 错误')
      }
      throw error
    })
}
