<template>
  <div class="app-container fms-currency-page">
    <doc-alert title="【设置】币别、科目、辅助核算、初始余额" url="https://doc.iocoder.cn/fms/config/accounting/" />

    <el-form ref="queryForm" :inline="true" label-width="78px" class="currency-toolbar">
      <el-form-item label="当前账套">
        <el-select v-model="accountSetId" filterable clearable placeholder="请选择账套" style="width: 240px" @change="handleAccountSetChange">
          <el-option v-for="item in accountSets" :key="item.id" :label="item.companyName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isWritable" v-hasPermi="['fms:config:currency:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
      </el-form-item>
    </el-form>

    <el-alert v-if="!accountSetId" class="mb12" type="info" :closable="false" show-icon title="请先选择已初始化的账套" />
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="币别编码" prop="code" min-width="160" />
      <el-table-column label="币别名称" prop="name" min-width="220" show-overflow-tooltip />
      <el-table-column label="汇率" align="right" min-width="180">
        <template slot-scope="scope">{{ formatExchangeRate(scope.row.exchangeRate) }}</template>
      </el-table-column>
      <el-table-column label="本位币" align="center" width="130">
        <template slot-scope="scope"><dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.standard" /></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="isWritable" v-hasPermi="['fms:config:currency:update']" type="text" @click="openForm('update', scope.row)">编辑</el-button>
          <el-button v-if="isWritable && !scope.row.standard" v-hasPermi="['fms:config:currency:delete']" type="text" class="danger-text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <fms-currency-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsCurrencyApi } from '@/api/fms/config/currency'
import { DICT_TYPE } from '@/utils/dict'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import { formatExchangeRate } from '@/views/fms/utils/format'
import FmsCurrencyForm from './FmsCurrencyForm.vue'

export default {
  name: 'FmsCurrency',
  components: { FmsCurrencyForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      list: []
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      return !!(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    }
  },
  created() {
    this.loadAccountSets()
  },
  methods: {
    formatExchangeRate,
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        const current = this.currentAccountSet
        if (current) saveFmsAccountSet(current)
        this.getList()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.getList()
    },
    getList() {
      if (!this.accountSetId) {
        this.list = []
        return
      }
      this.loading = true
      return FmsCurrencyApi.getCurrencyList(this.accountSetId).then(response => {
        const rows = response.data
        this.list = rows
      }).finally(() => {
        this.loading = false
      })
    },
    openForm(type, row) {
      if (!this.accountSetId) return
      this.$refs.form.open(type, this.accountSetId, row)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除币别“' + row.name + '”？').then(() => {
        return FmsCurrencyApi.deleteCurrency(this.accountSetId, row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.currency-toolbar { margin-bottom: 12px; }
.mb12 { margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
