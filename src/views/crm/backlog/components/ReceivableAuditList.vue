<template>
  <section
    class="backlog-list"
    aria-label="待审核回款"
  >
    <el-card
      shadow="never"
      class="filter-card"
    >
      <div class="list-title">待审核回款</div>
      <el-form
        :inline="true"
        :model="queryParams"
        label-width="78px"
        size="small"
      >
        <el-form-item label="回款状态">
          <el-select
            v-model="queryParams.auditStatus"
            placeholder="状态"
            @change="handleQuery"
          >
            <el-option
              v-for="option in AUDIT_STATUS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="回款编号"
          prop="no"
          fixed="left"
          width="180"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.no || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="客户名称"
          prop="customerName"
          width="140"
        >
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.customerId"
              type="primary"
              :underline="false"
              @click="openCustomerDetail(scope.row.customerId)"
            >{{ scope.row.customerName || '-' }}</el-link>
            <span v-else>{{ scope.row.customerName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="合同编号"
          prop="contractNo"
          width="180"
        >
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.contractId"
              type="primary"
              :underline="false"
              @click="openContractDetail(scope.row.contractId)"
            >{{ getContractNo(scope.row) }}</el-link>
            <span v-else>{{ getContractNo(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="回款日期"
          prop="returnTime"
          width="140"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="回款金额（元）"
          prop="price"
          width="140"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="回款方式"
          prop="returnType"
          width="130"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE"
              :value="scope.row.returnType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          prop="remark"
          width="200"
        />
        <el-table-column
          label="合同金额（元）"
          prop="contract.totalPrice"
          width="150"
        >
          <template slot-scope="scope">{{ formatContractPrice(scope.row) }}</template>
        </el-table-column>
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
          label="回款状态"
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
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:receivable:update']"
              type="text"
              size="mini"
              :disabled="!scope.row.processInstanceId"
              @click="handleProcessDetail(scope.row)"
            >查看审批</el-button>
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
  </section>
</template>

<script>
import * as ReceivableApi from '@/api/crm/receivable'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, dateFormatter2, erpPriceInputFormatter, erpPriceTableColumnFormatter } from '@/utils'
import { AUDIT_STATUS } from './common'

export default {
  name: 'CrmReceivableAuditList',
  data() {
    return {
      DICT_TYPE,
      AUDIT_STATUS,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: { pageNo: 1, pageSize: 10, auditStatus: 10 }
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    erpPriceTableColumnFormatter,
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const page = (await ReceivableApi.getReceivablePage(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = page.list
        this.total = page.total
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    getContractNo(row) {
      return row && (row.contractNo || row.contract && row.contract.no) || '-'
    },
    formatContractPrice(row) {
      const price = row && row.contract && row.contract.totalPrice
      return price === undefined || price === null ? '-' : erpPriceInputFormatter(price)
    },
    push(name, id) {
      if (!id) return
      this.$router.push({ name, params: { id }}).catch(() => {})
    },
    openDetail(id) { this.push('CrmReceivableDetail', id) },
    openCustomerDetail(id) { this.push('CrmCustomerDetail', id) },
    openContractDetail(id) { this.push('CrmContractDetail', id) },
    handleProcessDetail(row) {
      if (!row || !row.processInstanceId) return
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.list-title { margin-bottom: 18px; font-size: 18px; line-height: 24px; font-weight: 500; }
</style>
