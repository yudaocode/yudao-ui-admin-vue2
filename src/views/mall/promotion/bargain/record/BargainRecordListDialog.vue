<template>
  <el-dialog
    title="助力列表"
    :visible.sync="dialogVisible"
    width="900px"
    custom-class="bargain-record-list-dialog"
    append-to-body
    @closed="handleClosed"
  >
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="用户编号"
        align="center"
        prop="userId"
        min-width="90"
      />
      <el-table-column
        label="用户头像"
        align="center"
        prop="avatar"
        min-width="90"
      >
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        label="用户昵称"
        prop="nickname"
        min-width="130"
        show-overflow-tooltip
      >
        <template slot-scope="scope">{{ scope.row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column
        label="砍价金额"
        prop="reducePrice"
        min-width="110"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="助力时间"
        align="center"
        prop="createTime"
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
import * as BargainHelpApi from '@/api/mall/promotion/bargain/bargainHelp'
import { dateFormatter } from '@/utils'

export default {
  name: 'BargainRecordListDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      requestSequence: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        recordId: undefined
      }
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    dateFormatter,
    open(recordId) {
      this.requestSequence += 1
      this.dialogVisible = true
      this.queryParams.recordId = recordId
      this.queryParams.pageNo = 1
      this.list = []
      this.total = 0
      return this.getList()
    },
    async getList() {
      if (this.queryParams.recordId === undefined || this.queryParams.recordId === null) {
        return false
      }
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await BargainHelpApi.getBargainHelpPage({ ...this.queryParams })
        if (requestId !== this.requestSequence || !this.dialogVisible) return false
        const page = response.data
        this.list = page.list
        this.total = page.total
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      return this.handleQuery()
    },
    handleClosed() {
      this.requestSequence += 1
      this.loading = false
      this.list = []
      this.total = 0
      this.queryParams.pageNo = 1
      this.queryParams.recordId = undefined
    },
    fenToYuanFormat(row, column, cellValue) {
      const price = Number(cellValue)
      return `￥${Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'}`
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .bargain-record-list-dialog {
  max-width: calc(100vw - 30px);
}

@media (max-width: 768px) {
  ::v-deep .bargain-record-list-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 5vh !important;
  }
}
</style>
