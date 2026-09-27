<template>
  <div class="customer-limit-config-list">
    <div class="table-toolbar">
      <el-button
        plain
        icon="el-icon-refresh"
        @click="handleQuery"
      >刷新</el-button>
      <el-button
        v-hasPermi="['crm:customer-limit-config:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
      />
      <el-table-column
        label="规则适用人群"
        align="center"
        min-width="160"
      >
        <template slot-scope="scope">{{ formatUsers(scope.row) }}</template>
      </el-table-column>
      <el-table-column
        label="规则适用部门"
        align="center"
        min-width="160"
      >
        <template slot-scope="scope">{{ formatDepts(scope.row) }}</template>
      </el-table-column>
      <el-table-column
        :label="limitCountLabel"
        align="center"
        prop="maxCount"
        min-width="130"
      />
      <el-table-column
        v-if="confType === LimitConfType.CUSTOMER_QUANTITY_LIMIT"
        label="成交客户是否占用拥有客户数"
        align="center"
        prop="dealCountEnabled"
        min-width="210"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.dealCountEnabled"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        width="120"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['crm:customer-limit-config:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['crm:customer-limit-config:delete']"
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

    <customer-limit-config-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import * as CustomerLimitConfigApi from '@/api/crm/customer/limitConfig'
import { dateFormatter } from '@/utils'
import { DICT_TYPE } from '@/utils/dict'
import CustomerLimitConfigForm from './CustomerLimitConfigForm.vue'

export default {
  name: 'CustomerLimitConfigList',
  components: { CustomerLimitConfigForm },
  props: {
    confType: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      DICT_TYPE,
      LimitConfType: CustomerLimitConfigApi.LimitConfType,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: this.confType
      }
    }
  },
  computed: {
    limitCountLabel() {
      return this.confType === this.LimitConfType.CUSTOMER_QUANTITY_LIMIT
        ? '拥有客户数上限'
        : '锁定客户数上限'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询列表 */
    async getList() {
      this.loading = true
      try {
        const data = (await CustomerLimitConfigApi.getCustomerLimitConfigPage(this.queryParams)).data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    /** 添加/修改操作 */
    openForm(type, id) {
      this.$refs.form.open(type, this.confType, id)
    },
    /** 删除按钮操作 */
    handleDelete(id) {
      this.$modal.confirm('是否确认删除编号为“' + id + '”的客户限制配置？').then(() => {
        return CustomerLimitConfigApi.deleteCustomerLimitConfig(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    formatUsers(row) {
      return Array.isArray(row.users) && row.users.length
        ? row.users.map(user => user.nickname).join('，')
        : ''
    },
    formatDepts(row) {
      return Array.isArray(row.depts) && row.depts.length
        ? row.depts.map(dept => dept.name).join('，')
        : ''
    }
  }
}
</script>

<style scoped>
.table-toolbar {
  margin-bottom: 16px;
}

.danger-text {
  color: #f56c6c;
}
</style>
