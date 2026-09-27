<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body :title="dialogTitle" width="560px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="88px"
    >
      <el-form-item v-if="formType === 'create'" label="项目成员" prop="userIds">
        <UserSelectV2
          v-model="formData.userIds"
          :disabled-ids="existingUserIds"
          :multiple="true"
          placeholder="请选择需要加入项目的用户"
        />
      </el-form-item>
      <el-form-item v-else label="项目成员">
        <div class="flex items-center gap-8px">
          <el-avatar :size="30" :src="currentMember && currentMember.avatar">
            {{ currentMember && currentMember.nickname && currentMember.nickname.slice(0, 1) }}
          </el-avatar>
          <span>{{ currentMember && currentMember.nickname || `用户 #${currentMember && currentMember.userId}` }}</span>
        </div>
      </el-form-item>
      <el-form-item label="权限级别" prop="level">
        <el-select v-model="formData.level" style="width: 100%" placeholder="请选择权限级别">
          <el-option
            v-for="option in assignableLevelOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import * as ProjectMemberApi from '@/api/pms/pm/project/member'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { PmsProjectMemberLevel } from '@/views/pms/pm/utils/constants'
export default {
  name: 'PmsProjectMemberForm',
  components: { UserSelectV2 },
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: 'create', projectId: undefined,
      currentMember: undefined, existingUserIds: [],
      formData: { userIds: [], level: PmsProjectMemberLevel.WRITE },
      formRules: {
        userIds: [{ required: true, message: '请选择项目成员', trigger: 'change' }],
        level: [{ required: true, message: '请选择权限级别', trigger: 'change' }]
      }
    }
  },
  computed: {
    assignableLevelOptions() {
      return getIntDictOptions(DICT_TYPE.PMS_PROJECT_MEMBER_LEVEL).filter(option => option.value !== PmsProjectMemberLevel.OWNER)
    }
  },
  methods: {
    async open(type, id, projectName, memberList, member) {
      this.dialogVisible = true
      this.dialogTitle = projectName + ' - ' + (type === 'create' ? '新增成员' : '修改成员')
      this.formType = type
      this.projectId = id
      this.currentMember = member
      this.existingUserIds = memberList.map(item => item.userId)
      this.formData = { userIds: member ? [member.userId] : [], level: member ? member.level : PmsProjectMemberLevel.WRITE }
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
    },
    async submitForm() {
      if (!this.$refs.formRef || !this.projectId) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await ProjectMemberApi.updateProjectMemberList(this.projectId,
          this.formData.userIds.map(userId => ({ userId, level: this.formData.level })))
        this.$message.success(this.formType === 'create' ? '成员添加成功' : '成员修改成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally { this.formLoading = false }
    }
  }
}
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-16px { margin-bottom: 16px; }
.ml-8px { margin-left: 8px; }
.mt-4px { margin-top: 4px; }
.m-0 { margin: 0; }
.gap-8px { gap: 8px; }
.gap-12px { gap: 12px; }
.gap-16px { gap: 16px; }
.text-13px { font-size: 13px; color: #909399; }
.text-18px { font-size: 18px; }
.text-20px { font-size: 20px; }
.font-600 { font-weight: 600; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.leading-22px { line-height: 22px; }
.leading-20px { line-height: 20px; }
.delete-button { color: #f56c6c; }
</style>

