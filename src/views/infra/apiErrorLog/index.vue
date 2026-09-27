<template>
  <div class="app-container">
    <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" />
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户编号" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="queryParams.userType" placeholder="请选择用户类型" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.USER_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="应用名" prop="applicationName">
        <el-input v-model="queryParams.applicationName" placeholder="请输入应用名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="请求地址" prop="requestUrl">
        <el-input v-model="queryParams.requestUrl" placeholder="请输入请求地址" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="异常时间" prop="exceptionTime">
        <el-date-picker v-model="queryParams.exceptionTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item label="处理状态" prop="processStatus">
        <el-select v-model="queryParams.processStatus" placeholder="请选择处理状态" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_API_ERROR_LOG_PROCESS_STATUS)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['infra:api-error-log:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="日志编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户类型" align="center" prop="userType">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column label="应用名" align="center" prop="applicationName" />
      <el-table-column label="请求方法名" align="center" prop="requestMethod" />
      <el-table-column label="请求地址" align="center" prop="requestUrl" width="250" />
      <el-table-column label="异常发生时间" align="center" prop="exceptionTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.exceptionTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="异常名" align="center" prop="exceptionName" width="250" />
      <el-table-column label="处理状态" align="center" prop="processStatus">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_API_ERROR_LOG_PROCESS_STATUS" :value="scope.row.processStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row,scope.index)"
                     v-hasPermi="['infra:api-error-log:query']">详细</el-button>
          <el-button type="text" size="mini" icon="el-icon-check"
              v-if="scope.row.processStatus === InfApiErrorLogProcessStatusEnum.INIT" v-hasPermi="['infra:api-error-log:update-status']"
              @click="handleProcessClick(scope.row, InfApiErrorLogProcessStatusEnum.DONE)">已处理</el-button>
          <el-button type="text" size="mini" icon="el-icon-check"
                     v-if="scope.row.processStatus === InfApiErrorLogProcessStatusEnum.INIT" v-hasPermi="['infra:api-error-log:update-status']"
                     @click="handleProcessClick(scope.row, InfApiErrorLogProcessStatusEnum.IGNORE)">已忽略</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <api-error-log-detail ref="detailRef" />
  </div>
</template>

<script>
import { updateApiErrorLogPage, getApiErrorLogPage, exportApiErrorLog } from "@/api/infra/apiErrorLog";
import { InfraApiErrorLogProcessStatusEnum } from '@/utils/constants'
import ApiErrorLogDetail from './ApiErrorLogDetail.vue'

export default {
  name: "InfraApiErrorLog",
  components: {
    ApiErrorLogDetail
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // API 错误日志列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: null,
        userType: null,
        applicationName: null,
        requestUrl: null,
        processStatus: null,
        exceptionTime: []
      },
      // 枚举
      InfApiErrorLogProcessStatusEnum: InfraApiErrorLogProcessStatusEnum,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getApiErrorLogPage(this.queryParams).then(response => {
        this.list = response.data.list;
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
    /** 详细按钮操作 */
    handleView(row) {
      this.$refs.detailRef.open(row);
    },
    /** 处理已处理 / 已忽略的操作 **/
    handleProcessClick(row, processStatus) {
      const processStatusText = this.getDictDataLabel(this.DICT_TYPE.INFRA_API_ERROR_LOG_PROCESS_STATUS, processStatus)
      this.$modal.confirm('确认标记为' + processStatusText).then(() => {
        updateApiErrorLogPage(row.id, processStatus).then(() => {
          this.$modal.msgSuccess("修改成功");
          this.getList();
        });
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      // 执行导出
      this.$modal.confirm('是否确认导出所有API 错误日志数据项?').then(() => {
        this.exportLoading = true;
        return exportApiErrorLog(params);
      }).then(response => {
        this.$download.excel(response, 'API 错误日志.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    }
  }
};
</script>
