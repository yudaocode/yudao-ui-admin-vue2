<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    top="4vh"
    width="1120px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="118px"
      class="scheme-form"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="方案名称"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              maxlength="64"
              placeholder="请输入方案名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="参保城市"
            prop="areaId"
          >
            <area-select
              v-model="formData.areaId"
              :selectable-levels="[2, 3]"
              check-strictly
              class="full-width"
              placeholder="请选择参保城市"
              @change="handleAreaChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            label="可选参保方案"
            prop="householdType"
          >
            <el-select
              v-model="formData.householdType"
              :loading="standardLoading"
              class="full-width"
              clearable
              filterable
              placeholder="请选择参保方案"
              @change="handleHouseTypeChange"
            >
              <el-option
                v-for="insuranceType in insuranceTypeList"
                :key="insuranceType.code"
                :label="insuranceType.name"
                :value="insuranceType.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="方案类型"
        prop="type"
      >
        <el-radio-group v-model="formData.type">
          <el-radio-button :label="HrmInsuranceSchemeType.PROPORTION">设置参保基数和比例</el-radio-button>
          <el-radio-button :label="HrmInsuranceSchemeType.AMOUNT">仅设置参保金额</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-alert
        :closable="false"
        class="mode-alert"
        show-icon
        title="比例模式：公司或个人缴纳金额 = 参保基数 × 对应比例；金额模式直接填写公司和个人缴纳金额。"
        type="info"
      />

      <el-form-item
        label-width="0"
        prop="projectList"
      >
        <div class="full-width">
          <div
            v-for="section in projectSections"
            :key="section.key"
            :class="{ 'project-section-space': section.key !== 'social' }"
          >
            <div class="section-header">
              <div class="section-title"><span class="title-bar" />{{ section.label }}</div>
              <el-dropdown
                :ref="'projectDropdown-' + section.key"
                :hide-on-click="false"
                trigger="click"
              >
                <el-button icon="el-icon-plus">添加项目</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="option in section.options"
                    :key="option.value"
                    @click.native.stop
                  >
                    <el-checkbox
                      :value="isProjectTypeUsed(option.value)"
                      @change="handleProjectChecked($event, option.value)"
                    >{{ option.label }}</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    @click.native="addCustomProject(section.key, section.customType)"
                  >
                    <i class="el-icon-plus" /> 其他
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <el-table
              :data="section.projects"
              :summary-method="getProjectSummaries"
              border
              show-summary
            >
              <el-table-column
                label="项目名称"
                min-width="150"
                prop="name"
              >
                <template slot-scope="scope">
                  <el-input
                    v-if="isCustomProject(scope.row.type)"
                    v-model="scope.row.name"
                    maxlength="64"
                    placeholder="请输入项目名称"
                  />
                  <span v-else>{{ getProjectTypeName(scope.row.type) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="默认基数"
                prop="baseAmount"
                width="140"
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
                v-if="formData.type === HrmInsuranceSchemeType.PROPORTION"
                label="公司缴纳比例"
                prop="corporateRate"
                width="140"
              >
                <template slot-scope="scope">
                  <div class="rate-input">
                    <el-input-number
                      v-model="scope.row.corporateRate"
                      :controls="false"
                      :max="100"
                      :min="0"
                      :precision="2"
                      class="full-width"
                    />
                    <span class="rate-suffix">%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                v-if="formData.type === HrmInsuranceSchemeType.PROPORTION"
                label="个人缴纳比例"
                prop="personalRate"
                width="140"
              >
                <template slot-scope="scope">
                  <div class="rate-input">
                    <el-input-number
                      v-model="scope.row.personalRate"
                      :controls="false"
                      :max="100"
                      :min="0"
                      :precision="2"
                      class="full-width"
                    />
                    <span class="rate-suffix">%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="公司金额"
                prop="corporateAmount"
                width="140"
              >
                <template slot-scope="scope">
                  <el-input-number
                    v-if="formData.type === HrmInsuranceSchemeType.AMOUNT"
                    v-model="scope.row.corporateAmount"
                    :controls="false"
                    :min="0"
                    :precision="2"
                    class="full-width"
                  />
                  <span v-else>{{ formatHrmMoney(calculateAmount(scope.row, 'corporate')) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="个人金额"
                prop="personalAmount"
                width="140"
              >
                <template slot-scope="scope">
                  <el-input-number
                    v-if="formData.type === HrmInsuranceSchemeType.AMOUNT"
                    v-model="scope.row.personalAmount"
                    :controls="false"
                    :min="0"
                    :precision="2"
                    class="full-width"
                  />
                  <span v-else>{{ formatHrmMoney(calculateAmount(scope.row, 'personal')) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="操作"
                width="80"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    class="danger-text"
                    @click="removeProject(scope.row)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import { createInsuranceScheme, getInsuranceScheme, updateInsuranceScheme } from '@/api/hrm/insurance/scheme'
import { getInsuranceStandardProjectList, getInsuranceStandardTypeList } from '@/api/hrm/insurance/standard'
import { HrmInsuranceProjectType, HrmInsuranceSchemeType } from '@/views/hrm/utils/constants'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'

const SOCIAL_PROJECT_TYPES = [
  HrmInsuranceProjectType.ENDOWMENT,
  HrmInsuranceProjectType.MEDICAL,
  HrmInsuranceProjectType.UNEMPLOYMENT,
  HrmInsuranceProjectType.EMPLOYMENT_INJURY,
  HrmInsuranceProjectType.MATERNITY,
  HrmInsuranceProjectType.SUPPLEMENTARY_MEDICAL,
  HrmInsuranceProjectType.SUPPLEMENTARY_ENDOWMENT,
  HrmInsuranceProjectType.DISABILITY
]
const PROVIDENT_FUND_PROJECT_TYPES = [HrmInsuranceProjectType.PROVIDENT_FUND]

export default {
  name: 'HrmInsuranceSchemeForm',
  components: { AreaSelect },
  data() {
    return {
      DICT_TYPE,
      HrmInsuranceSchemeType,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      standardLoading: false,
      insuranceTypeList: [],
      formData: this.createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
        areaId: [{ required: true, message: '参保城市不能为空', trigger: 'change' }],
        type: [{ required: true, message: '方案类型不能为空', trigger: 'change' }],
        projectList: [{ validator: this.validateProjectList, trigger: 'change' }]
      }
    }
  },
  computed: {
    projectSections() {
      return [
        {
          key: 'social',
          label: '社保',
          projects: (this.formData.projectList || []).filter(project => this.isSocialProject(project.type)),
          options: this.getProjectOptions(SOCIAL_PROJECT_TYPES),
          customType: HrmInsuranceProjectType.CUSTOM_SOCIAL_SECURITY
        },
        {
          key: 'providentFund',
          label: '公积金',
          projects: (this.formData.projectList || []).filter(project => this.isProvidentFundProject(project.type)),
          options: this.getProjectOptions(PROVIDENT_FUND_PROJECT_TYPES),
          customType: HrmInsuranceProjectType.CUSTOM_PROVIDENT_FUND
        }
      ]
    }
  },
  methods: {
    formatHrmMoney,
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      if (!id) {
        this.resetForm()
        return
      }
      this.formLoading = true
      try {
        const response = await getInsuranceScheme(id)
        this.formData = {
          ...response.data,
          projectList: response.data.projectList || []
        }
        if (this.formData.areaId) await this.getInsuranceTypeList(this.formData.areaId)
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createInsuranceScheme(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await this.$modal.confirm('编辑参保方案后，不会变更现有参保信息，确定提交吗？')
          await updateInsuranceScheme(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    addProject(type) {
      if (!this.formData.projectList) this.$set(this.formData, 'projectList', [])
      this.formData.projectList.push(this.createProject(type))
    },
    handleProjectChecked(checked, type) {
      const project = (this.formData.projectList || []).find(item => item.type === type)
      if (checked) {
        if (!project) this.addProject(type)
        return
      }
      if (project) this.removeProject(project)
    },
    addCustomProject(key, type) {
      const ref = this.$refs['projectDropdown-' + key]
      const dropdown = Array.isArray(ref) ? ref[0] : ref
      if (dropdown && dropdown.hide) dropdown.hide()
      this.addProject(type)
    },
    removeProject(project) {
      const index = (this.formData.projectList || []).indexOf(project)
      if (index >= 0) this.formData.projectList.splice(index, 1)
    },
    getProjectOptions(types) {
      return types.map(type => ({ label: this.getProjectTypeName(type), value: type }))
    },
    isProjectTypeUsed(type) {
      return (this.formData.projectList || []).some(project => project.type === type)
    },
    async getInsuranceTypeList(areaId) {
      this.standardLoading = true
      try {
        const response = await getInsuranceStandardTypeList(areaId)
        if (this.formData.areaId !== areaId) return
        const data = response.data
        this.insuranceTypeList = data
        const selectedType = data.find(item =>
          item.name === this.formData.householdType && item.code !== this.formData.householdType
        )
        if (selectedType) this.formData.householdType = selectedType.code
      } finally {
        this.standardLoading = false
      }
    },
    async handleAreaChange(areaId) {
      this.formData.householdType = ''
      this.insuranceTypeList = []
      this.resetStandardProjectValues()
      if (areaId) await this.getInsuranceTypeList(areaId)
    },
    async handleHouseTypeChange(typeCode) {
      const areaId = this.formData.areaId
      if (!areaId || !typeCode) return
      this.standardLoading = true
      try {
        const response = await getInsuranceStandardProjectList({ areaId, typeCode })
        if (this.formData.areaId !== areaId || this.formData.householdType !== typeCode) return
        const customProjects = (this.formData.projectList || []).filter(project => this.isCustomProject(project.type))
        this.formData.projectList = [
          ...response.data.map(project => ({
            ...project,
            id: undefined,
            schemeId: undefined,
            name: this.getProjectTypeName(project.type)
          })),
          ...customProjects
        ]
      } finally {
        this.standardLoading = false
      }
    },
    resetStandardProjectValues() {
      (this.formData.projectList || []).forEach(project => {
        if (this.isCustomProject(project.type)) return
        project.baseAmount = 0
        project.corporateRate = 0
        project.personalRate = 0
        project.corporateAmount = 0
        project.personalAmount = 0
      })
    },
    validateProjectList(rule, value, callback) {
      if (!(value || []).some(project => this.isSocialProject(project.type))) {
        callback(new Error('请至少添加一个社保项目'))
        return
      }
      if (value.some(project => !(project.name || '').trim())) {
        callback(new Error('参保项目名称不能为空'))
        return
      }
      callback()
    },
    calculateAmount(project, type) {
      const proportion = type === 'corporate' ? project.corporateRate : project.personalRate
      return Number(project.baseAmount || 0) * Number(proportion || 0) * 0.01
    },
    getProjectSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) return '总计'
        if (!['corporateAmount', 'personalAmount'].includes(String(column.property))) return ''
        const type = column.property === 'corporateAmount' ? 'corporate' : 'personal'
        return formatHrmMoney(data.reduce((total, project) => total +
          (this.formData.type === HrmInsuranceSchemeType.PROPORTION
            ? this.calculateAmount(project, type)
            : Number(project[column.property] || 0)), 0))
      })
    },
    getProjectTypeName(type) {
      return getDictDataLabel(DICT_TYPE.HRM_INSURANCE_PROJECT_TYPE, type)
    },
    isCustomProject(type) {
      return type === HrmInsuranceProjectType.CUSTOM_SOCIAL_SECURITY ||
        type === HrmInsuranceProjectType.CUSTOM_PROVIDENT_FUND
    },
    isSocialProject(type) {
      return type !== undefined && type < HrmInsuranceProjectType.PROVIDENT_FUND
    },
    isProvidentFundProject(type) {
      return type !== undefined && type >= HrmInsuranceProjectType.PROVIDENT_FUND
    },
    createProject(type) {
      return {
        type,
        name: this.isCustomProject(type) ? '' : this.getProjectTypeName(type),
        baseAmount: 0,
        corporateRate: 0,
        personalRate: 0,
        corporateAmount: 0,
        personalAmount: 0
      }
    },
    createDefaultFormData() {
      return {
        id: undefined,
        name: '',
        areaId: undefined,
        householdType: '',
        type: HrmInsuranceSchemeType.PROPORTION,
        projectList: [
          HrmInsuranceProjectType.ENDOWMENT,
          HrmInsuranceProjectType.MEDICAL,
          HrmInsuranceProjectType.UNEMPLOYMENT,
          HrmInsuranceProjectType.EMPLOYMENT_INJURY,
          HrmInsuranceProjectType.MATERNITY,
          HrmInsuranceProjectType.PROVIDENT_FUND
        ].map(type => this.createProject(type))
      }
    },
    resetForm() {
      this.insuranceTypeList = []
      this.formData = this.createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.scheme-form { max-height: calc(100vh - 250px); overflow-y: auto; padding-right: 8px; }
.full-width { width: 100%; }
.mode-alert { margin-bottom: 16px; }
.project-section-space { margin-top: 20px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin: 8px 0 12px; }
.section-title { display: flex; align-items: center; color: #303133; font-size: 16px; font-weight: 600; }
.title-bar { width: 4px; height: 18px; margin-right: 10px; border-radius: 2px; background: #409eff; }
.rate-input { position: relative; }
.rate-suffix { position: absolute; top: 0; right: 10px; color: #606266; line-height: 40px; pointer-events: none; }
.rate-input ::v-deep .el-input__inner { padding-right: 24px; }
.danger-text { color: #f56c6c; }
</style>
