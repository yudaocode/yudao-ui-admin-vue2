<template>
  <el-table
    :data="spuData"
    :expand-row-keys="expandRowKeys"
    row-key="id"
  >
    <el-table-column
      type="expand"
      width="30"
    >
      <template v-slot="scope">
        <el-table
          :ref="'skuTable-' + scope.row.id"
          :data="scope.row.skus || []"
          border
          max-height="500"
          size="small"
          style="width: 99%"
        >
          <el-table-column
            align="center"
            label="图片"
            min-width="80"
          >
            <template v-slot="skuScope">
              <el-image
                :src="skuScope.row.picUrl"
                :preview-src-list="skuScope.row.picUrl ? [skuScope.row.picUrl] : []"
                class="sku-image"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-for="(property, index) in propertyListFor(scope.row.id)"
            :key="property.id || index"
            :label="property.name"
            align="center"
            min-width="80"
          >
            <template v-slot="skuScope">
              <span class="property-value">
                {{ propertyValue(skuScope.row, index) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="商品条码"
            min-width="100"
            prop="barCode"
          />
          <el-table-column
            align="center"
            label="销售价(元)"
            min-width="80"
          >
            <template v-slot="skuScope">{{ formatToFraction(skuScope.row.price) }}</template>
          </el-table-column>
          <el-table-column
            align="center"
            label="市场价(元)"
            min-width="80"
          >
            <template v-slot="skuScope">{{ formatToFraction(skuScope.row.marketPrice) }}</template>
          </el-table-column>
          <el-table-column
            align="center"
            label="成本价(元)"
            min-width="80"
          >
            <template v-slot="skuScope">{{ formatToFraction(skuScope.row.costPrice) }}</template>
          </el-table-column>
          <el-table-column
            align="center"
            label="库存"
            min-width="80"
            prop="stock"
          />
          <slot />
        </el-table>
      </template>
    </el-table-column>
    <el-table-column
      key="id"
      align="center"
      label="商品编号"
      prop="id"
    />
    <el-table-column
      label="商品图"
      min-width="80"
    >
      <template v-slot="scope">
        <el-image
          :src="scope.row.picUrl"
          :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []"
          class="spu-image"
        />
      </template>
    </el-table-column>
    <el-table-column
      label="商品名称"
      min-width="300"
      prop="name"
      show-overflow-tooltip
    />
    <el-table-column
      align="center"
      label="商品售价"
      min-width="90"
      prop="price"
    >
      <template v-slot="scope">{{ formatToFraction(scope.row.price) }}</template>
    </el-table-column>
    <el-table-column
      align="center"
      label="销量"
      min-width="90"
      prop="salesCount"
    />
    <el-table-column
      align="center"
      label="库存"
      min-width="90"
      prop="stock"
    />
    <el-table-column
      v-if="spuData.length > 1 && deletable"
      align="center"
      label="操作"
      min-width="90"
    >
      <template v-slot="scope">
        <el-button
          type="text"
          @click="deleteSpu(scope.row.id)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'PromotionSpuAndSkuList',
  props: {
    spuList: {
      type: Array,
      default: () => []
    },
    ruleConfig: {
      type: Array,
      default: () => []
    },
    spuPropertyListP: {
      type: Array,
      default: () => []
    },
    deletable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      spuData: [],
      spuPropertyList: [],
      expandRowKeys: []
    }
  },
  watch: {
    spuList: {
      deep: true,
      immediate: true,
      handler(data) {
        if (!data) return
        this.spuData = data
      }
    },
    spuPropertyListP: {
      deep: true,
      immediate: true,
      handler(data) {
        if (!data) return
        this.spuPropertyList = data
        setTimeout(() => {
          this.expandRowKeys = data.map(item => String(item.spuId))
        }, 200)
      }
    }
  },
  methods: {
    getSkuConfigs(extendedAttribute) {
      this.validateSku()
      const products = []
      this.spuPropertyList.forEach(item => {
        const skus = (item.spuDetail && item.spuDetail.skus) || []
        skus.forEach(sku => {
          products.push(sku[extendedAttribute])
        })
      })
      return products
    },
    validateSku() {
      this.spuPropertyList.forEach(item => {
        const propertyList = item.propertyList || []
        propertyList.forEach(property => {
          if (!property.values || property.values.length === 0) {
            const message = '存在属性属性值为空，请先检查完善属性值后重试！！！'
            this.$modal.msgWarning(message)
            throw new Error(message)
          }
        })
      })
      let warningInfo = '请检查商品各行相关属性配置，'
      for (const spu of this.spuData) {
        for (const sku of spu.skus || []) {
          for (const rule of this.ruleConfig) {
            if (!rule.rule(this.getValue(sku, rule.name))) {
              warningInfo += rule.message
              this.$modal.msgWarning(warningInfo)
              throw new Error(warningInfo)
            }
          }
        }
      }
    },
    getValue(object, path) {
      return String(path).split('.').reduce((value, key) => {
        return value && typeof value === 'object' && key in value ? value[key] : undefined
      }, object)
    },
    propertyListFor(spuId) {
      const item = this.spuPropertyList.find(value => value.spuId === spuId)
      return item ? item.propertyList || [] : []
    },
    propertyValue(sku, index) {
      const property = Array.isArray(sku.properties) ? sku.properties[index] : undefined
      return property ? property.valueName : ''
    },
    formatToFraction(value) {
      if (value === undefined) return '0.00'
      return (Number(value) / 100).toFixed(2)
    },
    deleteSpu(spuId) {
      return this.$modal.confirm('是否删除商品编号为' + spuId + '的数据？').then(() => {
        const index = this.spuData.findIndex(item => item.id === spuId)
        this.spuData.splice(index, 1)
        this.$emit('delete', spuId)
      })
    }
  }
}
</script>

<style scoped>
.sku-image { width: 60px; height: 60px; }
.spu-image { width: 30px; height: 30px; }
.property-value { color: #40aaff; font-weight: 700; }
</style>
