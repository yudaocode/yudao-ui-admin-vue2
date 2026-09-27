<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="65%"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :precision="0"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        label="活动商品"
        prop="spuId"
      >
        <el-button
          v-if="!isFormUpdate"
          type="primary"
          plain
          @click="openSpuSelect"
        >
          选择商品
        </el-button>
        <div
          v-if="spuList.length === 0"
          class="empty-products"
        >暂未选择积分商城商品</div>
        <div
          v-for="spu in spuList"
          :key="spu.id"
          class="spu-config"
        >
          <div class="spu-header">
            <el-image
              :src="spu.picUrl"
              :preview-src-list="[spu.picUrl]"
              class="spu-image"
            />
            <span class="spu-name">{{ spu.name }}</span>
            <span class="spu-id">商品编号：{{ spu.id }}</span>
          </div>
          <el-table
            :data="spu.skus"
            border
            size="mini"
          >
            <el-table-column
              label="SKU 编号"
              prop="id"
              align="center"
              width="100"
            />
            <el-table-column
              label="规格名称"
              prop="name"
              min-width="150"
            />
            <el-table-column
              label="商品价格"
              prop="price"
              align="center"
              width="110"
            >
              <template v-slot="scope">￥{{ fenToYuan(scope.row.price) }}</template>
            </el-table-column>
            <el-table-column
              label="商品库存"
              prop="stock"
              align="center"
              width="100"
            />
            <el-table-column
              label="可兑换库存"
              align="center"
              min-width="168"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.stock"
                  :min="0"
                  :max="scope.row.stock"
                  :precision="0"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="可兑换次数"
              align="center"
              min-width="168"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.count"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="所需积分"
              align="center"
              min-width="168"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.point"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="所需金额(元)"
              align="center"
              min-width="168"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.price"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <PointSpuSelect
      ref="spuSelect"
      @confirm="selectSpu"
    />
  </el-dialog>
</template>

<script>
import { PointActivityApi } from '@/api/mall/promotion/point'
import { getSpuDetailList } from '@/api/mall/product/spu'
import { deepClone } from '@/utils'
import PointSpuSelect from './components/PointSpuSelect.vue'
import { productRuleConfig, rules } from './pointActivity.data'

