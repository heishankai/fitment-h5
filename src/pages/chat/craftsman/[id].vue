<template>
  <div class="chat-page">
    <custom-van-navbar :title="wechatUserName || '微信用户'" />
    <main ref="messagesRef">
      <template v-if="messages.length">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          :isMine="msg.sender_type === 'craftsman'"
          :formatTime="formatTime"
          :wechatUserAvatar="wechatUserAvatar"
          :craftsmanUserAvatar="craftsmanUserAvatar"
        />
      </template>

      <van-empty v-else-if="!loading" description="暂无消息，开始聊天吧" />
      <van-loading v-else vertical>加载中...</van-loading>
    </main>

    <footer>
      <van-uploader
        :after-read="handleImageSelect"
        accept="image/*"
        :max-count="1"
        :show-upload="false"
      >
        <van-icon name="photo-o" class="upload-icon" />
      </van-uploader>
      <van-field
        v-model="inputText"
        placeholder="输入消息..."
        rows="1"
        autosize
        @keyup.enter="handleSend"
      />
      <van-button
        type="primary"
        size="small"
        :disabled="!inputText.trim() || sending"
        @click="handleSend"
      >
        发送
      </van-button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useChat } from './useChat'
import ChatMessage from '../../admin-service/craftsman-msg/components/chat-message.vue'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomId = Number(route.params.id)
const wechatUserId = Number(route.query.wechatUserId)
const wechatUserName = (route.query.wechatUserName as string) || '微信用户'

const {
  messages,
  inputText,
  loading,
  sending,
  messagesRef,
  formatTime,
  handleSend,
  handleSendImage,
  init,
  disconnect,
  wechatUserAvatar,
  craftsmanUserAvatar
} = useChat(roomId, wechatUserId)

const handleImageSelect = (file: any) => {
  if (file.file) {
    handleSendImage(file.file)
  }
}

onMounted(init)
onUnmounted(disconnect)
</script>

<style lang="less" scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;

  main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 6px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
    background: #fff;

    .upload-icon {
      font-size: 24px;
      color: #666;
      cursor: pointer;
    }

    .van-field {
      flex: 1;
    }
  }
}
</style>
