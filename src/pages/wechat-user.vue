<template>
  <input type="text" v-model="message.message" placeholder="请输入消息" />
  <button @click="sendMessage">发送</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const message = ref({
  message: ''
})

const sendMessage = () => {
  console.log(message.value)
}
</script>

<style lang="less" scoped></style>
