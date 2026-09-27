<!-- MES 排班管理 - 班组成员列表 -->
<template>
  <div>
    <el-button
      v-if="isEditable"
      type="primary"
      plain
      size="small"
      icon="el-icon-plus"
      class="member-add"
      @click="openForm"
    >添加成员</el-button>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" border>
      <el-table-column label="用户编号" align="center" prop="userId" width="100" />
      <el-table-column label="用户昵称" align="center" prop="nickname" min-width="120" />
      <el-table-column label="手机号" align="center" prop="telephone" min-width="120" />
      <el-table-column label="备注" align="center" prop="remark" min-width="150" />
      <el-table-column v-if="isEditable" label="操作" align="center" width="80">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="添加成员" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户" prop="userId">
          <el-select v-model="formData.userId" placeholder="请选择用户" filterable class="full-width">
            <el-option v-for="user in userList" :key="user.id" :label="user.nickname" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { CalTeamMemberApi } from '@/api/mes/cal/team/member'
import { getSimpleUserList } from '@/api/system/user'

export default {
  name: 'CalTeamMemberList',
  props: {
    teamId: { type: Number, default: undefined },
    formType: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      formLoading: false,
      userList: [],
      formData: this.getDefaultForm(),
      formRules: {
        userId: [{ required: true, message: '用户不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEditable() {
      return ['create', 'update'].includes(this.formType)
    }
  },
  watch: {
    teamId: {
      immediate: true,
      handler(value) {
        if (value) this.getList()
      }
    }
  },
  methods: {
    getDefaultForm() {
      return { teamId: this.teamId, userId: undefined, remark: undefined }
    },
    async getList() {
      this.loading = true
      try {
        const response = await CalTeamMemberApi.getTeamMemberListByTeam(this.teamId)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除班组成员？')
        await CalTeamMemberApi.deleteTeamMember(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async openForm() {
      this.dialogVisible = true
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
      const response = await getSimpleUserList()
      this.userList = response.data
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          await CalTeamMemberApi.createTeamMember(this.formData)
          this.$modal.msgSuccess('添加成功')
          this.dialogVisible = false
          await this.getList()
        } finally {
          this.formLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.member-add { margin-bottom: 10px; }
.full-width { width: 100%; }
</style>
