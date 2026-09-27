<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">团队概况</div>
    <div class="team-charts">
      <div v-for="(chartItem, index) in charts" :key="chartItem.title" class="team-chart-wrap">
        <div class="team-chart__title">{{ chartItem.title }}</div>
        <div v-if="hasData(chartItem.data)" :ref="`chart${index}`" class="team-chart" />
        <el-empty v-else :image-size="64" description="暂无数据" />
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { DICT_TYPE } from '@/utils/dict'
import { formatHrmAnalysisDictType, formatHrmAnalysisRangeType } from '@/views/hrm/utils/format'
import { HrmTeamHomeAgeRangeType, HrmTeamHomeCompanyAgeRangeType } from '@/views/hrm/utils/constants'

const AGE_RANGE_NAMES = {
  [HrmTeamHomeAgeRangeType.UNDER_18]: '17以下',
  [HrmTeamHomeAgeRangeType.AGE_18_TO_25]: '18-25',
  [HrmTeamHomeAgeRangeType.AGE_26_TO_35]: '26-35',
  [HrmTeamHomeAgeRangeType.AGE_36_TO_45]: '36-45',
  [HrmTeamHomeAgeRangeType.AGE_46_TO_55]: '46-55',
  [HrmTeamHomeAgeRangeType.AGE_56_AND_ABOVE]: '56以上'
}

const COMPANY_AGE_RANGE_NAMES = {
  [HrmTeamHomeCompanyAgeRangeType.WITHIN_3_MONTHS]: '3个月内',
  [HrmTeamHomeCompanyAgeRangeType.MONTHS_3_TO_6]: '3-6个月',
  [HrmTeamHomeCompanyAgeRangeType.MONTHS_6_TO_1_YEAR]: '6个月-1年',
  [HrmTeamHomeCompanyAgeRangeType.YEARS_1_TO_3]: '1-3年',
  [HrmTeamHomeCompanyAgeRangeType.YEARS_3_TO_5]: '3-5年',
  [HrmTeamHomeCompanyAgeRangeType.YEARS_5_TO_10]: '5-10年',
  [HrmTeamHomeCompanyAgeRangeType.YEARS_10_AND_ABOVE]: '10年以上'
}

export default {
  name: 'HrmTeamHomeSurvey',
  props: {
    survey: { type: Object, default: undefined }
  },
  data() {
    return { chartInstances: {}}
  },
  computed: {
    charts() {
      const survey = this.survey || {}
      return [
        {
          title: '员工状态占比',
          data: survey.statusAnalysis || [],
          formatType: type => formatHrmAnalysisDictType(DICT_TYPE.HRM_EMPLOYEE_STATUS, type)
        },
        {
          title: '男女性别占比',
          data: survey.sexAnalysis || [],
          formatType: type => formatHrmAnalysisDictType(DICT_TYPE.SYSTEM_USER_SEX, type)
        },
        {
          title: '成员年龄占比',
          data: survey.ageAnalysis || [],
          formatType: type => formatHrmAnalysisRangeType(AGE_RANGE_NAMES, type)
        },
        {
          title: '成员司龄占比',
          data: survey.companyAgeAnalysis || [],
          formatType: type => formatHrmAnalysisRangeType(COMPANY_AGE_RANGE_NAMES, type)
        }
      ]
    }
  },
  watch: {
    survey: {
      deep: true,
      handler() {
        this.$nextTick(this.renderCharts)
      }
    }
  },
  mounted() {
    this.$nextTick(this.renderCharts)
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    Object.keys(this.chartInstances).forEach(index => this.chartInstances[index].dispose())
    this.chartInstances = {}
  },
  methods: {
    hasData(data) {
      return data.some(item => item.count > 0)
    },
    /** 构建团队概况饼图 */
    buildChartOptions(data, formatType) {
      const chartData = data.filter(item => item.count > 0)
      return {
        color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#00a6a6', '#7b61ff', '#d97706'],
        tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 人（{d}%）' },
        legend: { bottom: 0, type: 'scroll' },
        series: [{
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: true,
          label: { formatter: '{b}\n{c} 人' },
          data: chartData.map(item => ({ name: formatType(item.type), value: item.count }))
        }]
      }
    },
    renderCharts() {
      this.charts.forEach((chartItem, index) => {
        if (!this.hasData(chartItem.data)) {
          if (this.chartInstances[index]) this.chartInstances[index].dispose()
          delete this.chartInstances[index]
          return
        }
        const chartRef = this.$refs[`chart${index}`]
        const element = Array.isArray(chartRef) ? chartRef[0] : chartRef
        if (!element) return
        const chart = this.chartInstances[index] || echarts.init(element)
        this.chartInstances[index] = chart
        chart.setOption(this.buildChartOptions(chartItem.data, chartItem.formatType), true)
      })
    },
    resizeCharts() {
      Object.keys(this.chartInstances).forEach(index => this.chartInstances[index].resize())
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.team-charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; row-gap: 8px; }
.team-chart-wrap { min-height: 260px; }
.team-chart__title { margin-bottom: 4px; color: #606266; font-size: 14px; text-align: center; }
.team-chart { height: 230px; }
@media (max-width: 1199px) {
  .team-charts { grid-template-columns: 1fr; }
}
</style>
