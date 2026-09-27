<!-- WMS 库存流水 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【库存】库存记录、流水、统计"
      url="https://doc.iocoder.cn/wms/inventory/"
    />

    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      size="small"
      label-width="76px"
      @submit.native.prevent
    >
      <el-form-item
        label="单据类型"
        prop="orderType"
      >
        <el-select
          v-model="queryParams.orderType"
          clearable
          placeholder="请选择单据类型"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in orderTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="单据号"
        prop="orderNo"
      >
        <el-input
          v-model="queryParams.orderNo"
          clearable
          placeholder="请输入单据号"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="仓库"
        prop="warehouseId"
      >
        <warehouse-select
          v-model="queryParams.warehouseId"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="商品编号"
        prop="itemCode"
      >
        <el-input
          v-model="queryParams.itemCode"
          clearable
          placeholder="请输入商品编号"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="商品名称"
        prop="itemName"
      >
        <el-input
          v-model="queryParams.itemName"
          clearable
          placeholder="请输入商品名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="规格编号"
        prop="skuCode"
      >
        <el-input
          v-model="queryParams.skuCode"
          clearable
          placeholder="请输入规格编号"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="规格名称"
        prop="skuName"
      >
        <el-input
          v-model="queryParams.skuName"
          clearable
          placeholder="请输入规格名称"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="操作时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          :shortcuts="defaultShortcuts"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <div class="section-title">库存流水</div>
    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        fixed="left"
        label="单据号"
        prop="orderNo"
        width="180"
      />
      <el-table-column
        fixed="left"
        label="单据类型"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.WMS_ORDER_TYPE"
            :value="scope.row.orderType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品信息"
        min-width="220"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.itemName || "-" }}</div>
          <div
            v-if="scope.row.itemCode"
            class="sub-text"
          >
            商品编号：{{ scope.row.itemCode }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="规格信息"
        min-width="180"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.skuName || "-" }}</div>
          <div
            v-if="scope.row.skuCode"
            class="sub-text"
          >
            规格编号：{{ scope.row.skuCode }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="仓库"
        min-width="160"
      >
        <template slot-scope="scope">{{
          scope.row.warehouseName || "-"
        }}</template>
      </el-table-column>
      <el-table-column
        label="操作前"
        min-width="110"
        align="right"
      >
        <template slot-scope="scope">{{
          formatQuantity(scope.row.beforeQuantity) || "-"
        }}</template>
      </el-table-column>
      <el-table-column
        label="操作后"
        min-width="110"
        align="right"
      >
        <template slot-scope="scope">{{
          formatQuantity(scope.row.afterQuantity) || "-"
        }}</template>
      </el-table-column>
      <el-table-column
        label="数量/金额(元)"
        min-width="150"
      >
        <template slot-scope="scope">
          <div class="amount-line">
            <span>数量：</span><span>{{ formatQuantity(scope.row.quantity) || "-" }}</span>
          </div>
          <div
            v-if="scope.row.price !== undefined && scope.row.price !== null"
            class="amount-line"
          >
            <span>单价：</span><span>{{ formatPrice(scope.row.price) }}</span>
          </div>
          <div
            v-if="
              scope.row.totalPrice !== undefined &&
                scope.row.totalPrice !== null
            "
            class="amount-line"
          >
            <span>金额：</span><span>{{ formatPrice(scope.row.totalPrice) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作时间"
        prop="createTime"
        width="180"
        fixed="right"
        align="center"
        :formatter="dateFormatter"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { InventoryHistoryApi } from '@/api/wms/inventory/history'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { dateFormatter, formatDate } from '@/utils'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import { formatPrice, formatQuantity } from '@/views/wms/utils/format'

export default {
  name: 'WmsInventoryHistory',
  components: { WarehouseSelect },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      list: [],
      total: 0,
      queryParams: this.getDefaultQueryParams(),
      defaultShortcuts: [
        {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }
      ]
    }
  },
  computed: {
    orderTypeDictDatas() {
      return getDictDatas(DICT_TYPE.WMS_ORDER_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatPrice,
    formatQuantity,
    dateFormatter,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        orderType: undefined,
        orderNo: undefined,
        itemCode: undefined,
        itemName: undefined,
        skuCode: undefined,
        skuName: undefined,
        warehouseId: undefined,
        createTime: undefined
      }
    },
    getList() {
      this.loading = true
      return InventoryHistoryApi.getInventoryHistoryPage(this.queryParams)
        .then((response) => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      Object.assign(this.queryParams, this.getDefaultQueryParams())
      this.getList()
    },
    formatDate,
    formatDateOnly(value) {
      const formatted = formatDate(value)
      return formatted ? formatted.slice(0, 10) : '-'
    }
  }
}
</script>

<style scoped>
.section-title {
  margin: 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.sub-text {
  color: #909399;
  font-size: 12px;
}

.amount-line {
  display: flex;
  justify-content: space-between;
  line-height: 22px;
}
</style>
