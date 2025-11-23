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
  craftsmanUserAvatar?: string
  wechatUserAvatar?: string
}
const props = defineProps<Props>()

const msgType = computed(() => {
  return props.msg.message_type || props.msg.messageType || 'text'
})

const avatarUrl = computed(() => {
  // 根据消息的 sender_type 来确定使用哪个头像
  const senderType = props.msg.sender_type || props.msg.senderType || ''

  if (senderType === 'craftsman') {
    // 工匠用户发送的消息，使用工匠头像
    return props.craftsmanUserAvatar || ''
  } else if (senderType === 'wechat') {
    // 微信用户发送的消息，使用微信用户头像
    return props.wechatUserAvatar || ''
  }

  // 兼容其他类型（如 admin、service）或默认情况
  // 如果是自己的消息，优先使用对应的头像
  if (props.isMine) {
    return props.craftsmanUserAvatar || props.wechatUserAvatar || ''
  } else {
    return (
      props.wechatUserAvatar ||
      props.craftsmanUserAvatar ||
      props.msg.wechatUserAvatar ||
      props.msg.adminAvatar ||
      props.msg.avatar ||
      ''
    )
  }
})

const avatarText = computed(() => {
  if (props.isMine) {
    return '我'
  }
  // 根据消息类型判断是客服还是微信用户
  return props.msg.sender_type === 'wechat' ? '微' : '客服'
})

const previewImage = (url: string) => {
  showImagePreview([url])
}
</script>

<style lang="less" scoped>
.chat-message {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  word-wrap: break-word;
  align-items: flex-start;
  gap: 8px;

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
      border-radius: 16px 16px 4px 16px;
      padding: 10px 16px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .chat-message__image {
      border-radius: 16px 16px 4px 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

      img {
        max-width: 200px;
        max-height: 300px;
        display: block;
        cursor: pointer;
      }
    }

    .chat-message__time {
      color: #999;
      margin-top: 4px;
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
      border-radius: 16px 16px 16px 4px;
      padding: 10px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .chat-message__image {
      border-radius: 16px 16px 16px 4px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);

      img {
        max-width: 200px;
        max-height: 300px;
        display: block;
        cursor: pointer;
      }
    }

    .chat-message__time {
      color: #999;
      margin-top: 4px;
      text-align: left;
    }
  }

  .chat-message__avatar {
    width: 40px;
    height: 40px;
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
      font-size: 16px;
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
    font-size: 16px;
    line-height: 1.5;
  }

  .chat-message__time {
    font-size: 14px;
  }
}
</style>
