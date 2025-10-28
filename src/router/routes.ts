import { type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/wechat-user',
    name: '微信小程序发送消息用户端',
    component: () => import('@/pages/wechat-user.vue'),
    meta: {
      title: '微信小程序发送消息用户端'
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
