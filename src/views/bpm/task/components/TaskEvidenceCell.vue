<template>
  <!--
    Keep the compact task-cell contract in one place. ProcessTaskEvidence is
    also used by the approval timeline (where the reason is shown), so table
    cells delegate to it instead of maintaining a second evidence renderer.
  -->
  <ProcessTaskEvidence
    compact
    :reason="reason"
    :reason-label="reasonLabel"
    :attachments="normalizedAttachments"
    :sign-pic-url="normalizedSignPicUrl"
    :empty-text="emptyText"
  />
</template>

<script>
import ProcessTaskEvidence from '@/views/bpm/processInstance/detail/ProcessTaskEvidence.vue'

export default {
  name: 'BpmTaskEvidenceCell',
  components: {
    ProcessTaskEvidence
  },
  props: {
    // The API normally returns a string array. Accept a comma-separated value
    // as well so older task records render without a prop type warning.
    attachments: {
      type: [Array, String],
      default: () => []
    },
    signPicUrl: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    reasonLabel: {
      type: String,
      default: '审批意见'
    },
    emptyText: {
      type: String,
      default: '-'
    }
  },
  computed: {
    normalizedAttachments() {
      const value = this.attachments
      if (Array.isArray(value)) {
        return value
          .filter((item) => item !== undefined && item !== null && String(item).trim())
          .map((item) => String(item).trim())
      }
      if (!value) {
        return []
      }

      const text = String(value).trim()
      if (!text) {
        return []
      }
      // Some legacy responses serialized the array as JSON. Prefer that
      // representation before falling back to comma-separated parsing.
      if (text.charAt(0) === '[') {
        try {
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) {
            return parsed
              .filter((item) => item !== undefined && item !== null && String(item).trim())
              .map((item) => String(item).trim())
          }
        } catch (e) {
          // Fall through to comma-separated parsing for malformed legacy data.
        }
      }
      return text.split(',').map((item) => item.trim()).filter(Boolean)
    },
    normalizedSignPicUrl() {
      return this.signPicUrl ? String(this.signPicUrl).trim() : ''
    }
  }
}
</script>
