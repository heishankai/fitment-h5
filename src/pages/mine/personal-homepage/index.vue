<template>
  <div class="page">
    <header>
      <div class="user-info">
        <van-image round class="avatar" :src="userInfo.avatar" fit="cover" />
        <div>
          <div class="nickname">{{ userInfo.nickname }}</div>
          <div class="work-kind-name">
            工种：{{ userInfo?.skillInfo?.work_kind_name || '暂无' }}
          </div>
        </div>
      </div>
    </header>

    <section>我的作品</section>

    <main>
      <van-list
        :key="listRenderKey"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <cardlist :production_list="production_list" />
      </van-list>
    </main>
    <van-floating-bubble icon="plus" @click="showProductionPopup = true" />
    <ProductionPopup v-model:show="showProductionPopup" @publish="handlePublish" />
  </div>
</template>

<script setup lang="ts">
import { getUserInfoService } from './service'
import cardlist from './components/card-list.vue'
import ProductionPopup from './components/production-popup.vue'
import { showToast } from 'vant'

// service
import { homePageAuditService, getHomePageAuditService } from './service'

const showProductionPopup = ref(false)

/** 变更后强制重置 van-list，避免分页状态错乱 */
const listRenderKey = ref(0)

const userInfo = ref<any>({})
const loading = ref(false)
const finished = ref(false)

const production_list = ref<any[]>([])

const pageIndex = ref(1)

const onLoad = async () => {
  const { success, data, total }: any = await getHomePageAuditService({
    pageIndex: pageIndex.value,
    pageSize: 10
  })

  if (!success) {
    loading.value = false
    return
  }
  pageIndex.value += 1

  production_list.value = [...data, ...production_list.value]

  loading.value = false

  if (production_list.value.length >= total) {
    finished.value = true
  }
}

/** 发布后（或其它需要同步最新列表时）清空分页并重新拉第一页 */
const refreshProductionList = () => {
  production_list.value = []
  pageIndex.value = 1
  finished.value = false
  listRenderKey.value += 1
}
// 获取用户信息
const getUserInfo = async () => {
  const { success, data } = await getUserInfoService()
  if (!success) return
  userInfo.value = data
  console.log(data, 'userInfo')
}

const handlePublish = async ({
  publish_text,
  publish_images
}: {
  publish_text: string
  publish_images: string[]
}) => {
  console.log(publish_text, publish_images, 'imagesimagesimages')
  const { success } = await homePageAuditService({ publish_text, publish_images })
  if (success) {
    showToast('提交成功，审核中...')
    refreshProductionList()
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style lang="less" scoped>
/* 整页滚动，header + 列表一起随页面滚动 */
.page {
  min-height: 100vh;
  padding-bottom: 80px;
}

header {
  background: var(--color-bg);
  padding: 16px 20px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    .nickname {
      color: #1e2222;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      letter-spacing: -0.3px;
    }

    .work-kind-name {
      color: #6e7373;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: -0.05px;
    }
  }
}

main {
  padding: 0 12px 12px 12px;
}

section {
  padding: 12px;
  color: #1e2222;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.312px;
}
</style>
