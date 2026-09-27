import request from '@/utils/request'

export const getProductProduceLinePage = params =>
  request({ url: '/mes/wm/product-produce-line/page', method: 'get', params })
