import { defineStore } from './storeFactory'
import { dissolveGroup as apiDissolveGroup, getGroup as apiGetGroup, getMyGroupList as apiGetMyGroupList } from '@/api/im/group'
import { getGroupMember as apiGetGroupMember, getGroupMemberList as apiGetGroupMemberList, quitGroup as apiQuitGroup, updateGroupMember as apiUpdateGroupMember } from '@/api/im/group/member'
import { useConversationStore } from './conversationStore'
import { useGroupRequestStore } from './groupRequestStore'
import { ImContentType, ImConversationType, ImGroupMemberRole, ImMessageStatus } from '../../utils/constants'
import { CommonStatusEnum } from '@/utils/constants'
import { getClientConversationId, getDb, initDb } from '../../utils/db'
import { getGroupDisplayName } from '../../utils/user'
import { isResourceRequestPending, ResourceRequestKey, ResourceRequestMode, runResourceRequest } from '../../utils/resourceRequest'
import { enqueueConversationWrite, enqueueConversationWrites, isRelationTerminated, markRelationTerminated, reopenRelation } from '../../utils/messageSync'

/** 在群列表拉取期间合并一次群事件尾随刷新 */
function queueGroupListRefreshAfterPending(fetch) {
  if (isResourceRequestPending(ResourceRequestKey.GROUP_LIST)) {
    void fetch().catch(() => undefined)
  }
}
let groupRelationVersionSequence = 0
const groupRelationVersions = new Map()

/** 获取当前群关系代际，首次访问时创建 */
function ensureGroupRelationVersion(groupId) {
  const current = groupRelationVersions.get(groupId)
  if (current !== undefined) {
    return current
  }
  const next = ++groupRelationVersionSequence
  groupRelationVersions.set(groupId, next)
  return next
}
const pendingGroupInfoFetches = new Map()
const queuedGroupInfoRefreshes = new Set()

/** fetchGroupMemberList 并发去重表：同一群关系代际共用一个 Promise */
const pendingMemberFetches = new Map()
const queuedMemberRefreshes = new Set()
const pendingMemberKey = (groupId, relationVersion) => `${groupId}:${relationVersion}`

/**
 * fetchGroupMember 单成员并发去重表：同 (groupId, memberUserId) 同时进的请求共用一个 Promise
 *
 * 跟整群表分开：单成员 fetch 跟整群 fetch 语义不同（单成员不回填 me 的 silent），不能互相代替
 */
const pendingSingleMemberFetches = new Map()
const pendingSingleMemberKey = (groupId, relationVersion, memberUserId) => `${groupId}:${relationVersion}:${memberUserId}`

/** 构建群 IndexedDB 记录 */
function buildGroupDO(group) {
  const record = { ...group }
  delete record.activeCallExpired
  delete record.activeCallLoaded
  delete record.infoLoaded
  delete record.members
  delete record.membersLoaded
  delete record.membersExpired
  return record
}

/** 判断当前用户是否在 payload.memberUserIds 里（GROUP_CREATE / INVITE / KICK 自判用） */
function isSelfInPayloadMembers(payload, userId) {
  return (payload.memberUserIds || []).includes(userId)
}

/** 刷新我管理的群申请红点 */
function refreshUnhandledGroupRequests() {
  useGroupRequestStore().fetchUnhandledGroupRequestList().catch(() => undefined)
}

/**
 * IM 群 Store
 *
 * 负责：
 * - 拉取 / 缓存当前登录用户加入的群列表
 * - 按 groupId 懒加载群成员（供 ConversationGroupSide / MentionPicker / MessageReadStatus 消费）
 * - 成员"已读 / 未读"等聚合查询由 MessageReadStatus 另行组合
 */
