<template>
  <div class="app-container">
    <doc-alert title="SaaS 多租户" url="https://doc.iocoder.cn/saas-tenant/" />
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="租户名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入租户名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="queryParams.contactName" placeholder="请输入联系人" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="联系手机" prop="contactMobile">
        <el-input v-model="queryParams.contactMobile" placeholder="请输入联系手机" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="租户状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择租户状态" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
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
                   v-hasPermi="['system:tenant:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:tenant:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['system:tenant:delete']"
        >
          批量删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="租户编号" align="center" prop="id" />
      <el-table-column label="租户名" align="center" prop="name" />
      <el-table-column label="租户套餐" align="center" prop="packageId">
        <template v-slot="scope">
          <el-tag v-if="scope.row.packageId === 0" type="danger">系统租户</el-tag>
          <el-tag v-else> {{getPackageName(scope.row.packageId)}} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" prop="contactName" />
      <el-table-column label="联系手机" align="center" prop="contactMobile" />
      <el-table-column label="账号额度" align="center" prop="accountCount">
        <template v-slot="scope">
          <el-tag> {{scope.row.accountCount}} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center" prop="expireTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.expireTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定域名" align="center" prop="websites" width="180">
        <template v-slot="scope">
          <el-tag v-for="website in scope.row.websites || []" :key="website" style="margin-right: 2px; margin-bottom: 2px;">
            {{ website }}
          </el-tag>
          <span v-if="!scope.row.websites || scope.row.websites.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column label="租户状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:tenant:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:tenant:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <TenantForm ref="tenantForm" @success="getList" />
  </div>
</template>

<script>
import TenantForm from './TenantForm.vue'
import { deleteTenant, getTenantPage, exportTenant, deleteTenantList } from "@/api/system/tenant";
import {getTenantPackageList} from "@/api/system/tenantPackage";

export default {
  name: "SystemTenant",
  components: { TenantForm },
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
      // 租户列表
      list: [],
      // 租户套餐列表
      packageList: [],
      // 选中行
      checkedIds: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        contactName: null,
        contactMobile: null,
        status: undefined,
        createTime: []
      }
    };
  },
  created() {
    this.getList();
    // 获得租户套餐列表
    getTenantPackageList().then(response => {
      this.packageList = response.data;
    })
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      return getTenantPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
      }).finally(() => {
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
      this.$refs.tenantForm.open('create');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs.tenantForm.open('update', row.id);
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除租户编号为"' + id + '"的数据项?').then(function() {
          return deleteTenant(id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      // 处理查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      // 执行导出
      this.$modal.confirm('是否确认导出所有租户数据项?').then(() => {
        this.exportLoading = true;
        return exportTenant(params);
      }).then(response => {
        this.$download.excel(response, '租户.xls');
      }).catch(() => {
        this.exportLoading = false;
      });
    },
    /** 套餐名格式化 */
    getPackageName(packageId) {
      for (const item of this.packageList) {
        if (item.id === packageId) {
          return item.name;
        }
      }
      return '未知套餐';
    },
    /** 批量删除操作 */
    async handleDeleteBatch() {
      await this.$modal.confirm('是否确认批量删除选中的租户数据?')
      try {
        await deleteTenantList(this.checkedIds);
        this.checkedIds = [];
        await this.getList();
        this.$modal.msgSuccess("删除成功");
      } catch {}
    },
    /** 选择行数据 */
    handleRowCheckboxChange(records) {
      this.checkedIds = records.map((item) => item.id);
    }
  }
};
</script>
