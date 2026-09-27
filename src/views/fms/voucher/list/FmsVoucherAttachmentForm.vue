<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="凭证附件" width="570px">
    <file-upload
      v-if="editable"
      v-model="attachmentValue"
      :file-type="FMS_VOUCHER_ATTACHMENT_FILE_TYPES"
      :limit="100"
    />
    <ul v-else-if="attachmentUrls.length" class="attachment-list">
      <li v-for="(url, index) in attachmentUrls" :key="url + index">
        <el-link :href="url" target="_blank" type="primary">{{ fileName(url) }}</el-link>
      </li>
    </ul>
    <el-empty v-else description="暂无附件" />
    <div slot="footer">
      <template v-if="editable">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="formLoading" type="primary" @click="submitForm">保 存</el-button>
      </template>
      <el-button v-else type="primary" @click="dialogVisible = false">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherApi } from '@/api/fms/voucher'
import { checkPermi } from '@/utils/permission'
import { useFmsStore } from '@/views/fms/store/fms'
import { FMS_VOUCHER_ATTACHMENT_FILE_TYPES, FMS_VOUCHER_STATUS } from '../helpers'

export default {
  name: 'FmsVoucherAttachmentForm',
  data() {
    return {
      FMS_VOUCHER_ATTACHMENT_FILE_TYPES,
      fmsStore: useFmsStore(),
      dialogVisible: false,
      formLoading: false,
      accountSetId: 0,
      voucherId: 0,
      attachmentUrls: [],
      editable: false
    }
  },
  computed: {
    attachmentValue: {
      get() {
        return this.attachmentUrls.join(',')
      },
      set(value) {
        this.attachmentUrls = String(value || '').split(',').filter(Boolean)
      }
    }
  },
  methods: {
    open(accountSetId, voucher) {
      this.accountSetId = Number(accountSetId) || 0
      this.voucherId = Number(voucher && voucher.id) || 0
      this.attachmentUrls = Array.isArray(voucher && voucher.attachmentUrls)
        ? voucher.attachmentUrls.slice()
        : []
      this.editable = Boolean(
        this.fmsStore.isAccountSetWritable && voucher &&
        Number(voucher.status) === FMS_VOUCHER_STATUS.PENDING_REVIEW &&
        !voucher.closingGenerated && checkPermi(['fms:voucher:update'])
      )
      this.dialogVisible = true
    },
    fileName(url) {
      const parts = String(url || '').split('/')
      return decodeURIComponent(parts[parts.length - 1] || '附件')
    },
    submitForm() {
      if (!this.accountSetId || !this.voucherId || !this.editable) return
      this.formLoading = true
      FmsVoucherApi.updateVoucherAttachments({
        id: this.voucherId,
        accountSetId: this.accountSetId,
        attachmentUrls: this.attachmentUrls
      }).then(() => {
        this.$modal.msgSuccess('附件保存成功')
        this.dialogVisible = false
        this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    }
  }
}
</script>

<style scoped>
.attachment-list { min-height: 120px; padding-left: 22px; }
.attachment-list li { margin: 8px 0; }
</style>
