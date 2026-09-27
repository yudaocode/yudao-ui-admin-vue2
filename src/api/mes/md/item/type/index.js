import request from '@/utils/request'

// MES 物料产品分类 API
export const MdItemTypeApi = {
  getItemTypeList: async(params) => request({ url: '/mes/md/item-type/list', method: 'get', params }),
  getItemTypeSimpleList: async() => request({ url: '/mes/md/item-type/simple-list', method: 'get' }),
  getItemType: async(id) => request({ url: '/mes/md/item-type/get?id=' + id, method: 'get' }),
  createItemType: async(data) => request({ url: '/mes/md/item-type/create', method: 'post', data }),
  updateItemType: async(data) => request({ url: '/mes/md/item-type/update', method: 'put', data }),
  deleteItemType: async(id) => request({ url: '/mes/md/item-type/delete?id=' + id, method: 'delete' })
}
