<template>
  <el-dialog
    title="拼团列表"
    :visible.sync="dialogVisible"
    width="950px"
    custom-class="combination-record-dialog"
    append-to-body
  >
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        align="center"
        label="编号"
        prop="id"
        min-width="80"
      />
      <el-table-column
        align="center"
        label="头像"
        prop="avatar"
        min-width="80"
      >
        <template v-slot="scope">
          <el-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="昵称"
        prop="nickname"
        min-width="120"
      >
        <template v-slot="scope">{{ scope.row.nickname || (scope.row.userId === 0 ? '虚拟团员' : '-') }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="开团团长"
        prop="headId"
        min-width="100"
      >
        <template v-slot="scope">
          <el-tag :type="isHead(scope.row) ? 'danger' : 'info'">
            {{ isHead(scope.row) ? '团长' : '团员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="参团时间"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) || '-' }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="结束时间"
        prop="endTime"
        width="180"
      >
        <template v-slot="scope">{{ parseTime(scope.row.endTime) || '-' }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        label="拼团状态"
        prop="status"
        min-width="120"
      >
        <template v-slot="scope">
          <dict-tag
            :type="recordStatusDictType"
            :value="scope.row.status"
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
  </el-dialog>
</template>

<script>
import * as CombinationRecordApi from '@/api/mall/promotion/combination/combinationRecord'
import { DICT_TYPE } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

const RECORD_STATUS_DICT_TYPE = DICT_TYPE.PROMOTION_COMBINATION_RECORD_STATUS ||
  'promotion_combination_record_status'

export default {
  name: 'CombinationRecordListDialog',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      dialogVisible: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        headId: undefined
      },
      recordStatusDictType: RECORD_STATUS_DICT_TYPE
    }
  },
  methods: {
    /** 展示指定团长和团员的分页记录。 */
    open(headId) {
      this.dialogVisible = true
      this.queryParams.pageNo = 1
      this.queryParams.headId = headId
      return this.getList()
    },
    getList() {
      this.loading = true
      return CombinationRecordApi.getCombinationRecordPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    isHead(row) {
      return Number(row.headId) === 0
    },
    parseTime
  }
}
</script>

<style lang="scss" scoped>
::v-deep .combination-record-dialog {
  max-width: calc(100vw - 30px);
}

@media (max-width: 768px) {
  ::v-deep .combination-record-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 5vh !important;
  }
}
</style>
