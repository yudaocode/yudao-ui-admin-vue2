<template>
  <div class="app-container">
    <doc-alert
      title="【仓库】发货通知、销售出库、销售退货"
      url="https://doc.iocoder.cn/mes/wm/sales-out/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="出库单编号"
        prop="code"
      >
        <el-input
          v-model="queryParams.code"
          placeholder="请输入出库单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="出库单名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入出库单名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="销售订单编号"
        prop="salesOrderCode"
      >
        <el-input
          v-model="queryParams.salesOrderCode"
          placeholder="请输入销售订单编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="客户"
        prop="clientId"
      >
        <MdClientSelect
          v-model="queryParams.clientId"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="出库日期"
        prop="salesDate"
      >
        <el-date-picker
          v-model="queryParams.salesDate"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="单据状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择单据状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          v-hasPermi="['mes:wm-product-sales:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:wm-product-sales:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="出库单编号"
        align="center"
        prop="code"
        min-width="160"
      >
        <template #default="scope"><el-button
          type="text"
          @click="openForm('detail', scope.row.id)"
        >{{ scope.row.code }}</el-button></template>
      </el-table-column>
      <el-table-column
        label="出库单名称"
        align="center"
        prop="name"
        min-width="150"
      />
      <el-table-column
        label="发货通知单号"
        align="center"
        prop="noticeCode"
        min-width="160"
      />
      <el-table-column
        label="销售订单编号"
        align="center"
        prop="salesOrderCode"
        min-width="160"
      />
      <el-table-column
        label="客户编码"
        align="center"
        prop="clientCode"
        min-width="120"
      />
      <el-table-column
        label="客户名称"
        align="center"
        prop="clientName"
        min-width="120"
      />
      <el-table-column
        label="收货人"
        align="center"
        prop="contactName"
        min-width="100"
      />
      <el-table-column
        label="联系方式"
        align="center"
        prop="contactTelephone"
        min-width="120"
      />
      <el-table-column
        label="收货地址"
        align="center"
        prop="contactAddress"
        min-width="180"
      />
      <el-table-column
        label="承运商"
        align="center"
        prop="carrier"
        min-width="120"
      />
      <el-table-column
        label="运输单号"
        align="center"
        prop="shippingNumber"
        min-width="160"
      />
      <el-table-column
        label="出库日期"
        align="center"
        prop="salesDate"
        width="180"
      >
        <template #default="scope">{{ parseTime(scope.row.salesDate) }}</template>
      </el-table-column>
      <el-table-column
        label="单据状态"
        align="center"
        prop="status"
        min-width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.MES_WM_PRODUCT_SALES_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="240"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-if="scope.row.status === MesWmProductSalesStatusEnum.PREPARE"
            v-hasPermi="['mes:wm-product-sales:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === MesWmProductSalesStatusEnum.PREPARE"
            v-hasPermi="['mes:wm-product-sales:delete']"
            type="text"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
          <el-button
            v-if="scope.row.status === MesWmProductSalesStatusEnum.APPROVING"
            v-hasPermi="['mes:wm-product-sales:stock']"
            type="text"
            class="success-text"
            @click="openForm('stock', scope.row.id)"
          >拣货</el-button>
          <el-button
            v-if="scope.row.status === MesWmProductSalesStatusEnum.SHIPPING"
            v-hasPermi="['mes:wm-product-sales:shipping']"
            type="text"
            class="warning-text"
            @click="openForm('shipping', scope.row.id)"
          >填写运单</el-button>
          <el-button
            v-if="scope.row.status === MesWmProductSalesStatusEnum.APPROVED"
            v-hasPermi="['mes:wm-product-sales:finish']"
            type="text"
            class="success-text"
            @click="openForm('finish', scope.row.id)"
          >执行出库</el-button>
          <el-button
            v-if="cancelableStatuses.includes(scope.row.status)"
            v-hasPermi="['mes:wm-product-sales:cancel']"
            type="text"
            class="danger-text"
            @click="handleCancel(scope.row.id)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <ProductSalesForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { WmProductSalesApi } from '@/api/mes/wm/productsales'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import ProductSalesForm from './ProductSalesForm.vue'
import { MesWmProductSalesStatusEnum } from '@/views/mes/utils/constants'

export default {
  name: 'MesWmProductSales',
  components: { MdClientSelect, ProductSalesForm },
  data() {
    return {
      DICT_TYPE,
      MesWmProductSalesStatusEnum,
      cancelableStatuses: [
        MesWmProductSalesStatusEnum.CONFIRMED,
        MesWmProductSalesStatusEnum.APPROVING,
        MesWmProductSalesStatusEnum.SHIPPING,
        MesWmProductSalesStatusEnum.APPROVED
      ],
      statusOptions: getIntDictOptions(DICT_TYPE.MES_WM_PRODUCT_SALES_STATUS),
      loading: true,
      list: [],
      total: 0,
      exportLoading: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        salesOrderCode: undefined,
        clientId: undefined,
        salesDate: undefined,
        status: undefined
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      try {
        const response = await WmProductSalesApi.getProductSalesPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleCancel(id) {
      try {
        await this.$modal.confirm('确认取消该销售出库单？取消后不可恢复。')
        await WmProductSalesApi.cancelProductSales(id)
        this.$modal.msgSuccess('取消成功')
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败不追加提示
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除所选数据项?')
        await WmProductSalesApi.deleteProductSales(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败不追加提示
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有销售出库单数据项?')
        this.exportLoading = true
        const data = await WmProductSalesApi.exportProductSales(this.queryParams)
        this.$download.excel(data, '销售出库单.xls')
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败不追加提示
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
.success-text { color: #67c23a; }
.warning-text { color: #e6a23c; }
</style>
