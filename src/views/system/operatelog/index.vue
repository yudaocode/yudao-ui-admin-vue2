<template>
  <div class="app-container">
    <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" />
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="操作人" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请输入操作人员" clearable style="width: 240px">
          <el-option v-for="user in this.userList" :key="user.id" :label="user.nickname" :value="user.id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="操作模块" prop="type">
        <el-input v-model="queryParams.type" placeholder="请输入操作模块" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="操作名" prop="subType">
        <el-input v-model="queryParams.subType" placeholder="请输入操作名" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="操作内容" prop="action">
        <el-input v-model="queryParams.action" placeholder="请输入操作内容" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="操作时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item label="业务编号" prop="action">
        <el-input v-model="queryParams.bizId" placeholder="请输入业务编号" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:operate-log:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="日志编号" align="center" prop="id" width="100" />
      <el-table-column label="操作人" align="center" prop="userName" width="120" />
      <el-table-column label="操作模块" align="center" prop="type" width="120" />
      <el-table-column label="操作名" align="center" prop="subType" width="160" />
      <el-table-column label="操作内容" align="center" prop="action" />
      <el-table-column label="操作日期" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务编号" align="center" prop="bizId" width="120" />
      <el-table-column label="操作 IP" align="center" prop="userIp" width="120" />
      <el-table-column label="操作" align="center" width="60" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row,scope.index)"
                     v-hasPermi="['system:operate-log:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="访问日志详细" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="24">
            <el-form-item label="日志主键：">{{ form.id }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="链路追踪：">{{ form.traceId }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作人编号：">{{ form.userId }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作人名字：">{{ form.userName }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作人 IP：">{{ form.userIp }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作人 UA：">{{ form.userAgent }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作模块：">{{ form.type }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作名：">{{ form.subType }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作内容：">{{ form.action }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="拓展参数：">{{ form.extra }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求 URL：">{{ form.requestMethod }} | {{ form.requestUrl }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作时间：">{{ parseTime(form.createTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="业务编号：">{{ form.bizId }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOperateLog, exportOperateLog } from "@/api/system/operatelog";
import { listSimpleUsers } from "@/api/system/user";

export default {
  name: "SystemOperateLog",
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
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        type: undefined,
        subType: undefined,
        action: undefined,
        createTime: [],
        bizId: undefined
      },
      userList: [], // 用户列表
    };
  },
  created() {
    this.getList();
    // 获取用户精简信息列表
    listSimpleUsers().then(res => {
      this.userList = res.data;
    });
  },
  methods: {
    /** 查询登录日志 */
    getList() {
      this.loading = true;
      listOperateLog(this.queryParams).then( response => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
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
      this.open = true;
      this.form = row;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出所有操作日志数据项?').then(() => {
        // 处理查询参数
        let params = {...this.queryParams};
        params.pageNo = undefined;
        params.pageSize = undefined;
        this.exportLoading = true;
        return exportOperateLog(params);
      }).then(response => {
        this.$download.excel(response, '操作日志.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    }
  }
};
</script>

