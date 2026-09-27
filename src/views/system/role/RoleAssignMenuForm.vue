<template>
  <el-dialog title="菜单权限" :visible.sync="dialogVisible" width="620px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="角色名称"><el-tag>{{ formData.name }}</el-tag></el-form-item>
      <el-form-item label="角色标识"><el-tag>{{ formData.code }}</el-tag></el-form-item>
      <el-form-item label="菜单权限"><el-card shadow="never"><div slot="header">全选/全不选 <el-switch v-model="treeNodeAll" @change="handleCheckedTreeNodeAll" /> 全部展开/折叠 <el-switch v-model="menuExpand" @change="handleCheckedTreeExpand" /></div><el-tree ref="tree" :data="menuOptions" :props="defaultProps" node-key="id" show-checkbox default-expand-all /></el-card></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { getSimpleMenusList } from '@/api/system/menu'
import { getRoleMenuList, assignRoleMenu } from '@/api/system/permission'
export default {
  name: 'SystemRoleAssignMenuForm',
  data() { return { dialogVisible: false, formLoading: false, formData: { id: undefined, name: '', code: '', menuIds: [] }, menuOptions: [], menuExpand: false, treeNodeAll: false, defaultProps: { label: 'name', children: 'children' } } },
  methods: { open(row) { this.dialogVisible = true; this.formData = { id: row.id, name: row.name, code: row.code, menuIds: [] }; this.treeNodeAll = false; this.formLoading = true; Promise.all([getSimpleMenusList(), getRoleMenuList(row.id)]).then(([menus, selected]) => { this.menuOptions = this.handleTree(menus.data, 'id'); this.formData.menuIds = selected.data; this.$nextTick(() => { if (this.$refs.tree) this.formData.menuIds.forEach(menuId => { this.$refs.tree.setChecked(menuId, true, false) }) }) }).finally(() => { this.formLoading = false }) }, handleCheckedTreeNodeAll(value) { if (this.$refs.tree) this.$refs.tree.setCheckedNodes(value ? this.menuOptions : []) }, handleCheckedTreeExpand(value) { const nodes = this.$refs.tree && this.$refs.tree.store.nodesMap; if (!nodes) return; Object.keys(nodes).forEach(key => { nodes[key].expanded = value }) }, submitForm() { const menuIds = this.$refs.tree ? this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys()) : []; this.formLoading = true; assignRoleMenu({ roleId: this.formData.id, menuIds }).then(() => { this.$modal.msgSuccess('修改成功'); this.dialogVisible = false; this.$emit('success') }).finally(() => { this.formLoading = false }) } }
}
</script>
