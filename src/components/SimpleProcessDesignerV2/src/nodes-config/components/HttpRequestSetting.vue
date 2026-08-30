<template>
  <div class="http-request-setting">
    <el-alert
      title="仅支持 POST 请求，以请求体方式接收参数"
      type="warning"
      show-icon
      :closable="false"
      class="http-request-alert"
    />
    <el-form-item
      label="请求地址"
      label-position="top"
      :prop="`${formItemPrefix}.url`"
      :rules="urlRules"
    >
      <el-input v-model="setting.url" placeholder="https://example.com/webhook" />
    </el-form-item>
    <HttpRequestParamSetting
      :header="setting.header"
      :body="setting.body"
      :form-fields="formFields"
    />
    <template v-if="responseEnable">
      <el-form-item label="返回值" label-position="top">
        <el-alert
          title="通过请求返回值，可以修改流程表单的值"
          type="warning"
          show-icon
          :closable="false"
        />
      </el-form-item>
      <el-form-item label="返回值映射" label-position="top">
        <div v-for="(item, index) in setting.response" :key="`response-${index}`" class="http-response-row">
          <el-select
            v-model="item.key"
            class="http-response-field"
            filterable
            clearable
            placeholder="表单字段"
          >
            <el-option
              v-for="field in formFields"
              :key="field.field"
              :label="field.title"
              :value="field.field"
              :disabled="!field.required"
            />
          </el-select>
          <el-input
            v-model="item.value"
            class="http-response-value"
            placeholder="响应字段"
          />
          <el-button
            type="text"
            class="http-param-delete"
            icon="el-icon-delete"
            title="删除"
            @click="deleteResponse(index)"
          />
        </div>
        <el-button type="text" icon="el-icon-plus" @click="addResponse">添加一行</el-button>
      </el-form-item>
    </template>
  </div>
</template>

<script>
import HttpRequestParamSetting from './HttpRequestParamSetting.vue'

export default {
  name: 'HttpRequestSetting',
  components: { HttpRequestParamSetting },
  props: {
    setting: {
      type: Object,
      required: true
    },
    responseEnable: {
      type: Boolean,
      default: false
    },
    formItemPrefix: {
      type: String,
      default: 'setting'
    },
    formFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      urlRules: [
        { required: true, message: '请求地址不能为空', trigger: 'blur' },
        { type: 'url', message: '请求地址格式不正确', trigger: 'blur' }
      ]
    }
  },
  created() {
    this.ensureSettingShape()
  },
  watch: {
    setting: {
      deep: true,
      handler() {
        this.ensureSettingShape()
      }
    }
  },
  methods: {
    ensureSettingShape() {
      if (!Array.isArray(this.setting.header)) this.$set(this.setting, 'header', [])
      if (!Array.isArray(this.setting.body)) this.$set(this.setting, 'body', [])
      if (this.responseEnable && !Array.isArray(this.setting.response)) {
        this.$set(this.setting, 'response', [])
      }
      this.normalizeResponseItems()
    },
    normalizeResponseItems() {
      if (!Array.isArray(this.setting.response)) return
      this.setting.response.forEach((item) => {
        if (!item || typeof item !== 'object') return
        if (item.key === undefined || item.key === null) this.$set(item, 'key', '')
        if (item.value === undefined || item.value === null) this.$set(item, 'value', '')
      })
    },
    addResponse() {
      if (!Array.isArray(this.setting.response)) this.$set(this.setting, 'response', [])
      this.setting.response.push({ key: '', value: '' })
    },
    deleteResponse(index) {
      if (Array.isArray(this.setting.response)) this.setting.response.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.http-request-alert {
  margin-bottom: 12px;
}

.http-response-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.http-response-field {
  width: 190px;
  margin-right: 8px;
}

.http-response-value {
  flex: 1;
  margin-right: 4px;
}

.http-param-delete {
  padding: 4px;
  color: #f56c6c;
}
</style>
