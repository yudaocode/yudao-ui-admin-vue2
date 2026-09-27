import { useFmsStore } from '@/views/fms/store/fms'
import { currentMonthValue } from './helpers'

export default {
  data() {
    return {
      fmsStore: useFmsStore(),
      accountSetLoading: false,
      currentMonth: currentMonthValue(),
      voucherContextSequence: 0
    }
  },
  computed: {
    accountSetId() {
      return Number(this.fmsStore.getAccountSetId) || 0
    },
    accountSetCompanyName() {
      const accountSet = this.fmsStore.getAccountSet
      return (accountSet && accountSet.companyName) || ''
    },
    accountSetWritable() {
      return this.fmsStore.isAccountSetWritable
    }
  },
  watch: {
    accountSetId: { immediate: true, handler: 'initializeVoucherContext' }
  },
  beforeDestroy() {
    this.voucherContextSequence += 1
  },
  methods: {
    initializeVoucherContext() {
      const sequence = ++this.voucherContextSequence
      if (!this.accountSetId) {
        this.currentMonth = currentMonthValue()
        if (this.clearVoucherData) this.clearVoucherData()
        return Promise.resolve()
      }
      this.accountSetLoading = true
      return this.loadVoucherCurrentMonth(sequence).finally(() => {
        if (sequence === this.voucherContextSequence) this.accountSetLoading = false
      })
    },
    loadVoucherCurrentMonth(sequence) {
      const contextSequence = sequence || ++this.voucherContextSequence
      const accountSetId = this.accountSetId
      if (!accountSetId) return Promise.resolve()
      return this.fmsStore.loadCurrentMonth().then(currentMonth => {
        if (contextSequence !== this.voucherContextSequence || accountSetId !== this.accountSetId) return
        this.currentMonth = currentMonth || currentMonthValue()
        if (this.onVoucherContextReady) return this.onVoucherContextReady()
      })
    }
  }
}
