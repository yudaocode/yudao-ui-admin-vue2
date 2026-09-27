import { defineStore } from './storeFactory'
import { debounce } from '../../utils/collection'
import store from '@/store'
import { CONVERSATION_RECENT_FORWARD_MAX } from '../../utils/config'
import { IM_AT_ALL_USER_ID, ImConversationType, ImMessageReceiptStatus, ImMessageStatus, isNormalMessage } from '../../utils/constants'
import { getClientConversationId, getDb, initDb, StorageKeys } from '../../utils/db'
import { runIncrementalPull } from '../../utils/pull'
import { enqueueConversationWrite, enqueueConversationWrites, enqueueConversationBarrier, isRelationTerminated } from '../../utils/messageSync'
import { useMessageStore } from './messageStore'
import { pullMyConversationReadList as apiPullMyConversationReadList } from '@/api/im/conversation/read'
const PERSIST_DRAFT_DEBOUNCE_MS = 500
const pendingDraftConversations = new Map()
const conversationProjectionBases = new WeakMap() // 记录投影构建基线，仅保留构建后发生的并发字段变更

/** 创建会话读位置记录 */
function createConversationRead(type, targetId, messageId) {
  return {
    conversationType: type,
    targetId,
    messageId,
    updateTime: Date.now()
  }
}

/** 会话转 IndexedDB 记录 */
function toConversationDO(conversation) {
  const draft = conversation.draft
  return {
    targetId: conversation.targetId,
    type: conversation.type,
    name: conversation.name,
    avatar: conversation.avatar,
    unreadCount: conversation.unreadCount,
    lastContent: conversation.lastContent,
    lastSendTime: conversation.lastSendTime,
    lastSenderId: conversation.lastSenderId,
    lastMessageType: conversation.lastMessageType,
    lastMessageId: conversation.lastMessageId,
    lastClientMessageId: conversation.lastClientMessageId,
    lastMessageStatus: conversation.lastMessageStatus,
    lastReceiptStatus: conversation.lastReceiptStatus,
    lastSelfSend: conversation.lastSelfSend,
    lastSenderDisplayName: conversation.lastSenderDisplayName,
    reportedReadMessageId: conversation.reportedReadMessageId,
    deleted: conversation.deleted,
    top: conversation.top,
    silent: conversation.silent,
    atMe: conversation.atMe,
    atAll: conversation.atAll,
    atMessageId: conversation.atMessageId,
    atAllMessageId: conversation.atAllMessageId,
    draft: draft ? {
      ...draft,
      reply: draft.reply ? {
        ...draft.reply
      } : undefined
    } : undefined,
    clientConversationId: getClientConversationId(conversation.type, conversation.targetId)
  }
}

/** IndexedDB 记录转会话 */
function fromConversationDO(conversation) {
  const rest = { ...conversation }
  delete rest.clientConversationId
  return rest
}

/** 会话读位置转 IndexedDB 记录 */
function toConversationReadDO(record) {
  return {
    conversationType: record.conversationType,
    targetId: record.targetId,
    messageId: record.messageId,
    updateTime: record.updateTime,
    clientConversationId: getClientConversationId(record.conversationType, record.targetId)
  }
}

/** IndexedDB 记录转会话读位置 */
function fromConversationReadDO(record) {
  const rest = { ...record }
  delete rest.clientConversationId
  return rest
}

/** 是否为有效会话读位置 */
function isValidConversationReadRecord(record) {
  return !!record.conversationType && !!record.targetId && !!record.messageId
}

/** 按读位置重算会话未读与 @ 状态 */
function applyConversationUnreadState(conversation, messages, readMessageId, userId) {
  let unreadCount = 0
  let atMessageId
  let atAllMessageId
  for (const message of messages) {
    if (!message.id || message.id <= readMessageId || message.selfSend || !isNormalMessage(message.type) || message.status === ImMessageStatus.RECALL) {
      continue
    }
    unreadCount++
    if (message.atUserIds?.includes(userId) && message.id > (atMessageId || 0)) {
      atMessageId = message.id
    }
    if (message.atUserIds?.includes(IM_AT_ALL_USER_ID) && message.id > (atAllMessageId || 0)) {
      atAllMessageId = message.id
    }
  }
  const changed = conversation.unreadCount !== unreadCount || conversation.atMe !== !!atMessageId || conversation.atAll !== !!atAllMessageId || conversation.atMessageId !== atMessageId || conversation.atAllMessageId !== atAllMessageId
  conversation.unreadCount = unreadCount
  conversation.atMe = !!atMessageId
  conversation.atAll = !!atAllMessageId
  conversation.atMessageId = atMessageId
  conversation.atAllMessageId = atAllMessageId
  return changed
}

