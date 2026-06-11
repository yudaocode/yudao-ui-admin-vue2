import uniqueId from '@form-create/utils/lib/unique'
import { AreaLevelEnum } from '@/utils/constants'

function requiredRule() {
  return {
    type: 'Required',
    field: 'formCreate$required',
    title: '是否必填'
  }
}

function switchProp(field, title, value) {
  return {
    type: 'switch',
    field,
    title,
    value
  }
}

function inputProp(field, title, value, info) {
  return {
    type: 'input',
    field,
    title,
    value,
    info
  }
}

function selectProp(field, title, value, options) {
  return {
    type: 'select',
    field,
    title,
    value,
    options
  }
}

function createInputComponent({ name, label, icon, props = [], event = ['change'] }) {
  return {
    menu: 'system',
    icon,
    label,
    name,
    input: true,
    event,
    validate: ['string', 'number', 'array'],
    rule() {
      return {
        type: name,
        field: uniqueId(),
        title: label,
        info: '',
        $required: false,
        props: {}
      }
    },
    props() {
      return [
        requiredRule(),
        ...props,
        switchProp('disabled', '是否禁用', false),
        inputProp('placeholder', '占位符', '')
      ]
    }
  }
}

function createUserSelectRule() {
  return createInputComponent({
    name: 'UserSelect',
    label: '用户选择器',
    icon: 'icon-user-o',
    props: [
      switchProp('multiple', '是否多选', false),
      switchProp('defaultCurrentUser', '默认选中当前用户', false),
      switchProp('clearable', '是否可清空', true)
    ],
    event: ['change', 'visibleChange', 'clear', 'blur', 'focus']
  })
}

function createDeptSelectRule() {
  return createInputComponent({
    name: 'DeptSelect',
    label: '部门选择器',
    icon: 'icon-address-card-o',
    props: [
      switchProp('multiple', '是否多选', false),
      selectProp('returnType', '返回值类型', 'id', [
        { label: '部门编号', value: 'id' },
        { label: '部门名称', value: 'name' }
      ]),
      switchProp('defaultCurrentDept', '默认选中当前部门', false)
    ]
  })
}

function createDictSelectRule() {
  return createInputComponent({
    name: 'DictSelect',
    label: '字典选择器',
    icon: 'icon-doc-text',
    props: [
      inputProp('dictType', '字典类型', ''),
      selectProp('valueType', '字典值类型', 'str', [
        { label: '数字', value: 'int' },
        { label: '字符串', value: 'str' },
        { label: '布尔值', value: 'bool' }
      ]),
      selectProp('selectType', '选择器类型', 'select', [
        { label: '下拉框', value: 'select' },
        { label: '单选框', value: 'radio' },
        { label: '多选框', value: 'checkbox' }
      ])
    ]
  })
}

function createApiSelectRule() {
  return createInputComponent({
    name: 'ApiSelect',
    label: '接口选择器',
    icon: 'icon-server',
    props: [
      inputProp('url', '接口地址', ''),
      selectProp('method', '请求方式', 'GET', [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' }
      ]),
      inputProp('labelField', '标签字段', 'label'),
      inputProp('valueField', '值字段', 'value'),
      inputProp('data', '请求参数 JSON', ''),
      inputProp('parseFunc', '解析函数', ''),
      selectProp('selectType', '选择器类型', 'select', [
        { label: '下拉框', value: 'select' },
        { label: '单选框', value: 'radio' },
        { label: '多选框', value: 'checkbox' }
      ]),
      switchProp('multiple', '是否多选', false),
      switchProp('remote', '是否远程搜索', false),
      inputProp('remoteField', '远程搜索字段', 'label'),
      selectProp('returnType', '返回值类型', 'id', [
        { label: '编号/值', value: 'id' },
        { label: '名称/标签', value: 'name' }
      ])
    ],
    event: ['change', 'visibleChange', 'clear', 'blur', 'focus']
  })
}

function createAreaSelectRule() {
  return {
    menu: 'main',
    icon: 'icon-location',
    label: '省市区选择器',
    name: 'AreaSelect',
    input: true,
    event: ['change', 'blur', 'focus', 'visibleChange', 'removeTag'],
    validate: ['array'],
    rule() {
      return {
        type: 'AreaSelect',
        field: uniqueId(),
        title: '省市区选择器',
        info: '',
        $required: false,
        props: {}
      }
    },
    props() {
      return [
        requiredRule(),
        selectProp('level', '选择层级', AreaLevelEnum.DISTRICT, [
          { label: '省', value: AreaLevelEnum.PROVINCE },
          { label: '省/市', value: AreaLevelEnum.CITY },
          { label: '省/市/区', value: AreaLevelEnum.DISTRICT }
        ]),
        inputProp('placeholder', '占位符', '请选择省市区'),
        switchProp('clearable', '是否可清空', true),
        switchProp('showAllLevels', '显示完整路径', true),
        inputProp('separator', '分隔符', '/', '选项分隔符'),
        switchProp('disabled', '是否禁用', false)
      ]
    }
  }
}

function createIframeRule() {
  return {
    menu: 'main',
    icon: 'icon-link',
    label: '网页 iframe',
    name: 'IframeComponent',
    input: true,
    validate: ['string', 'url'],
    rule() {
      return {
        type: 'IframeComponent',
        field: uniqueId(),
        title: '网页 iframe',
        info: '',
        $required: false,
        props: {
          height: '500px',
          width: '100%'
        }
      }
    },
    props() {
      return [
        requiredRule(),
        inputProp('url', 'URL 地址', '', '请输入完整的 HTTP 或 HTTPS 地址'),
        inputProp('height', 'iframe 高度', '500px'),
        inputProp('width', 'iframe 宽度', '100%'),
        switchProp('allowfullscreen', '允许全屏', true),
        inputProp('sandbox', 'sandbox 属性', '')
      ]
    }
  }
}

function addSystemMenu(designer, components) {
  if (!designer || !designer.addMenu || !designer.addComponent) {
    return
  }
  designer.addMenu({
    name: 'system',
    title: '系统字段',
    list: []
  })
  components.forEach((component) => designer.addComponent(component))
}

function fixDuplicateFields(designer) {
  if (!designer || !designer.getRule || !designer.setRule) {
    return false
  }
  const rules = designer.getRule() || []
  const fields = new Set()
  let changed = false
  const visit = (items = []) => {
    items.forEach((rule) => {
      if (rule.field) {
        if (fields.has(rule.field)) {
          rule.field = uniqueId()
          changed = true
        } else {
          fields.add(rule.field)
        }
      }
      if (rule.children) {
        visit(rule.children)
      }
    })
  }
  visit(rules)
  if (changed) {
    designer.setRule(rules)
  }
  return changed
}

export function useFormCreateDesigner(designer) {
  if (!designer || designer.__yudaoFormCreateEnhanced) {
    return
  }
  designer.__yudaoFormCreateEnhanced = true
  if (designer.removeMenuItem) {
    designer.removeMenuItem('upload')
    designer.removeMenuItem('fcEditor')
  }
  const systemComponents = [
    createUserSelectRule(),
    createDeptSelectRule(),
    createDictSelectRule(),
    createApiSelectRule()
  ]
  addSystemMenu(designer, systemComponents)
  if (designer.addComponent) {
    designer.addComponent([
      createAreaSelectRule(),
      createIframeRule()
    ])
  }
  fixDuplicateFields(designer)
}
