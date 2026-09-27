<template>
  <div>
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="84px"
      >
        <el-form-item
          label="员工"
          prop="search"
        >
          <el-input
            v-model="queryParams.search"
            class="search-input"
            clearable
            placeholder="请输入员工姓名或工号"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="部门"
          prop="deptId"
        >
          <dept-select
            v-model="queryParams.deptId"
            class="dept-select"
          />
        </el-form-item>
        <el-form-item
          label="查看状态"
          prop="readStatus"
        >
          <el-select
            v-model="queryParams.readStatus"
            class="status-select"
            clearable
            placeholder="请选择查看状态"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_SALARY_SLIP_READ_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="queryParams.remark"
            class="remark-input"
            clearable
            placeholder="请输入备注"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card
      class="block-card"
      shadow="never"
    >
      <div
        v-if="selectedRows.length"
        class="selection-toolbar"
      >
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button
          v-hasPermi="['hrm:salary:slip:update']"
          type="primary"
          plain
          @click="handleBatchRemark(false)"
        >编辑备注</el-button>
        <el-button
          v-hasPermi="['hrm:salary:slip:update']"
          plain
          @click="handleBatchRemark(true)"
        >清除备注</el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="list"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="45"
        />
        <el-table-column
          label="员工姓名"
          prop="employeeName"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column
          label="工号"
          prop="jobNumber"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="部门"
          prop="deptName"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="岗位"
          prop="postName"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="手机号"
          prop="mobile"
          width="130"
        />
        <el-table-column
          label="查看状态"
          align="center"
          prop="readStatus"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.HRM_SALARY_SLIP_READ_STATUS"
              :value="scope.row.readStatus"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="实发工资"
          align="right"
          prop="realPaySalary"
          width="130"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.realPaySalary) }}</template>
        </el-table-column>
        <el-table-column
          label="备注"
          prop="remark"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          :formatter="dateFormatter"
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
        />
        <el-table-column
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
    <salary-slip-detail ref="detail" />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { getSalarySlipPage, updateSalarySlipRemark } from '@/api/hrm/salary/slip'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import SalarySlipDetail from './SalarySlipDetail.vue'

export default {
  name: 'HrmSalarySlipList',
  components: { DeptSelect, SalarySlipDetail },
  props: { sendRecordId: { type: Number, required: true }},
  data() {
    return {
      DICT_TYPE,
      loading: false,
      total: 0,
      list: [],
      selectedRows: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sendRecordId: this.sendRecordId,
        search: undefined,
        deptId: undefined,
        readStatus: undefined,
        remark: undefined
      }
    }
  },
  created() { this.getList() },
  methods: {
    getIntDictOptions,
    dateFormatter,
    formatHrmMoney,
    async getList() {
      this.loading = true
      try {
        const response = await getSalarySlipPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
        this.selectedRows = []
        if (this.$refs.table) this.$refs.table.clearSelection()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleSelectionChange(rows) { this.selectedRows = rows },
    async handleBatchRemark(clear) {
      let remark = ''
      try {
        if (clear) {
          await this.$modal.confirm('确认清除所选工资条的备注？')
        } else {
          const result = await this.$prompt('请输入备注', '编辑备注')
          remark = result.value
          if (remark.length > 500) {
            this.$modal.msgWarning('备注不能超过 500 个字符')
            return
          }
        }
        const success = await executeHrmBatch(this, this.selectedRows
          .filter(item => Boolean(item.id))
          .map(item => updateSalarySlipRemark({ id: item.id, remark })))
        if (success) await this.getList()
      } catch (error) {}
    },
    openDetail(id) { this.$refs.detail.open(id) }
  }
}
</script>

<style scoped>
.block-card { margin-top: 16px; }
.selection-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; color: #909399; font-size: 14px; }
.search-input, .dept-select { width: 220px; }
.status-select { width: 160px; }
.remark-input { width: 200px; }
</style>
