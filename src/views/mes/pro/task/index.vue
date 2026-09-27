<!-- MES 生产排产 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】生产排产、工序流转卡"
      url="https://doc.iocoder.cn/mes/pro/schedule-card/"
    />
    <el-card
      shadow="never"
      class="filter-card"
    >
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="100px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="工单编码"
          prop="code"
        ><el-input
          v-model="queryParams.code"
          placeholder="请输入工单编码"
          clearable
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="工单名称"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          placeholder="请输入工单名称"
          clearable
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="来源单据"
          prop="orderSourceCode"
        ><el-input
          v-model="queryParams.orderSourceCode"
          placeholder="请输入来源单据编号"
          clearable
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="产品"
          prop="productId"
        ><md-item-select
          v-model="queryParams.productId"
          placeholder="请选择产品"
        /></el-form-item>
        <el-form-item
          label="客户"
          prop="clientId"
        ><md-client-select
          v-model="queryParams.clientId"
          placeholder="请选择客户"
        /></el-form-item>
        <el-form-item
          label="需求日期"
          prop="requestDate"
        ><el-date-picker
          v-model="queryParams.requestDate"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        /></el-form-item>
        <el-form-item><el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button><el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button><el-button
          type="warning"
          plain
          icon="el-icon-data-analysis"
          @click="openGanttEdit"
        >甘特图编辑</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card
      shadow="never"
      class="content-card"
    >
      <div slot="header">排产甘特图</div>
      <gantt-chart
        :tasks="ganttTasks"
        :readonly="true"
        :height="350"
      />
    </el-card>

    <el-card
      shadow="never"
      class="content-card"
    >
      <div slot="header">待排产工单</div>
      <el-table
        v-loading="loading"
        :data="workOrderList"
        stripe
        show-overflow-tooltip
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          label="工单编码"
          prop="code"
          width="220"
          fixed="left"
        ><template #default="scope"><el-button
          type="text"
          @click="openForm('detail', scope.row.id)"
        >{{ scope.row.code }}</el-button></template></el-table-column>
        <el-table-column
          label="工单名称"
          align="center"
          prop="name"
          min-width="150"
        />
        <el-table-column
          label="工单来源"
          align="center"
          prop="orderSourceType"
          width="100"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.MES_PRO_WORK_ORDER_SOURCE_TYPE"
          :value="scope.row.orderSourceType"
        /></template></el-table-column>
        <el-table-column
          label="来源单据编号"
          align="center"
          prop="orderSourceCode"
          width="140"
        />
        <el-table-column
          label="产品编码"
          align="center"
          prop="productCode"
          width="120"
        />
        <el-table-column
          label="产品名称"
          align="center"
          prop="productName"
          min-width="120"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="productSpecification"
          width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitMeasureName"
          width="80"
        />
        <el-table-column
          label="工单数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="调整数量"
          align="center"
          prop="quantityChanged"
          width="100"
        />
        <el-table-column
          label="已生产数量"
          align="center"
          prop="quantityProduced"
          width="100"
        />
        <el-table-column
          label="客户编码"
          align="center"
          prop="clientCode"
          width="120"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientName"
          width="120"
        />
        <el-table-column
          label="需求日期"
          align="center"
          prop="requestDate"
          :formatter="dateFormatter2"
          width="120"
        />
        <el-table-column
          label="排产状态"
          align="center"
          prop="status"
          width="100"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.MES_PRO_WORK_ORDER_STATUS"
          :value="scope.row.status"
        /></template></el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100"
          fixed="right"
        ><template #default="scope"><el-button
          v-if="scope.row.status === MesProWorkOrderStatusEnum.CONFIRMED"
          v-hasPermi="['mes:pro-task:create']"
          type="text"
          @click="openForm('schedule', scope.row.id)"
        >排产</el-button></template></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getWorkOrderList"
      />
    </el-card>
    <work-order-form2
      ref="form"
      @success="getWorkOrderList"
    />
  </div>
</template>

<script>
import { dateFormatter2 } from '@/utils/formatTime'
import { handleTree } from '@/utils/tree'
import { DICT_TYPE } from '@/utils/dict'
import { ProWorkOrderApi } from '@/api/mes/pro/workorder'
import { ProTaskApi } from '@/api/mes/pro/task'
import { MesProWorkOrderStatusEnum, MesProWorkOrderTypeEnum } from '@/views/mes/utils/constants'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import GanttChart from './components/GanttChart.vue'
import WorkOrderForm2 from './WorkOrderForm2.vue'

export default {
  name: 'MesProTask',
  components: { MdItemSelect, MdClientSelect, GanttChart, WorkOrderForm2 },
  data() {
    return {
      DICT_TYPE,
      MesProWorkOrderStatusEnum,
      loading: true,
      workOrderList: [],
      total: 0,
      ganttTasks: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        orderSourceCode: undefined,
        productId: undefined,
        clientId: undefined,
        requestDate: undefined,
        status: MesProWorkOrderStatusEnum.CONFIRMED,
        type: MesProWorkOrderTypeEnum.SELF
      }
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    dateFormatter2,
    async initialize() {
      await this.getWorkOrderList()
      await this.loadGanttPreview()
    },
    async getWorkOrderList() {
      this.loading = true
      try {
        const response = await ProWorkOrderApi.getWorkOrderPage(this.queryParams)
        this.workOrderList = handleTree(response.data.list, 'id', 'parentId')
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async loadGanttPreview() {
      try {
        const response = await ProTaskApi.getGanttTaskList(this.queryParams)
        this.ganttTasks = response.data
      } catch (error) {
        // 预览加载失败时保留上一次成功数据，与 Vue 3 页面一致
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getWorkOrderList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.status = MesProWorkOrderStatusEnum.CONFIRMED
      this.queryParams.type = MesProWorkOrderTypeEnum.SELF
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    openGanttEdit() {
      this.$router.push({ name: 'MesProTaskGanttEdit' })
    }
  }
}
</script>

<style scoped>
.filter-card, .content-card { margin-bottom: 16px; }
</style>
