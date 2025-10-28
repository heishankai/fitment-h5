/**
 * @description: 获取按钮权限
 * @param code
 * @returns boolean
 */
export const isAuthButton = (code: string) => {
  const permissonButtonsStr = localStorage.getItem('permissonButtons')

  const buttonsList = permissonButtonsStr ? JSON.parse(permissonButtonsStr) : []

  return (buttonsList || [])?.some((item: any) => item?.userDefineCode === code)
}
