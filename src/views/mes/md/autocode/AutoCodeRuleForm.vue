<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1000px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="24"><el-form-item
          label="规则编码"
          prop="code"
        ><el-input
          v-model="formData.code"
          placeholder="请输入规则编码"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="规则名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入规则名称"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="规则描述"
          prop="description"
        ><el-input
          v-model="formData.description"
          placeholder="请输入规则描述"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="最大长度"
          prop="maxLength"
        ><el-input-number
          v-model="formData.maxLength"
          :min="1"
          :max="100"
          class="full-width"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="是否补齐"
          prop="padded"
        ><el-radio-group v-model="formData.padded"><el-radio
          v-for="dict in boolOptions"
          :key="String(dict.value)"
          :label="dict.value"
        >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col
          v-if="formData.padded"
          :span="24"
        ><el-form-item
          label="补齐字符"
          prop="paddedChar"
        ><el-input
          v-model="formData.paddedChar"
          placeholder="请输入补齐字符"
          maxlength="1"
        /></el-form-item></el-col>
        <el-col
          v-if="formData.padded"
          :span="24"
        ><el-form-item
          label="补齐方式"
          prop="paddedMethod"
        ><el-radio-group v-model="formData.paddedMethod"><el-radio
          v-for="dict in paddedMethodOptions"
          :key="dict.value"
          :label="dict.value"
        >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="状态"
          prop="status"
        ><el-radio-group v-model="formData.status"><el-radio
          v-for="dict in statusOptions"
          :key="dict.value"
          :label="dict.value"
        >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <template v-if="formType === 'update' && formData.id"><el-divider>规则组成</el-divider><auto-code-part-list :rule-id="formData.id" /></template>
    <span slot="footer"><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { AutoCodeRuleApi } from '@/api/mes/md/autocode/rule'
import { CommonStatusEnum } from '@/utils/constants'
import AutoCodePartList from './AutoCodePartList.vue'
export default {
  name: 'AutoCodeRuleForm', components: { AutoCodePartList },
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', activeTab: 'parts',
      boolOptions: getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING),
      paddedMethodOptions: getIntDictOptions(DICT_TYPE.MES_MD_AUTO_CODE_PADDED_METHOD),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultForm(),
      formRules: {
        code: [{ required: true, message: '规则编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }], maxLength: [{ required: true, message: '最大长度不能为空', trigger: 'blur' }],
        padded: [{ required: true, message: '是否补齐不能为空', trigger: 'change' }], paddedChar: [{ required: true, message: '补齐字符不能为空', trigger: 'blur' }],
        paddedMethod: [{ required: true, message: '补齐方式不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultForm() { return { id: undefined, code: undefined, name: undefined, description: undefined, maxLength: undefined, padded: false, paddedChar: undefined, paddedMethod: undefined, status: CommonStatusEnum.ENABLE, remark: undefined } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async open(type, id) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '新增编码规则' : '修改编码规则'; this.formType = type; this.activeTab = 'parts'; this.resetFormData(); if (id) { this.formLoading = true; try { this.formData = (await AutoCodeRuleApi.getAutoCodeRule(id)).data } finally { this.formLoading = false } } },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await AutoCodeRuleApi.createAutoCodeRule(this.formData); this.$modal.msgSuccess('新增成功') } else { await AutoCodeRuleApi.updateAutoCodeRule(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
