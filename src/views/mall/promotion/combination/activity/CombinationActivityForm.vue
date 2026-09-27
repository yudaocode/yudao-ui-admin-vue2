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
        label="拼团名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入拼团名称"
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
              type="date"
              value-format="timestamp"
              placeholder="请选择活动开始时间"
              style="width: 100%"
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
              type="date"
              value-format="timestamp"
              placeholder="请选择活动结束时间"
              style="width: 100%"
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
            label="参与人数"
            prop="userSize"
          >
            <el-input-number
              v-model="formData.userSize"
              :min="2"
              :precision="0"
              controls-position="right"
            />
            <span class="field-help">参与人数不能少于两人</span>
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="限制时长"
            prop="limitDuration"
          >
            <el-input-number
              v-model="formData.limitDuration"
              :min="1"
              :precision="0"
              controls-position="right"
            />
            <span class="field-help">小时</span>
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
              :min="0"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
        >
          <el-form-item
            label="单次限购数量"
            prop="singleLimitCount"
          >
            <el-input-number
              v-model="formData.singleLimitCount"
              :min="0"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="虚拟成团"
        prop="virtualGroup"
      >
        <el-radio-group v-model="formData.virtualGroup">
          <el-radio :label="true">开启</el-radio>
          <el-radio :label="false">关闭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="拼团商品"
        prop="spuId"
      >
        <el-button
          type="primary"
          plain
          @click="openSpuSelect"
        >选择商品</el-button>
        <div
          v-if="spuList.length === 0"
          class="empty-products"
        >暂未选择拼团商品</div>
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
              min-width="160"
            />
            <el-table-column
              label="商品价格"
              prop="price"
              align="center"
              width="120"
            >
              <template v-slot="scope">￥{{ fenToYuan(scope.row.price) }}</template>
            </el-table-column>
            <el-table-column
              label="库存"
              prop="stock"
              align="center"
              width="100"
            />
            <el-table-column
              label="拼团价格(元)"
              align="center"
              min-width="180"
            >
              <template v-slot="scope">
                <el-input-number
                  v-model="scope.row.productConfig.combinationPrice"
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

    <CombinationSpuSelect
      ref="spuSelect"
      @confirm="selectSpu"
    />
  </el-dialog>
</template>

<script>
import * as CombinationActivityApi from '@/api/mall/promotion/combination/combinationActivity'
import { getSpuDetailList } from '@/api/mall/product/spu'
import { deepClone } from '@/utils'
import CombinationSpuSelect from '../components/CombinationSpuSelect.vue'
import { productRuleConfig, rules } from './combinationActivity.data'

export default {
  name: 'PromotionCombinationActivityForm',
  components: { CombinationSpuSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      rules,
      productRuleConfig,
      spuList: []
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        spuId: undefined,
        totalLimitCount: 0,
        singleLimitCount: 0,
        startTime: undefined,
        endTime: undefined,
        userSize: 2,
        virtualGroup: false,
        limitDuration: undefined
      }
    },
    /** 打开弹窗。 */
    open(type, id) {
      this.resetForm()
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增拼团活动' : '修改拼团活动'
      this.dialogVisible = true
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return CombinationActivityApi.getCombinationActivity(id)
        .then((response) => {
          const data = response.data
          this.formData = Object.assign(this.getDefaultFormData(), {
            id: data.id,
            name: data.name,
            spuId: data.spuId,
            totalLimitCount: data.totalLimitCount,
            singleLimitCount: data.singleLimitCount,
            startTime: data.startTime,
            endTime: data.endTime,
            userSize: data.userSize,
            virtualGroup: data.virtualGroup,
            limitDuration: data.limitDuration
          })
          const products = Array.isArray(data.products) ? data.products : []
          const skuIds = products.map((product) => product.skuId)
          return this.getSpuDetails(data.spuId, skuIds, products)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    openSpuSelect() {
      return this.$refs.spuSelect.open()
    },
    selectSpu(spuId, skuIds) {
      this.formData.spuId = spuId
      return this.getSpuDetails(spuId, skuIds)
    },
    /** 获取唯一 SPU 及选中的 SKU 详情。 */
    getSpuDetails(spuId, skuIds, products) {
      if (spuId === undefined || spuId === null) return Promise.resolve(false)
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
                combinationPrice: this.fenToYuanNumber(product.combinationPrice)
              }
              : {
                spuId: spu.id,
                skuId: sku.id,
                combinationPrice: 0
              }
            return Object.assign({}, sku, { productConfig })
          })
        this.spuList = [Object.assign({}, spu, { skus: selectedSkus })]
        return true
      })
    },
    /** 提交表单。 */
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
            combinationPrice: this.convertToInteger(product.combinationPrice)
          }))
          this.formLoading = true
          const request = this.formType === 'create'
            ? CombinationActivityApi.createCombinationActivity(data)
            : CombinationActivityApi.updateCombinationActivity(data)
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
        this.$modal.msgWarning('请选择拼团商品')
        return false
      }
      const products = this.getProductRows()
      if (products.length === 0) {
        this.$modal.msgWarning('请选择拼团商品规格')
        return false
      }
      for (const row of products) {
        for (const rule of this.productRuleConfig) {
          const value = rule.name === 'productConfig.combinationPrice'
            ? row.productConfig.combinationPrice
            : undefined
          if (!rule.rule(value)) {
            this.$modal.msgWarning(rule.message)
            return false
          }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.field-help {
  margin-left: 8px;
  color: #909399;
}

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
  .field-help {
    display: block;
    margin-left: 0;
  }

  .spu-id {
    display: none;
  }
}
</style>
