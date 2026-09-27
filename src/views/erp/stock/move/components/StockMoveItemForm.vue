<template>
  <div>
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
          label="调出仓库"
          min-width="125"
        >
          <template slot-scope="scope">
            <el-form-item
              :prop="'items.' + scope.$index + '.fromWarehouseId'"
              :rules="formRules.fromWarehouseId"
              class="item-form-item"
            >
              <el-select
                v-model="scope.row.fromWarehouseId"
                clearable
                filterable
                placeholder="请选择调出仓库"
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
          label="调入仓库"
          min-width="125"
        >
          <template slot-scope="scope">
            <el-form-item
              :prop="'items.' + scope.$index + '.toWarehouseId'"
              :rules="getToWarehouseRules(scope.row)"
              class="item-form-item"
            >
              <el-select
                v-model="scope.row.toWarehouseId"
                clearable
                filterable
                placeholder="请选择调入仓库"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="String(item.id) === String(scope.row.fromWarehouseId)"
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
            <el-form-item
              :prop="'items.' + scope.$index + '.productId'"
              :rules="formRules.productId"
              class="item-form-item"
            >
              <el-select
                v-model="scope.row.productId"
                clearable
                filterable
                placeholder="请选择产品"
                @change="onChangeProduct($event, scope.row)"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column
          label="库存"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-input
              :value="erpCountInputFormatter(scope.row.stockCount)"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          label="条码"
          min-width="150"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.productBarCode"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          label="单位"
          min-width="80"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.productUnitName"
              disabled
            />
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
          label="合计金额"
          prop="totalPrice"
          fixed="right"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-input
              :value="erpPriceInputFormatter(scope.row.totalPrice)"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          min-width="150"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.remark"
              placeholder="请输入备注"
            />
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
              @click="handleDelete(scope.$index)"
            >—</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-row
      v-if="!disabled"
      type="flex"
      justify="center"
      class="mt10"
    >
      <el-button
        round
        @click="handleAdd"
      >+ 添加调拨产品</el-button>
    </el-row>
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { getWarehouseSimpleList } from '@/api/erp/stock/warehouse'
import { StockApi } from '@/api/erp/stock/stock'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

export default {
  name: 'StockMoveItemForm',
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
      productList: [],
      warehouseList: [],
      defaultWarehouse: undefined,
      optionsLoaded: false,
      formRules: {
        fromWarehouseId: [{ required: true, message: '调出仓库不能为空', trigger: 'change' }],
        productId: [{ required: true, message: '产品不能为空', trigger: 'change' }],
        count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    formModel() {
      return { items: this.formData }
    }
  },
  watch: {
    items: {
      immediate: true,
      handler(value) {
        this.formData = value || []
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
    this.loadOptions()
  },
  methods: {
    erpCountInputFormatter,
    erpPriceInputFormatter,
    loadOptions() {
      this.formLoading = true
      return Promise.all([getProductSimpleList(), getWarehouseSimpleList()]).then(([productResponse, warehouseResponse]) => {
        this.productList = productResponse.data
        this.warehouseList = warehouseResponse.data
        this.defaultWarehouse = this.warehouseList.find(item => item.defaultStatus)
      }).finally(() => {
        this.optionsLoaded = true
        this.formLoading = false
        this.ensureDefaultRow()
      })
    },
    ensureDefaultRow() {
      if (!this.disabled && this.optionsLoaded && this.formData.length === 0) {
        this.handleAdd()
      }
    },
    defaultRow() {
      return {
        id: undefined,
        fromWarehouseId: this.defaultWarehouse ? this.defaultWarehouse.id : undefined,
        toWarehouseId: undefined,
        productId: undefined,
        productUnitName: undefined,
        productBarCode: undefined,
        productPrice: undefined,
        stockCount: undefined,
        count: 1,
        totalPrice: undefined,
        remark: undefined
      }
    },
    getToWarehouseRules(row) {
      return [
        { required: true, message: '调入仓库不能为空', trigger: 'change' },
        {
          validator: (_rule, value, callback) => {
            const sameWarehouse = value !== undefined && value !== null &&
              row.fromWarehouseId !== undefined && row.fromWarehouseId !== null &&
              String(value) === String(row.fromWarehouseId)
            if (sameWarehouse) {
              callback(new Error('调出、调入仓库不能相同'))
              return
            }
            callback()
          },
          trigger: 'change'
        }
      ]
    },
    handleAdd() {
      this.formData.push(this.defaultRow())
    },
    handleDelete(index) {
      this.formData.splice(index, 1)
    },
    onChangeWarehouse(_warehouseId, row) {
      if (row.toWarehouseId !== undefined && row.toWarehouseId !== null &&
        String(row.fromWarehouseId) === String(row.toWarehouseId)) {
        row.toWarehouseId = undefined
      }
      this.setStockCount(row)
    },
    onChangeProduct(productId, row) {
      const product = this.productList.find(item => String(item.id) === String(productId))
      if (product) {
        row.productUnitName = product.unitName
        row.productBarCode = product.barCode
        row.productPrice = product.minPrice
      } else {
        row.productUnitName = undefined
        row.productBarCode = undefined
        row.productPrice = undefined
      }
      this.setStockCount(row)
    },
    setStockCount(row) {
      if (!row.productId || !row.fromWarehouseId) {
        row.stockCount = undefined
        return Promise.resolve()
      }
      row.stockCount = undefined
      return StockApi.getStock2(row.productId, row.fromWarehouseId).then(response => {
        const stock = response.data
        const count = stock && stock.count !== undefined && stock.count !== null
          ? Number(stock.count)
          : 0
        row.stockCount = Number.isFinite(count) ? count : 0
      })
    },
    recalculate() {
      (this.formData || []).forEach(item => {
        const totalPrice = erpPriceMultiply(item.productPrice, item.count)
        if (item.totalPrice !== totalPrice) this.$set(item, 'totalPrice', totalPrice)
      })
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (['count', 'totalPrice'].includes(column.property)) {
          const sum = getSumValue(data.map(item => Number(item[column.property])))
          return column.property === 'count'
            ? erpCountInputFormatter(sum)
            : erpPriceInputFormatter(sum)
        }
        return ''
      })
    },
    validate(callback) {
      if (!this.formData.length) {
        this.$modal.msgError('请至少添加一个调拨产品')
        if (callback) callback(false)
        return Promise.resolve(false)
      }
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

.mt10 {
  margin-top: 10px;
}
</style>
