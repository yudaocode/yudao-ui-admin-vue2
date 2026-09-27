<template>
  <div v-loading="loading">
    <!-- 公文信息 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="收文类型">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_RECEIVE_TYPE" :value="detail.receiveType" />
      </el-descriptions-item>
      <el-descriptions-item label="收文时间">
        {{ detail.receiveTime ? formatDate(detail.receiveTime) : '' }}
      </el-descriptions-item>
      <!-- 关联发文信息 -->
      <template v-if="detail.sendId">
        <el-descriptions-item label="发文单位">{{ detail.sendDeptName }}</el-descriptions-item>
        <el-descriptions-item label="发文日期">
          {{ detail.issueTime ? formatDate(detail.issueTime, 'YYYY-MM-DD') : '' }}
        </el-descriptions-item>
        <el-descriptions-item label="签发人">{{ detail.signerName }}</el-descriptions-item>
        <el-descriptions-item label="公开类别">
          <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_PUBLIC_CATEGORY" :value="detail.disclosureType" />
        </el-descriptions-item>
      </template>
      <el-descriptions-item label="领导批示">{{ detail.instruction }}</el-descriptions-item>
      <el-descriptions-item label="办理结果">{{ detail.result }}</el-descriptions-item>
      <el-descriptions-item label="办理期限">
        {{ detail.deadlineTime ? formatDate(detail.deadlineTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="内容摘要">{{ detail.summary }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ detail.remark }}</el-descriptions-item>
      <el-descriptions-item label="单据编号">{{ detail.no }}</el-descriptions-item>
      <el-descriptions-item label="公文标题">{{ detail.title }}</el-descriptions-item>
      <el-descriptions-item label="来文字号">{{ detail.documentNo }}</el-descriptions-item>
      <el-descriptions-item label="密级">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_SECRET_LEVEL" :value="detail.secrecyLevel" />
      </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_URGENCY_LEVEL" :value="detail.urgencyLevel" />
      </el-descriptions-item>
      <el-descriptions-item label="收文部门">{{ detail.receiveDeptName }}</el-descriptions-item>
      <el-descriptions-item label="主办人">{{ detail.handlerName }}</el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <el-tag v-if="detail.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
          未提交
        </el-tag>
        <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detail.status" />
      </el-descriptions-item>
      <el-descriptions-item label="办理状态">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_HANDLE_STATUS" :value="detail.handleStatus" />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ detail.createTime ? formatDate(detail.createTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <upload-file :model-value="detail.fileUrls || []" disabled :is-show-tip="false" />
      </el-descriptions-item>
      <el-descriptions-item label="正式公文" :span="2">
        <upload-file :model-value="detail.formalFileUrl || ''" disabled :is-show-tip="false" />
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.sendId" label="关联发文" :span="2">
        <el-button type="text" size="mini" @click="openSendDetail">查看关联发文</el-button>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 正式公文预览 -->
    <file-preview
      v-if="detail.formalFileUrl"
      class="mt-16px"
      :url="detail.formalFileUrl"
      downloadable
    />
    <!-- 关联发文详情弹窗 -->
    <oa-official-doc-send-detail ref="sendDetail" />
  </div>
</template>

<script>
import * as ReceiveApi from '@/api/oa/officialdoc/receive'
import { DICT_TYPE } from '@/utils/dict'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { formatDate } from '@/utils/formatTime'
import OaOfficialDocSendDetail from '../../send/OaOfficialDocSendDetail.vue'
import FilePreview from '@/components/FilePreview'

export default {
  name: 'OaOfficialDocReceiveBusinessDetail',
  components: { OaOfficialDocSendDetail, FilePreview },
  props: {
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
      detail: {}
    }
  },
  computed: {
    detailId() {
      const id = this.id || this.$route.query.id
      return id ? Number(id) : undefined
    }
  },
  watch: {
    detailId: {
      handler() {
        this.getInfo()
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    // 查询详情
    getInfo() {
      const id = this.detailId
      if (!id) {
        return
      }
      this.loading = true
      ReceiveApi.getReceive(id).then(response => {
        this.detail = response.data
      }).finally(() => {
        this.loading = false
      })
    },
    // 查看关联发文
    openSendDetail() {
      this.$refs.sendDetail.open(this.detail.sendId)
    }
  }
}
</script>

<style scoped>
.mt-16px {
  margin-top: 16px;
}
</style>
