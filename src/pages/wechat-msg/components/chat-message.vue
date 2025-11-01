<template>
  <div :class="['chat-message', isMine ? 'chat-message--mine' : 'chat-message--other']">
    <div class="chat-message__avatar">
      <img v-if="avatarUrl" :src="avatarUrl" alt="头像" class="chat-message__avatar-img" />
      <div v-else class="chat-message__avatar-placeholder">
        {{ avatarText }}
      </div>
    </div>
    <div class="chat-message__content">
      <div v-if="msgType === 'image'" class="chat-message__image">
        <img :src="msg.content" alt="图片" @click="previewImage(msg.content)" />
      </div>
      <div v-else class="chat-message__text">{{ msg.content }}</div>
      <div class="chat-message__time">{{ formatTime(msg.createdAt) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { showImagePreview } from 'vant'

interface Props {
  msg: any
  isMine: boolean
  // eslint-disable-next-line no-unused-vars
  formatTime: (time: string) => string
  wechatUserAvatar?: string
}
const props = defineProps<Props>()

const msgType = computed(() => {
  return props.msg.message_type || props.msg.messageType || 'text'
})

const avatarUrl = computed(() => {
  if (props.isMine) {
    // 微信用户使用传入的头像
    return props.wechatUserAvatar || ''
  } else {
    // 客服消息，可以从 msg 中获取头像，或使用默认头像
    return props.msg.serviceAvatar || props.msg.avatar || ''
  }
})

const avatarText = computed(() => {
  if (props.isMine) {
    return '我'
  }
  return '客'
})

const previewImage = (url: string) => {
  showImagePreview([url])
}
</script>

<style lang="less" scoped>
.chat-message {
  display: flex;
  flex-direction: row;
  margin-bottom: 32px;
  word-wrap: break-word;
  align-items: flex-start;
  gap: 16px;

  &--mine {
    flex-direction: row-reverse;

    .chat-message__avatar {
      flex-shrink: 0;
    }

    .chat-message__content {
      align-items: flex-end;
      max-width: 75%;
    }

    .chat-message__text {
      background: linear-gradient(135deg, #00cec9 0%, #00b4d8 100%);
      color: #fff;
      border-radius: 36px 36px 8px 36px;
      padding: 20px 32px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .chat-message__image {
      border-radius: 36px 36px 8px 36px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);

      img {
        max-width: 400px;
        max-height: 600px;
        display: block;
        cursor: pointer;
      }
    }

    .chat-message__time {
      color: #999;
      margin-top: 8px;
      text-align: right;
    }
  }

  &--other {
    .chat-message__avatar {
      flex-shrink: 0;

      &-placeholder {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      }
    }

    .chat-message__content {
      align-items: flex-start;
      max-width: 75%;
    }

    .chat-message__text {
      background: #fff;
      color: #333;
      border-radius: 36px 36px 36px 8px;
      padding: 20px 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .chat-message__image {
      border-radius: 36px 36px 36px 8px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      img {
        max-width: 400px;
        max-height: 600px;
        display: block;
        cursor: pointer;
      }
    }

    .chat-message__time {
      color: #999;
      margin-top: 8px;
      text-align: left;
    }
  }

  .chat-message__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 32px;
      font-weight: 500;
    }
  }

  .chat-message__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0; // 允许内容收缩
  }

  .chat-message__text {
    font-size: 30px;
    line-height: 1.5;
  }

  .chat-message__time {
    font-size: 22px;
  }
}
</style>
