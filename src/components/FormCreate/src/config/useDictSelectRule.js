import { ref } from 'vue'
import generateUUID from '@form-create/utils/lib/unique'
import { getSimpleDictTypeList } from '@/api/system/dict/type'
import { localeProps, makeRequiredRule } from '@/components/FormCreate/src/utils'
import { selectRule } from '@/components/FormCreate/src/config/selectRule'
import { cloneDeep } from 'lodash'

/**
 * 字典选择器规则，如果规则使用到动态数据则需要单独配置不能使用 useSelectRule
 *
 * Vue2 说明：hook 可能在组件 mounted 中调用（无 setup 上下文），
 * 因此这里直接发起请求，而不是使用 onMounted
 */
export const useDictSelectRule = () => {
  const label = '字典选择器'
  const name = 'DictSelect'
  const rules = cloneDeep(selectRule)
  const dictOptions = ref([]) // 字典类型下拉数据
  getSimpleDictTypeList()
    .then((response) => {
      // Vue2 的 request 拦截器返回整个响应体，字典数组在 data 字段上
      const data = response && response.data !== undefined ? response.data : response
      if (!data || data.length === 0) {
        return
      }
      dictOptions.value = data.map((item) => ({
        label: item.name,
        value: item.type
      }))
    })
    .catch(() => {})
  return {
    icon: 'icon-doc-text',
    label,
    name,
    rule() {
      return {
        type: name,
        field: generateUUID(),
        title: label,
        info: '',
        $required: false
      }
    },
    props(_, { t } = {}) {
      return localeProps(t, name + '.props', [
        makeRequiredRule(),
        {
          type: 'select',
          field: 'dictType',
          title: '字典类型',
          value: '',
          options: dictOptions.value
        },
        {
          type: 'select',
          field: 'valueType',
          title: '字典值类型',
          value: 'str',
          options: [
            { label: '数字', value: 'int' },
            { label: '字符串', value: 'str' },
            { label: '布尔值', value: 'bool' }
          ]
        },
        ...rules
      ])
    }
  }
}
