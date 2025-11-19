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
    path: '/mine',
    name: '我的',
    children: [
      {
        path: '/mine',
        name: '我的',
        component: () => import('@/pages/mine/index.vue'),
        meta: {
          title: '我的'
        }
      },
      {
        path: '/mine/edit-info',
        name: '编辑资料',
        component: () => import('@/pages/edit-info/index.vue'),
        meta: {
          title: '编辑资料'
        }
      },
      {
        path: '/mine/real-name-auth',
        name: '实名认证',
        component: () => import('@/pages/real-name-auth/index.vue'),
        meta: {
          title: '实名认证'
        }
      },
      {
        path: '/mine/skill-auth',
        name: '技能认证',
        component: () => import('@/pages/skill-auth/index.vue'),
        meta: {
          title: '技能认证'
        }
      },
      {
        path: '/mine/work-kind-list',
        name: '工种选择',
        component: () => import('@/pages/work-kind-list/index.vue'),
        meta: {
          title: '工种选择'
        }
      },
      {
        path: '/mine/personal-homepage',
        name: '个人主页',
        component: () => import('@/pages/personal-homepage/index.vue'),
        meta: {
          title: '个人主页'
        }
      },
      {
        path: '/mine/my-construction',
        name: '我的工地',
        component: () => import('@/pages/my-construction/index.vue'),
        meta: {
          title: '我的工地'
        }
      },
      {
        path: '/mine/my-orders',
        name: '我的订单',
        component: () => import('@/pages/my-orders/index.vue'),
        meta: {
          title: '我的订单'
        }
      }
    ]
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
