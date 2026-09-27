<template>
  <div class="app-container">
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['infra:data-source-config:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['infra:data-source-config:delete']"
        >
          批量删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="主键编号" align="center" prop="id" />
      <el-table-column label="数据源名称" align="center" prop="name" />
      <el-table-column label="数据源连接" align="center" prop="url" />
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['infra:data-source-config:update']"
                     :disabled="scope.row.id === 0">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:data-source-config:delete']"
                     :disabled="scope.row.id === 0">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <data-source-config-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { deleteDataSourceConfig, getDataSourceConfigList, deleteDataSourceConfigList } from "@/api/infra/dataSourceConfig";
import DataSourceConfigForm from './DataSourceConfigForm.vue'

export default {
  name: "InfraDataSourceConfig",
  components: {
    DataSourceConfigForm
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 数据源配置列表
      list: [],
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
      getDataSourceConfigList().then(response => {
        this.list = response.data;
        this.loading = false;
      });
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
      this.$modal.confirm('是否确认删除数据源配置编号为"' + id + '"的数据项?').then(function() {
          return deleteDataSourceConfig(id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    },
    handleRowCheckboxChange(val) {
      // 与 Vue3 源一致：过滤掉 id 为 0 的主数据源
      this.checkedIds = val.map(item => item.id).filter(id => id !== 0 && Boolean(id))
    },
    handleDeleteBatch() {
      const ids = this.checkedIds;
      this.$modal.confirm('是否确认删除选中的数据源配置?').then(function() {
          return deleteDataSourceConfigList(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    }
  }
};
</script>
