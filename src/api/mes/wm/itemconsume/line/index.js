import request from '@/utils/request'

// DONE @AI：itemconsume/line/index.ts
export const getItemConsumeLinePage = params =>
  request({ url: '/mes/wm/item-consume-line/page', method: 'get', params })
