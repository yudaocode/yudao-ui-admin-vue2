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
        label="活动名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入活动名称"
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="活动开始时间"
            prop="startTime"
          >
            <el-date-picker
              v-model="formData.startTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择活动开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="活动结束时间"
            prop="endTime"
          >
            <el-date-picker
              v-model="formData.endTime"
              type="date"
              value-format="timestamp"
              placeholder="请选择活动结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
      <el-form-item label="活动商品">
        <el-button
          type="primary"
          plain
          @click="openSpuSelect"
        >选择商品</el-button>
        <div
          v-if="spuList.length === 0"
          class="empty-products"
        >暂未选择活动商品</div>
        <div
          v-for="spu in spuList"
          :key="spu.id"
          class="spu-config"
        >
          <div class="spu-header">
            <div class="spu-summary">
              <el-image
                :src="spu.picUrl"
                class="spu-image"
              />
              <span class="spu-name">{{ spu.name }}</span>
              <span class="spu-id">商品编号：{{ spu.id }}</span>
            </div>
            <el-button
              v-if="spuList.length > 1"
              type="text"
              class="delete-button"
              @click="deleteSpu(spu.id)"
            >
              删除
            </el-button>
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
              min-width="140"
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
              label="库存"
              prop="stock"
              align="center"
              width="90"
            />
            <el-table-column
              label="优惠金额"
              align="center"
              min-width="175"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.discountPrice"
                  :max="fenToYuanNumber(scope.row.price)"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                  @change="handleSkuDiscountPriceChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="折扣百分比(%)"
              align="center"
              min-width="175"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.discountPercent"
                  :max="99.99"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                  @change="handleSkuDiscountPercentChange(scope.row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
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

    <DiscountSpuSelect
      ref="spuSelect"
      @confirm="selectSpu"
    />
  </el-dialog>
</template>

<script>
import * as DiscountActivityApi from '@/api/mall/promotion/discount/discountActivity'
import { getSpuDetailList } from '@/api/mall/product/spu'
import { deepClone } from '@/utils'
import { PromotionDiscountTypeEnum } from '@/utils/constants'
import DiscountSpuSelect from './DiscountSpuSelect.vue'
import { productRuleConfig, rules } from './discountActivity.data'

