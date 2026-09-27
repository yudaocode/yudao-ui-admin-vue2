<template>
  <el-row class="reward-rules">
    <el-col
      v-for="(rule, index) in formData.rules"
      :key="index"
      :span="24"
      class="rule-level"
    >
      <el-card shadow="never">
        <div
          slot="header"
          class="rule-header"
        >
          <strong>活动层级{{ index + 1 }}</strong>
          <el-button
            v-if="index !== 0"
            type="text"
            class="danger-button"
            @click="deleteRule(index)"
          >
            删除
          </el-button>
        </div>

        <div class="rule-line">
          <span class="rule-label">优惠门槛：</span>
          <span>满</span>
          <el-input-number
            v-model="rule.limit"
            :min="0"
            :precision="isPriceCondition ? 2 : 0"
            :step="isPriceCondition ? 0.1 : 1"
            controls-position="right"
            class="number-input"
          />
          <span>{{ isPriceCondition ? '元' : '件' }}</span>
        </div>

        <div class="rule-line">
          <span class="rule-label">订单金额优惠：</span>
          <span>减</span>
          <el-input-number
            v-model="rule.discountPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
            class="number-input"
          />
          <span>元</span>
        </div>

        <div class="rule-line">
          <span class="rule-label">包邮：</span>
          <el-switch
            v-model="rule.freeDelivery"
            active-text="是"
            inactive-text="否"
          />
        </div>

        <div class="rule-line">
          <span class="rule-label">送积分：</span>
          <span>送</span>
          <el-input-number
            v-model="rule.point"
            :min="0"
            :precision="0"
            :step="1"
            controls-position="right"
            class="number-input"
          />
          <span>积分</span>
        </div>

        <div class="rule-line coupon-line">
          <span class="rule-label">送优惠券：</span>
          <RewardRuleCouponSelect
            ref="couponSelect"
            v-model="formData.rules[index]"
          />
        </div>
      </el-card>
    </el-col>

    <el-col
      :span="24"
      class="rule-actions"
    >
      <el-button
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addRule"
      >
        添加优惠规则
      </el-button>
    </el-col>
    <el-col :span="24">
      <el-tag type="warning">赠送积分为 0 时不赠送。未选优惠券时不赠送。</el-tag>
    </el-col>
  </el-row>
</template>

<script>
import { PromotionConditionTypeEnum } from '@/utils/constants'
import RewardRuleCouponSelect from './RewardRuleCouponSelect.vue'

export default {
  name: 'RewardRule',
  components: { RewardRuleCouponSelect },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  computed: {
    formData() {
      return this.value
    },
    isPriceCondition() {
      return this.formData.conditionType === PromotionConditionTypeEnum.PRICE.type
    }
  },
  methods: {
    /** 删除优惠规则。第一层始终保留，和 Vue3 交互一致。 */
    deleteRule(ruleIndex) {
      this.formData.rules.splice(ruleIndex, 1)
      this.$emit('input', this.formData)
    },
    /** 添加一层空的优惠规则。 */
    addRule() {
      if (!Array.isArray(this.formData.rules)) this.$set(this.formData, 'rules', [])
      this.formData.rules.push({
        limit: 0,
        discountPrice: 0,
        freeDelivery: false,
        point: 0,
        giveCouponTemplateCounts: {}
      })
      this.$emit('input', this.formData)
    },
    /** 在主表单提交前，把每层已选优惠券同步为后端 Map 结构。 */
    setRuleCoupon() {
      this.getCouponSelectRefs().forEach((component) => component.setGiveCouponList())
    },
    /** 校验后端 Rule 的最小值约束以及优惠券赠送数量。 */
    validateRules() {
      const rules = Array.isArray(this.formData.rules) ? this.formData.rules : []
      if (rules.length === 0) {
        this.$modal.msgWarning('请至少添加一条优惠规则')
        return false
      }
      for (let index = 0; index < rules.length; index += 1) {
        const rule = rules[index]
        if (!Number.isFinite(Number(rule.limit)) || Number(rule.limit) <= 0) {
          this.$modal.msgWarning('活动层级' + (index + 1) + '的优惠门槛必须大于 0')
          return false
        }
        if (!this.isPriceCondition && !Number.isInteger(Number(rule.limit))) {
          this.$modal.msgWarning('活动层级' + (index + 1) + '的商品件数必须为整数')
          return false
        }
        if (!Number.isFinite(Number(rule.discountPrice)) || Number(rule.discountPrice) <= 0) {
          this.$modal.msgWarning('活动层级' + (index + 1) + '的优惠金额必须大于 0')
          return false
        }
        if (!Number.isInteger(Number(rule.point)) || Number(rule.point) < 0) {
          this.$modal.msgWarning('活动层级' + (index + 1) + '的赠送积分必须为非负整数')
          return false
        }
      }
      const couponSelectRefs = this.getCouponSelectRefs()
      for (let index = 0; index < couponSelectRefs.length; index += 1) {
        if (!couponSelectRefs[index].validateCoupons()) {
          this.$modal.msgWarning('活动层级' + (index + 1) + '的优惠券赠送数量必须为正整数')
          return false
        }
      }
      return true
    },
    getCouponSelectRefs() {
      const refs = this.$refs.couponSelect
      if (!refs) return []
      return Array.isArray(refs) ? refs : [refs]
    }
  }
}
</script>

<style scoped>
.reward-rules {
  width: 100%;
}

.rule-level {
  margin-bottom: 12px;
}

.rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rule-line {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 8px;
}

.rule-label {
  display: inline-block;
  width: 112px;
  flex: 0 0 112px;
  color: #606266;
}

.number-input {
  width: 150px;
}

.coupon-line {
  align-items: flex-start;
}

.rule-actions {
  margin: 2px 0 12px;
}

.danger-button {
  color: #f56c6c;
}
</style>
