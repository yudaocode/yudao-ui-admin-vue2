<template>
  <div
    v-if="accessible"
    v-loading="loading"
  >
    <el-card
      shadow="never"
      class="record-card"
    >
      <div class="record-header">
        <span>社保管理</span>
        <el-date-picker
          v-model="year"
          type="year"
          value-format="yyyy"
          :clearable="false"
          :picker-options="yearPickerOptions"
          style="width: 120px"
          @change="loadRecords"
        />
      </div>
    </el-card>
    <el-card
      v-if="records.length"
      shadow="never"
      class="record-card"
    >
      <el-table
        :data="records"
        border
      >
        <el-table-column
          label="所属月份"
          width="110"
          fixed
        >
          <template slot-scope="scope">{{ scope.row.year }}-{{ padMonth(scope.row.month) }}</template>
        </el-table-column>
        <el-table-column
          label="参保方案"
          min-width="210"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.schemeName || '-' }}</div>
            <div
              v-if="scope.row.schemeCity"
              class="scheme-city"
            >{{ scope.row.schemeCity }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="方案类型"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <dict-tag
              v-if="scope.row.schemeType"
              :type="DICT_TYPE.HRM_INSURANCE_SCHEME_TYPE"
              :value="scope.row.schemeType"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="个人社保"
          min-width="130"
          align="right"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.personalInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          label="公司社保"
          min-width="130"
          align="right"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.corporateInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          label="个人公积金"
          min-width="130"
          align="right"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.personalProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          label="公司公积金"
          min-width="130"
          align="right"
        >
          <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row.corporateProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          label="合计"
          min-width="140"
          align="right"
        >
          <template slot-scope="scope"><b class="record-total">¥ {{ formatHrmMoney(recordTotal(scope.row)) }}</b></template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope"><el-button
            type="text"
            @click="openDetail(scope.row)"
          >查看详情</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card
      v-else
      shadow="never"
      class="record-card"
    ><el-empty description="暂无社保数据" /></el-card>
    <InsuranceRecordDetail ref="detailRef" />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { getInsuranceRecordList } from '@/api/hrm/portal/insurance/record'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import InsuranceRecordDetail from './InsuranceRecordDetail.vue'

export default {
  name: 'HrmPortalInsurance',
  components: { InsuranceRecordDetail },
  data() {
    return {
      DICT_TYPE,
      accessible: false,
      loading: false,
      year: formatDate(new Date(), 'YYYY'),
      firstYear: undefined,
      allRecords: [],
      records: [],
      yearPickerOptions: { disabledDate: date => this.firstYear !== undefined && date.getFullYear() < this.firstYear }
    }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.init()
  },
  methods: {
    formatHrmMoney,
    padMonth(month) { return String(month).padStart(2, '0') },
    loadRecords() {
      this.records = this.allRecords.filter(record => record.year === Number(this.year))
    },
    async init() {
      this.loading = true
      try {
        const response = await getInsuranceRecordList()
        const records = response.data
        const years = records.map(record => record.year)
        let year = this.year
        let firstYear = this.firstYear
        if (years.length) {
          firstYear = Math.min(...years)
          year = String(Math.max(...years))
        }
        this.allRecords = records
        this.firstYear = firstYear
        this.year = year
        this.loadRecords()
      } finally {
        this.loading = false
      }
    },
    personalTotal(record) {
      return Number(record && record.personalInsuranceAmount || 0) + Number(record && record.personalProvidentFundAmount || 0)
    },
    corporateTotal(record) {
      return Number(record && record.corporateInsuranceAmount || 0) + Number(record && record.corporateProvidentFundAmount || 0)
    },
    recordTotal(record) { return this.personalTotal(record) + this.corporateTotal(record) },
    openDetail(record) { this.$refs.detailRef.open(record) }
  }
}
</script>

<style scoped>
.record-header { display: flex; align-items: center; justify-content: space-between; color: #303133; font-size: 18px; font-weight: 600; }
.record-card { margin-bottom: 15px; }
.scheme-city { margin-top: 3px; color: #909399; font-size: 12px; }
.record-total { color: #409eff; }
</style>
