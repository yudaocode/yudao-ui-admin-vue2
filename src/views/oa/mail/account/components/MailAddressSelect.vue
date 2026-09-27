<template>
  <el-select
    :value="value"
    multiple
    filterable
    allow-create
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    placeholder="请选择或输入邮箱地址"
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script>
import * as AccountApi from '@/api/oa/mail/account'

export default {
  name: 'OaMailAddressSelect',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false, // 列表加载中
      accounts: [] // 当前租户邮箱及归属人
    }
  },
  computed: {
    // 回复、草稿中的外部地址也需要正常回显
    options() {
      const addresses = new Map()
      this.accounts.forEach(account => {
        const label = account.userName ? account.userName + ' <' + account.mail + '>' : account.mail
        addresses.set(
          account.mail,
          addresses.has(account.mail) ? addresses.get(account.mail) + '、' + label : label
        )
      })
      ;(this.value || []).forEach(address => {
        if (!addresses.has(address)) addresses.set(address, address)
      })
      return Array.from(addresses, ([value, label]) => ({ value, label }))
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    },
    /** 查询公司邮箱地址 */
    getList() {
      this.loading = true
      return AccountApi.getSimpleMailAccountList().then(response => {
        this.accounts = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
