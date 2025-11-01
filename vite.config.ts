import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import viteImagemin from 'vite-plugin-imagemin'
import legacyPlugin from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite'

const getEnvProxy = (mode: string) => {
  let server = {}
  switch (mode) {
    case 'test':
      return {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, '')
          }
        }
      }
    case 'development':
      server = {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, '')
          }
        }
      }
      break
    case 'qa':
      server = {
        proxy: {
          '/api': {
            target: 'http://xxx-dev/api',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, '')
          }
        }
      }
      break
    default:
      server = {}
      break
  }
  return server
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  return {
    base: '/fitment-h5/', // 设置 base 路径为你想要的根目录
    plugins: [
      // 浏览器兼容插件
      legacyPlugin({
        targets: ['chrome 52'], // 需要兼容的目标列表，可以设置多个
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'] // 面向IE11时需要此插件
      }),
      // 自动导入 Vue API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: true, // 生成类型声明文件
        eslintrc: {
          enabled: true // 生成 ESLint 配置
        }
      }),
      vue(),
      vueJsx()
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: mode != 'production' ? getEnvProxy(mode) : {},
    build: {
      outDir: 'fitment-h5',
      // 设置为false，不生成.map文件
      sourcemap: false,
      // 设置为true打包时不生成.html文件
      emptyOutDir: true,
      // 设置主入口文件
      rollupOptions: {
        input: './index.html'
      }
    }
  }
})
