<template>
  <Dialog v-model="dialogVisible" title="共享设置" width="850px">
    <!-- 列表操作 -->
    <div class="permission-toolbar">
      <el-button type="primary" plain size="small" icon="el-icon-plus" :disabled="loading" @click="openForm('create')">
        新增
      </el-button>
    </div>
    <!-- 共享权限列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="类型" width="80">
        <template slot-scope="scope">
          {{ getDictLabel(DICT_TYPE.OA_FILE_SUBJECT_TYPE, scope.row.subjectType) }}
        </template>
      </el-table-column>
      <el-table-column label="共享对象" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">{{ getSubjectName(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="权限" width="90">
        <template slot-scope="scope">
          {{ getDictLabel(DICT_TYPE.OA_FILE_PERMISSION_LEVEL, scope.row.level) }}
        </template>
      </el-table-column>
      <el-table-column label="继承" width="70">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.inherit" />
        </template>
      </el-table-column>
      <el-table-column label="到期时间" prop="expireTime" :formatter="dateFormatter" width="165" />
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button :disabled="loading" type="text" size="mini" @click="openForm('update', scope.row)">
            修改
          </el-button>
          <el-button :disabled="loading" type="text" size="mini" class="danger-text" @click="handleDelete(scope.row.id)">
            取消共享
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>

    <!-- 新增、修改共享权限 -->
    <oa-file-permission-form ref="form" @success="handleSuccess" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as PermissionApi from '@/api/oa/file/permission'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { OA_FILE_SUBJECT_TYPE } from '@/views/oa/utils/constants'
import OaFilePermissionForm from './OaFilePermissionForm.vue'

export default {
  name: 'OaFilePermissionList',
  components: { Dialog, OaFilePermissionForm },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      loading: false, // 列表加载中
      nodeId: 0, // 文件节点编号
      list: [], // 共享权限列表
      userList: [], // 用户列表
      deptList: [], // 部门列表
      DICT_TYPE
    }
  },
  methods: {
    dateFormatter,
    getDictLabel,
    /** 打开弹窗 */
    open(id) {
      this.dialogVisible = true
      this.nodeId = id
      this.list = []
      this.loading = true
      return Promise.all([
        PermissionApi.getFilePermissionList(id),
        UserApi.getSimpleUserList(),
        DeptApi.getSimpleDeptList()
      ]).then(([permissions, users, depts]) => {
        this.list = permissions.data
        this.userList = users.data
        this.deptList = depts.data
      }).finally(() => {
        this.loading = false
      })
    },
    /** 查询共享权限列表 */
    getList() {
      this.loading = true
      return PermissionApi.getFilePermissionList(this.nodeId).then(response => {
        this.list = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    /** 获得共享对象名称 */
    getSubjectName(row) {
      return row.subjectType === OA_FILE_SUBJECT_TYPE.USER
        ? (this.userList.find(item => item.id === row.subjectId) || {}).nickname
        : (this.deptList.find(item => item.id === row.subjectId) || {}).name
    },
    /** 打开新增、修改表单 */
    openForm(type, row) {
      this.$refs.form.open(type, this.nodeId, row)
    },
    /** 共享变更后刷新列表 */
    handleSuccess() {
      return this.getList().then(() => {
        this.$emit('success')
      })
    },
    /** 取消共享 */
    handleDelete(id) {
      return this.$modal.confirm('是否取消该共享权限？').then(() => {
        this.loading = true
        return PermissionApi.deleteFilePermission(id)
      }).then(() => {
        this.$modal.msgSuccess('取消成功')
        return this.handleSuccess()
      }).catch(() => {}).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.permission-toolbar {
  margin-bottom: 16px;
}
.danger-text {
  color: #f56c6c;
}
</style>
