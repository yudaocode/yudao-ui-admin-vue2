<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="760px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="状态组名"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入状态组名"
      /></el-form-item>
      <el-form-item label="应用部门"><el-tree
        ref="deptTree"
        :data="deptList"
        node-key="id"
        show-checkbox
        :props="{ label: 'name', children: 'children' }"
      /></el-form-item>
      <el-form-item label="阶段设置"><el-table
        :data="formData.statuses.concat(DEFAULT_STATUSES)"
        border
        size="small"
      ><el-table-column
        label="阶段"
        width="70"
        align="center"
      ><template slot-scope="scope">{{ scope.row.endStatus ? '结束' : '阶段 ' + (scope.$index + 1) }}</template></el-table-column><el-table-column label="阶段名称"><template slot-scope="scope"><el-input
        v-if="!scope.row.endStatus"
        v-model="scope.row.name"
        placeholder="请输入状态名称"
      /><span v-else>{{ scope.row.name }}</span></template></el-table-column><el-table-column
        label="赢单率（%）"
        width="150"
      ><template slot-scope="scope"><el-input-number
        v-if="!scope.row.endStatus"
        v-model="scope.row.percent"
        :min="0"
        :max="100"
        :precision="2"
        controls-position="right"
      /><span v-else>{{ scope.row.percent }}</span></template></el-table-column><el-table-column
        label="操作"
        width="120"
        align="center"
      ><template slot-scope="scope"><el-button
        v-if="!scope.row.endStatus"
        type="text"
        @click="addStatus"
      >添加</el-button><el-button
        v-if="!scope.row.endStatus"
        type="text"
        :disabled="formData.statuses.length <= 1"
        @click="deleteStatus(scope.$index)"
      >删除</el-button></template></el-table-column></el-table></el-form-item>
    </el-form>
    <div slot="footer"><el-button
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as BusinessStatusApi from '@/api/crm/business/status'
import { getSimpleDeptList } from '@/api/system/dept'

export default {
  name: 'CrmBusinessStatusForm',
  data() { return { DEFAULT_STATUSES: BusinessStatusApi.DEFAULT_STATUSES, dialogVisible: false, dialogTitle: '', formLoading: false, formType: 'create', formData: this.defaultForm(), deptList: [], rules: { name: [{ required: true, message: '状态组名不能为空', trigger: 'blur' }] }} },
  methods: {
    defaultForm() { return { id: undefined, name: '', deptIds: [], statuses: [] } },
    open(type, id) {
      this.dialogVisible = true; this.formType = type || 'create'; this.dialogTitle = this.formType === 'update' ? '修改商机状态组' : '新增商机状态组'; this.formData = this.defaultForm()
      const jobs = [getSimpleDeptList().then(response => { const data = response.data; this.deptList = this.handleTree(data, 'id', 'parentId') })]
      if (id !== undefined && id !== null) { this.formLoading = true; jobs.push(BusinessStatusApi.getBusinessStatus(id).then(response => { this.formData = Object.assign(this.defaultForm(), response.data); if (!this.formData.statuses.length) this.addStatus() }).finally(() => { this.formLoading = false })) } else this.addStatus()
      return Promise.all(jobs)
    },
    addStatus() { this.formData.statuses.push({ name: '', percent: undefined }) },
    deleteStatus(index) { if (this.formData.statuses.length > 1) this.formData.statuses.splice(index, 1) },
    submitForm() { this.$refs.form.validate(valid => { if (!valid) return; this.formLoading = true; this.formData.deptIds = this.$refs.deptTree ? this.$refs.deptTree.getCheckedKeys(false) : []; const action = this.formType === 'create' ? BusinessStatusApi.createBusinessStatus : BusinessStatusApi.updateBusinessStatus; action(this.formData).then(() => { this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功'); this.dialogVisible = false; this.$emit('success') }).finally(() => { this.formLoading = false }) }) }
  }
}
</script>
