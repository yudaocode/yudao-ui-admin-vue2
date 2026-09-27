<template>
  <div v-loading="detailLoading" class="oa-supply-apply-detail">
    <content-wrap>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="单据编号">{{ detailData.no }}</el-descriptions-item>
        <el-descriptions-item label="单据状态">
          <el-tag v-if="detailData.status === -1" type="info">未提交</el-tag>
          <dict-tag
            v-else-if="detailData.status !== undefined"
            :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
            :value="detailData.status"
          />
        </el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailData.creatorName }}</el-descriptions-item>
        <el-descriptions-item label="申请部门">{{ detailData.deptName }}</el-descriptions-item>
        <el-descriptions-item label="领用日期">
          {{ formatDate(detailData.applyTime, 'YYYY-MM-DD') }}
        </el-descriptions-item>
        <el-descriptions-item label="使用类型">
          <dict-tag
            v-if="detailData.useType !== undefined"
            :type="DICT_TYPE.OA_SUPPLY_USE_TYPE"
            :value="detailData.useType"
          />
        </el-descriptions-item>
        <el-descriptions-item label="领取方式">
          <dict-tag
            v-if="detailData.pickupMethod !== undefined"
            :type="DICT_TYPE.OA_SUPPLY_PICKUP_METHOD"
            :value="detailData.pickupMethod"
          />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(detailData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="申请事由" :span="2">
          {{ detailData.reason }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
        <el-descriptions-item label="附件" :span="2">
          <upload-file :value="detailData.fileUrls || []" disabled :is-show-tip="false" />
        </el-descriptions-item>
      </el-descriptions>
      <!-- 领用明细 -->
      <div class="detail-title">领用明细</div>
      <el-table :data="detailData.items" border show-overflow-tooltip>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="物品名称" prop="itemName" min-width="160" />
        <el-table-column label="规格型号" prop="model" min-width="120" />
        <el-table-column label="计量单位" prop="unit" width="90" align="center" />
        <el-table-column label="管理类型" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SUPPLY_MANAGE_TYPE" :value="scope.row.manageType" />
          </template>
        </el-table-column>
        <el-table-column label="领用数量" prop="applyQuantity" width="140" align="center" />
      </el-table>
    </content-wrap>
  </div>
</template>

<script>
import * as SupplyApplyApi from '@/api/oa/supply/apply'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaSupplyApplyBusinessDetail',
  components: { UploadFile },
  props: {
    id: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      DICT_TYPE,
      detailLoading: false,
      detailData: { items: [], fileUrls: [] }
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
      const id = this.id || (this.$route && this.$route.query && this.$route.query.id)
      if (!id) return
      this.detailLoading = true
      return SupplyApplyApi.getSupplyApply(Number(id)).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
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
