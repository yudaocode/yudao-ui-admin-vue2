<template>
  <el-dialog title="账套授权" :visible.sync="visible" width="820px" append-to-body>
    <el-alert :closable="false" type="info" show-icon title="查看者可以查看账套数据，会计可以维护账套数据，主管可以管理账套及成员" />
    <div class="member-head"><span>账套名称：<strong>{{ accountSet && accountSet.companyName }}</strong></span><el-button type="primary" size="mini" @click="openAddForm">添加成员</el-button></div>
    <el-table v-loading="loading" :data="memberList" border max-height="420">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column label="姓名" min-width="140"><template slot-scope="scope">{{ scope.row.nickname || ('用户 #' + scope.row.userId) }}<el-tag v-if="scope.row.founder" size="mini" type="success">创建人</el-tag></template></el-table-column>
      <el-table-column prop="deptName" label="部门" min-width="140" />
      <el-table-column prop="mobile" label="手机号码" width="140" />
      <el-table-column label="状态" width="90"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="权限级别" width="140"><template slot-scope="scope"><dict-tag v-if="scope.row.founder" :type="DICT_TYPE.FMS_ACCOUNT_USER_LEVEL" :value="scope.row.level" /><el-select v-else v-model="scope.row.level" size="mini"><el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></template></el-table-column>
      <el-table-column label="操作" width="90"><template slot-scope="scope"><el-button type="text" :disabled="scope.row.founder" @click="memberList.splice(scope.$index, 1)">移出</el-button></template></el-table-column>
    </el-table>
    <div slot="footer"><el-button type="primary" :loading="loading" @click="submit">确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
    <el-dialog title="添加成员" :visible.sync="addVisible" width="560px" append-to-body>
      <el-form ref="addForm" :model="addData" :rules="addRules" label-width="88px"><el-form-item label="选择用户" prop="userIds"><UserSelectV2 v-model="addData.userIds" multiple :disabled-ids="memberUserIds" @change="handleUsers" /></el-form-item><el-form-item label="权限级别" prop="level"><el-select v-model="addData.level" class="width-full"><el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-form>
      <div slot="footer"><el-button type="primary" @click="submitAdd">确 定</el-button><el-button @click="addVisible = false">取 消</el-button></div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { getAccountUserList, updateAccountUserList } from '@/api/fms/config/account-user'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
export default {
  name: 'FmsAccountSetMemberForm', components: { UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      visible: false,
      addVisible: false,
      loading: false,
      accountSet: null,
      memberList: [],
      addData: { userIds: [], level: undefined },
      addUsers: [],
      addRules: {
        userIds: [{ required: true, message: '请选择需要添加的用户', trigger: 'change' }],
        level: [{ required: true, message: '请选择权限级别', trigger: 'change' }]
      }
    }
  },
  computed: {
    memberUserIds() { return this.memberList.map(item => item.userId) },
    levelOptions() { return getIntDictOptions(DICT_TYPE.FMS_ACCOUNT_USER_LEVEL) }
  },
  methods: {
    open(row) { this.accountSet = row; this.visible = true; this.loading = true; return getAccountUserList(row.id).then(response => { this.memberList = response.data }).finally(() => { this.loading = false }) },
    submit() { if (!this.accountSet) return; this.loading = true; updateAccountUserList({ accountSetId: this.accountSet.id, members: this.memberList.map(item => ({ userId: item.userId, level: item.level })) }).then(() => { this.$modal.msgSuccess('账套授权已保存'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false }) },
    openAddForm() { this.addData = { userIds: [], level: undefined }; this.addUsers = []; this.addVisible = true; this.$nextTick(() => { this.$refs.addForm.resetFields() }) },
    handleUsers(users) { this.addUsers = Array.isArray(users) ? users : (users ? [users] : []) },
    submitAdd() { this.$refs.addForm.validate(valid => { if (!valid) return; this.addUsers.forEach(user => { this.memberList.push({ userId: user.id, nickname: user.nickname, deptName: user.deptName, mobile: user.mobile, status: 0, founder: false, level: this.addData.level }) }); this.addVisible = false }) }
  }
}
</script>
<style scoped>.member-head{display:flex;justify-content:space-between;align-items:center;margin:16px 0 12px}.width-full{width:100%}</style>
