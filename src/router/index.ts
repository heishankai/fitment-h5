import { createRouter, createWebHistory } from 'vue-router'
// data
import routes from './routes'
// utils
import { setToken } from '@/utils/index'

/**
 * @路由配置详解
 * 路由模式是：history
 * 引入方式：路由懒加载，打包时会代码分割，加快加载，import('@/pages/HomeView.vue')
 * <router-view></router-view> 标签是内置的，使用不需要引入
 * createWebHistory：路由基本前缀
 */

const router = createRouter({
  history: createWebHistory('fitment-h5/'),
  routes,
  // 记住页面滚动条位置：position: fixed 或者overflow: hidden等样式，会影响滚动
  scrollBehavior: (to: any, from: any, savedPosition: any) => {
    if (savedPosition) {
      // 如果存在savedPosition，返回保存的位置
      return savedPosition
    } else {
      // 否则，返回顶部
      return { left: 0, top: 0 }
    }
  }
})

/**
 * 前置路由守卫获取 URL 中的 token
 */
router.beforeEach(async (to: any, from: any, next: any) => {
  window.document.title = to.meta.title
  const { token } = to.query ?? {}

  const userInfo: any = JSON.parse(localStorage.getItem('userInfo') ?? '{}')

  if (userInfo?.token) {
    setToken(userInfo.token)
  }

  if (token) {
    setToken(token as string)
  }

  next()
})

/**
 * 后置路由守卫
 */
router.afterEach(() => {})

export default router
