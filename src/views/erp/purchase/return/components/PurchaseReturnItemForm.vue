<template>
  <el-form
    ref="form"
    v-loading="formLoading"
    :model="formModel"
    :rules="formRules"
    label-width="0px"
    :inline-message="true"
    :disabled="disabled"
  >
    <el-table
      :data="formData"
      border
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column
        label="序号"
        type="index"
        align="center"
        width="60"
      />
      <el-table-column
        label="仓库名称"
        min-width="125"
      >
        <template slot-scope="scope">
          <el-form-item
            :prop="'items.' + scope.$index + '.warehouseId'"
            :rules="formRules.warehouseId"
            class="item-form-item"
          >
            <el-select
              v-model="scope.row.warehouseId"
              clearable
              filterable
              placeholder="请选择仓库"
              @change="onChangeWarehouse($event, scope.row)"
            >
              <el-option
                v-for="item in warehouseList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="产品名称"
        min-width="180"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              v-model="scope.row.productName"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpCountInputFormatter(scope.row.stockCount)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="条码"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              v-model="scope.row.productBarCode"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="单位"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              v-model="scope.row.productUnitName"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasInCount"
        label="已入库"
        fixed="right"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpCountInputFormatter(scope.row.inCount)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasReturnCount"
        label="已退货"
        fixed="right"
        min-width="80"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpCountInputFormatter(scope.row.returnCount)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="数量"
        prop="count"
        fixed="right"
        min-width="140"
      >
        <template slot-scope="scope">
          <el-form-item
            :prop="'items.' + scope.$index + '.count'"
            :rules="formRules.count"
            class="item-form-item"
          >
            <el-input-number
              v-model="scope.row.count"
              controls-position="right"
              :min="0.001"
              :precision="3"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="产品单价"
        fixed="right"
        min-width="120"
      >
        <template slot-scope="scope">
          <el-form-item
            :prop="'items.' + scope.$index + '.productPrice'"
            class="item-form-item"
          >
            <el-input-number
              v-model="scope.row.productPrice"
              controls-position="right"
              :min="0.01"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="金额"
        prop="totalProductPrice"
        fixed="right"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpPriceInputFormatter(scope.row.totalProductPrice)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="税率（%）"
        fixed="right"
        min-width="115"
      >
        <template slot-scope="scope">
          <el-form-item
            :prop="'items.' + scope.$index + '.taxPercent'"
            class="item-form-item"
          >
            <el-input-number
              v-model="scope.row.taxPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="税额"
        prop="taxPrice"
        fixed="right"
        min-width="120"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpPriceInputFormatter(scope.row.taxPrice)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="税额合计"
        prop="totalPrice"
        fixed="right"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-form-item class="item-form-item">
            <el-input
              :value="erpPriceInputFormatter(scope.row.totalPrice)"
              disabled
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        min-width="150"
      >
        <template slot-scope="scope">
          <el-form-item
            :prop="'items.' + scope.$index + '.remark'"
            class="item-form-item"
          >
            <el-input
              v-model="scope.row.remark"
              placeholder="请输入备注"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed="right"
        label="操作"
        width="60"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            :disabled="formData.length === 1"
            @click="handleDelete(scope.$index)"
          >—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>

<script>
import { StockApi } from '@/api/erp/stock/stock'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

export default {
  name: 'PurchaseReturnItemForm',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formLoading: false,
      formData: this.items,
      warehouseList: [],
      defaultWarehouse: undefined,
      formRules: {
        warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'blur' }],
        productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
        count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    formModel() {
      return { items: this.formData }
    },
    hasInCount() {
      return Boolean(this.formData[0] && this.formData[0].inCount != null)
    },
    hasReturnCount() {
      return Boolean(this.formData[0] && this.formData[0].returnCount != null)
    }
  },
  watch: {
    items: {
      immediate: true,
      handler(value) {
        this.formData = value || []
        this.initializeItems()
        this.recalculate()
      }
    },
    formData: {
      deep: true,
      handler() {
        this.recalculate()
      }
    }
  },
  created() {
    this.loadWarehouses()
  },
  methods: {
    erpCountInputFormatter,
    erpPriceInputFormatter,
    loadWarehouses() {
      this.formLoading = true
      return getWarehouseSimpleList().then(response => {
        this.warehouseList = response.data
        this.defaultWarehouse = this.warehouseList.find(item => item.defaultStatus)
        this.initializeItems()
      }).finally(() => {
        this.formLoading = false
      })
    },
    initializeItems() {
      const items = this.formData || []
      items.forEach(item => {
        if (item.warehouseId == null && this.defaultWarehouse) {
          this.$set(item, 'warehouseId', this.defaultWarehouse.id)
        }
        if (item.stockCount == null && item.warehouseId != null) {
          this.setStockCount(item)
        }
      })
    },
    /** 重新计算产品金额、税额和含税金额 */
    recalculate() {
      const items = this.formData || []
      items.forEach(item => {
        const totalProductPrice = erpPriceMultiply(item.productPrice, item.count)
        const taxPercent = Number(item.taxPercent)
        const taxPrice = totalProductPrice == null
          ? undefined
          : erpPriceMultiply(
            totalProductPrice,
            (Number.isFinite(taxPercent) ? taxPercent : 0) / 100
          )
        const totalPrice = totalProductPrice == null
          ? undefined
          : totalProductPrice + (taxPrice || 0)
        if (!Object.is(item.totalProductPrice, totalProductPrice)) {
          this.$set(item, 'totalProductPrice', totalProductPrice)
        }
        if (!Object.is(item.taxPrice, taxPrice)) {
          this.$set(item, 'taxPrice', taxPrice)
        }
        if (!Object.is(item.totalPrice, totalPrice)) {
          this.$set(item, 'totalPrice', totalPrice)
        }
      })
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (['count', 'totalProductPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
          const sum = getSumValue(data.map(item => Number(item[column.property])))
          return column.property === 'count'
            ? erpCountInputFormatter(sum)
            : erpPriceInputFormatter(sum)
        }
        return ''
      })
    },
    handleDelete(index) {
      this.formData.splice(index, 1)
    },
    onChangeWarehouse(warehouseId, row) {
      if (warehouseId == null) {
        this.$set(row, 'stockCount', 0)
        return
      }
      this.setStockCount(row)
    },
    setStockCount(row) {
      if (!row.productId) return
      return StockApi.getStockCount(row.productId).then(response => {
        this.$set(row, 'stockCount', Number(response.data) || 0)
      })
    },
    validate(callback) {
      if (!this.$refs.form) {
        if (callback) callback(true)
        return Promise.resolve(true)
      }
      if (callback) return this.$refs.form.validate(callback)
      return new Promise(resolve => this.$refs.form.validate(resolve))
    }
  }
}
</script>

<style scoped>
.item-form-item {
  margin-bottom: 0;
}
</style>
