<!-- MES 设备保养记录表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="900px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="formData.machineryId" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="保养计划" prop="planId"><dv-check-plan-select v-model="formData.planId" :type="MesDvSubjectTypeEnum.MAINTENANCE" :status="MesDvCheckPlanStatusEnum.ENABLED" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="保养人" prop="userId"><user-select-v2 v-model="formData.userId" placeholder="请选择保养人" /></el-form-item></el-col>
      </el-row>
      <el-row><el-col :span="8"><el-form-item label="保养时间" prop="maintenTime"><el-date-picker v-model="formData.maintenTime" type="datetime" value-format="timestamp" placeholder="选择保养时间" /></el-form-item></el-col></el-row>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <template v-if="formData.id"><el-divider content-position="center">保养项目</el-divider><mainten-record-line-list :record-id="formData.id" :disabled="isDetail" /></template>
    <span slot="footer">
      <el-button v-if="isEditable" type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button v-if="isEditable && formData.status === MesDvMaintenRecordStatusEnum.PREPARE" type="warning" :disabled="formLoading" @click="handleSubmit">提 交</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getCurrentUserId } from '@/utils/auth'
import { DvMaintenRecordApi } from '@/api/mes/dv/maintenrecord'
import { MesDvMaintenRecordStatusEnum, MesDvSubjectTypeEnum, MesDvCheckPlanStatusEnum } from '@/views/mes/utils/constants'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import DvCheckPlanSelect from '@/views/mes/dv/checkplan/components/DvCheckPlanSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import MaintenRecordLineList from './MaintenRecordLineList.vue'
export default {
  name: 'MaintenRecordForm',
  components: { DvMachinerySelect, DvCheckPlanSelect, UserSelectV2, MaintenRecordLineList },
  data() {
    return {
      MesDvMaintenRecordStatusEnum,
      MesDvSubjectTypeEnum,
      MesDvCheckPlanStatusEnum,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      formData: this.getDefaultForm(),
      originalFormData: '',
      formRules: {
        machineryId: [{ required: true, message: '设备不能为空', trigger: 'blur' }],
        maintenTime: [{ required: true, message: '保养时间不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isEditable() { return ['create', 'update'].includes(this.formType) },
    isDetail() { return this.formType === 'detail' },
    dialogTitle() { return { create: '新增保养记录', update: '编辑保养记录', detail: '保养记录详情' }[this.formType] || this.formType }
  },
  methods: {
    getDefaultForm() { return { id: undefined, planId: undefined, machineryId: undefined, maintenTime: undefined, userId: undefined, status: undefined, remark: '' } },
    async open(type, id) {
      this.dialogVisible = true; this.formType = type; this.resetFormData()
      if (id) { this.formLoading = true; try { const response = await DvMaintenRecordApi.getMaintenRecord(id); this.formData = response.data } finally { this.formLoading = false } }
      if (type === 'create') this.formData.userId = getCurrentUserId()
      this.originalFormData = JSON.stringify(this.formData)
    },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { const response = await DvMaintenRecordApi.createMaintenRecord(this.formData); this.$modal.msgSuccess('新增成功'); this.formData.id = response.data; this.formData.status = MesDvMaintenRecordStatusEnum.PREPARE; this.formType = 'update' } else { await DvMaintenRecordApi.updateMaintenRecord(this.formData); this.$modal.msgSuccess('修改成功') } this.originalFormData = JSON.stringify(this.formData); this.$emit('success') } finally { this.formLoading = false } }) },
    validateForm() { return new Promise(resolve => this.$refs.form.validate(valid => resolve(valid))) },
    async handleSubmit() { if (!await this.validateForm()) return; try { await this.$modal.confirm('确认提交该保养记录？【提交后将不能修改】'); this.formLoading = true; if (JSON.stringify(this.formData) !== this.originalFormData) await DvMaintenRecordApi.updateMaintenRecord(this.formData); await DvMaintenRecordApi.submitMaintenRecord(this.formData.id); this.$modal.msgSuccess('提交成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 取消提交时保持表单 */ } finally { this.formLoading = false } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
