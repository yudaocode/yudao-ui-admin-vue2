<template>
  <el-dialog
    title="人员选择"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
    @closed="resetForm"
  >
    <el-row :gutter="16" v-loading="formLoading">
      <el-col :span="6">
        <el-card
          shadow="never"
          :body-style="{ padding: '10px' }"
          style="height: 360px; overflow: auto"
        >
          <el-tree
            :data="deptTree"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-transfer
          v-model="selectedUserIdList"
          filterable
          filter-placeholder="搜索成员"
          :titles="['未选', '已选']"
          :data="transferUserList"
          :props="{ key: 'id', label: 'label' }"
        />
      </el-col>
    </el-row>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        :disabled="formLoading || selectedUserIdList.length === 0"
        @click="submitForm"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listSimpleDepts } from '@/api/system/dept'
import { listSimpleUsers } from '@/api/system/user'
import { handleTree } from '@/utils/ruoyi'

export default {
  name: 'UserSelectForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      activityId: undefined,
      deptTree: [],
      deptList: [],
      userList: [],
      filteredUserList: [],
      selectedUserIdList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    transferUserList() {
      const selectedIdSet = new Set(this.selectedUserIdList.map((id) => String(id)))
      const selectedUsers = this.userList.filter((user) => selectedIdSet.has(String(user.id)))
      const filteredUnselectedUsers = this.filteredUserList.filter((user) => !selectedIdSet.has(String(user.id)))
      const merged = selectedUsers.concat(filteredUnselectedUsers)
      const userMap = new Map()
      merged.forEach((user) => {
        userMap.set(String(user.id), {
          ...user,
          label: this.userName(user)
        })
      })
      return Array.from(userMap.values())
    }
  },
  methods: {
    async open(activityId, selectedList) {
      this.activityId = activityId
      this.resetForm()
      this.formLoading = true
      try {
        const [deptResp, userResp] = await Promise.all([
          listSimpleDepts(),
          listSimpleUsers()
        ])
        this.deptList = deptResp.data || []
        this.deptTree = handleTree(this.deptList, 'id')
        this.userList = userResp.data || []
        this.filteredUserList = this.userList.slice()
        this.selectedUserIdList = (selectedList || [])
          .map((item) => (item && typeof item === 'object' ? item.id : item))
          .filter((id) => id !== undefined && id !== null)
        this.dialogVisible = true
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.deptTree = []
      this.deptList = []
      this.userList = []
      this.filteredUserList = []
      this.selectedUserIdList = []
    },
    handleNodeClick(node) {
      this.filterUserList(node && node.id)
    },
    filterUserList(deptId) {
      if (!deptId) {
        this.filteredUserList = this.userList.slice()
        return
      }
      const deptIds = this.getChildDeptIds(deptId)
      this.filteredUserList = this.userList.filter((user) => deptIds.includes(user.deptId))
    },
    getChildDeptIds(deptId) {
      const ids = [deptId]
      this.deptList
        .filter((dept) => dept.parentId === deptId)
        .forEach((dept) => {
          ids.push(...this.getChildDeptIds(dept.id))
        })
      return ids
    },
    submitForm() {
      const selectedIdSet = new Set(this.selectedUserIdList.map((id) => String(id)))
      const selectedUsers = this.userList.filter((user) => selectedIdSet.has(String(user.id)))
      this.dialogVisible = false
      this.$emit('confirm', this.activityId, selectedUsers)
    },
    userName(user) {
      return user ? (user.nickname || user.name || user.username || user.id || '-') : '-'
    }
  }
}
</script>
