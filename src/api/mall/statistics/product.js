import request from '@/utils/request'
import { parseTime } from '@/utils/ruoyi'

function formatDate(value) {
  if (!value) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value
  }
  return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
}

function formatDateParams(params) {
  const query = { ...(params || {}) }
  if (Array.isArray(query.times) && query.times[0] && query.times[1]) {
    query.times = [formatDate(query.times[0]), formatDate(query.times[1])]
  } else {
    delete query.times
  }
  return query
}

/**
 * Vue3 请求层使用 qs 的 allowDots 模式，排序字段会序列化为
 * sortingFields[0].field / sortingFields[0].order。Vue2 的通用请求拦截器
 * 无法展开对象数组，因此在本 API 内转换成相同的扁平参数。
 */
function formatRankParams(params) {
  const query = formatDateParams(params)
  const sortingFields = Array.isArray(query.sortingFields) ? query.sortingFields : []
  delete query.sortingFields
  sortingFields.forEach((item, index) => {
    if (!item || !item.field || !item.order) return
    query[`sortingFields[${index}].field`] = item.field
    query[`sortingFields[${index}].order`] = item.order
  })
  return query
}

export const ProductStatisticsApi = {
  // 获得商品统计分析
  getProductStatisticsAnalyse(params) {
    return request({
      url: '/statistics/product/analyse',
      method: 'get',
      params: formatDateParams(params)
    })
  },
  // 获得商品状况明细
  getProductStatisticsList(params) {
    return request({
      url: '/statistics/product/list',
      method: 'get',
      params: formatDateParams(params)
    })
  },
  // 导出商品状况明细 Excel
  exportProductStatisticsExcel(params) {
    return request({
      url: '/statistics/product/export-excel',
      method: 'get',
      params: formatDateParams(params),
      responseType: 'blob'
    })
  },
  // 获得商品排行榜分页
  getProductStatisticsRankPage(params) {
    return request({
      url: '/statistics/product/rank-page',
      method: 'get',
      params: formatRankParams(params)
    })
  }
}
