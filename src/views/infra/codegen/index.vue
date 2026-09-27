<template>
  <div class="app-container">
    <doc-alert title="代码生成" url="https://doc.iocoder.cn/new-feature/" />
    <doc-alert title="单元测试" url="https://doc.iocoder.cn/unit-test/" />
    <!-- 操作工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="请输入表名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="请输入表描述" clearable
                  @keyup.enter.native="handleQuery"/>
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

    <!-- 操作工作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload" size="mini" @click="openImportTable"
                   v-hasPermi="['infra:codegen:create']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['infra:codegen:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="tableList" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="数据源" align="center" :formatter="dataSourceConfigNameFormat"/>
      <el-table-column label="表名称" align="center" prop="tableName" width="200"/>
      <el-table-column label="表描述" align="center" prop="tableComment" :show-overflow-tooltip="true" width="120"/>
      <el-table-column label="实体" align="center" prop="className" width="200"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button type="text" size="small" icon="el-icon-view" @click="handlePreview(scope.row)" v-hasPermi="['infra:codegen:preview']">预览</el-button>
          <el-button type="text" size="small" icon="el-icon-edit" @click="handleEditTable(scope.row)" v-hasPermi="['infra:codegen:update']">编辑</el-button>
          <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['infra:codegen:delete']">删除</el-button>
          <el-button type="text" size="small" icon="el-icon-refresh" @click="handleSynchDb(scope.row)" v-hasPermi="['infra:codegen:update']">同步</el-button>
          <el-button type="text" size="small" icon="el-icon-download" @click="handleGenTable(scope.row)" v-hasPermi="['infra:codegen:download']">生成代码</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList"/>

    <preview-code ref="preview" />

    <!-- 基于 DB 导入 -->
    <import-table ref="import" @ok="handleQuery" />
  </div>
</template>

<script>
import { getCodegenTablePage, downloadCodegen, deleteCodegenTable,
  syncCodegenFromDB, deleteCodegenTableList } from "@/api/infra/codegen";

import importTable from "./importTable";
import PreviewCode from './PreviewCode.vue'
import {getDataSourceConfigList} from "@/api/infra/dataSourceConfig";
export default {
  name: "InfraCodegen",
  components: { importTable, PreviewCode },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 唯一标识符
      uniqueId: "",
      // 选中表数组
      tableNames: [],
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表数据
      tableList: [],
      // 日期范围
      dateRange: "",
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined,
        createTime: []
      },
      // 数据源列表
      dataSourceConfigs: [],
      // 选中项
      checkedIds: [],
    };
  },
  created() {
    this.getList();
    // 加载数据源
    getDataSourceConfigList().then(response => {
      this.dataSourceConfigs = response.data;
    });
  },
  activated() {
    const time = this.$route.query.t;
    if (time != null && time !== this.uniqueId) {
      this.uniqueId = time;
      this.resetQuery();
    }
  },
  methods: {
    /** 查询表集合 */
    getList() {
      this.loading = true;
      getCodegenTablePage(this.queryParams).then(response => {
            this.tableList = response.data.list;
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
    /** 生成代码操作 */
    handleGenTable(row) {
      downloadCodegen(row.id).then(response => {
        this.$download.zip(response, 'codegen-' + row.tableName + '.zip');
      })
    },
    /** 同步数据库操作 */
    handleSynchDb(row) {
      // 基于 DB 同步
      const tableName = row.tableName;
      this.$modal.confirm('确认要强制同步"' + tableName + '"表结构吗？').then(function() {
          return syncCodegenFromDB(row.id);
      }).then(() => {
          this.$modal.msgSuccess("同步成功");
      }).catch(() => {});
    },
    /** 打开导入表弹窗 */
    openImportTable() {
      this.$refs.import.open();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 预览按钮 */
    handlePreview(row) {
      this.$refs.preview.open(row.id);
    },
    /** 修改按钮操作 */
    handleEditTable(row) {
      const tableId = row.id;
      const tableName = row.tableName || this.tableNames[0];
      const params = { id: tableId, pageNum: this.queryParams.pageNo };
      this.$tab.openPage("修改[" + tableName + "]生成配置", '/codegen/edit', params);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const tableIds = row.id;
      this.$modal.confirm('是否确认删除表名称为"' + row.tableName + '"的数据项?').then(function() {
          return deleteCodegenTable(tableIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    // 数据源配置的名字
    dataSourceConfigNameFormat(row, column) {
      for (const config of this.dataSourceConfigs) {
        if (row.dataSourceConfigId === config.id) {
          return config.name;
        }
      }
      return '';
    },
    /** 选中行变化 */
    handleRowCheckboxChange(selection) {
      this.checkedIds = selection.map(item => item.id);
    },
    /** 批量删除 */
    handleDeleteBatch() {
      const ids = this.checkedIds;
      this.$modal.confirm('是否确认删除选中的数据项?').then(() => {
          return deleteCodegenTableList(ids);
      }).then(() => {
          this.checkedIds = [];
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
