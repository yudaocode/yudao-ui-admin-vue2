<!-- MES 生产报工表单 -->
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
      label-width="120px"
      :disabled="isDetail"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="报工单号"
            prop="code"
          >
            <el-input
              v-model="formData.code"
              placeholder="请输入报工单号"
              :disabled="isHeaderReadonly"
            >
              <el-button
                slot="append"
                :disabled="isHeaderReadonly"
                @click="generateCode"
              >生成</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8"><el-form-item
          label="报工类型"
          prop="type"
        ><el-select
          v-model="formData.type"
          placeholder="请选择报工类型"
          :disabled="isHeaderReadonly"
          class="full-width"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_FEEDBACK_TYPE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item
          label="生产工单"
          prop="workOrderId"
        ><pro-work-order-select
          v-model="formData.workOrderId"
          :status="MesProWorkOrderStatusEnum.CONFIRMED"
          :disabled="isHeaderReadonly"
          placeholder="请选择工单"
          @change="handleWorkOrderChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="生产任务"
          prop="taskId"
        ><pro-task-select
          v-model="formData.taskId"
          :work-order-id="formData.workOrderId"
          :workstation-id="formData.workstationId"
          :statuses="[MesProTaskStatusEnum.PREPARE]"
          :disabled="isHeaderReadonly || !formData.workOrderId"
          placeholder="请选择任务"
          @change="handleTaskChange"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="工作站"
          prop="workstationId"
        ><md-workstation-select
          v-model="formData.workstationId"
          :disabled="isHeaderReadonly"
          placeholder="请选择工作站"
        /></el-form-item></el-col>
      </el-row>
      <el-row
        v-if="productInfo.itemCode"
        :gutter="20"
      >
        <el-col :span="8"><el-form-item label="产品编码"><el-input
          :value="productInfo.itemCode"
          disabled
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="产品名称"><el-input
          :value="productInfo.itemName"
          disabled
        /></el-form-item></el-col>
        <el-col :span="4"><el-form-item
          label="单位"
          label-width="60px"
        ><el-input
          :value="productInfo.unitMeasureName"
          disabled
        /></el-form-item></el-col>
        <el-col :span="4"><el-form-item
          label="规格"
          label-width="60px"
        ><el-input
          :value="productInfo.itemSpecification"
          disabled
        /></el-form-item></el-col>
      </el-row>

      <el-divider content-position="left">报工数量</el-divider>
      <el-row
        v-if="!checkFlag"
        :gutter="20"
      >
        <el-col :span="8"><el-form-item
          label="报工数量"
          prop="feedbackQuantity"
        ><el-input-number
          v-model="formData.feedbackQuantity"
          :min="0"
          :precision="2"
          disabled
          class="full-width"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="合格品数量"
          prop="qualifiedQuantity"
        ><el-input-number
          v-model="formData.qualifiedQuantity"
          :min="0"
          :precision="2"
          class="full-width"
          @change="handleQuantityChanged"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="不良品数量"
          prop="unqualifiedQuantity"
        ><el-input-number
          v-model="formData.unqualifiedQuantity"
          :min="0"
          :precision="2"
          class="full-width"
          @change="handleQuantityChanged"
        /></el-form-item></el-col>
      </el-row>
      <el-row
        v-else
        :gutter="20"
      >
        <el-col :span="8"><el-form-item
          label="报工数量"
          prop="feedbackQuantity"
        ><el-input-number
          v-model="formData.feedbackQuantity"
          :min="0"
          :precision="2"
          class="full-width"
        /></el-form-item></el-col>
      </el-row>
      <el-row
        v-if="!checkFlag && formData.unqualifiedQuantity > 0"
        :gutter="20"
      >
        <el-col :span="8"><el-form-item label="工废数量"><el-input-number
          v-model="formData.laborScrapQuantity"
          :min="0"
          :precision="2"
          class="full-width"
          @change="handleScrapChanged"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="料废数量"><el-input-number
          v-model="formData.materialScrapQuantity"
          :min="0"
          :precision="2"
          class="full-width"
          @change="handleScrapChanged"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="其他废品"><el-input-number
          v-model="formData.otherScrapQuantity"
          :min="0"
          :precision="2"
          class="full-width"
          @change="handleScrapChanged"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item
          label="报工人"
          prop="feedbackUserId"
        ><user-select-v2
          v-model="formData.feedbackUserId"
          :disabled="isHeaderReadonly"
          placeholder="请选择报工人"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="报工时间"
          prop="feedbackTime"
        ><el-date-picker
          v-model="formData.feedbackTime"
          type="datetime"
          value-format="timestamp"
          placeholder="请选择报工时间"
          :disabled="isHeaderReadonly"
          class="full-width"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="审核人"
          prop="approveUserId"
        ><user-select-v2
          v-model="formData.approveUserId"
          :disabled="isHeaderReadonly"
          placeholder="请选择审核人"
        /></el-form-item></el-col>
      </el-row>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注"
      /></el-form-item>
    </el-form>

    <el-tabs
      v-if="showWarehouseRecords"
      type="border-card"
      class="record-tabs"
    >
      <el-tab-pane label="BOM 物资消耗"><item-consume-list :feedback-id="formData.id" /></el-tab-pane>
      <el-tab-pane label="产品产出"><product-produce-list :feedback-id="formData.id" /></el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button
        v-if="isEditable"
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >保 存</el-button>
      <el-button
        v-if="isEditable && formData.status === MesProFeedbackStatusEnum.PREPARE"
        type="warning"
        :loading="formLoading"
        @click="handleSubmit"
      >提 交</el-button>
      <el-button
        v-if="formType === 'approve'"
        type="success"
        :loading="formLoading"
        @click="handleApprove"
      >通 过</el-button>
      <el-button
        v-if="formType === 'approve'"
        type="danger"
        :loading="formLoading"
        @click="handleReject"
      >不通过</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ProFeedbackApi } from '@/api/mes/pro/feedback'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { ProRouteProcessApi } from '@/api/mes/pro/route/process'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import ProTaskSelect from '@/views/mes/pro/task/components/ProTaskSelect.vue'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import ItemConsumeList from './ItemConsumeList.vue'
