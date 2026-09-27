<template>
  <Dialog
    title="关联联系人"
    v-model="dialogVisible"
    @closed="handleClosed"
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="90px"
      @submit.native.prevent
    >
      <el-form-item
        label="联系人名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入联系人名称"
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
      ref="contactTable"
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
        align="center"
        fixed="left"
        label="姓名"
        prop="name"
        min-width="140"
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
        align="center"
        label="手机号"
        prop="mobile"
        min-width="120"
      />
      <el-table-column
        align="center"
        label="职位"
        prop="post"
        min-width="100"
      />
      <el-table-column
        align="center"
        label="直属上级"
        prop="parentName"
        min-width="110"
      />
      <el-table-column
        align="center"
        label="是否关键决策人"
        prop="master"
        min-width="130"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.master"
          />
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

    <contact-form
      ref="form"
      @success="getList"
    />
  </Dialog>
</template>

<script>
import { getContactPageByCustomer } from '@/api/crm/contact'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import ContactForm from '../ContactForm.vue'

export default {
  name: 'ContactListModal',
  components: { Dialog, ContactForm },
  props: {
    customerId: { type: [Number, String], default: undefined }
  },
  data() {
    return {
      DICT_TYPE,
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
        const data = (await getContactPageByCustomer(this.queryParams)).data
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
      const contactIds = this.selectedRows.map(row => row.id)
      if (contactIds.length === 0) {
        this.$modal.msgError('未选择联系人')
        return
      }
      this.dialogVisible = false
      this.$emit('success', contactIds, this.selectedRows.slice())
    },
    openDetail(id) {
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    },
    handleClosed() {
      this.requestSequence += 1
      this.selectedRows = []
      this.list = []
      this.total = 0
      this.$nextTick(() => this.$refs.contactTable && this.$refs.contactTable.clearSelection())
    }
  }
}
</script>
