<template>
  <div class="app-container fms-finance-indicator-page">
    <doc-alert title="【设置】账套管理、财务参数、财务指标" url="https://doc.iocoder.cn/fms/config/account-set/" />

    <el-form :inline="true" class="indicator-toolbar" label-width="78px">
      <el-form-item label="当前账套">
        <el-select
          v-model="accountSetId"
          clearable
          filterable
          placeholder="请选择账套"
          style="width: 240px"
          @change="handleAccountSetChange"
        >
          <el-option
            v-for="item in accountSets"
            :key="item.id"
            :label="item.companyName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:config:finance-indicator:create']"
          icon="el-icon-plus"
          plain
          type="primary"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="!accountSetId"
      class="mb12"
      :closable="false"
      show-icon
      title="请先选择已初始化的账套"
      type="info"
    />

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="名称" min-width="160" prop="name" />
      <el-table-column label="编码" min-width="140" prop="code" />
      <el-table-column align="center" label="取数报表" width="140">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.FMS_FINANCE_INDICATOR_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="公式" min-width="280" prop="formula" show-overflow-tooltip />
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column label="状态" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="160">
        <template slot-scope="scope">
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:finance-indicator:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:finance-indicator:delete']"
            class="danger-text"
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <fms-finance-indicator-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsFinanceIndicatorApi } from '@/api/fms/config/finance-indicator'
import { DICT_TYPE } from '@/utils/dict'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsFinanceIndicatorForm from './FmsFinanceIndicatorForm.vue'

export default {
  name: 'FmsFinanceIndicator',
  components: { FmsFinanceIndicatorForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      list: [],
      requestSequence: 0
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
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        if (this.currentAccountSet) saveFmsAccountSet(this.currentAccountSet)
        this.getList()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.list = []
        this.loading = false
        return
      }
      this.loading = true
      return FmsFinanceIndicatorApi.getFinanceIndicatorList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    openForm(type, id) {
      if (!this.accountSetId) return
      this.$refs.form.open(type, Number(this.accountSetId), id)
    },
    handleDelete(row) {
      if (!this.accountSetId) return
      this.$modal.confirm('是否确认删除财务指标“' + row.name + '”？').then(() => {
        return FmsFinanceIndicatorApi.deleteFinanceIndicator(this.accountSetId, row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.indicator-toolbar { margin-bottom: 12px; }
.mb12 { margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
