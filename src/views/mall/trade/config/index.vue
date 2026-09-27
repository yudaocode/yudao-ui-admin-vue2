<template>
  <div class="app-container">
    <doc-alert
      title="【交易】交易订单"
      url="https://doc.iocoder.cn/mall/trade-order/"
    />
    <doc-alert
      title="【交易】购物车"
      url="https://doc.iocoder.cn/mall/trade-cart/"
    />

    <el-card shadow="never">
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item
          v-show="false"
          label="hideId"
        >
          <el-input v-model="formData.id" />
        </el-form-item>

        <el-tabs>
          <!-- 售后 -->
          <el-tab-pane label="售后">
            <el-form-item
              label="退款理由"
              prop="afterSaleRefundReasons"
            >
              <el-select
                v-model="formData.afterSaleRefundReasons"
                allow-create
                filterable
                multiple
                class="reason-select"
                placeholder="请直接输入退款理由"
              >
                <el-option
                  v-for="reason in formData.afterSaleRefundReasons"
                  :key="reason"
                  :label="reason"
                  :value="reason"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="退货理由"
              prop="afterSaleReturnReasons"
            >
              <el-select
                v-model="formData.afterSaleReturnReasons"
                allow-create
                filterable
                multiple
                class="reason-select"
                placeholder="请直接输入退货理由"
              >
                <el-option
                  v-for="reason in formData.afterSaleReturnReasons"
                  :key="reason"
                  :label="reason"
                  :value="reason"
                />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- 配送 -->
          <el-tab-pane label="配送">
            <el-form-item
              label="启用包邮"
              prop="deliveryExpressFreeEnabled"
            >
              <el-switch v-model="formData.deliveryExpressFreeEnabled" />
              <div class="form-tip">商城是否启用全场包邮</div>
            </el-form-item>
            <el-form-item
              label="满额包邮"
              prop="deliveryExpressFreePrice"
            >
              <el-input-number
                v-model="formData.deliveryExpressFreePrice"
                :min="0"
                :precision="2"
                class="number-input"
                placeholder="请输入满额包邮"
              />
              <div class="form-tip">商城商品满多少金额即可包邮，单位：元</div>
            </el-form-item>
            <el-form-item
              label="启用门店自提"
              prop="deliveryPickUpEnabled"
            >
              <el-switch v-model="formData.deliveryPickUpEnabled" />
            </el-form-item>
          </el-tab-pane>

          <!-- 分销 -->
          <el-tab-pane label="分销">
            <el-form-item
              label="分佣启用"
              prop="brokerageEnabled"
            >
              <el-switch v-model="formData.brokerageEnabled" />
              <div class="form-tip">商城是否开启分销模式</div>
            </el-form-item>
            <el-form-item
              label="分佣模式"
              prop="brokerageEnabledCondition"
            >
              <el-radio-group v-model="formData.brokerageEnabledCondition">
                <el-radio
                  v-for="dict in brokerageEnabledConditionOptions"
                  :key="dict.value"
                  :label="Number(dict.value)"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
              <div class="form-tip">人人分销：每个用户都可以成为推广员</div>
              <div class="form-tip">指定分销：仅可在后台手动设置推广员</div>
            </el-form-item>
            <el-form-item
              label="分销关系绑定"
              prop="brokerageBindMode"
            >
              <el-radio-group v-model="formData.brokerageBindMode">
                <el-radio
                  v-for="dict in brokerageBindModeOptions"
                  :key="dict.value"
                  :label="Number(dict.value)"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
              <div class="form-tip">首次绑定：只要用户没有推广人，随时都可以绑定推广关系</div>
              <div class="form-tip">注册绑定：只有新用户注册时或首次进入系统时才可以绑定推广关系</div>
            </el-form-item>
            <el-form-item label="分销海报图">
              <ImageUpload
                v-model="brokeragePosterUrlsValue"
                :limit="5"
                :is-show-tip="false"
                class="poster-upload"
              />
              <div class="form-tip">
                分销海报图片，按上传顺序从左往右依次为<strong>个人分享海报</strong>、<strong>商品推广海报</strong>和<strong>拼团推广海报</strong>
              </div>
            </el-form-item>
            <el-form-item
              label="一级返佣比例"
              prop="brokerageFirstPercent"
            >
              <el-input-number
                v-model="formData.brokerageFirstPercent"
                :max="100"
                :min="0"
                class="number-input"
                placeholder="请输入一级返佣比例"
              />
              <div class="form-tip">订单交易成功后给推广人返佣的百分比</div>
            </el-form-item>
            <el-form-item
              label="二级返佣比例"
              prop="brokerageSecondPercent"
            >
              <el-input-number
                v-model="formData.brokerageSecondPercent"
                :max="100"
                :min="0"
                class="number-input"
                placeholder="请输入二级返佣比例"
              />
              <div class="form-tip">订单交易成功后给推广人的推荐人返佣的百分比</div>
            </el-form-item>
            <el-form-item
              label="佣金冻结天数"
              prop="brokerageFrozenDays"
            >
              <el-input-number
                v-model="formData.brokerageFrozenDays"
                :min="0"
                class="number-input"
                placeholder="请输入佣金冻结天数"
              />
              <div class="form-tip">防止用户退款，佣金被提现了，所以需要设置佣金冻结时间，单位：天</div>
            </el-form-item>
            <el-form-item
              label="提现最低金额"
              prop="brokerageWithdrawMinPrice"
            >
              <el-input-number
                v-model="formData.brokerageWithdrawMinPrice"
                :min="0"
                :precision="2"
                class="number-input"
                placeholder="请输入提现最低金额"
              />
              <div class="form-tip">用户提现最低金额限制，单位：元</div>
            </el-form-item>
            <el-form-item
              label="提现手续费"
              prop="brokerageWithdrawFeePercent"
            >
              <el-input-number
                v-model="formData.brokerageWithdrawFeePercent"
                :max="100"
                :min="0"
                class="number-input"
                placeholder="请输入提现手续费"
              />
              <div class="form-tip">
                提现手续费百分比，范围 0-100，0 为无提现手续费。例：设置 10，即收取 10% 手续费，提现 10 元，到账 9 元，1 元手续费
              </div>
            </el-form-item>
            <el-form-item
              label="提现方式"
              prop="brokerageWithdrawTypes"
            >
              <el-checkbox-group v-model="formData.brokerageWithdrawTypes">
                <el-checkbox
                  v-for="dict in brokerageWithdrawTypeOptions"
                  :key="dict.value"
                  :label="Number(dict.value)"
                >
                  {{ dict.label }}
                </el-checkbox>
              </el-checkbox-group>
              <div class="form-tip">商城开通提现的付款方式</div>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item>
          <el-button
            v-hasPermi="['trade:config:save']"
            :loading="formLoading"
            type="primary"
            @click="submitForm"
          >
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import { getTradeConfig, saveTradeConfig } from '@/api/mall/trade/config'
import { getDictDatas } from '@/utils/dict'
import { deepClone } from '@/utils'

