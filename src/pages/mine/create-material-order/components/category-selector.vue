<template>
  <div class="category-section">
    <div class="section-header">
      <div class="section-title">热门品类</div>
    </div>
    <div class="category-scroll">
      <div class="category-list">
        <!-- 全部选项 -->
        <div
          class="category-item"
          :class="{ active: selectedCategory === null }"
          @click="selectCategory(null)"
        >
          <div class="category-image all-category">
            <van-icon name="checkmark" color="#fff" size="24" />
          </div>
          <div class="category-name">全部</div>
        </div>

        <!-- 品类选项 -->
        <div
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
        >
          <img :src="category.category_image" class="category-image" />
          <div class="category-name">{{ category.category_name }}</div>
        </div>

        <!-- 占位元素，确保最后一个品类不被遮挡 -->
        <div class="spacer-item"></div>

        <!-- 加载更多指示器 -->
        <div v-if="loading" class="loading-item">
          <div class="loading-spinner">
            <van-loading size="20px" color="#00cec9" />
          </div>
          <div class="loading-text">加载中...</div>
        </div>
      </div>
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
const loading = ref(false)
const finish = ref(false)
const selectedCategory = ref<number | null>(null)
const pageParams = ref({
  pageIndex: 1,
  pageSize: 10
})

// 加载品类数据
const loadCategories = async (): Promise<void> => {
  if (loading.value || finish.value) return

  loading.value = true

  const { success, data } = await getCategoryListService({
    pageIndex: pageParams.value.pageIndex,
    pageSize: pageParams.value.pageSize
  })

  if (success) {
    const newData = data || []

    if (newData.length === 0) {
      finish.value = true
    } else {
      categories.value.push(...newData)
      pageParams.value.pageIndex++
    }
  } else {
    finish.value = true
  }

  loading.value = false
}

// 选择品类
const selectCategory = (categoryId: number | null): void => {
  if (selectedCategory.value === categoryId) return

  selectedCategory.value = categoryId
  emit('categoryChange', categoryId)
}

// 暴露方法
defineExpose({
  loadCategories,
  resetSelection: () => {
    selectedCategory.value = null
  }
})

onMounted(() => {
  loadCategories()
})
</script>

<style lang="less" scoped>
.category-section {
  background: #fff;
  margin-bottom: 8px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 16px;

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
    }
  }

  .category-scroll {
    overflow-x: auto;
    padding: 0 10px;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    .category-list {
      display: flex;
      gap: 16px;
      min-width: max-content;

      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 70px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-sizing: border-box;
        padding: 3px;

        .category-image {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          margin-bottom: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          box-sizing: border-box;
          border: 3px solid transparent;
          object-fit: cover;

          &.all-category {
            background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 206, 201, 0.3);
          }
        }

        .category-name {
          font-size: 13px;
          color: #666;
          text-align: center;
          transition: all 0.3s ease;
          font-weight: 500;
          min-height: 18px;
          line-height: 18px;
        }

        &.active {
          .category-image {
            border-color: #00cec9;
            box-shadow: 0 6px 20px rgba(0, 206, 201, 0.4);

            &.all-category {
              background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
              box-shadow: 0 8px 25px rgba(0, 206, 201, 0.5);
            }
          }

          .category-name {
            color: #00cec9;
            font-weight: 700;
          }
        }
      }

      .loading-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 70px;
        padding: 16px 8px;

        .loading-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0, 206, 201, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .loading-text {
          font-size: 12px;
          color: #999;
          text-align: center;
        }
      }

      .spacer-item {
        width: 40px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
