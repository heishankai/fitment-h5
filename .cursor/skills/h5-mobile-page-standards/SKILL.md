---
name: h5-mobile-page-standards
description: >-
  Applies mobile H5 page conventions for this project: flex-first layout,
  shallow SCSS nesting, semantic HTML5, safe-area and iOS scroll/font tweaks,
  and flat component DOM. Use when writing or editing Vue H5 pages, mobile
  layouts, styles for full-screen or fixed footers, or when the user asks for
  mobile frontend standards in fitment-h5.
---

# H5 移动端页面规范

在 **本仓库** 中编写或修改页面组件时，按以下规范执行；与规范冲突时以本技能为准。

## 布局与样式

- **Flex 优先**：常规排版用 Flex，不用 `float`；避免用绝对定位做主要流式布局。
- **嵌套深度**：CSS/SCSS 选择器嵌套 **最多 3 层**，控制权重、保持可读性。
- **语义化 HTML**：优先使用 `<header>`、`<main>`、`<section>`、`<footer>`、`<nav>` 等；避免整页仅用无语义 `<div>` 堆砌。

## 移动端适配与体验

- **安全区**：全屏或底部固定区域（tabBar、底部按钮条等）必须考虑 iPhone X+，使用 `env(safe-area-inset-bottom)`（及需要的 `safe-area-inset-*`）留足底部（或四边）安全区。
- **滚动**：长列表或可滚动容器建议在合适元素上使用 `-webkit-overflow-scrolling: touch`，保持 iOS 惯性滚动。
- **字体**：在页面或根容器层级可设置 `-webkit-font-smoothing: antialiased`，提升文字清晰度（与项目现有全局样式一致时不必重复）。

## 代码结构

- **DOM**：保持结构相对扁平，避免过深嵌套，减轻渲染与维护成本。
- **注释**：复杂布局、非显而易见的交互或业务分支处，用简短中文注释说明意图即可。

## 应用方式

- 新建页面：从模板起就满足上述条款。
- 修改页面：顺带将明显违反规范的局部（如无安全区的固定底栏）一并修正；不做与任务无关的大范围重构。
