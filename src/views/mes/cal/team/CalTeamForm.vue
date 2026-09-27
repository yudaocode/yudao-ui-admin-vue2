<!-- MES 班组表单 -->
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
          <el-form-item label="班组编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入班组编码" :maxlength="64">
              <el-button slot="append" @click="generateCode">生成</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="班组名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入班组名称" :maxlength="100" />
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
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" :maxlength="250" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs v-if="formType === 'update' || isDetail" v-model="activeTab" class="resource-tabs">
      <el-tab-pane label="班组成员" name="member">
        <cal-team-member-list :team-id="formData.id" :form-type="formType" />
      </el-tab-pane>
    </el-tabs>

    <span slot="footer">
      <el-button v-if="!isDetail" type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { CalTeamApi } from '@/api/mes/cal/team'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import CalTeamMemberList from './CalTeamMemberList.vue'

const MES_CAL_CALENDAR_TYPE = 'mes_cal_calendar_type'

export default {
  name: 'CalTeamForm',
  components: { CalTeamMemberList },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formType: '',
      activeTab: 'member',
      formData: this.getDefaultForm(),
      calendarTypeOptions: getIntDictOptions(MES_CAL_CALENDAR_TYPE),
      formRules: {
        code: [
          { required: true, message: '班组编码不能为空', trigger: 'blur' },
          { max: 64, message: '班组编码不能超过 64 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '班组名称不能为空', trigger: 'blur' },
          { max: 100, message: '班组名称不能超过 100 个字符', trigger: 'blur' }
        ],
        calendarType: [{ required: true, message: '班组类型不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isDetail() {
      return this.formType === 'detail'
    },
    dialogTitle() {
      return { create: '新增班组', update: '编辑班组', detail: '班组详情' }[this.formType] || this.formType
    }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, code: undefined, name: undefined, calendarType: undefined, remark: undefined }
    },
    async generateCode() {
      const response = await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.CAL_TEAM_CODE)
      this.formData.code = response.data
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.activeTab = 'member'
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await CalTeamApi.getTeam(id)).data
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
            await CalTeamApi.createTeam(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await CalTeamApi.updateTeam(this.formData)
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

<style scoped>
.full-width { width: 100%; }
.resource-tabs { margin-top: 10px; }
</style>
