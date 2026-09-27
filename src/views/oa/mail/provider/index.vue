<template>
  <div class="app-container oa-mail-provider">
    <!-- 搜索 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:mail-provider:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="名称" prop="name" min-width="160" />
      <el-table-column label="IMAP 服务器" min-width="220">
        <template slot-scope="scope">{{ scope.row.imap.host }}:{{ scope.row.imap.port }}</template>
      </el-table-column>
      <el-table-column label="SMTP 服务器" min-width="220">
        <template slot-scope="scope">{{ scope.row.smtp.host }}:{{ scope.row.smtp.port }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:mail-provider:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['oa:mail-provider:delete']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 修改弹窗 -->
    <mail-provider-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as ProviderApi from '@/api/oa/mail/provider'
import MailProviderForm from './MailProviderForm.vue'

export default {
  name: 'OaMailProvider',
  components: { MailProviderForm },
  data() {
    return {
      DICT_TYPE,
      loading: false, // 列表加载状态
      list: [], // 邮箱服务配置列表
      queryParams: {
        name: '',
        status: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      return ProviderApi.getMailProviderList().then(response => {
        this.list = response.data.filter(
          item =>
            item.name.toLowerCase().includes(this.queryParams.name.trim().toLowerCase()) &&
            (!Number.isInteger(this.queryParams.status) || item.status === this.queryParams.status)
        )
      }).finally(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 添加 / 修改操作 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 删除操作 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该数据项？').then(() => {
        return ProviderApi.deleteMailProvider(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
