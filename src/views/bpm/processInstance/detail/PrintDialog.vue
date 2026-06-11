<template>
  <el-dialog title="打印预览" :visible.sync="visible" width="900px" append-to-body>
    <div id="processInstancePrintContent" v-loading="loading" class="print-content">
      <div v-if="legacyHtml" v-html="legacyHtml" />
      <pre v-else-if="legacyText">{{ legacyText }}</pre>
      <div v-else-if="printData.processInstance">
        <div v-if="printData.printTemplateEnable" v-html="printTemplateHtml" />
        <div v-else>
          <h2 class="print-title">{{ printData.processInstance.name }}</h2>
          <div class="print-right">打印人员: {{ userName }}</div>
          <div class="print-meta">
            <span>流程编号: {{ printData.processInstance.id }}</span>
            <span>打印时间: {{ printTime }}</span>
          </div>
          <table class="print-table" border="1">
            <tbody>
              <tr>
                <td class="print-label">发起人</td>
                <td>{{ startUser.nickname || startUser.name || '' }}</td>
                <td class="print-label">发起时间</td>
                <td>{{ formatPrintDate(printData.processInstance.startTime) }}</td>
              </tr>
              <tr>
                <td class="print-label">所属部门</td>
                <td>{{ startUser.deptName || '' }}</td>
                <td class="print-label">流程状态</td>
                <td>{{ processStatusLabel }}</td>
              </tr>
              <tr>
                <td class="print-section" colspan="4">
                  <h4>表单内容</h4>
                </td>
              </tr>
              <tr v-for="item in formFields" :key="item.id">
                <td class="print-label">{{ item.name }}</td>
                <td colspan="3">
                  <div v-html="item.html" />
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="BusinessFormComponent && formFields.length === 0" class="business-form-print">
            <component
              :is="BusinessFormComponent"
              :id="printData.processInstance.businessKey"
              :readonly="true"
              :print-mode="true"
            />
          </div>

          <table class="print-table" border="1">
            <tbody>
              <tr>
                <td class="print-section" colspan="4">
                  <h4>流程节点</h4>
                </td>
              </tr>
              <tr v-for="item in printData.tasks || []" :key="item.id">
                <td class="print-label">{{ item.name }}</td>
                <td colspan="3">
                  {{ item.description }}
                  <div v-if="item.signPicUrl">
                    <img class="sign-pic" :src="item.signPicUrl" alt="" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" icon="el-icon-printer" @click="handlePrint">打 印</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProcessInstancePrintData } from '@/api/bpm/processInstance'
import { getAreaTree } from '@/api/system/area'
import { listSimpleDepts } from '@/api/system/dept'
import { listSimpleUsers } from '@/api/system/user'
import { DICT_TYPE, getDictDataLabel, getDictDatas } from '@/utils/dict'
import { decodeFields } from '@/utils/formCreate'
import { formatDate } from '@/utils'

