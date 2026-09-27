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
      <el-row><el-col :span="8"><el-form-item
        label="工作站编码"
        prop="code"
      ><el-input
        v-model="formData.code"
        placeholder="请输入工作站编码"
      ><el-button
        slot="append"
        @click="generateCode"
      >生成</el-button></el-input></el-form-item></el-col><el-col :span="8"><el-form-item
        label="工作站名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入工作站名称"
      /></el-form-item></el-col><el-col :span="8"><el-form-item
        label="所在车间"
        prop="workshopId"
      ><md-workshop-select
        v-model="formData.workshopId"
        placeholder="请选择车间"
      /></el-form-item></el-col></el-row>
      <el-row><el-col :span="8"><el-form-item
        label="工作站地点"
        prop="address"
      ><el-input
        v-model="formData.address"
        placeholder="请输入工作站地点"
      /></el-form-item></el-col><el-col :span="8"><el-form-item
        label="所属工序"
        prop="processId"
      ><pro-process-select
        v-model="formData.processId"
        placeholder="请选择所属工序"
        clearable
      /></el-form-item></el-col><el-col :span="8"><el-form-item
        label="仓库"
        prop="warehouseId"
      ><wm-warehouse-select
        v-model="formData.warehouseId"
        placeholder="请选择仓库"
        clearable
        @change="handleWarehouseSelectChange"
      /></el-form-item></el-col></el-row>
      <el-row><el-col :span="8"><el-form-item
        label="库区"
        prop="locationId"
      ><el-select
        v-model="formData.locationId"
        placeholder="请选择库区"
        clearable
        class="full-width"
        :disabled="!formData.warehouseId"
        @change="handleLocationChange"
      ><el-option
        v-for="location in locationList"
        :key="location.id"
        :label="location.name"
        :value="location.id"
      /></el-select></el-form-item></el-col><el-col :span="8"><el-form-item
        label="库位"
        prop="areaId"
      ><el-select
        v-model="formData.areaId"
        placeholder="请选择库位"
        clearable
        class="full-width"
        :disabled="!formData.locationId"
      ><el-option
        v-for="area in areaList"
        :key="area.id"
        :label="area.name"
        :value="area.id"
      /></el-select></el-form-item></el-col><el-col :span="8"><el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.value"
      >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col></el-row>
      <el-row><el-col :span="24"><el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item></el-col></el-row>
    </el-form>
    <el-tabs
      v-if="formType !== 'create' && formData.id"
      v-model="activeTab"
    ><el-tab-pane
      label="设备资源"
      name="machine"
    ><workstation-machine-list
      :workstation-id="formData.id"
      :form-type="formType"
    /></el-tab-pane><el-tab-pane
      label="工装夹具"
      name="tool"
    ><workstation-tool-list
      :workstation-id="formData.id"
      :form-type="formType"
    /></el-tab-pane><el-tab-pane
      label="人力资源"
      name="worker"
    ><workstation-worker-list
      :workstation-id="formData.id"
      :form-type="formType"
    /></el-tab-pane></el-tabs>
    <span slot="footer"><el-button
      v-if="isDetail && formData.id"
      type="primary"
      plain
      @click="handleBarcode"
    >查看条码</el-button><el-button
      v-if="!isDetail"
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    <barcode-detail ref="barcodeDetail" />
  </el-dialog>
</template>
<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { MdWorkstationApi } from '@/api/mes/md/workstation'
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
import { WmWarehouseAreaApi } from '@/api/mes/wm/warehouse/area'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { BarcodeBizTypeEnum, MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import MdWorkshopSelect from './components/MdWorkshopSelect.vue'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import WmWarehouseSelect from '@/views/mes/wm/warehouse/components/WmWarehouseSelect.vue'
import WorkstationMachineList from './WorkstationMachineList.vue'
import WorkstationToolList from './WorkstationToolList.vue'
import WorkstationWorkerList from './WorkstationWorkerList.vue'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
export default { name: 'WorkstationForm', components: { MdWorkshopSelect, ProProcessSelect, WmWarehouseSelect, WorkstationMachineList, WorkstationToolList, WorkstationWorkerList, BarcodeDetail }, data() { return { dialogVisible: false, dialogTitle: '', formLoading: false, formType: '', activeTab: 'machine', locationList: [], areaList: [], statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), formData: this.getDefaultForm(), formRules: { code: [{ required: true, message: '工作站编码不能为空', trigger: 'blur' }], name: [{ required: true, message: '工作站名称不能为空', trigger: 'blur' }], workshopId: [{ required: true, message: '所在车间不能为空', trigger: 'change' }], processId: [{ required: true, message: '所属工序不能为空', trigger: 'change' }], status: [{ required: true, message: '状态不能为空', trigger: 'blur' }] }} }, computed: { isDetail() { return this.formType === 'detail' } }, methods: { getDefaultForm() { return { id: undefined, code: undefined, name: undefined, address: undefined, workshopId: undefined, processId: undefined, warehouseId: undefined, locationId: undefined, areaId: undefined, status: CommonStatusEnum.ENABLE, remark: undefined } }, resetFormData() { this.formData = this.getDefaultForm(); this.locationList = []; this.areaList = []; this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) }, handleBarcode() { this.$refs.barcodeDetail.openByBusiness(this.formData.id, BarcodeBizTypeEnum.WORKSTATION, this.formData.code, this.formData.name) }, async generateCode() { this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.MD_WORKSTATION_CODE)).data }, async loadLocationList(warehouseId) { if (!warehouseId) { this.locationList = []; return } this.locationList = (await WmWarehouseLocationApi.getWarehouseLocationSimpleList(warehouseId)).data }, async loadAreaList(locationId) { if (!locationId) { this.areaList = []; return } this.areaList = (await WmWarehouseAreaApi.getWarehouseAreaSimpleList(locationId)).data }, async handleWarehouseSelectChange(item) { this.formData.locationId = undefined; this.formData.areaId = undefined; this.areaList = []; await this.loadLocationList(item && item.id) }, async handleLocationChange(locationId) { this.formData.areaId = undefined; await this.loadAreaList(locationId) }, async open(type, id) { this.dialogVisible = true; this.dialogTitle = { create: '新增工作站', update: '修改工作站', detail: '查看工作站' }[type]; this.formType = type; this.activeTab = 'machine'; this.resetFormData(); if (id) { this.formLoading = true; try { this.formData = (await MdWorkstationApi.getWorkstation(id)).data; await this.loadLocationList(this.formData.warehouseId); await this.loadAreaList(this.formData.locationId) } finally { this.formLoading = false } } }, submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.formType === 'create') { await MdWorkstationApi.createWorkstation(this.formData); this.$modal.msgSuccess('新增成功') } else { await MdWorkstationApi.updateWorkstation(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }) } }}
</script>
<style scoped>.full-width { width: 100%; }</style>
