<!-- MES 生产流转卡列表 -->
<template>
  <div class="app-container"><doc-alert
                               title="【生产】生产排产、工序流转卡"
                               url="https://doc.iocoder.cn/mes/pro/schedule-card/"
                             /><el-form
                               ref="queryForm"
                               :model="queryParams"
                               :inline="true"
                               label-width="100px"
                               size="small"
                               @submit.native.prevent
                             ><el-form-item
                               label="流转卡编码"
                               prop="code"
                             ><el-input
                               v-model="queryParams.code"
                               placeholder="请输入流转卡编码"
                               clearable
                               @keyup.enter.native="handleQuery"
                             /></el-form-item><el-form-item
                               label="生产工单"
                               prop="workOrderId"
                             ><pro-work-order-select
                               v-model="queryParams.workOrderId"
                               placeholder="请选择工单"
                             /></el-form-item><el-form-item
                               label="产品"
                               prop="itemId"
                             ><md-item-select
                               v-model="queryParams.itemId"
                               placeholder="请选择产品"
                             /></el-form-item><el-form-item
                               label="批次号"
                               prop="batchCode"
                             ><el-input
                               v-model="queryParams.batchCode"
                               placeholder="请输入批次号"
                               clearable
                               @keyup.enter.native="handleQuery"
                             /></el-form-item><el-form-item><el-button
                               icon="el-icon-search"
                               @click="handleQuery"
                             >搜索</el-button><el-button
                               icon="el-icon-refresh"
                               @click="resetQuery"
                             >重置</el-button><el-button
                               v-hasPermi="['mes:pro-card:create']"
                               type="primary"
                               plain
                               icon="el-icon-plus"
                               @click="openForm('create')"
                             >新增</el-button><el-button
                               v-hasPermi="['mes:pro-card:export']"
                               type="success"
                               plain
                               icon="el-icon-download"
                               :loading="exportLoading"
                               @click="handleExport"
                             >导出</el-button></el-form-item></el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
    ><el-table-column
       label="流转卡编码"
       align="center"
       prop="code"
       width="140"
     ><template #default="scope"><el-button
       type="text"
       @click="openForm('detail', scope.row.id)"
     >{{ scope.row.code }}</el-button></template></el-table-column><el-table-column
       label="生产工单编号"
       align="center"
       prop="workOrderCode"
       width="140"
     /><el-table-column
       label="工单名称"
       align="center"
       prop="workOrderName"
       min-width="150"
     /><el-table-column
       label="批次号"
       align="center"
       prop="batchCode"
       width="120"
     /><el-table-column
       label="产品物料编码"
       align="center"
       prop="itemCode"
       width="120"
     /><el-table-column
       label="产品物料名称"
       align="center"
       prop="itemName"
       min-width="120"
     /><el-table-column
       label="规格型号"
       align="center"
       prop="specification"
       width="120"
     /><el-table-column
       label="单位"
       align="center"
       prop="unitMeasureName"
       width="80"
     /><el-table-column
       label="流转数量"
       align="center"
       prop="transferedQuantity"
       width="100"
     /><el-table-column
       label="单据状态"
       align="center"
       prop="status"
       min-width="100"
     ><template #default="scope"><dict-tag
       :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
       :value="scope.row.status"
     /></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="240"
        fixed="right"
      ><template #default="scope"><el-button
        v-if="scope.row.status === MesProCardStatusEnum.PREPARE"
        v-hasPermi="['mes:pro-card:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-if="scope.row.status === MesProCardStatusEnum.PREPARE"
        v-hasPermi="['mes:pro-card:delete']"
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button><el-button
        v-if="scope.row.status === MesProCardStatusEnum.CONFIRMED"
        v-hasPermi="['mes:pro-card:finish']"
        type="text"
        class="success-text"
        @click="openForm('finish', scope.row.id)"
      >完成</el-button><el-button
        v-if="scope.row.status === MesProCardStatusEnum.CONFIRMED"
        v-hasPermi="['mes:pro-card:update']"
        type="text"
        class="danger-text"
        @click="handleCancel(scope.row.id)"
      >取消</el-button><printer-label
        :biz-id="scope.row.id"
        :biz-code="scope.row.code"
        biz-type="PROCARD"
      /></template></el-table-column>
    </el-table><pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><card-form
      ref="form"
      @success="getList"
    /></div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import download from '@/plugins/download'
import { ProCardApi } from '@/api/mes/pro/card'
import CardForm from './CardForm.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import ProWorkOrderSelect from '@/views/mes/pro/workorder/components/ProWorkOrderSelect.vue'
import { MesProCardStatusEnum } from '@/views/mes/utils/constants'
import { PrinterLabel } from '@/views/mes/wm/barcode/components'

export default {
  name: 'MesProCard', components: { CardForm, MdItemSelect, ProWorkOrderSelect, PrinterLabel },
  data() { return { DICT_TYPE, MesProCardStatusEnum, loading: true, list: [], total: 0, exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, code: undefined, workOrderId: undefined, itemId: undefined, batchCode: undefined }} }, created() { this.getList() },
  methods: {
    async getList() { this.loading = true; try { const response = await ProCardApi.getCardPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } }, handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) },
    async handleCancel(id) { try { await this.$modal.confirm('确认取消该流转卡？取消后不可恢复。'); await ProCardApi.cancelCard(id); this.$modal.msgSuccess('取消成功'); await this.getList() } catch (error) { /* canceled */ } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该生产流转卡？'); await ProCardApi.deleteCard(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* canceled */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有生产流转卡？'); this.exportLoading = true; const response = await ProCardApi.exportCard(this.queryParams); download.excel(response, '生产流转卡.xls') } catch (error) { /* canceled */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.danger-text { color: #f56c6c; }.success-text { color: #67c23a; }</style>
