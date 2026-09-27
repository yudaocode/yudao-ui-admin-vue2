<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button
          v-hasPermi="['hrm:salary:tax-rule:create']"
          plain
          type="primary"
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增计税规则</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column
          label="方案名称"
          align="center"
          prop="name"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="个税类型" align="center" prop="type" width="140">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.HRM_SALARY_TAX_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="计税周期" align="center" prop="cycleType" min-width="360">
          <template slot-scope="scope">{{ getTaxCycleLabel(scope.row.cycleType) }}</template>
        </el-table-column>
        <el-table-column label="是否计税" align="center" prop="taxEnabled" width="100">
          <template slot-scope="scope">
            <template v-if="scope.row.taxEnabled == null">-</template>
            <el-tag v-else :type="scope.row.taxEnabled ? 'success' : 'info'">
              {{ scope.row.taxEnabled ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="起征点" align="center" prop="threshold" width="120">
          <template slot-scope="scope">
            {{ scope.row.threshold == null ? '-' : scope.row.threshold + '元/月' }}
          </template>
        </el-table-column>
        <el-table-column label="个税结果保留小数位" align="center" prop="decimalScale" width="170">
          <template slot-scope="scope">
            {{ scope.row.decimalScale == null ? '-' : '保留' + scope.row.decimalScale + '位小数' }}
          </template>
        </el-table-column>
        <el-table-column label="适用薪资组" align="center" min-width="170">
          <template slot-scope="scope">
            {{ (scope.row.usedGroupCount == null ? 0 : scope.row.usedGroupCount) + '个薪资组正在使用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:salary:tax-rule:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['hrm:salary:tax-rule:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <salary-tax-rule-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { deleteSalaryTaxRule, getSalaryTaxRuleList } from '@/api/hrm/salary/config/tax-rule'
import { HrmSalaryTaxCycleTypeOptions } from '@/views/hrm/utils/constants'
import SalaryTaxRuleForm from './SalaryTaxRuleForm.vue'

export default {
  name: 'HrmSalaryTaxRule',
  components: { SalaryTaxRuleForm },
  data() {
    return { DICT_TYPE, loading: false, list: [] }
  },
  created() {
    this.getList()
  },
  methods: {
    getTaxCycleLabel(cycleType) {
      const option = HrmSalaryTaxCycleTypeOptions.find(item => item.value === cycleType)
      return option ? option.label : '-'
    },
    async getList() {
      this.loading = true
      try {
        const response = await getSalaryTaxRuleList()
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      if (!id) return
      try {
        await this.$modal.confirm()
        await deleteSalaryTaxRule(id)
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
