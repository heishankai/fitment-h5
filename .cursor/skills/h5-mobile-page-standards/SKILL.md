---
name: vue3-h5-development-standards
description: >-
  Applies Vue3 mobile H5 development standards for this project. Enforce
  TypeScript, Composition API, Vant-first UI strategy, vue-hooks-plus-first
  request management, lodash-es utilities, dayjs date handling, maintainable
  architecture, mobile optimization, code reuse, and incremental modification
  principles.
---

# Vue3 H5 项目开发规范

适用于本项目所有：

- Pages
- Components
- Hooks / Composables
- Services
- Stores
- Types
- Utils
- Styles

---

# 技术栈

当前项目技术栈：

- Vue 3
- TypeScript
- Vant
- vue-hooks-plus
- lodash-es
- dayjs
- Pinia
- SCSS

生成代码必须优先基于上述技术栈。

---

# 核心原则

遵循以下优先级：

框架能力
→ Vant
→ vue-hooks-plus
→ lodash-es
→ dayjs
→ 项目已有实现
→ 自定义实现

禁止重复造轮子。

存在成熟方案时必须优先复用。

---

# 项目分析规范

## 编码前必须分析项目

生成代码前必须先分析项目已有实现：

- Pages
- Components
- Hooks
- Services
- Stores
- Types
- Constants
- Enums
- Utils
- 样式规范

优先遵循项目已有结构和编码风格。

禁止擅自创建新的架构体系。

---

## 优先复用

发现已有实现时必须优先复用：

- 组件
- Hooks
- Services
- Stores
- Types
- Utils

禁止创建功能重复代码。

例如：

已有：

ts useUserInfo() 

禁止生成：

ts useCurrentUser() 

如果功能一致应直接复用。

---

## 修改优于新增

对于已有功能：

优先修改现有文件。

禁止因为小需求：

- 新建页面
- 新建组件
- 新建 Hook
- 新建 Service

除非明确必要。

---

## 文件创建规范

创建新文件前必须确认：

- 现有文件无法扩展
- 现有组件无法复用
- 现有 Hook 无法复用
- 现有 Service 无法复用

满足条件后才允许创建。

---

# 输出策略

## 修改已有功能

优先返回：

- 修改文件
- 修改位置
- 修改内容
- 修改原因

优先增量修改。

禁止无必要整文件重写。

---

## 返回代码规范

优先返回：

txt 需要修改的代码片段 

不要返回：

txt 整个页面文件 整个组件文件 

除非用户明确要求。

---

# Vue 规范

## 必须使用 Script Setup

统一：

vue <script setup lang="ts"> </script> 

禁止：

ts export default defineComponent() 

---

## Composition API

使用：

ts ref reactive computed watch watchEffect 

禁止：

ts Options API 

---

## 类型规范

必须：

- 参数定义类型
- 返回值定义类型
- Props 定义类型
- Emits 定义类型

优先：

ts interface type enum 

禁止：

ts any 

除非无法避免。

---

## Props

ts const props = defineProps<Props>() 

---

## Emits

ts const emit = defineEmits<{   submit: [FormData]   cancel: [] }>() 

---

# 请求规范

## 强制使用 vue-hooks-plus

统一使用：

ts useRequest 

分页：

ts usePagination 

加载更多：

ts useLoadMore 

无限滚动：

ts useInfiniteScroll 

---

禁止：

ts onMounted(async () => {}) 

ts loading.value = true await api() loading.value = false 

ts watch(() => {   api() }) 

优先：

ts const {   data,   loading,   error,   run,   refresh, } = useRequest(...) 

---

# Service 规范

## 接口统一管理

目录：

txt src/services 

示例：

txt services/ ├── user.ts ├── order.ts ├── home.ts └── activity.ts 

---

页面禁止：

ts fetch(...) axios(...) request(...) 

直接调用接口。

必须通过 Service。

---

## Service 职责

只负责：

- 接口请求
- 数据转换

禁止：

- DOM 操作
- Toast
- Notify
- Dialog
- 路由跳转
- 状态管理

---

# 日期处理规范

统一使用：

ts import dayjs from 'dayjs' 

例如：

ts dayjs().format('YYYY-MM-DD') 

禁止：

ts new Date() 

以及手写格式化函数。

