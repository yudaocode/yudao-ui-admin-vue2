<!-- MES 设备台账表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="设备编码" prop="code"><el-input v-model="formData.code" placeholder="请输入设备编码"><el-button slot="append" :disabled="formType !== 'create'" @click="generateCode">生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="设备名称" prop="name"><el-input v-model="formData.name" placeholder="请输入设备名称" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="品牌" prop="brand"><el-input v-model="formData.brand" placeholder="请输入品牌" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="设备类型" prop="machineryTypeId"><dv-machinery-type-select v-model="formData.machineryTypeId" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="所属车间" prop="workshopId"><md-workshop-select v-model="formData.workshopId" placeholder="请选择所属车间" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="设备状态" prop="status"><el-select v-model="formData.status" placeholder="请选择状态" class="full-width"><el-option v-for="dict in machineryStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="规格型号" prop="specification"><el-input v-model="formData.specification" placeholder="请输入规格型号" /></el-form-item></el-col>
        <el-col v-if="isDetail" :span="8"><el-form-item label="最近点检时间" prop="lastCheckTime"><el-date-picker v-model="formData.lastCheckTime" type="datetime" value-format="timestamp" class="full-width" disabled /></el-form-item></el-col>
        <el-col v-if="isDetail" :span="8"><el-form-item label="最近保养时间" prop="lastMaintenTime"><el-date-picker v-model="formData.lastMaintenTime" type="datetime" value-format="timestamp" class="full-width" disabled /></el-form-item></el-col>
      </el-row>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <el-tabs v-if="formType !== 'create' && formData.id" v-model="activeTab">
      <el-tab-pane label="点检记录" name="check" lazy><machinery-check-record-list :machinery-id="formData.id" /></el-tab-pane>
      <el-tab-pane label="保养记录" name="mainten" lazy><machinery-mainten-record-list :machinery-id="formData.id" /></el-tab-pane>
      <el-tab-pane label="维修记录" name="repair" lazy><machinery-repair-list :machinery-id="formData.id" /></el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button v-if="isDetail && formData.id" type="primary" plain @click="handleBarcode">查看条码</el-button>
      <el-button v-if="!isDetail" type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
    <barcode-detail ref="barcodeDetail" />
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { DvMachineryApi } from '@/api/mes/dv/machinery'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesDvMachineryStatusEnum, MesAutoCodeRuleCode, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
import MdWorkshopSelect from '@/views/mes/md/workstation/components/MdWorkshopSelect.vue'
import DvMachineryTypeSelect from './type/components/DvMachineryTypeSelect.vue'
import MachineryCheckRecordList from './MachineryCheckRecordList.vue'
import MachineryMaintenRecordList from './MachineryMaintenRecordList.vue'
import MachineryRepairList from './MachineryRepairList.vue'

const MES_DV_MACHINERY_STATUS = 'mes_dv_machinery_status'

export default {
  name: 'MachineryForm',
  components: { BarcodeDetail, MdWorkshopSelect, DvMachineryTypeSelect, MachineryCheckRecordList, MachineryMaintenRecordList, MachineryRepairList },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formType: '',
      activeTab: 'check',
      formData: this.getDefaultForm(),
      machineryStatusOptions: getIntDictOptions(MES_DV_MACHINERY_STATUS),
      formRules: {
        code: [{ required: true, message: '设备编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
        machineryTypeId: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
        workshopId: [{ required: true, message: '所属车间不能为空', trigger: 'change' }],
        status: [{ required: true, message: '设备状态不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    },
    dialogTitle() {
      return { create: '新增设备', update: '修改设备', detail: '查看设备' }[this.formType] || this.formType
    }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, code: undefined, name: undefined, brand: undefined, specification: undefined, machineryTypeId: undefined, workshopId: undefined, status: MesDvMachineryStatusEnum.STOP, lastCheckTime: undefined, lastMaintenTime: undefined, remark: undefined }
    },
    handleBarcode() {
      return this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.MACHINERY, this.formData.code, this.formData.name)
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.DV_MACHINERY_CODE)
      this.formData.code = response.data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          const response = await DvMachineryApi.getMachinery(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
        this.activeTab = 'check'
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            await DvMachineryApi.createMachinery(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await DvMachineryApi.updateMachinery(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.activeTab = 'check'
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
