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
      <el-table-column label="绑定域名" align="center" prop="domain" width="180" />
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="租户名" prop="name">
          <el-input v-model="form.name" placeholder="请输入租户名" />
        </el-form-item>
        <el-form-item label="租户套餐" prop="packageId">
          <el-select v-model="form.packageId" placeholder="请选择租户套餐" clearable size="small">
            <el-option v-for="item in packageList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系手机" prop="contactMobile">
          <el-input v-model="form.contactMobile" placeholder="请输入联系手机" />
        </el-form-item>
        <el-form-item v-if="form.id === undefined" label="用户名称" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item v-if="form.id === undefined" label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="账号额度" prop="accountCount">
          <el-input-number v-model="form.accountCount" placeholder="请输入账号额度" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker clearable size="small" v-model="form.expireTime" type="date"
                          value-format="timestamp" placeholder="请选择过期时间" />
        </el-form-item>
        <el-form-item label="绑定域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入绑定域名" />
        </el-form-item>
        <el-form-item label="租户状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                      :key="dict.value" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createTenant, updateTenant, deleteTenant, getTenant, getTenantPage, exportTenantExcel, deleteTenantList } from "@/api/system/tenant";
import { CommonStatusEnum } from '@/utils/constants'
import {getTenantPackageList} from "@/api/system/tenantPackage";

export default {
  name: "SystemTenant",
  components: {
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
      // 租户列表
      list: [],
      // 租户套餐列表
      packageList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
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
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: "租户名不能为空", trigger: "blur" }],
        packageId: [{ required: true, message: "租户套餐不能为空", trigger: "blur" }],
        contactName: [{ required: true, message: "联系人不能为空", trigger: "blur" }],
        status: [{ required: true, message: "租户状态不能为空", trigger: "blur" }],
        accountCount: [{ required: true, message: "账号额度不能为空", trigger: "blur" }],
        expireTime: [{ required: true, message: "过期时间不能为空", trigger: "blur" }],
        domain: [{ required: true, message: "绑定域名不能为空", trigger: "blur" }],
        username: [{ required: true, message: "用户名称不能为空", trigger: "blur" }],
        password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }],
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
      getTenantPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        packageId: undefined,
        contactName: undefined,
        contactMobile: undefined,
        accountCount: undefined,
        expireTime: undefined,
        domain: undefined,
        status: CommonStatusEnum.ENABLE,
      };
      this.resetForm("form");
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
      this.reset();
      this.open = true;
      this.title = "添加租户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      getTenant(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改租户";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        // 修改的提交
        if (this.form.id != null) {
          updateTenant(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
          });
          return;
        }
        // 添加的提交
        createTenant(this.form).then(response => {
          this.$modal.msgSuccess("新增成功");
          this.open = false;
          this.getList();
        });
      });
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
        return exportTenantExcel(params);
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