import ProductProduceList from './ProductProduceList.vue'
import { getCurrentUserId } from '@/utils/auth'
import {
  MesAutoCodeRuleCode,
  MesProFeedbackStatusEnum,
  MesProTaskStatusEnum,
  MesProWorkOrderStatusEnum
} from '@/views/mes/utils/constants'

export default {
  name: 'FeedbackForm',
  components: {
    ProWorkOrderSelect,
    ProTaskSelect,
    MdWorkstationSelect,
    UserSelectV2,
    ItemConsumeList,
    ProductProduceList
  },
  data() {
    return {
      DICT_TYPE,
      MesProFeedbackStatusEnum,
      MesProTaskStatusEnum,
      MesProWorkOrderStatusEnum,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      formData: this.emptyForm(),
      formRules: {
        code: [{ required: true, message: '报工单号不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '报工类型不能为空', trigger: 'change' }],
        workOrderId: [{ required: true, message: '生产工单不能为空', trigger: 'change' }],
        taskId: [{ required: true, message: '生产任务不能为空', trigger: 'change' }],
        workstationId: [{ required: true, message: '工作站不能为空', trigger: 'change' }],
        feedbackQuantity: [{ required: true, message: '报工数量不能为空', trigger: 'blur' }],
        feedbackUserId: [{ required: true, message: '报工人不能为空', trigger: 'change' }],
        feedbackTime: [{ required: true, message: '报工时间不能为空', trigger: 'change' }],
        approveUserId: [{ required: true, message: '审核人不能为空', trigger: 'change' }]
      },
      originalFormData: '',
      checkFlag: true,
      productInfo: this.emptyProductInfo()
    }
  },
  computed: {
    isEditable() {
      return ['create', 'update', 'submit'].includes(this.formType)
    },
    isDetail() {
      return ['detail', 'approve'].includes(this.formType)
    },
    isHeaderReadonly() {
      return ['submit', 'detail', 'approve'].includes(this.formType)
    },
    dialogTitle() {
      return {
        create: '新增生产报工',
        update: '编辑生产报工',
        submit: '提交生产报工',
        approve: '审批生产报工',
        detail: '生产报工详情'
      }[this.formType] || this.formType
    },
    showWarehouseRecords() {
      return this.formData.id &&
        this.formData.status !== MesProFeedbackStatusEnum.PREPARE &&
        this.formData.status !== MesProFeedbackStatusEnum.APPROVING
    }
  },
  methods: {
    getIntDictOptions,
    emptyForm() {
      return {
        id: undefined,
        code: undefined,
        type: undefined,
        workstationId: undefined,
        routeId: undefined,
        processId: undefined,
        workOrderId: undefined,
        taskId: undefined,
        itemId: undefined,
        expireDate: undefined,
        feedbackQuantity: 0,
        qualifiedQuantity: 0,
        unqualifiedQuantity: 0,
        uncheckQuantity: 0,
        laborScrapQuantity: 0,
        materialScrapQuantity: 0,
        otherScrapQuantity: 0,
        feedbackUserId: undefined,
        feedbackTime: undefined,
        approveUserId: undefined,
        status: undefined,
        remark: undefined
      }
    },
    emptyProductInfo() {
      return { itemCode: '', itemName: '', unitMeasureName: '', itemSpecification: '' }
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.PRO_FEEDBACK_CODE)
      this.formData.code = response.data
    },
    async loadCheckFlag(routeId, processId) {
      if (!routeId || !processId) {
        this.checkFlag = true
        return
      }
      try {
        const response = await ProRouteProcessApi.getRouteProcessByRouteAndProcess(routeId, processId)
        this.checkFlag = response.data && response.data.checkFlag != null ? response.data.checkFlag : false
      } catch (error) {
        this.checkFlag = true
      }
    },
    handleWorkOrderChange() {
      Object.assign(this.formData, {
        taskId: undefined,
        routeId: undefined,
        processId: undefined,
        workstationId: undefined,
        itemId: undefined
      })
      this.checkFlag = true
      this.productInfo = this.emptyProductInfo()
    },
    async handleTaskChange(task) {
      if (!task) return
      Object.assign(this.formData, {
        routeId: task.routeId,
        processId: task.processId,
        workstationId: task.workstationId,
        itemId: task.itemId
      })
      this.productInfo = {
        itemCode: task.itemCode || '',
        itemName: task.itemName || '',
        unitMeasureName: task.unitMeasureName || '',
        itemSpecification: task.itemSpecification || ''
      }
      await this.loadCheckFlag(task.routeId, task.processId)
    },
    handleQuantityChanged() {
      this.formData.feedbackQuantity = (this.formData.qualifiedQuantity || 0) + (this.formData.unqualifiedQuantity || 0)
    },
    handleScrapChanged() {
      this.formData.unqualifiedQuantity = (this.formData.laborScrapQuantity || 0) +
        (this.formData.materialScrapQuantity || 0) + (this.formData.otherScrapQuantity || 0)
      this.handleQuantityChanged()
    },
    alignQuantity(data) {
      if (this.checkFlag) {
        data.uncheckQuantity = data.feedbackQuantity
        data.qualifiedQuantity = 0
        data.unqualifiedQuantity = 0
        data.laborScrapQuantity = 0
        data.materialScrapQuantity = 0
        data.otherScrapQuantity = 0
      } else {
        data.feedbackQuantity = (data.qualifiedQuantity || 0) + (data.unqualifiedQuantity || 0)
        data.uncheckQuantity = 0
      }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await ProFeedbackApi.getFeedback(id)
          this.formData = response.data
          await this.loadCheckFlag(response.data.routeId, response.data.processId)
          this.productInfo = {
            itemCode: response.data.itemCode || '',
            itemName: response.data.itemName || '',
            unitMeasureName: response.data.unitMeasureName || '',
            itemSpecification: response.data.itemSpecification || ''
          }
        } finally {
          this.formLoading = false
        }
      } else {
        this.formData.feedbackUserId = getCurrentUserId()
        this.formData.feedbackTime = new Date()
        await this.generateCode()
      }
      this.originalFormData = JSON.stringify(this.formData)
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        this.alignQuantity(this.formData)
        if (this.formType === 'create') {
          const response = await ProFeedbackApi.createFeedback(this.formData)
          this.$modal.msgSuccess('新增成功')
          this.formData.id = response.data
          this.formData.status = MesProFeedbackStatusEnum.PREPARE
          this.formType = 'update'
        } else {
          await ProFeedbackApi.updateFeedback(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.originalFormData = JSON.stringify(this.formData)
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    async handleSubmit() {
      await this.$refs.form.validate()
      try {
        await this.$modal.confirm('确认提交该报工单？【提交后将不能修改】')
        this.formLoading = true
        this.alignQuantity(this.formData)
        if (JSON.stringify(this.formData) !== this.originalFormData) {
          if (this.formType === 'create') {
            const response = await ProFeedbackApi.createFeedback(this.formData)
            this.formData.id = response.data
          } else {
            await ProFeedbackApi.updateFeedback(this.formData)
          }
        }
        await ProFeedbackApi.submitFeedback(this.formData.id)
        this.$modal.msgSuccess('报工单已提交')
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        // 用户取消或接口失败时保持弹窗状态，与 Vue 3 页面一致
      } finally {
        this.formLoading = false
      }
    },
    async handleApprove() {
      this.formLoading = true
      try {
        const response = await ProFeedbackApi.approveFeedback(this.formData.id)
        this.$modal.msgSuccess(response.data ? '报工单已审批完成' : '报工成功，请等待质量检验完成！')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    async handleReject() {
      this.formLoading = true
      try {
        await ProFeedbackApi.rejectFeedback(this.formData.id)
        this.$modal.msgSuccess('报工单已驳回')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.emptyForm()
      this.checkFlag = true
      this.productInfo = this.emptyProductInfo()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.record-tabs { margin-top: 10px; }
</style>
