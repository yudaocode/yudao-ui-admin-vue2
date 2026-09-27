<!-- MES 生产工单列表 -->
<template>
  <div class="app-container"><doc-alert
                               title="【生产】生产工单"
                               url="https://doc.iocoder.cn/mes/pro/work-order/"
                             /><el-form
                               ref="queryForm"
                               :model="queryParams"
                               :inline="true"
                               label-width="100px"
                               size="small"
                               @submit.native.prevent
                             ><el-form-item
                               label="工单编码"
                               prop="code"
                             ><el-input
                               v-model="queryParams.code"
                               placeholder="请输入工单编码"
                               clearable
                               @keyup.enter.native="handleQuery"
                             /></el-form-item><el-form-item
                               label="工单名称"
                               prop="name"
                             ><el-input
                               v-model="queryParams.name"
                               placeholder="请输入工单名称"
                               clearable
                               @keyup.enter.native="handleQuery"
                             /></el-form-item><el-form-item
                               label="来源单据"
                               prop="orderSourceCode"
                             ><el-input
                               v-model="queryParams.orderSourceCode"
                               placeholder="请输入来源单据编号"
                               clearable
                               @keyup.enter.native="handleQuery"
                             /></el-form-item><el-form-item
                               label="产品"
                               prop="productId"
                             ><md-item-select
                               v-model="queryParams.productId"
                               placeholder="请选择产品"
                             /></el-form-item><el-form-item
                               label="客户"
                               prop="clientId"
                             ><md-client-select
                               v-model="queryParams.clientId"
                               placeholder="请选择客户"
                             /></el-form-item><el-form-item
                               label="工单类型"
                               prop="type"
                             ><el-select
                               v-model="queryParams.type"
                               placeholder="请选择工单类型"
                               clearable
                             ><el-option
                               v-for="dict in getIntDictOptions(DICT_TYPE.MES_PRO_WORK_ORDER_TYPE)"
                               :key="dict.value"
                               :label="dict.label"
                               :value="dict.value"
                             /></el-select></el-form-item><el-form-item
                               label="需求日期"
                               prop="requestDate"
                             ><el-date-picker
                               v-model="queryParams.requestDate"
                               value-format="yyyy-MM-dd HH:mm:ss"
                               type="daterange"
                               start-placeholder="开始日期"
                               end-placeholder="结束日期"
                               :default-time="['00:00:00', '23:59:59']"
                             /></el-form-item><el-form-item><el-button
                               icon="el-icon-search"
                               @click="handleQuery"
                             >搜索</el-button><el-button
                               icon="el-icon-refresh"
                               @click="resetQuery"
                             >重置</el-button><el-button
                               v-hasPermi="['mes:pro-work-order:create']"
                               type="primary"
                               plain
                               icon="el-icon-plus"
                               @click="openForm('create')"
                             >新增</el-button><el-button
                               v-hasPermi="['mes:pro-work-order:export']"
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
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    ><el-table-column
       label="工单编码"
       prop="code"
       width="220"
       fixed="left"
     ><template #default="scope"><el-button
       type="text"
       @click="openForm('detail', scope.row.id)"
     >{{ scope.row.code }}</el-button></template></el-table-column><el-table-column
       label="工单名称"
       align="center"
       prop="name"
       min-width="150"
     /><el-table-column
       label="工单类型"
       align="center"
       prop="type"
       width="100"
     ><template #default="scope"><dict-tag
       :type="DICT_TYPE.MES_PRO_WORK_ORDER_TYPE"
       :value="scope.row.type"
     /></template></el-table-column><el-table-column
       label="工单来源"
       align="center"
       prop="orderSourceType"
       width="100"
     ><template #default="scope"><dict-tag
       :type="DICT_TYPE.MES_PRO_WORK_ORDER_SOURCE_TYPE"
       :value="scope.row.orderSourceType"
     /></template></el-table-column><el-table-column
       label="来源单据编号"
       align="center"
       prop="orderSourceCode"
       width="140"
     /><el-table-column
       label="产品编码"
       align="center"
       prop="productCode"
       width="120"
     /><el-table-column
       label="产品名称"
       align="center"
       prop="productName"
       min-width="120"
     /><el-table-column
       label="规格型号"
       align="center"
       prop="productSpecification"
       width="120"
     /><el-table-column
       label="单位"
       align="center"
       prop="unitMeasureName"
       width="80"
     /><el-table-column
       label="工单数量"
       align="center"
       prop="quantity"
       width="100"
     /><el-table-column
       label="已生产数量"
       align="center"
       prop="quantityProduced"
       width="100"
     /><el-table-column
       label="客户编码"
       align="center"
       prop="clientCode"
       width="120"
     /><el-table-column
       label="客户名称"
       align="center"
       prop="clientName"
       width="120"
     /><el-table-column
       label="需求日期"
       align="center"
       prop="requestDate"
       :formatter="dateFormatter2"
       width="180"
     /><el-table-column
       label="工单状态"
       align="center"
       prop="status"
       width="100"
     ><template #default="scope"><dict-tag
       :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
       :value="scope.row.status"
     /></template></el-table-column><el-table-column
       label="创建时间"
       align="center"
       prop="createTime"
       :formatter="dateFormatter"
       width="180"
     />
      <el-table-column
        label="操作"
        align="center"
        width="200"
        fixed="right"
      ><template #default="scope"><el-button
        v-if="scope.row.status === MesProWorkOrderStatusEnum.PREPARE"
        v-hasPermi="['mes:pro-work-order:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-if="scope.row.status === MesProWorkOrderStatusEnum.PREPARE"
        v-hasPermi="['mes:pro-work-order:delete']"
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button><el-button
        v-if="scope.row.status === MesProWorkOrderStatusEnum.CONFIRMED && scope.row.type === MesProWorkOrderTypeEnum.SELF"
        v-hasPermi="['mes:pro-work-order:create']"
        type="text"
        @click="handleAddChild(scope.row)"
      >新增</el-button><el-button
        v-if="scope.row.status === MesProWorkOrderStatusEnum.CONFIRMED"
        v-hasPermi="['mes:pro-work-order:update']"
        type="text"
        class="success-text"
        @click="openForm('finish', scope.row.id)"
      >完成</el-button><el-button
        v-if="scope.row.status === MesProWorkOrderStatusEnum.CONFIRMED"
        v-hasPermi="['mes:pro-work-order:update']"
        type="text"
        class="warning-text"
        @click="handleCancel(scope.row.id)"
      >取消</el-button><el-button
        v-hasPermi="['mes:pro-work-order:query']"
        type="text"
        @click="handleBarcode(scope.row)"
      >条码</el-button></template></el-table-column>
    </el-table><pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /><work-order-form
      ref="form"
      @success="getList"
    /><barcode-detail ref="barcodeDetail" /></div>
