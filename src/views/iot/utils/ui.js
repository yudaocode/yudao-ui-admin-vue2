import { Message, MessageBox } from 'element-ui'

const translations = {
  'common.confirmTitle': '系统提示',
  'common.ok': '确定',
  'common.cancel': '取消',
  'common.exportMessage': '是否确认导出数据项？',
  'common.createSuccess': '新增成功',
  'common.updateSuccess': '修改成功',
  'common.delMessage': '是否删除所选中数据？',
  'common.delSuccess': '删除成功',
  'common.copySuccess': '复制成功',
  'common.copyError': '复制失败',
  'action.create': '新增',
  'action.update': '编辑'
}

export function useIotI18n() {
  return {
    t(key) {
      return translations[key] || key
    }
  }
}

export function createIotMessage() {
  const confirm = (content, title) => MessageBox.confirm(content, title || translations['common.confirmTitle'], {
    confirmButtonText: translations['common.ok'],
    cancelButtonText: translations['common.cancel'],
    type: 'warning'
  })
  return {
    info: Message.info,
    error: Message.error,
    success: Message.success,
    warning: Message.warning,
    alert: content => MessageBox.alert(content, translations['common.confirmTitle']),
    confirm,
    delConfirm: (content, title) => confirm(content || translations['common.delMessage'], title),
    exportConfirm: (content, title) => confirm(content || translations['common.exportMessage'], title),
    prompt: (content, title) => MessageBox.prompt(content, title, {
      confirmButtonText: translations['common.ok'],
      cancelButtonText: translations['common.cancel'],
      type: 'warning'
    })
  }
}
