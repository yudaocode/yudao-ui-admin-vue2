<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType" @change="handleQuery">
          <el-option v-for="item in typeOptions" :key="item.type" :label="item.name" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="label">
        <el-input v-model="queryParams.label" placeholder="请输入字典标签" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable>
          <el-option v-for="dict in statusDictDatas" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
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
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="checkedIds.length === 0"
                   @click="handleDeleteBatch" v-hasPermi="['system:dict:delete']">批量删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="字典编码" align="center" prop="id" />
      <el-table-column label="字典标签" align="center" prop="label" />
      <el-table-column label="字典键值" align="center" prop="value" />
      <el-table-column label="字典排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="颜色类型" align="center" prop="colorType" />
      <el-table-column label="CSS Class" align="center" prop="cssClass" />
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
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:dict:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 表单弹窗：添加/修改 -->
    <DictDataForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import { getDictDataPage, deleteDictData, deleteDictDataList, exportDictData } from "@/api/system/dict/data";
import { getSimpleDictTypeList } from "@/api/system/dict/type";
import DictDataForm from './data/DictDataForm'

import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: "SystemDictData",
  components: { DictDataForm },
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
      dataList: [],
      // 默认字典类型
      defaultDictType: "",
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        label: undefined,
        dictType: undefined,
        status: undefined
      },
      // 选中行
      checkedIds: [],
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    };
  },
  created() {
    const dictType = this.$route.params && this.$route.params.dictType;
    this.queryParams.dictType = dictType;
    this.defaultDictType = dictType;
    this.getList();
    this.getTypeList();
  },
  methods: {
    /** 查询字典类型列表 */
    getTypeList() {
      return getSimpleDictTypeList().then(response => {
        this.typeOptions = response.data
      })
    },
    /** 查询字典数据列表 */
    getList() {
      this.loading = true;
      return getDictDataPage(this.queryParams).then(response => {
        const data = response.data
        this.dataList = data.list
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
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.formRef.open('create', undefined, this.queryParams.dictType)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs.formRef.open('update', row.id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$modal.confirm('是否确认删除字典编码为"' + ids + '"的数据项?').then(function() {
          return deleteDictData(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 选择行数据 */
    handleRowCheckboxChange(records) {
      this.checkedIds = records.map((item) => item.id);
    },
    /** 批量删除操作 */
    async handleDeleteBatch() {
      await this.$modal.confirm('是否确认批量删除选中的字典数据?')
      try {
        await deleteDictDataList(this.checkedIds);
        this.checkedIds = [];
        await this.getList();
        this.$modal.msgSuccess('删除成功');
      } catch {}
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有数据项?').then(() => {
        this.exportLoading = true;
        return exportDictData(queryParams);
      }).then(response => {
        this.$download.excel(response, '字典数据.xls');
      }).finally(() => {
        this.exportLoading = false;
      });
    }
  }
};
</script>
