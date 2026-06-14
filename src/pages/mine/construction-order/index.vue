<template>
  <div class="page-container">
    <main v-if="order" :class="{ 'has-action-bar': showActionBar }">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <!-- 订单概览（包含用户信息和订单信息） -->
        <detail-header :order="order" :contact-user="order?.wechat_user" class="fade-in-up" />

        <van-cell-group
          class="quick-entry-list fade-in-up"
          :style="{ animationDelay: '0.2s' }"
          inset
        >
          <van-cell
            v-if="showMaterialListEntry"
            title="辅材清单"
            label="查看辅材信息"
            icon="shopping-cart-o"
            is-link
            center
            @click="goToMaterialList"
          />
          <van-cell
            title="施工进度"
            label="查看施工记录"
            icon="orders-o"
            is-link
            center
            @click="goToConstructionProgressView"
          />
        </van-cell-group>

        <!-- 工价清单 -->
        <price-list
          :parent-work-price-groups="filteredParentWorkPriceGroups"
          :order-info="order"
          class="fade-in-up"
          :style="{ animationDelay: '0.3s' }"
        />
      </van-pull-refresh>
    </main>

    <van-action-bar v-if="showActionBar" class="order-action-bar" safe-area-inset-bottom>
      <van-action-bar-button
        :type="canCreatePrice ? 'default' : 'primary'"
        icon="chat-o"
        text="联系用户"
        @click="onContactUser"
      />
      <van-action-bar-button
        v-if="canCreatePrice"
        type="primary"
        icon="plus"
        text="创建工价"
        @click="handleCreateForemanPrice"
      />
    </van-action-bar>

    <!-- 修改平米数弹窗（无工价清单时显示） -->
    <AreaDialog
      v-model="showAreaDialog"
      :default-info="houseInfoDefault"
      @confirm="onAreaDialogConfirm"
      @cancel="onAreaDialogCancel"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useRequest } from 'vue-hooks-plus'
import DetailHeader from './components/detail-header.vue'
import PriceList from './components/price-list.vue'
import AreaDialog from './components/area-dialog.vue'
import { getOrderDetail, getUserInfoService, updateOrderHouseInfoService } from './service'
import { handleContactUser } from './utils'
import type { HouseInfoForm, PageData } from './type'

const route = useRoute()
const router = useRouter()

const refreshing = ref(false)
const showAreaDialog = ref(false)

const orderId = computed(() => Number(route.params.id))

// 数据请求：订单详情和当前工匠信息一起加载，刷新时只需要调用 refresh。
const getPageData = async (): Promise<PageData> => {
  const [orderRes, userRes] = await Promise.all([
    getOrderDetail(orderId.value),
    getUserInfoService()
  ])

  return {
    order: orderRes.success ? orderRes.data : null,
    user: userRes.success ? userRes.data : null
  }
}

// useRequest 接管初始请求、路由参数变化重刷和下拉刷新收尾。
const { data: pageData, refresh } = useRequest(getPageData, {
  refreshDeps: [orderId],
  onFinally() {
    refreshing.value = false
  }
})

const order = computed(() => pageData.value?.order ?? null)
const user = computed(() => pageData.value?.user ?? null)
const priceGroups = computed(() => order.value?.parent_work_price_groups ?? [])

// 页面展示状态集中放在这里，模板只负责消费结果。
const showMaterialListEntry = computed(() => user.value?.skillInfo?.work_kind_code !== 'GONGZHANG')
const canCreatePrice = computed(() => order.value?.order_status === 2 && !order.value?.is_assigned)
const showActionBar = computed(() => order.value?.order_status === 2)

// 无工价清单时创建工价前需要先补房屋信息，弹窗默认值从订单回填。
const houseInfoDefault = computed(() => ({
  housing_name: order.value?.housing_name ?? '',
  location: order.value?.location ?? '',
  roomType: order.value?.roomType ?? '',
  area: String(order.value?.area ?? ''),
  remark: order.value?.remark ?? ''
}))

// 被分配订单只展示当前工匠手机号匹配的工价，其余订单展示全部工价。
const filteredParentWorkPriceGroups = computed(() => {
  if (!order.value?.is_assigned || !user.value?.phone) return priceGroups.value

  return priceGroups.value.filter((price) => {
    return price.assigned_craftsman?.phone === user.value?.phone
  })
})

// 底部操作：联系用户进入聊天房间。
const onContactUser = async () => {
  await handleContactUser(order.value?.wechat_user, router)
}

// 快捷入口：辅材清单和施工进度都属于当前订单详情的子页面。
const goToMaterialList = () => {
  router.push({
    path: `/mine/construction-order/${order.value?.id}/material-list`
  })
}

const goToConstructionProgressView = () => {
  router.push({
    path: `/mine/construction-order/${order.value?.id}/construction-progress`
  })
}

// 创建工价：已有工价直接进入创建页；没有工价先弹出房屋信息确认。
const navigateToCreateForemanPrice = () => {
  const { area, work_kind_name } = order.value ?? {}

  router.push({
    path: `/mine/foreman-price/${order.value?.id}`,
    query: {
      area,
      craftsman_user_work_kind_name: work_kind_name
    }
  })
}

const handleCreateForemanPrice = () => {
  if (priceGroups.value.length > 0) {
    navigateToCreateForemanPrice()
    return
  }

  showAreaDialog.value = true
}

// 房屋信息确认后刷新订单详情，保证后续创建工价拿到最新数据。
const onAreaDialogConfirm = async (form: HouseInfoForm) => {
  const payload = {
    housing_name: form.housing_name,
    location: form.location,
    roomType: form.roomType,
    remark: form.remark,
    ...(form.area !== undefined && form.area !== '' ? { area: form.area } : {})
  }
  const { success } = await updateOrderHouseInfoService(Number(order.value?.id), payload)
  if (!success) return

  showToast('修改成功')
  showAreaDialog.value = false
  await refresh()
}

const onAreaDialogCancel = () => {
  showAreaDialog.value = false
  navigateToCreateForemanPrice()
}

const onRefresh = refresh
</script>

<style lang="less" scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f9ff 0%, #f5f5f5 100%);
  position: fixed;
  top: 0;
  left: 0;
  overscroll-behavior: none;
}

main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px;
  gap: 12px;

  &.has-action-bar {
    padding-bottom: calc(74px + constant(safe-area-inset-bottom));
    padding-bottom: calc(74px + env(safe-area-inset-bottom));
  }
}

.quick-entry-list {
  margin: 0 0 12px;
  overflow: hidden;
  border: 1px solid #edf2f0;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(30, 34, 34, 0.05);

  :deep(.van-cell) {
    padding: 14px 16px;
  }

  :deep(.van-cell__left-icon) {
    margin-right: 10px;
    color: var(--color-primary);
    font-size: 22px;
  }

  :deep(.van-cell__title) {
    font-weight: 600;
  }

  :deep(.van-cell__label) {
    margin-top: 4px;
  }
}

.order-action-bar {
  --van-action-bar-height: 58px;

  padding: 0 12px;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #edf2f0;
  background: #fff;
  box-shadow: 0 -4px 16px rgba(30, 34, 34, 0.06);

  :deep(.van-action-bar-button) {
    height: 42px;
    font-weight: 600;
  }

  :deep(.van-action-bar-button--default) {
    color: var(--color-primary);
    border: 1px solid #dce8e6;
  }
}
</style>
