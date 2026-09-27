<template>
  <el-card
    shadow="never"
    class="product-details-info"
  >
    <el-collapse v-model="activeNames">
      <el-collapse-item name="basicInfo">
        <template slot="title"><span class="section-title">基本信息</span></template>
        <el-descriptions
          :column="4"
          border
        >
          <el-descriptions-item label="产品名称">{{ product.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产品编码">{{ product.no || '-' }}</el-descriptions-item>
          <el-descriptions-item label="价格">
            {{ erpPriceInputFormatter(product.price) }} 元
          </el-descriptions-item>
          <el-descriptions-item label="产品描述">{{ product.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="产品类型">{{ product.categoryName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="是否上下架">
            <dict-tag
              :type="DICT_TYPE.CRM_PRODUCT_STATUS"
              :value="product.status"
            />
          </el-descriptions-item>
          <el-descriptions-item label="单位">
            <dict-tag
              :type="DICT_TYPE.CRM_PRODUCT_UNIT"
              :value="product.unit"
            />
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { erpPriceInputFormatter } from '@/utils'

export default {
  name: 'CrmProductDetailsInfo',
  props: {
    product: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      DICT_TYPE,
      activeNames: ['basicInfo']
    }
  },
  methods: { erpPriceInputFormatter }
}
</script>

<style scoped>
.section-title { color: #303133; font-size: 16px; font-weight: 600; }
</style>
