<template>
  <div class="chat-page">
    <custom-van-navbar />
    <main ref="messagesRef">
      <template v-if="messages.length">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          :isMine="msg.sender_type === 'craftsman'"
          :formatTime="formatTime"
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
import ChatMessage from './components/chat-message.vue'
import CustomVanNavbar from '@/components/custom-vannavbar.vue'
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
  craftsmanUserAvatar
} = useChat()

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
    min-height: 0; // 允许 flex 子元素收缩
  }

  footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 16px;
    background: #fff;
    flex-shrink: 0; // 防止 footer 被压缩

    .upload-icon {
      font-size: 30px;
      color: #666;
      cursor: pointer;
      flex-shrink: 0;
    }

    .van-field {
      flex: 1;
      background: #f7f7f7;
      border-radius: 40px;
      padding: 8px;
      min-width: 0; // 允许字段收缩
    }

    .van-button {
      flex-shrink: 0;
      border-radius: 40px;
      padding: 14px;
    }
  }
}
</style>