</template>

<script>
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/plugins/download'
import { handleTree } from '@/utils/tree'
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import WorkOrderForm from './WorkOrderForm.vue'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
import { MesProWorkOrderStatusEnum, MesProWorkOrderTypeEnum, BarcodeBizTypeEnum } from '@/views/mes/utils/constants'

export default {
  name: 'MesProWorkOrder', components: { WorkOrderForm, MdItemSelect, MdClientSelect, BarcodeDetail },
  data() { return { DICT_TYPE, MesProWorkOrderStatusEnum, MesProWorkOrderTypeEnum, loading: true, list: [], total: 0, exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, orderSourceCode: undefined, productId: undefined, clientId: undefined, type: undefined, requestDate: undefined }} }, created() { this.getList() },
  methods: {
    dateFormatter, dateFormatter2, getIntDictOptions,
    async getList() { this.loading = true; try { const response = await ProWorkOrderApi.getWorkOrderPage(this.queryParams); this.list = handleTree(response.data.list, 'id', 'parentId'); this.total = response.data.total } finally { this.loading = false } }, handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() }, openForm(type, id, parentRow) { this.$refs.form.open(type, id, parentRow) }, handleAddChild(row) { this.openForm('create', undefined, row) },
    async handleCancel(id) { try { await this.$modal.confirm('确认要取消该工单吗？取消后不可恢复。'); await ProWorkOrderApi.cancelWorkOrder(id); this.$modal.msgSuccess('工单已取消'); await this.getList() } catch (error) { /* canceled */ } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该生产工单？'); await ProWorkOrderApi.deleteWorkOrder(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* canceled */ } },
    async handleBarcode(row) { await this.$refs.barcodeDetail.openByBusiness(row.id, BarcodeBizTypeEnum.WORKORDER, row.code, row.name) },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有生产工单？'); this.exportLoading = true; const response = await ProWorkOrderApi.exportWorkOrder(this.queryParams); download.excel(response, '生产工单.xls') } catch (error) { /* canceled */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.danger-text { color: #f56c6c; }.success-text { color: #67c23a; }.warning-text { color: #e6a23c; }</style>
