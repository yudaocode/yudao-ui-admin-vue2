<template>
  <!-- 云盘概览，独立于列表筛选 -->
  <div v-if="storage" class="oa-file-storage">
    <div class="oa-file-storage__title">云盘概览</div>
    <div class="oa-file-storage__grid">
      <div>
        <div class="oa-file-storage__label">我的文件</div>
        <div class="oa-file-storage__value">{{ storage.fileCount }}</div>
      </div>
      <div>
        <div class="oa-file-storage__label">我共享的</div>
        <div class="oa-file-storage__value">{{ storage.sharedCount }}</div>
      </div>
      <div>
        <div class="oa-file-storage__label">共享给我的</div>
        <div class="oa-file-storage__value">{{ storage.receivedCount }}</div>
      </div>
      <div>
        <div class="oa-file-storage__label">存储空间</div>
        <div class="oa-file-storage__space">
          <div class="oa-file-storage__usage">
            {{ formatFileSize(storage.usedSize) }} / {{ formatFileSize(storage.totalSize) }}
          </div>
          <el-progress
            :percentage="Math.min(100, (storage.usedSize / storage.totalSize) * 100)"
            :show-text="false"
            :stroke-width="4"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as NodeApi from '@/api/oa/file/node'
import { formatFileSize } from '@/utils/file'

export default {
  name: 'OaFileStorage',
  data() {
    return {
      storage: undefined // 云盘容量与共享统计
    }
  },
  created() {
    this.getStorage()
  },
  methods: {
    formatFileSize,
    /** 查询云盘概览 */
    getStorage() {
      return NodeApi.getFileStorage().then(response => {
        this.storage = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-file-storage {
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 4px;

  &__title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 700;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  &__label {
    margin-bottom: 4px;
    font-size: 12px;
    color: #909399;
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
  }

  &__space {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    height: 28px;
  }

  &__usage {
    font-size: 12px;
    line-height: 16px;
  }
}
</style>
