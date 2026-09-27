/** 百度地图 SDK 加载工具 */

// 全局回调名称
const CALLBACK_NAME = '__BAIDU_MAP_LOAD_CALLBACK__'

// SDK 加载状态
let loadPromise = null

/**
 * 加载百度地图 GL SDK
 * @param {number} timeout 超时时间（毫秒），默认 10000
 * @returns {Promise<void>}
 */
export function loadBaiduMapSdk(timeout = 10000) {
  const mapKey = process.env.VUE_APP_BAIDU_MAP_KEY
  if (!mapKey) {
    return Promise.reject(new Error('百度地图 Key 未配置'))
  }

  // 已加载完成
  if (window.BMapGL) {
    return Promise.resolve()
  }

  // 正在加载中，返回同一个 Promise
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      loadPromise = null
      reject(new Error('百度地图 SDK 加载超时'))
    }, timeout)

    // 全局回调
    window[CALLBACK_NAME] = () => {
      clearTimeout(timeoutId)
      delete window[CALLBACK_NAME]
      resolve()
    }

    // 创建 script 标签
    const script = document.createElement('script')
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(
      mapKey
    )}&callback=${CALLBACK_NAME}`
    script.onerror = () => {
      clearTimeout(timeoutId)
      loadPromise = null
      delete window[CALLBACK_NAME]
      reject(new Error('百度地图 SDK 加载失败'))
    }
    document.body.appendChild(script)
  })

  return loadPromise
}
