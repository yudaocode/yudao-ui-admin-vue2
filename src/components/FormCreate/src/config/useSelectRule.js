import generateUUID from '@form-create/utils/lib/unique'
import { localeProps, makeRequiredRule } from '@/components/FormCreate/src/utils'
import { selectRule } from '@/components/FormCreate/src/config/selectRule'
import { cloneDeep } from 'lodash'

/**
 * 通用选择器规则 hook
 *
 * @param option 规则配置 { name, label, icon, props, event }
 */
export const useSelectRule = (option) => {
  const label = option.label
  const name = option.name
  const rules = cloneDeep(selectRule)
  return {
    icon: option.icon,
    label,
    name,
    event: option.event,
    rule() {
      // 构建基础规则
      const baseRule = {
        type: name,
        field: generateUUID(),
        title: label,
        info: '',
        $required: false
      }
      // 将自定义 props 的默认值添加到 rule 的 props 中
      if (option.props && option.props.length > 0) {
        baseRule.props = {}
        option.props.forEach((prop) => {
          if (prop.field && prop.value !== undefined) {
            baseRule.props[prop.field] = prop.value
          }
        })
      }
      return baseRule
    },
    props(_, { t } = {}) {
      if (!option.props) {
        option.props = []
      }
      return localeProps(t, name + '.props', [makeRequiredRule(), ...option.props, ...rules])
    }
  }
}
