<template>
  <div class="category-sidebar">
    <div
      class="category-item"
      :class="{ active: selectedCategoryId === null }"
      @click="selectCategory(null)"
    >
      <div class="category-name">全部</div>
    </div>
    <div
      class="category-item"
      :class="{ active: selectedCategoryId === category.id }"
      v-for="category in categories"
      :key="category.id"
      @click="selectCategory(category.id)"
    >
      <div class="category-name">{{ category.category_name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategoryListService } from '../service'

// 类型定义
interface Category {
  id: number
  category_name: string
  category_image: string
}

// 定义事件
const emit = defineEmits<{
  categoryChange: [categoryId: number | null]
}>()

// 响应式数据
const categories = ref<Category[]>([])
const selectedCategoryId = ref<number | null>(null)
const loading = ref(false)

// 加载品类数据
const loadCategories = async (): Promise<void> => {
  loading.value = true

  try {
    const { success, data } = await getCategoryListService({
      pageIndex: 1,
      pageSize: 100 // 加载所有品类
    })

    if (success) {
      categories.value = data || []
    }
  } catch (error) {
    console.error('加载品类失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择品类
const selectCategory = (categoryId: number | null): void => {
  if (selectedCategoryId.value === categoryId) return

  selectedCategoryId.value = categoryId
  emit('categoryChange', categoryId)
}

onMounted(() => {
  loadCategories()
  // 默认选择"全部"
  selectCategory(null)
})
</script>

<style lang="less" scoped>
.category-sidebar {
  width: 100px;
  background: #fff;
  border-right: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;
  -webkit-overflow-scrolling: touch;

  .category-item {
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;

    .category-name {
      font-size: 14px;
      color: #666;
      transition: all 0.3s ease;
    }

    &.active {
      background: #f0f9ff;
      border-left-color: #00cec9;

      .category-name {
        color: #00cec9;
        font-weight: 600;
      }
    }

    &:active {
      background: #e8f4f8;
    }
  }
}
</style>
