import '@/styles/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vant, { setToastDefaultOptions } from 'vant'
import 'vant/lib/index.css'

// loading toast：spinner 类型 + 去掉背景色
setToastDefaultOptions('loading', { className: 'van-toast--no-bg' })

const app = createApp(App)

app.use(createPinia())
app.use(Vant)
app.use(router)

app.mount('#app')
