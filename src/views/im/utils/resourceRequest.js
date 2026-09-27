/** 可合并请求的固定资源 */
export const ResourceRequestKey = Object.freeze({
  FACE_PACKS: 'facePacks',
  FACE_USER_ITEMS: 'faceUserItems',
  FRIEND_LIST: 'friendList',
  GROUP_LIST: 'groupList',
  CHANNEL_LIST: 'channelList',
  GROUP_REQUEST_UNHANDLED: 'groupRequestUnhandled'
})
/** 固定资源请求的 task 生命周期模式 */
export const ResourceRequestMode = Object.freeze({
  CACHE_SUCCESS: 'cache-success',
  SINGLE_FLIGHT: 'single-flight'
})
/** 固定资源请求策略 */
const resourceRequests = new Map() // 每个 key 仅发布一个当前 entry

/** 运行固定资源请求 */
export function runResourceRequest(key, execute, policy) {
  const existing = resourceRequests.get(key)
  // 1. 复用 task；force 只覆盖为一个最新尾随执行器
  if (existing) {
    if (existing.mode !== policy.mode) {
      return Promise.reject(new Error(`IM resource policy mismatch: ${key}`))
    }
    if (existing.mode === ResourceRequestMode.SINGLE_FLIGHT && policy.mode === ResourceRequestMode.SINGLE_FLIGHT && policy.refreshAfterPending) {
      existing.trailingExecute = execute
    }
    return existing.task
  }
  const task = Promise.resolve().then(execute)
  const entry = {
    mode: policy.mode,
    task
  }
  resourceRequests.set(key, entry)
  void task.then(() => finishResourceRequest(key, entry, true), () => finishResourceRequest(key, entry, false))
  return task
}

/** 完成请求并按策略释放或补刷 */
function finishResourceRequest(key, entry, succeeded) {
  // 1. 旧 finalizer 不能修改已经替换的新 entry
  if (resourceRequests.get(key) !== entry) {
    return
  }
  // 2. once 成功保留；其余情况先释放当前 entry
  if (entry.mode === ResourceRequestMode.CACHE_SUCCESS && succeeded) {
    return
  }
  resourceRequests.delete(key)
  // 3. single-flight 的多次 force 合并为一次后台尾随刷新
  if (entry.trailingExecute) {
    void runResourceRequest(key, entry.trailingExecute, {
      mode: ResourceRequestMode.SINGLE_FLIGHT
    }).catch(error => console.warn(`[IM] 尾随刷新 ${key} 失败`, error))
  }
}

/** 排空并清理固定资源请求状态 */
export async function clearResourceRequests() {
  const entries = Array.from(resourceRequests.entries())
  entries.forEach(([, entry]) => {
    entry.trailingExecute = undefined
  })
  await Promise.all(entries.map(([, entry]) => entry.task.catch(() => undefined)))
  entries.forEach(([key, entry]) => {
    if (resourceRequests.get(key) === entry) {
      resourceRequests.delete(key)
    }
  })
}

/** 判断固定资源当前是否有请求在途 */
export function isResourceRequestPending(key) {
  const entry = resourceRequests.get(key)
  return entry?.mode === ResourceRequestMode.SINGLE_FLIGHT
}
