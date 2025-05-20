<template>
  <div class="app-container">
    <doc-alert title="OAuth 2.0（SSO 单点登录)" url="https://doc.iocoder.cn/oauth2/" />
    <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" />

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['system:oauth2-client:create']">生成apiKey</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" style="width: 100%;">
      <el-table-column label="apiKey令牌" align="center" prop="accessToken" width="300" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户类型" align="center" prop="userType" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column label="客户端类型" align="center" prop="clientId" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center" prop="expiresTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.expiresTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleForceLogout(scope.row)"
            v-hasPermi="['system:oauth2-token:delete']">强退</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { createApiKeyToken, getApiKeyTokenPage, deleteAccessToken } from "@/api/system/oauth2/oauth2Token";

export default {
  name: "SystemApiKeyClient",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      getApiKeyTokenPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$modal.confirm('是否确认强退令牌为"' + row.accessToken + '"的数据项?').then(function() {
          return deleteAccessToken(row.accessToken);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("强退成功");
      }).catch(() => {});
    },
    /** 新增apiKey操作 */
    handleAdd() {
      createApiKeyToken().then(() => {
        this.getList();
        this.$modal.msgSuccess("新增成功");
      });
    }
  }
};
</script>

