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
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="职位名称"
          prop="postName"
        >
          <el-input
            v-model="formData.postName"
            maxlength="255"
            placeholder="请输入职位名称"
          />
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="用人部门"
          prop="deptId"
        >
          <dept-select
            v-model="formData.deptId"
            class="full-width"
            placeholder="请选择用人部门"
          />
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="工作性质"
          prop="jobNature"
        >
          <el-select
            v-model="formData.jobNature"
            class="full-width"
            clearable
            placeholder="请选择工作性质"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_JOB_NATURE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="工作城市"
          prop="areaId"
        >
          <area-select
            v-model="formData.areaId"
            class="full-width"
            placeholder="请选择工作城市"
          />
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="招聘人数"
          prop="recruitNum"
        >
          <el-input-number
            v-model="formData.recruitNum"
            :controls="false"
            :min="0"
            class="full-width"
            placeholder="请输入招聘人数"
          />
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="招聘原因"
          prop="reason"
        >
          <el-input
            v-model="formData.reason"
            maxlength="255"
            placeholder="请输入招聘原因"
          />
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="工作经验"
          prop="workTime"
        >
          <el-select
            v-model="formData.workTime"
            class="full-width"
            clearable
            placeholder="请选择工作经验"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_WORK_TIME)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="学历要求"
          prop="educationRequire"
        >
          <el-select
            v-model="formData.educationRequire"
            class="full-width"
            clearable
            placeholder="请选择学历要求"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_POST_EDUCATION)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="薪资范围"
          prop="minSalary"
        >
          <div class="range-wrap">
            <div class="range-line salary-line">
              <el-input-number
                v-model="formData.minSalary"
                :controls="false"
                :disabled="salaryNegotiable"
                :max="99999999.99"
                :min="0"
                :precision="2"
                class="range-input"
                placeholder="最低薪资"
              />
              <span>至</span>
              <el-input-number
                v-model="formData.maxSalary"
                :controls="false"
                :disabled="salaryNegotiable"
                :max="99999999.99"
                :min="0"
                :precision="2"
                class="range-input"
                placeholder="最高薪资"
              />
              <el-select
                v-model="formData.salaryUnit"
                :disabled="salaryNegotiable"
                class="salary-unit"
                placeholder="单位"
              >
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_SALARY_UNIT)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
              <el-checkbox
                v-model="salaryNegotiable"
                @change="handleSalaryNegotiableChange"
              >面议</el-checkbox>
            </div>
            <div class="form-tip">最低薪资不能大于最高薪资；勾选“面议”后无需填写范围。</div>
          </div>
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="最迟到岗时间"
          prop="latestEntryTime"
        >
          <el-date-picker
            v-model="formData.latestEntryTime"
            class="full-width"
            placeholder="请选择时间"
            type="datetime"
            value-format="timestamp"
          />
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="年龄要求"
          prop="minAge"
        >
          <div class="range-wrap">
            <div class="range-line">
              <el-input-number
                v-model="formData.minAge"
                :controls="false"
                :disabled="ageUnlimited"
                :max="99"
                :min="0"
                class="range-input"
                placeholder="最小年龄"
              />
              <span>至</span>
              <el-input-number
                v-model="formData.maxAge"
                :controls="false"
                :disabled="ageUnlimited"
                :max="99"
                :min="0"
                class="range-input"
                placeholder="最大年龄"
              />
              <el-checkbox
                v-model="ageUnlimited"
                @change="handleAgeUnlimitedChange"
              >不限</el-checkbox>
            </div>
            <div class="form-tip">最小年龄不能大于最大年龄；勾选“不限”后无需填写范围。</div>
          </div>
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="紧急程度"
          prop="emergencyLevel"
        >
          <el-radio-group v-model="formData.emergencyLevel">
            <el-radio
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_EMERGENCY_LEVEL)"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="招聘负责人"
          prop="ownerEmployeeId"
        >
          <hrm-employee-select
            v-model="formData.ownerEmployeeId"
            class="full-width"
            :entry-status="HrmEmployeeEntryStatus.ACTIVE"
            placeholder="请选择招聘负责人"
            title="选择招聘负责人"
          />
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="职位类型"
          prop="postTypeId"
        >
          <treeselect
            v-model="formData.postTypeId"
            :options="postTypeTree"
            :normalizer="postTypeNormalizer"
            placeholder="请选择职位类型"
          />
        </el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="面试官"
          prop="interviewEmployeeIds"
        >
          <hrm-employee-select
            v-model="formData.interviewEmployeeIds"
            class="full-width"
            :entry-status="HrmEmployeeEntryStatus.ACTIVE"
            multiple
            placeholder="请选择面试官"
            title="选择面试官"
          />
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="职位描述"
          prop="description"
        >
          <el-input
            v-model="formData.description"
            :rows="4"
            maxlength="4000"
            placeholder="请输入职位描述"
            show-word-limit
            type="textarea"
          />
        </el-form-item></el-col>
      </el-row>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >保存</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { handleTree } from '@/utils/tree'
import { createRecruitPost, getRecruitPost, updateRecruitPost } from '@/api/hrm/recruit/post'
import { getRecruitPostTypeList } from '@/api/hrm/recruit/post/type'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import {
  AGE_UNLIMITED_VALUE,
  HrmEmployeeEntryStatus,
  HrmRecruitEmergencyLevel,
  HrmRecruitJobNature,
  HrmRecruitPostEducation,
  HrmRecruitSalaryUnit,
  HrmRecruitWorkTime,
  SALARY_NEGOTIABLE_UNIT_VALUE,
  SALARY_NEGOTIABLE_VALUE
} from '@/views/hrm/utils/constants'

