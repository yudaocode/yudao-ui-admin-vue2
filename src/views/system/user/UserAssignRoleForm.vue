<template>
  <el-dialog title="分配角色" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="用户名称"><el-input v-model="formData.username" disabled /></el-form-item>
      <el-form-item label="用户昵称"><el-input v-model="formData.nickname" disabled /></el-form-item>
      <el-form-item label="角色"><el-select v-model="formData.roleIds" multiple placeholder="请选择角色"><el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { getUserRoleList, assignUserRole } from '@/api/system/permission'
import { getSimpleRoleList } from '@/api/system/role'
export default {
  name: 'SystemUserAssignRoleForm',
  data() { return { dialogVisible: false, formLoading: false, formData: { id: undefined, username: '', nickname: '', roleIds: [] }, roleList: [] } },
  methods: { open(row) { this.dialogVisible = true; this.formData = { id: row.id, username: row.username, nickname: row.nickname, roleIds: [] }; this.formLoading = true; Promise.all([getUserRoleList(row.id), getSimpleRoleList()]).then(([roles, list]) => { this.formData.roleIds = roles.data; this.roleList = list.data }).finally(() => { this.formLoading = false }) }, submitForm() { this.formLoading = true; assignUserRole({ userId: this.formData.id, roleIds: this.formData.roleIds }).then(() => { this.$modal.msgSuccess('修改成功'); this.dialogVisible = false; this.$emit('success', true) }).finally(() => { this.formLoading = false }) } }
}
</script>
