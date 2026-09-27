<template>
  <div>
    <template v-if="salaryEmployee.id">
      <el-card
        class="block-card"
        shadow="never"
      >
        <el-descriptions
          :column="3"
          border
        >
          <el-descriptions-item label="正式工资">{{ formatHrmMoney(salaryEmployee.regularSalary) }}</el-descriptions-item>
          <el-descriptions-item label="试用期工资">{{ formatHrmMoney(salaryEmployee.probationSalary) }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ formatHrmDate(salaryEmployee.effectTime) }}</el-descriptions-item>
          <el-descriptions-item label="调整原因">
            <dict-tag
              v-if="salaryEmployee.changeReason != null"
              :type="DICT_TYPE.HRM_SALARY_CHANGE_REASON"
              :value="salaryEmployee.changeReason"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="档案状态">
            <dict-tag
              v-if="salaryEmployee.changeType != null"
              :type="DICT_TYPE.HRM_SALARY_CHANGE_TYPE"
              :value="salaryEmployee.changeType"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ salaryEmployee.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-row
        :gutter="16"
        class="block-card"
      >
        <el-col :span="12">
          <el-card shadow="never">
            <div slot="header">正式工资明细</div>
            <el-table
              :data="salaryEmployee.salaryOptions || []"
              stripe
            >
              <el-table-column
                label="薪资项"
                min-width="160"
                prop="name"
              />
              <el-table-column
                align="center"
                label="编码"
                prop="code"
                width="110"
              />
              <el-table-column
                align="right"
                label="金额"
                width="130"
              >
                <template slot-scope="scope">{{ formatHrmMoney(scope.row.value) }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <div slot="header">试用期工资明细</div>
            <el-table
              :data="salaryEmployee.probationSalaryOptions || []"
              stripe
            >
              <el-table-column
                label="薪资项"
                min-width="160"
                prop="name"
              />
              <el-table-column
                align="center"
                label="编码"
                prop="code"
                width="110"
              />
              <el-table-column
                align="right"
                label="金额"
                width="130"
              >
                <template slot-scope="scope">{{ formatHrmMoney(scope.row.value) }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </template>
    <el-card
      v-else
      shadow="never"
    ><el-empty description="该员工尚未定薪" /></el-card>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatHrmDate, formatHrmMoney } from '@/views/hrm/utils/format'

export default {
  name: 'HrmSalaryEmployeeInfoDetails',
  props: { salaryEmployee: { type: Object, required: true }},
  data() { return { DICT_TYPE } },
  methods: { formatHrmDate, formatHrmMoney }
}
</script>

<style scoped>.block-card { margin-top: 16px; }</style>
