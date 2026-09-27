<template>
  <div
    v-loading="loading"
    class="product-details-header"
  >
    <div class="header-row">
      <span class="product-name">{{ product.name || '-' }}</span>
      <el-button
        v-if="product.id"
        v-hasPermi="['crm:product:update']"
        @click="openForm('update', product.id)"
      >编辑</el-button>
    </div>
    <el-card shadow="never">
      <el-descriptions
        :column="4"
        direction="vertical"
        border
      >
        <el-descriptions-item label="产品类别">{{ product.categoryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产品单位">
          <dict-tag
            :type="DICT_TYPE.CRM_PRODUCT_UNIT"
            :value="product.unit"
          />
        </el-descriptions-item>
        <el-descriptions-item label="产品价格">
          {{ erpPriceInputFormatter(product.price) }} 元
        </el-descriptions-item>
        <el-descriptions-item label="产品编码">{{ product.no || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <product-form
      ref="form"
      @success="$emit('refresh')"
    />
  </div>
</template>

<script>
import ProductForm from '@/views/crm/product/ProductForm.vue'
import { DICT_TYPE } from '@/utils/dict'
import { erpPriceInputFormatter } from '@/utils'

export default {
  name: 'CrmProductDetailsHeader',
  components: { ProductForm },
  props: {
    product: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false }
  },
  data() {
    return { DICT_TYPE }
  },
  methods: {
    erpPriceInputFormatter,
    openForm(type, id) {
      this.$refs.form.open(type, id)
    }
  }
}
</script>

<style scoped>
.product-details-header { margin-bottom: 10px; }
.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.product-name { color: #303133; font-size: 20px; font-weight: 600; }
</style>
