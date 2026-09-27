<template>
  <div class="app-container fms-auxiliary-page">
    <doc-alert title="【设置】币别、科目、辅助核算、初始余额" url="https://doc.iocoder.cn/fms/config/accounting/" />

    <el-form :inline="true" class="account-set-toolbar" label-width="78px">
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
    </el-form>

    <el-alert
      v-if="!accountSetId"
      class="mb12"
      :closable="false"
      show-icon
      title="请先选择已初始化的账套"
      type="info"
    />

    <div class="auxiliary-grid">
      <el-card class="type-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">核算类别</span>
          <el-button
            v-if="isWritable"
            v-hasPermi="['fms:config:auxiliary:create']"
            icon="el-icon-plus"
            plain
            size="mini"
            type="primary"
            @click="openForm()"
          >新增</el-button>
        </div>
        <el-table
          ref="typeTable"
          v-loading="loading"
          :data="list"
          :show-header="false"
          highlight-current-row
          row-key="id"
          @row-click="handleTypeChange"
        >
          <el-table-column min-width="170">
            <template slot-scope="scope">
              <div class="type-row">
                <div class="type-name">
                  <span class="truncate">{{ scope.row.name }}</span>
                  <el-tag v-if="!scope.row.systemPreset" class="custom-tag" size="mini">自定义</el-tag>
                </div>
                <div v-if="!scope.row.systemPreset" class="type-actions">
                  <el-button
                    v-if="isWritable"
                    v-hasPermi="['fms:config:auxiliary:update']"
                    icon="el-icon-edit"
                    type="text"
                    @click.stop="openForm(scope.row)"
                  />
                  <el-button
                    v-if="isWritable"
                    v-hasPermi="['fms:config:auxiliary:delete']"
                    class="danger-text"
                    icon="el-icon-delete"
                    type="text"
                    @click.stop="handleDelete(scope.row)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="item-card" shadow="never">
        <fms-auxiliary-item-panel
          :account-set-id="accountSetId"
          :auxiliary-type="currentAuxiliaryType"
          :is-writable="isWritable"
        />
      </el-card>
    </div>

    <fms-auxiliary-type-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsAuxiliaryTypeApi } from '@/api/fms/config/auxiliary/type'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import FmsAuxiliaryItemPanel from './FmsAuxiliaryItemPanel.vue'
import FmsAuxiliaryTypeForm from './FmsAuxiliaryTypeForm.vue'

export default {
  name: 'FmsAuxiliary',
  components: { FmsAuxiliaryItemPanel, FmsAuxiliaryTypeForm },
  data() {
    return {
      loading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      list: [],
      currentAuxiliaryType: null,
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
        this.accountSets = rows.filter(item => item && item.initialized !== false)
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
      this.list = []
      this.currentAuxiliaryType = null
      this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.list = []
        this.currentAuxiliaryType = null
        this.loading = false
        return
      }
      this.loading = true
      return FmsAuxiliaryTypeApi.getAuxiliaryTypeList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.list = rows
        const currentId = this.currentAuxiliaryType && this.currentAuxiliaryType.id
        const routeId = Number(this.$route.query && this.$route.query.auxiliaryTypeId)
        this.currentAuxiliaryType = this.list.find(item => Number(item.id) === Number(currentId)) ||
          this.list.find(item => Number(item.id) === routeId) || this.list[0] || null
        this.$nextTick(() => {
          if (this.$refs.typeTable) this.$refs.typeTable.setCurrentRow(this.currentAuxiliaryType)
        })
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    handleTypeChange(row) {
      this.currentAuxiliaryType = row
    },
    openForm(row) {
      if (!this.accountSetId) return
      this.$refs.form.open(row, this.accountSetId)
    },
    handleDelete(row) {
      if (!this.accountSetId) return
      this.$modal.confirm('确认删除辅助核算类别“' + row.name + '”吗？').then(() => {
        return FmsAuxiliaryTypeApi.deleteAuxiliaryType(this.accountSetId, row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.account-set-toolbar { margin-bottom: 12px; }
.mb12 { margin-bottom: 12px; }
.auxiliary-grid { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 16px; }
.type-card, .item-card { min-width: 0; }
.card-header, .type-row, .type-name { display: flex; align-items: center; }
.card-header, .type-row { justify-content: space-between; }
.card-title { font-size: 16px; font-weight: 600; }
.type-name { min-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.custom-tag { flex-shrink: 0; margin-left: 6px; }
.type-actions { display: flex; flex-shrink: 0; margin-left: 4px; }
.type-actions .el-button { margin-left: 4px; padding: 4px; }
.danger-text { color: #f56c6c; }
@media (max-width: 900px) {
  .auxiliary-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
