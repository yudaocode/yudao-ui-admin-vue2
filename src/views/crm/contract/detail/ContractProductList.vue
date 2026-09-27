<template>
  <el-card shadow="never">
    <el-table
      :data="contract.products || []"
      stripe
      border
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="产品名称"
        prop="productName"
        min-width="160"
      />
      <el-table-column
        label="产品条码"
        prop="productNo"
        min-width="120"
      />
      <el-table-column
        label="产品单位"
        prop="productUnit"
        min-width="120"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.CRM_PRODUCT_UNIT"
            :value="scope.row.productUnit"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="产品价格（元）"
        prop="productPrice"
        min-width="130"
      ><template slot-scope="scope">{{ erpPriceInputFormatter(scope.row.productPrice) }}</template></el-table-column>
      <el-table-column
        label="合同价格（元）"
        prop="contractPrice"
        min-width="130"
      ><template slot-scope="scope">{{ erpPriceInputFormatter(scope.row.contractPrice) }}</template></el-table-column>
      <el-table-column
        label="数量"
        prop="count"
        width="100"
      />
      <el-table-column
        label="合计金额（元）"
        prop="totalPrice"
        min-width="130"
      ><template slot-scope="scope">{{ erpPriceInputFormatter(scope.row.totalPrice) }}</template></el-table-column>
    </el-table>
    <div class="product-total"><span>整单折扣：{{ erpPriceInputFormatter(contract.discountPercent) }}%</span><span>产品总金额：{{ erpPriceInputFormatter(contract.totalProductPrice) }} 元</span></div>
  </el-card>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { erpPriceInputFormatter } from '@/utils'

export default {
  name: 'ContractProductList',
  props: { contract: { type: Object, default: () => ({}) }},
  data() { return { DICT_TYPE, erpPriceInputFormatter } }
}
</script>

<style scoped>
.product-total { display: flex; justify-content: flex-end; gap: 24px; margin-top: 12px; color: #606266; }
</style>
