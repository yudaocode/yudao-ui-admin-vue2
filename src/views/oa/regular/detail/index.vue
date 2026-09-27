<template>
  <div v-loading="detailLoading" class="oa-regular-apply-detail">
    <!-- 转正申请信息 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题" :span="2"> {{ detailData.title }} </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.OA_APPLY_URGENCY" :value="detailData.urgency" />
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ formatDate(detailData.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ formatDate(detailData.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="试用期心得" :span="2">
        <span class="pre-wrap">{{ detailData.experience }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="岗位职责理解" :span="2">
        <span class="pre-wrap">{{ detailData.understanding }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="试用期成长" :span="2">
        <span class="pre-wrap">{{ detailData.growth }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="目前不足" :span="2">
        <span class="pre-wrap">{{ detailData.deficiency }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="工作改进" :span="2">
        <span class="pre-wrap">{{ detailData.improvement }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品意见建议" :span="2">
        <span class="pre-wrap">{{ detailData.suggestion }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="天数"> {{ detailData.days }} </el-descriptions-item>
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
import * as RegularApplyApi from '@/api/oa/regular'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/views/oa/utils/constants'

export default {
  name: 'OaRegularApplyDetail',
  props: {
    // 转正申请编号，BPM 通过业务编号传入
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
      detailData: {} // 详情数据
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
      return RegularApplyApi.getRegularApply(Number(this.detailId)).then(response => {
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
