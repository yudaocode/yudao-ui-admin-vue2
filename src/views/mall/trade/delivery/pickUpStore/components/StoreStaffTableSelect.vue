<!-- TODO 芋艿：这块后续抽个独立的组件出来 -->
<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="60%"
    append-to-body
  >
    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col
        :span="4"
        :xs="24"
      >
        <div class="dept-tree-wrap">
          <DeptTreeSelect @node-click="handleDeptNodeClick" />
        </div>
      </el-col>
      <el-col
        :span="20"
        :xs="24"
      >
        <!-- 搜索 -->
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          size="small"
          label-width="68px"
        >
          <el-form-item
            label="用户名称"
            prop="username"
          >
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="手机号码"
            prop="mobile"
          >
            <el-input
              v-model="queryParams.mobile"
              placeholder="请输入手机号码"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
            >
              <el-option
                v-for="dict in statusDictDatas"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="创建时间"
            prop="createTime"
          >
            <el-date-picker
              v-model="queryParams.createTime"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              @click="resetQuery"
            >重置</el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          :data="list"
        >
          <el-table-column width="55">
            <template slot="header">
              <el-checkbox
                v-model="isCheckAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAll"
              />
            </template>
            <template v-slot="scope">
              <el-checkbox
                v-model="checkedStatus[scope.row.id]"
                @change="handleCheckOne($event, scope.row, true)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="用户编号"
            align="center"
            prop="id"
          />
          <el-table-column
            label="用户名称"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="用户昵称"
            align="center"
            prop="nickname"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="部门"
            align="center"
            prop="deptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="手机号码"
            align="center"
            prop="mobile"
            width="120"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="status"
          >
            <template v-slot="scope">
              <dict-tag
                :type="DICT_TYPE.COMMON_STATUS"
                :value="scope.row.status"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="180"
          >
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="handleEmitChange"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getUserPage } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import DeptTreeSelect from '@/views/system/dept/components/DeptTreeSelect.vue'

export default {
  name: 'StoreStaffTableSelect',
  components: { DeptTreeSelect },
  data() {
    return {
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      isCheckAll: false,
      isIndeterminate: false,
      checkedUsers: [],
      checkedStatus: {},
      dialogTitle: '选择店员',
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        username: undefined,
        mobile: undefined,
        status: undefined,
        deptId: undefined,
        createTime: []
      }
    }
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      return getUserPage(this.queryParams)
        .then((response) => {
          const page = response.data
          this.list = page.list
          this.total = page.total
          this.calculateIsCheckAll()
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 处理部门被点击 */
    handleDeptNodeClick(deptId) {
      this.queryParams.deptId = deptId
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 打开弹窗，并同步门店当前已绑定的店员 */
    open(initialUsers) {
      this.dialogVisible = true
      this.checkedUsers = Array.isArray(initialUsers) ? initialUsers.slice() : []
      this.checkedStatus = {}
      this.checkedUsers.forEach((user) => {
        this.$set(this.checkedStatus, user.id, true)
      })
      return this.getList()
    },
    /** 全选/全不选当前页 */
    handleCheckAll(checked) {
      this.isCheckAll = checked
      this.isIndeterminate = false
      this.list.forEach((user) => this.handleCheckOne(checked, user, false))
    },
    /** 选中一行 */
    handleCheckOne(checked, user, isCalcCheckAll) {
      const index = this.findCheckedIndex(user)
      if (checked) {
        if (index === -1) {
          this.checkedUsers.push(user)
        } else {
          this.$set(this.checkedUsers, index, user)
        }
        this.$set(this.checkedStatus, user.id, true)
      } else {
        if (index > -1) this.checkedUsers.splice(index, 1)
        this.$set(this.checkedStatus, user.id, false)
        this.isCheckAll = false
      }
      if (isCalcCheckAll) this.calculateIsCheckAll()
    },
    /** 查找用户在已选列表中的索引 */
    findCheckedIndex(user) {
      return this.checkedUsers.findIndex((item) => item.id === user.id)
    },
    /** 计算全选框状态 */
    calculateIsCheckAll() {
      this.isCheckAll = this.list.length > 0 && this.list.every((user) => this.checkedStatus[user.id])
      this.isIndeterminate = !this.isCheckAll && this.list.some((user) => this.checkedStatus[user.id])
    },
    /** 多选完成 */
    handleEmitChange() {
      this.dialogVisible = false
      this.$emit('change', this.checkedUsers.slice())
    }
  }
}
</script>

<style scoped>
.dept-tree-wrap {
  min-height: 560px;
  border: 1px solid #ebeef5;
}
</style>
