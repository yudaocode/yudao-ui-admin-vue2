<template>
  <div class="app-container">
    <doc-alert
      title="审批接入（业务表单）"
      url="https://doc.iocoder.cn/bpm/use-business-form/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="请假类型"
        prop="type"
      >
        <el-select
          v-model="queryParams.type"
          placeholder="请选择请假类型"
          clearable
        >
          <el-option
            v-for="dict in leaveTypeDictData"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="申请时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item
        label="审批结果"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审批结果"
          clearable
        >
          <el-option
            v-for="dict in getDictDatas(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="原因"
        prop="reason"
      >
        <el-input
          v-model="queryParams.reason"
          placeholder="请输入原因"
          clearable
          @keyup.enter.native="handleQuery"
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

    <!-- 操作工具栏 -->
    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
        >发起请假</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="申请编号"
        align="center"
        prop="id"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
      >
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="结束时间"
        align="center"
        prop="endTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="请假类型"
        align="center"
        prop="type"
      >
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.BPM_OA_LEAVE_TYPE"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="原因"
        align="center"
        prop="reason"
      />
      <el-table-column
        label="申请时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="200"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['bpm:oa-leave:query']"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            v-hasPermi="['bpm:oa-leave:query']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleProcessDetail(scope.row)"
          >进度</el-button>
          <el-button
            v-if="scope.row.result === 1"
            v-hasPermi="['bpm:oa-leave:create']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="cancelLeave(scope.row)"
          >取消</el-button>
          <el-button
            v-if="scope.row.status !== 1"
            v-hasPermi="['bpm:oa-leave:create']"
            size="mini"
            type="text"
            icon="el-icon-refresh"
            @click="handleReCreate(scope.row)"
          >重新发起</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { getLeavePage } from '@/api/bpm/leave'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { cancelProcessInstanceByStartUser } from '@/api/bpm/processInstance'

export default {
  name: 'BpmOALeave',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 请假申请列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        status: undefined,
        type: undefined,
        reason: undefined,
        createTime: []
      },

      leaveTypeDictData: getDictDatas(DICT_TYPE.BPM_OA_LEAVE_TYPE)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    async getList() {
      this.loading = true
      try {
        const response = await getLeavePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
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
    handleCreate() {
      this.$router.push({ name: 'OALeaveCreate' })
    },
    /** 详情按钮操作 */
    handleDetail(row) {
      this.$router.push({ name: 'OALeaveDetail', query: { id: row.id }})
    },
    /** 查看审批进度的操作 */
    handleProcessDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstanceId }})
    },
    /** 重新发起已结束的请假申请，沿用创建页的回填逻辑 */
    handleReCreate(row) {
      this.$router.push({ name: 'OALeaveCreate', query: { id: row.id }})
    },
    /** 取消请假 */
    async cancelLeave(row) {
      const { value } = await this.$prompt('请输入取消原因', '取消流程', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 判断非空，且非空格
        inputErrorMessage: '取消原因不能为空'
      })
      await cancelProcessInstanceByStartUser(row.id, value)
      this.$modal.msgSuccess('取消成功')
      await this.getList()
    }
  }
}
</script>