/** 无读位置时按原未读窗口应用撤回状态 */
function applyConversationRecallStateWithoutRead(conversation, messages, originalMessage, userId) {
  const previousUnreadCount = conversation.unreadCount
  const originalWasIncomingNormal = !!originalMessage.id && !originalMessage.selfSend && isNormalMessage(originalMessage.type) && originalMessage.status !== ImMessageStatus.RECALL
  const incomingNormalMessages = messages.filter(message => !!message.id && !message.selfSend && isNormalMessage(message.type) && message.status !== ImMessageStatus.RECALL).sort((left, right) => (right.id || 0) - (left.id || 0))
  const previousUnreadMessages = [...incomingNormalMessages.filter(message => message.id !== originalMessage.id), ...(originalWasIncomingNormal ? [originalMessage] : [])].sort((left, right) => (right.id || 0) - (left.id || 0)).slice(0, previousUnreadCount)
  const recalledUnread = previousUnreadMessages.some(message => message.id === originalMessage.id)
  const unreadCount = Math.max(0, previousUnreadCount - (recalledUnread ? 1 : 0))
  const unreadMessages = incomingNormalMessages.slice(0, unreadCount)
  let atMessageId = conversation.atMessageId
  let atAllMessageId = conversation.atAllMessageId
  if (conversation.atMessageId === originalMessage.id || !conversation.atMessageId && conversation.atMe && originalMessage.atUserIds?.includes(userId)) {
    atMessageId = unreadMessages.find(message => message.atUserIds?.includes(userId))?.id
  }
  if (conversation.atAllMessageId === originalMessage.id || !conversation.atAllMessageId && conversation.atAll && originalMessage.atUserIds?.includes(IM_AT_ALL_USER_ID)) {
    atAllMessageId = unreadMessages.find(message => message.atUserIds?.includes(IM_AT_ALL_USER_ID))?.id
  }
  const changed = conversation.unreadCount !== unreadCount || conversation.atMe !== !!atMessageId || conversation.atAll !== !!atAllMessageId || conversation.atMessageId !== atMessageId || conversation.atAllMessageId !== atAllMessageId
  conversation.unreadCount = unreadCount
  conversation.atMe = !!atMessageId
  conversation.atAll = !!atAllMessageId
  conversation.atMessageId = atMessageId
  conversation.atAllMessageId = atAllMessageId
  return changed
}

