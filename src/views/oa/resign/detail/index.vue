<template>
  <div v-loading="detailLoading" class="oa-resign-apply-detail">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题" :span="2"> {{ detailData.title }} </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.OA_APPLY_URGENCY" :value="detailData.urgency" />
      </el-descriptions-item>
      <el-descriptions-item label="工作交接人">
        <user-select-v2 :value="detailData.handoverUserId" disabled />
      </el-descriptions-item>
      <el-descriptions-item label="未完成事宜" :span="2">
        <span class="pre-wrap">{{ detailData.unfinishedWork }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请原因" :span="2">
        <span class="pre-wrap">{{ detailData.reason }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="是否有费用报销未完成">
        <dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="detailData.hasPendingReimbursement"
        />
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
  </div>
</template>

<script>
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import * as ResignApplyApi from '@/api/oa/resign'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/views/oa/utils/constants'

export default {
  name: 'OaResignApplyDetail',
  components: { UserSelectV2 },
  props: {
    // 离职申请编号，BPM 通过业务编号传入
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
      detailData: { hasPendingReimbursement: false } // 详情数据
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
    /** 查询详情 */
    getInfo() {
      if (!this.detailId) {
        return
      }
      this.detailLoading = true
      return ResignApplyApi.getResignApply(Number(this.detailId)).then(response => {
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
</style>
