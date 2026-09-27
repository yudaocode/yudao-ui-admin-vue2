<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">上月薪资概况</div>
    <div class="salary-layout">
      <div class="salary-survey">
        <button
          v-for="(item, index) in surveyItems"
          :key="item.label"
          :disabled="!canOpenSalary"
          :class="['survey-button', { 'survey-button--clickable': canOpenSalary, 'survey-button--divider': index < surveyItems.length - 1 }]"
          type="button"
          @click="goSalaryRecord"
        >
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </button>
      </div>
      <div class="salary-chart-wrap">
        <div v-if="hasDeptData" ref="chart" class="salary-chart" />
        <el-empty v-else :image-size="72" description="暂无数据" />
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { checkPermi } from '@/utils/permission'
import { formatHrmMoneyWithThousands } from '@/views/hrm/utils/format'

export default {
  name: 'HrmHomeSalarySurvey',
  props: {
    survey: { type: Object, default: undefined }
  },
  data() {
    return { chart: null }
  },
  computed: {
    canQuerySalary() {
      return checkPermi(['hrm:salary:month-record:query'])
    },
    canOpenSalary() {
      return this.canQuerySalary && !!(this.survey && this.survey.monthRecordId)
    },
    surveyItems() {
      const survey = this.survey || {}
      return [
        { label: '计薪人员', value: survey.employeeCount || 0 },
        { label: '实发工资（元）', value: formatHrmMoneyWithThousands(survey.realPaySalary) }
      ]
    },
    hasDeptData() {
      return !!(this.survey && this.survey.deptProportions && this.survey.deptProportions.length)
    },
    salaryDeptChartOptions() {
      const survey = this.survey || {}
      return {
        title: { text: '部门薪资占比', left: 'center', textStyle: { fontSize: 14, fontWeight: 500 }},
        tooltip: { trigger: 'item', formatter: '{b}：{c}%' },
        legend: { type: 'scroll', bottom: 0, left: 'center' },
        series: [{
          type: 'pie',
          radius: '48%',
          center: ['50%', '46%'],
          stillShowZeroSum: false,
          data: (survey.deptProportions || []).map(item => ({
            name: item.deptName,
            value: Number((item.proportion * 100).toFixed(2))
          }))
        }]
      }
    }
  },
  watch: {
    survey: {
      deep: true,
      handler() {
        this.$nextTick(this.renderChart)
      }
    }
  },
  mounted() {
    this.$nextTick(this.renderChart)
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.hasDeptData) {
        if (this.chart) this.chart.dispose()
        this.chart = null
        return
      }
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption(this.salaryDeptChartOptions, true)
    },
    /** 打开上月工资表详情 */
    goSalaryRecord() {
      if (!this.canOpenSalary) return
      this.$router.push({ name: 'HrmSalaryHistoryDetail', params: { id: this.survey.monthRecordId }})
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.salary-layout { display: flex; align-items: stretch; }
.salary-survey { width: 34%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; }
.survey-button { min-height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; cursor: default; }
.survey-button--divider { border-right: 1px solid #ebeef5; }
.survey-button strong { color: #303133; font-size: 24px; line-height: 32px; }
.survey-button span { margin-top: 8px; color: #909399; font-size: 13px; }
.survey-button--clickable { cursor: pointer; }
.survey-button--clickable:hover strong, .survey-button--clickable:hover span { color: #409eff; }
.salary-chart-wrap { min-width: 0; flex: 1; }
.salary-chart { height: 220px; }
</style>
