<template>
  <div class="app-container">
    <doc-alert title="三方登录" url="https://doc.iocoder.cn/social-user/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px"
             v-show="showSearch" @submit.native.prevent>
      <el-form-item label="应用名" prop="name">
        <el-input v-model="queryParams.name" clearable placeholder="请输入应用名" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="社交平台" prop="socialType">
        <el-select v-model="queryParams.socialType" clearable placeholder="请选择社交平台">
          <el-option v-for="item in getDictDatas(DICT_TYPE.SYSTEM_SOCIAL_TYPE)" :key="item.value"
                     :label="item.label" :value="toNumber(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="queryParams.userType" clearable placeholder="请选择用户类型">
          <el-option v-for="item in getDictDatas(DICT_TYPE.USER_TYPE)" :key="item.value"
                     :label="item.label" :value="toNumber(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户端编号" prop="clientId">
        <el-input v-model="queryParams.clientId" clearable placeholder="请输入客户端编号" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择状态">
          <el-option v-for="item in getDictDatas(DICT_TYPE.COMMON_STATUS)" :key="item.value"
                     :label="item.label" :value="toNumber(item.value)" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:social-client:create']" type="primary" plain icon="el-icon-plus"
                   size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" stripe border>
      <el-table-column label="编号" align="center" prop="id" width="90" />
      <el-table-column label="应用名" align="center" prop="name" min-width="140" />
      <el-table-column label="社交平台" align="center" prop="socialType" width="130">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.SYSTEM_SOCIAL_TYPE" :value="scope.row.socialType" /></template>
      </el-table-column>
      <el-table-column label="用户类型" align="center" prop="userType" width="110">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType" /></template>
      </el-table-column>
      <el-table-column label="客户端编号" align="center" prop="clientId" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template v-slot="scope">
          <el-button v-hasPermi="['system:social-client:update']" size="mini" type="text" icon="el-icon-edit"
                     @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-hasPermi="['system:social-client:delete']" size="mini" type="text" icon="el-icon-delete"
                     @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo"
                :limit.sync="queryParams.pageSize" @pagination="getList" />
    <social-client-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { deleteSocialClient, getSocialClientPage } from '@/api/system/social/client'
import { DICT_TYPE } from '@/utils/dict'
import SocialClientForm from './SocialClientForm'

export default {
  name: 'SocialClient',
  components: { SocialClientForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        socialType: undefined,
        userType: undefined,
        clientId: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    getList() {
      this.loading = true
      return getSocialClientPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.form.open('create')
    },
    handleUpdate(row) {
      this.$refs.form.open('update', row.id)
    },
    handleDelete(row) {
      this.$confirm('是否确认删除社交客户端编号为"' + row.id + '"的数据项？', '警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => deleteSocialClient(row.id)).then(() => {
        if (this.$modal && this.$modal.msgSuccess) this.$modal.msgSuccess('删除成功')
        else this.$message.success('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
