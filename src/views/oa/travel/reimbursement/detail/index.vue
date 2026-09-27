<template>
  <div v-loading="loading" class="oa-travel-reimbursement-detail">
    <el-descriptions :column="3" border>
      <el-descriptions-item label="单据编号">{{ detail.no }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ detail.creatorName }}</el-descriptions-item>
      <el-descriptions-item label="申请部门">{{ detail.deptName }}</el-descriptions-item>
      <el-descriptions-item label="单据状态">
        <el-tag v-if="detail.status === BpmProcessInstanceStatus.NOT_START" type="info">未提交</el-tag>
        <dict-tag
          v-else
          :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
          :value="detail.status === undefined || detail.status === null ? '' : detail.status"
        />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ formatDate(detail.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="关联出差申请" :span="3">
        {{ detail.travelApplyNo }}
      </el-descriptions-item>
      <el-descriptions-item label="出差事由" :span="3">{{ detail.reason }}</el-descriptions-item>
      <el-descriptions-item label="开始日期">
        {{ formatDate(detail.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束日期">
        {{ formatDate(detail.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="出差天数">{{ detail.days }}</el-descriptions-item>
      <el-descriptions-item label="报销总金额">{{ detail.totalPrice }}</el-descriptions-item>
      <el-descriptions-item label="支付状态" :span="2">
        <dict-tag :type="DICT_TYPE.OA_PAY_STATUS" :value="detail.payStatus === undefined || detail.payStatus === null ? '' : detail.payStatus" />
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="3">{{ detail.remark }}</el-descriptions-item>
      <el-descriptions-item label="附件" :span="3">
        <upload-file :value="detail.fileUrls || []" disabled :is-show-tip="false" />
      </el-descriptions-item>
    </el-descriptions>
    <!-- 费用明细 -->
    <div class="detail-title">费用明细</div>
    <el-table :data="detail.items" border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="费用类型" width="140">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_EXPENSE_TYPE" :value="scope.row.expenseType === undefined || scope.row.expenseType === null ? '' : scope.row.expenseType" />
        </template>
      </el-table-column>
      <el-table-column label="发生日期" width="120">
        <template slot-scope="scope">{{ formatDate(scope.row.expenseTime, 'YYYY-MM-DD') }}</template>
      </el-table-column>
      <el-table-column label="出发地" prop="departureCity" min-width="150" />
      <el-table-column label="到达地" prop="arrivalCity" min-width="150" />
      <el-table-column label="金额(元)" prop="price" width="130" align="right" />
      <el-table-column label="费用说明" prop="description" min-width="180" />
    </el-table>
  </div>
</template>

<script>
import * as TravelApi from '@/api/oa/travel/reimbursement'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'

export default {
  name: 'OaTravelReimbursementDetail',
  components: { UploadFile },
  props: {
    // 单据编号，列表弹窗与 BPM 业务表单共用
    id: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      loading: false,
      detail: { items: [], fileUrls: [] }
    }
  },
  watch: {
    id: {
      handler() {
        this.getInfo()
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    getInfo() {
      this.detail = { items: [], fileUrls: [] }
      if (!this.id) return
      this.loading = true
      return TravelApi.getTravelReimbursement(Number(this.id)).then(response => {
        this.detail = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.detail-title {
  margin: 20px 0 12px;
  font-weight: 700;
}
</style>
