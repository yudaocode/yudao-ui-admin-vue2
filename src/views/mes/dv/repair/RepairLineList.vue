<!-- MES 维修工单行列表 -->
<template>
  <div>
    <el-button v-if="!disabled" type="primary" plain icon="el-icon-plus" class="operation-button" @click="openForm('create')">添加明细</el-button>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="项目名称" align="center" prop="subjectName" /><el-table-column label="故障描述" align="center" prop="malfunction" /><el-table-column label="故障图片" align="center" prop="malfunctionUrl" />
      <el-table-column label="维修描述" align="center" prop="description" /><el-table-column label="项目内容" align="center" prop="subjectContent" /><el-table-column label="标准" align="center" prop="subjectStandard" />
      <el-table-column v-if="!disabled" label="操作" align="center" width="130"><template v-slot="scope"><el-button type="text" size="mini" @click="openForm('update', scope.row)">编辑</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="项目" prop="subjectId"><el-select v-model="formData.subjectId" filterable remote reserve-keyword placeholder="请输入项目名称搜索" :remote-method="getSubjectOptions"><el-option v-for="item in subjectOptions" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="故障描述" prop="malfunction"><el-input v-model="formData.malfunction" type="textarea" placeholder="请输入故障描述" /></el-form-item>
        <el-form-item label="故障图片" prop="malfunctionUrl"><el-input v-model="formData.malfunctionUrl" placeholder="请输入故障图片 URL" /></el-form-item>
        <el-form-item label="维修描述" prop="description"><el-input v-model="formData.description" type="textarea" placeholder="请输入维修描述" /></el-form-item>
        <el-form-item label="备注" prop="remark"><el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { DvRepairLineApi } from '@/api/mes/dv/repair/line'
import { DvSubjectApi } from '@/api/mes/dv/subject'
export default {
  name: 'RepairLineList',
  props: { repairId: { type: Number, required: true }, disabled: { type: Boolean, default: false }},
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, repairId: this.repairId },
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      lineFormType: '',
      subjectOptions: [],
      formData: {},
      formRules: { malfunction: [{ required: true, message: '故障描述不能为空', trigger: 'blur' }] }
    }
  },
  watch: {
    repairId: {
      immediate: true,
      handler(value) {
        if (value) {
          this.queryParams.repairId = value
          this.getList()
        }
      }
    }
  },
  methods: {
    async getList() { this.loading = true; try { const response = await DvRepairLineApi.getRepairLinePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该维修明细？'); await DvRepairLineApi.deleteRepairLine(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除时保持列表 */ } },
    async getSubjectOptions(query) { try { const response = await DvSubjectApi.getSubjectPage({ name: query, pageNo: 1, pageSize: 20 }); this.subjectOptions = response.data.list } catch (error) { /* 查询失败时保留原选项 */ } },
    async openForm(type, row) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '添加明细' : '编辑明细'; this.lineFormType = type; if (type === 'create') { this.formData = { repairId: this.repairId, subjectId: undefined, malfunction: '', malfunctionUrl: '', description: '', remark: '' } } else { this.formData = { ...row }; if (row.subjectId) { const response = await DvSubjectApi.getSubject(row.subjectId); if (response.data) this.subjectOptions = [response.data] } } this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.lineFormType === 'create') { await DvRepairLineApi.createRepairLine(this.formData); this.$modal.msgSuccess('新增成功') } else { await DvRepairLineApi.updateRepairLine(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; await this.getList() } finally { this.formLoading = false } }) }
  }
}
</script>

<style scoped>.operation-button { margin-bottom: 10px; }</style>
