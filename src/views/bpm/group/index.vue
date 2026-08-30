<template>
  <div class="app-container">
    <doc-alert title="工作流" url="https://doc.iocoder.cn/bpm" />

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="组名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入组名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['bpm:user-group:create']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="组名" align="center" prop="name" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="成员" align="center">
        <template v-slot="scope">
          <span v-for="userId in scope.row.userIds" :key="userId">
            {{ getUserNickname(userId) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['bpm:user-group:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['bpm:user-group:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 表单弹窗：添加/修改。成员加载与 userIds 规范化由子表单统一负责。 -->
    <UserGroupForm ref="userGroupForm" @success="getList" />
  </div>
</template>

<script>
import { deleteUserGroup, getUserGroupPage } from '@/api/bpm/userGroup'
import { getSimpleUserList } from '@/api/system/user'
import UserGroupForm from './UserGroupForm.vue'

export default {
  name: 'BpmUserGroup',
  components: {
    UserGroupForm
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户组列表
      list: [],
      // 用户列表
      users: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        status: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
    // 获得用户列表
    getSimpleUserList().then(response => {
      const data = response && response.data !== undefined ? response.data : response
      this.users = Array.isArray(data) ? data : []
    }).catch(() => {
      this.users = []
    })
  },
  methods: {
    /** 查询列表 */
    async getList() {
      this.loading = true
      try {
        const response = await getUserGroupPage(this.queryParams)
        const data = response && response.data ? response.data : {}
        this.list = data.list || []
        this.total = data.total || 0
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.openForm('create')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.openForm('update', row && row.id)
    },
    /** 打开可复用的添加/修改表单 */
    openForm(type, id) {
      const form = this.$refs.userGroupForm
      if (form && form.open) {
        form.open(type, id)
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除用户组编号为"' + id + '"的数据项?').then(function() {
        return deleteUserGroup(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    getUserNickname(userId) {
      for (const user of this.users) {
        if (String(user.id) === String(userId)) {
          return user.nickname
        }
      }
      return '未知(' + userId + ')'
    }
  }
}
</script>
