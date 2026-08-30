<template>
  <el-dialog
    title="请选择表达式"
    :visible.sync="visible"
    append-to-body
    width="720px"
    @open="getList"
  >
    <el-table v-loading="loading" :data="list" size="mini" stripe>
      <el-table-column prop="name" label="名字" min-width="160" show-overflow-tooltip />
      <el-table-column prop="expression" label="表达式" min-width="280" show-overflow-tooltip />
      <el-table-column label="操作" width="90" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="select(scope.row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="expression-pagination">
      <el-pagination
        small
        background
        layout="total, prev, pager, next"
        :current-page="queryParams.pageNo"
        :page-size="queryParams.pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </el-dialog>
</template>

<script>
import { getProcessExpressionPage } from '@/api/bpm/processExpression'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'ProcessExpressionDialog',
  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: '',
        status: CommonStatusEnum.ENABLE
      }
    }
  },
  methods: {
    open(type) {
      this.queryParams.pageNo = 1
      this.queryParams.type = type || ''
      this.visible = true
      this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await getProcessExpressionPage(this.queryParams)
        const data = response && response.data ? response.data : response || {}
        this.list = Array.isArray(data.list) ? data.list : []
        this.total = Number(data.total || 0)
      } catch (e) {
        this.list = []
        this.total = 0
        if (this.$message) this.$message.error('流程表达式加载失败')
      } finally {
        this.loading = false
      }
    },
    handlePageChange(page) {
      this.queryParams.pageNo = page
      this.getList()
    },
    select(row) {
      this.visible = false
      this.$emit('select', row)
    }
  }
}
</script>

<style scoped>
.expression-pagination {
  margin-top: 12px;
  text-align: right;
}
</style>
