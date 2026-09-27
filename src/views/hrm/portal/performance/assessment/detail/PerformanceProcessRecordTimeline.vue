<template>
  <div
    v-loading="loading"
    class="record-timeline"
  >
    <el-timeline v-if="records.length">
      <el-timeline-item
        v-for="(record, index) in records"
        :key="(record.operateTime || '') + '-' + index"
        :timestamp="formatHrmDateTime(record.operateTime)"
        placement="top"
      >
        <div class="record-title"><span>{{ record.title || '-' }}</span><span
          v-if="record.operatorName"
          class="record-operator"
        >{{ record.operatorName }}</span></div>
        <div class="record-content">{{ record.content || '-' }}</div>
        <div
          v-if="record.fileUrls && record.fileUrls.length"
          class="record-files"
        >
          <el-link
            v-for="url in record.fileUrls"
            :key="url"
            type="primary"
            :underline="false"
            @click="openSafeUrl(url)"
          >
            <i class="el-icon-paperclip" /> {{ getFileNameFromUrl(url) }}
          </el-link>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty
      v-else-if="!loading"
      description="暂无流程记录"
    />
  </div>
</template>

<script>
import { getFileNameFromUrl } from '@/utils/file'
import { openSafeUrl } from '@/utils/url'
import { formatHrmDateTime } from '@/views/hrm/utils/format'

export default {
  name: 'HrmPerformanceProcessRecordTimeline',
  props: { records: { type: Array, required: true }, loading: { type: Boolean, default: false }},
  methods: { getFileNameFromUrl, openSafeUrl, formatHrmDateTime }
}
</script>

<style scoped>
.record-timeline { min-height: 180px; padding: 12px 8px 0; }
.record-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-weight: 600; }
.record-operator { color: #909399; font-size: 13px; font-weight: 400; }
.record-content { margin-top: 6px; color: #606266; line-height: 1.6; white-space: pre-wrap; }
.record-files { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
</style>
