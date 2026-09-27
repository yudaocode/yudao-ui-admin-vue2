<!-- 新增商机分析 -->
<template>
  <div class="business-summary">
    <el-card
      v-loading="loading"
      shadow="never"
    >
      <div
        ref="chart"
        class="summary-chart"
      />
      <div
        v-if="!loading && chartRows.length === 0"
        class="empty-chart"
      >暂无统计数据</div>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <template v-if="canQueryBusiness">
        <el-table
          v-loading="loading || listLoading"
          :data="list"
          border
        >
          <el-table-column
            align="center"
            fixed="left"
            label="序号"
            type="index"
            width="80"
          />
          <el-table-column
            align="center"
            fixed="left"
            label="商机名称"
            prop="name"
            width="160"
          >
            <template slot-scope="scope">
              <el-link
                :underline="false"
                type="primary"
                @click="openDetail(scope.row.id)"
              >
                {{ scope.row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            fixed="left"
            label="客户名称"
            prop="customerName"
            width="140"
          >
            <template slot-scope="scope">
              <el-link
                :underline="false"
                type="primary"
                @click="openCustomerDetail(scope.row.customerId)"
              >
                {{ scope.row.customerName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
            label="商机金额（元）"
            prop="totalPrice"
            width="140"
            :formatter="erpPriceTableColumnFormatter"
          />
          <el-table-column
            align="center"
            label="预计成交日期"
            prop="dealTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column
            align="center"
            label="备注"
            prop="remark"
            width="200"
          />
          <el-table-column
            align="center"
            label="下次联系时间"
            prop="contactNextTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column
            align="center"
            label="负责人"
            prop="ownerUserName"
            width="100"
          />
          <el-table-column
            align="center"
            label="所属部门"
            prop="ownerUserDeptName"
            width="120"
          />
          <el-table-column
            align="center"
            label="最后跟进时间"
            prop="contactLastTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column
            align="center"
            label="更新时间"
            prop="updateTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column
            align="center"
            label="创建时间"
            prop="createTime"
            width="180"
            :formatter="dateFormatter"
          />
          <el-table-column
            align="center"
            label="创建人"
            prop="creatorName"
            width="100"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="商机状态组"
            prop="statusTypeName"
            width="140"
          />
          <el-table-column
            align="center"
            fixed="right"
            label="商机阶段"
            prop="statusName"
            width="120"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="pageQuery.pageNo"
          :limit.sync="pageQuery.pageSize"
          @pagination="getList"
        />
      </template>
      <el-alert
        v-else
        type="info"
        title="暂无商机查询权限，统计图仍可正常查看"
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { StatisticFunnelApi } from '@/api/crm/statistics/funnel'
import { dateFormatter, erpPriceTableColumnFormatter } from '@/utils'

export default {
  name: 'BusinessSummary',
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pageQuery: {
        pageNo: 1,
        pageSize: 10
      },
      loading: false,
      listLoading: false,
      chartRows: [],
      list: [],
      total: 0,
      chart: null,
      requestSequence: 0,
      pageRequestSequence: 0
    }
  },
  computed: {
    canQueryBusiness() {
      const permissions = this.$store.getters.permissions || []
      return permissions.indexOf('*:*:*') !== -1 || permissions.indexOf('crm:business:query') !== -1
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    this.requestSequence += 1
    this.pageRequestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    dateFormatter,
    erpPriceTableColumnFormatter,
    getApiParams() {
      return {
        interval: this.queryParams.interval,
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        statusTypeId: this.queryParams.statusTypeId,
        times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
      }
    },
    getPageParams() {
      return Object.assign({}, this.getApiParams(), {
        pageNo: this.pageQuery.pageNo,
        pageSize: this.pageQuery.pageSize
      })
    },
    async loadData() {
      const requestId = ++this.requestSequence
      const pageRequestId = ++this.pageRequestSequence
      this.pageQuery.pageNo = 1
      this.loading = true
      this.listLoading = this.canQueryBusiness
      const chartRequest = StatisticFunnelApi.getBusinessSummaryByDate(this.getApiParams())
      const pageRequest = this.canQueryBusiness
        ? StatisticFunnelApi.getBusinessPageByDate(this.getPageParams())
        : Promise.resolve({ data: { list: [], total: 0 }})
      try {
        const results = await Promise.all([chartRequest, pageRequest])
        if (requestId === this.requestSequence) {
          this.chartRows = results[0].data
          this.$nextTick(() => this.renderChart())
        }
        if (pageRequestId === this.pageRequestSequence) {
          const page = results[1].data
          this.list = page.list
          this.total = page.total
        }
      } finally {
        if (requestId === this.requestSequence) this.loading = false
        if (pageRequestId === this.pageRequestSequence) this.listLoading = false
      }
    },
    async getList() {
      if (!this.canQueryBusiness) return
      const requestId = ++this.pageRequestSequence
      this.listLoading = true
      try {
        const page = (await StatisticFunnelApi.getBusinessPageByDate(this.getPageParams())).data
        if (requestId !== this.pageRequestSequence) return
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.pageRequestSequence) this.listLoading = false
      }
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    openCustomerDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.chartRows) ? this.chartRows : []
      this.chart.setOption({
        grid: { left: 30, right: 30, bottom: 20, containLabel: true },
        legend: {},
        toolbox: {
          feature: {
            dataZoom: { xAxisIndex: false },
            brush: { type: ['lineX', 'clear'] },
            saveAsImage: { show: true, name: '新增商机分析' }
          }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }},
        xAxis: {
          type: 'category',
          name: '日期',
          data: rows.map(item => item.time)
        },
        yAxis: [
          { type: 'value', name: '新增商机数量', min: 0, minInterval: 1 },
          {
            type: 'value',
            name: '新增商机金额',
            min: 0,
            minInterval: 1,
            splitLine: { lineStyle: { type: 'dotted', opacity: 0.7 }}
          }
        ],
        series: [
          {
            name: '新增商机数量',
            type: 'bar',
            yAxisIndex: 0,
            data: rows.map(item => Number(item.businessCreateCount || 0))
          },
          {
            name: '新增商机金额',
            type: 'bar',
            yAxisIndex: 1,
            data: rows.map(item => Number(item.totalPrice || 0))
          }
        ]
      }, true)
      this.chart.resize()
    }
  }
}
</script>

<style scoped>
.summary-chart {
  width: 100%;
  height: 500px;
}

.table-card {
  margin-top: 16px;
}

.empty-chart {
  margin-top: -275px;
  height: 275px;
  color: #909399;
  text-align: center;
  pointer-events: none;
}
</style>