---

# 工具函数规范

统一使用：

ts import {   debounce,   throttle,   cloneDeep,   uniqBy,   groupBy,   orderBy,   pick,   omit, } from 'lodash-es' 

禁止：

- 手写 debounce
- 手写 throttle
- 手写深拷贝
- 手写数组去重
- 手写排序工具

---

# UI 规范

## Vant First

存在对应组件时必须优先使用 Vant。

---

### 按钮

使用：

vue <van-button /> 

禁止：

html <button /> 

---

### 表单

使用：

vue <van-form /> <van-field /> 

优先使用 rules 校验。

禁止复杂手写校验状态。

---

### 图片

使用：

vue <van-image /> 

优先：

vue <van-image lazy-load /> 

---

### 列表

使用：

vue <van-list /> 

---

### 空状态

使用：

vue <van-empty /> 

---

### Loading

使用：

vue <van-loading /> 

---

### Popup

使用：

vue <van-popup /> 

---

### Dialog

使用：

ts showDialog() showConfirmDialog() 

禁止自定义 Modal。

---

### Toast

使用：

ts showToast() showFailToast() showSuccessToast() showNotify() 

禁止自定义 Toast。

---

### Picker

使用：

vue <van-picker /> 

vue <van-action-sheet /> 

---

# 页面结构规范

推荐：

html <header /> <main /> <section /> <footer /> 

避免整页 div。

---

DOM 层级保持扁平。

推荐：

txt page ├─ header ├─ content └─ footer 

嵌套层级不超过 5 层。

---

# 布局规范

Flex 优先。

统一：

css display: flex; 

禁止：

css float table 

布局。

---

# H5 移动端规范

## 安全区

固定底部区域必须处理：

css padding-bottom: env(safe-area-inset-bottom); 

必要时：

css padding-top: env(safe-area-inset-top); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); 

---

## 滚动

滚动区域：

css -webkit-overflow-scrolling: touch; 

---

## 点击区域

所有点击元素：

css min-height: 44px; 

---

## 字体优化

推荐：

css -webkit-font-smoothing: antialiased; 

---

# 样式规范

统一：

vue <style scoped lang="scss"> </style> 

---

## SCSS 嵌套

最大允许：

3层

推荐：

scss .page {   .content {     .card {}   } } 

禁止超过 3 层。

---

## 类名规范

推荐：

scss .page .page-header .page-content .page-footer .card .card-title .card-content 

避免：

scss .a .b .c 

---

## 单位规范

优先：

css vw vh % rem 

避免大量固定：

css px 

---

# 状态管理规范

局部状态：

ts ref reactive 

全局状态：

ts Pinia 

禁止：

ts window.xxx eventBus 

---

# 性能规范

## 列表

超过 20 条数据：

使用：

ts usePagination 

或：

ts useLoadMore 

禁止一次加载全部。

---

## 模板

模板中禁止复杂计算。

使用：

ts computed 

处理派生数据。

---

## 图片

优先：

vue <van-image lazy-load /> 

---

# 错误处理规范

统一：

ts showToast() showNotify() 

展示异常。

禁止：

ts console.log(error) 

后不处理。

---

# 页面默认要求

生成页面时默认包含：

- TypeScript 类型定义
- Vant 组件
- vue-hooks-plus 请求逻辑
- Loading 状态
- Empty 状态
- Error 状态
- 安全区处理
- 响应式布局
- SCSS 样式

除非用户明确要求省略。

---

# 代码质量要求

生成代码必须满足：

- 无 any
- 无死代码
- 无未使用变量
- 无重复逻辑
- 单个函数职责清晰
- 命名语义化
- 类型完整
- 可维护
- 可扩展

优先保证代码质量，其次保证代码简洁。

---

# AI 行为约束

生成代码前必须先判断：

1. 是否已有相同功能
2. 是否已有可复用组件
3. 是否已有可复用 Hook
4. 是否已有可复用 Service
5. 是否已有可复用 Type
6. 是否已有可复用工具函数

如果存在：

直接复用。

不要重新实现。

禁止无意义创建：

- utils.ts
- request.ts
- http.ts
- useFetch.ts
- useApi.ts
- common.ts
- helper.ts

除非项目中不存在对应能力且确有必要。