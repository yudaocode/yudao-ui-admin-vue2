<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入字典名称" clearable style="width: 240px" @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="字典类型" prop="type">
        <el-input v-model="queryParams.type" placeholder="请输入字典类型" clearable style="width: 240px" @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="字典状态" clearable style="width: 240px">
          <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['system:dict:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:dict:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['system:dict:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="typeList" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="字典编号" align="center" prop="id" />
      <el-table-column label="字典名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="字典类型" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          <router-link :to="'/dict/type/data/' + scope.row.type" class="link-type">
            <span>{{ scope.row.type }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:dict:update']">修改</el-button>
          <router-link :to="'/dict/type/data/' + scope.row.type">
            <el-button size="mini" type="text" icon="el-icon-tickets">数据</el-button>
          </router-link>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:dict:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 表单弹窗：添加/修改 -->
    <DictTypeForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import { getDictTypePage, deleteDictType, exportDictType, deleteDictTypeList } from "@/api/system/dict/type";
import DictTypeForm from './DictTypeForm'

import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: "SystemDictType",
  components: { DictTypeForm },
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
      // 字典表格数据
      typeList: [],
      // 选中行
      checkedIds: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        type: undefined,
        status: undefined,
        createTime: []
      },
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      // 执行查询
      return getDictTypePage(this.queryParams).then(response => {
        const data = response.data
        this.typeList = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
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
      this.$refs.formRef.open('create')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs.formRef.open('update', row.id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除字典编号为"' + ids + '"的数据项?').then(function() {
          return deleteDictType(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 批量删除操作 */
    async handleDeleteBatch() {
      await this.$modal.confirm('是否确认批量删除选中的字典类型数据?')
      try {
        await deleteDictTypeList(this.checkedIds);
        this.checkedIds = [];
        await this.getList();
        this.$modal.msgSuccess("删除成功");
      } catch {}
    },
    /** 选择行数据 */
    handleRowCheckboxChange(records) {
      this.checkedIds = records.map((item) => item.id);
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      // 执行导出
      this.$modal.confirm('是否确认导出所有字典类型数据项?').then(() => {
        this.exportLoading = true;
        return exportDictType(params);
      }).then(response => {
        this.$download.excel(response, '字典类型.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    }
  }
};
</script>
