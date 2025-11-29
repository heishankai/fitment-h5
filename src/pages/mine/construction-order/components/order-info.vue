<template>
  <section class="section">
    <detail-section-title title="订单信息" icon="orders-o" />
    <dl class="info-grid">
      <div class="info-item">
        <dt class="item-icon" aria-label="位置">
          <van-icon name="location-o" />
        </dt>
        <dd class="item-content">
          <span class="label">位置</span>
          <address class="value">
            {{
              order.location ||
              `${order.province || ''} ${order.city || ''} ${order.district || ''}`
            }}
          </address>
        </dd>
      </div>
      <div class="info-item">
        <dt class="item-icon" aria-label="房屋类型">
          <van-icon name="home-o" />
        </dt>
        <dd class="item-content">
          <span class="label">房屋类型</span>
          <span class="value">{{ order.houseType === 'new' ? '新房' : '老房' }}</span>
        </dd>
      </div>
      <div class="info-item">
        <dt class="item-icon" aria-label="户型">
          <van-icon name="shop-o" />
        </dt>
        <dd class="item-content">
          <span class="label">户型</span>
          <span class="value">{{ order.roomType }}</span>
        </dd>
      </div>
      <div class="info-item">
        <dt class="item-icon" aria-label="面积">
          <van-icon name="expand-o" />
        </dt>
        <dd class="item-content">
          <span class="label">面积</span>
          <span class="value">{{ order.area }}m²</span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import DetailSectionTitle from '@/components/detail-section-title.vue'

defineProps<{
  order: {
    location?: string
    province?: string
    city?: string
    district?: string
    houseType?: string
    roomType?: string
    area?: number | string
  }
}>()
</script>

<style lang="less" scoped>
.section {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0;
  padding: 0;

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 0;

    .item-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin: 0;

      .van-icon {
        color: #00cec9;
        font-size: 16px;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0;

      .label {
        font-size: 11px;
        color: #969799;
        font-weight: 500;
      }

      .value {
        font-size: 13px;
        color: #323233;
        font-weight: 600;
        line-height: 1.4;
        word-break: break-all;
        font-style: normal; // 重置 address 标签的斜体样式
      }
    }
  }
}
</style>
