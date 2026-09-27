<template>
  <div class="app-container crm-contract-page">
    <doc-alert
      title="【合同】合同管理、合同提醒"
      url="https://doc.iocoder.cn/crm/contract/"
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
        size="small"
        label-width="68px"
        @submit.native.prevent
      >
        <el-form-item
          label="合同编号"
          prop="no"
        >
          <el-input
            v-model="queryParams.no"
            clearable
            placeholder="请输入合同编号"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="合同名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            clearable
            placeholder="请输入合同名称"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="客户"
          prop="customerId"
        >
          <el-select
            v-model="queryParams.customerId"
            clearable
            filterable
            placeholder="请选择客户"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          >
            <el-option
              v-for="item in customerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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
            v-hasPermi="['crm:contract:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['crm:contract:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
          <el-button
            type="info"
            plain
            icon="el-icon-setting"
            @click="$router.push({ name: 'CrmContractConfig' }).catch(() => {})"
          >配置</el-button>
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
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="合同编号"
          prop="no"
          fixed="left"
          width="180"
        />
        <el-table-column
          label="合同名称"
          prop="name"
          fixed="left"
          min-width="160"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="客户名称"
          prop="customerName"
          min-width="140"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openCustomerDetail(scope.row.customerId)"
            >{{ scope.row.customerName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="商机名称"
          prop="businessName"
          min-width="140"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openBusinessDetail(scope.row.businessId)"
            >{{ scope.row.businessName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="合同金额（元）"
          prop="totalPrice"
          width="140"
        >
          <template slot-scope="scope">{{ formatMoney(scope.row.totalPrice) }}</template>
        </el-table-column>
        <el-table-column
          label="下单时间"
          prop="orderDate"
          width="120"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="合同开始时间"
          prop="startTime"
          width="120"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="合同结束时间"
          prop="endTime"
          width="120"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="客户签约人"
          prop="signContactName"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openContactDetail(scope.row.signContactId)"
            >{{ scope.row.signContactName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="公司签约人"
          prop="signUserName"
          min-width="130"
        />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="160"
        />
        <el-table-column
          label="已回款金额（元）"
          prop="totalReceivablePrice"
          width="140"
        >
          <template slot-scope="scope">{{ formatMoney(scope.row.totalReceivablePrice) }}</template>
        </el-table-column>
        <el-table-column
          label="未回款金额（元）"
          width="140"
        >
          <template slot-scope="scope">{{ formatMoney(Number(scope.row.totalPrice || 0) - Number(scope.row.totalReceivablePrice || 0)) }}</template>
        </el-table-column>
        <el-table-column
          label="最后跟进时间"
          prop="contactLastTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="负责人"
          prop="ownerUserName"
          width="120"
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
          label="合同状态"
          prop="auditStatus"
          fixed="right"
          width="120"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_AUDIT_STATUS"
              :value="scope.row.auditStatus"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="250"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.auditStatus === 0"
              v-hasPermi="['crm:contract:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="scope.row.auditStatus === 0"
              v-hasPermi="['crm:contract:update']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row)"
            >提交审核</el-button>
            <el-button
              v-else
              v-hasPermi="['crm:contract:update']"
              type="text"
              size="mini"
              @click="handleProcessDetail(scope.row)"
            >查看审批</el-button>
            <el-button
              v-hasPermi="['crm:contract:query']"
              type="text"
              size="mini"
              @click="openDetail(scope.row.id)"
            >详情</el-button>
            <el-button
              v-hasPermi="['crm:contract:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
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

    <ContractForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as ContractApi from '@/api/crm/contract'
import * as CustomerApi from '@/api/crm/customer'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, dateFormatter2 } from '@/utils'
import ContractForm from './ContractForm.vue'

export default {
  name: 'CrmContract',
  components: { ContractForm },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      total: 0,
      list: [],
      exportLoading: false,
      activeName: '1',
      customerList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        sceneType: '1',
        name: undefined,
        customerId: undefined,
        no: undefined
      }
    }
  },
  created() {
    this.getList()
    CustomerApi.getCustomerSimpleList().then((response) => {
      this.customerList = response.data
    })
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    formatMoney(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : '-'
    },
    handleTabClick(tab) {
      this.queryParams.sceneType = String(tab.name || this.activeName)
      this.handleQuery()
    },
    async getList() {
      this.loading = true
      try {
        const data = (await ContractApi.getContractPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmContractDetail', params: { id }}).catch(() => {})
    },
    openCustomerDetail(id) {
      this.$router.push({ name: 'CrmCustomerDetail', params: { id }}).catch(() => {})
    },
    openContactDetail(id) {
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    },
    openBusinessDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    handleDelete(id) {
      this.$modal.confirm('是否确认删除合同编号为"' + id + '"的数据项?').then(() => ContractApi.deleteContract(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前合同数据?').then(() => {
        this.exportLoading = true
        return ContractApi.exportContract(this.queryParams)
      }).then((response) => {
        this.$download.excel(response.data, '合同.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    handleSubmit(row) {
      this.$modal.confirm('您确定提交【' + row.name + '】审核吗？').then(() => ContractApi.submitContract(row.id)).then(() => {
        this.$modal.msgSuccess('提交审核成功')
        this.getList()
      }).catch(() => {})
    },
    handleProcessDetail(row) {
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstanceId }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.danger-text {
  color: #f56c6c;
}
</style>
