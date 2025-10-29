import '@/styles/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'

// 验证环境变量配置（开发时可以查看，生产环境会自动被 tree-shake）
if (import.meta.env.DEV) {
  console.log('=== 环境变量验证 ===')
  console.log('当前模式 (MODE):', import.meta.env.MODE)
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || '(空，使用代理)')
  console.log('预期配置:', {
    test: '空（使用代理到 http://localhost:3000）',
    production: 'https://zjiangyun.cn/api'
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(Vant)
app.use(router)

app.mount('#app')
