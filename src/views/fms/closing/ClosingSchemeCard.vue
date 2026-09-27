<template>
  <div class="closing-scheme-card">
    <div class="scheme-header">
      <el-checkbox
        v-if="isWritable"
        :value="checked"
        @input="$emit('update:checked', $event)"
      >
        {{ name }}
      </el-checkbox>
      <span v-else>{{ name }}</span>
      <el-button
        v-if="isWritable"
        v-hasPermi="['fms:closing:update']"
        type="text"
        icon="el-icon-setting"
        aria-label="方案设置"
        @click="$emit('settings')"
      />
    </div>

    <div class="scheme-amount">
      <div class="amount-value">{{ formatMoney(balance) }}</div>
      <div class="amount-footer">
        <span>金额</span>
        <span v-if="voucherIds.length" class="voucher-links">
          <el-link
            v-for="voucherId in voucherIds"
            :key="voucherId"
            type="primary"
            @click="$emit('open-voucher', voucherId)"
          >
            凭证 #{{ voucherId }}
          </el-link>
        </span>
      </div>
    </div>

    <div class="scheme-actions">
      <el-button
        v-if="isWritable"
        v-hasPermi="['fms:closing:profit-loss']"
        type="text"
        :disabled="generateDisabled"
        @click="$emit('generate')"
      >
        {{ voucherIds.length ? '重新生成' : '生成凭证' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { formatMoney } from '@/views/fms/utils/format'

export default {
  name: 'FmsClosingSchemeCard',
  props: {
    name: { type: String, required: true },
    checked: { type: Boolean, required: true },
    balance: { type: Number, default: 0 },
    voucherIds: { type: Array, default: () => [] },
    generateDisabled: { type: Boolean, required: true },
    isWritable: { type: Boolean, required: true }
  },
  methods: { formatMoney }
}
</script>

<style scoped>
.closing-scheme-card {
  overflow: hidden;
  padding: 0 10px 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #f5f7fa;
}
.scheme-header { height: 44px; display: flex; align-items: center; justify-content: space-between; }
.scheme-amount { min-height: 82px; padding: 16px; border-radius: 5px; background: #fff; box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%); }
.amount-value { min-height: 22px; font-size: 18px; font-weight: 600; }
.amount-footer { min-height: 24px; margin-top: 8px; display: flex; align-items: center; justify-content: space-between; color: #909399; font-size: 12px; }
.voucher-links { display: flex; max-width: 150px; gap: 6px; overflow: auto; white-space: nowrap; }
.scheme-actions { height: 36px; display: flex; align-items: center; justify-content: flex-end; }
</style>
