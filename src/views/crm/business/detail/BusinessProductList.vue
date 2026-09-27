<template>
  <el-card shadow="never"><div slot="header">产品清单</div><el-table
    :data="business.products || []"
    stripe
  ><el-table-column
    label="产品名称"
    prop="productName"
    min-width="160"
  /><el-table-column
    label="产品条码"
    prop="productNo"
    min-width="120"
  /><el-table-column
    label="产品单位"
    prop="productUnit"
    min-width="100"
  ><template slot-scope="scope"><dict-tag
    :type="DICT_TYPE.CRM_PRODUCT_UNIT"
    :value="scope.row.productUnit"
  /></template></el-table-column><el-table-column
    label="产品价格（元）"
    prop="productPrice"
    min-width="130"
  ><template slot-scope="scope">{{ formatPrice(scope.row.productPrice) }}</template></el-table-column><el-table-column
    label="商机价格（元）"
    prop="businessPrice"
    min-width="130"
  ><template slot-scope="scope">{{ formatPrice(scope.row.businessPrice) }}</template></el-table-column><el-table-column
    label="数量"
    prop="count"
    min-width="90"
  /><el-table-column
    label="合计金额（元）"
    prop="totalPrice"
    min-width="130"
  ><template slot-scope="scope">{{ formatPrice(scope.row.totalPrice) }}</template></el-table-column></el-table><div class="product-summary">整单折扣：{{ formatPrice(business.discountPercent) }}% 产品总金额：{{ formatPrice(business.totalProductPrice) }} 元</div></el-card>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
export default { name: 'CrmBusinessProductList', props: { business: { type: Object, default: () => ({}) }}, data() { return { DICT_TYPE } }, methods: { formatPrice(value) { return value === undefined || value === null ? '0.00' : Number(value).toFixed(2) } }}
</script>
<style scoped>.product-summary { padding-top: 12px; color: #606266; text-align: right; }</style>
