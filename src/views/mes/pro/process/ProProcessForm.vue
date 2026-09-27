<!-- MES 生产工序表单 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="isDetail"
    >
      <el-row :gutter="20"><el-col :span="8"><el-form-item
                             label="工序编码"
                             prop="code"
                           ><el-input
                             v-model="formData.code"
                             placeholder="请输入工序编码"
                           ><el-button
                             slot="append"
                             @click="generateCode"
                           >生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="工序名称"
          prop="name"
        ><el-input
          v-model="formData.name"
          placeholder="请输入工序名称"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="状态"
          prop="status"
        ><el-radio-group v-model="formData.status"><el-radio
          v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
          :key="dict.value"
          :label="dict.value"
        >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col></el-row>
      <el-form-item
        label="工序说明"
        prop="attention"
      ><el-input
        v-model="formData.attention"
        type="textarea"
        :rows="3"
        placeholder="请输入工序说明"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item>
      <template v-if="formData.id"><el-divider content-position="left">操作步骤</el-divider><pro-process-content-list :process-id="formData.id" /></template>
    </el-form>
    <span slot="footer"><el-button
      v-if="!isDetail"
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">{{ isDetail ? '关 闭' : '取 消' }}</el-button></span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { ProProcessApi } from '@/api/mes/pro/process'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import ProProcessContentList from './ProProcessContentList.vue'

const emptyForm = () => ({ id: undefined, code: '', name: '', attention: '', status: 0, remark: '' })

export default {
  name: 'ProProcessForm',
  components: { ProProcessContentList },
  data() {
    return { DICT_TYPE, dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', formData: emptyForm(), formRules: { code: [{ required: true, message: '工序编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '工序名称不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'change' }] }}
  },
  computed: { isDetail() { return this.formType === 'detail' } },
  methods: {
    getIntDictOptions,
    async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.PRO_PROCESS_CODE)).data },
    async open(type, id) {
      this.dialogVisible = true; this.dialogTitle = ({ create: '新增生产工序', update: '编辑生产工序', detail: '生产工序详情' })[type] || type; this.formType = type; this.resetForm()
      if (id) { this.formLoading = true; try { const response = await ProProcessApi.getProcess(id); this.formData = response.data } finally { this.formLoading = false } }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') { await ProProcessApi.createProcess({ ...this.formData }); this.$modal.msgSuccess('新增成功') } else { await ProProcessApi.updateProcess({ ...this.formData }); this.$modal.msgSuccess('修改成功') }
          this.dialogVisible = false; this.$emit('success')
        } finally { this.formLoading = false }
      })
    },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) }
  }
}
</script>
