<!-- MES 排班计划表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="isDetail"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="计划编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入计划编码">
              <el-button slot="append" @click="generateCode">生成</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入计划名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="班组类型" prop="calendarType">
            <el-select v-model="formData.calendarType" placeholder="请选择班组类型" class="full-width">
              <el-option v-for="dict in calendarTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              value-format="timestamp"
              placeholder="请选择开始日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              value-format="timestamp"
              placeholder="请选择结束日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="轮班方式" prop="shiftType">
            <el-select v-model="formData.shiftType" placeholder="请选择轮班方式" class="full-width">
              <el-option v-for="dict in shiftTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="formData.shiftType && formData.shiftType !== MesCalShiftTypeEnum.SINGLE" :span="8">
          <el-form-item label="倒班方式" prop="shiftMethod">
            <el-select v-model="formData.shiftMethod" placeholder="请选择倒班方式" class="full-width">
              <el-option v-for="dict in shiftMethodOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.shiftMethod === MesCalShiftMethodEnum.DAY" :span="8">
          <el-form-item label="倒班天数" prop="shiftCount">
            <el-input-number v-model="formData.shiftCount" :min="1" controls-position="right" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs v-if="formType === 'update' || isDetail" v-model="activeTab" class="resource-tabs">
      <el-tab-pane label="班次" name="shift">
        <cal-shift-list :plan-id="formData.id" :form-type="formType" />
      </el-tab-pane>
      <el-tab-pane label="班组" name="team">
        <cal-plan-team-list :plan-id="formData.id" :form-type="formType" />
      </el-tab-pane>
    </el-tabs>

    <span slot="footer">
      <template v-if="!isDetail">
        <el-button
          v-if="formType === 'update' && formData.status === MesCalPlanStatusEnum.PREPARE"
          type="warning"
          :disabled="formLoading"
          @click="handleConfirm"
        >确认计划</el-button>
        <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </template>
      <el-button v-else @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { CalPlanApi } from '@/api/mes/cal/plan'
import {
  MesCalPlanStatusEnum,
  MesCalShiftTypeEnum,
  MesCalShiftMethodEnum,
  MesAutoCodeRuleCode
} from '@/views/mes/utils/constants'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import CalShiftList from './CalShiftList.vue'
import CalPlanTeamList from './CalPlanTeamList.vue'

const MES_CAL_CALENDAR_TYPE = 'mes_cal_calendar_type'
const MES_CAL_SHIFT_TYPE = 'mes_cal_shift_type'
const MES_CAL_SHIFT_METHOD = 'mes_cal_shift_method'

export default {
  name: 'CalPlanForm',
  components: { CalShiftList, CalPlanTeamList },
  data() {
    return {
      MesCalPlanStatusEnum,
      MesCalShiftTypeEnum,
      MesCalShiftMethodEnum,
      dialogVisible: false,
      formLoading: false,
      formType: '',
      activeTab: 'shift',
      formData: this.getDefaultForm(),
      calendarTypeOptions: getIntDictOptions(MES_CAL_CALENDAR_TYPE),
      shiftTypeOptions: getIntDictOptions(MES_CAL_SHIFT_TYPE),
      shiftMethodOptions: getIntDictOptions(MES_CAL_SHIFT_METHOD),
      formRules: {
        code: [{ required: true, message: '计划编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        calendarType: [{ required: true, message: '班组类型不能为空', trigger: 'change' }],
        startDate: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
        endDate: [{ required: true, message: '结束日期不能为空', trigger: 'change' }],
        shiftType: [{ required: true, message: '轮班方式不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    },
    dialogTitle() {
      return {
        create: '新增排班计划',
        update: '修改排班计划',
        detail: '查看排班计划'
      }[this.formType] || this.formType
    }
  },
  watch: {
    'formData.shiftType'(newValue) {
      if (newValue === MesCalShiftTypeEnum.SINGLE) {
        this.formData.shiftMethod = undefined
        this.formData.shiftCount = undefined
      }
    },
    'formData.shiftMethod'(newValue) {
      if (newValue !== MesCalShiftMethodEnum.DAY) this.formData.shiftCount = undefined
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        calendarType: undefined,
        startDate: undefined,
        endDate: undefined,
        shiftType: undefined,
        shiftMethod: undefined,
        shiftCount: undefined,
        status: MesCalPlanStatusEnum.PREPARE,
        remark: undefined
      }
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.CAL_PLAN_CODE)
      this.formData.code = response.data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.activeTab = 'shift'
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await CalPlanApi.getPlan(id)).data
        } finally {
          this.formLoading = false
        }
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            await CalPlanApi.createPlan(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await CalPlanApi.updatePlan(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    handleConfirm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          await CalPlanApi.updatePlan(this.formData)
          await this.$modal.confirm('确认该排班计划？确认后将不可修改或删除。')
          await CalPlanApi.confirmPlan(this.formData.id)
          this.$modal.msgSuccess('确认成功')
          this.dialogVisible = false
          this.$emit('success')
        } catch (error) {
          // 取消确认或接口失败时保持弹窗数据
        } finally {
          this.formLoading = false
        }
      })
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.resource-tabs { margin-top: 10px; }
</style>
