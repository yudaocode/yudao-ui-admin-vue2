<template>
  <crm-transfer-form
    ref="transferForm"
    :biz-type="BizTypeEnum.CRM_CONTACT"
    @success="$emit('success')"
  />
</template>

<script>
import { BizTypeEnum } from '@/api/crm/permission'
import CrmTransferForm from '@/views/crm/permission/components/TransferForm.vue'

export default {
  name: 'CrmContactTransferForm',
  components: { CrmTransferForm },
  data() {
    return { BizTypeEnum }
  },
  methods: {
    open(id) {
      return this.$refs.transferForm.open(id)
    }
  }
}
</script>
