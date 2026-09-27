<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="65%"
    append-to-body
    :close-on-click-modal="false"
    class="bargain-activity-form"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="130px"
    >
      <el-form-item
        label="砍价活动名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入砍价活动名称"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="活动开始时间"
            prop="startTime"
          >
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择活动开始时间"
              class="bargain-activity-form__control"
            />
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="活动结束时间"
            prop="endTime"
          >
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择活动结束时间"
              class="bargain-activity-form__control"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="砍价人数"
            prop="helpMaxCount"
          >
            <el-input-number
              v-model="formData.helpMaxCount"
              :min="2"
              :precision="0"
              controls-position="right"
            />
            <span class="bargain-activity-form__help">达到该人数后砍价成功</span>
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="最大帮砍次数"
            prop="bargainCount"
          >
            <el-input-number
              v-model="formData.bargainCount"
              :min="1"
              :precision="0"
              controls-position="right"
            />
            <span class="bargain-activity-form__help">每个用户可帮砍次数</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="总限购数量"
            prop="totalLimitCount"
          >
            <el-input-number
              v-model="formData.totalLimitCount"
              :min="1"
              :precision="0"
              controls-position="right"
            />
            <span class="bargain-activity-form__help">用户最多可发起砍价的次数</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="每次最小砍价"
            prop="randomMinPrice"
          >
            <el-input-number
              v-model="formData.randomMinPrice"
              :min="0"
              :precision="2"
              :step="0.1"
              controls-position="right"
            />
            <span class="bargain-activity-form__help">元</span>
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="每次最大砍价"
            prop="randomMaxPrice"
          >
            <el-input-number
              v-model="formData.randomMaxPrice"
              :min="0"
              :precision="2"
              :step="0.1"
              controls-position="right"
            />
            <span class="bargain-activity-form__help">元</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="砍价商品"
        prop="spuId"
      >
        <el-button
          type="primary"
          plain
          @click="openSpuSelect"
        >选择商品</el-button>
        <div
          v-if="spuList.length === 0"
          class="bargain-activity-form__empty"
        >
          暂未选择砍价商品
        </div>
        <div
          v-for="spu in spuList"
          :key="spu.id"
          class="bargain-activity-form__spu"
        >
          <div class="bargain-activity-form__spu-header">
            <el-image
              v-if="spu.picUrl"
              :src="spu.picUrl"
              :preview-src-list="[spu.picUrl]"
              fit="cover"
              class="bargain-activity-form__spu-image"
            />
            <span class="bargain-activity-form__spu-name">{{ spu.name }}</span>
            <span class="bargain-activity-form__spu-id">商品编号：{{ spu.id }}</span>
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
              min-width="150"
            >
              <template slot-scope="scope">{{ formatSkuName(scope.row) }}</template>
            </el-table-column>
            <el-table-column
              label="商品价格"
              prop="price"
              align="center"
              width="115"
            >
              <template slot-scope="scope">￥{{ fenToYuan(scope.row.price) }}</template>
            </el-table-column>
            <el-table-column
              label="商品库存"
              prop="stock"
              align="center"
              width="100"
            />
            <el-table-column
              label="砍价起始价格(元)"
              align="center"
              min-width="180"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.productConfig.bargainFirstPrice"
                  :min="0.01"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="砍价底价(元)"
              align="center"
              min-width="180"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.productConfig.bargainMinPrice"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="活动库存"
              align="center"
              min-width="160"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.productConfig.stock"
                  :min="1"
                  :precision="0"
                  controls-position="right"
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

    <BargainSpuSelect
      ref="spuSelect"
      @confirm="selectSpu"
    />
  </el-dialog>
</template>

<script>
import * as BargainActivityApi from '@/api/mall/promotion/bargain/bargainActivity'
import { getSpuDetailList } from '@/api/mall/product/spu'
import BargainSpuSelect from './components/BargainSpuSelect.vue'
import { productRuleConfig, rules } from './bargainActivity.data'

