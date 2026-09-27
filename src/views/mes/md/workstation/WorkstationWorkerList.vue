<template>
  <div><el-button
         v-if="!isDetail"
         type="primary"
         plain
         size="small"
         class="mb10"
         icon="el-icon-plus"
         @click="openForm('create')"
       >添加人员</el-button>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      border
    ><el-table-column
      label="岗位编号"
      align="center"
      prop="postId"
    /><el-table-column
      label="岗位名称"
      align="center"
      prop="postName"
    /><el-table-column
      label="数量"
      align="center"
      prop="quantity"
      width="100"
    /><el-table-column
      label="备注"
      align="center"
      prop="remark"
    /><el-table-column
      v-if="!isDetail"
      label="操作"
      align="center"
      width="120"
    ><template v-slot="scope"><el-button
      type="text"
      @click="openForm('update', scope.row)"
    >编辑</el-button><el-button
      type="text"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      append-to-body
    ><el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    ><el-form-item
      label="岗位"
      prop="postId"
    ><el-select
      v-model="formData.postId"
      placeholder="请选择岗位"
      class="full-width"
    ><el-option
      v-for="post in postList"
      :key="post.id"
      :label="post.name"
      :value="post.id"
    /></el-select></el-form-item><el-form-item
      label="数量"
      prop="quantity"
    ><el-input-number
      v-model="formData.quantity"
      :min="1"
      controls-position="right"
      class="full-width"
    /></el-form-item><el-form-item
      label="备注"
      prop="remark"
    ><el-input
      v-model="formData.remark"
      type="textarea"
      placeholder="请输入备注"
    /></el-form-item></el-form><span slot="footer"><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span></el-dialog>
  </div>
</template>
<script>
import { MdWorkstationWorkerApi } from '@/api/mes/md/workstation/worker'
import { getSimplePostList } from '@/api/system/post'
export default { name: 'WorkstationWorkerList', props: { workstationId: { type: Number, required: true }, formType: { type: String, required: true }}, data() { return { loading: false, list: [], postList: [], dialogVisible: false, dialogTitle: '', dialogFormType: '', formLoading: false, formData: this.getDefaultForm(), formRules: { postId: [{ required: true, message: '岗位不能为空', trigger: 'change' }], quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }] }} }, computed: { isDetail() { return this.formType === 'detail' } }, watch: { workstationId: { immediate: true, handler(value) { if (value) this.getList() } }}, methods: { getDefaultForm() { return { id: undefined, workstationId: this.workstationId, postId: undefined, quantity: 1, remark: undefined } }, async getList() { this.loading = true; try { this.list = (await MdWorkstationWorkerApi.getWorkstationWorkerList(this.workstationId)).data } finally { this.loading = false } }, async openForm(type, row) { this.dialogVisible = true; this.dialogTitle = type === 'create' ? '新增人力资源' : '修改人力资源'; this.dialogFormType = type; this.formData = row ? { ...row } : this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate()); const response = await getSimplePostList(); this.postList = response.data }, submitForm() { this.$refs.form.validate(async valid => { if (!valid) return; this.formLoading = true; try { if (this.dialogFormType === 'create') { await MdWorkstationWorkerApi.createWorkstationWorker(this.formData); this.$modal.msgSuccess('新增成功') } else { await MdWorkstationWorkerApi.updateWorkstationWorker(this.formData); this.$modal.msgSuccess('修改成功') } this.dialogVisible = false; await this.getList() } finally { this.formLoading = false } }) }, async handleDelete(id) { try { await this.$modal.confirm('是否确认删除人力资源？'); await MdWorkstationWorkerApi.deleteWorkstationWorker(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } } }}
</script>
<style scoped>.mb10 { margin-bottom: 10px; }.full-width { width: 100%; }</style>
