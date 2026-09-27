/**
 * 表单校验规则生成器
 * 生成 Element UI / async-validator 兼容的 rule 对象
 */

// 必填项
export const required = (message) => {
  return {
    required: true,
    message: message || '该项为必填项',
    trigger: 'blur'
  }
}

// 长度范围
export const lengthRange = (options) => {
  const { min, max, message } = options

  return {
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur'
  }
}

// 不允许空格
export const notSpace = (message) => {
  return {
    validator: (rule, val, callback) => {
      if (val && val.indexOf(' ') !== -1) {
        callback(new Error(message || '不允许输入空格'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
}

// 不允许特殊字符
export const notSpecialCharacters = (message) => {
  return {
    validator: (rule, val, callback) => {
      if (val && /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/gi.test(val)) {
        callback(new Error(message || '不允许输入特殊字符'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }
}
