// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///Users/likai/Desktop/fitment-project/fitment-h5/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.8_less@4.2.0_terser@5.31.1/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/likai/Desktop/fitment-project/fitment-h5/node_modules/.pnpm/@vitejs+plugin-vue@5.0.5_vite@5.3.1_vue@3.4.30/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/likai/Desktop/fitment-project/fitment-h5/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.1.0_vite@5.3.1_vue@3.4.30/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import legacyPlugin from "file:///Users/likai/Desktop/fitment-project/fitment-h5/node_modules/.pnpm/@vitejs+plugin-legacy@5.4.1_terser@5.31.1_vite@5.3.1/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import AutoImport from "file:///Users/likai/Desktop/fitment-project/fitment-h5/node_modules/.pnpm/unplugin-auto-import@20.2.0/node_modules/unplugin-auto-import/dist/vite.js";
var __vite_injected_original_import_meta_url = "file:///Users/likai/Desktop/fitment-project/fitment-h5/vite.config.ts";
var getEnvProxy = (mode) => {
  let server = {};
  switch (mode) {
    case "test":
      return {
        host: "0.0.0.0",
        // 监听所有网络接口，允许 Android 模拟器通过 10.0.2.2 访问
        port: 5173,
        proxy: {
          "/api": {
            target: "http://localhost:3000",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, "")
          }
        }
      };
    case "development":
      server = {
        host: "0.0.0.0",
        // 监听所有网络接口，允许 Android 模拟器通过 10.0.2.2 访问
        port: 5173,
        proxy: {
          "/api": {
            target: "http://localhost:3000",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, "")
          }
        }
      };
      break;
    case "qa":
      server = {
        proxy: {
          "/api": {
            target: "http://xxx-dev/api",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, "")
          }
        }
      };
      break;
    default:
      server = {};
      break;
  }
  return server;
};
var vite_config_default = defineConfig(({ mode }) => {
  return {
    base: "/fitment-h5/",
    // 设置 base 路径为你想要的根目录
    plugins: [
      // 浏览器兼容插件
      legacyPlugin({
        targets: ["chrome 52"],
        // 需要兼容的目标列表，可以设置多个
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"]
        // 面向IE11时需要此插件
      }),
      // 自动导入 Vue API
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: true,
        // 生成类型声明文件
        eslintrc: {
          enabled: true
          // 生成 ESLint 配置
        }
      }),
      vue(),
      vueJsx()
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    server: mode != "production" ? getEnvProxy(mode) : {},
    build: {
      outDir: "fitment-h5",
      // 设置为false，不生成.map文件
      sourcemap: false,
      // 设置为true打包时不生成.html文件
      emptyOutDir: true,
      // 设置主入口文件
      rollupOptions: {
        input: "./index.html"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbGlrYWkvRGVza3RvcC9maXRtZW50LXByb2plY3QvZml0bWVudC1oNVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2xpa2FpL0Rlc2t0b3AvZml0bWVudC1wcm9qZWN0L2ZpdG1lbnQtaDUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2xpa2FpL0Rlc2t0b3AvZml0bWVudC1wcm9qZWN0L2ZpdG1lbnQtaDUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuLy8gaW1wb3J0IHZpdGVJbWFnZW1pbiBmcm9tICd2aXRlLXBsdWdpbi1pbWFnZW1pbidcbmltcG9ydCBsZWdhY3lQbHVnaW4gZnJvbSAnQHZpdGVqcy9wbHVnaW4tbGVnYWN5J1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcblxuY29uc3QgZ2V0RW52UHJveHkgPSAobW9kZTogc3RyaW5nKSA9PiB7XG4gIGxldCBzZXJ2ZXIgPSB7fVxuICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlICd0ZXN0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhvc3Q6ICcwLjAuMC4wJywgLy8gXHU3NkQxXHU1NDJDXHU2MjQwXHU2NzA5XHU3RjUxXHU3RURDXHU2M0E1XHU1M0UzXHVGRjBDXHU1MTQxXHU4QkI4IEFuZHJvaWQgXHU2QTIxXHU2MkRGXHU1NjY4XHU5MDFBXHU4RkM3IDEwLjAuMi4yIFx1OEJCRlx1OTVFRVxuICAgICAgICBwb3J0OiA1MTczLFxuICAgICAgICBwcm94eToge1xuICAgICAgICAgICcvYXBpJzoge1xuICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGNhc2UgJ2RldmVsb3BtZW50JzpcbiAgICAgIHNlcnZlciA9IHtcbiAgICAgICAgaG9zdDogJzAuMC4wLjAnLCAvLyBcdTc2RDFcdTU0MkNcdTYyNDBcdTY3MDlcdTdGNTFcdTdFRENcdTYzQTVcdTUzRTNcdUZGMENcdTUxNDFcdThCQjggQW5kcm9pZCBcdTZBMjFcdTYyREZcdTU2NjhcdTkwMUFcdThGQzcgMTAuMC4yLjIgXHU4QkJGXHU5NUVFXG4gICAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3FhJzpcbiAgICAgIHNlcnZlciA9IHtcbiAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly94eHgtZGV2L2FwaScsXG4gICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHNlcnZlciA9IHt9XG4gICAgICBicmVha1xuICB9XG4gIHJldHVybiBzZXJ2ZXJcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH06IHsgbW9kZTogc3RyaW5nIH0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBiYXNlOiAnL2ZpdG1lbnQtaDUvJywgLy8gXHU4QkJFXHU3RjZFIGJhc2UgXHU4REVGXHU1Rjg0XHU0RTNBXHU0RjYwXHU2MEYzXHU4OTgxXHU3Njg0XHU2ODM5XHU3NkVFXHU1RjU1XG4gICAgcGx1Z2luczogW1xuICAgICAgLy8gXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTdDXHU1QkI5XHU2M0QyXHU0RUY2XG4gICAgICBsZWdhY3lQbHVnaW4oe1xuICAgICAgICB0YXJnZXRzOiBbJ2Nocm9tZSA1MiddLCAvLyBcdTk3MDBcdTg5ODFcdTUxN0NcdTVCQjlcdTc2ODRcdTc2RUVcdTY4MDdcdTUyMTdcdTg4NjhcdUZGMENcdTUzRUZcdTRFRTVcdThCQkVcdTdGNkVcdTU5MUFcdTRFMkFcbiAgICAgICAgYWRkaXRpb25hbExlZ2FjeVBvbHlmaWxsczogWydyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnXSAvLyBcdTk3NjJcdTU0MTFJRTExXHU2NUY2XHU5NzAwXHU4OTgxXHU2QjY0XHU2M0QyXHU0RUY2XG4gICAgICB9KSxcbiAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NSBWdWUgQVBJXG4gICAgICBBdXRvSW1wb3J0KHtcbiAgICAgICAgaW1wb3J0czogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxuICAgICAgICBkdHM6IHRydWUsIC8vIFx1NzUxRlx1NjIxMFx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVx1NjU4N1x1NEVGNlxuICAgICAgICBlc2xpbnRyYzoge1xuICAgICAgICAgIGVuYWJsZWQ6IHRydWUgLy8gXHU3NTFGXHU2MjEwIEVTTGludCBcdTkxNERcdTdGNkVcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB2dWUoKSxcbiAgICAgIHZ1ZUpzeCgpXG4gICAgXSxcblxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXJ2ZXI6IG1vZGUgIT0gJ3Byb2R1Y3Rpb24nID8gZ2V0RW52UHJveHkobW9kZSkgOiB7fSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnZml0bWVudC1oNScsXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTRFM0FmYWxzZVx1RkYwQ1x1NEUwRFx1NzUxRlx1NjIxMC5tYXBcdTY1ODdcdTRFRjZcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICAvLyBcdThCQkVcdTdGNkVcdTRFM0F0cnVlXHU2MjUzXHU1MzA1XHU2NUY2XHU0RTBEXHU3NTFGXHU2MjEwLmh0bWxcdTY1ODdcdTRFRjZcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU0RTNCXHU1MTY1XHU1M0UzXHU2NTg3XHU0RUY2XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiAnLi9pbmRleC5odG1sJ1xuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1QsU0FBUyxlQUFlLFdBQVc7QUFFbFcsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUVuQixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGdCQUFnQjtBQVArSyxJQUFNLDJDQUEyQztBQVN2UCxJQUFNLGNBQWMsQ0FBQyxTQUFpQjtBQUNwQyxNQUFJLFNBQVMsQ0FBQztBQUNkLFVBQVEsTUFBTTtBQUFBLElBQ1osS0FBSztBQUNILGFBQU87QUFBQSxRQUNMLE1BQU07QUFBQTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ0wsUUFBUTtBQUFBLFlBQ04sUUFBUTtBQUFBLFlBQ1IsY0FBYztBQUFBLFlBQ2QsU0FBUyxDQUFDLFNBQWlCLEtBQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxVQUN0RDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixLQUFLO0FBQ0gsZUFBUztBQUFBLFFBQ1AsTUFBTTtBQUFBO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUEsWUFDUixjQUFjO0FBQUEsWUFDZCxTQUFTLENBQUMsU0FBaUIsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFVBQ3REO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFDQTtBQUFBLElBQ0YsS0FBSztBQUNILGVBQVM7QUFBQSxRQUNQLE9BQU87QUFBQSxVQUNMLFFBQVE7QUFBQSxZQUNOLFFBQVE7QUFBQSxZQUNSLGNBQWM7QUFBQSxZQUNkLFNBQVMsQ0FBQyxTQUFpQixLQUFLLFFBQVEsVUFBVSxFQUFFO0FBQUEsVUFDdEQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBO0FBQUEsSUFDRjtBQUNFLGVBQVMsQ0FBQztBQUNWO0FBQUEsRUFDSjtBQUNBLFNBQU87QUFDVDtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUF3QjtBQUMxRCxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUE7QUFBQSxJQUNOLFNBQVM7QUFBQTtBQUFBLE1BRVAsYUFBYTtBQUFBLFFBQ1gsU0FBUyxDQUFDLFdBQVc7QUFBQTtBQUFBLFFBQ3JCLDJCQUEyQixDQUFDLDZCQUE2QjtBQUFBO0FBQUEsTUFDM0QsQ0FBQztBQUFBO0FBQUEsTUFFRCxXQUFXO0FBQUEsUUFDVCxTQUFTLENBQUMsT0FBTyxjQUFjLE9BQU87QUFBQSxRQUN0QyxLQUFLO0FBQUE7QUFBQSxRQUNMLFVBQVU7QUFBQSxVQUNSLFNBQVM7QUFBQTtBQUFBLFFBQ1g7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFFQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUSxRQUFRLGVBQWUsWUFBWSxJQUFJLElBQUksQ0FBQztBQUFBLElBQ3BELE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQTtBQUFBLE1BRVIsV0FBVztBQUFBO0FBQUEsTUFFWCxhQUFhO0FBQUE7QUFBQSxNQUViLGVBQWU7QUFBQSxRQUNiLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
