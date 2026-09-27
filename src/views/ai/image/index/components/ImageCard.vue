<template>
  <el-card class="image-card" shadow="never">
    <div class="image-card__header">
      <div class="image-card__status">
        <el-tag v-if="detail.status === AiImageStatusEnum.IN_PROGRESS" type="warning" size="mini">生成中</el-tag>
        <el-tag v-else-if="detail.status === AiImageStatusEnum.SUCCESS" type="success" size="mini">已完成</el-tag>
        <el-tag v-else-if="detail.status === AiImageStatusEnum.FAIL" type="danger" size="mini">异常</el-tag>
      </div>
      <div class="image-card__actions">
        <el-button type="text" icon="el-icon-download" @click="handleButtonClick('download')" />
        <el-button type="text" icon="el-icon-refresh-right" @click="handleButtonClick('regeneration')" />
        <el-button type="text" icon="el-icon-delete" @click="handleButtonClick('delete')" />
        <el-button type="text" icon="el-icon-more" @click="handleButtonClick('more')" />
      </div>
    </div>

    <div class="image-card__preview" v-loading="cardLoading">
      <el-image
        class="image-card__image"
        :src="detail.picUrl"
        :preview-src-list="detail.picUrl ? [detail.picUrl] : []"
        fit="cover"
      />
      <div v-if="detail.status === AiImageStatusEnum.FAIL" class="image-card__error">
        {{ detail.errorMessage || '生成失败' }}
      </div>
    </div>

    <div class="image-card__buttons" v-if="detail.buttons && detail.buttons.length">
      <el-button
        v-for="button in detail.buttons"
        :key="button.customId"
        size="mini"
        class="image-card__button"
        @click="handleMidjourneyBtnClick(button)"
      >
        {{ button.label }}{{ button.emoji }}
      </el-button>
    </div>
  </el-card>
</template>

<script>
import { AiImageStatusEnum } from '@/views/ai/utils/constants'

export default {
  name: 'ImageCard',
  props: {
    detail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      AiImageStatusEnum,
      cardLoading: false
    }
  },
  watch: {
    detail: {
      handler(val) {
        this.handleLoading(val && val.status)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.handleLoading(this.detail && this.detail.status)
  },
  beforeDestroy() {
    this.cardLoading = false
  },
  methods: {
    handleButtonClick(type) {
      this.$emit('onBtnClick', type, this.detail)
    },
    handleMidjourneyBtnClick(button) {
      this.$modal.confirm(`确认操作 "${button.label} ${button.emoji}" ?`).then(() => {
        this.$emit('onMjBtnClick', button, this.detail)
      })
    },
    handleLoading(status) {
      this.cardLoading = status === AiImageStatusEnum.IN_PROGRESS
    }
  }
}
</script>

<style scoped>
.image-card {
  width: 320px;
  min-height: 380px;
  border-radius: 10px;
}

.image-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.image-card__actions {
  display: flex;
  gap: 4px;
}

.image-card__preview {
  position: relative;
  height: 280px;
  margin-top: 20px;
  overflow: hidden;
}

.image-card__image {
  width: 100%;
  border-radius: 10px;
}

.image-card__error {
  margin-top: 8px;
  color: #f56c6c;
  word-break: break-all;
}

.image-card__buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 6px;
}

.image-card__button {
  min-width: 40px;
  margin-top: 5px;
  margin-right: 10px;
  margin-left: 0;
}
</style>
