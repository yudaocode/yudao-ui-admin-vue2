<template>
  <el-form ref="form" :model="modelData" label-width="140px" class="model-step-form">
    <el-form-item label="提交人权限">
      <el-checkbox v-model="modelData.allowCancelRunningProcess">允许撤销审批中的申请</el-checkbox>
    </el-form-item>
    <el-form-item label="审批人权限">
      <el-checkbox v-model="modelData.allowWithdrawTask">允许审批人撤回任务</el-checkbox>
    </el-form-item>
    <el-form-item label="流程编码">
      <el-input v-model="modelData.processIdRule.prefix" placeholder="前缀" style="width: 120px">
        <el-checkbox slot="prepend" v-model="modelData.processIdRule.enable" />
      </el-input>
      <el-select
        v-model="modelData.processIdRule.infix"
        :disabled="!modelData.processIdRule.enable"
        placeholder="中缀"
        style="width: 140px; margin-left: 6px"
      >
        <el-option label="无" value="" />
        <el-option label="精确到日" value="DAY" />
        <el-option label="精确到时" value="HOUR" />
        <el-option label="精确到分" value="MINUTE" />
        <el-option label="精确到秒" value="SECOND" />
      </el-select>
      <el-input
        v-model="modelData.processIdRule.postfix"
        :disabled="!modelData.processIdRule.enable"
        placeholder="后缀"
        style="width: 100px; margin-left: 6px"
      />
      <el-input-number
        v-model="modelData.processIdRule.length"
        :min="5"
        :disabled="!modelData.processIdRule.enable"
        style="width: 120px; margin-left: 6px"
      />
      <div v-if="modelData.processIdRule.enable" class="setting-tip">示例：{{ numberExample }}</div>
    </el-form-item>
    <el-form-item label="自动去重">
      <el-radio-group v-model="modelData.autoApprovalType">
        <el-radio :label="BpmAutoApproveType.NONE">不自动通过</el-radio>
        <el-radio :label="BpmAutoApproveType.APPROVE_ALL">仅审批一次</el-radio>
        <el-radio :label="BpmAutoApproveType.APPROVE_SEQUENTIAL">仅连续节点自动通过</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="标题设置">
      <el-switch v-model="modelData.titleSetting.enable" />
      <el-input
        v-if="modelData.titleSetting.enable"
        v-model="modelData.titleSetting.title"
        type="textarea"
        :rows="2"
        placeholder="可填写固定文本或表单字段占位符"
        style="margin-top: 8px"
      />
    </el-form-item>
    <el-form-item label="摘要设置">
      <el-switch v-model="modelData.summarySetting.enable" />
      <el-select
        v-if="modelData.summarySetting.enable"
        v-model="modelData.summarySetting.summary"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请输入或选择摘要字段"
        style="width: 100%; margin-top: 8px"
      />
    </el-form-item>
    <el-form-item label="打印模板">
      <el-switch v-model="modelData.printTemplateSetting.enable" />
      <el-button
        v-if="modelData.printTemplateSetting.enable"
        type="text"
        icon="el-icon-edit"
        style="margin-left: 12px"
        @click="printTemplateVisible = true"
      >
        编辑模板
      </el-button>
    </el-form-item>

    <el-dialog title="自定义打印模板" :visible.sync="printTemplateVisible" width="760px" append-to-body>
      <el-input
        v-model="modelData.printTemplateSetting.template"
        type="textarea"
        :rows="18"
        placeholder="请输入 HTML 打印模板，可使用表单字段占位符"
      />
      <div slot="footer">
        <el-button @click="printTemplateVisible = false">取 消</el-button>
        <el-button type="primary" @click="printTemplateVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </el-form>
</template>

<script>
import { BpmAutoApproveType } from '@/utils/constants'

function pad(value) {
  return String(value).padStart(2, '0')
}

export default {
  name: 'BpmModelExtraSettings',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BpmAutoApproveType,
      printTemplateVisible: false
    }
  },
  computed: {
    modelData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    numberExample() {
      const rule = this.modelData.processIdRule
      if (!rule || !rule.enable) {
        return ''
      }
      const date = new Date()
      const parts = {
        DAY: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
        HOUR: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}`,
        MINUTE: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`,
        SECOND: `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
      }
      const infix = parts[rule.infix] || ''
      return `${rule.prefix || ''}${infix}${rule.postfix || ''}${'1'.padStart((rule.length || 5) - 1, '0')}`
    }
  },
  methods: {
    validate() {
      return Promise.resolve()
    },
    initData() {
      if (!this.modelData.processIdRule) {
        this.$set(this.modelData, 'processIdRule', { enable: false, prefix: '', infix: '', postfix: '', length: 5 })
      }
      if (!this.modelData.titleSetting) {
        this.$set(this.modelData, 'titleSetting', { enable: false, title: '' })
      }
      if (!this.modelData.summarySetting) {
        this.$set(this.modelData, 'summarySetting', { enable: false, summary: [] })
      }
      if (!this.modelData.printTemplateSetting) {
        this.$set(this.modelData, 'printTemplateSetting', { enable: false, template: '' })
      }
    }
  },
  created() {
    this.initData()
  }
}
</script>

<style scoped>
.model-step-form {
  max-width: 820px;
  margin: 20px auto;
}

.setting-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
