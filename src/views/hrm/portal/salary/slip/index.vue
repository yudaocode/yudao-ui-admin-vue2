<template>
  <div
    v-if="accessible"
    v-loading="loading"
  >
    <el-card
      shadow="never"
      class="slip-filter-card"
    >
      <div class="slip-header">
        <span>我的工资条</span>
        <div class="slip-filter">
          <el-date-picker
            v-model="monthRange"
            type="monthrange"
            value-format="yyyy-MM"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            style="width: 260px"
            @change="loadSlips"
          />
          <el-select
            v-model="sort"
            style="width: 180px"
            @change="loadSlips"
          >
            <el-option
              v-for="item in HRM_SALARY_SLIP_SORT_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button
            v-if="hasFilter"
            type="text"
            @click="resetFilter"
          >清除筛选</el-button>
        </div>
      </div>
    </el-card>
    <template v-if="slips.length">
      <el-card
        v-for="(slip, index) in slips"
        :key="slip.id"
        shadow="never"
        :class="index ? 'slip-card' : ''"
      >
        <div class="slip-title">
          <span>{{ slip.year }} 年 {{ slip.month }} 月工资条</span>
          <el-tag
            v-if="slip.readStatus === 0"
            size="small"
            type="danger"
          >新工资条</el-tag>
        </div>
        <el-table
          :data="[buildSlipRow(slip)]"
          border
        >
          <el-table-column
            label="所属月份"
            prop="monthTitle"
            min-width="110"
            fixed
          />
          <template v-for="option in slip.options">
            <el-table-column
              v-if="option.children && option.children.length"
              :key="'group-' + optionKey(option)"
              :label="option.name"
              align="center"
            >
              <el-table-column
                v-for="child in option.children"
                :key="optionKey(child)"
                :label="child.name"
                :prop="'option' + child.code"
                min-width="120"
              >
                <template slot="header">
                  <el-tooltip
                    v-if="child.remark"
                    :content="child.remark"
                    placement="top"
                  >
                    <span>{{ child.name }} <i class="el-icon-question" /></span>
                  </el-tooltip>
                  <span v-else>{{ child.name }}</span>
                </template>
                <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row['option' + child.code]) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column
              v-else
              :key="'option-' + optionKey(option)"
              :label="option.name"
              :prop="'option' + option.code"
              min-width="120"
            >
              <template slot="header">
                <el-tooltip
                  v-if="option.remark"
                  :content="option.remark"
                  placement="top"
                >
                  <span>{{ option.name }} <i class="el-icon-question" /></span>
                </el-tooltip>
                <span v-else>{{ option.name }}</span>
              </template>
              <template slot-scope="scope">¥ {{ formatHrmMoney(scope.row['option' + option.code]) }}</template>
            </el-table-column>
          </template>
        </el-table>
      </el-card>
    </template>
    <el-card
      v-else
      shadow="never"
    ><el-empty description="暂无工资条" /></el-card>
  </div>
</template>

<script>
import { getSalarySlipList, markSalarySlipRead } from '@/api/hrm/portal/salary/slip'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import { HRM_SALARY_SLIP_SORT_OPTIONS, HrmSalarySlipSort } from '@/views/hrm/utils/constants'
import { formatHrmMoney } from '@/views/hrm/utils/format'

export default {
  name: 'HrmPortalSalarySlip',
  data() {
    return {
      HRM_SALARY_SLIP_SORT_OPTIONS,
      accessible: false,
      loading: false,
      monthRange: [],
      sort: HrmSalarySlipSort.RECENT_SEND,
      slips: []
    }
  },
  computed: {
    hasFilter() {
      return this.monthRange.length > 0 || this.sort !== HrmSalarySlipSort.RECENT_SEND
    }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.loadSlips()
  },
  methods: {
    formatHrmMoney,
    async loadSlips() {
      this.loading = true
      try {
        const params = {}
        if (this.monthRange.length === 2) {
          params.startMonth = this.monthRange[0]
          params.endMonth = this.monthRange[1]
        }
        const sortOption = HRM_SALARY_SLIP_SORT_OPTIONS.find(item => item.value === this.sort)
        if (sortOption) {
          params.orderType = sortOption.orderType
          params.order = sortOption.order
        }
        const response = await getSalarySlipList(params)
        const slips = response.data
        this.slips = slips
        const unreadIds = slips.filter(slip => slip.readStatus === 0).map(slip => slip.id)
        if (unreadIds.length) await markSalarySlipRead(unreadIds)
      } finally {
        this.loading = false
      }
    },
    resetFilter() {
      this.monthRange = []
      this.sort = HrmSalarySlipSort.RECENT_SEND
      return this.loadSlips()
    },
    optionKey(option) { return option.code === null || option.code === undefined ? option.name : option.code },
    buildSlipRow(slip) {
      return this.getLeafOptions(slip.options).reduce((row, option) => {
        row[`option${option.code}`] = option.value || 0
        return row
      }, { monthTitle: `${slip.year}-${String(slip.month).padStart(2, '0')}` })
    },
    getLeafOptions(options) {
      return options.reduce((result, option) => {
        if (option.children && option.children.length) result.push(...this.getLeafOptions(option.children))
        else result.push(option)
        return result
      }, [])
    }
  }
}
</script>

<style scoped>
.slip-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #303133; font-size: 18px; font-weight: 600; }
.slip-filter-card { margin-bottom: 15px; }
.slip-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.slip-card { margin-top: 20px; }
.slip-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #303133; font-weight: 600; }
</style>
