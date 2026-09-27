<template>
  <div class="app-container">
    <doc-alert title="上传下载" url="https://doc.iocoder.cn/file/"/>
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件路径" prop="path">
        <el-input v-model="queryParams.path" placeholder="请输入文件路径" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="文件类型" prop="type">
        <el-input v-model="queryParams.type" placeholder="请输入文件类型" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">上传文件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['infra:file:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="文件名" :show-overflow-tooltip="true" align="center" min-width="200px" prop="name"/>
      <el-table-column label="文件路径" :show-overflow-tooltip="true" align="center" min-width="250px" prop="path"/>
      <el-table-column label="文件 URL" :show-overflow-tooltip="true" align="center" min-width="300px" prop="url"/>
      <el-table-column label="文件大小" align="center" prop="size" min-width="120px" :formatter="sizeFormat"/>
      <el-table-column label="文件类型" :show-overflow-tooltip="true" align="center" prop="type" width="180px"/>
      <el-table-column label="文件内容" align="center" prop="content" min-width="150px">
        <template v-slot="scope">
          <el-image v-if="scope.row.type.includes('image')" :src="scope.row.url"
                    :preview-src-list="[scope.row.url]" style="width: 80px; height: 80px" fit="cover" lazy />
          <el-link v-else-if="scope.row.type.includes('pdf')" type="primary" :underline="false"
                   target="_blank" :href="scope.row.url">预览</el-link>
          <el-link v-else type="primary" :underline="false" download
                   target="_blank" :href="scope.row.url">下载</el-link>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="createTime" min-width="170px">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="100px">
        <template v-slot="scope">
          <el-button size="mini" type="text" v-clipboard:copy="scope.row.url"
                     v-clipboard:success="clipboardSuccess" v-clipboard:error="clipboardError">复制链接</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:file:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <file-form ref="form" @success="getList" />

  </div>
</template>

<script>
import {deleteFile, getFilePage, deleteFileList} from "@/api/infra/file";
import FileForm from './FileForm.vue'

export default {
  name: "InfraFile",
  components: {
    FileForm
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        path: null,
        type: null,
        createTime: []
      },
      checkedIds: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    clipboardSuccess() { this.$modal.msgSuccess('复制成功') },
    clipboardError() { this.$modal.msgError('复制失败') },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getFilePage(this.queryParams).then(response => {
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
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.form.open();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除文件编号为"' + id + '"的数据项?').then(function () {
        return deleteFile(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch() {
      if (this.checkedIds.length === 0) {
        this.$message.warning('请选择要删除的数据项');
        return;
      }
      this.$modal.confirm('是否确认删除选中的' + this.checkedIds.length + '项数据?').then(() => {
        return deleteFileList(this.checkedIds);
      }).then(() => {
        this.checkedIds = [];
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 处理行选择变化 */
    handleRowCheckboxChange(selection) {
      this.checkedIds = selection.map(item => item.id);
    },
    // 用户昵称展示
    sizeFormat(row, column) {
      const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const srcSize = parseFloat(row.size);
      const index = Math.floor(Math.log(srcSize) / Math.log(1024));
      let size = srcSize / Math.pow(1024, index);
      size = size.toFixed(2);//保留的小数位数
      return size + ' ' + unitArr[index];
    },
  }
};
</script>
