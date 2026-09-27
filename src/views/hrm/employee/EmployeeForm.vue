<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1040px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="112px"
    >
      <el-tabs
        v-model="activeTab"
        class="employee-form-tabs"
      >
        <el-tab-pane
          label="个人信息"
          name="personal"
        >
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('name')"
              :span="12"
            ><el-form-item
              label="员工姓名"
              prop="name"
            ><el-input
              v-model="formData.name"
              maxlength="255"
              placeholder="请输入员工姓名"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('userId')"
              :span="12"
            ><el-form-item
              label="绑定用户"
              prop="userId"
            ><user-select
              v-model="formData.userId"
              placeholder="请选择后台用户"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('mobile')"
              :span="12"
            ><el-form-item
              label="手机号"
              prop="mobile"
            ><el-input
              v-model="formData.mobile"
              maxlength="11"
              placeholder="请输入手机号"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('email')"
              :span="12"
            ><el-form-item
              label="邮箱"
              prop="email"
            ><el-input
              v-model="formData.email"
              maxlength="255"
              placeholder="请输入邮箱"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('country')"
              :span="12"
            ><el-form-item
              label="国家或地区"
              prop="country"
            ><el-input
              v-model="formData.country"
              maxlength="64"
              placeholder="请输入国家或地区"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('nation')"
              :span="12"
            ><el-form-item
              label="民族"
              prop="nation"
            ><el-input
              v-model="formData.nation"
              maxlength="64"
              placeholder="请输入民族"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('idType')"
              :span="12"
            ><el-form-item
              label="证件类型"
              prop="idType"
            ><el-select
              v-model="formData.idType"
              clearable
              placeholder="请选择证件类型"
              class="full-width"
            ><el-option
              v-for="item in HrmEmployeeIdTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            /></el-select></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('idNumber')"
              :span="12"
            ><el-form-item
              label="证件号码"
              prop="idNumber"
            ><el-input
              v-model="formData.idNumber"
              maxlength="255"
              placeholder="请输入证件号码"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('sex')"
              :span="12"
            ><el-form-item
              label="性别"
              prop="sex"
            ><el-select
              v-model="formData.sex"
              clearable
              placeholder="请选择性别"
              class="full-width"
            ><el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            /></el-select></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('nativePlace')"
              :span="12"
            ><el-form-item
              label="籍贯"
              prop="nativePlace"
            ><el-input
              v-model="formData.nativePlace"
              maxlength="128"
              placeholder="请输入籍贯"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('birthday')"
              :span="12"
            ><el-form-item
              label="出生时间"
              prop="birthday"
            ><el-date-picker
              v-model="formData.birthday"
              type="datetime"
              value-format="timestamp"
              placeholder="请选择出生时间"
              class="full-width"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('age')"
              :span="12"
            ><el-form-item
              label="年龄"
              prop="age"
            ><el-input-number
              v-model="formData.age"
              :min="0"
              :max="200"
              disabled
              class="full-width"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('highestEducation')"
              :span="12"
            ><el-form-item
              label="最高学历"
              prop="highestEducation"
            ><el-select
              v-model="formData.highestEducation"
              clearable
              placeholder="请选择最高学历"
              class="full-width"
            ><el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_EDUCATION)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            /></el-select></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('address')"
              :span="12"
            ><el-form-item
              label="户籍地址"
              prop="address"
            ><el-input
              v-model="formData.address"
              maxlength="255"
              placeholder="请输入户籍地址"
            /></el-form-item></el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane
          label="入职信息"
          name="entry"
        >
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('jobNumber')"
              :span="12"
            ><el-form-item
              label="工号"
              prop="jobNumber"
            ><el-input
              v-model="formData.jobNumber"
              maxlength="64"
              placeholder="请输入工号"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('entryStatus')"
              :span="12"
            ><el-form-item
              label="入职状态"
              prop="entryStatus"
            ><el-select
              v-model="formData.entryStatus"
              :disabled="!['create', 'candidate'].includes(formType)"
              placeholder="请选择入职状态"
              class="full-width"
            ><el-option
              v-for="dict in entryStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            /></el-select></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('deptId')"
              :span="12"
            ><el-form-item
              label="部门"
              prop="deptId"
            ><dept-select v-model="formData.deptId" /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('postName')"
              :span="12"
            ><el-form-item
              label="职位名称"
              prop="postName"
            ><el-input
              v-model="formData.postName"
              maxlength="255"
              placeholder="请输入职位名称"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20"><el-col
            v-if="isFieldVisible('postLevel')"
            :span="12"
          ><el-form-item
            label="岗位职级"
            prop="postLevel"
          ><el-input
            v-model="formData.postLevel"
            maxlength="255"
            placeholder="请输入岗位职级"
          /></el-form-item></el-col></el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('leaderEmployeeId')"
              :span="12"
            ><el-form-item
              label="直属上级"
              prop="leaderEmployeeId"
            ><hrm-employee-select
              v-model="formData.leaderEmployeeId"
              :disabled-ids="formData.id ? [formData.id] : []"
              placeholder="请选择直属上级"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('channelId')"
              :span="12"
            ><el-form-item
              label="招聘渠道"
              prop="channelId"
            ><recruit-channel-select v-model="formData.channelId" /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('type')"
              :span="12"
            ><el-form-item
              label="聘用形式"
              prop="type"
            ><el-select
              v-model="formData.type"
              :disabled="formType === 'update'"
              placeholder="请选择聘用形式"
              class="full-width"
              @change="handleTypeChange"
            ><el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            /></el-select></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('status')"
              :span="12"
            ><el-form-item
              label="员工状态"
              prop="status"
            ><el-input
              v-if="formData.type === HrmEmployeeType.FORMAL"
              :value="getDictLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, formData.status) || '-'"
              disabled
              placeholder="保存后自动计算"
            /><el-select
              v-else
              v-model="formData.status"
              :disabled="formType === 'update'"
              placeholder="请选择员工状态"
              class="full-width"
            ><el-option
              v-for="dict in nonFormalStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            /></el-select></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('entryTime')"
              :span="12"
            ><el-form-item
              label="入职时间"
              prop="entryTime"
            ><el-date-picker
              v-model="formData.entryTime"
              type="datetime"
              value-format="timestamp"
              :picker-options="entryPickerOptions"
              placeholder="请选择入职时间"
              class="full-width"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('probation')"
              :span="12"
            ><el-form-item
              label="试用期（月）"
              prop="probation"
            ><el-input-number
              v-model="formData.probation"
              :min="0"
              :max="6"
              :disabled="formType === 'update' || formData.type !== HrmEmployeeType.FORMAL"
              class="full-width"
            /><div class="field-tip">0 表示无试用期；转正时间按入职时间 + 试用期月数计算。</div></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('regularTime')"
              :span="12"
            ><el-form-item
              label="转正时间"
              prop="regularTime"
            ><el-date-picker
              v-model="formData.regularTime"
              type="datetime"
              value-format="timestamp"
              disabled
              placeholder="保存后自动计算"
              class="full-width"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('leaveTime')"
              :span="12"
            ><el-form-item
              label="离职时间"
              prop="leaveTime"
            ><el-date-picker
              v-model="formData.leaveTime"
              type="datetime"
              value-format="timestamp"
              disabled
              placeholder="由离职流程维护"
              class="full-width"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('companyAgeStartTime')"
              :span="12"
            ><el-form-item
              label="司龄起算时间"
              prop="companyAgeStartTime"
            ><el-date-picker
              v-model="formData.companyAgeStartTime"
              type="datetime"
              value-format="timestamp"
              placeholder="默认使用入职时间"
              class="full-width"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('companyAge')"
              :span="12"
            ><el-form-item
              label="司龄（年）"
              prop="companyAge"
            ><el-input-number
              v-model="formData.companyAge"
              :min="0"
              disabled
              class="full-width"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('workCity')"
              :span="12"
            ><el-form-item
              label="工作城市"
              prop="workCity"
            ><el-input
              v-model="formData.workCity"
              maxlength="64"
              placeholder="请输入工作城市"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('workAddress')"
              :span="12"
            ><el-form-item
              label="工作地点"
              prop="workAddress"
            ><el-input
              v-model="formData.workAddress"
              maxlength="255"
              placeholder="请输入工作地点"
            /></el-form-item></el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col
              v-if="isFieldVisible('workDetailAddress')"
              :span="12"
            ><el-form-item
              label="工作详细地址"
              prop="workDetailAddress"
            ><el-input
              v-model="formData.workDetailAddress"
              maxlength="255"
              placeholder="请输入工作详细地址"
            /></el-form-item></el-col>
            <el-col
              v-if="isFieldVisible('candidateId')"
              :span="12"
            ><el-form-item
              label="招聘候选人"
              prop="candidateId"
            ><el-input
              v-model="formData.candidateId"
              disabled
              placeholder="由招聘转入时自动关联"
            /></el-form-item></el-col>
          </el-row>
          <el-form-item
            v-if="isFieldVisible('remark')"
            label="备注"
            prop="remark"
          ><el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入备注"
          /></el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getDictDataLabel, getIntDictOptions } from '@/utils/dict'
