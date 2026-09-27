import request from '@/utils/request'

// 获得文件夹列表
export function getMailFolderList(accountId) {
  return request({ url: '/oa/mail-folder/list', method: 'get', params: { accountId } })
}
