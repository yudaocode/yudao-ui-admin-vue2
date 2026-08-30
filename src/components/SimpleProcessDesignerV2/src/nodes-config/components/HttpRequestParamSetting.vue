<template>
  <div class="http-request-param-setting">
    <el-form-item label="请求头" label-position="top">
      <div v-for="(item, index) in header" :key="`header-${index}`" class="http-param-row">
        <el-input
          v-model="item.key"
          class="http-param-key"
          placeholder="参数名"
          size="small"
        />
        <el-select
          v-model="item.type"
          class="http-param-type"
          size="small"
          @change="handleTypeChange(item)"
        >
          <el-option
            v-for="type in BPM_HTTP_REQUEST_PARAM_TYPES"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        <el-input
          v-if="item.type === BpmHttpRequestParamTypeEnum.FIXED_VALUE"
          v-model="item.value"
          class="http-param-value"
          placeholder="参数值"
          size="small"
        />
        <el-select
          v-else
          v-model="item.value"
          class="http-param-value"
          filterable
          clearable
          placeholder="表单字段"
          size="small"
        >
          <el-option
            v-for="field in formFieldOptions"
            :key="field.field"
            :label="field.title"
            :value="field.field"
            :disabled="!field.required"
          />
        </el-select>
        <el-button
          type="text"
          class="http-param-delete"
          icon="el-icon-delete"
          title="删除"
          @click="deleteParam(header, index)"
        />
      </div>
      <el-button type="text" icon="el-icon-plus" @click="addParam(header)">添加一行</el-button>
    </el-form-item>

    <el-form-item label="请求体" label-position="top">
      <div v-for="(item, index) in body" :key="`body-${index}`" class="http-param-row">
        <el-input
          v-model="item.key"
          class="http-param-key"
          placeholder="参数名"
          size="small"
        />
        <el-select
          v-model="item.type"
          class="http-param-type"
          size="small"
          @change="handleTypeChange(item)"
        >
          <el-option
            v-for="type in BPM_HTTP_REQUEST_PARAM_TYPES"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        <el-input
          v-if="item.type === BpmHttpRequestParamTypeEnum.FIXED_VALUE"
          v-model="item.value"
          class="http-param-value"
          placeholder="参数值"
          size="small"
        />
        <el-select
          v-else
          v-model="item.value"
          class="http-param-value"
          filterable
          clearable
          placeholder="表单字段"
          size="small"
        >
          <el-option
            v-for="field in formFieldOptions"
            :key="field.field"
            :label="field.title"
            :value="field.field"
            :disabled="!field.required"
          />
        </el-select>
        <el-button
          type="text"
          class="http-param-delete"
          icon="el-icon-delete"
          title="删除"
          @click="deleteParam(body, index)"
        />
      </div>
      <el-button type="text" icon="el-icon-plus" @click="addParam(body)">添加一行</el-button>
    </el-form-item>
  </div>
</template>

<script>
import {
  BpmHttpRequestParamTypeEnum,
  BPM_HTTP_REQUEST_PARAM_TYPES
} from '../../consts'
import { ProcessVariableEnum } from '../../consts'

export default {
  name: 'HttpRequestParamSetting',
  props: {
    header: {
      type: Array,
      default: () => []
    },
    body: {
      type: Array,
      default: () => []
    },
    formFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      BpmHttpRequestParamTypeEnum,
      BPM_HTTP_REQUEST_PARAM_TYPES
    }
  },
  computed: {
    formFieldOptions() {
      const fields = (this.formFields || []).slice()
      // Request parameters may also reference the process initiator. The
      // Vue3 designer exposes this variable in its request-param selector,
      // while response mappings intentionally stay limited to form fields.
      if (!fields.some((field) => field.field === ProcessVariableEnum.START_USER_ID)) {
        fields.unshift({
          field: ProcessVariableEnum.START_USER_ID,
          title: '发起人',
          required: true
        })
      }
      return fields
    }
  },
  created() {
    this.ensureItemShape(this.header)
    this.ensureItemShape(this.body)
  },
  methods: {
    handleTypeChange(item) {
      const type = Number(item.type)
      this.$set(item, 'type', type === BpmHttpRequestParamTypeEnum.FROM_FORM
        ? BpmHttpRequestParamTypeEnum.FROM_FORM
        : BpmHttpRequestParamTypeEnum.FIXED_VALUE)
      this.$set(item, 'value', '')
    },
    ensureItemShape(list) {
      ;(list || []).forEach((item) => {
        if (!item || typeof item !== 'object') return
        const type = Number(item.type)
        this.$set(item, 'type', type === BpmHttpRequestParamTypeEnum.FROM_FORM
          ? BpmHttpRequestParamTypeEnum.FROM_FORM
          : BpmHttpRequestParamTypeEnum.FIXED_VALUE)
        if (item.value === undefined || item.value === null) this.$set(item, 'value', '')
        if (item.key === undefined || item.key === null) this.$set(item, 'key', '')
      })
    },
    addParam(list) {
      list.push({
        key: '',
        type: BpmHttpRequestParamTypeEnum.FIXED_VALUE,
        value: ''
      })
    },
    deleteParam(list, index) {
      list.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.http-param-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.http-param-key {
  width: 145px;
  margin-right: 8px;
}

.http-param-type {
  width: 105px;
  margin-right: 8px;
}

.http-param-value {
  flex: 1;
  min-width: 130px;
  margin-right: 4px;
}

.http-param-delete {
  padding: 4px;
  color: #f56c6c;
}
</style>
