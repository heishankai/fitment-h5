<template>
  <div class="search-header">
    <div class="search-bar" @click="handleClick">
      <van-icon name="search" color="#2d635e" size="18" />
      <div class="search-placeholder">{{ placeholder }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  orderId?: string | number
  searchPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索您想要的商品...',
  searchPath: '/mine/create-material-order/search'
})

const route = useRoute()
const router = useRouter()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')

  // 获取 orderId，优先使用 props，其次从路由中获取
  const orderId = props.orderId || route.params.id || route.query.orderId

  if (orderId) {
    router.push({
      path: `${props.searchPath}/${orderId}`
    })
  } else {
    // 如果没有 orderId，跳转到搜索页面（不带参数）
    router.push({
      path: props.searchPath
    })
  }
}
</script>

<style lang="less" scoped>
.search-header {
  padding: 12px 16px;
  background: #fff;
  flex-shrink: 0;

  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 25px;
    padding: 12px 16px;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);

    .search-placeholder {
      color: var(--color-text-placeholder);
      font-size: 15px;
      font-weight: 400;
    }
  }
}
</style>
