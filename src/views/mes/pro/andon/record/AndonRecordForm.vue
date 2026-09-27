<!-- 安灯呼叫记录新增、处置、详情弹窗 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formType === 'create' ? createRules : {}"
      label-width="100px"
    >
      <el-form-item
        label="工作站"
        prop="workstationId"
      ><md-workstation-select
        v-if="formType === 'create'"
        v-model="formData.workstationId"
        placeholder="请选择工作站"
      /><el-input
        v-else
        :value="formData.workstationName"
        disabled
      /></el-form-item>
      <el-form-item
        label="发起人"
        prop="userId"
      ><user-select-v2
        v-if="formType === 'create'"
        v-model="formData.userId"
      /><el-input
        v-else
        :value="formData.userNickname"
        disabled
      /></el-form-item>
      <el-form-item
        label="生产工单"
        prop="workOrderId"
      ><pro-work-order-select
        v-if="formType === 'create'"
        v-model="formData.workOrderId"
        :status="MesProWorkOrderStatusEnum.CONFIRMED"
        placeholder="请选择工单（可选）"
      /><el-input
        v-else
        :value="formData.workOrderCode || '-'"
        disabled
      /></el-form-item>
      <el-form-item
        label="工序"
        prop="processId"
      ><pro-process-select
        v-if="formType === 'create'"
        v-model="formData.processId"
        placeholder="请选择工序（可选）"
      /><el-input
        v-else
        :value="formData.processName || '-'"
        disabled
      /></el-form-item>
      <el-form-item
        label="呼叫原因"
        prop="configId"
      ><andon-config-select
        v-if="formType === 'create'"
        v-model="formData.configId"
        @change="handleConfigChange"
      /><el-input
        v-else
        :value="formData.reason"
        disabled
      /></el-form-item>
      <el-form-item label="级别"><template v-if="formType === 'create'"><dict-tag
        v-if="formData.level"
        :type="DICT_TYPE.MES_PRO_ANDON_LEVEL"
        :value="formData.level"
      /><span
        v-else
        class="muted"
      >由呼叫原因自动带出</span></template><dict-tag
        v-else
        :type="DICT_TYPE.MES_PRO_ANDON_LEVEL"
        :value="formData.level"
      /></el-form-item>
      <template v-if="formType !== 'create'"><el-divider content-position="left">处置信息</el-divider><el-form-item label="状态"><dict-tag
        :type="DICT_TYPE.MES_PRO_ANDON_STATUS"
        :value="formData.status"
      /></el-form-item>
        <el-form-item label="处置时间"><el-date-picker
          v-if="formType === 'update'"
          v-model="formData.handleTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择处置时间"
          class="full-width"
        /><el-input
          v-else
          :value="formData.handleTime || '-'"
          disabled
        /></el-form-item>
        <el-form-item label="处置人"><user-select-v2
          v-if="formType === 'update'"
          v-model="formData.handlerUserId"
        /><el-input
          v-else
          :value="formData.handlerUserNickname || '-'"
          disabled
        /></el-form-item></template>
      <el-form-item label="备注"><el-input
        v-if="formType !== 'detail'"
        v-model="formData.remark"
        type="textarea"
        placeholder="请输入备注"
      /><span v-else>{{ formData.remark || '-' }}</span></el-form-item>
    </el-form>
    <span slot="footer"><template v-if="formType === 'create'"><el-button @click="dialogVisible = false">取 消</el-button><el-button
      type="primary"
      :disabled="formLoading"
      @click="handleCreate"
    >确 定</el-button></template><template v-else-if="formType === 'update'"><el-button @click="dialogVisible = false">关 闭</el-button><el-button
      type="primary"
      :disabled="formLoading"
      @click="handleSave"
    >保 存</el-button><el-button
      type="success"
      :disabled="formLoading"
      @click="handleFinish"
    >已处置</el-button></template><el-button
      v-else
      @click="dialogVisible = false"
    >关 闭</el-button></span>
  </el-dialog>
</template>

<script>
import { ProAndonRecordApi } from '@/api/mes/pro/andon/record'
import { DICT_TYPE } from '@/utils/dict'
import { getCurrentUserId } from '@/utils/auth'
import { formatDate } from '@/utils/formatTime'
import { MesProAndonStatusEnum, MesProWorkOrderStatusEnum } from '@/views/mes/utils/constants'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import AndonConfigSelect from '../config/components/AndonConfigSelect.vue'

const emptyForm = () => ({ workstationId: undefined, userId: undefined, workOrderId: undefined, processId: undefined, configId: undefined, reason: undefined, level: undefined, remark: undefined })

export default {
  name: 'AndonRecordForm',
  components: { MdWorkstationSelect, ProWorkOrderSelect, ProProcessSelect, UserSelectV2, AndonConfigSelect },
  data() { return { DICT_TYPE, MesProWorkOrderStatusEnum, dialogVisible: false, formLoading: false, formType: '', formData: emptyForm(), createRules: { workstationId: [{ required: true, message: '工作站不能为空', trigger: 'change' }], configId: [{ required: true, message: '呼叫原因不能为空', trigger: 'change' }] }} },
  computed: { dialogTitle() { return this.formType === 'create' ? '新增安灯呼叫' : this.formType === 'update' ? '处置安灯呼叫' : '安灯呼叫详情' } },
  methods: {
    async open(type, id) {
      this.dialogVisible = true; this.formType = type; this.resetForm()
      if (type === 'create') this.formData.userId = getCurrentUserId()
      else { this.formLoading = true; try { const response = await ProAndonRecordApi.getAndonRecord(id); this.formData = response.data; if (type === 'update') { if (!this.formData.handleTime) this.formData.handleTime = formatDate(new Date()); if (!this.formData.handlerUserId) this.formData.handlerUserId = getCurrentUserId() } } finally { this.formLoading = false } }
    },
    handleConfigChange(config) { this.formData.reason = config ? config.reason : undefined; this.formData.level = config ? config.level : undefined },
    handleCreate() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { await ProAndonRecordApi.createAndonRecord(this.formData); this.$modal.msgSuccess('新增成功'); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } }) },
    async updateStatus(status, successMessage) { this.formLoading = true; try { await ProAndonRecordApi.updateAndonRecord({ id: this.formData.id, handleTime: this.formData.handleTime, handlerUserId: this.formData.handlerUserId, remark: this.formData.remark, status }); this.$modal.msgSuccess(successMessage); this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    handleSave() { return this.updateStatus(MesProAndonStatusEnum.ACTIVE, '保存成功') },
    handleFinish() { if (!this.formData.handleTime) { this.$modal.msgWarning('标记已处置时，处置时间不能为空'); return } if (!this.formData.handlerUserId) { this.$modal.msgWarning('标记已处置时，处置人不能为空'); return } return this.updateStatus(MesProAndonStatusEnum.HANDLED, '处置成功') },
    resetForm() { this.formData = emptyForm(); this.$nextTick(() => { if (this.$refs.form) this.$refs.form.resetFields() }) }
  }
}
</script>

<style scoped>.full-width { width: 100%; }.muted { color: #909399; }</style>
