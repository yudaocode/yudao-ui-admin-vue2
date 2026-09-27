<!-- MES 点检保养方案-设备清单 -->
<template>
  <div>
    <el-button v-if="isUpdate" type="primary" plain size="small" icon="el-icon-plus" class="operation-button" @click="openForm">添加设备</el-button>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" border>
      <el-table-column label="设备编码" align="center" prop="machineryCode" min-width="120" />
      <el-table-column label="设备名称" align="center" prop="machineryName" min-width="150" />
      <el-table-column label="品牌" align="center" prop="machineryBrand" min-width="100" />
      <el-table-column label="规格型号" align="center" prop="machinerySpecification" min-width="120" />
      <el-table-column label="备注" align="center" prop="remark" min-width="120" />
      <el-table-column v-if="isUpdate" label="操作" align="center" width="80"><template v-slot="scope"><el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="新增设备" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="formData.machineryId" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { DvCheckPlanMachineryApi } from '@/api/mes/dv/checkplan/machinery'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'

export default {
  name: 'CheckPlanMachineryList',
  components: { DvMachinerySelect },
  props: { planId: { type: Number, required: true }, formType: { type: String, required: true }},
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      formLoading: false,
      formData: this.getDefaultForm(),
      formRules: { machineryId: [{ required: true, message: '设备不能为空', trigger: 'blur' }] }
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
      return { id: undefined, planId: this.planId, machineryId: undefined, remark: undefined }
    },
    async getList() {
      this.loading = true
      try {
        const response = await DvCheckPlanMachineryApi.getListByPlan(this.planId)
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
          await DvCheckPlanMachineryApi.create(this.formData)
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
        await this.$modal.confirm('是否确认删除该设备？')
        await DvCheckPlanMachineryApi.delete(id)
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
