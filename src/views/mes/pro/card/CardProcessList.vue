<!-- MES 流转卡工序记录列表 -->
<template>
  <div><div
         v-if="!disabled"
         class="toolbar"
       ><el-button
         type="primary"
         plain
         icon="el-icon-plus"
         @click="openProcessForm('create')"
       >新增</el-button></div>
    <el-table
      v-loading="loading"
      :data="processList"
      stripe
      show-overflow-tooltip
    ><el-table-column
      label="序号"
      align="center"
      prop="sort"
      width="60"
    /><el-table-column
      label="工序名称"
      align="center"
      prop="processName"
      min-width="120"
    /><el-table-column
      label="工序编码"
      align="center"
      prop="processCode"
      width="120"
    /><el-table-column
      label="进入工序时间"
      align="center"
      prop="inputTime"
      :formatter="dateFormatter"
      width="180"
    /><el-table-column
      label="出工序时间"
      align="center"
      prop="outputTime"
      :formatter="dateFormatter"
      width="180"
    /><el-table-column
      label="投入数量"
      align="center"
      prop="inputQuantity"
      width="100"
    /><el-table-column
      label="产出数量"
      align="center"
      prop="outputQuantity"
      width="100"
    /><el-table-column
      label="不良品数量"
      align="center"
      prop="unqualifiedQuantity"
      width="100"
    /><el-table-column
      label="工位编码"
      align="center"
      prop="workstationCode"
      width="120"
    /><el-table-column
      label="工位名称"
      align="center"
      prop="workstationName"
      min-width="120"
    /><el-table-column
      label="操作人"
      align="center"
      prop="nickname"
      width="100"
    /><el-table-column
      v-if="!disabled"
      label="操作"
      align="center"
      width="160"
    ><template #default="scope"><el-button
      type="text"
      @click="openProcessForm('update', scope.row)"
    >编辑</el-button><el-button
      type="text"
      class="danger-text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="processTotal > 0"
      :total="processTotal"
      :page.sync="processQueryParams.pageNo"
      :limit.sync="processQueryParams.pageSize"
      @pagination="getProcessList"
    />
    <el-dialog
      :title="processDialogTitle"
      :visible.sync="processDialogVisible"
      width="960px"
      append-to-body
    ><el-form
      ref="processForm"
      v-loading="processFormLoading"
      :model="processFormData"
      :rules="processFormRules"
      label-width="120px"
    ><el-row><el-col :span="12"><el-form-item
       label="序号"
       prop="sort"
     ><el-input-number
       v-model="processFormData.sort"
       :min="0"
       class="full-width"
     /></el-form-item></el-col><el-col :span="12"><el-form-item
       label="工序"
       prop="processId"
     ><pro-process-select v-model="processFormData.processId" /></el-form-item></el-col></el-row><el-row><el-col :span="12"><el-form-item
       label="进入工序时间"
       prop="inputTime"
     ><el-date-picker
       v-model="processFormData.inputTime"
       type="datetime"
       placeholder="请选择时间"
       value-format="timestamp"
       class="full-width"
     /></el-form-item></el-col><el-col :span="12"><el-form-item
       label="出工序时间"
       prop="outputTime"
     ><el-date-picker
       v-model="processFormData.outputTime"
       type="datetime"
       placeholder="请选择时间"
       value-format="timestamp"
       class="full-width"
     /></el-form-item></el-col></el-row>
      <el-row><el-col :span="8"><el-form-item
        label="投入数量"
        prop="inputQuantity"
      ><el-input-number
        v-model="processFormData.inputQuantity"
        :min="0"
        :precision="2"
        class="full-width"
      /></el-form-item></el-col><el-col :span="8"><el-form-item
        label="产出数量"
        prop="outputQuantity"
      ><el-input-number
        v-model="processFormData.outputQuantity"
        :min="0"
        :precision="2"
        class="full-width"
      /></el-form-item></el-col><el-col :span="8"><el-form-item
        label="不合格数量"
        prop="unqualifiedQuantity"
      ><el-input-number
        v-model="processFormData.unqualifiedQuantity"
        :min="0"
        :precision="2"
        class="full-width"
      /></el-form-item></el-col></el-row>
      <el-row><el-col :span="12"><el-form-item
        label="工位"
        prop="workstationId"
      ><md-workstation-select v-model="processFormData.workstationId" /></el-form-item></el-col><el-col :span="12"><el-form-item
        label="操作人"
        prop="userId"
      ><user-select-v2 v-model="processFormData.userId" /></el-form-item></el-col></el-row><el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="processFormData.remark"
        type="textarea"
        placeholder="请输入备注"
      /></el-form-item></el-form><span slot="footer"><el-button
      type="primary"
      :disabled="processFormLoading"
      @click="submitProcessForm"
    >确 定</el-button><el-button @click="processDialogVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import { ProCardProcessApi } from '@/api/mes/pro/card/process'
import ProProcessSelect from '@/views/mes/pro/process/components/ProProcessSelect.vue'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

const emptyForm = cardId => ({ id: undefined, cardId, sort: undefined, processId: undefined, inputTime: undefined, outputTime: undefined, inputQuantity: undefined, outputQuantity: undefined, unqualifiedQuantity: undefined, workstationId: undefined, userId: undefined, remark: undefined })

export default {
  name: 'CardProcessList', components: { ProProcessSelect, MdWorkstationSelect, UserSelectV2 }, props: { cardId: { type: Number, required: true }, disabled: Boolean },
  data() { return { loading: false, processList: [], processTotal: 0, processQueryParams: { pageNo: 1, pageSize: 10, cardId: this.cardId }, processDialogVisible: false, processDialogTitle: '', processFormLoading: false, processFormData: emptyForm(this.cardId), processFormRules: {}} },
  created() { this.getProcessList() },
  methods: {
    dateFormatter,
    async getProcessList() { this.loading = true; this.processQueryParams.cardId = this.cardId; try { const response = await ProCardProcessApi.getCardProcessPage(this.processQueryParams); this.processList = response.data.list; this.processTotal = response.data.total } finally { this.loading = false } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该工序记录？'); await ProCardProcessApi.deleteCardProcess(id); this.$modal.msgSuccess('删除成功'); await this.getProcessList() } catch (error) { /* canceled */ } },
    openProcessForm(type, row) { this.processDialogVisible = true; this.processDialogTitle = type === 'create' ? '新增工序记录' : '编辑工序记录'; this.processFormData = type === 'create' ? emptyForm(this.cardId) : { id: row.id, cardId: row.cardId, sort: row.sort, processId: row.processId, inputTime: row.inputTime, outputTime: row.outputTime, inputQuantity: row.inputQuantity, outputQuantity: row.outputQuantity, unqualifiedQuantity: row.unqualifiedQuantity, workstationId: row.workstationId, userId: row.userId, remark: row.remark }; this.$nextTick(() => { if (this.$refs.processForm) this.$refs.processForm.resetFields() }) },
    submitProcessForm() { this.$refs.processForm.validate(async valid => { if (!valid) return; this.processFormLoading = true; try { if (this.processFormData.id) { await ProCardProcessApi.updateCardProcess(this.processFormData); this.$modal.msgSuccess('修改成功') } else { await ProCardProcessApi.createCardProcess(this.processFormData); this.$modal.msgSuccess('新增成功') } this.processDialogVisible = false; await this.getProcessList() } finally { this.processFormLoading = false } }) }
  }
}
</script>

<style scoped>.toolbar { margin-bottom: 10px; }.full-width { width: 100%; }.danger-text { color: #f56c6c; }</style>
