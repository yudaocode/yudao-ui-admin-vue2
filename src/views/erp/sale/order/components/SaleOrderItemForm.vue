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
          label="金额"
          prop="totalProductPrice"
          fixed="right"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-input
              :value="erpPriceInputFormatter(scope.row.totalProductPrice)"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          label="税率（%）"
          fixed="right"
          min-width="115"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.taxPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="税额"
          prop="taxPrice"
          fixed="right"
          min-width="120"
        >
          <template slot-scope="scope">
            <el-input
              :value="erpPriceInputFormatter(scope.row.taxPrice)"
              disabled
            />
          </template>
        </el-table-column>
        <el-table-column
          label="税额合计"
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
      >+ 添加销售产品</el-button>
    </el-row>
  </div>
</template>

<script>
import { getProductSimpleList } from '@/api/erp/product/product'
import { StockApi } from '@/api/erp/stock/stock'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

export default {
  name: 'SaleOrderItemForm',
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
      formRules: {
        productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
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
        if (!this.disabled && this.formData.length === 0 && this.productList.length > 0) {
          this.handleAdd()
        }
        this.recalculate()
      }
    },
    disabled(value) {
      if (!value && this.formData.length === 0 && this.productList.length > 0) this.handleAdd()
    },
    formData: {
      deep: true,
      handler() {
        this.recalculate()
      }
    }
  },
  created() {
    this.loadProducts()
  },
  methods: {
    erpCountInputFormatter,
    erpPriceInputFormatter,
    loadProducts() {
      this.formLoading = true
      return getProductSimpleList()
        .then((response) => {
          this.productList = response.data
          if (!this.disabled && this.formData.length === 0) this.handleAdd()
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    defaultRow() {
      return {
        id: undefined,
        productId: undefined,
        productUnitName: undefined,
        productBarCode: undefined,
        productPrice: undefined,
        stockCount: undefined,
        count: 1,
        totalProductPrice: undefined,
        taxPercent: undefined,
        taxPrice: undefined,
        totalPrice: undefined,
        remark: undefined
      }
    },
    handleAdd() {
      this.formData.push(this.defaultRow())
    },
    handleDelete(index) {
      this.formData.splice(index, 1)
    },
    onChangeProduct(productId, row) {
      const product = this.productList.find((item) => item.id === productId)
      if (product) {
        row.productUnitName = product.unitName
        row.productBarCode = product.barCode
        row.productPrice = product.salePrice
      }
      this.setStockCount(row)
    },
    setStockCount(row) {
      if (!row.productId) return
      return StockApi.getStockCount(row.productId)
        .then((response) => {
          row.stockCount = Number(response.data) || 0
        })
    },
    recalculate() {
      (this.formData || []).forEach((item) => {
        item.totalProductPrice = erpPriceMultiply(item.productPrice, item.count)
        item.taxPrice = erpPriceMultiply(item.totalProductPrice, Number(item.taxPercent) / 100)
        if (item.totalProductPrice !== undefined && item.totalProductPrice !== null) {
          item.totalPrice = item.totalProductPrice + (item.taxPrice || 0)
        } else {
          item.totalPrice = undefined
        }
      })
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (['count', 'totalProductPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
          const sum = getSumValue(data.map((item) => Number(item[column.property])))
          return column.property === 'count'
            ? erpCountInputFormatter(sum)
            : erpPriceInputFormatter(sum)
        }
        return ''
      })
    },
    validate(callback) {
      if (!this.$refs.form) {
        if (callback) callback(true)
        return Promise.resolve(true)
      }
      if (callback) return this.$refs.form.validate(callback)
      return new Promise((resolve) => this.$refs.form.validate(resolve))
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
