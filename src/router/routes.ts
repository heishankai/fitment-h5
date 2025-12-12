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
        path: '/notice/wechat-notice-list',
        name: '微信用户平台公告',
        component: () => import('@/pages/notice/wechat-notice-list/index.vue'),
        meta: {
          title: '平台公告'
        }
      },
      {
        path: '/notice/wechat-notice-detail',
        name: '微信用户公告详情',
        component: () => import('@/pages/notice/wechat-notice-detail/index.vue'),
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
        name: '消息列表',
        meta: {
          title: '消息列表'
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
      },
      {
        path: '/mine/construction-order/:id',
        name: '工地详情',
        meta: { title: '工地详情' },
        component: () => import('@/pages/mine/construction-order/index.vue')
      },
      {
        path: '/mine/construction-progress/:id',
        name: '施工进度',
        meta: { title: '施工进度' },
        component: () => import('@/pages/mine/construction-progress/index.vue')
      },
      {
        path: '/mine/designer-price/:id',
        name: '设计师工价',
        meta: { title: '设计师工价' },
        component: () => import('@/pages/mine/designer-price/index.vue')
      },
      {
        path: '/mine/foreman-price/:id',
        name: '工价',
        meta: { title: '工价' },
        component: () => import('@/pages/mine/foreman-price/index.vue')
      },
      {
        path: '/mine/foreman-price/detail/:id',
        name: '工价详情',
        meta: { title: '工价详情' },
        component: () => import('@/pages/mine/foreman-price/detail.vue')
      },
      {
        path: '/mine/create-material-order/:id',
        name: '创建辅料单',
        meta: { title: '创建辅料单' },
        component: () => import('@/pages/mine/create-material-order/index.vue')
      },
      {
        path: '/mine/create-material-order/detail/:id',
        name: '商品详情',
        meta: { title: '商品详情' },
        component: () => import('@/pages/mine/create-material-order/detail.vue')
      },
      {
        path: '/mine/create-material-order/search/:id',
        name: '搜索商品',
        meta: { title: '搜索商品' },
        component: () => import('@/pages/mine/create-material-order/search.vue')
      }
    ]
  },
  {
    path: '/home',
    name: '首页',
    children: [
      {
        path: '/home',
        name: '首页',
        meta: { title: '首页' },
        component: () => import('@/pages/home/index.vue')
      },
      {
        path: '/home/order/:id',
        name: '订单详情',
        meta: { title: '订单详情' },
        component: () => import('@/pages/home/order-detail/index.vue')
      },
      {
        path: '/home/map-picker',
        name: '选择位置',
        meta: { title: '选择位置' },
        component: () => import('@/pages/home/map-picker/index.vue')
      }
    ]
  },
  {
    path: '/wallet',
    name: 'wallet',
    children: [
      {
        path: '/wallet',
        name: '钱包',
        meta: { title: '钱包' },
        component: () => import('@/pages/wallet/index.vue')
      },
      {
        path: '/wallet/withdraw-record',
        name: '提现记录',
        meta: { title: '提现记录' },
        component: () => import('@/pages/wallet/withdraw-record.vue')
      },
      {
        path: '/wallet/craftsman_bank_card',
        name: '银行卡',
        meta: { title: '银行卡' },
        component: () => import('@/pages/wallet/craftsman_bank_card.vue')
      },
      {
        path: '/wallet/withdraw',
        name: '提现',
        meta: { title: '提现' },
        component: () => import('@/pages/wallet/withdraw.vue')
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
