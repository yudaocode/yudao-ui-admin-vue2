<template>
  <div class="app-container">
    <doc-alert title="定时任务" url="https://doc.iocoder.cn/job/" />
    <doc-alert title="异步任务" url="https://doc.iocoder.cn/async-task/" />
    <doc-alert title="消息队列" url="https://doc.iocoder.cn/message-queue/" />
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_JOB_STATUS)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="处理器的名字" prop="handlerName">
        <el-input v-model="queryParams.handlerName" placeholder="请输入处理器的名字" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['infra:job:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['infra:job:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" icon="el-icon-s-operation" size="mini" @click="handleJobLog"
                   v-hasPermi="['infra:job:query']">执行日志</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-refresh" size="mini" @click="handleSyncJob"
                   :loading="syncLoading" v-hasPermi="['infra:job:create']">同步任务</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['infra:job:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="任务编号" align="center" prop="id" />
      <el-table-column label="任务名称" align="center" prop="name" />
      <el-table-column label="任务状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_JOB_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="处理器的名字" align="center" prop="handlerName" />
      <el-table-column label="处理器的参数" align="center" prop="handlerParam" />
      <el-table-column label="CRON 表达式" align="center" prop="cronExpression" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['infra:job:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-check" @click="handleChangeStatus(scope.row, true)"
                     v-if="scope.row.status === InfJobStatusEnum.STOP" v-hasPermi="['infra:job:update']">开启</el-button>
          <el-button size="mini" type="text" icon="el-icon-close" @click="handleChangeStatus(scope.row, false)"
                     v-if="scope.row.status === InfJobStatusEnum.NORMAL" v-hasPermi="['infra:job:update']">暂停</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:job:delete']">删除</el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                       v-hasPermi="['infra:job:trigger', 'infra:job:query']">
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handleRun" icon="el-icon-caret-right"
                                v-hasPermi="['infra:job:trigger']">执行一次</el-dropdown-item>
              <el-dropdown-item command="handleView" icon="el-icon-view"
                                v-hasPermi="['infra:job:query']">任务详细</el-dropdown-item>
              <el-dropdown-item command="handleJobLog" icon="el-icon-s-operation"
                                v-hasPermi="['infra:job:query']">调度日志</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <job-form ref="formRef" @success="getList" />
    <job-detail ref="detailRef" />
  </div>
</template>

<script>
import { getJobPage, deleteJob, exportJob, runJob, updateJobStatus, deleteJobList, syncJob } from "@/api/infra/job";
import { InfraJobStatusEnum } from "@/utils/constants";
import JobForm from './JobForm.vue'
import JobDetail from './JobDetail.vue'

export default {
  components: { JobForm, JobDetail },
  name: "InfraJob",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 同步遮罩层
      syncLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 定时任务表格数据
      jobList: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        handlerName: undefined
      },
      checkedIds: [], // 批量删除时使用的变量

      // 枚举
      InfJobStatusEnum: InfraJobStatusEnum
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询定时任务列表 */
    getList() {
      this.loading = true;
      getJobPage(this.queryParams).then(response => {
        this.jobList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 立即执行一次 **/
    handleRun(row) {
      this.$modal.confirm('确认要立即执行一次"' + row.name + '"任务吗?').then(function() {
          return runJob(row.id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("执行成功");
      }).catch(() => {});
    },
    /** 任务详细信息 */
    handleView(row) {
      this.$refs.detailRef.open(row.id);
    },
    /** 任务日志列表查询 */
    handleJobLog(row) {
      if (row && row.id) {
        this.$router.push({
          path:"/job/job-log",
          query:{ id: row.id }
        });
      } else {
        this.$router.push("/job/job-log");
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.formRef.open('create');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs.formRef.open('update', row.id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$modal.confirm('是否确认删除定时任务编号为"' + ids + '"的数据项?').then(function() {
          return deleteJob(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 更新状态操作 */
    handleChangeStatus(row, open) {
      const id = row.id;
      let status = open ? InfraJobStatusEnum.NORMAL : InfraJobStatusEnum.STOP;
      let statusStr = open ? '开启' : '关闭';
      this.$modal.confirm('是否确认' + statusStr + '定时任务编号为"' + id + '"的数据项?').then(function() {
        return updateJobStatus(id, status);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(statusStr + "成功");
      }).catch(() => {});
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleRun":
          this.handleRun(row);
          break;
        case "handleView":
          this.handleView(row);
          break;
        case "handleJobLog":
          this.handleJobLog(row);
          break;
        default:
          break;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm("是否确认导出所有定时任务数据项?").then(() => {
        this.exportLoading = true;
        return exportJob(queryParams);
      }).then(response => {
        this.$download.excel(response, '定时任务.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    },
    /** 同步任务到 Quartz */
    handleSyncJob() {
      this.$modal.confirm('确认要同步所有任务到调度器?').then(() => {
        this.syncLoading = true;
        return syncJob();
      }).then(() => {
        this.$modal.msgSuccess("同步成功");
        this.getList();
      }).finally(() => {
        this.syncLoading = false;
      });
    },
    // 批量删除操作
    handleDeleteBatch() {
      const ids = this.checkedIds.join(',');
      this.$modal.confirm('是否确认删除定时任务编号为"' + ids + '"的数据项?').then(() => {
          return deleteJobList(this.checkedIds);
      }).then(() => {
        this.checkedIds = [];
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    // 处理行选择变化
    handleRowCheckboxChange(selection) {
      this.checkedIds = selection.map(item => item.id);
    }
  }
};
</script>
