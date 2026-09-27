<template>
  <div class="app-container">
    <doc-alert title="支付宝支付接入" url="https://doc.iocoder.cn/pay/alipay-pay-demo/" />
    <doc-alert title="支付宝、微信退款接入" url="https://doc.iocoder.cn/pay/refund-demo/" />
    <doc-alert title="微信公众号支付接入" url="https://doc.iocoder.cn/pay/wx-pub-pay-demo/" />
    <doc-alert title="微信小程序支付接入" url="https://doc.iocoder.cn/pay/wx-lite-pay-demo/" />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" :loading="formLoading" @click="handleAdd">发起订单</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" stripe>
      <el-table-column label="订单编号" align="center" prop="id" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="商品名字" align="center" prop="spuName" />
      <el-table-column label="支付价格" align="center" prop="price">
        <template v-slot="scope">￥{{ formatPrice(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column label="退款金额" align="center" prop="refundPrice">
        <template v-slot="scope">￥{{ formatPrice(scope.row.refundPrice) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="支付单号" align="center" prop="payOrderId" />
      <el-table-column label="是否支付" align="center" prop="payStatus">
        <template v-slot="scope"><dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.payStatus" /></template>
      </el-table-column>
      <el-table-column label="支付时间" align="center" prop="payTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.payTime) }}</template>
      </el-table-column>
      <el-table-column label="退款时间" align="center" prop="refundTime" width="180">
        <template v-slot="scope">
          <span v-if="scope.row.refundTime">{{ parseTime(scope.row.refundTime) }}</span>
          <span v-else-if="scope.row.payRefundId">退款中，等待退款结果</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handlePay(scope.row)" v-if="!scope.row.payStatus">前往支付</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleRefund(scope.row)" v-if="scope.row.payStatus && !scope.row.payRefundId">发起退款</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="发起订单" :visible.sync="open" width="500px" v-dialogDrag append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="formLoading">
        <el-form-item label="商品" prop="spuId">
          <el-select v-model="form.spuId" placeholder="请输入下单商品" clearable size="small" style="width: 380px">
            <el-option v-for="item in spus" :key="item.id" :label="item.name" :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">￥{{ formatPrice(item.price) }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDemoOrder, getDemoOrderPage, refundDemoOrder } from '@/api/pay/demo/order'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'PayDemoOrder',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      formLoading: false,
      showSearch: true,
      total: 0,
      list: [],
      open: false,
      queryParams: { pageNo: 1, pageSize: 10 },
      form: { spuId: undefined },
      rules: { spuId: [{ required: true, message: '商品编号不能为空', trigger: 'blur' }] },
      spus: [
        { id: 1, name: '华为手机', price: 1 },
        { id: 2, name: '小米电视', price: 10 },
        { id: 3, name: '苹果手表', price: 100 },
        { id: 4, name: '华硕笔记本', price: 1000 },
        { id: 5, name: '蔚来汽车', price: 200000 }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getDemoOrderPage(this.queryParams).then((response) => {
        const page = response.data
        this.list = page.list
        this.total = page.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleAdd() {
      this.form = { spuId: undefined }
      this.open = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    cancel() {
      this.open = false
      this.form = { spuId: undefined }
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        createDemoOrder(this.form).then(() => {
          this.$modal.msgSuccess('新增成功')
          this.open = false
          this.getList()
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    handlePay(row) {
      this.$router.push({
        name: 'PayCashier',
        query: { id: row.payOrderId, returnUrl: encodeURIComponent('/pay/demo/order?id=' + row.id) }
      })
    },
    handleRefund(row) {
      const id = row.id
      this.$modal.confirm('是否确认退款编号为"' + id + '"的示例订单?').then(() => {
        return refundDemoOrder(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('发起退款成功！')
      }).catch(() => {})
    },
    formatPrice(value) {
      const number = Number(value || 0)
      return (Number.isFinite(number) ? number / 100 : 0).toFixed(2)
    }
  }
}
</script>
