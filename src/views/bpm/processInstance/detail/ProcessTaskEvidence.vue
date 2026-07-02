<template>
  <div
    v-if="reason || attachments.length || signPicUrl"
    :class="['task-evidence', { 'task-evidence--compact': compact }]"
  >
    <div v-if="reason" class="task-evidence__reason">
      {{ reasonLabel }}：{{ reason }}
    </div>

    <div v-if="attachments.length" class="task-evidence__section">
      <div v-if="!compact" class="task-evidence__label">附件列表：</div>
      <div class="task-evidence__attachments">
        <template v-for="attachment in attachments">
          <el-image
            v-if="isImageFile(attachment)"
            :key="attachment"
            class="task-evidence__image"
            :src="attachment"
            :preview-src-list="[attachment]"
            fit="cover"
          />
          <el-link
            v-else
            :key="attachment"
            :href="attachment"
            :underline="false"
            target="_blank"
            type="primary"
            class="task-evidence__file"
            :title="getFileNameFromUrl(attachment)"
          >
            <i class="el-icon-document"></i>
            {{ getFileNameFromUrl(attachment) }}
          </el-link>
        </template>
      </div>
    </div>

    <div v-if="signPicUrl" class="task-evidence__section">
      <div class="task-evidence__label">签名：</div>
      <el-image
        class="task-evidence__sign"
        :src="signPicUrl"
        :preview-src-list="[signPicUrl]"
        fit="contain"
      />
    </div>
  </div>
  <span v-else-if="compact" class="task-evidence-empty">{{ emptyText }}</span>
</template>

<script>
import { getFileNameFromUrl, isImageFile } from '@/utils/file'

export default {
  name: 'ProcessTaskEvidence',
  props: {
    reason: {
      type: String,
      default: ''
    },
    reasonLabel: {
      type: String,
      default: '审批意见'
    },
    attachments: {
      type: Array,
      default: () => []
    },
    signPicUrl: {
      type: String,
      default: ''
    },
    compact: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '-'
    }
  },
  methods: {
    getFileNameFromUrl,
    isImageFile
  }
}
</script>

<style scoped>
.task-evidence {
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  color: #909399;
  font-size: 13px;
  background: #f5f7fa;
  border-radius: 4px;
}

.task-evidence--compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin-top: 0;
  background: transparent;
}

.task-evidence__section + .task-evidence__section,
.task-evidence__reason + .task-evidence__section {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #dcdfe6;
}

.task-evidence--compact .task-evidence__section + .task-evidence__section,
.task-evidence--compact .task-evidence__reason + .task-evidence__section {
  padding-top: 0;
  margin-top: 0;
  border-top: 0;
}

.task-evidence__label {
  margin-bottom: 4px;
  color: #a8abb2;
  font-size: 12px;
  font-weight: 600;
}

.task-evidence__attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-evidence--compact .task-evidence__attachments {
  justify-content: center;
}

.task-evidence__image {
  width: 32px;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.task-evidence__file {
  max-width: 220px;
}

.task-evidence__file ::v-deep .el-link--inner {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-evidence__sign {
  width: 180px;
  height: 60px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.task-evidence-empty {
  color: #c0c4cc;
}
</style>