export default {
  name: 'PromotionBargainActivityForm',
  components: { BargainSpuSelect },
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
      openRequestSequence: 0,
      productRequestSequence: 0
    }
  },
  beforeDestroy() {
    this.openRequestSequence += 1
    this.productRequestSequence += 1
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        helpMaxCount: 2,
        bargainCount: 2,
        totalLimitCount: 1,
        randomMinPrice: 0,
        randomMaxPrice: 1,
        spuId: undefined,
        skuId: undefined
      }
    },
    async open(type, id) {
      const requestId = ++this.openRequestSequence
      this.resetForm()
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增砍价活动' : '修改砍价活动'
      this.dialogVisible = true
      if (id === undefined || id === null) return true

      this.formLoading = true
      try {
        const response = await BargainActivityApi.getBargainActivity(id)
        if (requestId !== this.openRequestSequence) return false
        const data = response.data
        this.formData = Object.assign(this.getDefaultFormData(), {
          id: data.id,
          name: data.name,
          startTime: data.startTime,
          endTime: data.endTime,
          helpMaxCount: data.helpMaxCount,
          bargainCount: data.bargainCount,
          totalLimitCount: data.totalLimitCount,
          randomMinPrice: this.fenToYuanNumber(data.randomMinPrice),
          randomMaxPrice: this.fenToYuanNumber(data.randomMaxPrice),
          spuId: data.spuId,
          skuId: data.skuId
        })
        return await this.getSpuDetails(data.spuId, [data.skuId], [{
          spuId: data.spuId,
          skuId: data.skuId,
          bargainFirstPrice: data.bargainFirstPrice,
          bargainMinPrice: data.bargainMinPrice,
          stock: data.stock
        }])
      } catch (error) {
        return false
      } finally {
        if (requestId === this.openRequestSequence) this.formLoading = false
      }
    },
    openSpuSelect() {
      return this.$refs.spuSelect.open()
    },
    selectSpu(spuId, skuIds) {
      const selectedSkuIds = Array.isArray(skuIds) ? skuIds.slice(0, 1) : []
      return this.getSpuDetails(spuId, selectedSkuIds)
    },
    async getSpuDetails(spuId, skuIds, products) {
      if (spuId === undefined || spuId === null) return false
      const requestId = ++this.productRequestSequence
      try {
        const response = await getSpuDetailList([spuId])
        if (requestId !== this.productRequestSequence) return false
        const details = response.data
        if (!Array.isArray(details) || details.length === 0) return false
        const spu = details[0]
        const allSkus = Array.isArray(spu.skus) ? spu.skus : []
        const selectedSkuId = Array.isArray(skuIds) ? skuIds[0] : undefined
        const sku = allSkus.find(item => item.id === selectedSkuId)
        if (!sku) {
          this.$modal.msgWarning('未找到所选商品规格，请重新选择')
          return false
        }
        const product = Array.isArray(products)
          ? products.find(item => item.skuId === sku.id)
          : undefined
        const productConfig = product
          ? {
            spuId: product.spuId,
            skuId: product.skuId,
            bargainFirstPrice: this.fenToYuanNumber(product.bargainFirstPrice),
            bargainMinPrice: this.fenToYuanNumber(product.bargainMinPrice),
            stock: product.stock
          }
          : {
            spuId: spu.id,
            skuId: sku.id,
            bargainFirstPrice: 1,
            bargainMinPrice: 0.01,
            stock: 1
          }
        const selectedSku = Object.assign({}, sku, { productConfig })
        this.spuList = [Object.assign({}, spu, { skus: [selectedSku] })]
        this.formData.spuId = spu.id
        this.formData.skuId = sku.id
        this.$nextTick(() => {
          if (this.$refs.form) this.$refs.form.clearValidate('spuId')
        })
        return true
      } catch (error) {
        return false
      }
    },
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve) => {
        this.$refs.form.validate(async(valid) => {
          if (!valid || !this.validateBusinessRules()) {
            resolve(false)
            return
          }
          this.formLoading = true
          try {
            const data = this.buildSubmitData()
            if (this.formType === 'create') {
              await BargainActivityApi.createBargainActivity(data)
              this.$modal.msgSuccess('新增成功')
            } else {
              await BargainActivityApi.updateBargainActivity(data)
              this.$modal.msgSuccess('修改成功')
            }
            this.dialogVisible = false
            this.$emit('success')
            resolve(true)
          } catch (error) {
            resolve(false)
          } finally {
            this.formLoading = false
          }
        })
      })
    },
    validateBusinessRules() {
      const startTime = this.toTime(this.formData.startTime)
      const endTime = this.toTime(this.formData.endTime)
      if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime >= endTime) {
        this.$modal.msgWarning('活动结束时间必须晚于开始时间')
        return false
      }
      if (!Number.isInteger(Number(this.formData.helpMaxCount)) || Number(this.formData.helpMaxCount) < 2) {
        this.$modal.msgWarning('砍价人数不能少于 2 人')
        return false
      }
      if (!Number.isInteger(Number(this.formData.bargainCount)) || Number(this.formData.bargainCount) < 1) {
        this.$modal.msgWarning('最大帮砍次数不能少于 1 次')
        return false
      }
      if (!Number.isInteger(Number(this.formData.totalLimitCount)) || Number(this.formData.totalLimitCount) < 1) {
        this.$modal.msgWarning('总限购数量不能小于 1')
        return false
      }
      const randomMinPrice = Number(this.formData.randomMinPrice)
      const randomMaxPrice = Number(this.formData.randomMaxPrice)
      if (!Number.isFinite(randomMinPrice) || !Number.isFinite(randomMaxPrice) || randomMinPrice < 0) {
        this.$modal.msgWarning('每次砍价金额不能小于 0')
        return false
      }
      if (randomMaxPrice <= 0) {
        this.$modal.msgWarning('每次最大砍价金额必须大于 0')
        return false
      }
      if (randomMinPrice > randomMaxPrice) {
        this.$modal.msgWarning('每次最小砍价金额不能大于最大砍价金额')
        return false
      }
      return this.validateProduct()
    },
    validateProduct() {
      const products = this.getProductRows()
      if (products.length !== 1) {
        this.$modal.msgWarning('请选择一个砍价商品规格')
        return false
      }
      const row = products[0]
      for (const rule of this.productRuleConfig) {
        const value = rule.name.split('.').reduce((source, key) => source && source[key], row)
        if (!rule.rule(value)) {
          this.$modal.msgWarning(rule.message)
          return false
        }
      }
      const firstPrice = Number(row.productConfig.bargainFirstPrice)
      const minPrice = Number(row.productConfig.bargainMinPrice)
      if (minPrice >= firstPrice) {
        this.$modal.msgWarning('商品砍价底价必须小于砍价起始价格')
        return false
      }
      if (firstPrice > this.fenToYuanNumber(row.price)) {
        this.$modal.msgWarning('商品砍价起始价格不能大于商品价格')
        return false
      }
      return true
    },
    buildSubmitData() {
      const product = this.getProductRows()[0].productConfig
      const data = {
        name: this.formData.name,
        startTime: this.formData.startTime,
        endTime: this.formData.endTime,
        helpMaxCount: Number(this.formData.helpMaxCount),
        bargainCount: Number(this.formData.bargainCount),
        totalLimitCount: Number(this.formData.totalLimitCount),
        randomMinPrice: this.convertToInteger(this.formData.randomMinPrice),
        randomMaxPrice: this.convertToInteger(this.formData.randomMaxPrice),
        spuId: product.spuId,
        skuId: product.skuId,
        bargainFirstPrice: this.convertToInteger(product.bargainFirstPrice),
        bargainMinPrice: this.convertToInteger(product.bargainMinPrice),
        stock: Number(product.stock)
      }
      if (this.formType === 'update') data.id = this.formData.id
      return data
    },
    getProductRows() {
      return this.spuList.length > 0 && Array.isArray(this.spuList[0].skus)
        ? this.spuList[0].skus
        : []
    },
    cancel() {
      this.dialogVisible = false
    },
    handleClosed() {
      this.openRequestSequence += 1
      this.resetForm()
    },
    resetForm() {
      this.productRequestSequence += 1
      this.formLoading = false
      this.formData = this.getDefaultFormData()
      this.spuList = []
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
    },
    formatSkuName(sku) {
      if (sku && sku.name) return sku.name
      const properties = sku && Array.isArray(sku.properties) ? sku.properties : []
      const labels = properties.map(item => item.valueName || item.name || item.propertyName)
        .filter(Boolean)
      return labels.length > 0 ? labels.join(' / ') : '默认规格'
    },
    toTime(value) {
      if (typeof value === 'number') return value
      return new Date(String(value).replace(/-/g, '/')).getTime()
    }
  }
}
</script>

<style lang="scss" scoped>
.bargain-activity-form__control {
  width: 100%;
}

.bargain-activity-form__help {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.bargain-activity-form__empty {
  padding: 24px 0;
  color: #909399;
  text-align: center;
}

.bargain-activity-form__spu {
  margin-top: 16px;
  overflow-x: auto;
  border: 1px solid #ebeef5;
}

.bargain-activity-form__spu-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
}

.bargain-activity-form__spu-image {
  flex: none;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 3px;
}

.bargain-activity-form__spu-name {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bargain-activity-form__spu-id {
  flex: none;
  margin-left: 16px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .bargain-activity-form {
    ::v-deep .el-dialog {
      width: calc(100% - 24px) !important;
    }

    ::v-deep .el-dialog__body {
      padding-right: 12px;
      padding-left: 12px;
    }
  }

  .bargain-activity-form__help {
    display: block;
    margin-left: 0;
  }

  .bargain-activity-form__spu-id {
    display: none;
  }
}
</style>
