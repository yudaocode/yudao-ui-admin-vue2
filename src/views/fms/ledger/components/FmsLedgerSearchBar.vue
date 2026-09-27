<template>
  <el-form :inline="true" label-width="68px" class="fms-ledger-search-bar">
    <el-form-item label="会计期间">
      <FmsLedgerMonthRangePicker
        v-model="monthRange"
        @change="handleAutoQuery"
      />
    </el-form-item>
    <el-form-item v-if="showSubject" label="科目">
      <FmsSubjectSelect
        v-model="query.subjectId"
        :options="subjectOptions"
        placeholder="请选择科目"
        style="width: 240px"
        @change="handleAutoQuery"
      />
    </el-form-item>
    <el-form-item>
      <el-popover v-if="!showSubject" ref="advancedPopover" placement="bottom-start" trigger="click" width="360">
        <el-form label-position="top">
          <el-form-item label="起始科目">
            <FmsSubjectSelect v-model="query.startSubjectId" :options="subjectOptions" clearable style="width: 100%" />
          </el-form-item>
          <el-form-item label="结束科目">
            <FmsSubjectSelect v-model="query.endSubjectId" :options="subjectOptions" clearable style="width: 100%" />
          </el-form-item>
          <el-form-item label="科目级次">
            <div class="level-range">
              <el-input-number v-model="query.minLevel" :controls="false" :min="1" :max="8" />
              <span>至</span>
              <el-input-number v-model="query.maxLevel" :controls="false" :min="1" :max="8" />
            </div>
          </el-form-item>
          <div class="advanced-actions">
            <el-button @click="resetAdvanced">重置</el-button>
            <el-button type="primary" @click="handleAdvancedQuery">查询</el-button>
          </div>
        </el-form>
        <el-button slot="reference" icon="el-icon-s-operation">更多条件</el-button>
      </el-popover>
      <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      <FmsLedgerPrintButton
        v-if="showPrint && printTarget"
        :before-print="beforePrint"
        :center-text="printCenterText"
        :end-month="monthRange[1] || ''"
        :permission-prefix="permissionPrefix"
        :start-month="monthRange[0] || ''"
        :target="printTarget"
        :title="printTitle"
      />
      <el-button
        v-if="showExport"
        v-hasPermi="[permissionPrefix + ':export']"
        :loading="exportLoading"
        type="success"
        plain
        icon="el-icon-download"
        @click="$emit('export')"
      >导出</el-button>
      <slot name="actions" />
    </el-form-item>
  </el-form>
</template>

<script>
import * as FmsSubjectApi from '@/api/fms/config/subject'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import { useFmsStore } from '@/views/fms/store/fms'

import FmsLedgerMonthRangePicker from './FmsLedgerMonthRangePicker.vue'
import FmsLedgerPrintButton from './FmsLedgerPrintButton.vue'
import { buildTree, currentMonthValue, flattenTree } from '../utils'

export default {
  name: 'FmsLedgerSearchBar',
  components: { FmsSubjectSelect, FmsLedgerMonthRangePicker, FmsLedgerPrintButton },
  props: {
    subjects: { type: Array, default: null },
    showSubject: { type: Boolean, default: false },
    subjectId: { type: [Number, String], default: undefined },
    startMonth: { type: String, default: undefined },
    endMonth: { type: String, default: undefined },
    minLevel: { type: Number, default: 1 },
    maxLevel: { type: Number, default: 1 },
    printTarget: { type: String, default: '' },
    printTitle: { type: String, default: '' },
    beforePrint: { type: Function, default: null },
    showExport: { type: Boolean, default: true },
    showPrint: { type: Boolean, default: true },
    exportLoading: { type: Boolean, default: false },
    permissionPrefix: { type: String, default: 'fms:ledger:general' },
    autoQuery: { type: Boolean, default: false }
  },
  data() {
    const fmsStore = useFmsStore()
    const month = fmsStore.getCurrentMonth || currentMonthValue()
    return {
      fmsStore,
      monthRange: [this.startMonth || month, this.endMonth || month],
      localSubjects: [],
      subjectSequence: 0,
      query: {
        subjectId: this.subjectId,
        startSubjectId: undefined,
        endSubjectId: undefined,
        minLevel: this.minLevel,
        maxLevel: this.maxLevel
      }
    }
  },
  computed: {
    accountSetId() {
      return this.fmsStore.getAccountSetId
    },
    subjectOptions() {
      return this.subjects || this.localSubjects
    },
    printCenterText() {
      const subject = flattenTree(this.subjectOptions).find(item => Number(item.id) === Number(this.query.subjectId))
      return subject ? '科目：' + subject.code + ' ' + subject.name : ''
    }
  },
  watch: {
    accountSetId: { immediate: true, handler() { this.loadSubjects() } },
    subjectId(value) { this.query.subjectId = value },
    startMonth() { this.syncPeriod() },
    endMonth() { this.syncPeriod() }
  },
  methods: {
    loadSubjects() {
      const sequence = ++this.subjectSequence
      if (this.subjects || !this.accountSetId) {
        this.localSubjects = []
        return
      }
      return FmsSubjectApi.getSubjectSimpleList(Number(this.accountSetId)).then(response => {
        if (sequence !== this.subjectSequence) return
        const rows = response.data
        this.localSubjects = buildTree(rows)
      })
    },
    syncPeriod() {
      if (this.startMonth && this.endMonth) this.monthRange = [this.startMonth, this.endMonth]
    },
    handleQuery() {
      if (!this.accountSetId || !this.monthRange || this.monthRange.length !== 2) return
      this.$emit('search', {
        startMonth: this.monthRange[0],
        endMonth: this.monthRange[1],
        subjectId: this.query.subjectId,
        startSubjectId: this.query.startSubjectId,
        endSubjectId: this.query.endSubjectId,
        minLevel: this.query.minLevel,
        maxLevel: this.query.maxLevel
      })
    },
    handleAutoQuery() {
      if (this.autoQuery) this.handleQuery()
    },
    handleAdvancedQuery() {
      if (this.$refs.advancedPopover) this.$refs.advancedPopover.doClose()
      this.handleQuery()
    },
    resetAdvanced() {
      this.query.startSubjectId = undefined
      this.query.endSubjectId = undefined
      this.query.minLevel = this.minLevel
      this.query.maxLevel = this.maxLevel
    },
    async resetQuery() {
      const month = await this.fmsStore.loadCurrentMonth() || currentMonthValue()
      this.monthRange = [month, month]
      this.query.subjectId = this.showSubject ? ((flattenTree(this.subjectOptions)[0] || {}).id) : undefined
      this.resetAdvanced()
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.fms-ledger-search-bar { margin-bottom: -18px; }
.level-range { display: flex; align-items: center; gap: 8px; }
.level-range .el-input-number { width: 135px; }
.advanced-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
