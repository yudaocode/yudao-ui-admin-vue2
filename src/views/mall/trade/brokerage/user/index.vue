<template>
  <div class="app-container">
    <doc-alert
      title="【交易】分销返佣"
      url="https://doc.iocoder.cn/mall/trade-brokerage/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="85px"
    >
      <el-form-item
        label="推广员编号"
        prop="bindUserId"
      >
        <el-input
          v-model="queryParams.bindUserId"
          clearable
          placeholder="请输入推广员编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="推广资格"
        prop="brokerageEnabled"
      >
        <el-select
          v-model="queryParams.brokerageEnabled"
          clearable
          placeholder="请选择推广资格"
        >
          <el-option
            :value="true"
            label="有"
          />
          <el-option
            :value="false"
            label="无"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
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
        <el-button
          v-hasPermi="['trade:brokerage-user:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openCreateUserForm"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="用户编号"
        align="center"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="头像"
        align="center"
        prop="avatar"
        width="70"
      >
        <template v-slot="scope">
          <el-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        label="昵称"
        align="center"
        prop="nickname"
        min-width="80"
      />
      <el-table-column
        label="推广人数"
        align="center"
        prop="brokerageUserCount"
        width="80"
      />
      <el-table-column
        label="推广订单数量"
        align="center"
        prop="brokerageOrderCount"
        min-width="110"
      />
      <el-table-column
        label="推广订单金额"
        align="center"
        prop="brokerageOrderPrice"
        min-width="110"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="已提现金额"
        align="center"
        prop="withdrawPrice"
        min-width="100"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="已提现次数"
        align="center"
        prop="withdrawCount"
        min-width="100"
      />
      <el-table-column
        label="未提现金额"
        align="center"
        prop="price"
        min-width="100"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="冻结中佣金"
        align="center"
        prop="frozenPrice"
        min-width="100"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="推广资格"
        align="center"
        prop="brokerageEnabled"
        min-width="105"
      >
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.brokerageEnabled"
            :disabled="!checkPermi(['trade:brokerage-user:update-brokerage-enable'])"
            active-text="有"
            inactive-text="无"
            @change="handleBrokerageEnabledChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="成为推广员时间"
        align="center"
        prop="brokerageTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="上级推广员编号"
        align="center"
        prop="bindUserId"
        width="150"
      />
      <el-table-column
        label="推广员绑定时间"
        align="center"
        prop="bindUserTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="150"
      >
        <template v-slot="scope">
          <el-dropdown
            v-hasPermi="[
              'trade:brokerage-user:user-query',
              'trade:brokerage-user:order-query',
              'trade:brokerage-user:update-bind-user',
              'trade:brokerage-user:clear-bind-user'
            ]"
            @command="handleCommand($event, scope.row)"
          >
            <el-button type="text">
              更多<i class="el-icon-d-arrow-right el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="checkPermi(['trade:brokerage-user:user-query'])"
                command="openBrokerageUserTable"
              >
                推广人
              </el-dropdown-item>
              <el-dropdown-item
                v-if="checkPermi(['trade:brokerage-user:order-query'])"
                command="openBrokerageOrderTable"
              >
                推广订单
              </el-dropdown-item>
              <el-dropdown-item
                v-if="checkPermi(['trade:brokerage-user:update-bind-user'])"
                command="openUpdateBindUserForm"
              >
                修改上级推广人
              </el-dropdown-item>
              <el-dropdown-item
                v-if="scope.row.bindUserId && checkPermi(['trade:brokerage-user:clear-bind-user'])"
                command="handleClearBindUser"
              >
                清除上级推广人
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <BrokerageUserUpdateForm
      ref="updateForm"
      @success="getList"
    />
    <BrokerageUserListDialog ref="listDialog" />
    <BrokerageOrderListDialog ref="orderDialog" />
    <BrokerageUserCreateForm
      ref="createForm"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  clearBindUser,
  getBrokerageUserPage,
  updateBrokerageEnabled
} from '@/api/mall/trade/brokerage/user'
import { checkPermi } from '@/utils/permission'
import { dateFormatter } from '@/utils'
import BrokerageUserUpdateForm from './BrokerageUserUpdateForm.vue'
import BrokerageUserListDialog from './BrokerageUserListDialog.vue'
import BrokerageOrderListDialog from './BrokerageOrderListDialog.vue'
import BrokerageUserCreateForm from './BrokerageUserCreateForm.vue'

export default {
  name: 'TradeBrokerageUser',
  components: {
    BrokerageUserUpdateForm,
    BrokerageUserListDialog,
    BrokerageOrderListDialog,
    BrokerageUserCreateForm
  },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        bindUserId: undefined,
        brokerageEnabled: true,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermi,
    dateFormatter,
    getList() {
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        bindUserId: this.queryParams.bindUserId === '' ? undefined : this.queryParams.bindUserId,
        brokerageEnabled: this.queryParams.brokerageEnabled === ''
          ? undefined
          : this.queryParams.brokerageEnabled
      })
      return getBrokerageUserPage(params)
        .then(response => {
          const page = response.data
          this.list = page.list
          this.total = page.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    handleCommand(command, row) {
      if (command === 'openBrokerageUserTable') this.openBrokerageUserTable(row.id)
      if (command === 'openBrokerageOrderTable') this.openBrokerageOrderTable(row.id)
      if (command === 'openUpdateBindUserForm') this.openUpdateBindUserForm(row)
      if (command === 'handleClearBindUser') this.handleClearBindUser(row)
    },
    openBrokerageUserTable(id) {
      if (this.$refs.listDialog) this.$refs.listDialog.open(id)
    },
    openBrokerageOrderTable(id) {
      if (this.$refs.orderDialog) this.$refs.orderDialog.open(id)
    },
    openUpdateBindUserForm(row) {
      if (this.$refs.updateForm) this.$refs.updateForm.open(row)
    },
    openCreateUserForm() {
      if (this.$refs.createForm) this.$refs.createForm.open()
    },
    async handleClearBindUser(row) {
      try {
        await this.$modal.confirm(`确认要清除"${row.nickname}"的上级推广人吗？`)
        await clearBindUser({ id: row.id })
        this.$modal.msgSuccess('清除成功')
        await this.getList()
      } catch (error) {
        // 用户取消或接口失败时，保留当前列表状态。
      }
    },
    async handleBrokerageEnabledChange(row) {
      const text = row.brokerageEnabled ? '开通' : '关闭'
      try {
        await this.$modal.confirm(`确认要${text}"${row.nickname}"的推广资格吗？`)
        await updateBrokerageEnabled({ id: row.id, enabled: row.brokerageEnabled })
        this.$modal.msgSuccess(text + '成功')
        await this.getList()
      } catch (error) {
        row.brokerageEnabled = !row.brokerageEnabled
      }
    },
    fenToYuanFormat(row, column, cellValue) {
      const price = Number(cellValue)
      return `￥${Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'}`
    }
  }
}
</script>
