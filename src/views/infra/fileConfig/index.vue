<template>
  <div class="app-container">
    <doc-alert title="上传下载" url="https://doc.iocoder.cn/file/" />
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="配置名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入配置名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="存储器" prop="storage">
        <el-select v-model="queryParams.storage" placeholder="请选择存储器" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_FILE_STORAGE)"
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
                   v-hasPermi="['infra:file-config:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['infra:file-config:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="配置名" align="center" prop="name" />
      <el-table-column label="存储器" align="center" prop="storage">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_FILE_STORAGE" :value="scope.row.storage" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="主配置" align="center" prop="primary">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.master" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['infra:file-config:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-attract" @click="handleMaster(scope.row)"
                     :disabled="scope.row.master" v-hasPermi="['infra:file-config:update']">主配置</el-button>
          <el-button size="mini" type="text" icon="el-icon-share" @click="handleTest(scope.row)">测试</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:file-config:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <file-config-form ref="form" @success="getList" />
  </div>
</template>

<script>
import {
  deleteFileConfig,
  getFileConfigPage,
  testFileConfig,
  updateFileConfigMaster,
  deleteFileConfigList
} from "@/api/infra/fileConfig";
import FileConfigForm from './FileConfigForm.vue'

export default {
  name: "InfraFileConfig",
  components: {
    FileConfigForm
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件配置列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        storage: null,
        createTime: []
      },
      checkedIds: []
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
      getFileConfigPage(this.queryParams).then(response => {
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
      this.$refs.form.open('create')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除文件配置编号为"' + id + '"的数据项?').then(() => {
        return deleteFileConfig(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 主配置按钮操作 */
    handleMaster(row) {
      const id = row.id;
      this.$modal.confirm('是否确认修改配置编号为"' + id + '"的数据项为主配置?').then(() => {
        return updateFileConfigMaster(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("修改成功");
      }).catch(() => {});
    },
    /** 测试按钮操作 */
    handleTest(row) {
      testFileConfig(row.id).then((response) => {
        this.$modal.alert("测试通过，上传文件成功！访问地址：" + response.data);
      }).catch(() => {});
    },
    handleRowCheckboxChange(selection) {
      this.checkedIds = selection.map(item => item.id);
    },
    handleDeleteBatch() {
      if (this.checkedIds.length === 0) {
        this.$message.warning('请选择要删除的数据项');
        return;
      }
      this.$modal.confirm('是否确认删除选中的' + this.checkedIds.length + '项数据?').then(() => {
        return deleteFileConfigList(this.checkedIds);
      }).then(() => {
        this.checkedIds = [];
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
