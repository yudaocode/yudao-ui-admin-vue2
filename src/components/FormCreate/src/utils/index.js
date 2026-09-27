/**
 * form-create 相关工具方法（Vue2 版本，与 vue3 的 components/FormCreate/src/utils 对齐）
 */

export function makeRequiredRule() {
  return { type: 'Required', field: 'formCreate$required', title: '是否必填' }
}

export function localeProps(t, prefix, rules) {
  if (typeof t !== 'function') return rules
  return rules.map(rule => {
    if (rule.field === 'formCreate$required') rule.title = t('props.required') || rule.title
    else if (rule.field && rule.field !== '_optionType') rule.title = t('components.' + prefix + '.' + rule.field) || rule.title
    return rule
  })
}

/**
 * 解析表单组件的 field、title 等字段（递归，如果组件包含子组件）
 *
 * @param rule  组件的生成规则 https://www.form-create.com/v3/guide/rule
 * @param fields 解析后表单组件字段
 * @param parentTitle  如果是子表单，子表单的标题，默认为空
 */
export const parseFormFields = (rule, fields = [], parentTitle = '') => {
  const { type, field, $required, title: tempTitle, children } = rule
  if (field && tempTitle) {
    let title = tempTitle
    if (parentTitle) {
      title = `${parentTitle}.${tempTitle}`
    }
    let required = false
    if ($required) {
      required = true
    }
    fields.push({
      field,
      title,
      type,
      required
    })
  }
  if (children && Array.isArray(children)) {
    children.forEach((item) => {
      parseFormFields(item, fields)
    })
  }
}
