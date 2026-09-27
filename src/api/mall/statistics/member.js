import request from '@/utils/request'
import { parseTime } from '@/utils/ruoyi'

function formatDate(value) {
  if (!value) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value
  }
  return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
}

function formatTimes(times) {
  const values = Array.isArray(times) ? times : []
  return [formatDate(values[0]), formatDate(values[1])]
}

// 查询会员统计
export function getMemberSummary() {
  return request({
    url: '/statistics/member/summary',
    method: 'get'
  })
}

// 查询会员分析数据
export function getMemberAnalyse(params) {
  return request({
    url: '/statistics/member/analyse',
    method: 'get',
    params: { times: formatTimes(params && params.times) }
  })
}

// 按照省份，查询会员统计列表
export function getMemberAreaStatisticsList() {
  return request({
    url: '/statistics/member/area-statistics-list',
    method: 'get'
  })
}

// 按照性别，查询会员统计列表
export function getMemberSexStatisticsList() {
  return request({
    url: '/statistics/member/sex-statistics-list',
    method: 'get'
  })
}

// 按照终端，查询会员统计列表
export function getMemberTerminalStatisticsList() {
  return request({
    url: '/statistics/member/terminal-statistics-list',
    method: 'get'
  })
}

// 获得用户数量对照
export function getUserCountComparison() {
  return request({
    url: '/statistics/member/user-count-comparison',
    method: 'get'
  })
}

// 获得会员注册数量列表
export function getMemberRegisterCountList(beginTime, endTime) {
  return request({
    url: '/statistics/member/register-count-list',
    method: 'get',
    params: { times: formatTimes([beginTime, endTime]) }
  })
}
