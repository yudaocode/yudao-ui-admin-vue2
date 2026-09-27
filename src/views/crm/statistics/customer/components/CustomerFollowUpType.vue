<!-- 客户跟进方式分析 -->
<template>
  <div class="customer-follow-up-type">
    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <div
        ref="chart"
        class="customer-chart"
      />
      <div
        v-if="!loading && list.length === 0"
        class="empty-chart"
      >暂无统计数据</div>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <el-table
        v-loading="loading"
        :data="list"
        border
      >
        <el-table-column
          label="序号"
          align="center"
          type="index"
          width="80"
        />
        <el-table-column
          label="跟进方式"
          align="center"
          prop="followUpType"
          min-width="180"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="followUpTypeDict"
              :value="scope.row.followUpType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="个数"
          align="center"
          prop="followUpRecordCount"
          min-width="160"
        />
        <el-table-column
          label="占比(%)"
          align="center"
          prop="portion"
          min-width="160"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticsCustomerApi } from '@/api/crm/statistics/customer'
import { getDictDataLabel } from '@/utils/dict'
import { erpCalculatePercentage } from '@/utils'

const CRM_FOLLOW_UP_DICT_TYPE = 'crm_follow_up_type'

function followUpTypeLabel(value) {
  return getDictDataLabel(CRM_FOLLOW_UP_DICT_TYPE, value) || '未知'
}

export default {
  name: 'CustomerFollowupType',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      followUpTypeDict: CRM_FOLLOW_UP_DICT_TYPE,
      loading: false,
      list: [],
      chart: null,
      requestSequence: 0
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    getApiParams() {
      return {
        interval: this.queryParams.interval,
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsCustomerApi.getFollowUpSummaryByType(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        const rows = data
        const total = rows.reduce(
          (sum, item) => sum + Number(item.followUpRecordCount || 0),
          0
        )
        this.list = rows.map(item => Object.assign({}, item, {
          portion: erpCalculatePercentage(Number(item.followUpRecordCount || 0), total)
        }))
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.list) ? this.list : []
      this.chart.setOption({
        title: { text: '客户跟进方式分析', left: 'center' },
        legend: { orient: 'vertical', left: 'left' },
        tooltip: { trigger: 'item', formatter: '{b} : {c} 次 ({d}%)' },
        toolbox: {
          feature: {
            saveAsImage: { show: true, name: '客户跟进方式分析' }
          }
        },
        series: [{
          name: '跟进方式',
          type: 'pie',
          radius: '50%',
          data: rows.map(item => ({
            name: followUpTypeLabel(item.followUpType),
            value: Number(item.followUpRecordCount || 0)
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }, true)
      this.resizeChart()
    }
  }
}
</script>

<style scoped>
.chart-card {
  position: relative;
}

.customer-chart {
  width: 100%;
  height: 500px;
}

.table-card {
  margin-top: 16px;
}

.empty-chart {
  position: absolute;
  top: 245px;
  left: 0;
  width: 100%;
  color: #909399;
  text-align: center;
  pointer-events: none;
}
</style>
