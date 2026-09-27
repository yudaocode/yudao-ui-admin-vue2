<template>
  <el-select
    v-model="account.id"
    placeholder="请选择公众号"
    @change="onChanged"
  >
    <el-option
      v-for="item in accountList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>

<script>
import { getSimpleAccountList } from '@/api/mp/account'

export default {
  name: 'WxAccountSelect',
  data() {
    return {
      account: {
        id: -1,
        name: ''
      },
      accountList: []
    }
  },
  mounted() {
    this.handleQuery()
  },
  methods: {
    async handleQuery() {
      const response = await getSimpleAccountList()
      this.accountList = response.data
      if (this.accountList.length === 0) {
        this.$message.error('未配置公众号，请在【公众号管理 -> 账号管理】菜单，进行配置')
        await this.$store.dispatch('tagsView/delView', this.$route)
        await this.$router.push({ name: 'MpAccount' })
        return
      }
      this.account.id = this.accountList[0].id
      if (this.account.id) {
        this.account.name = this.accountList[0].name
        this.$emit('change', this.account.id, this.account.name)
      }
    },
    onChanged(id) {
      const found = this.accountList.find(item => item.id === id)
      if (this.account.id) {
        this.account.name = found ? found.name : ''
        this.$emit('change', this.account.id, this.account.name)
      }
    }
  }
}
</script>
