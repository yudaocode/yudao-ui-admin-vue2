import request from '@/utils/request'

export const MdItemBatchConfigApi = {
  getBatchConfigByItemId: async(itemId) => request({ url: '/mes/md/item-batch-config/get-by-item-id?itemId=' + itemId, method: 'get' }),
  saveBatchConfig: async(data) => request({ url: '/mes/md/item-batch-config/save', method: 'post', data })
}