import * as EmployeeApi from '@/api/hrm/employee'
import { getEmployeeCreateFieldConfigList } from '@/api/hrm/employee/config'
import { convertRecruitCandidateToEmployee } from '@/api/hrm/recruit/candidate'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import RecruitChannelSelect from '@/views/hrm/recruit/channel/components/RecruitChannelSelect.vue'
import HrmEmployeeSelect from './components/HrmEmployeeSelect.vue'
import { HrmEmployeeIdTypeOptions, HrmEmployeeType, HrmEmployeeEntryStatus, HrmEmployeeIdType, HrmEmployeeStatus, HRM_EMPLOYEE_CREATE_ENTRY_STATUSES, HRM_EMPLOYEE_NO_PROBATION_MONTHS, HRM_EMPLOYEE_NON_FORMAL_STATUSES } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmEmployeeForm',
  components: { DeptSelect, UserSelect, RecruitChannelSelect, HrmEmployeeSelect },
  data() {
    return {
      DICT_TYPE, HrmEmployeeIdTypeOptions, HrmEmployeeType,
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '',
      formData: this.createDefaultFormData(), activeTab: 'personal', createFieldVisibleMap: {},
      formRules: {
        name: [{ required: true, message: '员工姓名不能为空', trigger: 'blur' }],
        jobNumber: [{ validator: (rule, value, callback) => { if (this.formData.entryStatus === HrmEmployeeEntryStatus.ACTIVE && !(value || '').trim()) return callback(new Error('在职员工工号不能为空')); callback() }, trigger: 'blur' }],
        mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        entryStatus: [{ required: true, message: '请选择入职状态', trigger: 'change' }],
        type: [{ required: true, message: '请选择聘用形式', trigger: 'change' }],
        entryTime: [{ required: true, message: '请选择入职时间', trigger: 'change' }],
        probation: [{ validator: (rule, value, callback) => { if (this.formData.type === HrmEmployeeType.FORMAL && value == null) return callback(new Error('请输入试用期')); callback() }, trigger: 'change' }],
        status: [{ validator: (rule, value, callback) => { if (this.formData.type === HrmEmployeeType.INFORMAL && value == null) return callback(new Error('请选择员工状态')); callback() }, trigger: 'change' }]
      }
    }
  },
  computed: {
    entryStatusOptions() { const options = getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_ENTRY_STATUS); return this.formType === 'update' ? options : options.filter(item => HRM_EMPLOYEE_CREATE_ENTRY_STATUSES.includes(Number(item.value))) },
    nonFormalStatusOptions() { return getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS).filter(item => HRM_EMPLOYEE_NON_FORMAL_STATUSES.includes(Number(item.value))) },
    entryPickerOptions() { return ['confirm', 'rehire'].includes(this.formType) ? { disabledDate: date => this.disableFutureDate(date) } : {} }
  },
  methods: {
    getIntDictOptions,
    getDictLabel(type, value) { return getDictDataLabel(type, value) },
    createDefaultFormData() { return { id: undefined, name: '', jobNumber: '', userId: undefined, mobile: '', country: '中国', nation: '', idType: HrmEmployeeIdType.ID_CARD, idNumber: '', sex: undefined, email: '', nativePlace: '', birthday: undefined, age: undefined, address: '', highestEducation: undefined, deptId: undefined, leaderEmployeeId: undefined, entryStatus: HrmEmployeeEntryStatus.ACTIVE, status: undefined, type: HrmEmployeeType.FORMAL, entryTime: undefined, probation: HRM_EMPLOYEE_NO_PROBATION_MONTHS, regularTime: undefined, leaveTime: undefined, postName: '', postLevel: '', workCity: '', workAddress: '', workDetailAddress: '', channelId: undefined, companyAgeStartTime: undefined, companyAge: undefined, candidateId: undefined, remark: '' } },
    isFieldVisible(name) { if (this.formType === 'update') return true; const entryStatus = this.formData.entryStatus || HrmEmployeeEntryStatus.ACTIVE; const visibleFields = this.createFieldVisibleMap[entryStatus]; return !visibleFields || visibleFields.has(name) },
    async loadCreateFieldConfig() { const responses = await Promise.all([getEmployeeCreateFieldConfigList(HrmEmployeeEntryStatus.ACTIVE), getEmployeeCreateFieldConfigList(HrmEmployeeEntryStatus.PENDING_ENTRY)]); this.createFieldVisibleMap = { [HrmEmployeeEntryStatus.ACTIVE]: new Set(responses[0].data.filter(field => field.visible).map(field => field.name)), [HrmEmployeeEntryStatus.PENDING_ENTRY]: new Set(responses[1].data.filter(field => field.visible).map(field => field.name)) } },
    async open(type, id, defaultData) {
      this.dialogVisible = true
      this.dialogTitle = type === 'confirm' ? '确认入职' : type === 'rehire' ? '办理再入职' : type === 'candidate' ? '候选人转员工' : this.$t('action.' + type)
      this.formType = type; this.activeTab = 'personal'; this.resetForm(); this.formLoading = true
      try {
        const responses = await Promise.all([id ? EmployeeApi.getEmployee(id) : Promise.resolve(undefined), type !== 'update' ? this.loadCreateFieldConfig() : Promise.resolve()])
        const employeeResponse = responses[0]
        if (employeeResponse) {
          this.formData = employeeResponse.data
          if (type === 'confirm') { this.formData.entryStatus = HrmEmployeeEntryStatus.ACTIVE; if (!this.formData.entryTime || Number(this.formData.entryTime) > Date.now()) { const entryTime = Date.now(); this.formData.entryTime = entryTime; this.formData.regularTime = undefined; if (!this.formData.companyAgeStartTime || Number(this.formData.companyAgeStartTime) > entryTime) this.formData.companyAgeStartTime = entryTime } } else if (type === 'rehire') { const entryTime = Date.now(); this.formData = Object.assign({}, this.formData, { entryStatus: HrmEmployeeEntryStatus.ACTIVE, entryTime, companyAgeStartTime: entryTime, regularTime: undefined, leaveTime: undefined, probation: HRM_EMPLOYEE_NO_PROBATION_MONTHS }); this.handleTypeChange(this.formData.type) }
        } else if (defaultData) { this.formData = Object.assign({}, this.formData, defaultData); this.handleTypeChange(this.formData.type) }
      } finally { this.formLoading = false }
    },
    disableFutureDate(date) { return date.getTime() > new Date().setHours(23, 59, 59, 999) },
    handleTypeChange(type) { if (type === HrmEmployeeType.FORMAL) { if (this.formData.probation == null) this.formData.probation = HRM_EMPLOYEE_NO_PROBATION_MONTHS; if (![HrmEmployeeStatus.REGULAR, HrmEmployeeStatus.PROBATION].includes(this.formData.status)) this.formData.status = undefined; return } this.formData.probation = undefined; this.formData.regularTime = undefined; if (!this.nonFormalStatusOptions.some(item => Number(item.value) === this.formData.status)) this.formData.status = HrmEmployeeStatus.INTERN },
    async submitForm() { const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.formLoading = true; try { const data = this.buildSubmitData(); if (this.formType === 'create') { await EmployeeApi.createEmployee(data); this.$modal.msgSuccess(this.$t('common.createSuccess')) } else if (this.formType === 'candidate') { await convertRecruitCandidateToEmployee(data); this.$modal.msgSuccess(this.$t('common.createSuccess')) } else if (this.formType === 'confirm') { await EmployeeApi.confirmEmployeeEntry(data); this.$modal.msgSuccess('已确认入职') } else if (this.formType === 'rehire') { await EmployeeApi.rehireEmployee(Object.assign({}, data, { employeeId: this.formData.id })); this.$modal.msgSuccess('再入职办理成功') } else { await EmployeeApi.updateEmployee(this.formData); this.$modal.msgSuccess(this.$t('common.updateSuccess')) } this.dialogVisible = false; this.$emit('success') } finally { this.formLoading = false } },
    buildSubmitData() { if (this.formType === 'update') return this.formData; const entryStatus = this.formData.entryStatus || HrmEmployeeEntryStatus.ACTIVE; const visible = this.createFieldVisibleMap[entryStatus]; if (!visible) return this.formData; const data = {}; Object.keys(this.formData).forEach(name => { if (visible.has(name)) data[name] = this.formData[name] }); if (['confirm', 'rehire'].includes(this.formType)) data.id = this.formData.id; else if (this.formType === 'candidate') data.candidateId = this.formData.candidateId; return data },
    resetForm() { this.formData = this.createDefaultFormData(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()) }
  }
}
</script>

<style scoped>
.employee-form-tabs ::v-deep .el-tabs__content { max-height: calc(100vh - 270px); overflow-y: auto; padding-right: 8px; }
.full-width { width: 100%; }
.field-tip { margin-top: 4px; color: #909399; font-size: 12px; }
</style>
