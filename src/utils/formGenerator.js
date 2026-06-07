// TODO【BPM 迁移清理】旧 Form Generator 工具，已被 utils/formCreate.js 取代。
//   待 bpm/model、bpm/processInstance、bpm/definition 全部迁移到 form-create 后删除本文件
//   （详见 BPM_MIGRATION_PLAN.md 阶段3备注）
/**
 * 将服务端返回的 fields 字符串数组，解析成 JSON 数组
 * 如果指定了 variables 参数可对表单进行初始化
 *
 * @param fields JSON 字符串数组
 * @param variables Object 表单初始值
 * @returns {*[]} JSON 数组
 */
export function decodeFields(fields, variables) {
  const drawingList = (fields || []).map(json => {
    const item = JSON.parse(json)

    if (typeof variables === 'undefined' ) return item

    const setDefault = (item, variables) => {
      if (typeof variables[item.__vModel__] !== 'undefined') {
        item.__config__.defaultValue = variables[item.__vModel__]
      }
      if (item.__config__.children && item.__config__.children.length) {
        item.__config__.children.forEach(child => {
          setDefault(child, variables)
        })
      }
    }

    setDefault(item, variables)

    return item
  })

  return drawingList
}
