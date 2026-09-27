<!-- WMS 库存统计 -->
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
        label="统计维度"
        prop="type"
      >
        <el-radio-group
          v-model="queryParams.type"
          @change="handleTypeChange"
        >
          <el-radio-button
            v-for="item in dimensionOptions"
            :key="item.value"
            :label="item.value"
          >{{ item.label }}</el-radio-button>
        </el-radio-group>
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

    <div class="inventory-toolbar">
      <span class="section-title">库存统计</span>
      <el-checkbox
        v-model="filterZero"
        @change="handleFilterZeroChange"
      >
        过滤掉库存为 0 的商品
      </el-checkbox>
    </div>

    <el-table
      v-loading="loading"
      :data="list"
      :span-method="spanMethod"
      border
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        v-if="isWarehouseDimension"
        key="warehouse-dim-warehouse"
        label="仓库"
        min-width="160"
        prop="warehouseId"
      >
        <template slot-scope="scope">{{
          scope.row.warehouseName || "-"
        }}</template>
      </el-table-column>
      <el-table-column
        v-if="isWarehouseDimension"
        key="warehouse-dim-item"
        label="商品信息"
        min-width="240"
        prop="warehouseItemId"
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
        v-if="isWarehouseDimension"
        key="warehouse-dim-sku"
        label="规格信息"
        min-width="220"
        prop="skuId"
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
        v-if="!isWarehouseDimension"
        key="item-dim-item"
        label="商品信息"
        min-width="240"
        prop="itemId"
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
        v-if="!isWarehouseDimension"
        key="item-dim-sku"
        label="规格信息"
        min-width="220"
        prop="skuId"
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
        v-if="!isWarehouseDimension"
        key="item-dim-warehouse"
        label="仓库"
        min-width="160"
        prop="skuWarehouseId"
      >
        <template slot-scope="scope">{{
          scope.row.warehouseName || "-"
        }}</template>
      </el-table-column>

      <el-table-column
        label="库存"
        min-width="130"
        prop="quantity"
        align="right"
      >
        <template slot-scope="scope">{{
          formatQuantity(scope.row.quantity) || "-"
        }}</template>
      </el-table-column>
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
import { InventoryApi } from '@/api/wms/inventory'
import WarehouseSelect from '@/views/wms/md/warehouse/components/WarehouseSelect.vue'
import { formatQuantity } from '@/views/wms/utils/format'

const INVENTORY_DIMENSION = {
  WAREHOUSE: 'warehouse',
  ITEM: 'item'
}

export default {
  name: 'WmsInventory',
  components: { WarehouseSelect },
  data() {
    return {
      INVENTORY_DIMENSION,
      dimensionOptions: [
        { label: '仓库', value: INVENTORY_DIMENSION.WAREHOUSE },
        { label: '商品', value: INVENTORY_DIMENSION.ITEM }
      ],
      loading: false,
      list: [],
      total: 0,
      filterZero: false,
      queryParams: this.getDefaultQueryParams()
    }
  },
  computed: {
    isWarehouseDimension() {
      return this.queryParams.type === INVENTORY_DIMENSION.WAREHOUSE
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatQuantity,
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        type: INVENTORY_DIMENSION.WAREHOUSE,
        itemCode: undefined,
        itemName: undefined,
        skuCode: undefined,
        skuName: undefined,
        warehouseId: undefined
      }
    },
    getList() {
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        onlyPositiveQuantity: this.filterZero ? true : undefined
      })
      return InventoryApi.getInventoryPage(params)
        .then((response) => {
          const page = response.data
          this.list = page.list.map((item) =>
            Object.assign({}, item, {
              // 用于 span-method 的维度键，与 Vue3 页面保持一致。
              warehouseItemId: `${item.warehouseId || 0}-${item.itemId || 0}`,
              skuWarehouseId: `${item.skuId || 0}-${item.warehouseId || 0}`
            })
          )
          this.total = page.total
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
      this.filterZero = false
      this.getList()
    },
    handleTypeChange() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    handleFilterZeroChange() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    getRowPropertyValue(row, property) {
      return row ? row[property] : undefined
    },
    getRowSpanProperties() {
      return this.isWarehouseDimension
        ? ['warehouseId', 'warehouseItemId']
        : ['itemId', 'skuId', 'skuWarehouseId']
    },
    spanMethod({ column, rowIndex }) {
      const property = column && column.property
      const spanProperties = this.getRowSpanProperties()
      if (!property || spanProperties.indexOf(property) < 0) {
        return { rowspan: 1, colspan: 1 }
      }
      const row = this.list[rowIndex]
      if (!row) return { rowspan: 1, colspan: 1 }
      if (
        rowIndex > 0 &&
        this.getRowPropertyValue(this.list[rowIndex - 1], property) ===
          this.getRowPropertyValue(row, property)
      ) {
        return { rowspan: 0, colspan: 0 }
      }
      let rowspan = 1
      for (let index = rowIndex + 1; index < this.list.length; index += 1) {
        if (
          this.getRowPropertyValue(this.list[index], property) !==
          this.getRowPropertyValue(row, property)
        ) { break }
        rowspan += 1
      }
      return { rowspan, colspan: 1 }
    }
  }
}
</script>

<style scoped>
.inventory-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
}

.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>
