<template>
  <div class="app-container">
    <doc-alert
      title="【交易】分销返佣"
      url="https://doc.iocoder.cn/mall/trade-brokerage/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="用户编号"
        prop="userId"
      >
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="提现类型"
        prop="type"
      >
        <el-select
          v-model="queryParams.type"
          placeholder="请选择提现类型"
          clearable
        >
          <el-option
            v-for="dict in withdrawTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="账号"
        prop="userAccount"
      >
        <el-input
          v-model="queryParams.userAccount"
          placeholder="请输入账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="真实名字"
        prop="userName"
      >
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入真实名字"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="提现银行"
        prop="bankName"
      >
        <el-select
          v-model="queryParams.bankName"
          placeholder="请选择提现银行"
          clearable
        >
          <el-option
            v-for="dict in bankNameDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option
            v-for="dict in withdrawStatusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="申请时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
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
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="编号"
        align="left"
        prop="id"
        min-width="60"
      />
      <el-table-column
        label="用户信息"
        align="left"
        min-width="120"
      >
        <template v-slot="scope">
          <div>编号：{{ scope.row.userId }}</div>
          <div>昵称：{{ scope.row.userNickname }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="提现金额"
        align="left"
        prop="price"
        min-width="80"
      >
        <template v-slot="scope">
          <div>金额：￥{{ fenToYuan(scope.row.price) }}</div>
          <div>手续费：￥{{ fenToYuan(scope.row.feePrice) }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="提现方式"
        align="left"
        prop="type"
        min-width="80"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.BROKERAGE_WITHDRAW_TYPE"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="提现信息"
        align="left"
        min-width="120"
      >
        <template v-slot="scope">
          <div v-if="scope.row.type === BrokerageWithdrawTypeEnum.WALLET.type">-</div>
          <div v-else>
            <div v-if="scope.row.userAccount">账号：{{ scope.row.userAccount }}</div>
            <div v-if="scope.row.userName">真实姓名：{{ scope.row.userName }}</div>
          </div>
          <template v-if="scope.row.type === BrokerageWithdrawTypeEnum.BANK.type">
            <div>
              银行名称：
              <dict-tag
                :type="DICT_TYPE.BROKERAGE_BANK_NAME"
                :value="scope.row.bankName"
              />
            </div>
            <div>开户地址：{{ scope.row.bankAddress }}</div>
          </template>
          <div
            v-if="scope.row.qrCodeUrl"
            class="withdraw-qr-code-wrap"
          >
            <div>收款码：</div>
            <el-image
              :src="scope.row.qrCodeUrl"
              class="withdraw-qr-code"
              :preview-src-list="[scope.row.qrCodeUrl]"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="申请时间"
        align="left"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="备注"
        align="left"
        prop="remark"
      />
      <el-table-column
        label="状态"
        align="left"
        prop="status"
        min-width="120"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.BROKERAGE_WITHDRAW_STATUS"
            :value="scope.row.status"
          />
          <div
            v-if="scope.row.auditTime"
            class="withdraw-status-detail"
          >
            时间：{{ formatDate(scope.row.auditTime) }}
          </div>
          <div
            v-if="scope.row.auditReason"
            class="withdraw-status-detail"
          >
            审核原因：{{ scope.row.auditReason }}
          </div>
          <div
            v-if="scope.row.transferErrorMsg"
            class="withdraw-status-detail transfer-error"
          >
            转账失败原因：{{ scope.row.transferErrorMsg }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="left"
        width="110"
        fixed="right"
      >
        <template v-slot="scope">
          <template
            v-if="
              scope.row.status === BrokerageWithdrawStatusEnum.AUDITING.status &&
                !scope.row.payTransferId
            "
          >
            <el-button
              v-hasPermi="['trade:brokerage-withdraw:audit']"
              type="text"
              size="mini"
              @click="handleApprove(scope.row.id)"
            >通过</el-button>
            <el-button
              v-hasPermi="['trade:brokerage-withdraw:audit']"
              type="text"
              size="mini"
              class="reject-button"
              @click="openForm(scope.row.id)"
            >驳回</el-button>
          </template>
          <template v-if="scope.row.status === BrokerageWithdrawStatusEnum.WITHDRAW_FAIL.status">
            <el-button
              v-hasPermi="['trade:brokerage-withdraw:audit']"
              type="text"
              size="mini"
              class="retry-button"
              @click="handleRetryTransfer(scope.row.id)"
            >重新转账</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 驳回表单弹窗 -->
    <BrokerageWithdrawRejectForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as BrokerageWithdrawApi from '@/api/mall/trade/brokerage/withdraw'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { parseTime } from '@/utils/ruoyi'
import BrokerageWithdrawRejectForm from './BrokerageWithdrawRejectForm.vue'

const BROKERAGE_BANK_NAME = 'brokerage_bank_name'
const BROKERAGE_WITHDRAW_TYPE = 'brokerage_withdraw_type'
const BROKERAGE_WITHDRAW_STATUS = 'brokerage_withdraw_status'

const BrokerageWithdrawStatusEnum = {
  AUDITING: { status: 0, name: '审核中' },
  WITHDRAW_FAIL: { status: 21, name: '提现失败' }
}

const BrokerageWithdrawTypeEnum = {
  WALLET: { type: 1, name: '钱包' },
  BANK: { type: 2, name: '银行卡' }
}

export default {
  name: 'BrokerageWithdraw',
  components: { BrokerageWithdrawRejectForm },
  data() {
    return {
      DICT_TYPE: Object.assign({}, DICT_TYPE, {
        BROKERAGE_BANK_NAME,
        BROKERAGE_WITHDRAW_TYPE,
        BROKERAGE_WITHDRAW_STATUS
      }),
      BrokerageWithdrawStatusEnum,
      BrokerageWithdrawTypeEnum,
      withdrawTypeDictDatas: getDictDatas(BROKERAGE_WITHDRAW_TYPE),
      bankNameDictDatas: getDictDatas(BROKERAGE_BANK_NAME),
      withdrawStatusDictDatas: getDictDatas(BROKERAGE_WITHDRAW_STATUS),
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: null,
        type: undefined,
        userName: null,
        userAccount: null,
        bankName: undefined,
        status: undefined,
        auditReason: null,
        auditTime: [],
        remark: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询列表 */
    getList() {
      this.loading = true
      return BrokerageWithdrawApi.getBrokerageWithdrawPage(this.queryParams)
        .then((response) => {
          const page = response.data
          this.list = page.list
          this.total = page.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 打开驳回弹窗 */
    openForm(id) {
      this.$refs.form.open(id)
    },
    /** 审核通过 */
    handleApprove(id) {
      this.loading = true
      return this.$modal.confirm('确定要审核通过吗？')
        .then(() => BrokerageWithdrawApi.approveBrokerageWithdraw(id))
        .then(() => {
          this.$modal.msgSuccess('操作成功')
          return this.getList()
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    /** 重新转账 */
    handleRetryTransfer(id) {
      this.loading = true
      return this.$modal.confirm('确定要重新转账吗？')
        .then(() => BrokerageWithdrawApi.approveBrokerageWithdraw(id))
        .then(() => {
          this.$modal.msgSuccess('操作成功')
          return this.getList()
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    toNumber(value) {
      if (value === '' || value === null || value === undefined) return value
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    /** 金额格式化：后端以分存储。 */
    fenToYuan(value) {
      const price = Number(value)
      return Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'
    },
    formatDate(value) {
      return parseTime(value) || ''
    }
  }
}
</script>

<style scoped>
.withdraw-qr-code-wrap {
  margin-top: 8px;
}

.withdraw-qr-code {
  width: 40px;
  height: 40px;
}

.withdraw-status-detail {
  font-size: 12px;
}

.transfer-error,
.reject-button {
  color: #f56c6c;
}

.retry-button {
  color: #e6a23c;
}
</style>
