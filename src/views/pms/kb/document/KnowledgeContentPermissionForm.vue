<template>
  <el-dialog title="内容协作权限" :visible.sync="dialogVisible" width="820px" append-to-body>
    <div v-loading="formLoading">
      <el-alert :closable="false" class="permission-alert" type="info">
        子文件夹和子文档默认继承同一套权限；知识库创建人和管理员始终拥有管理权限。
      </el-alert>
      <el-form label-width="100px">
        <el-form-item label="访问范围">
          <el-radio-group v-model="formData.openStatus">
            <el-radio-button :label="true">知识库内公开</el-radio-button>
            <el-radio-button :label="false">仅协作者可见</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.openStatus" label="公开权限">
          <el-select v-model="formData.openLevel" style="width: 280px">
            <el-option
              v-for="option in contentLevelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="member-toolbar">
        <span>协作者</span>
        <el-button @click="addMember">添加协作者</el-button>
      </div>
      <el-table :data="memberList" border>
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ownerStatus" type="success">拥有者</el-tag>
            <el-select
              v-else
              v-model="scope.row.identityType"
              @change="handleIdentityTypeChange(scope.row)"
            >
              <el-option label="成员" :value="PmsKnowledgeContentIdentityType.USER" />
              <el-option label="部门" :value="PmsKnowledgeContentIdentityType.DEPT" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="协作者" min-width="250">
          <template slot-scope="scope">
            <span v-if="scope.row.ownerStatus">{{ scope.row.userName }}</span>
            <user-select-v2
              v-else-if="
                scope.row.identityType === PmsKnowledgeContentIdentityType.USER &&
                  libraryOpenStatus
              "
              v-model="scope.row.userId"
              :multiple="false"
              placeholder="请选择成员"
            />
            <el-select
              v-else-if="scope.row.identityType === PmsKnowledgeContentIdentityType.USER"
              v-model="scope.row.userId"
              filterable
              placeholder="请选择知识库成员"
              style="width: 100%"
            >
              <el-option
                v-for="member in availableUserMembers"
                :key="member.userId"
                :label="member.nickname || '用户 ' + member.userId"
                :value="member.userId"
              />
            </el-select>
            <dept-select
              v-else-if="libraryOpenStatus"
              v-model="scope.row.deptId"
              placeholder="请选择部门"
              style="width: 100%"
            />
            <el-select
              v-else
              v-model="scope.row.deptId"
              filterable
              placeholder="请选择知识库部门"
              style="width: 100%"
            >
              <el-option
                v-for="member in availableDeptMembers"
                :key="member.deptId"
                :label="member.deptName || '部门 ' + member.deptId"
                :value="member.deptId"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="170">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ownerStatus" type="success">管理员</el-tag>
            <el-select v-else v-model="scope.row.level">
              <el-option
                v-for="option in contentLevelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template slot-scope="scope">
            <el-button
              v-if="!scope.row.ownerStatus"
              class="danger-text"
              type="text"
              @click="memberList.splice(scope.$index, 1)"
            >移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeContentPermissionApi from '@/api/pms/kb/content/permission'
import * as KnowledgeLibraryApi from '@/api/pms/kb/library'
import * as KnowledgeLibraryMemberApi from '@/api/pms/kb/library/member'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import {
  PmsKnowledgeContentIdentityType,
  PmsKnowledgeContentLevel
} from '@/views/pms/kb/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function getDefaultFormData() {
  return {
    id: 0,
    libraryId: 0,
    openStatus: true,
    openLevel: PmsKnowledgeContentLevel.PREVIEW,
    creatorUserId: 0,
    currentUserLevel: 0,
    members: []
  }
}

export default {
  name: 'PmsKnowledgeContentPermissionForm',
  components: { DeptSelect, UserSelectV2 },
  data() {
    return {
      PmsKnowledgeContentIdentityType,
      dialogVisible: false,
      formLoading: false,
      creatorUserId: 0,
      libraryOpenStatus: true,
      libraryMembers: [],
      formData: getDefaultFormData(),
      memberList: []
    }
  },
  computed: {
    contentLevelOptions() {
      return getIntDictOptions(DICT_TYPE.PMS_KNOWLEDGE_CONTENT_LEVEL)
    },
    availableUserMembers() {
      return this.libraryMembers.filter(member =>
        member.userId !== undefined && member.userId !== this.creatorUserId
      )
    },
    availableDeptMembers() {
      return this.libraryMembers.filter(member => member.deptId !== undefined)
    }
  },
  methods: {
    async open(permissionId) {
      this.dialogVisible = true
      this.formLoading = true
      try {
        const permissionResponse = await KnowledgeContentPermissionApi
          .getKnowledgeContentPermission(permissionId)
        const data = permissionResponse.data
        const responses = await Promise.all([
          KnowledgeLibraryApi.getKnowledgeLibrary(data.libraryId),
          KnowledgeLibraryMemberApi.getKnowledgeLibraryMemberList(data.libraryId)
        ])
        this.formData = Object.assign(getDefaultFormData(), data)
        this.creatorUserId = data.creatorUserId
        this.libraryOpenStatus = responses[0].data.openStatus
        this.libraryMembers = responses[1].data
        this.memberList = data.members.map(member => Object.assign({}, member, {
          identityType: member.userId
            ? PmsKnowledgeContentIdentityType.USER
            : PmsKnowledgeContentIdentityType.DEPT,
          ownerStatus: member.userId === data.creatorUserId
        }))
      } finally {
        this.formLoading = false
      }
    },
    addMember() {
      this.memberList.push({
        identityType: PmsKnowledgeContentIdentityType.USER,
        level: PmsKnowledgeContentLevel.PREVIEW
      })
    },
    handleIdentityTypeChange(member) {
      this.$set(member, 'userId', undefined)
      this.$set(member, 'deptId', undefined)
    },
    submitForm() {
      const editableMembers = this.memberList.filter(member => !member.ownerStatus)
      const missingIdentity = editableMembers.some(member =>
        (member.identityType === PmsKnowledgeContentIdentityType.USER && !member.userId) ||
        (member.identityType === PmsKnowledgeContentIdentityType.DEPT && !member.deptId)
      )
      if (missingIdentity) {
        this.$modal.msgWarning('请选择协作成员或部门')
        return Promise.resolve(false)
      }
      const userIds = editableMembers
        .filter(member => member.identityType === PmsKnowledgeContentIdentityType.USER)
        .map(member => member.userId)
      const deptIds = editableMembers
        .filter(member => member.identityType === PmsKnowledgeContentIdentityType.DEPT)
        .map(member => member.deptId)
      if (new Set(userIds).size !== userIds.length || new Set(deptIds).size !== deptIds.length) {
        this.$modal.msgWarning('协作成员或部门不能重复')
        return Promise.resolve(false)
      }
      this.formLoading = true
      const payload = Object.assign({}, this.formData, {
        members: editableMembers.map(member => ({
          id: member.id,
          userId: member.identityType === PmsKnowledgeContentIdentityType.USER
            ? member.userId
            : undefined,
          deptId: member.identityType === PmsKnowledgeContentIdentityType.DEPT
            ? member.deptId
            : undefined,
          level: member.level
        }))
      })
      return KnowledgeContentPermissionApi.updateKnowledgeContentPermission(payload).then(() => {
        this.$modal.msgSuccess('协作权限更新成功')
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
.permission-alert {
  margin-bottom: 16px;
}

.member-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
}

.danger-text {
  color: #f56c6c;
}
</style>
