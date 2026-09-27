<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button
          v-hasPermi="['hrm:insurance:scheme:create']"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="openForm('create')"
        >新建参保方案</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          label="方案名称"
          prop="name"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="参保城市"
          prop="areaName"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          align="right"
          label="个人社保"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司社保"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateInsuranceAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="个人公积金"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.personalProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="right"
          label="公司公积金"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmMoney(scope.row.corporateProvidentFundAmount) }}</template>
        </el-table-column>
        <el-table-column
          align="center"
          label="使用人数"
          prop="useCount"
          width="100"
        />
        <el-table-column
          align="center"
          label="历史月记录"
          prop="monthRecordCount"
          width="110"
        />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="140"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:insurance:scheme:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['hrm:insurance:scheme:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <insurance-scheme-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { deleteInsuranceScheme, getInsuranceSchemeList } from '@/api/hrm/insurance/scheme'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import InsuranceSchemeForm from './InsuranceSchemeForm.vue'

export default {
  name: 'HrmInsuranceScheme',
  components: { InsuranceSchemeForm },
  data() { return { loading: true, list: [] } },
  created() { this.getList() },
  methods: {
    formatHrmMoney,
    async getList() {
      this.loading = true
      try {
        const response = await getInsuranceSchemeList()
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) {
      if (!id) return
      try {
        await this.$modal.confirm()
        await deleteInsuranceScheme(id)
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
