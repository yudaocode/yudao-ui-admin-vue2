<template>
  <section
    class="backlog-list"
    aria-label="待回款提醒"
  >
    <el-card
      shadow="never"
      class="filter-card"
    >
      <div class="list-title">待回款提醒</div>
      <el-form
        :inline="true"
        :model="queryParams"
        label-width="78px"
        size="small"
      >
        <el-form-item label="提醒状态">
          <el-select
            v-model="queryParams.remindType"
            placeholder="状态"
            @change="handleQuery"
          >
            <el-option
              v-for="option in RECEIVABLE_REMIND_TYPE"
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
          label="客户名称"
          prop="customerName"
          fixed="left"
          width="150"
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
          width="190"
        />
        <el-table-column
          label="期数"
          prop="period"
          width="90"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.period || '-' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="计划回款金额（元）"
          prop="price"
          width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="计划回款日期"
          prop="returnTime"
          width="150"
          :formatter="dateFormatter2"
        />
        <el-table-column
          label="提前几天提醒"
          prop="remindDays"
          width="140"
        />
        <el-table-column
          label="提醒日期"
          prop="remindTime"
          width="140"
          :formatter="dateFormatter2"
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
          label="负责人"
          prop="ownerUserName"
          width="120"
        />
        <el-table-column
          label="实际回款金额（元）"
          width="160"
        >
          <template slot-scope="scope">{{ formatReceivedPrice(scope.row) }}</template>
        </el-table-column>
        <el-table-column
          label="实际回款日期"
          width="150"
        >
          <template slot-scope="scope">{{ formatReceivedTime(scope.row) }}</template>
        </el-table-column>
        <el-table-column
          label="未回款金额（元）"
          width="160"
        >
          <template slot-scope="scope">{{ formatUnpaidPrice(scope.row) }}</template>
        </el-table-column>
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
        <el-table-column
          label="操作"
          fixed="right"
          width="110"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['crm:receivable:create']"
              type="text"
              size="mini"
              :disabled="!!scope.row.receivableId"
              @click="openReceivableForm(scope.row)"
            >创建回款</el-button>
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

    <receivable-form
      ref="receivableForm"
      @success="handleReceivableSuccess"
    />
  </section>
</template>

<script>
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import { DICT_TYPE } from '@/utils/dict'
import {
  dateFormatter,
  dateFormatter2,
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'
import ReceivableForm from '@/views/crm/receivable/ReceivableForm.vue'
import { RECEIVABLE_REMIND_TYPE } from './common'

export default {
  name: 'ReceivablePlanRemindList',
  components: { ReceivableForm },
  data() {
    return {
      DICT_TYPE,
      RECEIVABLE_REMIND_TYPE,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: { pageNo: 1, pageSize: 10, remindType: 1 }
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
        const page = (await ReceivablePlanApi.getReceivablePlanPage(this.queryParams)).data
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
    formatReceivedPrice(row) {
      return erpPriceInputFormatter(row && row.receivable ? row.receivable.price || 0 : 0)
    },
    formatReceivedTime(row) {
      const time = row && row.receivable && row.receivable.returnTime
      return time ? dateFormatter2(row, null, time) : '-'
    },
    formatUnpaidPrice(row) {
      const plannedPrice = Number(row && row.price || 0)
      const receivedPrice = Number(row && row.receivable && row.receivable.price || 0)
      return erpPriceInputFormatter(plannedPrice - receivedPrice)
    },
    openReceivableForm(row) {
      if (!row || row.receivableId) return
      this.$refs.receivableForm.open('create', undefined, row)
    },
    handleReceivableSuccess() {
      this.getList()
      this.$emit('count-change')
    },
    push(name, id) {
      if (!id) return
      this.$router.push({ name, params: { id }}).catch(() => {})
    },
    openDetail(id) { this.push('CrmReceivablePlanDetail', id) },
    openCustomerDetail(id) { this.push('CrmCustomerDetail', id) }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.list-title { margin-bottom: 18px; font-size: 18px; line-height: 24px; font-weight: 500; }
</style>
