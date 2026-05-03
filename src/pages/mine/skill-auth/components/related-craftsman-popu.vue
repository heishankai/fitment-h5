<template>
  <van-popup
    v-model:show="visible"
    class="related-craftsman-popup"
    position="bottom"
    round
    teleport="body"
    destroy-on-close
    close-on-click-overlay
    :style="{ overflow: 'hidden' }"
  >
    <header class="sheet-head">
      <span class="sheet-drag-bar" aria-hidden="true" />
      <div class="sheet-head-row">
        <h2 class="sheet-title">关联工长</h2>
        <button type="button" class="sheet-close" aria-label="关闭" @click="close">
          <van-icon name="cross" size="20" />
        </button>
      </div>
      <p class="sheet-desc">请输入工长在平台登记的手机号，搜索后选择要关联的账号。</p>
    </header>

    <section class="search-wrap">
      <van-field
        v-model="phone"
        class="search-field"
        type="tel"
        maxlength="11"
        border
        clearable
        center
        label="手机号"
        placeholder="请输入工长手机号"
      >
        <template #button>
          <van-button size="small" type="primary" icon="search" @click="searchCraftsman">
            搜索
          </van-button>
        </template>
      </van-field>
    </section>

    <main class="sheet-main">
      <div v-if="craftsmanResp?.data?.length" class="result-list sheet-main-scroll">
        <van-cell
          v-for="item in craftsmanResp?.data"
          :key="item?.id"
          class="craftsman-cell"
          is-link
          :border="false"
          :title="item?.nickname"
          :label="item?.phone"
          @click="handleSelectCraftsman(item)"
        />
      </div>
      <div v-else class="sheet-main-fill sheet-main-empty-wrap">
        <van-empty
          class="sheet-empty"
          image="search"
          :description="
            craftsmanResp?.data?.length
              ? '未找到该手机号对应的工长，请核对后重试'
              : '请输入手机号后点击搜索'
          "
        />
      </div>
    </main>
  </van-popup>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { useRequest } from 'vue-hooks-plus'
import { searchForemanPageService } from '../service'

defineOptions({
  name: 'RelatedCraftsmanPopup'
})

const emit = defineEmits<{
  select: [item: { id: number; nickname?: string; phone?: string; avatar?: string }]
}>()

const visible = ref(false)
const phone = ref('')

const { data: craftsmanResp, run } = useRequest(searchForemanPageService, {
  manual: true
})

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const searchCraftsman = () => {
  const p = phone.value.trim()
  if (!/^1\d{10}$/.test(p)) {
    showToast('请输入正确的11位手机号')
    return
  }
  run({ craftsman_phone: p })
}

const handleSelectCraftsman = (item: any) => {
  emit('select', item)
  close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="less" scoped>
.related-craftsman-popup {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 72vh;
  max-height: 72vh;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  background: var(--color-bg, #f5f5f5);

  .sheet-head {
    flex-shrink: 0;
    padding: 12px 16px 8px;
    background: var(--color-bg, #f5f5f5);
  }

  .sheet-drag-bar {
    display: block;
    width: 40px;
    height: 4px;
    margin: 0 auto 10px;
    background: var(--color-border, #dcdee0);
    border-radius: 2px;
  }

  .sheet-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .sheet-title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text, #323233);
  }

  .sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-secondary, #969799);

    &:active {
      opacity: 0.7;
    }
  }

  .sheet-desc {
    margin: 10px 0 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--color-text-secondary, #969799);
  }

  .search-wrap {
    flex-shrink: 0;
    padding: 0 12px 8px;
  }

  .search-field {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .sheet-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 12px 12px;
  }

  .sheet-main-fill {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sheet-main-empty-wrap :deep(.van-empty) {
    padding: 0;
  }

  .sheet-main-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .craftsman-cell {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    align-items: center;
    padding: 12px 14px;

    &:active {
      opacity: 0.92;
    }
  }

  .sheet-empty {
    width: 100%;
  }
}
</style>
