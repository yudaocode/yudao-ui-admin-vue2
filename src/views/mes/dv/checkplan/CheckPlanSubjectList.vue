<!-- MES 点检保养方案-项目清单 -->
<template>
  <div>
    <el-button v-if="isUpdate" type="primary" plain size="small" icon="el-icon-plus" class="operation-button" @click="openForm">添加项目</el-button>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" border>
      <el-table-column label="项目编码" align="center" prop="subjectCode" min-width="120" />
      <el-table-column label="项目名称" align="center" prop="subjectName" min-width="150" />
      <el-table-column label="项目类型" align="center" prop="subjectType" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_SUBJECT_TYPE" :value="scope.row.subjectType" /></template></el-table-column>
      <el-table-column label="项目内容" align="center" prop="subjectContent" min-width="150" />
      <el-table-column label="标准" align="center" prop="subjectStandard" min-width="120" />
      <el-table-column v-if="isUpdate" label="操作" align="center" width="80"><template v-slot="scope"><el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="新增项目" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="项目" prop="subjectId"><dv-subject-select v-model="formData.subjectId" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { DvCheckPlanSubjectApi } from '@/api/mes/dv/checkplan/subject'
import DvSubjectSelect from '@/views/mes/dv/subject/components/DvSubjectSelect.vue'

const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'

export default {
  name: 'CheckPlanSubjectList',
  components: { DvSubjectSelect },
  props: { planId: { type: Number, required: true }, formType: { type: String, required: true }},
  data() {
    return {
      MES_DV_SUBJECT_TYPE,
      loading: false,
      list: [],
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultForm(),
      formRules: { subjectId: [{ required: true, message: '项目不能为空', trigger: 'blur' }] }
    }
  },
  computed: {
    isUpdate() {
      return ['create', 'update'].includes(this.formType)
    }
  },
  watch: {
    planId: { immediate: true, handler(value) { if (value) this.getList() } }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, planId: this.planId, subjectId: undefined, remark: undefined }
    },
    async getList() {
      this.loading = true
      try {
        const response = await DvCheckPlanSubjectApi.getListByPlan(this.planId)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    openForm() {
      this.dialogVisible = true
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          await DvCheckPlanSubjectApi.create(this.formData)
          this.$modal.msgSuccess('新增成功')
          this.dialogVisible = false
          await this.getList()
        } finally {
          this.formLoading = false
        }
      })
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除该项目？')
        await DvCheckPlanSubjectApi.delete(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持列表
      }
    }
  }
}
</script>

<style scoped>.operation-button { margin-bottom: 10px; }</style>
