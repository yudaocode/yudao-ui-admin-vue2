import { Message, MessageBox } from 'element-ui'

export function useMessage() {
  return {
    success: message => Message.success(message),
    info: message => Message.info(message),
    error: message => Message.error(message),
    warning: message => Message.warning(message),
    confirm: (message, title = '提示', options = {}) => MessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  }
}

export { MessageBox }