export const useGroupStore = defineStore('imGroupStore', {
  state: () => ({
    groups: [],
    loaded: false,
    // 仅 fetchGroupList 成功后置位；loadGroupList（IDB）不置位，否则后台 SWR 刷新会被缓存命中跳过
    groupMembersExpired: false // 进入 IM / 重连后置位；IDB 里的成员桶延迟加载到内存时，也要按过期处理
  }),

  getters: {
    getGroup: state => id => {
      return state.groups.find(g => g.id === id)
    }
  },
  actions: {
    // ==================== 本地缓存 ====================

    /** 从 IndexedDB 恢复群列表 */
    async loadGroupList() {
      try {
        const cached = await getDb().getAll('groups')
        if (!cached || cached.length === 0) {
          return false
        }
        const conversationIds = cached.map(group => getClientConversationId(ImConversationType.GROUP, group.id))
        return await enqueueConversationWrites(conversationIds, async() => {
          const activeGroups = cached.filter(group => !isRelationTerminated(getClientConversationId(ImConversationType.GROUP, group.id)))
          this.groups = activeGroups
          return activeGroups.length > 0
        })
      } catch (e) {
        console.warn('[IM groupStore] 本地群缓存读取失败', e)
        return false
      }
    },
    /** 保存群列表 */
    async saveGroupList(groups, db = getDb()) {
      await db.transaction(['groups'], 'readwrite', async tx => {
        await db.clearStore('groups', tx)
        for (const group of groups) {
          await db.put('groups', buildGroupDO(group), tx)
        }
      })
    },
    /** 保存单个群 */
    async saveGroupRecord(group, db = getDb()) {
      if (!group) {
        return
      }
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, group.id)
      if (isRelationTerminated(clientConversationId)) {
        return
      }
      await db.put('groups', buildGroupDO(group))
    },
    /** 保存单个群 */
    saveGroup(group, db = getDb()) {
      if (!group) {
        return
      }
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, group.id)
      const snapshot = {
        ...group
      }
      void enqueueConversationWrite(clientConversationId, () => this.saveGroupRecord(snapshot, db)).catch(e => console.warn('[IM groupStore] 本地群写入失败', e))
    },
    /** 从 IndexedDB 恢复指定群成员 */
    async loadGroupMemberList(groupId) {
      // in-memory 已"完整"加载（fetchGroupMemberList 跑过或上次冷启动从 IDB 整桶恢复过）：直接复用；
      // 单成员补齐（fetchGroupMember）写进的 partial members 不在此返回缓存——其 membersLoaded=false
      const cachedGroup = this.getGroup(groupId)
      if (cachedGroup?.members && cachedGroup.membersLoaded) {
        return cachedGroup.members
      }
      try {
        const relationVersion = ensureGroupRelationVersion(groupId)
        const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
        const cached = await getDb().getAllByIndex('groupMembers', 'groupId', groupId)
        if (!cached || cached.length === 0) {
          return null
        }
        return await enqueueConversationWrite(clientConversationId, async() => {
          if (groupRelationVersions.get(groupId) !== relationVersion || isRelationTerminated(clientConversationId)) {
            return null
          }
          // 把 IDB 拿到的成员落到对应 group
          const group = this.getGroup(groupId)
          if (!group) {
            // group 还没就位：仅 in-memory 占位（name='' 表示未知），不调 upsertGroup —— 避免把假名灌进 conversation.name + groups IDB 桶；
            // 后续，等 fetchGroupList 浅合并时，被真名覆盖
            this.groups.push({
              id: groupId,
              name: '',
              members: cached,
              memberCount: cached.length,
              membersLoaded: true,
              membersExpired: this.groupMembersExpired
            })
          } else {
            group.members = cached
            group.memberCount = cached.length
            group.membersLoaded = true
            group.membersExpired = this.groupMembersExpired
          }
          return cached
        })
      } catch (e) {
        console.warn('[IM groupStore] 本地群成员缓存读取失败', {
          groupId
        }, e)
        return null
      }
    },
    /** 保存指定群成员；调用方必须持有群会话写 lane */
    async saveGroupMemberListRecord(groupId, members, db = getDb()) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      if (isRelationTerminated(clientConversationId)) {
        return
      }
      await db.transaction(['groupMembers'], 'readwrite', async tx => {
        await db.deleteByIndex('groupMembers', 'groupId', groupId, tx)
        for (const member of members) {
          if (member.id) {
            await db.put('groupMembers', member, tx)
          }
        }
      })
    },
    /** 串行保存指定群成员 */
    saveGroupMemberList(groupId, db = getDb()) {
      const members = this.getGroup(groupId)?.members
      if (!members) {
        return
      }
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      const records = JSON.parse(JSON.stringify(members))
      void enqueueConversationWrite(clientConversationId, () => this.saveGroupMemberListRecord(groupId, records, db)).catch(e => console.warn(`[IM groupStore] 本地群成员缓存写入失败 (groupId=${groupId})`, e))
    },
    // ==================== 远端拉取 ====================

    /** 拉取群列表；同步刷新对应群聊会话的展示名 / 头像 + 落 IDB */
    async fetchGroupList(force = false) {
      if (this.loaded && !force) {
        return this.groups
      }
      return runResourceRequest(ResourceRequestKey.GROUP_LIST, async() => {
        const db = await initDb()
        const fresh = ((await apiGetMyGroupList()).data).map(group => convertGroup(group, db.userId))
        const conversationIds = Array.from(new Set([...this.groups, ...fresh].map(group => getClientConversationId(ImConversationType.GROUP, group.id))))
        const committed = await enqueueConversationWrites(conversationIds, async() => {
          const visibleGroups = fresh.filter(group => !isRelationTerminated(getClientConversationId(ImConversationType.GROUP, group.id)))
          const groupMap = new Map(this.groups.map(group => [group.id, group]))
          this.groups = visibleGroups.map(group => {
            const existing = groupMap.get(group.id)
            if (!existing) {
              return {
                ...group,
                activeCallExpired: true,
                infoLoaded: true
              }
            }
            return {
              ...group,
              infoLoaded: true,
              activeCallExpired: existing.activeCallExpired,
              activeCallLoaded: existing.activeCallLoaded,
              members: existing.members,
              memberCount: existing.memberCount ?? group.memberCount,
              membersLoaded: existing.membersLoaded,
              membersExpired: existing.membersExpired
            }
          })
          this.loaded = true
          const conversationStore = useConversationStore()
          for (const group of this.groups) {
            conversationStore.updateConversation(ImConversationType.GROUP, group.id, {
              name: getGroupDisplayName(group),
              avatar: group.avatar,
              silent: group.silent
            }, db)
          }
          await this.saveGroupList([...this.groups], db).catch(e => console.warn('[IM groupStore] 本地群缓存写入失败', e))
          return this.groups
        })
        this.preloadMembersForEmptyAvatarGroups(db)
        return committed
      }, {
        mode: ResourceRequestMode.SINGLE_FLIGHT,
        refreshAfterPending: force
      })
    },
    /** 预加载空群头像的成员列表，供 GroupAvatar 异步合成群头像 */
    preloadMembersForEmptyAvatarGroups(db = getDb()) {
      for (const group of this.groups) {
        if (group.avatar || group.joinStatus === CommonStatusEnum.DISABLE || group.membersLoaded && !group.membersExpired && group.members?.length) {
          continue
        }
        const force = !!group.membersLoaded && !group.membersExpired && !group.members?.length
        this.fetchGroupMemberList(group.id, force, db).catch(error => {
          console.warn('[IM groupStore] 预加载群头像成员失败', {
            groupId: group.id
          }, error)
        })
      }
    },
    /** 失效全部群详情缓存 */
    markAllGroupInfoExpired() {
      for (const group of this.groups) {
        group.infoLoaded = false
      }
    },
    /** 失效全部群成员缓存 */
    markAllGroupMembersExpired() {
      this.groupMembersExpired = true
      for (const group of this.groups) {
        if (group.membersLoaded) {
          group.membersExpired = true
        }
      }
    },
    /** 失效全部群通话探测缓存 */
    markAllGroupActiveCallsExpired() {
      for (const group of this.groups) {
        group.activeCallExpired = true
      }
    },
    /** 标记群通话探测已加载 */
    markGroupActiveCallLoaded(groupId) {
      const group = this.getGroup(groupId)
      if (!group) {
        return
      }
      group.activeCallLoaded = true
      group.activeCallExpired = false
    },
    /** 判断群通话是否需要重新探测 */
    isGroupActiveCallExpired(groupId) {
      const group = this.getGroup(groupId)
      return !group?.activeCallLoaded || !!group.activeCallExpired
    },
    /** 失效指定群成员缓存 */
    markGroupMembersExpired(groupId) {
      const group = this.getGroup(groupId)
      if (group?.membersLoaded) {
        group.membersExpired = true
      }
    },
    /** 单群刷新：用 /im/group/get 拉一份最新元数据再 upsert，常用于 GROUP_UPDATE 推送后或手动 reload */
    fetchGroupInfo(groupId, force = false, db = getDb()) {
      const relationVersion = ensureGroupRelationVersion(groupId)
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      if (isRelationTerminated(clientConversationId)) {
        return Promise.resolve(undefined)
      }
      const cached = this.getGroup(groupId)
      if (cached?.infoLoaded && !force) {
        return Promise.resolve(cached)
      }
      const key = `${groupId}:${relationVersion}`
      const pending = pendingGroupInfoFetches.get(key)
      if (pending) {
        if (force) {
          queuedGroupInfoRefreshes.add(key)
        }
        return pending
      }
      const isRelationCurrent = () => groupRelationVersions.get(groupId) === relationVersion && !isRelationTerminated(clientConversationId)
      const promise = (async() => {
        try {
          const data = (await apiGetGroup(groupId)).data
          if (!data) {
            return undefined
          }
          return await enqueueConversationWrite(clientConversationId, async() => {
            if (!isRelationCurrent()) {
              return undefined
            }
            await this.upsertGroupAndSave({
              ...convertGroup(data, db.userId),
              infoLoaded: true
            }, db)
            return this.getGroup(groupId)
          })
        } catch (e) {
          console.warn('[IM groupStore] fetchGroupInfo 失败', e)
          return undefined
        }
      })().finally(() => {
        if (pendingGroupInfoFetches.get(key) !== promise) {
          return
        }
        const shouldRefresh = queuedGroupInfoRefreshes.has(key) && isRelationCurrent()
        pendingGroupInfoFetches.delete(key)
        queuedGroupInfoRefreshes.delete(key)
        if (shouldRefresh) {
          void this.fetchGroupInfo(groupId, true, db)
        }
      })
      pendingGroupInfoFetches.set(key, promise)
      return promise
    },
    /** 按群拉取成员（in-memory 缓存 + 并发去重，force=true 强刷）+ 落 IDB */
    fetchGroupMemberList(groupId, force = false, db = getDb()) {
      // in-memory "完整"加载过才命中——单成员补齐写入的 partial members 不在此返回（membersLoaded=false）
      const cached = this.getGroup(groupId)
      if (cached && cached.members && cached.membersLoaded && !cached.membersExpired && !force) {
        return Promise.resolve(cached.members)
      }
      const relationVersion = ensureGroupRelationVersion(groupId)
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      const key = pendingMemberKey(groupId, relationVersion)
      const inflight = pendingMemberFetches.get(key)
      if (inflight) {
        if (force) {
          queuedMemberRefreshes.add(key)
        }
        return inflight
      }
      const promise = (async() => {
        const client = db
        const userId = db.userId
        // 拉接口 + 单 pass 转换：同时捕获 me 的原始 VO，给下面回填 user-per-group 字段（silent / groupRemark）用
        const list = (await apiGetGroupMemberList(groupId)).data
        let meRaw
        const members = (list || []).map(member => {
          if (member.userId === userId) {
            meRaw = member
          }
          return convertGroupMember(member, groupId)
        })
        const silent = !!meRaw?.silent
        const groupRemark = meRaw?.groupRemark || ''
        return await enqueueConversationWrite(clientConversationId, async() => {
          if (groupRelationVersions.get(groupId) !== relationVersion || isRelationTerminated(clientConversationId)) {
            return []
          }
          // 必须进入 lane 后重新 getGroup，避免 fetchGroupList 已并发写入真实 group 的 race
          const group = this.getGroup(groupId)
          const isPlaceholder = !group
          let groupFieldsChanged = false
          if (!group) {
            // group 还没就位：仅 in-memory push 占位（name='' 表示未知），不调 upsertGroup——避免把假名灌进 conversation.name + groups IDB 桶；
            // 后续，等 fetchGroupList 浅合并时，被真名覆盖
            this.groups.push({
              id: groupId,
              name: '',
              members,
              memberCount: members.length,
              silent,
              groupRemark,
              membersLoaded: true,
              membersExpired: false
            })
          } else {
            group.members = members
            group.memberCount = members.length
            group.membersLoaded = true
            group.membersExpired = false
            // silent / groupRemark 任一变化才同步到 conversation 和 IDB；groupRemark 变化要顺带刷会话名
            if (group.silent !== silent || group.groupRemark !== groupRemark) {
              group.silent = silent
              group.groupRemark = groupRemark
              groupFieldsChanged = true
              const conversationStore = useConversationStore()
              conversationStore.updateConversation(ImConversationType.GROUP, groupId, {
                name: getGroupDisplayName(group),
                silent
              }, client)
            }
          }
          const records = JSON.parse(JSON.stringify(members))
          await this.saveGroupMemberListRecord(groupId, records, client)
          if (!isPlaceholder && groupFieldsChanged) {
            await this.saveGroupRecord(group, client)
          }
          return members
        })
      })().finally(() => {
        // 无论成功 / 失败都要从单飞表清掉，否则后续同 group 请求永远拿到这个 stale Promise
        if (pendingMemberFetches.get(key) === promise) {
          const shouldRefresh = queuedMemberRefreshes.has(key) && groupRelationVersions.get(groupId) === relationVersion && !isRelationTerminated(clientConversationId)
          pendingMemberFetches.delete(key)
          queuedMemberRefreshes.delete(key)
          if (shouldRefresh) {
            void this.fetchGroupMemberList(groupId, true, db).catch(() => undefined)
          }
        }
      })

      // 把 Promise 登记进单飞表，让同一群关系代际的请求复用
      pendingMemberFetches.set(key, promise)
      return promise
    },
    /**
     * 按 (groupId, memberUserId) 单成员补齐——deriveLastSenderDisplayName 兜底场景用
     *
     * 跟 fetchGroupMemberList 区别：只拉这一个成员，不动 me 的 silent / groupRemark（不是 me 的话拿不到）；
     * 命中时把成员 upsert 进 group.members 数组并落 IDB，让后续渲染能用 displayUserName
     */
    fetchGroupMember(groupId, memberUserId) {
      // in-memory 命中直接返回，不打接口
      const cached = this.getGroup(groupId)?.members?.find(m => m.userId === memberUserId)
      if (cached) {
        return Promise.resolve(cached)
      }
      const relationVersion = ensureGroupRelationVersion(groupId)
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      const key = pendingSingleMemberKey(groupId, relationVersion, memberUserId)
      const inflight = pendingSingleMemberFetches.get(key)
      if (inflight) {
        return inflight
      }
      const promise = (async() => {
        const data = (await apiGetGroupMember(groupId, memberUserId)).data
        if (!data) {
          return null
        }
        const member = convertGroupMember(data, groupId)
        return await enqueueConversationWrite(clientConversationId, async() => {
          if (groupRelationVersions.get(groupId) !== relationVersion || isRelationTerminated(clientConversationId)) {
            return null
          }
          // 把这一条 upsert 进 group.members 仅供 in-memory 渲染兜底；group 还没就位则用 placeholder
          // 注意：不写 IDB——成员桶语义是"全量"，存"1 人桶"会污染下次冷启动的 loadGroupMemberList
          const group = this.getGroup(groupId)
          if (!group) {
            // memberCount 不设：后续 fetchGroupList 合并 `existing.memberCount ?? fresh.memberCount` 时，
            // 占位值会顶替真实值（fresh 不带 memberCount），等 fetchGroupMemberList 跑过才能拿到真实数
            this.groups.push({
              id: groupId,
              name: '',
              members: [member]
            })
          } else {
            const memberList = group.members ?? []
            const index = memberList.findIndex(m => m.userId === memberUserId)
            if (index >= 0) {
              memberList[index] = member
            } else {
              memberList.push(member)
            }
            group.members = memberList
          }
          return member
        })
      })().finally(() => {
        if (pendingSingleMemberFetches.get(key) === promise) {
          pendingSingleMemberFetches.delete(key)
        }
      })
      pendingSingleMemberFetches.set(key, promise)
      return promise
    },
    /** 按 id 插入或合并群（命中则浅合并保留旧字段，未命中则追加），同步把展示名 / 头像 / 免打扰推到对应会话 */
    upsertGroup(group, db = getDb()) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, group.id)
      void enqueueConversationWrite(clientConversationId, () => this.upsertGroupAndSave(group, db)).catch(e => console.warn('[IM groupStore] 本地群写入失败', e))
    },
    /** 按 id 插入或合并群 */
    async upsertGroupAndSave(group, db = getDb()) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, group.id)
      if (isRelationTerminated(clientConversationId)) {
        return
      }
      const index = this.groups.findIndex(g => g.id === group.id)
      if (index >= 0) {
        this.groups[index] = {
          ...this.groups[index],
          ...group
        }
      } else {
        this.groups.push(group)
      }
      // 同步推到 conversation：群名 / 头像 / 免打扰是会话列表展示用的，必须紧随 group 变更
      const merged = this.getGroup(group.id) ?? group
      const conversationStore = useConversationStore()
      conversationStore.updateConversation(ImConversationType.GROUP, group.id, {
        name: getGroupDisplayName(merged),
        avatar: merged.avatar,
        silent: merged.silent
      }, db)
      // 持久化到 IDB（fire-and-forget）
      await this.saveGroupRecord(merged, db)
    },
    /** 本地移除群缓存和群会话；群解散（GROUP_DEL）、退群、被踢都复用 */
    removeGroup(id, expectedRelationVersion = ensureGroupRelationVersion(id), db = getDb()) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, id)
      return enqueueConversationWrite(clientConversationId, async() => {
        if (groupRelationVersions.get(id) !== expectedRelationVersion) {
          return
        }
        await this.removeGroupNow(id, undefined, db)
      })
    },
    /** 退出群聊并清理本地数据 */
    async quitGroup(id) {
      const relationVersion = ensureGroupRelationVersion(id)
      const db = getDb()
      await apiQuitGroup(id)
      await this.removeGroup(id, relationVersion, db)
    },
    /** 解散群聊并清理本地数据 */
    async dissolveGroup(id) {
      const relationVersion = ensureGroupRelationVersion(id)
      const db = getDb()
      await apiDissolveGroup(id)
      await this.removeGroup(id, relationVersion, db)
    },
    /** 实际移除群关系；调用方必须持有群会话写 lane */
    async removeGroupNow(id, messageId, db) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, id)
      const conversationStore = useConversationStore()
      if (!markRelationTerminated(clientConversationId, messageId)) {
        return
      }
      groupRelationVersions.set(id, ++groupRelationVersionSequence)
      const currentGroups = this.groups
      const currentConversation = conversationStore.getConversation(ImConversationType.GROUP, id)
      // 群、成员和会话终态必须一次提交，避免重启后只恢复其中一侧
      const hiddenConversation = await db.transaction(['groups', 'groupMembers', 'conversations'], 'readwrite', async tx => {
        await db.delete('groups', id, tx)
        await db.deleteByIndex('groupMembers', 'groupId', id, tx)
        return conversationStore.saveHiddenConversationRecord(ImConversationType.GROUP, id, tx, db)
      })
      // 事务期间若新 Store 投影已接管，则只保留已提交的旧 DB 终态
      if (this.groups === currentGroups) {
        this.groups = currentGroups.filter(group => group.id !== id)
      }
      if (hiddenConversation && conversationStore.getConversation(ImConversationType.GROUP, id) === currentConversation) {
        conversationStore.publishHiddenConversationProjection(hiddenConversation)
      }
    },
    /** 切换免打扰：推后端 + 落本地 + 同步会话列表的 silent，避免 silent 图标 / 总未读 / 提示音判断与设置漂移；和 friendStore.setFriendSilent 对齐 */
    async setGroupSilent(id, silent) {
      const db = await initDb()
      await apiUpdateGroupMember({
        groupId: id,
        silent
      })
      const group = this.getGroup(id)
      if (!group) {
        return
      }
      group.silent = silent
      const conversationStore = useConversationStore()
      conversationStore.updateConversation(ImConversationType.GROUP, id, {
        silent
      }, db)
      this.saveGroup(group, db)
    },
    /** 批量更新群成员角色；本地不命中则忽略，等 fetchGroupMemberList 兜底 */
    updateGroupMemberRoleList(groupId, userIds, role, db = getDb()) {
      const group = this.getGroup(groupId)
      if (!group?.members?.length) {
        return
      }
      // 命中目标且角色已变化才标记 changed，避免无变化时整数组重建触发响应式
      const idSet = new Set(userIds)
      let changed = false
      const newMembers = group.members.map(member => {
        if (!idSet.has(member.userId) || member.role === role) {
          return member
        }
        changed = true
        return {
          ...member,
          role
        }
      })
      // 有变化才整组替换，让响应式只在真有更新时通知下游
      if (changed) {
        group.members = newMembers
        this.saveGroupMemberList(groupId, db)
      }
    },
    /** 群主转让：群表 ownerUserId 改为新值；旧群主 role → NORMAL；新群主 role → OWNER */
    transferGroupOwner(groupId, oldOwnerId, newOwnerId, db = getDb()) {
      const group = this.getGroup(groupId)
      if (!group) {
        return
      }
      if (group.ownerUserId !== newOwnerId) {
        group.ownerUserId = newOwnerId
      }
      this.updateGroupMemberRoleList(groupId, [oldOwnerId], ImGroupMemberRole.NORMAL, db)
      this.updateGroupMemberRoleList(groupId, [newOwnerId], ImGroupMemberRole.OWNER, db)
      this.saveGroup(group, db)
    },
    /** 本地剔除群成员（GROUP_MEMBER_QUIT / KICK 事件）；不命中则等 fetchGroupMemberList 兜底 */
    removeLocalGroupMemberList(groupId, userIds, db = getDb()) {
      const group = this.getGroup(groupId)
      if (!group?.members?.length || !userIds.length) {
        return
      }
      const idSet = new Set(userIds)
      const next = group.members.filter(member => !idSet.has(member.userId))
      if (next.length === group.members.length) {
        return
      }
      group.members = next
      group.memberCount = next.length
      this.saveGroupMemberList(groupId, db)
    },
    /** 本地更新群成员的 displayUserName（GROUP_MEMBER_NICKNAME_UPDATE 事件）；不命中则等 fetchGroupMemberList 兜底 */
    updateGroupMemberDisplayUserName(groupId, userId, displayUserName, db = getDb()) {
      const group = this.getGroup(groupId)
      const member = group?.members?.find(m => m.userId === userId)
      if (!member || member.displayUserName === displayUserName) {
        return
      }
      member.displayUserName = displayUserName
      this.saveGroupMemberList(groupId, db)
    },
    /** 局部更新群字段（name / notice / avatar 等）；未命中本地缓存时静默忽略，等 fetchGroupList 兜底；新值跟旧值都相同时跳过响应式 + IDB 写 */
    updateGroupFields(groupId, fields, db = getDb()) {
      const group = this.getGroup(groupId)
      if (!group) {
        return
      }
      const changed = Object.keys(fields).some(k => group[k] !== fields[k])
      if (!changed) {
        return
      }
      Object.assign(group, fields)
      const conversationStore = useConversationStore()
      conversationStore.updateConversation(ImConversationType.GROUP, groupId, {
        name: getGroupDisplayName(group),
        avatar: group.avatar,
        silent: group.silent
      }, db)
      this.saveGroup(group, db)
    },
    /**
     * 接收 GROUP_* 群广播事件，按 type 分发到对应私有 action
     *
     * WebSocket 实时收走 messageStore.insertMessage 旁路调用
     * store 里没缓存的群静默忽略，等 fetchGroupList 兜底
     */
    async applyGroupNotification(groupId, type, content, messageId, db = getDb()) {
      if (!groupId) {
        return
      }
      await enqueueConversationWrite(getClientConversationId(ImConversationType.GROUP, groupId), () => this.applyGroupNotificationNow(groupId, type, content, messageId, db))
    },
    /** 实际应用群广播；调用方必须持有群会话写 lane */
    async applyGroupNotificationNow(groupId, type, content, messageId, db) {
      let payload
      try {
        payload = content ? JSON.parse(content) : {}
      } catch (error) {
        console.warn('[IM groupStore] applyGroupNotification 解析 content 失败', {
          groupId,
          type,
          contentLength: content?.length ?? 0
        }, error)
        return
      }
      queueGroupListRefreshAfterPending(() => this.fetchGroupList(true))
      switch (type) {
        case ImContentType.GROUP_CREATE:
          await this.applyGroupCreateNotificationNow(groupId, payload, messageId, db)
          break
        case ImContentType.GROUP_NAME_UPDATE:
          this.applyGroupNameUpdateNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_NOTICE_UPDATE:
          this.applyGroupNoticeUpdateNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_INFO_UPDATE:
          this.applyGroupInfoUpdateNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_DISSOLVE:
          await this.removeGroupNow(groupId, messageId, db)
          break
        case ImContentType.GROUP_MEMBER_INVITE:
          await this.applyGroupMemberInviteNotificationNow(groupId, payload, messageId, db)
          break
        case ImContentType.GROUP_MEMBER_ENTER:
          await this.applyGroupMemberEnterNotificationNow(groupId, payload, messageId, db)
          break
        case ImContentType.GROUP_MEMBER_QUIT:
          await this.applyGroupMemberQuitNotificationNow(groupId, payload, messageId, db)
          break
        case ImContentType.GROUP_MEMBER_KICK:
          await this.applyGroupMemberKickNotificationNow(groupId, payload, messageId, db)
          break
        case ImContentType.GROUP_MEMBER_NICKNAME_UPDATE:
          this.applyGroupMemberNicknameUpdateNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_ADMIN_ADD:
          this.updateGroupMemberRoleList(groupId, payload.memberUserIds || [], ImGroupMemberRole.ADMIN, db)
          this.markGroupMembersExpired(groupId)
          // 自己被加为管理员，原本看不到的群下未处理申请现在变可见，重新拉一次 unhandledList
          if (isSelfInPayloadMembers(payload, db.userId)) {
            refreshUnhandledGroupRequests()
          }
          break
        case ImContentType.GROUP_ADMIN_REMOVE:
          this.updateGroupMemberRoleList(groupId, payload.memberUserIds || [], ImGroupMemberRole.NORMAL, db)
          this.markGroupMembersExpired(groupId)
          if (isSelfInPayloadMembers(payload, db.userId)) {
            refreshUnhandledGroupRequests()
          }
          break
        case ImContentType.GROUP_OWNER_TRANSFER:
          this.applyGroupOwnerTransferNotification(groupId, payload, db.userId, db)
          break
        case ImContentType.GROUP_MESSAGE_PIN:
          this.applyGroupMessagePinNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_MESSAGE_UNPIN:
          this.applyGroupMessageUnpinNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_MEMBER_MUTED:
          this.applyGroupMemberMutedNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_MEMBER_CANCEL_MUTED:
          this.applyGroupMemberCancelMutedNotification(groupId, payload, db)
          break
        case ImContentType.GROUP_MUTED:
          this.updateGroupFields(groupId, {
            mutedAll: true
          }, db)
          break
        case ImContentType.GROUP_CANCEL_MUTED:
          this.updateGroupFields(groupId, {
            mutedAll: false
          }, db)
          break
        case ImContentType.GROUP_BANNED:
          this.updateGroupFields(groupId, {
            banned: !!payload.banned
          }, db)
          break
      }
    },
    /** 实际恢复群关系；调用方必须持有群会话写 lane */
    async reopenGroupRelationNow(groupId, messageId, db) {
      const clientConversationId = getClientConversationId(ImConversationType.GROUP, groupId)
      if (!reopenRelation(clientConversationId, messageId)) {
        return false
      }
      groupRelationVersions.set(groupId, ++groupRelationVersionSequence)
      const conversation = useConversationStore().getConversation(ImConversationType.GROUP, groupId)
      if (!conversation?.deleted) {
        return true
      }
      const nextConversation = {
        ...conversation,
        deleted: false
      }
      await useConversationStore().saveConversationRecord(nextConversation, undefined, db)
      useConversationStore().publishConversationProjection(nextConversation, true)
      return true
    },
    /** 创建群广播：群未就位时拉群详情 */
    async applyGroupCreateNotificationNow(groupId, payload, messageId, db = getDb()) {
      if (!isSelfInPayloadMembers(payload, db.userId)) {
        return
      }
      if (!(await this.reopenGroupRelationNow(groupId, messageId, db))) {
        return
      }
      const selfIsOperator = payload.operatorUserId === db.userId
      if (selfIsOperator && this.getGroup(groupId)) {
        return
      }
      void this.fetchGroupInfo(groupId, true, db)
    },
    /** 群名变更：按 newName 局部更新本地群名 */
    applyGroupNameUpdateNotification(groupId, payload, db = getDb()) {
      if (payload.newName) {
        this.updateGroupFields(groupId, {
          name: payload.newName
        }, db)
      }
    },
    /** 群公告变更：按 newNotice 局部更新（允许空串作为「清空公告」） */
    applyGroupNoticeUpdateNotification(groupId, payload, db = getDb()) {
      this.updateGroupFields(groupId, {
        notice: payload.newNotice ?? ''
      }, db)
    },
    /** 群信息变更：同步头像、进群审批 */
    applyGroupInfoUpdateNotification(groupId, payload, db = getDb()) {
      const fields = {}
      if (payload.newAvatar) {
        fields.avatar = payload.newAvatar
      }
      if (payload.newJoinApproval != null) {
        fields.joinApproval = payload.newJoinApproval
      }
      if (Object.keys(fields).length > 0) {
        this.updateGroupFields(groupId, fields, db)
      }
    },
    /** 成员加入：被邀请者本端 group 未就位先 fetchGroupInfo 初次拉取；所有人都刷成员列表（新成员 nickname / avatar 不在 payload） */
    async applyGroupMemberInviteNotificationNow(groupId, payload, messageId, db = getDb()) {
      const selfJoined = isSelfInPayloadMembers(payload, db.userId)
      if (selfJoined) {
        if (!(await this.reopenGroupRelationNow(groupId, messageId, db))) {
          return
        }
      }
      // 当前 lane 结束后再补群详情，避免 fetchGroupInfo 重入同一会话 lane
      if (selfJoined && !this.getGroup(groupId)) {
        void this.fetchGroupInfo(groupId, true, db).then(group => {
          if (!group) {
            return
          }
          this.markGroupMembersExpired(groupId)
          void this.fetchGroupMemberList(groupId, true, db).catch(() => undefined)
        })
        return
      }
      this.markGroupMembersExpired(groupId)
      void this.fetchGroupMemberList(groupId, true, db).catch(() => undefined)
    },
    /** 自由进群：进群者本端 group 未就位先 fetchGroupInfo 初次拉取；所有人都刷成员列表 */
    async applyGroupMemberEnterNotificationNow(groupId, payload, messageId, db = getDb()) {
      const selfJoined = payload.entrantUserId === db.userId
      if (selfJoined) {
        if (!(await this.reopenGroupRelationNow(groupId, messageId, db))) {
          return
        }
      }
      // 当前 lane 结束后再补群详情，避免 fetchGroupInfo 重入同一会话 lane
      if (selfJoined && !this.getGroup(groupId)) {
        void this.fetchGroupInfo(groupId, true, db).then(group => {
          if (!group) {
            return
          }
          this.markGroupMembersExpired(groupId)
          void this.fetchGroupMemberList(groupId, true, db).catch(() => undefined)
        })
        return
      }
      this.markGroupMembersExpired(groupId)
      void this.fetchGroupMemberList(groupId, true, db).catch(() => undefined)
    },
    /** 成员退群：退群者本人先把 self.status 置 DISABLE 再 removeGroup（保留状态语义 + 维持 groups 列表干净）；其他成员从本地列表移除 quitter */
    async applyGroupMemberQuitNotificationNow(groupId, payload, messageId, db = getDb()) {
      if (payload.operatorUserId === db.userId) {
        await this.removeGroupNow(groupId, messageId, db)
      } else if (payload.operatorUserId) {
        this.removeLocalGroupMemberList(groupId, [payload.operatorUserId], db)
        this.markGroupMembersExpired(groupId)
      }
    },
    /** 成员被移出：被踢者本人先把 self.status 置 DISABLE 再 removeGroup；其他成员从本地列表移除被踢者 */
    async applyGroupMemberKickNotificationNow(groupId, payload, messageId, db = getDb()) {
      const memberIds = payload.memberUserIds || []
      if (isSelfInPayloadMembers(payload, db.userId)) {
        await this.removeGroupNow(groupId, messageId, db)
      } else if (memberIds.length) {
        this.removeLocalGroupMemberList(groupId, memberIds, db)
        this.markGroupMembersExpired(groupId)
      }
    },
    /** 成员昵称变更：按 operatorUserId 局部更新对应 member.displayUserName */
    applyGroupMemberNicknameUpdateNotification(groupId, payload, db = getDb()) {
      if (payload.operatorUserId) {
        this.updateGroupMemberDisplayUserName(groupId, payload.operatorUserId, payload.displayUserName ?? '', db)
        this.markGroupMembersExpired(groupId)
      }
    },
    /** 群主转让：旧群主 → NORMAL，新群主 → OWNER；新群主自己侧重新拉申请列表 */
    applyGroupOwnerTransferNotification(groupId, payload, userId, db = getDb()) {
      if (payload.operatorUserId && payload.newOwnerUserId) {
        this.transferGroupOwner(groupId, payload.operatorUserId, payload.newOwnerUserId, db)
        this.markGroupMembersExpired(groupId)
      }
      // 自己接管群主：原本看不到的群下未处理申请现在变可见，重新拉一次 unhandledList
      if (payload.newOwnerUserId === userId) {
        refreshUnhandledGroupRequests()
      } else if (payload.operatorUserId === userId) {
        refreshUnhandledGroupRequests()
      }
    },
    /** 群消息置顶：从 payload 取消息展示数据加入置顶列表 */
    applyGroupMessagePinNotification(groupId, payload, db = getDb()) {
      const message = payload.message
      if (!message) {
        return
      }
      const group = this.getGroup(groupId)
      if (!group) {
        return
      }
      // 幂等：已存在同 messageId 不重复 push
      const existing = group.pinnedMessages || []
      if (existing.some(msg => msg.id === message.id)) {
        return
      }
      group.pinnedMessages = [...existing, {
        id: message.id,
        clientMessageId: '',
        senderId: message.senderId,
        type: message.type,
        content: message.content,
        status: ImMessageStatus.NORMAL,
        sendTime: new Date(message.sendTime).getTime(),
        targetId: message.groupId || groupId,
        selfSend: message.senderId === db.userId,
        atUserIds: message.atUserIds ? [...message.atUserIds] : [],
        receiverUserIds: message.receiverUserIds ? [...message.receiverUserIds] : []
      }]
      this.saveGroup(group, db)
    },
    /** 群消息取消置顶：按 messageId 从本地置顶列表中移除 */
    applyGroupMessageUnpinNotification(groupId, payload, db = getDb()) {
      if (!payload.messageId) {
        return
      }
      const group = this.getGroup(groupId)
      if (!group?.pinnedMessages?.length) {
        return
      }
      const newPinnedMessages = group.pinnedMessages.filter(m => m.id !== payload.messageId)
      if (newPinnedMessages.length === group.pinnedMessages.length) {
        return
      }
      group.pinnedMessages = newPinnedMessages
      this.saveGroup(group, db)
    },
    /** 单成员禁言：更新目标成员的 muteEndTime */
    applyGroupMemberMutedNotification(groupId, payload, db = getDb()) {
      const group = this.getGroup(groupId)
      const member = group?.members?.find(m => m.userId === payload.mutedUserId)
      if (member && payload.muteEndTime) {
        member.muteEndTime = payload.muteEndTime
        this.saveGroupMemberList(groupId, db)
        this.markGroupMembersExpired(groupId)
      }
    },
    /** 单成员取消禁言：清空目标成员的 muteEndTime */
    applyGroupMemberCancelMutedNotification(groupId, payload, db = getDb()) {
      const group = this.getGroup(groupId)
      const member = group?.members?.find(m => m.userId === payload.mutedUserId)
      if (member) {
        member.muteEndTime = undefined
        this.saveGroupMemberList(groupId, db)
        this.markGroupMembersExpired(groupId)
      }
    },
    /** 切账号时仅清 in-memory，IDB 按 userId 分桶天然隔离，回切秒开 */
    clear() {
      this.groups = []
      this.loaded = false
      this.groupMembersExpired = false
      // 单飞表跟 in-memory state 一起重置；旧账号 in-flight 的请求 finally 也会自己 delete key，提前清空只是更干脆
      pendingMemberFetches.clear()
      queuedMemberRefreshes.clear()
      pendingSingleMemberFetches.clear()
      pendingGroupInfoFetches.clear()
      queuedGroupInfoRefreshes.clear()
      groupRelationVersions.clear()
    }
  }
})
function convertGroup(group, currentUserId) {
  return {
    id: group.id,
    name: group.name,
    avatar: group.avatar,
    notice: group.notice,
    ownerUserId: group.ownerUserId,
    pinnedMessages: group.pinnedMessages?.map(message => convertGroupMessageVO(message, currentUserId)),
    mutedAll: group.mutedAll,
    banned: group.banned,
    joinApproval: group.joinApproval,
    joinStatus: group.joinStatus,
    groupRemark: group.groupRemark,
    silent: group.silent
  }
}

/** 后端 ImGroupMessageRespVO -> 前端 Message：补 targetId / selfSend / sendTime 等派生字段 */
function convertGroupMessageVO(message, currentUserId) {
  return {
    id: message.id,
    clientMessageId: message.clientMessageId || '',
    type: message.type,
    content: message.content,
    status: message.status,
    sendTime: new Date(message.sendTime).getTime(),
    senderId: message.senderId,
    targetId: message.groupId,
    selfSend: !!currentUserId && message.senderId === currentUserId,
    atUserIds: message.atUserIds || [],
    receiverUserIds: message.receiverUserIds || [],
    receiptStatus: message.receiptStatus,
    readCount: message.readCount
  }
}
function convertGroupMember(member, groupId) {
  return {
    id: member.id,
    userId: member.userId,
    groupId,
    nickname: member.nickname || String(member.userId),
    avatar: member.avatar,
    displayUserName: member.displayUserName,
    status: member.status,
    role: member.role,
    muteEndTime: member.muteEndTime
  }
}

// dev: 让 Pinia 的 actions 改动支持 HMR，免去每次改 store 都要硬刷
