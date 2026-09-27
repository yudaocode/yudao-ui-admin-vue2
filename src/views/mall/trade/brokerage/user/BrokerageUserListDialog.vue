<template>
  <el-dialog
    title="推广人列表"
    :visible.sync="dialogVisible"
    width="75%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="85px"
    >
      <el-form-item
        label="用户类型"
        prop="level"
      >
        <el-radio-group
          v-model="queryParams.level"
          @change="handleQuery"
        >
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button :label="1">一级推广人</el-radio-button>
          <el-radio-button :label="2">二级推广人</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="绑定时间"
        prop="bindUserTime"
      >
        <el-date-picker
          v-model="queryParams.bindUserTime"
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
        min-width="80"
      />
      <el-table-column
        label="推广订单数量"
        align="center"
        prop="brokerageOrderCount"
        min-width="110"
      />
      <el-table-column
        label="推广资格"
        align="center"
        prop="brokerageEnabled"
        min-width="80"
      >
        <template v-slot="scope">
          <el-tag v-if="scope.row.brokerageEnabled">有</el-tag>
          <el-tag
            v-else
            type="info"
          >无</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="绑定时间"
        align="center"
        prop="bindUserTime"
        :formatter="dateFormatter"
        width="180"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </el-dialog>
</template>

<script>
import { getBrokerageUserPage } from '@/api/mall/trade/brokerage/user'
import { dateFormatter } from '@/utils'

export default {
  name: 'BrokerageUserListDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        bindUserId: undefined,
        level: 0,
        bindUserTime: []
      }
    }
  },
  methods: {
    dateFormatter,
    open(bindUserId) {
      this.dialogVisible = true
      this.queryParams.bindUserId = bindUserId
      this.$nextTick(() => this.resetQuery())
    },
    getList() {
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        level: this.queryParams.level === 0 ? undefined : this.queryParams.level
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
    }
  }
}
</script>
