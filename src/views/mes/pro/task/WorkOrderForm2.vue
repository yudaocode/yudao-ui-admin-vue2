<!-- MES 生产排产：工单排产及详情弹窗 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
  >
    <el-form
      v-loading="formLoading"
      :model="formData"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="工单编码" prop="code"><el-input
          v-model="formData.code"
          disabled
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="工单名称" prop="name"><el-input
          v-model="formData.name"
          disabled
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="工单来源" prop="orderSourceType"><el-select
          v-model="formData.orderSourceType"
          class="full-width"
          disabled
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_SOURCE_TYPE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
        <el-col
          v-if="formData.orderSourceType === MesProWorkOrderSourceTypeEnum.ORDER"
          :span="8"
        ><el-form-item label="来源单据编号" prop="orderSourceCode"><el-input
          v-model="formData.orderSourceCode"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="工单类型" prop="type"><el-select
          v-model="formData.type"
          class="full-width"
          disabled
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_TYPE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="产品" prop="productId"><md-item-select
          v-model="formData.productId"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="规格型号" prop="productSpecification"><el-input
          v-model="formData.productSpecification"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="单位" prop="unitMeasureName"><el-input
          v-model="formData.unitMeasureName"
          disabled
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="工单数量" prop="quantity"><el-input-number
          v-model="formData.quantity"
          :min="0"
          :precision="2"
          class="full-width"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="客户" prop="clientId"><md-client-select
          v-model="formData.clientId"
          disabled
        /></el-form-item></el-col>
        <el-col
          v-if="formData.type === MesProWorkOrderTypeEnum.OUTSOURCE || formData.type === MesProWorkOrderTypeEnum.PURCHASE"
          :span="8"
        ><el-form-item label="供应商" prop="vendorId"><md-vendor-select
          v-model="formData.vendorId"
          disabled
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="批次号" prop="batchCode"><el-input
          v-model="formData.batchCode"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="需求日期" prop="requestDate"><el-date-picker
          v-model="formData.requestDate"
          type="date"
          value-format="timestamp"
          class="full-width"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="工单状态" prop="status"><dict-tag
          :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
          :value="formData.status == null ? '' : formData.status"
        /></el-form-item></el-col>
      </el-row>
      <el-form-item label="备注" prop="remark"><el-input
        v-model="formData.remark"
        type="textarea"
        disabled
      /></el-form-item>
    </el-form>

    <el-steps
      v-if="routeProcessList.length && formData.id"
      :active="activeProcessStep"
      align-center
      simple
      class="process-steps"
    >
      <el-step
        v-for="(routeProcess, index) in routeProcessList"
        :key="routeProcess.processId"
        :title="routeProcess.processName"
        class="clickable-step"
        @click.native="activeProcessStep = index"
      />
    </el-steps>
    <el-card
      v-for="(routeProcess, index) in routeProcessList"
      v-show="activeProcessStep === index && formData.id"
      :key="routeProcess.processId"
      shadow="never"
    >
      <pro-task-list
        :work-order-id="formData.id"
        :route-id="currentRouteId"
        :process-id="routeProcess.processId"
        :item-id="formData.productId"
        :color-code="routeProcess.colorCode"
        :disabled="isReadonly"
      />
    </el-card>
    <span slot="footer">
      <el-button
        v-if="formType === 'schedule'"
        type="success"
        :loading="formLoading"
        @click="handleFinish"
      >完 成</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import { ProRouteProcessApi } from '@/api/mes/pro/route/process'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import MdVendorSelect from '@/views/mes/md/vendor/components/MdVendorSelect.vue'
import { MesProWorkOrderSourceTypeEnum, MesProWorkOrderTypeEnum } from '@/views/mes/utils/constants'
import ProTaskList from './ProTaskList.vue'

export default {
  name: 'WorkOrderForm2',
  components: { MdItemSelect, MdClientSelect, MdVendorSelect, ProTaskList },
  data() {
    return {
      DICT_TYPE,
      MesProWorkOrderSourceTypeEnum,
      MesProWorkOrderTypeEnum,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: {},
      routeProcessList: [],
      activeProcessStep: 0,
      currentRouteId: 0
    }
  },
  computed: {
    isReadonly() {
      return this.formType === 'detail'
    }
  },
  methods: {
    getIntDictOptions,
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = { schedule: '生产排产', detail: '工单详情' }[type] || type
      this.formLoading = true
      this.formData = {}
      this.routeProcessList = []
      this.activeProcessStep = 0
      try {
        const response = await ProWorkOrderApi.getWorkOrder(id)
        this.formData = response.data
        if (this.formData.productId) await this.loadRouteProcesses(this.formData.productId)
      } finally {
        this.formLoading = false
      }
    },
    async handleFinish() {
      try {
        await this.$modal.confirm('确认要完成该工单吗？完成后工单下所有任务将标记为已完成。')
        this.formLoading = true
        await ProWorkOrderApi.finishWorkOrder(this.formData.id)
        this.$modal.msgSuccess('工单已完成')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 用户取消或接口失败时保持弹窗状态，与 Vue 3 页面一致
      } finally {
        this.formLoading = false
      }
    },
    async loadRouteProcesses(productId) {
      try {
        const response = await ProRouteProcessApi.getRouteProcessListByProduct(productId)
        const processes = response.data
        if (!processes || processes.length === 0) {
          this.$modal.msgWarning('当前产品未配置工艺路线，请先在工艺路线中维护')
          return
        }
        this.currentRouteId = processes[0].routeId
        this.routeProcessList = processes.sort((left, right) => left.sort - right.sort)
      } catch (error) {
        console.warn('加载工艺路线工序失败', error)
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.process-steps { margin: 10px 0; }
.clickable-step { cursor: pointer; }
</style>
