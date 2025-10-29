import { type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/wechat-msg-list',
    name: '微信用户消息列表页面',
    component: () => import('@/pages/wechat-msg-list/index.vue'),
    meta: {
      title: '微信用户消息列表页面'
    }
  },
  {
    path: '/wechat-msg',
    name: '发送消息页面',
    component: () => import('@/pages/wechat-msg/index.vue'),
    meta: {
      title: '发送消息页面'
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
