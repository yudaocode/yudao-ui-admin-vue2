<template>
  <div class="app-container">

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名字" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名字" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="queryParams.sex" placeholder="请选择性别" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="出生年" prop="birthday">
        <el-date-picker clearable v-model="queryParams.birthday" type="date" value-format="yyyy-MM-dd" placeholder="选择出生年" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="queryParams.avatar" placeholder="请输入头像" clearable @keyup.enter.native="handleQuery"/>
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"
                   v-hasPermi="['infra:demo01-contact:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['infra:demo01-contact:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="名字" align="center" prop="name" />
      <el-table-column label="性别" align="center" prop="sex">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.sex" />
        </template>
      </el-table-column>
      <el-table-column label="出生年" align="center" prop="birthday" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.birthday) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" align="center" prop="description" />
      <el-table-column label="头像" align="center" prop="avatar" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['infra:demo01-contact:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['infra:demo01-contact:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <Demo01ContactForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import * as Demo01ContactApi from '@/api/infra/demo01';
import Demo01ContactForm from './Demo01ContactForm.vue';
export default {
  name: "Demo01Contact",
  components: {
    Demo01ContactForm,
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
      // 示例联系人列表
      list: [],
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 选中行
      currentRow: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        sex: null,
        birthday: null,
        description: null,
        avatar: null,
        createTime: [],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      try {
        this.loading = true;
        Demo01ContactApi.getDemo01ContactPage(this.queryParams).then(response => {
          this.list = response.data.list;
          this.total = response.data.total;
        });
      } finally {
        this.loading = false;
      }
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
    /** 添加/修改操作 */
    openForm(id) {
      this.$refs["formRef"].open(id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const that = this;
      try {
        const id = row.id;
        this.$modal.confirm('是否确认删除示例联系人编号为"' + id + '"的数据项?').then(()=>{
          return Demo01ContactApi.deleteDemo01Contact(id);
        }).then(() => {
          that.getList();
          that.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      } catch {}
    },
    /** 导出按钮操作 */
    handleExport() {
      const that = this;
      try {
        this.$modal.confirm('是否确认导出所有示例联系人数据项?').then(() => {
          that.exportLoading = true;
          return Demo01ContactApi.exportDemo01ContactExcel(params);
        }).then(response => {
          that.$download.excel(response, '示例联系人.xls');
        });
      } catch {
      } finally {
        that.exportLoading = false;
      }
    },
  }
};
</script>
