import Request from '@/utils/request'

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

  // 使用公共 Request，拦截器会自动处理 token 和 FormData
  // 注意：不要手动设置 headers，让拦截器处理 FormData 的 Content-Type
  return Request({
    url: `/api/upload`,
    method: 'POST',
    data: formData
  })
    .then((res: any) => {
      console.log('上传响应:', res)
      if (res?.success && res?.data?.url) {
        return res
      }
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
