<template>
  <Dialog
    title="关联商机"
    v-model="dialogVisible"
    @closed="handleClosed"
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item
        label="商机名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商机名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          v-hasPermi="['crm:business:create']"
          type="primary"
          icon="el-icon-plus"
          @click="openForm"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="businessTable"
      v-loading="loading"
      :data="list"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="商机名称"
        fixed="left"
        align="center"
        prop="name"
        min-width="160"
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
        label="商机金额"
        align="center"
        prop="totalPrice"
        width="120"
        :formatter="erpPriceTableColumnFormatter"
      />
      <el-table-column
        label="客户名称"
        align="center"
        prop="customerName"
        min-width="140"
      />
      <el-table-column
        label="商机组"
        align="center"
        prop="statusTypeName"
        min-width="120"
      />
      <el-table-column
        label="商机阶段"
        align="center"
        prop="statusName"
        min-width="120"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="loading"
        @click="submitForm"
      >确 定</el-button>
      <el-button
        :disabled="loading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>

    <business-form
      ref="form"
      @success="getList"
    />
  </Dialog>
</template>

<script>
import { getBusinessPageByCustomer } from '@/api/crm/business'
import Dialog from '@/components/Dialog'
import { erpPriceTableColumnFormatter } from '@/utils'
import BusinessForm from '../BusinessForm.vue'

export default {
  name: 'BusinessListModal',
  components: { Dialog, BusinessForm },
  props: {
    customerId: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      selectedRows: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        customerId: undefined
      }
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    erpPriceTableColumnFormatter,
    async open() {
      this.dialogVisible = true
      this.queryParams.customerId = this.customerId
      this.queryParams.pageNo = 1
      this.selectedRows = []
      await this.getList()
    },
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await getBusinessPageByCustomer(this.queryParams)).data
        if (requestId !== this.requestSequence) return
        this.list = data.list
        this.total = data.total
        this.selectedRows = []
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm && this.$refs.queryForm.resetFields()
      this.queryParams.customerId = this.customerId
      this.handleQuery()
    },
    openForm() {
      this.$refs.form.open('create')
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    submitForm() {
      const businessIds = this.selectedRows.map(row => row.id)
      if (businessIds.length === 0) {
        this.$modal.msgError('未选择商机')
        return
      }
      this.dialogVisible = false
      this.$emit('success', businessIds, this.selectedRows.slice())
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmBusinessDetail', params: { id }}).catch(() => {})
    },
    handleClosed() {
      this.requestSequence += 1
      this.selectedRows = []
      this.list = []
      this.total = 0
      this.$nextTick(() => this.$refs.businessTable && this.$refs.businessTable.clearSelection())
    }
  }
}
</script>
