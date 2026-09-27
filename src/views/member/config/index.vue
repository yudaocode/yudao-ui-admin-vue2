<template>
  <div class="app-container">
    <doc-alert title="会员手册（功能开启）" url="https://doc.iocoder.cn/member/build/" />

    <el-card v-loading="formLoading" shadow="never">
      <el-form ref="form" :model="formData" :rules="formRules" label-width="130px">
        <el-form-item label="hideId" v-show="false">
          <el-input v-model="formData.id" />
        </el-form-item>
        <el-tabs>
          <el-tab-pane label="积分">
            <el-form-item label="积分抵扣" prop="pointTradeDeductEnable">
              <el-switch v-model="formData.pointTradeDeductEnable" />
              <div class="form-item-help">下单积分是否抵用订单金额</div>
            </el-form-item>
            <el-form-item label="积分抵扣" prop="pointTradeDeductUnitPrice">
              <el-input-number
                v-model="computedPointTradeDeductUnitPrice"
                :min="0"
                :precision="2"
                placeholder="请输入积分抵扣金额"
              />
              <div class="form-item-help">积分抵用比例(1 积分抵多少金额)，单位：元</div>
            </el-form-item>
            <el-form-item label="积分抵扣最大值" prop="pointTradeDeductMaxPrice">
              <el-input-number
                v-model="formData.pointTradeDeductMaxPrice"
                :min="0"
                :precision="0"
                placeholder="请输入积分抵扣最大值"
              />
              <div class="form-item-help">单次下单积分使用上限，0 不限制</div>
            </el-form-item>
            <el-form-item label="1 元赠送多少分" prop="pointTradeGivePoint">
              <el-input-number
                v-model="formData.pointTradeGivePoint"
                :min="0"
                :precision="0"
                placeholder="请输入 1 元赠送多少积分"
              />
              <div class="form-item-help">下单支付金额按比例赠送积分（实际支付 1 元赠送多少积分）</div>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit"
          >保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getConfig, saveConfig } from '@/api/member/config'

export default {
  name: 'MemberConfig',
  data() {
    return {
      formLoading: false,
      formData: this.getDefaultFormData(),
      formRules: {}
    }
  },
  computed: {
    // 后端保存分，页面按元展示；提交时四舍五入回分，避免浮点误差。
    computedPointTradeDeductUnitPrice: {
      get() {
        return this.formData.pointTradeDeductUnitPrice / 100
      },
      set(value) {
        const price = Number(value)
        this.formData.pointTradeDeductUnitPrice = Number.isFinite(price) ? Math.round(price * 100) : 0
      }
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        pointTradeDeductEnable: true,
        pointTradeDeductUnitPrice: 0,
        pointTradeDeductMaxPrice: 0,
        pointTradeGivePoint: 0
      }
    },
    async getConfig() {
      const response = await getConfig()
      if (response.data === null) return
      this.formData = response.data
    },
    async onSubmit() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await saveConfig(this.formData)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>
.form-item-help {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}
</style>
