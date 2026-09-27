<!-- MES 维修工单表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="110px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="维修单编码" prop="code"><el-input v-model="formData.code" placeholder="请输入维修单编码" :disabled="isHeaderReadonly"><el-button slot="append" :disabled="isHeaderReadonly" @click="generateCode">生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="维修单名称" prop="name"><el-input v-model="formData.name" placeholder="请输入维修单名称" :disabled="isHeaderReadonly" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="formData.machineryId" :disabled="isHeaderReadonly" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="报修日期" prop="requireDate"><el-date-picker v-model="formData.requireDate" type="datetime" value-format="timestamp" placeholder="选择报修日期" :disabled="isHeaderReadonly" /></el-form-item></el-col>
        <el-col v-if="showFinishFields" :span="8"><el-form-item label="维修完成日期" prop="finishDate"><el-date-picker v-model="formData.finishDate" type="datetime" value-format="timestamp" placeholder="选择完成日期" :disabled="!isConfirm" /></el-form-item></el-col>
        <el-col v-if="showConfirmFields" :span="8"><el-form-item label="维修人" prop="acceptedUserId"><user-select-v2 v-model="formData.acceptedUserId" placeholder="请选择维修人" disabled /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col v-if="showDetailFields" :span="8"><el-form-item label="维修结果" prop="result"><el-select v-model="formData.result" placeholder="请选择维修结果" clearable disabled><el-option v-for="dict in resultOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item></el-col>
        <el-col v-if="showDetailFields" :span="8"><el-form-item label="验收日期" prop="confirmDate"><el-date-picker v-model="formData.confirmDate" type="datetime" value-format="timestamp" placeholder="选择验收日期" disabled /></el-form-item></el-col>
        <el-col v-if="showDetailFields" :span="8"><el-form-item label="验收人" prop="confirmUserId"><user-select-v2 v-model="formData.confirmUserId" placeholder="请选择验收人" disabled /></el-form-item></el-col>
      </el-row>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" :disabled="isHeaderReadonly" /></el-form-item>
    </el-form>
    <template v-if="formData.id"><el-divider content-position="center">维修项目明细</el-divider><repair-line-list :repair-id="formData.id" :disabled="isHeaderReadonly" /></template>
    <span slot="footer">
      <el-button v-if="isEditable" type="primary" :disabled="formLoading" @click="submitForm">保 存</el-button>
      <el-button v-if="isEditable && formData.status === MesDvRepairStatusEnum.PREPARE" type="warning" :disabled="formLoading" @click="handleSubmit">提 交</el-button>
      <el-button v-if="isConfirm" type="primary" :disabled="formLoading" @click="handleConfirm">完成维修</el-button>
      <el-button v-if="isFinish" type="success" :disabled="formLoading" @click="handleFinish(MesDvRepairResultEnum.PASS)">验 收 通 过</el-button>
      <el-button v-if="isFinish" type="warning" :disabled="formLoading" @click="handleFinish(MesDvRepairResultEnum.FAIL)">不 通 过</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { DvRepairApi } from '@/api/mes/dv/repair'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode, MesDvRepairStatusEnum, MesDvRepairResultEnum } from '@/views/mes/utils/constants'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import RepairLineList from './RepairLineList.vue'
const MES_DV_REPAIR_RESULT = 'mes_dv_repair_result'
export default {
  name: 'RepairForm',
  components: { DvMachinerySelect, UserSelectV2, RepairLineList },
  data() {
    return {
      MesDvRepairStatusEnum,
      MesDvRepairResultEnum,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      formData: this.getDefaultForm(),
      originalFormData: '',
      resultOptions: getIntDictOptions(MES_DV_REPAIR_RESULT),
      formRules: {
        code: [{ required: true, message: '维修单编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '维修单名称不能为空', trigger: 'blur' }],
        machineryId: [{ required: true, message: '设备不能为空', trigger: 'blur' }],
        requireDate: [{ required: true, message: '报修日期不能为空', trigger: 'blur' }],
        finishDate: [{ required: true, message: '维修完成日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEditable() { return ['create', 'update'].includes(this.formType) }, isConfirm() { return this.formType === 'confirm' }, isFinish() { return this.formType === 'finish' }, isDetail() { return this.formType === 'detail' },
    isHeaderReadonly() { return ['confirm', 'finish', 'detail'].includes(this.formType) },
    showFinishFields() { return this.formData.status != null && this.formData.status >= MesDvRepairStatusEnum.CONFIRMED },
    showConfirmFields() { return this.formData.status != null && this.formData.status >= MesDvRepairStatusEnum.APPROVING },
    showDetailFields() { return this.formData.status != null && this.formData.status >= MesDvRepairStatusEnum.FINISHED },
    dialogTitle() { return { create: '新增维修工单', update: '编辑维修工单', confirm: '完成维修', finish: '验收', detail: '维修工单详情' }[this.formType] || this.formType }
  },
  methods: {
    getDefaultForm() { return { id: undefined, code: '', name: '', machineryId: undefined, requireDate: undefined, finishDate: undefined, confirmDate: undefined, result: undefined, acceptedUserId: undefined, confirmUserId: undefined, status: undefined, remark: '' } },
    async generateCode() { const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.DV_REPAIR_CODE); this.formData.code = response.data },
    async open(type, id) { this.dialogVisible = true; this.formType = type; this.resetFormData(); if (id) { this.formLoading = true; try { const response = await DvRepairApi.getRepair(id); this.formData = response.data } finally { this.formLoading = false } } this.originalFormData = JSON.stringify(this.formData) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { const response = await DvRepairApi.createRepair(this.formData); this.$modal.msgSuccess('新增成功'); this.formData.id = response.data; this.formData.status = MesDvRepairStatusEnum.PREPARE; this.formType = 'update' } else { await DvRepairApi.updateRepair(this.formData); this.$modal.msgSuccess('修改成功') } this.originalFormData = JSON.stringify(this.formData); this.$emit('success') } finally { this.formLoading = false } }) },
    validateForm() { return new Promise(resolve => this.$refs.form.validate(valid => resolve(valid))) },
    async handleSubmit() { if (!await this.validateForm()) return; try { await this.$modal.confirm('确认提交该维修工单？【提交后将不能修改】'); this.formLoading = true; if (JSON.stringify(this.formData) !== this.originalFormData) await DvRepairApi.updateRepair(this.formData); await DvRepairApi.submitRepair(this.formData.id); this.$modal.msgSuccess('提交成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 取消提交时保持表单 */ } finally { this.formLoading = false } },
    async handleConfirm() { if (!await this.validateForm()) return; try { await this.$modal.confirm('确认完成维修？完成后将进入待验收状态'); this.formLoading = true; await DvRepairApi.confirmRepair({ id: this.formData.id, finishDate: this.formData.finishDate }); this.$modal.msgSuccess('操作成功'); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 取消完成维修时保持表单 */ } finally { this.formLoading = false } },
    async handleFinish(result) { const label = result === MesDvRepairResultEnum.PASS ? '通过' : '不通过'; try { await this.$modal.confirm('确认验收' + label + '该维修工单？'); this.formLoading = true; await DvRepairApi.finishRepair(this.formData.id, result); this.$modal.msgSuccess('验收' + label); this.dialogVisible = false; this.$emit('success') } catch (error) { /* 取消验收时保持表单 */ } finally { this.formLoading = false } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }
  }
}
</script>
