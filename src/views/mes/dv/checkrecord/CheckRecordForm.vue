<!-- MES 设备点检记录表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="900px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="formData.machineryId" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="点检计划" prop="planId"><dv-check-plan-select v-model="formData.planId" :type="MesDvSubjectTypeEnum.CHECK" :status="MesDvCheckPlanStatusEnum.ENABLED" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="点检人" prop="userId"><user-select-v2 v-model="formData.userId" placeholder="请选择点检人" /></el-form-item></el-col>
      </el-row>
      <el-row><el-col :span="8"><el-form-item label="点检时间" prop="checkTime"><el-date-picker v-model="formData.checkTime" type="datetime" value-format="timestamp" placeholder="选择点检时间" /></el-form-item></el-col></el-row>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <template v-if="formData.id"><el-divider content-position="center">点检项目明细</el-divider><check-record-line-list :record-id="formData.id" :disabled="isDetail" /></template>
    <span slot="footer">
      <el-button v-if="isEditable" type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button v-if="isEditable && formData.status === MesDvCheckRecordStatusEnum.DRAFT" type="warning" :disabled="formLoading" @click="handleSubmit">提 交</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DvCheckRecordApi } from '@/api/mes/dv/checkrecord'
import { MesDvCheckRecordStatusEnum, MesDvSubjectTypeEnum, MesDvCheckPlanStatusEnum } from '@/views/mes/utils/constants'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import DvCheckPlanSelect from '@/views/mes/dv/checkplan/components/DvCheckPlanSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import CheckRecordLineList from './CheckRecordLineList.vue'

export default {
  name: 'CheckRecordForm',
  components: { DvMachinerySelect, DvCheckPlanSelect, UserSelectV2, CheckRecordLineList },
  data() {
    return {
      MesDvCheckRecordStatusEnum,
      MesDvSubjectTypeEnum,
      MesDvCheckPlanStatusEnum,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      formData: this.getDefaultForm(),
      originalFormData: '',
      formRules: { machineryId: [{ required: true, message: '设备不能为空', trigger: 'blur' }], checkTime: [{ required: true, message: '点检时间不能为空', trigger: 'blur' }] }
    }
  },
  computed: {
    isEditable() { return ['create', 'update'].includes(this.formType) },
    isDetail() { return this.formType === 'detail' },
    dialogTitle() { return { create: '新增点检记录', update: '编辑点检记录', detail: '点检记录详情' }[this.formType] || this.formType }
  },
  methods: {
    getDefaultForm() { return { id: undefined, planId: undefined, machineryId: undefined, checkTime: undefined, userId: undefined, status: undefined, remark: '' } },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try { const response = await DvCheckRecordApi.getCheckRecord(id); this.formData = response.data } finally { this.formLoading = false }
      }
      this.originalFormData = JSON.stringify(this.formData)
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            const response = await DvCheckRecordApi.createCheckRecord(this.formData)
            this.$modal.msgSuccess('新增成功')
            this.formData.id = response.data
            this.formData.status = MesDvCheckRecordStatusEnum.DRAFT
            this.formType = 'update'
          } else { await DvCheckRecordApi.updateCheckRecord(this.formData); this.$modal.msgSuccess('修改成功') }
          this.originalFormData = JSON.stringify(this.formData)
          this.$emit('success')
        } finally { this.formLoading = false }
      })
    },
    submitAfterValidation() {
      return new Promise(resolve => this.$refs.form.validate(valid => resolve(valid)))
    },
    async handleSubmit() {
      if (!await this.submitAfterValidation()) return
      try {
        await this.$modal.confirm('确认提交该点检记录？【提交后将不能修改】')
        this.formLoading = true
        if (JSON.stringify(this.formData) !== this.originalFormData) await DvCheckRecordApi.updateCheckRecord(this.formData)
        await DvCheckRecordApi.submitCheckRecord(this.formData.id)
        this.$modal.msgSuccess('提交成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) { /* 取消提交时保持表单 */ } finally { this.formLoading = false }
    },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
