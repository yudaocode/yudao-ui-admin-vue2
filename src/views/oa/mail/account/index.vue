<template>
  <div class="app-container oa-mail-account">
    <!-- 搜索 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="邮箱地址" prop="mail">
        <el-input
          v-model="queryParams.mail"
          placeholder="请输入邮箱地址"
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
          v-hasPermi="['oa:mail-account:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 我的账号 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="邮箱" prop="mail" min-width="220" />
      <el-table-column label="邮箱服务" min-width="150">
        <template slot-scope="scope">
          {{ (providers.find(item => item.id === scope.row.providerId) || {}).name }}
        </template>
      </el-table-column>
      <el-table-column label="默认" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.defaultStatus" type="success">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:mail-account:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >
            修改
          </el-button>
          <el-button
            :disabled="scope.row.status !== CommonStatusEnum.ENABLE || testingId !== undefined"
            :loading="testingId === scope.row.id"
            type="text"
            size="mini"
            @click="handleTest(scope.row.id)"
          >
            测试连接
          </el-button>
          <el-button
            v-if="!scope.row.defaultStatus && scope.row.status === CommonStatusEnum.ENABLE"
            v-hasPermi="['oa:mail-account:update']"
            type="text"
            size="mini"
            @click="handleDefault(scope.row.id)"
          >
            设为默认
          </el-button>
          <el-button
            v-hasPermi="['oa:mail-account:delete']"
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

    <!-- 绑定 / 修改弹窗 -->
    <mail-account-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as AccountApi from '@/api/oa/mail/account'
import * as ProviderApi from '@/api/oa/mail/provider'
import MailAccountForm from './MailAccountForm.vue'

export default {
  name: 'OaMailAccount',
  components: { MailAccountForm },
  data() {
    return {
      DICT_TYPE,
      CommonStatusEnum,
      loading: false, // 列表加载状态
      list: [], // 本人账号列表
      providers: [], // 服务配置列表
      testingId: undefined, // 当前测试账号编号
      queryParams: {
        mail: '',
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
      return Promise.all([
        AccountApi.getMailAccountList(),
        ProviderApi.getSimpleMailProviderList()
      ]).then(([accounts, mailProviders]) => {
        this.providers = mailProviders.data
        // 接口仅返回本人完整账号列表，搜索不改变账号归属范围
        this.list = accounts.data.filter(
          item =>
            item.mail.toLowerCase().includes(this.queryParams.mail.trim().toLowerCase()) &&
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
    /** 测试连接，不发测试邮件 */
    handleTest(id) {
      this.testingId = id
      return AccountApi.testMailAccountConnection(id).then(result => {
        const text =
          'IMAP：' + (result.data.imap ? '连接成功' : '连接失败') +
          '；SMTP：' + (result.data.smtp ? '连接成功' : '连接失败')
        return this.$modal.alert(text)
      }).finally(() => {
        this.testingId = undefined
      })
    },
    /** 设置默认账号 */
    handleDefault(id) {
      return AccountApi.updateMailAccountDefault(id).then(() => {
        this.$modal.msgSuccess('设置成功')
        return this.getList()
      })
    },
    /** 删除操作 */
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除该数据项？').then(() => {
        return AccountApi.deleteMailAccount(id)
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
