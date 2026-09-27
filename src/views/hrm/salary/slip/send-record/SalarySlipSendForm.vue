<template>
  <div>
    <el-dialog
      title="发送工资条"
      :visible.sync="dialogVisible"
      top="4vh"
      width="1180px"
      append-to-body
    >
      <el-steps
        :active="currentStep"
        align-center
        class="steps"
      >
        <el-step title="设置工资条模板" />
        <el-step title="选择发放员工" />
      </el-steps>
      <div
        v-if="currentStep === 0"
        v-loading="templateLoading"
      >
        <el-form label-width="100px">
          <el-form-item
            label="工资条模板"
            required
          >
            <div class="template-toolbar">
              <el-select
                v-model="selectedTemplateId"
                class="template-select"
                filterable
                placeholder="请选择工资条模板"
                @change="handleTemplateChange"
              >
                <el-option
                  v-for="template in templateList"
                  :key="template.id"
                  :label="template.name"
                  :value="template.id"
                />
              </el-select>
              <el-button
                v-hasPermi="['hrm:salary:slip:update']"
                plain
                type="primary"
                icon="el-icon-plus"
                @click="$refs.templateForm.open('create')"
              >新增模板</el-button>
              <el-button
                v-hasPermi="['hrm:salary:slip:update']"
                :disabled="!selectedTemplate || selectedTemplate.defaultStatus"
                icon="el-icon-edit"
                @click="$refs.templateForm.open('update', selectedTemplateId)"
              >编辑模板</el-button>
              <el-button
                v-hasPermi="['hrm:salary:slip:delete']"
                :disabled="!selectedTemplate || selectedTemplate.defaultStatus"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteTemplate(selectedTemplateId)"
              >删除模板</el-button>
            </div>
          </el-form-item>
          <el-empty
            v-if="!sendTemplate"
            description="暂无工资条模板，请先新增模板"
          />
          <template v-else>
            <el-form-item label="隐藏空项">
              <el-switch
                v-model="sendTemplate.hideEmpty"
                active-text="隐藏金额为空的工资项"
                inactive-text="保留全部工资项"
              />
            </el-form-item>
            <el-form-item label="模板明细">
              <salary-slip-template-option-editor
                ref="templateEditor"
                v-model="sendTemplate.options"
                :max-height="320"
              >
                <el-button
                  slot="actions"
                  v-hasPermi="['hrm:salary:slip:update']"
                  plain
                  icon="el-icon-document-copy"
                  @click="handleSaveAsTemplate"
                >另存为模板</el-button>
              </salary-slip-template-option-editor>
            </el-form-item>
          </template>
        </el-form>
      </div>
      <el-form
        v-else
        v-loading="sendLoading"
        label-width="100px"
      >
        <el-form-item label="员工筛选">
          <div class="employee-filters">
            <el-input
              v-model="queryParams.search"
              class="employee-search"
              clearable
              placeholder="请输入员工姓名"
              @keyup.enter.native="handleQuery"
            />
            <dept-select
              v-model="queryParams.deptId"
              class="employee-search"
            />
            <el-select
              v-model="queryParams.sent"
              class="send-status"
              clearable
              placeholder="发送状态"
            >
              <el-option
                label="未发送"
                :value="false"
              />
              <el-option
                label="已发送"
                :value="true"
              />
            </el-select>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              @click="resetQuery"
            >重置</el-button>
          </div>
        </el-form-item>
        <el-form-item label="发放员工">
          <div class="full-width">
            <el-table
              ref="employeeTable"
              v-loading="employeeLoading"
              :data="employeeList"
              border
              max-height="320"
              row-key="employeeId"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                :reserve-selection="true"
                type="selection"
                width="45"
              />
              <el-table-column
                label="员工"
                min-width="120"
                prop="employeeName"
                show-overflow-tooltip
              />
              <el-table-column
                label="工号"
                prop="jobNumber"
                width="110"
              />
              <el-table-column
                label="部门"
                min-width="130"
                prop="deptName"
                show-overflow-tooltip
              />
              <el-table-column
                label="岗位"
                min-width="130"
                prop="postName"
                show-overflow-tooltip
              />
              <el-table-column
                label="手机号"
                prop="mobile"
                width="130"
              />
              <el-table-column
                align="center"
                label="发送状态"
                width="100"
              >
                <template slot-scope="scope">
                  <el-tag :type="scope.row.sent ? 'success' : 'info'">
                    {{ scope.row.sent ? '已发送' : '未发送' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                align="right"
                label="应发工资"
                width="120"
              >
                <template slot-scope="scope">{{ formatHrmMoney(scope.row.expectedPaySalary) }}</template>
              </el-table-column>
              <el-table-column
                align="right"
                label="实发工资"
                width="120"
              >
                <template slot-scope="scope">{{ formatHrmMoney(scope.row.realPaySalary) }}</template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="employeeTotal > 0"
              :limit.sync="queryParams.pageSize"
              :page.sync="queryParams.pageNo"
              :total="employeeTotal"
              @pagination="loadEmployees"
            />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <template v-if="currentStep === 0">
          <el-button
            :disabled="templateLoading"
            type="primary"
            @click="handleNextStep"
          >下一步</el-button>
        </template>
        <template v-else>
          <span class="selected-count">已选 {{ selectedEmployeeIds.length }} 人</span>
          <el-button
            :disabled="sendLoading"
            @click="currentStep = 0"
          >上一步</el-button>
          <el-button
            :disabled="sendLoading"
            type="primary"
            @click="submitForm(false)"
          >发放已选员工</el-button>
          <el-button
            :disabled="sendLoading || !employeeTotal"
            type="primary"
            @click="submitForm(true)"
          >全部发放</el-button>
        </template>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <salary-slip-template-form
      ref="templateForm"
      @success="handleTemplateSuccess"
    />
  </div>
</template>

<script>
import { getSalarySlipSendEmployeePage, sendSalarySlip } from '@/api/hrm/salary/slip/send-record'
import {
  createSalarySlipTemplate,
  deleteSalarySlipTemplate,
  getSalarySlipTemplateList
} from '@/api/hrm/salary/slip/template'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { formatHrmMoney } from '@/views/hrm/utils/format'
import { HrmSalaryOptionCategoryCode } from '@/views/hrm/utils/constants'
import SalarySlipTemplateForm from '../template/SalarySlipTemplateForm.vue'
import SalarySlipTemplateOptionEditor from '../template/SalarySlipTemplateOptionEditor.vue'

export default {
  name: 'HrmSalarySlipSendForm',
  components: { DeptSelect, SalarySlipTemplateForm, SalarySlipTemplateOptionEditor },
  data() {
    return {
      dialogVisible: false,
      currentStep: 0,
      sendLoading: false,
      templateLoading: false,
      employeeLoading: false,
      employeeLoaded: false,
      employeeTotal: 0,
      monthRecordId: undefined,
      employeeList: [],
      selectedEmployeeIdSet: new Set(),
      templateList: [],
      selectedTemplateId: undefined,
      sendTemplate: undefined,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        search: undefined,
        deptId: undefined,
        sent: false
      }
    }
  },
  computed: {
    selectedEmployeeIds() { return Array.from(this.selectedEmployeeIdSet) },
    selectedTemplate() {
      return this.templateList.find(template => template.id === this.selectedTemplateId)
    }
  },
  methods: {
    formatHrmMoney,
    async open(recordId) {
      this.monthRecordId = recordId
      this.dialogVisible = true
      this.currentStep = 0
      this.selectedTemplateId = undefined
      this.sendTemplate = undefined
      this.employeeLoaded = false
      this.employeeList = []
      this.employeeTotal = 0
      this.selectedEmployeeIdSet = new Set()
      if (this.$refs.employeeTable) this.$refs.employeeTable.clearSelection()
      this.resetQueryParams()
      await this.loadTemplates()
    },
    async loadTemplates(preferredId) {
      this.templateLoading = true
      try {
        const currentTemplateId = preferredId || this.selectedTemplateId
        const response = await getSalarySlipTemplateList()
        const templateList = response.data
        this.templateList = templateList
        const current = templateList.find(template => template.id === currentTemplateId)
        const defaultTemplate = templateList.find(template => template.defaultStatus)
        this.selectedTemplateId = (current && current.id) ||
          (defaultTemplate && defaultTemplate.id) ||
          (templateList[0] && templateList[0].id)
        this.handleTemplateChange(this.selectedTemplateId)
      } finally {
        this.templateLoading = false
      }
    },
    async handleNextStep() {
      if (!this.sendTemplate) {
        this.$modal.msgWarning('请先选择或新增工资条模板')
        return
      }
      const validateMessage = this.$refs.templateEditor.validate()
      if (validateMessage) {
        this.$modal.msgWarning(validateMessage)
        return
      }
      this.currentStep = 1
      if (!this.employeeLoaded) await this.loadEmployees()
    },
    async loadEmployees() {
      if (!this.monthRecordId) return
      this.employeeLoading = true
      try {
        const response = await getSalarySlipSendEmployeePage({
          monthRecordId: this.monthRecordId,
          ...this.queryParams
        })
        this.employeeList = response.data.list
        this.employeeTotal = response.data.total
        await this.$nextTick()
        this.employeeList.forEach(row => {
          if (this.$refs.employeeTable) {
            this.$refs.employeeTable.toggleRowSelection(
              row,
              this.selectedEmployeeIdSet.has(row.employeeId)
            )
          }
        })
        this.employeeLoaded = true
      } finally {
        this.employeeLoading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.loadEmployees()
    },
    resetQuery() {
      this.resetQueryParams()
      this.loadEmployees()
    },
    resetQueryParams() {
      this.queryParams.pageNo = 1
      this.queryParams.pageSize = 10
      this.queryParams.search = undefined
      this.queryParams.deptId = undefined
      this.queryParams.sent = false
    },
    handleSelectionChange(rows) {
      this.employeeList.forEach(row => this.selectedEmployeeIdSet.delete(row.employeeId))
      rows.forEach(row => this.selectedEmployeeIdSet.add(row.employeeId))
      this.selectedEmployeeIdSet = new Set(this.selectedEmployeeIdSet)
    },
    async submitForm(all) {
      if (!this.monthRecordId || !this.sendTemplate || (!all && !this.selectedEmployeeIds.length)) {
        this.$modal.msgWarning('请选择发放员工')
        return
      }
      this.sendLoading = true
      try {
        await sendSalarySlip({
          monthRecordId: this.monthRecordId,
          hideEmpty: Boolean(this.sendTemplate.hideEmpty),
          options: this.getTemplateOptions(),
          all,
          employeeIds: all ? undefined : this.selectedEmployeeIds,
          search: all ? this.queryParams.search : undefined,
          deptId: all ? this.queryParams.deptId : undefined,
          sent: all ? this.queryParams.sent : undefined
        })
        this.$modal.msgSuccess(this.$t('common.createSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.sendLoading = false
      }
    },
    async handleTemplateSuccess(id) {
      await this.loadTemplates(id)
    },
    handleTemplateChange(id) {
      const template = this.templateList.find(item => item.id === id)
      this.sendTemplate = template
        ? {
          ...template,
          options: (template.options || []).map(item => ({
            ...item,
            parentCode: item.parentCode === HrmSalaryOptionCategoryCode.ROOT
              ? undefined
              : item.parentCode
          }))
        }
        : undefined
    },
    async handleSaveAsTemplate() {
      if (!this.sendTemplate) return
      try {
        const result = await this.$prompt('请输入新模板名称', '另存为模板')
        const name = result.value.trim()
        if (!name) {
          this.$modal.msgWarning('模板名称不能为空')
          return
        }
        if (name.length > 64) {
          this.$modal.msgWarning('模板名称不能超过 64 个字符')
          return
        }
        const response = await createSalarySlipTemplate({
          name,
          hideEmpty: Boolean(this.sendTemplate.hideEmpty),
          options: this.getTemplateOptions()
        })
        this.$modal.msgSuccess(this.$t('common.createSuccess'))
        await this.loadTemplates(response.data)
      } catch (error) {}
    },
    async handleDeleteTemplate(id) {
      if (!id) return
      try {
        await this.$modal.confirm()
        await deleteSalarySlipTemplate(id)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.loadTemplates()
      } catch (error) {}
    },
    getTemplateOptions() {
      return this.$refs.templateEditor ? this.$refs.templateEditor.getNormalizedOptions() : []
    }
  }
}
</script>

<style scoped>
.steps { max-width: 680px; margin: 0 auto 24px; }
.template-toolbar, .employee-filters { display: flex; align-items: center; gap: 12px; width: 100%; }
.template-select { flex: 1; }
.employee-search { width: 220px; }
.send-status { width: 150px; }
.full-width { width: 100%; }
.selected-count { margin-right: 12px; color: #909399; }
</style>
