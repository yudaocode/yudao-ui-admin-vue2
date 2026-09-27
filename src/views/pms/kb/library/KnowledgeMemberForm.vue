<template>
  <el-dialog title="知识库成员" :visible.sync="dialogVisible" width="680px" append-to-body>
    <div v-loading="formLoading">
      <el-alert class="member-alert" :closable="false" type="info">
        创建人固定保留；管理员可维护知识库信息和成员，普通成员可新增内容，具体操作受内容协作权限控制。
      </el-alert>
      <!-- 成员列表 -->
      <el-table :data="memberList" border>
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.level === PmsKnowledgeLibraryMemberLevel.CREATOR"
              type="success"
            >创建人</el-tag>
            <el-select
              v-else
              v-model="scope.row.identityType"
              @change="handleIdentityTypeChange(scope.row)"
            >
              <el-option label="成员" value="user" />
              <el-option label="部门" value="dept" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="成员" min-width="260">
          <template slot-scope="scope">
            <div
              v-if="scope.row.level === PmsKnowledgeLibraryMemberLevel.CREATOR"
              class="creator-member"
            >
              <el-avatar :size="28" :src="scope.row.avatar">
                {{ (scope.row.nickname || '用户 ' + scope.row.userId).slice(0, 1) }}
              </el-avatar>
              <span>{{ scope.row.nickname || '用户 ' + scope.row.userId }}</span>
            </div>
            <user-select-v2
              v-else-if="scope.row.identityType === 'user'"
              v-model="scope.row.userId"
              :multiple="false"
              placeholder="请选择成员"
            />
            <div v-else>
              <dept-select
                v-model="scope.row.deptId"
                placeholder="请选择部门"
                style="width: 100%"
              />
              <div v-if="scope.row.deptName" class="dept-path">
                {{ scope.row.parentDeptName ? scope.row.parentDeptName + ' / ' : '' }}{{
                  scope.row.deptName
                }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="160">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.level === PmsKnowledgeLibraryMemberLevel.CREATOR"
              type="success"
            >创建人</el-tag>
            <el-select v-else v-model="scope.row.level">
              <el-option label="管理员" :value="PmsKnowledgeLibraryMemberLevel.ADMIN" />
              <el-option label="普通成员" :value="PmsKnowledgeLibraryMemberLevel.MEMBER" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.level !== PmsKnowledgeLibraryMemberLevel.CREATOR"
              type="text"
              class="danger-text"
              @click="memberList.splice(scope.$index, 1)"
            >移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button class="add-member-button" @click="addMember">添加成员</el-button>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeLibraryMemberApi from '@/api/pms/kb/library/member'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { PmsKnowledgeLibraryMemberLevel } from '@/views/pms/kb/utils/constants'

export default {
  name: 'PmsKnowledgeMemberForm',
  components: { DeptSelect, UserSelectV2 },
  data() {
    return {
      PmsKnowledgeLibraryMemberLevel,
      dialogVisible: false,
      formLoading: false,
      libraryId: 0,
      memberList: []
    }
  },
  methods: {
    open(id) {
      this.dialogVisible = true
      this.libraryId = id
      this.memberList = []
      this.formLoading = true
      return KnowledgeLibraryMemberApi.getKnowledgeLibraryMemberList(id).then(response => {
        this.memberList = response.data.map(member => Object.assign({}, member, {
          identityType: member.userId ? 'user' : 'dept'
        }))
      }).finally(() => {
        this.formLoading = false
      })
    },
    addMember() {
      this.memberList.push({
        id: 0,
        identityType: 'user',
        level: PmsKnowledgeLibraryMemberLevel.MEMBER
      })
    },
    handleIdentityTypeChange(member) {
      this.$set(member, 'userId', undefined)
      this.$set(member, 'deptId', undefined)
    },
    submitForm() {
      const editableMemberList = this.memberList.filter(
        member => member.level !== PmsKnowledgeLibraryMemberLevel.CREATOR
      )
      const missingIdentity = editableMemberList.some(member =>
        (member.identityType === 'user' && !member.userId) ||
        (member.identityType === 'dept' && !member.deptId)
      )
      if (missingIdentity) {
        this.$modal.msgWarning('请选择成员或部门')
        return Promise.resolve(false)
      }
      const userIds = editableMemberList
        .filter(member => member.identityType === 'user')
        .map(member => member.userId)
      const deptIds = editableMemberList
        .filter(member => member.identityType === 'dept')
        .map(member => member.deptId)
      if (new Set(userIds).size !== userIds.length || new Set(deptIds).size !== deptIds.length) {
        this.$modal.msgWarning('成员或部门不能重复')
        return Promise.resolve(false)
      }
      this.formLoading = true
      return KnowledgeLibraryMemberApi.updateKnowledgeLibraryMemberList({
        libraryId: this.libraryId,
        members: editableMemberList.map(member => ({
          userId: member.identityType === 'user' ? member.userId : undefined,
          deptId: member.identityType === 'dept' ? member.deptId : undefined,
          level: member.level
        }))
      }).then(() => {
        this.$modal.msgSuccess('成员更新成功')
        this.dialogVisible = false
        this.$emit('success')
        return true
      }).finally(() => {
        this.formLoading = false
      })
    }
  }
}
</script>

<style scoped>
.member-alert {
  margin-bottom: 16px;
}

.creator-member {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dept-path {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.add-member-button {
  margin-top: 12px;
}

.danger-text {
  color: #f56c6c;
}
</style>
