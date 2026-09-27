<template>
  <div class="app-container crm-contact-page">
    <doc-alert
      title="【客户】客户管理、公海客户"
      url="https://doc.iocoder.cn/crm/customer/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />

    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="68px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="客户"
          prop="customerId"
        >
          <el-select
            v-model="queryParams.customerId"
            clearable
            filterable
            placeholder="请选择客户"
          >
            <el-option
              v-for="item in customerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="姓名"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入姓名"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        ><el-input
          v-model="queryParams.mobile"
          clearable
          placeholder="请输入手机号"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="电话"
          prop="telephone"
        ><el-input
          v-model="queryParams.telephone"
          clearable
          placeholder="请输入电话"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="微信"
          prop="wechat"
        ><el-input
          v-model="queryParams.wechat"
          clearable
          placeholder="请输入微信"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="电子邮箱"
          prop="email"
        ><el-input
          v-model="queryParams.email"
          clearable
          placeholder="请输入电子邮箱"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            v-hasPermi="['crm:contact:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:contact:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          label="我负责的"
          name="1"
        />
        <el-tab-pane
          label="我参与的"
          name="2"
        />
        <el-tab-pane
          label="下属负责的"
          name="3"
        />
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
      >
        <el-table-column
          label="联系人姓名"
          prop="name"
          fixed="left"
          min-width="160"
        >
          <template slot-scope="scope"><el-link
            type="primary"
            :underline="false"
            @click="openDetail(scope.row.id)"
          >{{ scope.row.name || '-' }}</el-link></template>
        </el-table-column>
        <el-table-column
          label="客户名称"
          prop="customerName"
          fixed="left"
          width="140"
        ><template slot-scope="scope"><el-link
          type="primary"
          :underline="false"
          @click="openCustomerDetail(scope.row.customerId)"
        >{{ scope.row.customerName || '-' }}</el-link></template></el-table-column>
        <el-table-column
          label="手机"
          prop="mobile"
          width="130"
        />
        <el-table-column
          label="电话"
          prop="telephone"
          width="130"
        />
        <el-table-column
          label="邮箱"
          prop="email"
          min-width="180"
        />
        <el-table-column
          label="职位"
          prop="post"
          width="120"
        />
        <el-table-column
          label="地址"
          prop="detailAddress"
          min-width="160"
        />
        <el-table-column
          label="关键决策人"
          prop="master"
          width="110"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.master"
        /></template></el-table-column>
        <el-table-column
          label="直属上级"
          prop="parentName"
          width="140"
        ><template slot-scope="scope"><el-link
          v-if="scope.row.parentId"
          type="primary"
          :underline="false"
          @click="openDetail(scope.row.parentId)"
        >{{ scope.row.parentName }}</el-link><span v-else>{{ scope.row.parentName || '-' }}</span></template></el-table-column>
        <el-table-column
          label="下次联系时间"
          prop="contactNextTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="性别"
          prop="sex"
          width="90"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.SYSTEM_USER_SEX"
          :value="scope.row.sex"
        /></template></el-table-column>
        <el-table-column
          label="备注"
          prop="remark"
          min-width="180"
        />
        <el-table-column
          label="最后跟进时间"
          prop="contactLastTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="负责人"
          prop="ownerUserName"
          width="110"
        />
        <el-table-column
          label="所属部门"
          prop="ownerUserDeptName"
          width="120"
        />
        <el-table-column
          label="更新时间"
          prop="updateTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="创建人"
          prop="creatorName"
          width="120"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="150"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:contact:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['crm:contact:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <contact-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import * as ContactApi from '@/api/crm/contact'
import * as CustomerApi from '@/api/crm/customer'
import ContactForm from './ContactForm'

export default {
  name: 'CrmContact',
  components: { ContactForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      customerList: [],
      activeName: '1',
      queryParams: { pageNo: 1, pageSize: 10, sceneType: '1', customerId: undefined, name: undefined, mobile: undefined, telephone: undefined, wechat: undefined, email: undefined }
    }
  },
  created() { this.getList(); this.getCustomers() },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const data = (await ContactApi.getContactPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally { this.loading = false }
    },
    async getCustomers() {
      this.customerList = (await CustomerApi.getCustomerSimpleList()).data
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      this.queryParams.customerId = undefined; this.queryParams.name = undefined; this.queryParams.mobile = undefined
      this.queryParams.telephone = undefined; this.queryParams.wechat = undefined; this.queryParams.email = undefined
      this.handleQuery()
    },
    handleTabClick(tab) { this.queryParams.sceneType = tab.name || (tab.$props && tab.$props.name) || this.activeName; this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'CrmContactDetail', params: { id }}) },
    openCustomerDetail(id) { this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {}) },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除联系人“' + (row.name || row.id) + '”？').then(() => ContactApi.deleteContact(row.id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前联系人数据？').then(() => { this.exportLoading = true; return ContactApi.exportContact(this.queryParams) }).then(response => { this.$download.excel(response.data, '联系人.xls') }).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
