<template>
  <div class="app-container crm-customer-page">
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
          label="客户名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入客户名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="手机"
          prop="mobile"
        >
          <el-input
            v-model="queryParams.mobile"
            clearable
            placeholder="请输入手机"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="所属行业"
          prop="industryId"
        >
          <el-select
            v-model="queryParams.industryId"
            clearable
            placeholder="请选择所属行业"
          >
            <el-option
              v-for="item in industryDictDatas"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="客户级别"
          prop="level"
        >
          <el-select
            v-model="queryParams.level"
            clearable
            placeholder="请选择客户级别"
          >
            <el-option
              v-for="item in levelDictDatas"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="客户来源"
          prop="source"
        >
          <el-select
            v-model="queryParams.source"
            clearable
            placeholder="请选择客户来源"
          >
            <el-option
              v-for="item in sourceDictDatas"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
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
            v-hasPermi="['crm:customer:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:customer:import']"
            type="warning"
            plain
            icon="el-icon-upload2"
            @click="handleImport"
          >导入</el-button>
          <el-button
            v-hasPermi="['crm:customer:export']"
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
          label="客户名称"
          prop="name"
          fixed="left"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >{{ scope.row.name || '-' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="客户来源"
          prop="source"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
            :value="scope.row.source"
          /></template>
        </el-table-column>
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
          label="客户级别"
          prop="level"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
            :value="scope.row.level"
          /></template>
        </el-table-column>
        <el-table-column
          label="客户行业"
          prop="industryId"
          width="110"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
            :value="scope.row.industryId"
          /></template>
        </el-table-column>
        <el-table-column
          label="下次联系时间"
          prop="contactNextTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="锁定状态"
          prop="lockStatus"
          width="100"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.lockStatus"
          /></template>
        </el-table-column>
        <el-table-column
          label="成交状态"
          prop="dealStatus"
          width="100"
        >
          <template slot-scope="scope"><dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.dealStatus"
          /></template>
        </el-table-column>
        <el-table-column
          label="最后跟进时间"
          prop="contactLastTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="最后跟进记录"
          prop="contactLastContent"
          min-width="200"
        />
        <el-table-column
          label="地址"
          prop="detailAddress"
          min-width="180"
        />
        <el-table-column
          label="距离进入公海天数"
          prop="poolDay"
          width="140"
        >
          <template slot-scope="scope"> {{ scope.row.poolDay }} 天</template>
        </el-table-column>
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
          width="100"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="150"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:customer:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['crm:customer:delete']"
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

    <customer-form
      ref="form"
      @success="getList"
    />
    <customer-import-form
      ref="importForm"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import * as CustomerApi from '@/api/crm/customer'
import CustomerForm from './CustomerForm'
import CustomerImportForm from './CustomerImportForm.vue'

export default {
  name: 'CrmCustomer',
  components: { CustomerForm, CustomerImportForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      activeName: '1',
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: '1',
        name: undefined,
        mobile: undefined,
        industryId: undefined,
        level: undefined,
        source: undefined
      }
    }
  },
  computed: {
    industryDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_INDUSTRY) },
    levelDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_LEVEL) },
    sourceDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_SOURCE) }
  },
  created() { this.getList() },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const data = (await CustomerApi.getCustomerPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() {
      this.queryParams.name = undefined
      this.queryParams.mobile = undefined
      this.queryParams.industryId = undefined
      this.queryParams.level = undefined
      this.queryParams.source = undefined
      this.handleQuery()
    },
    handleTabClick(tab) {
      this.queryParams.sceneType = tab.name || (tab.$props && tab.$props.name) || this.activeName
      this.handleQuery()
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleImport() { this.$refs.importForm.open() },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除客户“' + (row.name || row.id) + '”？').then(() => CustomerApi.deleteCustomer(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前客户数据？').then(() => {
        this.exportLoading = true
        return CustomerApi.exportCustomer(this.queryParams)
      }).then(response => {
        this.$download.excel(response.data, '客户.xls')
      }).catch(() => {}).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.search-card { margin-bottom: 16px; }
.danger-text { color: #f56c6c; }
</style>
