/**
 * Vue2 JavaScript 版本不产生 TypeScript 运行时代码；这些 JSDoc 合同保留 Vue3
 * `types/index.ts` 中联系人页与 store 共用的对象边界，供编辑器和调用方校验字段。
 *
 * @typedef {{ id: number, nickname: string, avatar?: string, sex?: number, deptId?: number, deptName?: string }} User
 * @typedef {{ friendUserId: number, nickname: string, avatar?: string, displayName?: string, nicknamePinyin?: string, displayNamePinyin?: string, silent?: boolean, blocked?: boolean, status?: number }} Friend
 * @typedef {{ id: number, nickname: string, avatar?: string, displayName?: string, nicknamePinyin?: string, displayNamePinyin?: string }} FriendLite
 * @typedef {{ id: number, fromUserId: number, toUserId: number, fromNickname?: string, toNickname?: string, fromAvatar?: string, toAvatar?: string, applyContent?: string, addSource?: number, handleResult: number, handleContent?: string }} FriendRequest
 * @typedef {{ id: number, name?: string, avatar?: string, notice?: string, ownerUserId?: number, memberCount?: number, silent?: boolean, groupRemark?: string, members?: GroupMember[], membersLoaded?: boolean }} Group
 * @typedef {{ id: number, name?: string, showGroupName?: string, showImage?: string, showImageThumb?: string, memberCount?: number }} GroupLite
 * @typedef {{ id?: number, groupId: number, userId: number, nickname?: string, avatar?: string, role?: number, status?: number, silent?: boolean, groupRemark?: string }} GroupMember
 * @typedef {{ type: number, targetId: number, name?: string, avatar?: string, unreadCount?: number, lastContent?: string, lastSendTime?: number, silent?: boolean }} Conversation
 * @typedef {{ id?: number, clientMessageId: string, type: number, content: string, status: number, sendTime: number, senderId: number, targetId: number }} Message
 */

export {}
