import request from '@/utils/request'

export function getStatisticsOverview() {
  return request({ url: '/im/manager/statistics/overview', method: 'get' })
}

export function getMessageTrend(days) {
  return request({ url: '/im/manager/statistics/message-trend', method: 'get', params: { days }})
}

export function getUserTrend(days) {
  return request({ url: '/im/manager/statistics/user-trend', method: 'get', params: { days }})
}

export function getMessageTypeDistribution() {
  return request({ url: '/im/manager/statistics/message-type-distribution', method: 'get' })
}

export function getGroupSizeDistribution() {
  return request({ url: '/im/manager/statistics/group-size-distribution', method: 'get' })
}

export function getTopSenders() {
  return request({ url: '/im/manager/statistics/top-senders', method: 'get' })
}