export default {
  name: 'HrmRecruitPostForm',
  components: { Treeselect, AreaSelect, DeptSelect, HrmEmployeeSelect },
  data() {
    return {
      DICT_TYPE,
      HrmEmployeeEntryStatus,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.createDefaultFormData(),
      salaryNegotiable: false,
      ageUnlimited: false,
      postTypeTree: [],
      formRules: {
        postName: [
          { required: true, message: '职位名称不能为空', trigger: 'blur' },
          { max: 255, message: '职位名称不能超过 255 个字符', trigger: 'blur' }
        ],
        jobNature: [{ required: true, message: '工作性质不能为空', trigger: 'change' }],
        recruitNum: [{ type: 'number', min: 0, message: '招聘人数不能小于 0', trigger: 'blur' }],
        reason: [{ max: 255, message: '招聘原因不能超过 255 个字符', trigger: 'blur' }],
        minSalary: [{ validator: this.validateSalaryRange, trigger: ['blur', 'change'] }],
        minAge: [{ validator: this.validateAgeRange, trigger: ['blur', 'change'] }]
      }
    }
  },
  methods: {
    getIntDictOptions,
    createDefaultFormData() {
      return {
        id: undefined,
        postName: '',
        deptId: undefined,
        jobNature: HrmRecruitJobNature.FULL_TIME,
        areaId: undefined,
        recruitNum: undefined,
        reason: '',
        workTime: HrmRecruitWorkTime.UNLIMITED,
        educationRequire: HrmRecruitPostEducation.UNLIMITED,
        minSalary: undefined,
        maxSalary: undefined,
        salaryUnit: HrmRecruitSalaryUnit.MONTH,
        minAge: undefined,
        maxAge: undefined,
        latestEntryTime: undefined,
        ownerEmployeeId: undefined,
        interviewEmployeeIds: [],
        description: '',
        emergencyLevel: HrmRecruitEmergencyLevel.URGENT,
        postTypeId: undefined
      }
    },
    validateSalaryRange(rule, value, callback) {
      if (!this.salaryNegotiable && this.formData.minSalary != null && this.formData.maxSalary != null && this.formData.minSalary > this.formData.maxSalary) {
        callback(new Error('最低薪资不能大于最高薪资'))
        return
      }
      callback()
    },
    validateAgeRange(rule, value, callback) {
      if (!this.ageUnlimited && this.formData.minAge != null && this.formData.maxAge != null && this.formData.minAge > this.formData.maxAge) {
        callback(new Error('最小年龄不能大于最大年龄'))
        return
      }
      callback()
    },
    postTypeNormalizer(node) {
      return { id: node.id, label: node.name, children: node.children }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新建招聘职位' : '编辑招聘职位'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      try {
        const typeResponse = await getRecruitPostTypeList({ status: CommonStatusEnum.ENABLE })
        this.postTypeTree = handleTree(typeResponse.data)
        if (id) {
          const response = await getRecruitPost(id)
          const data = response.data
          this.salaryNegotiable = data.salaryUnit === SALARY_NEGOTIABLE_UNIT_VALUE ||
            (data.minSalary === SALARY_NEGOTIABLE_VALUE && data.maxSalary === SALARY_NEGOTIABLE_VALUE)
          this.ageUnlimited = data.minAge === AGE_UNLIMITED_VALUE && data.maxAge === AGE_UNLIMITED_VALUE
          this.formData = { ...data, interviewEmployeeIds: data.interviewEmployeeIds || [] }
          if (this.salaryNegotiable) {
            this.formData.minSalary = undefined
            this.formData.maxSalary = undefined
            this.formData.salaryUnit = HrmRecruitSalaryUnit.MONTH
          }
          if (this.ageUnlimited) {
            this.formData.minAge = undefined
            this.formData.maxAge = undefined
          }
        }
      } finally {
        this.formLoading = false
      }
    },
    handleSalaryNegotiableChange() {
      this.formData.minSalary = undefined
      this.formData.maxSalary = undefined
      this.$refs.form && this.$refs.form.clearValidate('minSalary')
    },
    handleAgeUnlimitedChange() {
      this.formData.minAge = undefined
      this.formData.maxAge = undefined
      this.$refs.form && this.$refs.form.clearValidate('minAge')
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        const data = {
          ...this.formData,
          minSalary: this.salaryNegotiable ? SALARY_NEGOTIABLE_VALUE : this.formData.minSalary,
          maxSalary: this.salaryNegotiable ? SALARY_NEGOTIABLE_VALUE : this.formData.maxSalary,
          salaryUnit: this.salaryNegotiable ? SALARY_NEGOTIABLE_UNIT_VALUE : this.formData.salaryUnit,
          minAge: this.ageUnlimited ? AGE_UNLIMITED_VALUE : this.formData.minAge,
          maxAge: this.ageUnlimited ? AGE_UNLIMITED_VALUE : this.formData.maxAge
        }
        if (this.formType === 'create') {
          await createRecruitPost(data)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateRecruitPost(data)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.salaryNegotiable = false
      this.ageUnlimited = false
      this.formData = this.createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.full-width, .range-wrap { width: 100%; }
.range-line { display: flex; width: 100%; align-items: center; gap: 8px; }
.salary-line { gap: 4px; }
.range-input { min-width: 0; flex: 1; }
.salary-unit { width: 80px; flex-shrink: 0; }
.form-tip { margin-top: 4px; color: #909399; font-size: 12px; }
</style>
