<!-- MES 点检保养方案表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="960px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px" :disabled="isDetail">
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="方案编码" prop="code"><el-input v-model="formData.code" placeholder="请输入方案编码"><el-button slot="append" @click="generateCode">生成</el-button></el-input></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="方案名称" prop="name"><el-input v-model="formData.name" placeholder="请输入方案名称" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="方案类型" prop="type"><el-select v-model="formData.type" placeholder="请选择方案类型" class="full-width"><el-option v-for="dict in subjectTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="周期数量" prop="cycleCount"><el-input-number v-model="formData.cycleCount" :min="1" controls-position="right" class="full-width" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="周期类型" prop="cycleType"><el-select v-model="formData.cycleType" placeholder="请选择周期类型" class="full-width"><el-option v-for="dict in cycleTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="状态" prop="status"><dict-tag :type="MES_DV_CHECK_PLAN_STATUS" :value="formData.status" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8"><el-form-item label="开始日期" prop="startDate"><el-date-picker v-model="formData.startDate" type="date" value-format="timestamp" placeholder="请选择开始日期" class="full-width" /></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="结束日期" prop="endDate"><el-date-picker v-model="formData.endDate" type="date" value-format="timestamp" placeholder="请选择结束日期" class="full-width" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
    </el-form>
    <el-tabs v-if="formData.id" v-model="activeTab">
      <el-tab-pane label="设备清单" name="machinery"><check-plan-machinery-list :plan-id="formData.id" :form-type="formType" /></el-tab-pane>
      <el-tab-pane label="保养项目" name="subject"><check-plan-subject-list :plan-id="formData.id" :form-type="formType" /></el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button v-if="!isDetail" type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">{{ isDetail ? '关 闭' : '取 消' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { DvCheckPlanApi } from '@/api/mes/dv/checkplan'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode, MesDvCheckPlanStatusEnum } from '@/views/mes/utils/constants'
import CheckPlanMachineryList from './CheckPlanMachineryList.vue'
import CheckPlanSubjectList from './CheckPlanSubjectList.vue'

const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'
const MES_DV_CYCLE_TYPE = 'mes_dv_cycle_type'
const MES_DV_CHECK_PLAN_STATUS = 'mes_dv_check_plan_status'

export default {
  name: 'CheckPlanForm',
  components: { CheckPlanMachineryList, CheckPlanSubjectList },
  data() {
    return {
      MES_DV_CHECK_PLAN_STATUS,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      activeTab: 'machinery',
      formData: this.getDefaultForm(),
      subjectTypeOptions: getIntDictOptions(MES_DV_SUBJECT_TYPE),
      cycleTypeOptions: getIntDictOptions(MES_DV_CYCLE_TYPE),
      formRules: {
        code: [{ required: true, message: '方案编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '方案类型不能为空', trigger: 'change' }],
        cycleType: [{ required: true, message: '周期类型不能为空', trigger: 'change' }],
        cycleCount: [{ required: true, message: '周期数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, code: undefined, name: undefined, type: undefined, startDate: undefined, endDate: undefined, cycleType: undefined, cycleCount: undefined, status: MesDvCheckPlanStatusEnum.PREPARE, remark: undefined }
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.DV_CHECK_PLAN_CODE)
      this.formData.code = response.data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'detail' ? '方案详情' : (type === 'create' ? '新增方案' : '修改方案')
      this.formType = type
      this.activeTab = 'machinery'
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          const response = await DvCheckPlanApi.getCheckPlan(id)
          this.formData = response.data
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
            await DvCheckPlanApi.createCheckPlan(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await DvCheckPlanApi.updateCheckPlan(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
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

<style scoped>.full-width { width: 100%; }</style>
