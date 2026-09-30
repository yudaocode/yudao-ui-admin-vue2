<template>
  <div class="app-container crm-customer-pool-page">
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
            class="query-control"
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
            class="query-control"
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
            class="query-control"
            clearable
            placeholder="请选择所属行业"
          >
            <el-option
              v-for="item in industryDictDatas"
              :key="item.value"
              :label="item.label"
              :value="toNumber(item.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="客户级别"
          prop="level"
        >
          <el-select
            v-model="queryParams.level"
            class="query-control"
            clearable
            placeholder="请选择客户级别"
          >
            <el-option
              v-for="item in levelDictDatas"
              :key="item.value"
              :label="item.label"
              :value="toNumber(item.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="客户来源"
          prop="source"
        >
          <el-select
            v-model="queryParams.source"
            class="query-control"
            clearable
            placeholder="请选择客户来源"
          >
            <el-option
              v-for="item in sourceDictDatas"
              :key="item.value"
              :label="item.label"
              :value="toNumber(item.value)"
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
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        stripe
        border
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="客户名称"
          prop="name"
          fixed="left"
          width="160"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.name || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="客户来源"
          prop="source"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_SOURCE"
              :value="scope.row.source"
            />
          </template>
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
          width="180"
        />
        <el-table-column
          label="客户级别"
          prop="level"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_LEVEL"
              :value="scope.row.level"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="客户行业"
          prop="industryId"
          width="110"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_CUSTOMER_INDUSTRY"
              :value="scope.row.industryId"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="下次联系时间"
          prop="contactNextTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="备注"
          prop="remark"
          width="200"
        />
        <el-table-column
          label="成交状态"
          prop="dealStatus"
          width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.dealStatus"
            />
          </template>
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
          width="200"
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
          width="110"
        />
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import * as CustomerApi from '@/api/crm/customer'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'

const createQueryParams = () => ({
  pageNo: 1,
  pageSize: 10,
  name: '',
  mobile: '',
  industryId: undefined,
  level: undefined,
  source: undefined,
  sceneType: undefined,
  pool: true
})

export default {
  name: 'CrmCustomerPool',
  data() {
    return {
      DICT_TYPE,
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      queryParams: createQueryParams(),
      requestSequence: 0,
      skipInitialActivation: true
    }
  },
  computed: {
    industryDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_INDUSTRY) },
    levelDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_LEVEL) },
    sourceDictDatas() { return getDictDatas(DICT_TYPE.CRM_CUSTOMER_SOURCE) }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.$nextTick(() => {
      this.skipInitialActivation = false
    })
  },
  activated() {
    if (!this.skipInitialActivation) this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    dateFormatter,
    toNumber(value) {
      return value === '' || value === null || value === undefined ? value : Number(value)
    },
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await CustomerApi.getCustomerPage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = data.list
        this.total = data.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      Object.assign(this.queryParams, createQueryParams())
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openDetail(id) {
      if (!id) return
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出当前客户公海数据？')
      } catch (error) {
        return
      }
      this.exportLoading = true
      try {
        const response = await CustomerApi.exportCustomer(this.queryParams)
        this.$download.excel(response.data, '客户公海.xls')
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 16px;
}

.query-control {
  width: 240px;
}

@media (max-width: 767px) {
  .query-control {
    width: 100%;
  }

  .crm-customer-pool-page ::v-deep .el-form-item {
    display: flex;
    margin-right: 0;
  }

  .crm-customer-pool-page ::v-deep .el-form-item__content {
    flex: 1;
    min-width: 0;
  }
}
</style>