export default {
  name: 'PrintDialog',
  data() {
    return {
      visible: false,
      loading: false,
      printData: {},
      printTime: '',
      formFields: [],
      printDataMap: {},
      legacyHtml: '',
      legacyText: '',
      BusinessFormComponent: null
    }
  },
  computed: {
    userName() {
      return this.$store.getters.nickname || this.$store.getters.name || ''
    },
    startUser() {
      return (this.printData.processInstance && this.printData.processInstance.startUser) || {}
    },
    processStatusLabel() {
      if (!this.printData.processInstance) {
        return ''
      }
      return getDictDataLabel(
        DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS,
        this.printData.processInstance.status
      )
    },
    printTemplateHtml() {
      return this.getPrintTemplateHTML()
    }
  },
  methods: {
    async open(processInstanceId) {
      this.visible = true
      this.loading = true
      this.printData = {}
      this.formFields = []
      this.printDataMap = {}
      this.legacyHtml = ''
      this.legacyText = ''
      this.BusinessFormComponent = null
      try {
        const response = await getProcessInstancePrintData(processInstanceId)
        const data = response.data
        if (typeof data === 'string') {
          this.legacyHtml = data
          return
        }
        if (data && data.html) {
          this.legacyHtml = data.html
          return
        }
        if (!data || !data.processInstance) {
          this.legacyText = JSON.stringify(data || {}, null, 2)
          return
        }
        this.printData = data
        this.printTime = formatDate(new Date()).slice(0, 16)
        this.initPrintDataMap()
        await this.parseFormFields()
        this.initBusinessFormComponent()
      } finally {
        this.loading = false
      }
    },
    initBusinessFormComponent() {
      const processDefinition = this.printData.processInstance &&
        this.printData.processInstance.processDefinition
      const businessFormPath = processDefinition && processDefinition.formCustomViewPath
      this.BusinessFormComponent = businessFormPath ? this.loadBusinessComponent(businessFormPath) : null
    },
    loadBusinessComponent(path) {
      const normalized = String(path || '')
        .replace(/^\/+/, '')
        .replace(/^src\/views\//, '')
        .replace(/^views\//, '')
      if (!normalized) {
        return null
      }
      return (resolve) => {
        try {
          require([`@/views/${normalized}`], resolve)
        } catch (e) {
          resolve({
            render: (h) => h('el-alert', {
              props: {
                type: 'warning',
                title: '业务表单组件加载失败',
                closable: false
              }
            })
          })
        }
      }
    },
    async parseFormFields() {
      const processDefinition = this.printData.processInstance &&
        this.printData.processInstance.processDefinition
      const formFieldsObj = decodeFields((processDefinition && processDefinition.formFields) || [])
      const processVariables = this.printData.processInstance.formVariables || {}
      const lookupMaps = await this.loadPrintLookupMaps(formFieldsObj)
      const result = []
      formFieldsObj.forEach((item) => {
        const fieldKey = String(item.field || '')
        if (!fieldKey) {
          return
        }
        const name = String(item.title || fieldKey)
        const html = this.formatPrintField(item, processVariables[fieldKey], lookupMaps)
        this.$set(this.printDataMap, fieldKey, html)
        result.push({
          id: fieldKey,
          name,
          html
        })
      })
      this.formFields = result
    },
    async loadPrintLookupMaps(formFieldsObj) {
      const hasAreaSelect = formFieldsObj.some((item) => item.type === 'AreaSelect')
      const hasUserSelect = formFieldsObj.some((item) => item.type === 'UserSelect')
      const hasDeptSelect = formFieldsObj.some((item) => item.type === 'DeptSelect')
      const [areaResp, userResp, deptResp] = await Promise.all([
        hasAreaSelect ? getAreaTree() : Promise.resolve({ data: [] }),
        hasUserSelect ? listSimpleUsers() : Promise.resolve({ data: [] }),
        hasDeptSelect ? listSimpleDepts() : Promise.resolve({ data: [] })
      ])
      const userList = userResp.data || []
      const deptList = deptResp.data || []
      return {
        areaMap: this.flattenAreaTree(areaResp.data || []),
        deptMap: new Map(deptList.map((item) => [String(item.id), item.name])),
        userMap: new Map(userList.map((item) => [String(item.id), item.nickname || item.username || item.name]))
      }
    },
    getRuleProp(rule, key) {
      return rule && (rule[key] !== undefined ? rule[key] : rule.props && rule.props[key])
    },
    isRecord(value) {
      return typeof value === 'object' && value !== null
    },
    isEmptyValue(value) {
      return value === undefined || value === null || value === ''
    },
    isNotEmptyString(value) {
      return String(value || '').length > 0
    },
    toValueArray(value) {
      if (Array.isArray(value)) {
        return value
      }
      if (this.isEmptyValue(value)) {
        return []
      }
      return [value]
    },
    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    formatPrintDate(value) {
      if (this.isEmptyValue(value)) {
        return ''
      }
      const formatted = formatDate(value)
      return formatted === 'Invalid Date' ? this.escapeHtml(value) : formatted
    },
    formatDateValue(value) {
      if (Array.isArray(value)) {
        return value.map((item) => this.formatPrintDate(item)).join(' ~ ')
      }
      return this.formatPrintDate(value)
    },
    formatPrimitiveValue(value) {
      if (this.isEmptyValue(value)) {
        return ''
      }
      if (Array.isArray(value)) {
        return value
          .map((item) => this.formatPrimitiveValue(item))
          .filter((item) => this.isNotEmptyString(item))
          .join(', ')
      }
      if (typeof value === 'boolean') {
        return value ? '是' : '否'
      }
      if (this.isRecord(value)) {
        const displayValue = value.label || value.name || value.url || value.value || JSON.stringify(value)
        return this.escapeHtml(displayValue)
      }
      return this.escapeHtml(value)
    },
    createImageHtml(url) {
      const imgEl = document.createElement('img')
      imgEl.setAttribute('src', url)
      imgEl.setAttribute('style', 'max-width: 600px; max-height: 300px;')
      return imgEl.outerHTML
    },
    renderImageListHtml(value) {
      return this.toValueArray(value)
        .map((item) => {
          let url
          if (typeof item === 'string') {
            url = item
          } else if (this.isRecord(item)) {
            url = item.url ? String(item.url) : undefined
          }
          return url ? this.createImageHtml(url) : ''
        })
        .filter((item) => this.isNotEmptyString(item))
        .join('<br/>')
    },
    createFileLinkHtml(file) {
      const record = this.isRecord(file) ? file : null
      const url = typeof file === 'string' ? file : String((record && record.url) || '')
      if (!url) {
        return ''
      }
      const linkEl = document.createElement('a')
      linkEl.setAttribute('href', url)
      linkEl.setAttribute('target', '_blank')
      linkEl.setAttribute('rel', 'noopener noreferrer')
      const fallbackName = url.slice(Math.max(0, url.lastIndexOf('/') + 1)) || url
      linkEl.textContent = record && record.name ? String(record.name) : fallbackName
      return linkEl.outerHTML
    },
    renderFileListHtml(value) {
      return this.toValueArray(value)
        .map((item) => this.createFileLinkHtml(item))
        .filter((item) => this.isNotEmptyString(item))
        .join('<br/>')
    },
    mapValuesWithOptions(value, options) {
      const values = this.toValueArray(value)
      return values
        .map((item) => {
          const matched = (options || []).find((option) =>
            option && (option.value === item || String(option.value || '') === String(item))
          )
          return this.escapeHtml(matched ? matched.label : String(item))
        })
        .filter((item) => this.isNotEmptyString(item))
        .join(', ')
    },
    flattenAreaTree(list, map = new Map()) {
      ;(list || []).forEach((item) => {
        if (item.id !== undefined) {
          map.set(String(item.id), item.name)
        }
        if (Array.isArray(item.children) && item.children.length > 0) {
          this.flattenAreaTree(item.children, map)
        }
      })
      return map
    },
    mapValueWithLabelMap(value, labelMap, separator = ', ') {
      const values = this.toValueArray(value)
      const labels = values
        .map((item) => this.escapeHtml(labelMap.get(String(item)) || String(item)))
        .filter((item) => this.isNotEmptyString(item))
      return labels.length > 0 ? labels.join(this.escapeHtml(separator)) : this.formatPrimitiveValue(values)
    },
    getTypedDictOptions(dictType, valueType) {
      const options = getDictDatas(dictType)
      if (valueType === 'bool' || valueType === 'boolean') {
        return options.map((item) => ({ ...item, value: item.value === 'true' || item.value === true }))
      }
      if (valueType === 'int' || valueType === 'number') {
        return options.map((item) => ({ ...item, value: Number(item.value) }))
      }
      return options
    },
    formatPrintField(rule, value, lookupMaps) {
      const type = String(rule.type || '')
      switch (type) {
        case 'AreaSelect':
          return this.mapValueWithLabelMap(value, lookupMaps.areaMap, String(this.getRuleProp(rule, 'separator') || '/'))
        case 'cascader':
        case 'checkbox':
        case 'radio':
        case 'select':
        case 'treeSelect': {
          const options = this.getRuleProp(rule, 'options')
          return Array.isArray(options) && options.length > 0
            ? this.mapValuesWithOptions(value, options)
            : this.formatPrimitiveValue(value)
        }
        case 'date':
        case 'DatePicker':
        case 'datePicker':
        case 'daterange':
        case 'datetime':
        case 'datetimerange':
        case 'month':
        case 'monthrange':
        case 'RangePicker':
        case 'rangePicker':
        case 'TimePicker':
        case 'timePicker':
        case 'TimeRangePicker':
        case 'timeRangePicker':
          return this.formatDateValue(value)
        case 'DeptSelect':
          return String(this.getRuleProp(rule, 'returnType')) === 'name'
            ? this.formatPrimitiveValue(value)
            : this.mapValueWithLabelMap(value, lookupMaps.deptMap)
        case 'DictSelect': {
          const dictType = this.getRuleProp(rule, 'dictType')
          return typeof dictType === 'string' && dictType
            ? this.mapValuesWithOptions(value, this.getTypedDictOptions(dictType, String(this.getRuleProp(rule, 'valueType') || '')))
            : this.formatPrimitiveValue(value)
        }
        case 'FileUpload':
        case 'UploadFile':
          return this.renderFileListHtml(value)
        case 'IframeComponent': {
          const propsUrl = rule.props && rule.props.url ? String(rule.props.url) : ''
          const iframeUrl = this.isEmptyValue(value) ? propsUrl : String(value || '')
          return iframeUrl ? this.createFileLinkHtml(iframeUrl) : ''
        }
        case 'ImagesUpload':
        case 'ImageUpload':
        case 'UploadImg':
        case 'UploadImgs':
          return this.renderImageListHtml(value)
        case 'switch': {
          if (this.isEmptyValue(value)) return '否'
          const checkedVal = this.getRuleProp(rule, 'checkedValue') || this.getRuleProp(rule, 'activeValue')
          const isChecked = checkedVal !== undefined && checkedVal !== null ? value === checkedVal : Boolean(value)
          return isChecked ? '是' : '否'
        }
        case 'Editor':
        case 'Tinymce':
          return this.isEmptyValue(value) ? '' : String(value)
        case 'UserSelect':
          return String(this.getRuleProp(rule, 'returnType')) === 'name'
            ? this.formatPrimitiveValue(value)
            : this.mapValueWithLabelMap(value, lookupMaps.userMap)
        default:
          return this.formatPrimitiveValue(value)
      }
    },
    initPrintDataMap() {
      if (!this.printData.processInstance) {
        return
      }
      const processInstance = this.printData.processInstance
      const startUser = processInstance.startUser || {}
      this.$set(this.printDataMap, 'startUser', startUser.nickname || startUser.name || '')
      this.$set(this.printDataMap, 'startUserDept', startUser.deptName || '')
      this.$set(this.printDataMap, 'processName', processInstance.name || '')
      this.$set(this.printDataMap, 'processNum', String(processInstance.id || ''))
      this.$set(this.printDataMap, 'startTime', this.formatPrintDate(processInstance.startTime))
      this.$set(this.printDataMap, 'endTime', this.formatPrintDate(processInstance.endTime))
      this.$set(this.printDataMap, 'processStatus', this.processStatusLabel)
      this.$set(this.printDataMap, 'printUser', this.userName)
      this.$set(this.printDataMap, 'printTime', this.printTime)
    },
    getPrintTemplateHTML() {
      if (!this.printData.printTemplateHtml) {
        return ''
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(this.printData.printTemplateHtml, 'text/html')
      const tables = doc.querySelectorAll('table')
      tables.forEach((item) => {
        item.setAttribute('border', '1')
        item.setAttribute('style', (item.getAttribute('style') || '') + 'border-collapse:collapse;')
      })
      const mentions = doc.querySelectorAll('[data-w-e-type="mention"]')
      mentions.forEach((item) => {
        let mentionId = ''
        try {
          mentionId = JSON.parse(decodeURIComponent(item.getAttribute('data-info') || '{}')).id
        } catch (e) {
          mentionId = ''
        }
        item.innerHTML = this.printDataMap[mentionId] || ''
      })
      const processRecords = doc.querySelectorAll('[data-w-e-type="process-record"]')
      const processRecordTable = document.createElement('table')
      if (processRecords.length > 0) {
        processRecordTable.setAttribute('border', '1')
        processRecordTable.setAttribute('style', 'width:100%;border-collapse:collapse;')
        const headTr = document.createElement('tr')
        const headTd = document.createElement('td')
        headTd.setAttribute('colspan', '2')
        headTd.setAttribute('style', 'text-align: center;')
        headTd.textContent = '流程节点'
        headTr.appendChild(headTd)
        processRecordTable.appendChild(headTr)
        ;(this.printData.tasks || []).forEach((task) => {
          const tr = document.createElement('tr')
          const td1 = document.createElement('td')
          td1.textContent = task.name
          const td2 = document.createElement('td')
          td2.textContent = task.description
          tr.appendChild(td1)
          tr.appendChild(td2)
          processRecordTable.appendChild(tr)
        })
      }
      processRecords.forEach((item) => {
        item.innerHTML = processRecordTable.outerHTML
      })
      return doc.body.innerHTML
    },
    handlePrint() {
      const contentEl = this.$el.querySelector('#processInstancePrintContent')
      if (!contentEl) {
        window.print()
        return
      }
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        window.print()
        return
      }
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>打印预览</title>
            <style>
              body { font-family: Arial, "Microsoft YaHei", sans-serif; color: #303133; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td { padding: 5px; vertical-align: top; }
              img { max-width: 600px; max-height: 300px; }
              @page { size: auto; margin: 12mm; }
              body, html, div { height: auto !important; }
            </style>
          </head>
          <body>${contentEl.innerHTML}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 300)
    }
  }
}
</script>

<style scoped>
.print-content {
  min-height: 360px;
  max-height: 70vh;
  overflow: auto;
  word-break: break-all;
}

.print-title {
  text-align: center;
}

.print-right {
  text-align: right;
  font-size: 15px;
}

.print-meta {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
}

.print-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

.print-table td {
  padding: 5px;
  vertical-align: top;
}

.print-label {
  width: 20%;
}

.print-section {
  text-align: center;
}

.business-form-print {
  margin-top: 20px;
}

.sign-pic {
  width: 90px;
  height: 40px;
}
</style>

<style>
@media print {
  @page {
    size: auto;
  }

  body,
  html,
  div {
    height: auto !important;
  }
}
</style>
