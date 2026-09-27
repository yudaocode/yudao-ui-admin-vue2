<template>
  <el-date-picker
    :value="value"
    :clearable="false"
    :picker-options="pickerOptions"
    end-placeholder="结束月份"
    start-placeholder="开始月份"
    style="width: 240px"
    type="monthrange"
    value-format="yyyy-MM"
    @input="handleInput"
    @change="$emit('change', $event)"
  />
</template>

<script>
import { useFmsStore } from '@/views/fms/store/fms'

export default {
  name: 'FmsLedgerMonthRangePicker',
  props: {
    value: { type: Array, required: true }
  },
  data() {
    return { fmsStore: useFmsStore() }
  },
  computed: {
    accountSetStartMonth() {
      const accountSet = this.fmsStore.getAccountSetList
        .find(item => item.id === this.fmsStore.getAccountSetId)
      if (!accountSet || !accountSet.startTime) return ''
      const text = String(accountSet.startTime)
      const match = text.match(/^(\d{4})-(\d{2})/)
      if (match) return match[1] + '-' + match[2]
      const date = new Date(accountSet.startTime)
      return Number.isNaN(date.getTime()) ? '' : date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
    },
    pickerOptions() {
      return { disabledDate: this.disabledDate }
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value || [])
    },
    disabledDate(date) {
      if (!this.accountSetStartMonth) return false
      const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
      return month < this.accountSetStartMonth
    }
  }
}
</script>
