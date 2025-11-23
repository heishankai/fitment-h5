import { type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin-service',
    name: '后台客服',
    children: [
      {
        path: '/admin-service/wechat-msg',
        name: '微信用户联系在线客服',
        component: () => import('@/pages/admin-service/wechat-msg/index.vue'),
        meta: {
          title: '在线客服'
        }
      },
      {
        path: '/admin-service/craftsman-msg',
        name: '工匠用户联系在线客服',
        component: () => import('@/pages/admin-service/craftsman-msg/index.vue'),
        meta: {
          title: '联系客服'
        }
      }
    ]
  },
  {
    path: '/notice',
    name: '公告',
    children: [
      {
        path: '/notice/notice-list',
        name: '平台公告',
        component: () => import('@/pages/notice/notice-list/index.vue'),
        meta: {
          title: '平台公告'
        }
      },
      {
        path: '/notice/notice-detail',
        name: '公告详情',
        component: () => import('@/pages/notice/notice-detail/index.vue'),
        meta: {
          title: '公告详情'
        }
      },
      {
        path: '/notice/craftsman-system-message',
        name: '工匠用户系统通知',
        component: () => import('@/pages/notice/craftsman-system-message/index.vue'),
        meta: {
          title: '系统通知'
        }
      },
      {
        path: '/notice/wechat-system-message',
        name: '微信用户系统通知',
        component: () => import('@/pages/notice/wechat-system-message/index.vue'),
        meta: {
          title: '系统通知'
        }
      }
    ]
  },
  {
    path: '/chat',
    name: '消息',
    children: [
      {
        path: '/chat/wechat',
        name: '微信用户消息',
        meta: {
          title: '微信用户消息'
        },
        component: () => import('@/pages/chat/wechat/index.vue')
      },
      {
        path: '/chat/wechat/:id',
        name: '微信用户聊天详情',
        meta: {
          title: '聊天'
        },
        component: () => import('@/pages/chat/wechat/[id].vue')
      },
      {
        path: '/chat/craftsman',
        name: '工匠用户消息',
        component: () => import('@/pages/chat/craftsman/index.vue'),
        meta: {
          title: '在线客服'
        }
      },
      {
        path: '/chat/craftsman/:id',
        name: '工匠用户聊天详情',
        meta: {
          title: '聊天'
        },
        component: () => import('@/pages/chat/craftsman/[id].vue')
      },
      {
        path: '/chat/select-craftsman',
        name: '选择工匠',
        meta: {
          title: '选择工匠'
        },
        component: () => import('@/pages/chat/select-craftsman/index.vue')
      }
    ]
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
        component: () => import('@/pages/mine/edit-info/index.vue'),
        meta: {
          title: '编辑资料'
        }
      },
      {
        path: '/mine/real-name-auth',
        name: '实名认证',
        component: () => import('@/pages/mine/real-name-auth/index.vue'),
        meta: {
          title: '实名认证'
        }
      },
      {
        path: '/mine/skill-auth',
        name: '技能认证',
        component: () => import('@/pages/mine/skill-auth/index.vue'),
        meta: {
          title: '技能认证'
        }
      },
      {
        path: '/mine/work-kind-list',
        name: '工种选择',
        component: () => import('@/pages/mine/work-kind-list/index.vue'),
        meta: {
          title: '工种选择'
        }
      },
      {
        path: '/mine/personal-homepage',
        name: '个人主页',
        component: () => import('@/pages/mine/personal-homepage/index.vue'),
        meta: {
          title: '个人主页'
        }
      },
      {
        path: '/mine/my-construction',
        name: '我的工地订单',
        component: () => import('@/pages/mine/my-construction/index.vue'),
        meta: {
          title: '我的工地订单'
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
