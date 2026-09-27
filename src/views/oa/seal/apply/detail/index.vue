<template>
  <div v-loading="detailLoading" class="oa-seal-apply-detail">
    <!-- 用印申请信息 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="申请单号">{{ detailData.no }}</el-descriptions-item>
      <el-descriptions-item label="印章编号">{{ detailData.sealNo }}</el-descriptions-item>
      <el-descriptions-item label="印章名称">{{ detailData.sealName }}</el-descriptions-item>
      <el-descriptions-item label="印章类型">
        <dict-tag
          v-if="detailData.sealType != null"
          :type="DICT_TYPE.OA_SEAL_TYPE"
          :value="detailData.sealType"
        />
      </el-descriptions-item>
      <el-descriptions-item label="保管部门">
        {{ detailData.keeperDeptName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="保管人">{{ detailData.keeperName }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ detailData.userName }}</el-descriptions-item>
      <el-descriptions-item label="申请部门">{{ detailData.deptName }}</el-descriptions-item>
      <el-descriptions-item label="用印事由">{{ detailData.reason }}</el-descriptions-item>
      <el-descriptions-item label="文件标题">{{ detailData.documentTitle }}</el-descriptions-item>
      <el-descriptions-item label="文件类型">{{ detailData.documentType }}</el-descriptions-item>
      <el-descriptions-item label="文件份数">{{ detailData.documentCount }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.type === OaSealApplyType.CONTRACT" label="合同金额">
        {{ detailData.contractPrice }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.type === OaSealApplyType.CONTRACT" label="合同对方">
        {{ detailData.contractParty }}
      </el-descriptions-item>
      <el-descriptions-item label="预计用印时间">
        {{ detailData.expectedUseTime ? formatDate(detailData.expectedUseTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="实际用印时间">
        {{ detailData.actualUseTime ? formatDate(detailData.actualUseTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.mode === OaSealUseMode.BORROW" label="预计归还时间">
        {{ detailData.expectedReturnTime ? formatDate(detailData.expectedReturnTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.mode === OaSealUseMode.BORROW" label="实际归还时间">
        {{ detailData.actualReturnTime ? formatDate(detailData.actualReturnTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注">{{ detailData.remark }}</el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <el-tag v-if="detailData.status === BpmProcessInstanceStatus.NOT_START" type="info">未提交</el-tag>
        <dict-tag
          v-else
          :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
          :value="detailData.status === undefined || detailData.status === null ? '' : detailData.status"
        />
      </el-descriptions-item>
      <el-descriptions-item label="用印状态">
        <dict-tag :type="DICT_TYPE.OA_SEAL_USE_STATUS" :value="detailData.useStatus === undefined || detailData.useStatus === null ? '' : detailData.useStatus" />
      </el-descriptions-item>
      <el-descriptions-item label="用印类型">
        <dict-tag :type="DICT_TYPE.OA_SEAL_APPLY_TYPE" :value="detailData.type === undefined || detailData.type === null ? '' : detailData.type" />
      </el-descriptions-item>
      <el-descriptions-item label="用印方式">
        <dict-tag :type="DICT_TYPE.OA_SEAL_USE_MODE" :value="detailData.mode === undefined || detailData.mode === null ? '' : detailData.mode" />
      </el-descriptions-item>
      <el-descriptions-item label="紧急">
        <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="detailData.urgent === undefined || detailData.urgent === null ? '' : detailData.urgent" />
      </el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <upload-file :value="detailData.fileUrls || []" disabled :is-show-tip="false" />
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import * as SealApplyApi from '@/api/oa/seal/apply'
import UploadFile from '@/components/UploadFile'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { OaSealApplyType, OaSealUseMode } from '@/views/oa/utils/constants'

export default {
  name: 'OaSealApplyDetail',
  components: { UploadFile },
  props: {
    // 用印申请编号，BPM 通过业务编号传入
    id: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      OaSealApplyType,
      OaSealUseMode,
      detailLoading: false,
      detailData: {}
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
      // 获取弹窗或 BPM 传入的业务编号，兼容路由查询参数
      const id = Number(this.id || this.$route.query.id)
      if (!id) return
      this.detailLoading = true
      return SealApplyApi.getSealApply(id).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>