const TRADE_DICT_TYPE = {
  BROKERAGE_ENABLED_CONDITION: 'brokerage_enabled_condition',
  BROKERAGE_BIND_MODE: 'brokerage_bind_mode',
  BROKERAGE_WITHDRAW_TYPE: 'brokerage_withdraw_type'
}

export default {
  name: 'TradeConfig',
  components: { ImageUpload },
  data() {
    return {
      formLoading: false,
      formData: this.createDefaultFormData(),
      formRules: {
        // 与 Vue3 源一致：售后理由不做必填校验
        deliveryExpressFreePrice: [
          { required: true, message: '满额包邮不能为空', trigger: 'blur' }
        ],
        brokerageEnabledCondition: [
          { required: true, message: '分佣模式不能为空', trigger: 'change' }
        ],
        brokerageBindMode: [
          { required: true, message: '分销关系绑定模式不能为空', trigger: 'change' }
        ],
        brokerageFirstPercent: [
          { required: true, message: '一级返佣比例不能为空', trigger: 'blur' }
        ],
        brokerageSecondPercent: [
          { required: true, message: '二级返佣比例不能为空', trigger: 'blur' }
        ],
        brokerageWithdrawMinPrice: [
          { required: true, message: '用户提现最低金额不能为空', trigger: 'blur' }
        ],
        brokerageWithdrawFeePercent: [
          { required: true, message: '提现手续费不能为空', trigger: 'blur' }
        ],
        brokerageFrozenDays: [
          { required: true, message: '佣金冻结时间不能为空', trigger: 'blur' }
        ],
        brokerageWithdrawTypes: [
          { required: true, type: 'array', min: 1, message: '提现方式不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    brokerageEnabledConditionOptions() {
      return getDictDatas(TRADE_DICT_TYPE.BROKERAGE_ENABLED_CONDITION)
    },
    brokerageBindModeOptions() {
      return getDictDatas(TRADE_DICT_TYPE.BROKERAGE_BIND_MODE)
    },
    brokerageWithdrawTypeOptions() {
      return getDictDatas(TRADE_DICT_TYPE.BROKERAGE_WITHDRAW_TYPE)
    },
    // Vue2 ImageUpload 输出逗号分隔字符串，而交易配置接口要求 List<String>。
    brokeragePosterUrlsValue: {
      get() {
        return this.normalizePosterUrls(this.formData.brokeragePosterUrls).join(',')
      },
      set(value) {
        this.formData.brokeragePosterUrls = this.normalizePosterUrls(value)
      }
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    createDefaultFormData() {
      return {
        id: null,
        afterSaleRefundReasons: [],
        afterSaleReturnReasons: [],
        deliveryExpressFreeEnabled: false,
        deliveryExpressFreePrice: 0,
        deliveryPickUpEnabled: false,
        brokerageEnabled: false,
        brokerageEnabledCondition: undefined,
        brokerageBindMode: undefined,
        brokeragePosterUrls: [],
        brokerageFirstPercent: 0,
        brokerageSecondPercent: 0,
        brokerageWithdrawMinPrice: 0,
        brokerageWithdrawFeePercent: 0,
        brokerageFrozenDays: 0,
        brokerageWithdrawTypes: []
      }
    },
    normalizePosterUrls(value) {
      if (Array.isArray(value)) {
        return value
          .map(item => (typeof item === 'string' ? item : item && item.url))
          .filter(Boolean)
      }
      if (typeof value === 'string') {
        return value.split(',').filter(Boolean)
      }
      return []
    },
    toNullableNumber(value) {
      return value === undefined || value === null || value === '' ? undefined : Number(value)
    },
    fromCent(value) {
      return Number(value || 0) / 100
    },
    toCent(value) {
      return Math.round(Number(value || 0) * 100)
    },
    async getConfig() {
      this.formLoading = true
      try {
        const response = await getTradeConfig()
        const data = response.data
        if (!data) {
          return
        }
        this.formData = Object.assign(this.createDefaultFormData(), data, {
          afterSaleRefundReasons: Array.isArray(data.afterSaleRefundReasons)
            ? data.afterSaleRefundReasons
            : [],
          afterSaleReturnReasons: Array.isArray(data.afterSaleReturnReasons)
            ? data.afterSaleReturnReasons
            : [],
          deliveryExpressFreePrice: this.fromCent(data.deliveryExpressFreePrice),
          brokerageEnabledCondition: this.toNullableNumber(data.brokerageEnabledCondition),
          brokerageBindMode: this.toNullableNumber(data.brokerageBindMode),
          brokeragePosterUrls: this.normalizePosterUrls(data.brokeragePosterUrls),
          brokerageWithdrawMinPrice: this.fromCent(data.brokerageWithdrawMinPrice),
          brokerageWithdrawTypes: Array.isArray(data.brokerageWithdrawTypes)
            ? data.brokerageWithdrawTypes.map(Number)
            : []
        })
      } finally {
        this.formLoading = false
      }
    },
    submitForm() {
      if (this.formLoading || !this.$refs.form) {
        return
      }
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        this.formLoading = true
        try {
          const data = deepClone(this.formData)
          data.brokeragePosterUrls = this.normalizePosterUrls(data.brokeragePosterUrls)
          data.deliveryExpressFreePrice = this.toCent(data.deliveryExpressFreePrice)
          data.brokerageWithdrawMinPrice = this.toCent(data.brokerageWithdrawMinPrice)
          await saveTradeConfig(data)
          this.$modal.msgSuccess('保存成功')
        } finally {
          this.formLoading = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.reason-select {
  width: 100%;
}

.number-input {
  width: 320px;
}

.form-tip {
  width: 100%;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}

.poster-upload ::v-deep .el-upload--picture-card,
.poster-upload ::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 75px;
  height: 125px;
  line-height: 125px;
}
</style>
