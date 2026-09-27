<template>
  <el-dialog
    title="调整参保方案"
    :visible.sync="dialogVisible"
    width="960px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="86px"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="员工">
            <el-input
              :value="employeeLabel"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="社保方案"
            prop="schemeId"
          >
            <insurance-scheme-select
              v-model="formData.schemeId"
              placeholder="请选择方案"
              @change="handleSchemeChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <dict-tag
              :type="DICT_TYPE.HRM_INSURANCE_EMP_STATUS"
              :value="formData.status == null ? '' : formData.status"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-table
        :data="projectList"
        border
      >
        <el-table-column
          label="类型"
          width="130"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.HRM_INSURANCE_PROJECT_TYPE"
            :value="scope.row.type"
          /></template>
        </el-table-column>
        <el-table-column
          label="项目名称"
          min-width="150"
          prop="name"
        />
        <el-table-column
          v-if="formData.schemeType === HrmInsuranceSchemeType.PROPORTION"
          label="缴纳基数"
          width="150"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.baseAmount"
              :controls="false"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="formData.schemeType === HrmInsuranceSchemeType.PROPORTION"
          label="公司比例"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.corporateRate) }}</template>
        </el-table-column>
        <el-table-column
          v-if="formData.schemeType === HrmInsuranceSchemeType.PROPORTION"
          label="个人比例"
          width="120"
        >
          <template slot-scope="scope">{{ formatHrmRate(scope.row.personalRate) }}</template>
        </el-table-column>
        <el-table-column
          v-if="formData.schemeType === HrmInsuranceSchemeType.AMOUNT"
          label="公司金额"
          width="150"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.corporateAmount"
              :controls="false"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="formData.schemeType === HrmInsuranceSchemeType.AMOUNT"
          label="个人金额"
          width="150"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.personalAmount"
              :controls="false"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import {
  getInsuranceMonthEmployeeRecord,
  updateInsuranceMonthEmployeeRecord
} from '@/api/hrm/insurance/month-record/employee'
import { getInsuranceScheme } from '@/api/hrm/insurance/scheme'
import { HrmInsuranceSchemeType } from '@/views/hrm/utils/constants'
import { formatHrmRate } from '@/views/hrm/utils/format'
import InsuranceSchemeSelect from '../../scheme/components/InsuranceSchemeSelect.vue'

export default {
  name: 'HrmInsuranceEmployeeRecordForm',
  components: { InsuranceSchemeSelect },
  data() {
    return {
      DICT_TYPE,
      HrmInsuranceSchemeType,
      dialogVisible: false,
      formLoading: false,
      formData: { socialSecurityProjectList: [], providentFundProjectList: [] },
      projectList: [],
      formRules: {
        schemeId: [{ required: true, message: '请选择社保方案', trigger: 'change' }]
      }
    }
  },
  computed: {
    employeeLabel() {
      return `${this.formData.employeeName || ''}${this.formData.jobNumber ? ' / ' + this.formData.jobNumber : ''}`
    }
  },
  methods: {
    formatHrmRate,
    async open(row) {
      if (!row.id) return
      this.dialogVisible = true
      this.formLoading = true
      try {
        const response = await getInsuranceMonthEmployeeRecord(row.id)
        const detail = response.data
        this.formData = { ...detail }
        this.projectList = [
          ...(detail.socialSecurityProjectList || []),
          ...(detail.providentFundProjectList || [])
        ].map(project => ({ ...project }))
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid || !this.formData.id || !this.formData.schemeId) return
      this.formLoading = true
      try {
        await updateInsuranceMonthEmployeeRecord({
          id: this.formData.id,
          schemeId: this.formData.schemeId,
          projects: this.buildProjectUpdateList()
        })
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    async handleSchemeChange(scheme) {
      if (!scheme || !scheme.id) {
        this.projectList = []
        return
      }
      const response = await getInsuranceScheme(scheme.id)
      const detail = response.data
      this.formData.schemeType = detail.type
      this.projectList = (detail.projectList || []).map(project => ({
        ...project,
        schemeProjectId: project.id
      }))
    },
    buildProjectUpdateList() {
      return this.projectList.map(project => ({
        schemeProjectId: project.schemeProjectId,
        ...(this.formData.schemeType === HrmInsuranceSchemeType.PROPORTION
          ? { baseAmount: project.baseAmount }
          : {
            corporateAmount: project.corporateAmount,
            personalAmount: project.personalAmount
          })
      }))
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
