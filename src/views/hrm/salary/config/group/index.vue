<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button
          v-hasPermi="['hrm:salary:group:create']"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column
          label="薪资组名称"
          align="center"
          prop="name"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column label="计薪标准" align="center" prop="salaryStandard" width="110">
          <template slot-scope="scope">{{ scope.row.salaryStandard == null ? 0 : scope.row.salaryStandard }} 天/月</template>
        </el-table-column>
        <el-table-column
          label="计税规则"
          align="center"
          prop="taxRuleName"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="调薪规则"
          align="center"
          prop="changeRule"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column align="center" label="适用范围" min-width="180">
          <template slot-scope="scope">{{ formatSalaryGroupScope(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:salary:group:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['hrm:salary:group:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <salary-group-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { deleteSalaryGroup, getSalaryGroupPage } from '@/api/hrm/salary/config/group'
import { formatSalaryGroupScope } from '@/views/hrm/utils/format'
import SalaryGroupForm from './SalaryGroupForm.vue'

export default {
  name: 'HrmSalaryGroup',
  components: { SalaryGroupForm },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10 }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatSalaryGroupScope,
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryGroupPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm()
        await deleteSalaryGroup(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
