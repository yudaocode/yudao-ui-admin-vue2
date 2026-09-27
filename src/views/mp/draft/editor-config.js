import { getAccessToken, getTenantId } from '@/utils/auth'

/**
 * 创建公众号图文编辑器的上传配置。
 * 由这一配置集中维护与 Vue3 一致的 WangEditor
 * 上传地址、公众号参数、认证头和文件限制。
 */
export const createEditorConfig = (server, accountId, notifyError = () => {}) => ({
  MENU_CONF: {
    uploadImage: {
      server,
      maxFileSize: 5 * 1024 * 1024,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      meta: {
        accountId,
        type: 'image'
      },
      metaWithUrl: true,
      headers: {
        Accept: '*',
        Authorization: 'Bearer ' + getAccessToken(),
        'tenant-id': getTenantId()
      },
      withCredentials: true,
      timeout: 5 * 1000,
      fieldName: 'file',
      onBeforeUpload(file) {
        return file
      },
      onProgress() {
        // 由编辑器渲染上传进度
      },
      onSuccess() {
        // 最终插入动作由 customInsert 统一处理
      },
      onFailed(file, response) {
        notifyError(response.message)
      },
      onError(file, error) {
        notifyError(error.message)
      },
      customInsert(response, insert) {
        insert(response.data.url, 'image', response.data.url)
      }
    }
  }
})
