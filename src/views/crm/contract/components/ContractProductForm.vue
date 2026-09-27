<template>
  <div>
    <el-table
      :data="formData"
      stripe
      border
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="产品名称"
        min-width="180"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.productId"
            filterable
            clearable
            :disabled="disabled"
            placeholder="请选择产品"
            style="width: 100%"
            @change="handleProductChange(scope.row)"
          >
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        label="产品编码"
        prop="productNo"
        min-width="120"
      />
      <el-table-column
        label="单位"
        prop="productUnit"
        width="110"
      />
      <el-table-column
        label="产品价格"
        prop="productPrice"
        min-width="120"
      >
        <template slot-scope="scope">
          {{ formatMoney(scope.row.productPrice) }}
        </template>
      </el-table-column>
      <el-table-column
        label="合同价格"
        min-width="140"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.contractPrice"
            :disabled="disabled"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
            @change="recalculateRow(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="数量"
        min-width="120"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.count"
            :disabled="disabled"
            :min="0"
            :precision="3"
            controls-position="right"
            style="width: 100%"
            @change="recalculateRow(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="合计"
        prop="totalPrice"
        min-width="120"
      >
        <template slot-scope="scope">
          {{ formatMoney(scope.row.totalPrice) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="!disabled"
            type="text"
            size="mini"
            @click="removeRow(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-if="!disabled"
      class="contract-product-actions"
    >
      <el-button
        round
        @click="addRow"
      >+ 添加产品</el-button>
    </div>
  </div>
</template>

<script>
import * as ProductApi from '@/api/crm/product'

function cloneRow(row) {
  return Object.assign(
    {
      id: undefined,
      productId: undefined,
      productName: '',
      productNo: '',
      productUnit: '',
      productPrice: undefined,
      contractPrice: undefined,
      count: 1,
      totalPrice: undefined
    },
    row || {}
  )
}

export default {
  name: 'CrmContractProductForm',
  props: {
    value: {
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
      formData: [],
      productList: [],
      syncing: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.syncing = true
        this.formData = (Array.isArray(val) ? val : []).map(cloneRow)
        this.recalculateAll()
        this.$nextTick(() => {
          this.syncing = false
        })
      }
    },
    formData: {
      deep: true,
      handler() {
        if (this.syncing) return
        this.recalculateAll()
        this.emitChange()
      }
    }
  },
  mounted() {
    ProductApi.getProductSimpleList().then((response) => {
      this.productList = response.data
    })
  },
  methods: {
    formatMoney(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '-'
    },
    emitChange() {
      this.$emit('input', this.formData.map(cloneRow))
    },
    recalculateRow(row) {
      const price = Number(row.contractPrice || 0)
      const count = Number(row.count || 0)
      row.totalPrice = Number((price * count).toFixed(2))
    },
    recalculateAll() {
      this.formData.forEach((row) => {
        this.recalculateRow(row)
      })
    },
    addRow() {
      this.formData.push(cloneRow())
      this.emitChange()
    },
    removeRow(index) {
      this.formData.splice(index, 1)
      this.emitChange()
    },
    handleProductChange(row) {
      const product = this.productList.find(item => item.id === row.productId)
      if (!product) {
        row.productName = ''
        row.productNo = ''
        row.productUnit = ''
        row.productPrice = undefined
        row.contractPrice = undefined
        row.totalPrice = undefined
        this.emitChange()
        return
      }
      row.productName = product.name
      row.productNo = product.no
      row.productUnit = product.unit
      row.productPrice = product.price
      if (row.contractPrice === undefined || row.contractPrice === null) {
        row.contractPrice = product.price
      }
      this.recalculateRow(row)
      this.emitChange()
    }
  }
}
</script>

<style scoped>
.contract-product-actions {
  margin-top: 12px;
  text-align: center;
}
</style>
