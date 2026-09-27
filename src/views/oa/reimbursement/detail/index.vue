<template>
  <div v-loading="detailLoading" class="oa-reimbursement-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题" :span="2"> {{ detailData.title }} </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.OA_APPLY_URGENCY" :value="detailData.urgency" />
      </el-descriptions-item>
      <el-descriptions-item label="证明人">
        <user-select :value="detailData.witnessUserId" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="相关客户"> {{ detailData.customerName }} </el-descriptions-item>
      <el-descriptions-item label="报销方式">
        <dict-tag
          :type="DICT_TYPE.OA_REIMBURSEMENT_PAYMENT_METHOD"
          :value="detailData.paymentMethod"
        />
      </el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <upload-file :value="detailData.fileUrls" disabled :is-show-tip="false" />
      </el-descriptions-item>
      <el-descriptions-item label="申请原因" :span="2">
        <span class="pre-wrap">{{ detailData.reason }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请人"> {{ detailData.creatorName }} </el-descriptions-item>
      <el-descriptions-item label="申请时间">
        {{ formatDate(detailData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <el-tag v-if="detailData.status === BpmProcessInstanceStatus.NOT_START" type="info">
          未提交
        </el-tag>
        <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detailData.status" />
      </el-descriptions-item>
    </el-descriptions>
    <!-- 报销费用明细 -->
    <el-table :data="detailData.items" border class="items-table">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column
        label="费用发生时间"
        prop="expenseTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column label="费用类型" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_EXPENSE_TYPE" :value="scope.row.expenseType" />
        </template>
      </el-table-column>
      <el-table-column label="费用说明" prop="description" min-width="180" show-overflow-tooltip />
      <el-table-column label="票据张数" prop="invoiceCount" width="100" align="center" />
      <el-table-column label="报销金额" prop="price" width="120" align="center" />
    </el-table>
    <div class="items-summary">
      票据合计：{{ detailData.invoiceCount }} 张；金额合计：{{ detailData.totalPrice }} 元
    </div>
  </div>
</template>

<script>
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import * as ReimbursementApi from '@/api/oa/reimbursement'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate, dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/views/oa/utils/constants'

export default {
  name: 'OaReimbursementDetail',
  components: { UserSelect },
  props: {
    // 费用报销编号，BPM 通过业务编号传入
    id: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      detailLoading: false, // 详情的加载中
      detailData: { items: [], fileUrls: [] } // 详情数据
    }
  },
  computed: {
    /** 申请编号（支持路由参数） */
    detailId() {
      return this.id || this.$route.params.id || this.$route.query.id
    }
  },
  watch: {
    detailId() {
      this.getInfo()
    }
  },
  created() {
    this.getInfo()
  },
  methods: {
    formatDate,
    dateFormatter,
    /** 查询详情 */
    getInfo() {
      if (!this.detailId) {
        return
      }
      this.detailLoading = true
      return ReimbursementApi.getReimbursement(Number(this.detailId)).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.items-table {
  margin-top: 16px;
}

.items-summary {
  margin-top: 12px;
  text-align: right;
}
</style>
