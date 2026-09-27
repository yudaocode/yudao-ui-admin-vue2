<template>
  <div class="app-container fms-voucher-word-page">
    <doc-alert title="【设置】凭证字、常用摘要、凭证模板" url="https://doc.iocoder.cn/fms/config/voucher/" />

    <el-form :inline="true" class="voucher-word-toolbar" label-width="78px">
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
          v-hasPermi="['fms:config:voucher-word:create']"
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
      <el-table-column label="凭证字" min-width="180" prop="name" />
      <el-table-column label="打印标题" min-width="260" prop="printTitle" />
      <el-table-column align="center" label="是否默认" width="130">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.defaultStatus" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="160">
        <template slot-scope="scope">
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-word:update']"
            icon="el-icon-edit"
            type="text"
            @click="openForm('update', scope.row)"
          >编辑</el-button>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:voucher-word:delete']"
            class="danger-text"
            icon="el-icon-delete"
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <fms-voucher-word-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { DICT_TYPE } from '@/utils/dict'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsVoucherWordForm from './FmsVoucherWordForm.vue'

export default {
  name: 'FmsVoucherWord',
  components: { FmsVoucherWordForm },
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
      return Boolean(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    }
  },
  created() {
    this.loadAccountSets()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        if (this.currentAccountSet) saveFmsAccountSet(this.currentAccountSet)
        return this.getList()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      return this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.list = []
        this.loading = false
        return Promise.resolve()
      }
      this.loading = true
      return FmsVoucherWordApi.getVoucherWordList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    openForm(type, row) {
      if (!this.accountSetId) return
      this.$refs.form.open(type, Number(this.accountSetId), row)
    },
    handleDelete(row) {
      if (!this.accountSetId) return
      if (row.defaultStatus) {
        this.$modal.msgError('默认凭证字不允许删除')
        return
      }
      this.$modal.confirm('是否确认删除凭证字“' + row.name + '”？').then(() => {
        return FmsVoucherWordApi.deleteVoucherWord(Number(this.accountSetId), row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.voucher-word-toolbar { margin-bottom: 12px; }
.mb12 { margin-bottom: 12px; }
.danger-text { color: #f56c6c; }
</style>