/** 为旧会话回填未读 @ 消息编号 */
function backfillConversationMentionIds(conversation, messages, userId) {
  const unreadMessages = messages.filter(message => !!message.id && !message.selfSend && isNormalMessage(message.type) && message.status !== ImMessageStatus.RECALL).sort((left, right) => (right.id || 0) - (left.id || 0)).slice(0, conversation.unreadCount)
  const atMessageId = conversation.atMessageId || (conversation.atMe ? unreadMessages.find(message => message.atUserIds?.includes(userId))?.id : undefined)
  const atAllMessageId = conversation.atAllMessageId || (conversation.atAll ? unreadMessages.find(message => message.atUserIds?.includes(IM_AT_ALL_USER_ID))?.id : undefined)
  const changed = conversation.atMessageId !== atMessageId || conversation.atAllMessageId !== atAllMessageId
  conversation.atMessageId = atMessageId
  conversation.atAllMessageId = atAllMessageId
  return changed
}
export const useConversationStore = defineStore('imConversationStore', {
  state: () => ({
    conversations: [],
    // 全量会话列表（私聊 + 群聊 + 频道）
    conversationReads: {},
    // 会话读位置
    activeConversation: null,
    // 当前激活的会话
    activeMentionMessageId: undefined,
    // 当前会话待定位的未读 @ 消息编号
    loading: false,
    // 是否正在批量加载
    recentForwardConversationKeys: [] // 最近转发会话 key 列表
  }),

  getters: {
    /** 排序后的会话列表 */
    getSortedConversationList(state) {
      return [...state.conversations].filter(conversation => !conversation.deleted).sort((a, b) => {
        const aTop = a.top ? 1 : 0
        const bTop = b.top ? 1 : 0
        if (aTop !== bTop) {
          return bTop - aTop
        }
        return (b.lastSendTime || 0) - (a.lastSendTime || 0)
      })
    },
    /** 未读总数 */
    getTotalUnreadCount(state) {
      return state.conversations.filter(conversation => !conversation.deleted && !conversation.silent).reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0)
    },
    /** 查找会话 */
    getConversation: state => (type, targetId) => state.conversations.find(conversation => conversation.type === type && conversation.targetId === targetId),
    /** 查找会话读位置 */
    getConversationRead: state => (type, targetId) => state.conversationReads[getClientConversationId(type, targetId)]
  },
  actions: {
    /** 加载会话 */
    async loadConversationList() {
      // 1. 清理旧账号内存
      const previousActiveKey = this.activeConversation ? getClientConversationId(this.activeConversation.type, this.activeConversation.targetId) : null
      await enqueueConversationBarrier(async() => {
        const loading = this.loading
        this.clear()
        this.loading = loading
        // 2. 从 IndexedDB 读取会话和轻量设置
        const db = getDb()
        const [conversations, conversationReads, recent] = await Promise.all([db.getAll('conversations'), db.getAll('conversationReads'), db.getSetting(StorageKeys.settings.recentForwardConversationKeys)])
        const nextConversationReads = {}
        for (const record of conversationReads) {
          const item = fromConversationReadDO(record)
          nextConversationReads[getClientConversationId(item.conversationType, item.targetId)] = item
        }
        const nextConversations = conversations.map(fromConversationDO)
        this.conversationReads = nextConversationReads
        await this.applyLocalConversationReads(nextConversations, db)
        this.conversations = nextConversations
        if (Array.isArray(recent)) {
          this.recentForwardConversationKeys = recent.slice(0, CONVERSATION_RECENT_FORWARD_MAX)
        }
        // 3. 恢复当前激活会话
        if (previousActiveKey) {
          this.activeConversation = this.conversations.find(conversation => !conversation.deleted && getClientConversationId(conversation.type, conversation.targetId) === previousActiveKey) ?? null
        }
      })
    },
    /** 清空会话内存 */
    clear() {
      saveDraftConversationListDebounced.cancel()
      pendingDraftConversations.clear()
      this.conversations = []
      this.conversationReads = {}
      this.activeConversation = null
      this.activeMentionMessageId = undefined
      this.recentForwardConversationKeys = []
      this.loading = false
    },
    /** 持久化会话读位置 */
    async saveConversationReadRecord(target, tx, db = getDb()) {
      const records = (Array.isArray(target) ? target : target ? [target] : []).map(toConversationReadDO)
      if (records.length === 0) {
        return
      }
      if (tx) {
        for (const record of records) {
          await db.put('conversationReads', record, tx)
        }
        return
      }
      await db.transaction(['conversationReads'], 'readwrite', async tx => {
        for (const record of records) {
          await db.put('conversationReads', record, tx)
        }
      })
    },
    /** 应用本地会话读位置 */
    async applyLocalConversationReads(conversations, db = getDb()) {
      const targetConversations = conversations || this.conversations
      const changedConversations = []
      for (const conversation of targetConversations) {
        const record = this.getConversationRead(conversation.type, conversation.targetId)
        const needsMentionBackfill = conversation.atMe && !conversation.atMessageId || conversation.atAll && !conversation.atAllMessageId
        if (!record && !needsMentionBackfill) {
          continue
        }
        const messages = await db.getAllByIndex('messages', 'clientConversationId', getClientConversationId(conversation.type, conversation.targetId))
        const changed = record ? this.applyReadToConversation(conversation, record.messageId, messages, db.userId) : backfillConversationMentionIds(conversation, messages, db.userId)
        if (changed) {
          changedConversations.push(conversation)
        }
      }
      if (changedConversations.length > 0) {
        await this.saveConversationRecord(changedConversations, undefined, db)
      }
    },
    /** 判断消息是否已被会话读位置覆盖 */
    isMessageCoveredByReadPosition(conversation, message) {
      if (!message?.id) {
        return false
      }
      const record = this.getConversationRead(conversation.type, conversation.targetId)
      return !!record && message.id <= record.messageId
    },
    /** 判断服务端已读位置是否覆盖消息编号 */
    isReportedReadPositionCovered(type, targetId, messageId) {
      if (!messageId) {
        return false
      }
      const conversation = this.getConversation(type, targetId)
      return (conversation?.reportedReadMessageId || 0) >= messageId
    },
    /** 应用读位置到会话 */
    applyReadToConversation(conversation, messageId, messages, userId) {
      return applyConversationUnreadState(conversation, messages, messageId, userId)
    },
    /** 应用撤回后的会话未读与 @ 状态 */
    applyRecallToConversation(conversation, messages, originalMessage, userId) {
      const read = this.getConversationRead(conversation.type, conversation.targetId)
      return read ? applyConversationUnreadState(conversation, messages, read.messageId, userId) : applyConversationRecallStateWithoutRead(conversation, messages, originalMessage, userId)
    },
    /** 应用会话读位置 */
    async applyConversationReadList(records, db = getDb()) {
      const conversationIds = records.filter(isValidConversationReadRecord).map(record => getClientConversationId(record.conversationType, record.targetId))
      await enqueueConversationWrites(conversationIds, () => this.applyConversationReadListNow(records, db))
    },
    /** 实际应用会话读位置；调用方必须持有涉及会话的写 lane */
    async applyConversationReadListNow(records, db) {
      if (records.length === 0) {
        return
      }
      const changedReads = new Map()
      const changedConversations = new Map()
      const changedMessages = new Map()
      const changedMemoryMessages = new Map()
      const messageStore = useMessageStore()

      // 1. 按读位置更新会话未读和频道已读态
      for (const record of records) {
        if (!isValidConversationReadRecord(record)) {
          continue
        }
        const clientConversationId = getClientConversationId(record.conversationType, record.targetId)
        let storedMessages
        const getStoredMessages = async() => {
          if (!storedMessages) {
            storedMessages = await db.getAllByIndex('messages', 'clientConversationId', clientConversationId)
          }
          return storedMessages
        }
        const current = changedReads.get(clientConversationId) || this.conversationReads[clientConversationId]
        const messageId = Math.max(record.messageId, current?.messageId || 0)
        const currentConversation = this.getConversation(record.conversationType, record.targetId)
        const conversation = changedConversations.get(clientConversationId) || (currentConversation ? {
          ...currentConversation
        } : undefined)
        if (conversation && record.messageId > (conversation.reportedReadMessageId || 0)) {
          conversation.reportedReadMessageId = record.messageId
          changedConversations.set(clientConversationId, conversation)
        }
        if (!current || messageId > current.messageId) {
          const next = {
            conversationType: record.conversationType,
            targetId: record.targetId,
            messageId,
            updateTime: record.updateTime
          }
          changedReads.set(clientConversationId, next)
        }
        if (conversation && this.applyReadToConversation(conversation, messageId, await getStoredMessages(), db.userId)) {
          changedConversations.set(clientConversationId, conversation)
        }
        if (record.conversationType !== ImConversationType.CHANNEL) {
          continue
        }
        const memoryMessages = messageStore.getMessages(clientConversationId)
        for (const message of memoryMessages) {
          if (message.id && message.id <= messageId && message.receiptStatus !== ImMessageReceiptStatus.DONE) {
            changedMemoryMessages.set(message, {
              ...message,
              receiptStatus: ImMessageReceiptStatus.DONE
            })
          }
        }
        for (const message of await getStoredMessages()) {
          if (message.id && message.id <= messageId && message.receiptStatus !== ImMessageReceiptStatus.DONE) {
            message.receiptStatus = ImMessageReceiptStatus.DONE
            changedMessages.set(message.messageKey, message)
          }
        }
      }

      // 2. 持久化本轮变更
      if (changedReads.size === 0 && changedConversations.size === 0 && changedMessages.size === 0 && changedMemoryMessages.size === 0) {
        return
      }
      const stores = []
      if (changedReads.size > 0) {
        stores.push('conversationReads')
      }
      if (changedConversations.size > 0) {
        stores.push('conversations')
      }
      if (changedMessages.size > 0) {
        stores.push('messages')
      }
      if (stores.length > 0) {
        await db.transaction(stores, 'readwrite', async tx => {
          if (changedReads.size > 0) {
            await this.saveConversationReadRecord([...changedReads.values()], tx, db)
          }
          if (changedConversations.size > 0) {
            await this.saveConversationRecord([...changedConversations.values()], tx, db)
          }
          for (const message of changedMessages.values()) {
            await db.put('messages', message, tx)
          }
        })
      }
      changedReads.forEach((read, key) => {
        this.conversationReads[key] = read
      })
      changedConversations.forEach(conversation => {
        this.publishConversationProjection(conversation, true)
      })
      changedMemoryMessages.forEach((next, current) => Object.assign(current, next))
    },
    /** 增量拉取会话读位置 */
    async pullConversationReads() {
      const db = await initDb()
      await runIncrementalPull(db, StorageKeys.settings.conversationReadPullCursor, params => apiPullMyConversationReadList(params).then(response => response.data), async records => {
        await this.applyConversationReadList(records, db)
        return true
      })
    },
    /** 执行会话记录持久化 */
    async saveConversationRecord(target, tx, db = getDb()) {
      const conversations = (Array.isArray(target) ? target : target ? [target] : []).map(toConversationDO)
      if (conversations.length === 0) {
        return
      }
      if (tx) {
        for (const conversation of conversations) {
          await db.put('conversations', conversation, tx)
        }
        return
      }
      await db.transaction(['conversations'], 'readwrite', async tx => {
        for (const conversation of conversations) {
          await db.put('conversations', conversation, tx)
        }
      })
    },
    /** 持久化单个会话 */
    saveConversation(conversation, tx, db = getDb()) {
      if (!conversation) {
        return
      }
      if (tx) {
        void this.saveConversationRecord(conversation, tx, db).catch(e => console.warn('[IM conversationStore] 会话写入失败', e))
        return
      }
      void enqueueConversationWrite(getClientConversationId(conversation.type, conversation.targetId), () => this.saveConversationRecord(conversation, undefined, db)).catch(e => console.warn('[IM conversationStore] 会话写入失败', e))
    },
    /** 持久化会话列表 */
    saveConversationList(conversations, tx, db = getDb()) {
      const targets = conversations || this.conversations
      if (tx) {
        return this.saveConversationRecord(targets, tx, db).catch(e => console.warn('[IM conversationStore] 会话列表写入失败', e))
      }
      return enqueueConversationWrites(targets.map(item => getClientConversationId(item.type, item.targetId)), () => this.saveConversationRecord(targets, undefined, db)).then(() => undefined).catch(e => {
        console.warn('[IM conversationStore] 会话写入失败', e)
      })
    },
    /** 构建会话的下一份投影，不提前修改响应式状态 */
    buildConversationProjection(info) {
      const clientConversationId = getClientConversationId(info.type, info.targetId)
      const relationTerminated = info.type === ImConversationType.GROUP && isRelationTerminated(clientConversationId)
      const current = this.getConversation(info.type, info.targetId)
      const conversation = current ? {
        ...current
      } : this.createEmptyConversation(info.type, info.targetId, info.name, info.avatar, info.silent)
      if (conversation.deleted && !relationTerminated) {
        conversation.deleted = false
      }
      if (info.name) {
        conversation.name = info.name
      }
      if (info.avatar) {
        conversation.avatar = info.avatar
      }
      if (info.silent !== undefined) {
        conversation.silent = info.silent
      }
      if (relationTerminated) {
        conversation.deleted = true
      }
      if (current) {
        conversationProjectionBases.set(conversation, {
          ...current
        })
      }
      return conversation
    },
    /** 发布已成功持久化的会话投影 */
    publishConversationProjection(projection, preserveConcurrentFields = false) {
      const current = this.getConversation(projection.type, projection.targetId)
      if (current) {
        const concurrentFields = {}
        const base = conversationProjectionBases.get(projection)
        if (preserveConcurrentFields) {
          if (!base || current.name !== base.name) concurrentFields.name = current.name
          if (!base || current.avatar !== base.avatar) concurrentFields.avatar = current.avatar
          if (!base || current.top !== base.top) concurrentFields.top = current.top
          if (!base || current.silent !== base.silent) concurrentFields.silent = current.silent
          if (!base || current.draft !== base.draft) concurrentFields.draft = current.draft
        }
        Object.assign(current, projection, concurrentFields)
        return current
      }
      this.conversations.unshift(projection)
      return projection
    },
    /** 确保会话存在 */
    ensureConversation(info) {
      return this.publishConversationProjection(this.buildConversationProjection(info))
    },
    /** 打开或创建会话 */
    openConversation(targetId, type, name, avatar, options) {
      // 1. 确保会话在列表中
      const conversation = this.ensureConversation({
        type,
        targetId,
        name,
        avatar,
        silent: options?.silent
      })
      // 2. 激活会话并保存
      this.setActiveConversation(conversation)
      this.saveConversation(conversation)
      return conversation
    },
    /** 设置当前会话 */
    setActiveConversation(conversation) {
      this.activeMentionMessageId = conversation?.atMessageId || conversation?.atAllMessageId
      this.activeConversation = conversation
      if (!conversation) {
        return
      }
      // 懒加载消息并保存会话摘要
      void useMessageStore().ensureConversationMessageListLoaded(conversation).catch(error => console.warn('[IM conversationStore] 会话消息加载失败', error))
      this.saveConversation(conversation)
    },
    /** 消费当前会话待定位的未读 @ 消息编号 */
    consumeActiveMentionMessageId() {
      const messageId = this.activeMentionMessageId
      this.activeMentionMessageId = undefined
      return messageId
    },
    /** 创建空会话 */
    createEmptyConversation(type, targetId, name, avatar, silent = false) {
      return {
        targetId,
        type,
        name,
        avatar,
        lastContent: '',
        lastSendTime: 0,
        unreadCount: 0,
        deleted: false,
        top: false,
        silent,
        atMe: false,
        atAll: false
      }
    },
    /** 设置置顶 */
    setConversationTop(type, targetId, top) {
      const conversation = this.getConversation(type, targetId)
      if (!conversation) {
        return
      }
      conversation.top = top
      this.saveConversation(conversation)
    },
    /** 设置免打扰 */
    setConversationSilent(type, targetId, silent) {
      const conversation = this.getConversation(type, targetId)
      if (!conversation) {
        return
      }
      conversation.silent = silent
      this.saveConversation(conversation)
    },
    /** 删除会话 */
    async removeConversation(type, targetId) {
      const db = getDb()
      await enqueueConversationWrite(getClientConversationId(type, targetId), async() => {
        await this.removeConversationNow(type, targetId, db)
      })
    },
    /** 实际删除会话；调用方必须持有当前会话写 lane */
    async removeConversationNow(type, targetId, db) {
      if (!this.getConversation(type, targetId)) {
        return
      }
      // 1. 先持久化消息 clear watermark 并清理消息
      await useMessageStore().deleteConversationMessageListNow(type, targetId, db)
      // 2. 保存删除终态，再发布响应式投影
      await this.hideConversationNow(type, targetId, db)
    },
    /** 保存隐藏会话投影但不发布 Store；用于和其它终态写入共用事务 */
    async saveHiddenConversationRecord(type, targetId, tx, db = getDb()) {
      const clientConversationId = getClientConversationId(type, targetId)
      const current = this.getConversation(type, targetId)
      const stored = current ? undefined : await db.get('conversations', clientConversationId, tx)
      const conversation = current || (stored ? fromConversationDO(stored) : undefined)
      if (!conversation) {
        return undefined
      }
      const projection = {
        ...conversation,
        deleted: true,
        draft: undefined
      }
      await this.saveConversationRecord(projection, tx, db)
      return projection
    },
    /** 发布已成功持久化的隐藏会话投影 */
    publishHiddenConversationProjection(projection) {
      const conversation = this.getConversation(projection.type, projection.targetId)
      if (!conversation) {
        return
      }
      pendingDraftConversations.delete(conversation)
      if (this.activeConversation === conversation) {
        this.activeConversation = null
        this.activeMentionMessageId = undefined
      }
      Object.assign(conversation, projection)
    },
    /** 隐藏会话但保留消息；用于退群、被踢和群解散终态 */
    async hideConversationNow(type, targetId, db) {
      const projection = await this.saveHiddenConversationRecord(type, targetId, undefined, db)
      if (projection) {
        this.publishHiddenConversationProjection(projection)
      }
    },
    /** 删除私聊会话 */
    removePrivateConversation(friendId, db = getDb()) {
      return enqueueConversationWrite(getClientConversationId(ImConversationType.PRIVATE, friendId), () => this.removeConversationNow(ImConversationType.PRIVATE, friendId, db))
    },
    /** 标记会话已读 */
    markConversationRead(type, targetId, messageId, db = getDb()) {
      void enqueueConversationWrite(getClientConversationId(type, targetId), () => this.markConversationReadNow(type, targetId, messageId, db)).catch(e => console.warn('[IM conversationStore] 会话已读写入失败', e))
    },
    /** 实际标记会话已读；调用方必须持有当前会话写 lane */
    async markConversationReadNow(type, targetId, messageId, db) {
      const conversation = this.getConversation(type, targetId)
      if (!conversation) {
        return
      }
      const key = getClientConversationId(type, targetId)
      const current = this.conversationReads[key]
      const readMessageIdAdvanced = !!messageId && messageId > (current?.messageId || 0)
      if (conversation.unreadCount === 0 && !conversation.atMe && !conversation.atAll && !readMessageIdAdvanced) {
        return
      }
      const nextConversation = {
        ...conversation,
        unreadCount: 0,
        atMe: false,
        atAll: false,
        atMessageId: undefined,
        atAllMessageId: undefined
      }
      if (readMessageIdAdvanced) {
        const record = createConversationRead(type, targetId, messageId)
        await db.transaction(['conversations', 'conversationReads'], 'readwrite', async tx => {
          await this.saveConversationRecord(nextConversation, tx, db)
          await this.saveConversationReadRecord(record, tx, db)
        })
        this.publishConversationProjection(nextConversation, true)
        this.conversationReads[key] = record
        return
      }
      await this.saveConversationRecord(nextConversation, undefined, db)
      this.publishConversationProjection(nextConversation, true)
    },
    /** 标记会话已上报服务端读位置 */
    markConversationReadReported(type, targetId, messageId, db = getDb()) {
      if (!messageId) {
        return
      }
      void enqueueConversationWrite(getClientConversationId(type, targetId), () => this.markConversationReadReportedNow(type, targetId, messageId, db)).catch(e => console.warn('[IM conversationStore] 已上报读位置写入失败', e))
    },
    /** 实际记录已上报读位置；调用方必须持有当前会话写 lane */
    async markConversationReadReportedNow(type, targetId, messageId, db) {
      const conversation = this.getConversation(type, targetId)
      if (!conversation || messageId <= (conversation.reportedReadMessageId || 0)) {
        return
      }
      const nextConversation = {
        ...conversation,
        reportedReadMessageId: messageId
      }
      await this.saveConversationRecord(nextConversation, undefined, db)
      this.publishConversationProjection(nextConversation, true)
    },
    // ==================== 最近转发 ====================

    /** 推送最近转发会话 */
    pushRecentForwardConversationKeyList(keys) {
      if (!keys || keys.length === 0) {
        return
      }
      const merged = [...keys, ...this.recentForwardConversationKeys]
      this.recentForwardConversationKeys = Array.from(new Set(merged)).slice(0, CONVERSATION_RECENT_FORWARD_MAX)
      this.saveRecentForwardConversationKeyList()
    },
    /** 移除最近转发会话 */
    removeRecentForwardConversationKey(key) {
      const index = this.recentForwardConversationKeys.indexOf(key)
      if (index < 0) {
        return
      }
      this.recentForwardConversationKeys.splice(index, 1)
      this.saveRecentForwardConversationKeyList()
    },
    /** 保存最近转发会话 */
    saveRecentForwardConversationKeyList() {
      void getDb().setSetting(StorageKeys.settings.recentForwardConversationKeys, this.recentForwardConversationKeys.slice(0, CONVERSATION_RECENT_FORWARD_MAX)).catch(e => console.warn('[IM conversationStore] 最近转发列表写入失败', e))
    },
    // ==================== 会话维护 ====================

    /** 重排会话 */
    sortConversationList() {
      this.conversations.sort((a, b) => (b.lastSendTime || 0) - (a.lastSendTime || 0))
      if (!this.loading) {
        void this.saveConversationList(this.conversations)
      }
    },
    /** 同步会话展示元数据 */
    updateConversation(type, targetId, info, db = getDb()) {
      const conversation = this.getConversation(type, targetId)
      if (!conversation) {
        return
      }
      let changed = false
      if (info.name && conversation.name !== info.name) {
        conversation.name = info.name
        changed = true
      }
      if (info.avatar !== undefined && conversation.avatar !== info.avatar) {
        conversation.avatar = info.avatar || ''
        changed = true
      }
      if (info.silent !== undefined && conversation.silent !== info.silent) {
        conversation.silent = info.silent
        changed = true
      }
      if (changed) {
        this.saveConversation(conversation, undefined, db)
      }
    },
    // ==================== 草稿 ====================

    /** 获取草稿 */
    getConversationDraft(conversation) {
      return this.getConversation(conversation.type, conversation.targetId)?.draft
    },
    /** 设置草稿 */
    setConversationDraft(conversation, snapshot) {
      if (!snapshot.plain.trim() && !snapshot.reply) {
        this.clearConversationDraft(conversation)
        return
      }
      const target = this.getConversation(conversation.type, conversation.targetId)
      if (!target) {
        return
      }
      target.draft = snapshot
      this.scheduleConversationDraftSave(target)
    },
    /** 清除草稿 */
    clearConversationDraft(conversation) {
      const target = this.getConversation(conversation.type, conversation.targetId)
      if (!target?.draft) {
        return
      }
      target.draft = undefined
      this.scheduleConversationDraftSave(target)
    },
    /** 设置回复草稿 */
    setConversationReplyDraft(conversation, quote) {
      if (!quote) {
        return
      }
      const existing = this.getConversationDraft(conversation)
      this.setConversationDraft(conversation, {
        html: existing?.html ?? '',
        plain: existing?.plain ?? '',
        reply: quote
      })
    },
    /** 清除回复草稿 */
    clearConversationReplyDraft(conversation) {
      const existing = this.getConversationDraft(conversation)
      if (!existing?.reply) {
        return
      }
      this.setConversationDraft(conversation, {
        ...existing,
        reply: undefined
      })
    },
    /** 调度草稿保存 */
    scheduleConversationDraftSave(conversation) {
      pendingDraftConversations.set(conversation, getDb())
      saveDraftConversationListDebounced()
    },
    /** 立即保存草稿 */
    flushConversationDraftSave() {
      return saveDraftConversationListDebounced.flush() ?? Promise.resolve()
    }
  }
})

/** 合并草稿写入 */
const saveDraftConversationListDebounced = debounce(async() => {
  const conversations = Array.from(pendingDraftConversations.entries())
  pendingDraftConversations.clear()
  if (conversations.length === 0) {
    return
  }
  const conversationStore = useConversationStore(store)
  await Promise.all(conversations.map(([conversation, db]) => conversationStore.saveConversationList([conversation], undefined, db)))
}, PERSIST_DRAFT_DEBOUNCE_MS)