export default {
  name: 'PromotionPointActivityForm',
  components: { PointSpuSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      rules,
      productRuleConfig,
      isFormUpdate: false,
      spuList: [],
      detailRequestSequence: 0
    }
  },
  beforeDestroy() {
    this.detailRequestSequence += 1
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        spuId: undefined,
        sort: 0,
        remark: undefined
      }
    },
    /** 打开添加或修改弹窗。 */
    async open(type, id) {
      this.resetForm()
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增积分商城活动' : '修改积分商城活动'
      this.dialogVisible = true
      if (id === undefined || id === null) return true

      this.formLoading = true
      try {
        const response = await PointActivityApi.getPointActivity(id)
        const data = response.data
        this.isFormUpdate = true
        this.formData = Object.assign(this.getDefaultFormData(), {
          id: data.id,
          spuId: data.spuId,
          sort: data.sort,
          remark: data.remark
        })
        const products = Array.isArray(data.products) ? data.products : []
        const skuIds = products.map((product) => product.skuId)
        await this.getSpuDetails(data.spuId, skuIds, products)
        return true
      } finally {
        this.formLoading = false
      }
    },
    openSpuSelect() {
      return this.$refs.spuSelect.open()
    },
    selectSpu(spuId, skuIds) {
      this.formData.spuId = spuId
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate('spuId')
      })
      return this.getSpuDetails(spuId, skuIds)
    },
    /** 获取唯一 SPU 以及本次活动选中的 SKU。 */
    async getSpuDetails(spuId, skuIds, products) {
      if (spuId === undefined || spuId === null) {
        this.spuList = []
        return false
      }
      const requestId = ++this.detailRequestSequence
      const response = await getSpuDetailList([spuId])
      if (requestId !== this.detailRequestSequence) return false
      const details = response.data
      if (!Array.isArray(details) || details.length === 0) {
        this.spuList = []
        return false
      }
      const sourceSpu = details[0]
      const allSkus = Array.isArray(sourceSpu.skus) ? sourceSpu.skus : []
      const selectedSkuIds = Array.isArray(skuIds) ? skuIds : allSkus.map((sku) => sku.id)
      const selectedSkus = allSkus
        .filter((sku) => selectedSkuIds.includes(sku.id))
        .map((sku) => {
          const product = Array.isArray(products)
            ? products.find((item) => item.skuId === sku.id)
            : undefined
          const productConfig = product
            ? Object.assign({}, product, { price: this.fenToYuanNumber(product.price) })
            : {
              skuId: sku.id,
              stock: 0,
              price: 0,
              point: 0,
              count: 0
            }
          return Object.assign({}, sku, { productConfig })
        })
      this.spuList = [Object.assign({}, sourceSpu, { skus: selectedSkus })]
      return true
    },
    /** 校验表单并提交，金额从元转换为分。 */
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          if (!valid || !this.validateProducts()) {
            resolve(false)
            return
          }
          const data = deepClone(this.formData)
          data.products = this.getProductConfigs().map((product) => {
            const item = deepClone(product)
            item.price = this.convertToInteger(item.price)
            return item
          })
          this.formLoading = true
          const request = this.formType === 'create'
            ? PointActivityApi.createPointActivity(data)
            : PointActivityApi.updatePointActivity(data)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
              return true
            })
            .catch(() => false)
            .finally(() => {
              this.formLoading = false
            })
            .then(resolve)
        })
      })
    },
    validateProducts() {
      if (this.formData.spuId === undefined || this.formData.spuId === null) {
        this.$modal.msgWarning('请选择积分商城商品')
        return false
      }
      const rows = this.getProductRows()
      if (rows.length === 0) {
        this.$modal.msgWarning('请选择积分商城商品规格')
        return false
      }
      for (const row of rows) {
        for (const rule of this.productRuleConfig) {
          const field = rule.name.replace('productConfig.', '')
          if (!rule.rule(row.productConfig[field])) {
            this.$modal.msgWarning(rule.message)
            return false
          }
        }
        if (Number(row.productConfig.stock) > Number(row.stock || 0)) {
          this.$modal.msgWarning('商品可兑换库存不能超过商品库存 ！！！')
          return false
        }
        if (!Number.isFinite(Number(row.productConfig.price)) || Number(row.productConfig.price) < 0) {
          this.$modal.msgWarning('商品所需金额不能小于 0 ！！！')
          return false
        }
      }
      return true
    },
    getProductRows() {
      return this.spuList.length > 0 && Array.isArray(this.spuList[0].skus)
        ? this.spuList[0].skus
        : []
    },
    getProductConfigs() {
      return this.getProductRows().map((sku) => sku.productConfig)
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.detailRequestSequence += 1
      this.formData = this.getDefaultFormData()
      this.spuList = []
      this.isFormUpdate = false
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    convertToInteger(value) {
      const number = Number(value)
      return Number.isFinite(number) ? Math.round(number * 100) : 0
    },
    fenToYuan(value) {
      return this.fenToYuanNumber(value).toFixed(2)
    },
    fenToYuanNumber(value) {
      const number = Number(value)
      return Number.isFinite(number) ? Number((number / 100).toFixed(2)) : 0
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-products {
  padding: 24px 0;
  color: #909399;
  text-align: center;
}

.spu-config {
  margin-top: 16px;
  overflow-x: auto;
  border: 1px solid #ebeef5;
}

.spu-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
}

.spu-image {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.spu-name {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spu-id {
  flex: 0 0 auto;
  margin-left: 16px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .spu-id {
    display: none;
  }
}
</style>
