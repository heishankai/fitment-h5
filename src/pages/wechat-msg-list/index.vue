<template>
  <div class="wechat-user-page">消息列表</div>
</template>

<script lang="ts" setup>
import { getCaseListService } from './service'
onMounted(() => {
  getCaseListService({
    pageIndex: 1,
    pageSize: 10
  }).then((res) => {
    console.log(res)
  })
})
</script>

<style lang="less" scoped></style>
