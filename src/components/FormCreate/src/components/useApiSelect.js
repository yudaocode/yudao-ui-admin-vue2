import request from '@/utils/request'
import { isEmpty } from '@/utils/is'
import store from '@/store'

function parseJson(value) {
  if (!value) {
    return {}
  }
  if (typeof value === 'object') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (e) {
    return {}
  }
}

function parseExpression(data, template) {
  if (!template || template.indexOf('${') === -1) {
    return data[template]
  }
  return template.replace(/\$\{([^}]*)}/g, (_, expr) => {
    return data[String(expr).trim()]
  })
}

function parseFunc(funcText) {
  if (!funcText) {
    return null
  }
  try {
    // Compatible with Vue3 form-create parseFunc string.
    return new Function(`return ${funcText}`)()
  } catch (e) {
    return null
  }
}

export function createApiSelect(option) {
  return {
    name: option.name,
    props: {
      value: [String, Number, Boolean, Array, Object],
      labelField: {
        type: String,
        default: () => option.labelField || 'label'
      },
      valueField: {
        type: String,
        default: () => option.valueField || 'value'
      },
      url: {
        type: String,
        default: () => option.url || ''
      },
      method: {
        type: String,
        default: 'GET'
      },
      parseFunc: {
        type: String,
        default: ''
      },
      data: {
        type: [String, Object],
        default: ''
      },
      selectType: {
        type: String,
        default: 'select'
      },
      multiple: {
        type: Boolean,
        default: false
      },
      remote: {
        type: Boolean,
        default: false
      },
      remoteField: {
        type: String,
        default: 'label'
      },
      returnType: {
        type: String,
        default: 'id'
      },
      defaultCurrentUser: {
        type: Boolean,
        default: false
      },
      disabled: Boolean,
      clearable: {
        type: Boolean,
        default: true
      },
      placeholder: {
        type: String,
        default: '请选择'
      }
    },
    data() {
      return {
        options: [],
        loading: false,
        queryParam: undefined
      }
    },
    computed: {
      selectedValue: {
        get() {
          return this.value
        },
        set(value) {
          this.$emit('input', value)
        }
      }
    },
    mounted() {
      this.getOptions().then(() => {
        this.setDefaultCurrentUser()
      })
    },
    methods: {
      hasValidPresetValue() {
        if (this.value === undefined || this.value === null || this.value === '') {
          return false
        }
        return Array.isArray(this.value) ? this.value.length > 0 : true
      },
      setDefaultCurrentUser() {
        if (option.name !== 'UserSelect' || !this.defaultCurrentUser || this.hasValidPresetValue()) {
          return
        }
        const currentUserId = store.getters && store.getters.userId
        if (currentUserId) {
          this.selectedValue = this.multiple ? [currentUserId] : currentUserId
        }
      },
      async getOptions() {
        this.options = []
        if (isEmpty(this.url)) {
          return
        }
        if (String(this.method).toUpperCase() === 'POST') {
          const data = parseJson(this.data)
          if (this.remote) {
            data[this.remoteField] = this.queryParam
          }
          const response = await request({
            url: this.url,
            method: 'post',
            data
          })
          this.parseOptions(response.data !== undefined ? response.data : response)
        } else {
          let url = this.url
          if (this.remote && this.queryParam !== undefined) {
            url += `${url.includes('?') ? '&' : '?'}${this.remoteField}=${encodeURIComponent(this.queryParam)}`
          }
          const response = await request({
            url,
            method: 'get'
          })
          this.parseOptions(response.data !== undefined ? response.data : response)
        }
      },
      parseOptions(data) {
        const customParse = parseFunc(this.parseFunc)
        if (customParse) {
          this.options = customParse(data) || []
          return
        }
        if (Array.isArray(data)) {
          this.parseOptionsList(data)
          return
        }
        if (data && Array.isArray(data.list)) {
          this.parseOptionsList(data.list)
        }
      },
      parseOptionsList(data) {
        this.options = data.map((item) => {
          const label = parseExpression(item, this.labelField)
          let value = parseExpression(item, this.valueField)
          if (this.returnType === 'name') {
            value = label
          }
          return { label, value }
        })
      },
      async remoteMethod(query) {
        if (!query) {
          return
        }
        this.loading = true
        try {
          this.queryParam = query
          await this.getOptions()
        } finally {
          this.loading = false
        }
      },
      renderOption(h, item, index) {
        return h('el-option', {
          key: index,
          props: {
            label: item.label,
            value: item.value
          }
        })
      },
      renderSelect(h) {
        return h('el-select', {
          class: 'form-create-select',
          props: {
            value: this.selectedValue,
            multiple: this.multiple,
            loading: this.loading,
            remote: this.remote,
            remoteMethod: this.remote ? this.remoteMethod : undefined,
            filterable: this.remote || this.$attrs.filterable,
            disabled: this.disabled,
            clearable: this.clearable,
            placeholder: this.placeholder
          },
          attrs: this.$attrs,
          on: {
            input: (value) => {
              this.selectedValue = value
            },
            change: (value) => this.$emit('change', value),
            clear: () => this.$emit('clear'),
            blur: (event) => this.$emit('blur', event),
            focus: (event) => this.$emit('focus', event),
            'visible-change': (value) => this.$emit('visible-change', value)
          }
        }, this.options.map((item, index) => this.renderOption(h, item, index)))
      },
      renderCheckbox(h) {
        const options = this.options.length ? this.options : [
          { label: '选项1', value: '选项1' },
          { label: '选项2', value: '选项2' }
        ]
        return h('el-checkbox-group', {
          class: 'form-create-select',
          props: {
            value: this.selectedValue,
            disabled: this.disabled
          },
          on: {
            input: (value) => {
              this.selectedValue = value
            },
            change: (value) => this.$emit('change', value)
          }
        }, options.map((item, index) => h('el-checkbox', {
          key: index,
          props: {
            label: item.value
          }
        }, item.label)))
      },
      renderRadio(h) {
        const options = this.options.length ? this.options : [
          { label: '选项1', value: '选项1' },
          { label: '选项2', value: '选项2' }
        ]
        return h('el-radio-group', {
          class: 'form-create-select',
          props: {
            value: this.selectedValue,
            disabled: this.disabled
          },
          on: {
            input: (value) => {
              this.selectedValue = value
            },
            change: (value) => this.$emit('change', value)
          }
        }, options.map((item, index) => h('el-radio', {
          key: index,
          props: {
            label: item.value
          }
        }, item.label)))
      }
    },
    render(h) {
      if (this.selectType === 'checkbox') {
        return this.renderCheckbox(h)
      }
      if (this.selectType === 'radio') {
        return this.renderRadio(h)
      }
      return this.renderSelect(h)
    }
  }
}
