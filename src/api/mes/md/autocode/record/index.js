import request from '@/utils/request'

// MES 编码生成 API
export const AutoCodeRecordApi = {
  generateAutoCode: async(ruleCode, inputChar) => {
    return await request({
      url: '/mes/md/auto-code-record/generate',
      method: 'post',
      data: { ruleCode, inputChar }
    })
  }
}
