<template>
  <div class="sku-list">
    <el-table
      v-if="!isDetail"
      ref="skuTable"
      :data="isBatch ? batchSkus : rows"
      border
      size="small"
      max-height="500"
      class="sku-table"
    >
      <el-table-column
        label="图片"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          <ImageUpload
            v-model="scope.row.picUrl"
            :limit="1"
            :is-show-tip="false"
            class="sku-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-for="(header, index) in tableHeaders"
        :key="header.prop || index"
        :label="header.label"
        min-width="110"
        align="center"
      >
        <template slot-scope="scope">
          <span class="property-value">{{ propertyValue(scope.row, index) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="商品条码"
        min-width="150"
        align="center"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.barCode"
            size="small"
            placeholder="请输入条码"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="销售价（元）"
        min-width="145"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.price"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="市场价（元）"
        min-width="145"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.marketPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="成本价（元）"
        min-width="145"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.costPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        min-width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.stock"
            :min="0"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="重量（kg）"
        min-width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.weight"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="体积（m³）"
        min-width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.volume"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            size="small"
          />
        </template>
      </el-table-column>
      <template v-if="propFormData && propFormData.subCommissionType">
        <el-table-column
          label="一级返佣（元）"
          min-width="145"
          align="center"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.firstBrokeragePrice"
              :min="0"
              :precision="2"
              :step="0.1"
              controls-position="right"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="二级返佣（元）"
          min-width="145"
          align="center"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.secondBrokeragePrice"
              :min="0"
              :precision="2"
              :step="0.1"
              controls-position="right"
              size="small"
            />
          </template>
        </el-table-column>
      </template>
      <el-table-column
        v-if="propFormData && propFormData.specType && !isBatch"
        label="操作"
        width="80"
        fixed="right"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            class="danger-text"
            @click="deleteSku(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <div class="sku-empty">请先添加属性及属性值</div>
      </template>
    </el-table>

    <el-table
      v-else
      :data="rows"
      border
      size="small"
      max-height="500"
      class="sku-table sku-detail-table"
    >
      <el-table-column
        label="图片"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="sku-preview"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-for="(header, index) in tableHeaders"
        :key="header.prop || index"
        :label="header.label"
        min-width="100"
        align="center"
      >
        <template slot-scope="scope">
          <span class="property-value">{{ propertyValue(scope.row, index) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="商品条码"
        min-width="120"
        prop="barCode"
        align="center"
      />
      <el-table-column
        label="销售价（元）"
        min-width="110"
        align="center"
      >
        <template slot-scope="scope">{{ displayMoney(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column
        label="市场价（元）"
        min-width="110"
        align="center"
      >
        <template slot-scope="scope">{{ displayMoney(scope.row.marketPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="成本价（元）"
        min-width="110"
        align="center"
      >
        <template slot-scope="scope">{{ displayMoney(scope.row.costPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="库存"
        min-width="80"
        prop="stock"
        align="center"
      />
      <el-table-column
        label="重量（kg）"
        min-width="100"
        prop="weight"
        align="center"
      />
      <el-table-column
        label="体积（m³）"
        min-width="100"
        prop="volume"
        align="center"
      />
      <template v-if="propFormData && propFormData.subCommissionType">
        <el-table-column
          label="一级返佣（元）"
          min-width="110"
          align="center"
        >
          <template slot-scope="scope">{{ displayMoney(scope.row.firstBrokeragePrice) }}</template>
        </el-table-column>
        <el-table-column
          label="二级返佣（元）"
          min-width="110"
          align="center"
        >
          <template slot-scope="scope">{{ displayMoney(scope.row.secondBrokeragePrice) }}</template>
        </el-table-column>
      </template>
      <template slot="empty">
        <div class="sku-empty">暂无 SKU</div>
      </template>
    </el-table>

    <div
      v-if="isBatch"
      class="batch-actions"
    >
      <el-button
        type="primary"
        plain
        size="mini"
        @click="batchAdd"
      >批量应用到全部 SKU</el-button>
      <span class="batch-tip">批量设置只覆盖条码、价格、库存、重量和体积等字段</span>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'

const defaultSku = () => ({
  name: '',
  properties: [],
  price: 0,
  marketPrice: 0,
  costPrice: 0,
  barCode: '',
  picUrl: '',
  stock: 0,
  weight: 0,
  volume: 0,
  firstBrokeragePrice: 0,
  secondBrokeragePrice: 0
})

export default {
  name: 'MallSpuSkuList',
  components: { ImageUpload },
  props: {
    propFormData: {
      type: Object,
      default: () => ({ skus: [] })
    },
    propertyList: {
      type: Array,
      default: () => []
    },
    ruleConfig: {
      type: Array,
      default: () => []
    },
    isBatch: {
      type: Boolean,
      default: false
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    moneyInCents: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      batchSkus: [defaultSku()]
    }
  },
  computed: {
    rows() {
      if (!this.propFormData) return []
      return Array.isArray(this.propFormData.skus) ? this.propFormData.skus : []
    },
    tableHeaders() {
      return (this.propertyList || []).map((item, index) => ({
        prop: 'property' + index,
        label: item.name || ('属性' + (index + 1))
      }))
    }
  },
  watch: {
    propertyList: {
      deep: true,
      immediate: true,
      handler(value) {
        if (this.propFormData && this.propFormData.specType && Array.isArray(value) && value.length) {
          this.generateTableData(value)
        }
        if (this.isBatch) this.batchSkus = [Object.assign(defaultSku(), this.batchSkus[0] || {})]
      }
    },
    propFormData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (value && !Array.isArray(value.skus)) this.$set(value, 'skus', [defaultSku()])
      }
    }
  },
  methods: {
    propertyValue(row, index) {
      const property = row && Array.isArray(row.properties) ? row.properties[index] : null
      if (property) return property.valueName || property.name || property.value || ''
      // Legacy SPU payloads used a plain `spec` string array.
      return row && Array.isArray(row.spec) ? row.spec[index] || '' : ''
    },
    displayMoney(value) {
      if (value === undefined || value === null || value === '') return ''
      const number = Number(value)
      return (this.moneyInCents ? number / 100 : number).toFixed(2)
    },
    cloneSku(source) {
      return Object.assign(defaultSku(), JSON.parse(JSON.stringify(source || {})))
    },
    batchAdd() {
      this.validateProperty()
      const source = this.batchSkus[0] || defaultSku()
      this.rows.forEach(row => {
        Object.keys(source).forEach(key => {
          if (key === 'properties' || key === 'name') return
          this.$set(row, key, source[key])
        })
      })
      this.$emit('batch-change', this.rows)
    },
    deleteSku(row) {
      const index = this.rows.indexOf(row)
      if (index > -1) this.rows.splice(index, 1)
    },
    validateProperty() {
      if (!this.propFormData || !this.propFormData.specType) return true
      const invalid = (this.propertyList || []).some(item => !Array.isArray(item.values) || item.values.length === 0)
      if (invalid) {
        const message = '存在商品属性值为空，请先完善属性值'
        if (this.$modal && this.$modal.msgWarning) this.$modal.msgWarning(message)
        else if (this.$message) this.$message.warning(message)
        throw new Error(message)
      }
      return true
    },
    getValue(object, path) {
      return String(path || '').split('.').reduce((value, key) => value && value[key], object)
    },
    validateSku() {
      this.validateProperty()
      for (const row of this.rows) {
        for (const rule of this.ruleConfig || []) {
          if (typeof rule.rule === 'function' && !rule.rule(this.getValue(row, rule.name))) {
            const message = rule.message || '请检查 SKU 配置'
            if (this.$modal && this.$modal.msgWarning) this.$modal.msgWarning(message)
            else if (this.$message) this.$message.warning(message)
            throw new Error(message)
          }
        }
      }
      return true
    },
    generateTableData(propertyList) {
      if (!this.propFormData || !this.propFormData.specType) return
      const list = Array.isArray(propertyList) ? propertyList : []
      if (!list.length || list.some(item => !Array.isArray(item.values) || item.values.length === 0)) return
      const combinations = this.cartesian(list.map(item => item.values))
      const oldRows = this.rows.slice()
      const nextRows = combinations.map(values => {
        const properties = values.map((value, index) => ({
          propertyId: list[index].id,
          propertyName: list[index].name,
          valueId: value.id,
          valueName: value.name
        }))
        const old = oldRows.find(row => JSON.stringify(row.properties || []) === JSON.stringify(properties))
        return old || Object.assign(defaultSku(), { properties })
      })
      this.$set(this.propFormData, 'skus', nextRows)
    },
    cartesian(groups) {
      if (!groups.length) return []
      return groups.reduce((result, group) => {
        const values = []
        result.forEach(prefix => {
          group.forEach(item => values.push(prefix.concat([item])))
        })
        return values
      }, [[]])
    },
    getSkuTableRef() {
      return this.$refs.skuTable
    }
  }
}
</script>

<style scoped>
.sku-table { width: 100%; }
.sku-image { width: 62px; margin: 0 auto; }
.sku-preview { width: 50px; height: 50px; }
.property-value { color: #40aaff; font-weight: 600; }
.danger-text { color: #f56c6c; }
.sku-empty { color: #909399; padding: 20px; }
.batch-actions { display: flex; align-items: center; margin-top: 12px; }
.batch-tip { color: #909399; margin-left: 12px; font-size: 12px; }
</style>
