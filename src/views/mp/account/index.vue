<template>
  <div class="app-container">
    <doc-alert title="公众号接入" url="https://doc.iocoder.cn/mp/account/" />

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm('create')"
                   v-hasPermi="['mp:account:create']">新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="微信号" align="center" prop="account" width="180"/>
      <el-table-column label="appId" align="center" prop="appId" width="180"/>
<!--      <el-table-column label="appSecret" align="center" prop="appSecret" width="180"/>-->
<!--      <el-table-column label="token" align="center" prop="token"/>-->
<!--      <el-table-column label="消息加解密密钥" align="center" prop="aesKey"/>-->
      <el-table-column label="服务器地址(URL)" align="center" prop="appId" width="360">
        <template v-slot="scope">
          {{ 'http://服务端地址/admin-api/mp/open/' + scope.row.appId }}
        </template>
      </el-table-column>
      <el-table-column label="二维码" align="center" prop="qrCodeUrl">
        <template v-slot="scope">
          <img v-if="scope.row.qrCodeUrl" :src="scope.row.qrCodeUrl" alt="二维码" style="display: inline-block; height: 100px;" />
          <el-button size="mini" type="text" @click="handleGenerateQrCode(scope.row)"
                     v-hasPermi="['mp:account:qr-code']">生成二维码</el-button>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark"/>
<!--      <el-table-column label="创建时间" align="center" prop="createTime" width="180">-->
<!--        <template v-slot="scope">-->
<!--          <span>{{ parseTime(scope.row.createTime) }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm('update', scope.row.id)"
                     v-hasPermi="['mp:account:update']">修改
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['mp:account:delete']">删除
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-share" @click="handleCleanQuota(scope.row)"
                     v-hasPermi="['mp:account:clear-quota']">清空 API 配额
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <AccountForm ref="formRef" @success="getList" />
  </div>
</template>

<script>
import {
  clearAccountQuota,
  deleteAccount,
  generateAccountQrCode,
  getAccountPage
} from '@/api/mp/account'
import AccountForm from './AccountForm.vue'

export default {
  name: 'MpAccount',
  components: { AccountForm },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 公众号账号列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        account: null,
        appId: null,
      },
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      // 处理查询参数
      let params = {...this.queryParams}
      // 执行查询
      getAccountPage(params).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.formRef.open(type, id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除公众号账号编号为"' + row.name + '"的数据项?').then(function () {
        return deleteAccount(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 生成二维码的按钮操作 */
    handleGenerateQrCode(row) {
      const id = row.id
      this.$modal.confirm('是否确认生成公众号账号编号为"' + row.name + '"的二维码?').then(function () {
        return generateAccountQrCode(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('生成二维码成功')
      }).catch(() => {
      })
    },
    /** 清空二维码 API 配额的按钮操作 */
    handleCleanQuota(row) {
      const id = row.id
      this.$modal.confirm('是否确认清空生成公众号账号编号为"' + row.name + '"的 API 配额?').then(function () {
        return clearAccountQuota(id)
      }).then(() => {
        this.$modal.msgSuccess('清空 API 配额成功')
      }).catch(() => {
      })
    },
  }
}
</script>
