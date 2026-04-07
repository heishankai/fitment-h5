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
        host: '0.0.0.0', // 监听所有网络接口，允许 Android 模拟器通过 10.0.2.2 访问
        port: 5173,
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
        host: '0.0.0.0', // 监听所有网络接口，允许 Android 模拟器通过 10.0.2.2 访问
        port: 5173,
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
    server:
      mode !== 'production'
        ? getEnvProxy(mode)
        : {
            // 服务启动时是否自动打开浏览器
            open: false,
            // 预热文件以降低启动期间的初始页面加载时长
            warmup: {
              /**
               * @description 预热文件： 目录只是在开发环境生效，生产环境不会生效
               * 首页、views、 components
               */
              clientFiles: ['./index.html', './src/{views,components}/*']
            }
          },
    build: {
      outDir: 'fitment-h5',
      // 构建后是否生成 source map 文件(用于线上报错代码报错映射对应代码)
      sourcemap: false,
      // 设置为true打包时不生成.html文件
      emptyOutDir: true,
      cssTarget: 'chrome80',
      // chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
      /**
       * Vite 5 生产构建走 Rollup，只能写 rollupOptions。
       */
      rollupOptions: {
        input: './index.html',
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            // pnpm: .../node_modules/.pnpm/xxx/node_modules/vue/...
            const pnpm = id.match(
              /node_modules\/\.pnpm\/[^/]+\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//
            )
            if (pnpm?.[1]) return pnpm[1].replace(/\//g, '-')
            const flat = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//)
            if (flat?.[1]) return flat[1].replace(/\//g, '-')
          }
        }
      }
    },
    optimizeDeps: {
      /**
       * @description 开发模式生效： 需要预构建的依赖项 如：pinia、lodash-es、axios
       * 优化依赖预构建，加快页面加载速度，避免重复打包依赖
       */
      include: ['pinia', 'lodash-es', 'axios'],
      // 打包时强制排除的依赖项
      exclude: ['vant', '@vant/use']
    }
  }
})