export default {
  name: 'PromotionDiscountActivityForm',
  components: { DiscountSpuSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      rules,
      productRuleConfig,
      spuList: [],
      spuIds: []
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        remark: undefined
      }
    },
    /** 打开弹窗 */
    open(type, id) {
      this.resetForm()
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增限时折扣活动' : '修改限时折扣活动'
      this.dialogVisible = true
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return DiscountActivityApi.getDiscountActivity(id)
        .then((response) => {
          const data = response.data
          this.formData = Object.assign(this.getDefaultFormData(), {
            id: data.id,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            remark: data.remark
          })
          const products = Array.isArray(data.products) ? data.products : []
          const spuIds = Array.from(new Set(products.map((product) => product.spuId)))
          return spuIds.reduce((promise, spuId) => {
            const skuIds = products
              .filter((product) => product.spuId === spuId)
              .map((product) => product.skuId)
            return promise.then(() => this.getSpuDetails(spuId, skuIds, products, 'load'))
          }, Promise.resolve())
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    openSpuSelect() {
      return this.$refs.spuSelect.open()
    },
    selectSpu(spuId, skuIds) {
      return this.getSpuDetails(spuId, skuIds)
    },
    /** 获取 SPU 及选中的 SKU 详情。 */
    getSpuDetails(spuId, skuIds, products, type) {
      if (this.spuIds.includes(spuId)) {
        if (type !== 'load') this.$modal.msgError('数据重复选择！')
        return Promise.resolve(false)
      }
      this.spuIds.push(spuId)
      return getSpuDetailList([spuId]).then((response) => {
        const details = response.data
        if (!Array.isArray(details) || details.length === 0) return false
        const spu = details[0]
        const allSkus = Array.isArray(spu.skus) ? spu.skus : []
        const selectedSkuIds = Array.isArray(skuIds) ? skuIds : allSkus.map((sku) => sku.id)
        const selectedSkus = allSkus
          .filter((sku) => selectedSkuIds.includes(sku.id))
          .map((sku) => {
            const product = Array.isArray(products)
              ? products.find((item) => item.skuId === sku.id)
              : undefined
            const productConfig = product
              ? {
                spuId: product.spuId,
                skuId: product.skuId,
                discountType: product.discountType,
                discountPercent: this.fenToYuanNumber(product.discountPercent),
                discountPrice: this.fenToYuanNumber(product.discountPrice)
              }
              : {
                spuId: spu.id,
                skuId: sku.id,
                discountType: PromotionDiscountTypeEnum.PRICE.type,
                discountPercent: 0,
                discountPrice: 0
              }
            return Object.assign({}, sku, { productConfig })
          })
        this.spuList.push(Object.assign({}, spu, { skus: selectedSkus }))
        return true
      })
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate((valid) => {
          if (!valid || !this.validateProducts()) {
            resolve(false)
            return
          }
          const data = deepClone(this.formData)
          data.products = this.getProductConfigs().map((product) => ({
            spuId: product.spuId,
            skuId: product.skuId,
            discountType: product.discountType,
            discountPercent: this.convertToInteger(product.discountPercent),
            discountPrice: this.convertToInteger(product.discountPrice)
          }))
          this.formLoading = true
          const request = this.formType === 'create'
            ? DiscountActivityApi.createDiscountActivity(data)
            : DiscountActivityApi.updateDiscountActivity(data)
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
      const products = this.getProductRows()
      if (products.length === 0) {
        this.$modal.msgWarning('请选择活动商品')
        return false
      }
      for (const row of products) {
        for (const rule of this.productRuleConfig) {
          const value = rule.name === 'productConfig.discountPrice'
            ? row.productConfig.discountPrice
            : undefined
          if (!rule.rule(value)) {
            this.$modal.msgWarning(rule.message)
            return false
          }
        }
        if (row.productConfig.discountPrice > this.fenToYuanNumber(row.price)) {
          this.$modal.msgWarning('商品优惠金额不能大于商品价格')
          return false
        }
        if (
          row.productConfig.discountType === PromotionDiscountTypeEnum.PERCENT.type &&
          (row.productConfig.discountPercent <= 0 || row.productConfig.discountPercent >= 100)
        ) {
          this.$modal.msgWarning('折扣百分比需要大于 0%，小于 100%')
          return false
        }
      }
      return true
    },
    getProductRows() {
      return this.spuList.reduce((rows, spu) => rows.concat(spu.skus || []), [])
    },
    getProductConfigs() {
      return this.getProductRows().map((sku) => sku.productConfig)
    },
    /** 处理 SKU 优惠金额变动。 */
    handleSkuDiscountPriceChange(row) {
      const discountPrice = Number(row.productConfig.discountPrice)
      if (discountPrice <= 0) return
      row.productConfig.discountType = PromotionDiscountTypeEnum.PRICE.type
      const price = Number(row.price)
      const discountFen = this.convertToInteger(discountPrice)
      row.productConfig.discountPercent = price === 0
        ? 0
        : Number((((price - discountFen) / price) * 100).toFixed(2))
    },
    /** 处理 SKU 折扣百分比变动。 */
    handleSkuDiscountPercentChange(row) {
      const discountPercent = Number(row.productConfig.discountPercent)
      if (discountPercent <= 0 || discountPercent >= 100) return
      row.productConfig.discountType = PromotionDiscountTypeEnum.PERCENT.type
      const price = Number(row.price)
      const discountPrice = price - price * (discountPercent / 100 || 0)
      row.productConfig.discountPrice = this.fenToYuanNumber(discountPrice)
    },
    deleteSpu(spuId) {
      return this.$modal.confirm('是否删除商品编号为' + spuId + '的数据？')
        .then(() => {
          const index = this.spuIds.findIndex((id) => id === spuId)
          if (index >= 0) this.spuIds.splice(index, 1)
          const spuIndex = this.spuList.findIndex((spu) => spu.id === spuId)
          if (spuIndex >= 0) this.spuList.splice(spuIndex, 1)
          return true
        })
        .catch(() => false)
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.spuList = []
      this.spuIds = []
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

<style scoped>
.empty-products {
  padding: 24px 0;
  color: #909399;
  text-align: center;
}

.spu-config {
  margin-top: 16px;
  border: 1px solid #ebeef5;
}

.spu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
}

.spu-summary {
  display: flex;
  align-items: center;
}

.spu-image {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.spu-name {
  font-weight: 600;
}

.spu-id {
  margin-left: 16px;
  color: #909399;
}

.delete-button {
  color: #f56c6c;
}

.dialog-footer {
  text-align: right;
}
</style>
