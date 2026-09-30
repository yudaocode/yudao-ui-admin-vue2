<template>
  <el-dialog
    title="从后台用户批量建档"
    :visible.sync="dialogVisible"
    width="96%"
    top="4vh"
    append-to-body
  >
    <div class="user-select-row"><span>选择未建档用户</span><user-select-v2
      v-model="selectedUserIds"
      multiple
      :disabled-ids="boundUserIds"
      placeholder="请选择后台用户"
      class="user-select"
      @change="handleUserChange"
    /><span class="hint">已选择 {{ formData.employees.length }} 人，已绑定员工档案的用户不可选</span></div>
    <el-form
      ref="form"
      :model="formData"
      label-position="top"
    ><el-table
      v-loading="loading"
      :data="formData.employees"
      border
      stripe
      max-height="calc(100vh - 300px)"
      row-key="userId"
    >
      <el-table-column
        label="后台用户"
        min-width="170"
        fixed
      ><template slot-scope="scope"><div>{{ scope.row.nickname || '-' }}</div><div class="hint">{{ scope.row.username }}</div></template></el-table-column>
      <el-table-column
        label="手机号"
        min-width="170"
      ><template slot-scope="scope"><el-form-item
        :prop="'employees.' + scope.row.index + '.mobile'"
        :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]"
        class="table-form-item"
      ><el-input
        v-model="scope.row.mobile"
        placeholder="请输入手机号"
      /></el-form-item></template></el-table-column>
      <el-table-column
        label="部门"
        min-width="180"
      ><template slot-scope="scope"><dept-select v-model="scope.row.deptId" /></template></el-table-column>
      <el-table-column
        label="工号"
        min-width="150"
      ><template slot-scope="scope"><el-form-item
        :prop="'employees.' + scope.row.index + '.jobNumber'"
        :rules="[{ required: true, message: '请输入工号', trigger: 'blur' }]"
        class="table-form-item"
      ><el-input
        v-model="scope.row.jobNumber"
        maxlength="64"
        placeholder="请输入工号"
      /></el-form-item></template></el-table-column>
      <el-table-column
        label="直属上级"
        min-width="190"
      ><template slot-scope="scope"><hrm-employee-select
        v-model="scope.row.leaderEmployeeId"
        placeholder="请选择直属上级"
      /></template></el-table-column>
      <el-table-column
        label="岗位"
        min-width="170"
      ><template slot-scope="scope"><el-input
        v-model="scope.row.postName"
        maxlength="255"
        placeholder="请输入岗位"
      /></template></el-table-column>
      <el-table-column
        label="入职时间"
        min-width="190"
      ><template slot-scope="scope"><el-form-item
        :prop="'employees.' + scope.row.index + '.entryTime'"
        :rules="[{ required: true, message: '请选择入职时间', trigger: 'change' }]"
        class="table-form-item"
      ><el-date-picker
        v-model="scope.row.entryTime"
        type="datetime"
        value-format="timestamp"
        class="full-width"
        placeholder="请选择入职时间"
      /></el-form-item></template></el-table-column>
      <el-table-column
        label="聘用形式"
        min-width="130"
      ><template slot-scope="scope"><el-select
        v-model="scope.row.type"
        class="full-width"
        @change="handleTypeChange(scope.row)"
      ><el-option
        v-for="item in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_TYPE)"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></template></el-table-column>
      <el-table-column
        label="试用期/状态"
        min-width="150"
      ><template slot-scope="scope"><el-input-number
        v-if="scope.row.type === HrmEmployeeType.FORMAL"
        v-model="scope.row.probation"
        :min="0"
        :max="6"
        controls-position="right"
        class="full-width"
      /><el-select
        v-else
        v-model="scope.row.status"
        class="full-width"
        placeholder="请选择状态"
      ><el-option
        v-for="item in nonFormalStatusOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></template></el-table-column>
      <el-table-column
        label="操作"
        width="70"
        fixed="right"
      ><template slot-scope="scope"><el-button
        type="text"
        class="danger-button"
        @click="removeRow(scope.$index)"
      >移除</el-button></template></el-table-column>
    </el-table></el-form>
    <span slot="footer"><el-button
      type="primary"
      :loading="loading"
      @click="submitForm"
    >确认建档</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>
<script>
import { createEmployeeList, getBoundUserIdList } from '@/api/hrm/employee'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from './components/HrmEmployeeSelect.vue'
import { HRM_EMPLOYEE_NON_FORMAL_STATUSES, HrmEmployeeStatus, HrmEmployeeType } from '@/views/hrm/utils/constants'
export default {
  name: 'HrmEmployeeCreateFromUserForm', components: { UserSelectV2, DeptSelect, HrmEmployeeSelect },
  data() { return { DICT_TYPE, HrmEmployeeType, dialogVisible: false, loading: false, formData: { employees: [] }, selectedUserIds: [], boundUserIds: [] } },
  computed: { nonFormalStatusOptions() { return getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS).filter(item => HRM_EMPLOYEE_NON_FORMAL_STATUSES.includes(Number(item.value))) } },
  methods: {
    getIntDictOptions,
    async open() { this.dialogVisible = true; this.selectedUserIds = []; this.formData.employees = []; this.loading = true; try { const response = await getBoundUserIdList(); this.boundUserIds = response.data } finally { this.loading = false } },
    handleUserChange(value) { const users = Array.isArray(value) ? value : value ? [value] : []; const oldRows = new Map(this.formData.employees.map(row => [row.userId, row])); this.formData.employees = users.map((user, index) => { const old = oldRows.get(user.id); if (old) { old.index = index; return old } return { index, userId: user.id, username: user.username, nickname: user.nickname, mobile: user.mobile || '', jobNumber: '', deptId: user.deptId, type: HrmEmployeeType.FORMAL, probation: 0, entryTime: Date.now(), postName: '', postLevel: '', workCity: '', workAddress: '', remark: '' } }) },
    handleTypeChange(row) { if (row.type === HrmEmployeeType.FORMAL) { this.$delete(row, 'status'); if (row.probation == null) this.$set(row, 'probation', 0) } else { this.$delete(row, 'probation'); if (row.status == null) this.$set(row, 'status', HrmEmployeeStatus.INTERN) } },
    removeRow(index) { const userId = this.formData.employees[index] && this.formData.employees[index].userId; this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId); this.formData.employees.splice(index, 1); this.formData.employees.forEach((row, rowIndex) => { row.index = rowIndex }) },
    async submitForm() { if (!this.formData.employees.length) { this.$modal.msgWarning('请先选择未建档的后台用户'); return } const valid = await this.$refs.form.validate().catch(() => false); if (!valid) return; this.loading = true; try { const response = await createEmployeeList(this.formData.employees); this.$modal.msgSuccess(`已创建 ${response.data.length} 份员工档案，开通通知将在事务提交后发送`); this.dialogVisible = false; this.$emit('success') } finally { this.loading = false } }
  }
}
</script>
<style scoped>.user-select-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }.user-select { width: 520px; }.hint { color: #909399; font-size: 12px; }.table-form-item { margin-bottom: 0; }.full-width { width: 100%; }.danger-button { color: #f56c6c; }</style>
