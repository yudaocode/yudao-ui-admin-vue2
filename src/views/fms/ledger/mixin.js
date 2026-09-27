import { useFmsStore } from '@/views/fms/store/fms'
import { currentMonthValue } from './utils'

export default {
  data() {
    return {
      fmsStore: useFmsStore(),
      accountSetLoading: false,
      accountingMonth: currentMonthValue(),
      ledgerContextSequence: 0
    }
  },
  computed: {
    accountSetId() {
      return Number(this.fmsStore.getAccountSetId) || 0
    }
  },
  watch: {
    accountSetId: { immediate: true, handler: 'initializeLedgerContext' }
  },
  beforeDestroy() {
    this.ledgerContextSequence += 1
  },
  methods: {
    initializeLedgerContext() {
      const sequence = ++this.ledgerContextSequence
      if (!this.accountSetId) {
        this.accountingMonth = currentMonthValue()
        if (this.clearLedgerData) this.clearLedgerData()
        return Promise.resolve()
      }
      this.accountSetLoading = true
      return this.loadLedgerMonth(sequence).finally(() => {
        if (sequence === this.ledgerContextSequence) this.accountSetLoading = false
      })
    },
    loadLedgerMonth(sequence) {
      const contextSequence = sequence || ++this.ledgerContextSequence
      const id = this.accountSetId
      if (!id) return Promise.resolve()
      return this.fmsStore.loadCurrentMonth().then(currentMonth => {
        if (contextSequence !== this.ledgerContextSequence || id !== this.accountSetId) return
        this.accountingMonth = currentMonth || currentMonthValue()
        if (this.onLedgerContextReady) return this.onLedgerContextReady()
      })
    }
  }
}
