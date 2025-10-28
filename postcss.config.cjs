const autoprefixer = require('autoprefixer')
const viewport = require('postcss-mobile-forever')

const baseViewportOpts = {
  appSelector: '#app', // 根元素选择器，用于设置桌面端和横屏时的居中样式
  viewportWidth: 375, // 设计稿的视口宽度，可传递函数动态生成视图宽度
  unitPrecision: 3, // 单位转换后保留的精度（很多时候无法整除）
  propList: ['*'],
  // 下面配置表示类名中含有'keep-px'以及'.ignore'类都不会被转换为vw
  selectorBlackList: ['keep-px'],
  // 下面配置表示属性值包含 '1px solid' 的内容不会转换
  valueBlackList: ['1px solid'],
  mobileUnit: 'vw' // 指定需要转换成的视口单位，建议使用 vw
  // rootContainingBlockSelectorList: ['van-popup--bottom'] // 指定包含块是根包含块的选择器，这种选择器的定位通常是 `fixed`，但是选择器内没有 `position: fixed`
}

module.exports = {
  plugins: [
    autoprefixer(),
    viewport({
      ...baseViewportOpts,
      viewportWidth: (file) => (file.includes('node_modules/vant/') ? 375 : 750)
    })
  ]
}
