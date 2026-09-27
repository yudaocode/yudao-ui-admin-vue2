// 客服消息类型枚举类
export const KeFuMessageContentTypeEnum = {
  TEXT: 1,
  IMAGE: 2,
  VOICE: 3,
  VIDEO: 4,
  SYSTEM: 5,
  PRODUCT: 10,
  ORDER: 11
}

// Promotion 的 WebSocket 消息类型枚举类
export const WebSocketMessageTypeConstants = {
  KEFU_MESSAGE_TYPE: 'kefu_message_type',
  KEFU_MESSAGE_ADMIN_READ: 'kefu_message_read_status_change'
}
