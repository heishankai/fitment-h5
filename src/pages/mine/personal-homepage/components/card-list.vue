<template>
  <div class="card" v-for="item in production_list" :key="item.id">
    <header>
      <div class="time">{{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') }}</div>
      <div class="state-tag" :class="getStatusClass(item?.status)">
        <van-icon :name="getStatusIcon(item?.status)" />
        <span>{{ item?.status_name }}</span>
      </div>
    </header>
    <p v-show="item.publish_text">{{ item.publish_text }}</p>
    <div class="image-list" :class="{ single: item?.publish_images?.length === 1 }">
      <van-image
        v-for="(img, idx) in item?.publish_images"
        :key="idx"
        :src="img"
        fit="cover"
        class="image-item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

defineProps<{
  production_list: any[]
}>()

// status: 1 已发布 2 审核中 3 拒绝/审核失败
const getStatusIcon = (status: number) => {
  const map: Record<number, string> = {
    1: 'passed',
    2: 'clock-o',
    3: 'warning-o'
  }
  return map[status] ?? 'info-o'
}

const getStatusClass = (status: number) => {
  const map: Record<number, string> = {
    1: 'status-published',
    2: 'status-reviewing',
    3: 'status-rejected'
  }
  return map[status] ?? 'status-published'
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg);
  border-radius: 16px;
  border: 0.735px solid #e6eaea;
  background: #fff;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.1);

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .time {
      color: #6e7373;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }

    .state-tag {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;

      span {
        margin-left: 4px;
      }

      &.status-published {
        color: #4f7a67;
        background: rgba(79, 122, 103, 0.1);
      }

      &.status-reviewing {
        color: #c89a57;
        background: rgba(200, 154, 87, 0.1);
      }

      &.status-rejected {
        color: #c46b6b;
        background: rgba(196, 107, 107, 0.1);
      }
    }
  }

  p {
    margin-top: 8px;
    color: #444a4a;
    font-size: 15px;
    font-weight: 400;
    line-height: 24.375px;
    letter-spacing: -0.234px;
  }

  .image-list {
    margin-top: 8px;
    display: grid;
    gap: 8px;

    &.single {
      grid-template-columns: minmax(0, 1fr);
    }

    &:not(.single) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .image-item {
      min-width: 0;
      width: 100%;
      border-radius: 12px;
      border: 0.735px solid #e6eaea;
      overflow: hidden;

      :deep(.van-image) {
        width: 100%;
        height: 100%;
      }

      :deep(.van-image__img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &.single .image-item {
      height: 96px;
    }

    &:not(.single) .image-item {
      height: 96px;
    }
  }
}
</style>
