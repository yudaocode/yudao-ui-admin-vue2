import request from '@/utils/request'
import { parseTime } from '@/utils/ruoyi'

function formatDate(value) {
  if (!value) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value
  }
  return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
}

/** 时间参数需要格式化，确保接口能够识别。 */
function formatDateParam(params) {
  const times = params && Array.isArray(params.times) ? params.times : []
  return {
    times: [formatDate(times[0]), formatDate(times[1])]
  }
}

// 查询交易统计
export function getTradeStatisticsSummary() {
  return request({
    url: '/statistics/trade/summary',
    method: 'get'
  })
}

// 获得交易状况统计
export function getTradeStatisticsAnalyse(params) {
  return request({
    url: '/statistics/trade/analyse',
    method: 'get',
    params: formatDateParam(params)
  })
}

// 获得交易状况明细
export function getTradeStatisticsList(params) {
  return request({
    url: '/statistics/trade/list',
    method: 'get',
    params: formatDateParam(params)
  })
}

// 导出交易状况明细
export function exportTradeStatisticsExcel(params) {
  return request({
    url: '/statistics/trade/export-excel',
    method: 'get',
    params: formatDateParam(params),
    responseType: 'blob'
  })
}

// 获得交易订单数量
export function getOrderCount() {
  return request({
    url: '/statistics/trade/order-count',
    method: 'get'
  })
}

// 获得交易订单数量对照
export function getOrderComparison() {
  return request({
    url: '/statistics/trade/order-comparison',
    method: 'get'
  })
}

// 获得订单量趋势统计
export function getOrderCountTrendComparison(type, beginTime, endTime) {
  return request({
    url: '/statistics/trade/order-count-trend',
    method: 'get',
    params: {
      type,
      beginTime: formatDate(beginTime),
      endTime: formatDate(endTime)
    }
  })
}
