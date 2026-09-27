<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" size="small" label-width="68px">
      <el-form-item label="套餐名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入套餐名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="toNumber(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
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
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" plain icon="el-icon-plus" @click="openForm('create')" v-hasPermi="['pay:wallet-recharge-package:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="套餐名" align="center" prop="name" />
      <el-table-column label="支付金额" align="center" prop="payPrice"><template v-slot="scope">{{ formatAmount(scope.row.payPrice) }} 元</template></el-table-column>
      <el-table-column label="赠送金额" align="center" prop="bonusPrice"><template v-slot="scope">{{ formatAmount(scope.row.bonusPrice) }} 元</template></el-table-column>
      <el-table-column label="状态" align="center" prop="status"><template v-slot="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openForm('update', scope.row.id)" v-hasPermi="['pay:wallet-recharge-package:update']">编辑</el-button>
          <el-button type="text" size="mini" class="danger-text" @click="handleDelete(scope.row.id)" v-hasPermi="['pay:wallet-recharge-package:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <wallet-recharge-package-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getWalletRechargePackagePage, deleteWalletRechargePackage } from '@/api/pay/wallet/rechargePackage'
import WalletRechargePackageForm from './WalletRechargePackageForm.vue'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'WalletRechargePackage',
  components: { WalletRechargePackageForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, name: null, payPrice: null, bonusPrice: null, status: null, createTime: [] }
    }
  },
  methods: {
    getDictDatas,
    getList() {
      this.loading = true
      return getWalletRechargePackagePage(this.queryParams).then((response) => {
        const page = response.data
        this.list = page.list
        this.total = page.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(id) {
      this.$modal.confirm('是否确认删除编号为"' + id + '"的钱包充值套餐?').then(() => {
        return deleteWalletRechargePackage(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    toNumber(value) {
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return '-'
      const number = Number(value)
      return Number.isFinite(number) ? (number / 100).toFixed(2) : '-'
    }
  },
  created() {
    this.getList()
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
