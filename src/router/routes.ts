import { type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/wechat-msg',
    name: '微信用户聊天页面',
    component: () => import('@/pages/wechat-msg/index.vue'),
    meta: {
      title: '微信用户聊天页面'
    }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/pages/404.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

export default routes
