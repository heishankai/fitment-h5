<template>
  <section class="section" v-if="user">
    <detail-section-title title="用户信息" icon="user-o" />
    <div class="user-info">
      <div class="user-avatar-wrapper">
        <van-image
          :src="user.avatar || 'https://via.placeholder.com/60'"
          round
          width="60"
          height="60"
          fit="cover"
          class="user-avatar"
          :alt="`${user.nickname || '用户'}的头像`"
        />
      </div>
      <div class="user-details">
        <h2 class="user-name">
          <van-icon name="user-circle-o" aria-hidden="true" />
          {{ user.nickname || '用户' }}
        </h2>
        <a v-if="user.phone" :href="`tel:${user.phone}`" class="user-phone">
          <van-icon name="phone-o" aria-hidden="true" />
          <span>{{ encryptPhone(user.phone) }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import DetailSectionTitle from '@/components/detail-section-title.vue'
import { encryptPhone } from '@/utils/index'

defineProps<{
  user: {
    avatar?: string
    nickname?: string
    phone?: string
  } | null
}>()
</script>

<style lang="less" scoped>
.section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;

  .user-avatar-wrapper {
    flex-shrink: 0;

    .user-avatar {
      border: 2px solid #00cec9;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .user-details {
    flex: 1;
    min-width: 0;

    .user-name {
      font-size: 16px;
      font-weight: 700;
      color: #323233;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .van-icon {
        color: #00cec9;
        font-size: 18px;
      }
    }

    .user-phone {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #646566;
      padding: 6px 12px;
      background: rgba(0, 206, 201, 0.08);
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;

      &:hover {
        background: rgba(0, 206, 201, 0.12);
      }

      &:active {
        background: rgba(0, 206, 201, 0.16);
      }

      .van-icon {
        color: #00cec9;
        font-size: 16px;
      }
    }
  }
}
</style>
