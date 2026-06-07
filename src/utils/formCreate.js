/**
 * 针对 https://github.com/xaboy/form-create-designer 封装的工具类（Vue2 版本）
 * 与 yudao-ui-admin-vue3 的 src/utils/formCreate.ts 对齐，保证两端表单 JSON 数据结构一致、可互通
 */
import formCreate from '@form-create/element-ui'

/** 编码表单 Conf */
export function encodeConf(designerRef) {
  return formCreate.toJson(designerRef.getOption())
}

/** 解码表单 Conf */
export function decodeConf(conf) {
  return formCreate.parseJson(conf)
}

/** 编码表单 Fields */
export function encodeFields(designerRef) {
  const rule = designerRef.getRule()
  const fields = []
  rule.forEach((item) => {
    fields.push(formCreate.toJson(item))
  })
  return fields
}

/** 解码表单 Fields */
export function decodeFields(fields) {
  const rule = []
  ;(fields || []).forEach((item) => {
    rule.push(formCreate.parseJson(item))
  })
  return rule
}

/** 设置表单的 Conf 和 Fields，适用 FcDesigner 设计器场景 */
export function setConfAndFields(designerRef, conf, fields) {
  designerRef.setOption(decodeConf(conf))
  designerRef.setRule(decodeFields(fields))
}

/** 设置表单的 Conf 和 Fields，适用 form-create 渲染场景 */
export function setConfAndFields2(detailPreview, conf, fields, value) {
  detailPreview.option = decodeConf(conf)
  detailPreview.rule = decodeFields(fields)
  if (value) {
    detailPreview.value = value
  }
}
