<template>
  <div v-loading="loading">
    <el-button
      v-if="
        detail.status === BpmProcessInstanceStatus.NOT_START &&
          String(detail.creator) === String(currentUserId)
      "
      v-hasPermi="['oa:officialdoc-send:update']"
      class="edit-btn"
      type="primary"
      size="small"
      @click="$refs.form.open('update', detail.id)"
    >编辑公文</el-button>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="公文标题">{{ detail.title }}</el-descriptions-item>
      <el-descriptions-item label="字号">{{ detail.noPrefix }}</el-descriptions-item>
      <el-descriptions-item label="年份">{{ detail.year }}</el-descriptions-item>
      <el-descriptions-item label="第几号文">{{ detail.sequence }}</el-descriptions-item>
      <el-descriptions-item label="密级">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_SECRET_LEVEL" :value="detail.secrecyLevel" />
      </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_URGENCY_LEVEL" :value="detail.urgencyLevel" />
      </el-descriptions-item>
      <el-descriptions-item label="公开类别">
        <dict-tag :type="DICT_TYPE.OA_OFFICIAL_DOC_PUBLIC_CATEGORY" :value="detail.disclosureType" />
      </el-descriptions-item>
      <el-descriptions-item label="发文日期">
        {{ detail.issueTime ? formatDate(detail.issueTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="附注">{{ detail.remark }}</el-descriptions-item>
      <el-descriptions-item label="单据编号">{{ detail.no }}</el-descriptions-item>
      <el-descriptions-item label="公文文号">{{ detail.documentNo }}</el-descriptions-item>
      <el-descriptions-item label="签发人">{{ detail.signerName }}</el-descriptions-item>
      <el-descriptions-item label="发文部门">{{ detail.sendDeptName }}</el-descriptions-item>
      <el-descriptions-item label="主送部门">
        {{ detail.mainDeptNames && detail.mainDeptNames.join('、') }}
      </el-descriptions-item>
      <el-descriptions-item label="抄送部门">
        {{ detail.copyDeptNames && detail.copyDeptNames.join('、') }}
      </el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <el-tag v-if="detail.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
          未提交
        </el-tag>
        <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detail.status" />
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
    </el-descriptions>
    <oa-official-doc-preview v-if="detail.id" :document="detail" :template="template" />
    <oa-official-doc-send-form ref="form" @success="getInfo" />
  </div>
</template>

<script>
import * as SendApi from '@/api/oa/officialdoc/send'
import * as TemplateApi from '@/api/oa/officialdoc/template'
import { DICT_TYPE } from '@/utils/dict'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import { formatDate } from '@/utils/formatTime'
import OaOfficialDocSendForm from '../OaOfficialDocSendForm.vue'
import OaOfficialDocPreview from '../../components/OaOfficialDocPreview.vue'

export default {
  name: 'OaOfficialDocSendBusinessDetail',
  components: { OaOfficialDocSendForm, OaOfficialDocPreview },
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
      detail: {},
      template: undefined
    }
  },
  computed: {
    detailId() {
      const id = this.id || this.$route.query.id
      return id ? Number(id) : undefined
    },
    currentUserId() {
      return this.$store.state.user.id
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
      SendApi.getSend(id).then(response => {
        this.detail = response.data
        if (this.detail.templateId) {
          return TemplateApi.getTemplate(this.detail.templateId).then(res => {
            this.template = res.data
          })
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.edit-btn {
  margin-bottom: 16px;
}
</style>
