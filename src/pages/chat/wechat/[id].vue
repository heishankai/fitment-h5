<template>
  <div class="chat-page">
    <main ref="messagesRef">
      <template v-if="messages.length">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          :isMine="msg.sender_type === 'wechat'"
          :formatTime="formatTime"
          :craftsmanUserAvatar="craftsmanUserAvatar"
          :wechatUserAvatar="wechatUserAvatar"
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
// import CustomVanNavbar from '@/components/custom-vannavbar.vue'
import { useRoute } from 'vue-router'
import { updateMiniProgramTitle } from '@/utils/index'

const route = useRoute()
const roomId = Number(route.params.id)
const craftsmanUserId = Number(route.query.craftsmanUserId)
const queryCraftsmanUserName = (route.query.craftsmanUserName as string) || ''

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
  craftsmanUserAvatar,
  wechatUserAvatar,
  craftsmanUserName
} = useChat(roomId, craftsmanUserId)

// 如果 URL 参数中有工匠名称，先更新标题
if (queryCraftsmanUserName) {
  updateMiniProgramTitle(queryCraftsmanUserName)
}

// 监听 craftsmanUserName 变化，更新标题
watch(craftsmanUserName, (newName) => {
  if (newName) {
    updateMiniProgramTitle(newName)
  }
})

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
