<template>
  <el-dialog
    title="核算工资表"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-form
      v-loading="formLoading"
      label-width="112px"
    >
      <el-form-item label="工资表"><span>{{ currentRecord ? currentRecord.title || '-' : '-' }}</span></el-form-item>
      <el-form-item label="计薪人员"><span>{{ payrollEmployeeCount }} 人</span></el-form-item>
      <el-form-item label="社保数据">
        <el-switch
          v-model="syncInsuranceData"
          active-text="从社保表同步"
          inactive-text="本次不带入"
        />
      </el-form-item>
      <el-form-item label="同步考勤">
        <el-switch
          v-model="syncAttendanceData"
          active-text="从考勤统计同步"
          inactive-text="使用导入文件"
        />
      </el-form-item>
      <el-form-item label="考勤数据">
        <div class="upload-row">
          <el-upload
            :auto-upload="false"
            :disabled="syncAttendanceData"
            :file-list="attendanceFiles"
            :limit="1"
            :on-change="(file, files) => attendanceFiles = files"
            accept=".xls,.xlsx"
          >
            <el-button
              :disabled="syncAttendanceData"
              icon="el-icon-upload"
            >选择文件</el-button>
          </el-upload>
          <el-button
            plain
            icon="el-icon-download"
            @click="downloadTemplate('attendance')"
          >下载模板</el-button>
        </div>
      </el-form-item>
      <el-form-item label="上月个税累计">
        <div class="upload-row">
          <el-upload
            :auto-upload="false"
            :file-list="cumulativeTaxFiles"
            :limit="1"
            :on-change="(file, files) => cumulativeTaxFiles = files"
            accept=".xls,.xlsx"
          >
            <el-button icon="el-icon-upload">选择文件</el-button>
          </el-upload>
          <el-button
            plain
            icon="el-icon-download"
            @click="downloadTemplate('cumulativeTax')"
          >下载模板</el-button>
        </div>
      </el-form-item>
      <el-form-item label="专项附加扣除">
        <div class="upload-row">
          <el-upload
            :auto-upload="false"
            :file-list="additionalDeductionFiles"
            :limit="1"
            :on-change="(file, files) => additionalDeductionFiles = files"
            accept=".xls,.xlsx"
          >
            <el-button icon="el-icon-upload">选择文件</el-button>
          </el-upload>
          <el-button
            plain
            icon="el-icon-download"
            @click="downloadTemplate('additionalDeduction')"
          >下载模板</el-button>
        </div>
      </el-form-item>
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
import {
  computeSalaryMonthRecordWithImport,
  getSalaryAdditionalDeductionImportTemplate,
  getSalaryAttendanceImportTemplate,
  getSalaryCumulativeTaxImportTemplate,
  getSalaryPayrollReadiness
} from '@/api/hrm/salary/month-record'
import download from '@/plugins/download'

export default {
  name: 'HrmSalaryMonthComputeForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      currentRecord: undefined,
      payrollEmployeeCount: 0,
      syncInsuranceData: true,
      syncAttendanceData: false,
      attendanceFiles: [],
      cumulativeTaxFiles: [],
      additionalDeductionFiles: []
    }
  },
  methods: {
    open(record) {
      this.currentRecord = record
      this.payrollEmployeeCount = record.employeeCount || 0
      this.attendanceFiles = []
      this.cumulativeTaxFiles = []
      this.additionalDeductionFiles = []
      this.syncInsuranceData = true
      this.syncAttendanceData = false
      this.dialogVisible = true
      this.getPayrollEmployeeCount()
    },
    async getPayrollEmployeeCount() {
      const response = await getSalaryPayrollReadiness(this.currentRecord && this.currentRecord.id)
      this.payrollEmployeeCount = response.data.payrollEmployeeCount || 0
    },
    async downloadTemplate(type) {
      const monthRecordId = this.currentRecord && this.currentRecord.id
      if (type === 'attendance') {
        const response = await getSalaryAttendanceImportTemplate(monthRecordId)
        download.excel(response, '月度工资考勤导入模板.xls')
        return
      }
      if (type === 'cumulativeTax') {
        const response = await getSalaryCumulativeTaxImportTemplate(monthRecordId)
        download.excel(response, '月度工资上月个税累计导入模板.xls')
        return
      }
      const response = await getSalaryAdditionalDeductionImportTemplate(monthRecordId)
      download.excel(response, '月度工资专项附加扣除导入模板.xls')
    },
    appendFile(formData, field, files) {
      const raw = files[0] && files[0].raw
      if (raw) formData.append(field, raw)
    },
    async submitForm() {
      if (!this.currentRecord || !this.currentRecord.id) return
      this.formLoading = true
      try {
        const formData = new FormData()
        formData.append('id', String(this.currentRecord.id))
        formData.append('syncInsuranceData', String(this.syncInsuranceData))
        formData.append('syncAttendanceData', String(this.syncAttendanceData))
        this.appendFile(formData, 'attendanceFile', this.attendanceFiles)
        this.appendFile(formData, 'cumulativeTaxFile', this.cumulativeTaxFiles)
        this.appendFile(formData, 'additionalDeductionFile', this.additionalDeductionFiles)
        await computeSalaryMonthRecordWithImport(formData)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>.upload-row { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; }</style>
