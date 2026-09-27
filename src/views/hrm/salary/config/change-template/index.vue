<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button
          v-hasPermi="['hrm:salary:change-template:create']"
          type="primary"
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="模板名称" prop="name" min-width="180" />
        <el-table-column label="默认模板" align="center" prop="defaultStatus" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.defaultStatus ? 'success' : 'info'">
              {{ scope.row.defaultStatus ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="调薪项" min-width="260">
          <template slot-scope="scope">
            <div class="option-tags">
              <el-tag v-for="item in scope.row.options || []" :key="item.code" type="primary">
                {{ item.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column label="操作" align="center" fixed="right" width="160">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:salary:change-template:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['hrm:salary:change-template:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <salary-change-template-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils'
import {
  deleteSalaryChangeTemplate,
  getSalaryChangeTemplateList
} from '@/api/hrm/salary/config/change-template'
import SalaryChangeTemplateForm from './SalaryChangeTemplateForm.vue'

export default {
  name: 'HrmSalaryChangeTemplate',
  components: { SalaryChangeTemplateForm },
  data() {
    return { loading: false, list: [] }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryChangeTemplateList()
        this.list = response.data
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
        await deleteSalaryChangeTemplate(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {}
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.option-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.danger-text { color: #f56c6c; }
</style>
