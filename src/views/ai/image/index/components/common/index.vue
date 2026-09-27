<template>
  <div class="ai-image-form">
    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>画面描述</strong></div>
      <p class="ai-image-form__hint">建议使用“形容词 + 动词 + 风格”的格式，使用“，”隔开</p>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="5"
        maxlength="1024"
        show-word-limit
        placeholder="例如：童话里的小屋应该是什么样子？"
      />
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>随机热词</strong></div>
      <div class="ai-image-form__chips">
        <el-button
          v-for="hotWord in ImageHotWords"
          :key="hotWord"
          round
          :type="selectHotWord === hotWord ? 'primary' : 'default'"
          @click="handleHotWordClick(hotWord)"
        >
          {{ hotWord }}
        </el-button>
      </div>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>平台</strong></div>
      <el-select v-model="otherPlatform" placeholder="请选择平台" class="ai-image-form__select" @change="handlerPlatformChange">
        <el-option
          v-for="item in OtherPlatformEnum"
          :key="item.key"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>模型</strong></div>
      <el-select v-model="modelId" placeholder="请选择模型" class="ai-image-form__select">
        <el-option
          v-for="item in platformModels"
          :key="item.id"
          :label="item.name || item.model"
          :value="item.id"
        />
      </el-select>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>图片尺寸</strong></div>
      <div class="ai-image-form__size-row">
        <el-input v-model="width" type="number" placeholder="图片宽度" />
        <el-input v-model="height" type="number" placeholder="图片高度" />
      </div>
    </div>

    <div class="ai-image-form__submit">
      <el-button type="primary" round :loading="drawIn" :disabled="!prompt" @click="handleGenerateImage">
        {{ drawIn ? '生成中' : '生成内容' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { ImageApi } from '@/api/ai/image'
import { AiPlatformEnum, ImageHotWords, OtherPlatformEnum } from '@/views/ai/utils/constants'

export default {
  name: 'ImageCommon',
  props: {
    models: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      ImageHotWords,
      OtherPlatformEnum,
      AiPlatformEnum,
      drawIn: false,
      selectHotWord: '',
      prompt: '',
      width: 512,
      height: 512,
      otherPlatform: AiPlatformEnum.TONG_YI,
      platformModels: [],
      modelId: undefined
    }
  },
  watch: {
    models: {
      handler() {
        this.handlerPlatformChange(this.otherPlatform)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleHotWordClick(hotWord) {
      if (this.selectHotWord === hotWord) {
        this.selectHotWord = ''
        return
      }
      this.selectHotWord = hotWord
      this.prompt = hotWord
    },
    async handleGenerateImage() {
      await this.$modal.confirm('确认生成内容?')
      try {
        this.drawIn = true
        this.$emit('onDrawStart', this.otherPlatform)
        await ImageApi.drawImage({
          platform: this.otherPlatform,
          modelId: this.modelId,
          prompt: this.prompt,
          width: this.width,
          height: this.height,
          options: {}
        })
      } finally {
        this.$emit('onDrawComplete', this.otherPlatform)
        this.drawIn = false
      }
    },
    settingValues(detail) {
      this.otherPlatform = detail.platform
      this.handlerPlatformChange(detail.platform)
      this.prompt = detail.prompt
      this.width = detail.width
      this.height = detail.height
      const matchedModel = this.platformModels.find(item => item.model === detail.model)
      if (matchedModel) {
        this.modelId = matchedModel.id
      }
    },
    handlerPlatformChange(platform) {
      this.platformModels = this.models.filter(item => item.platform === platform)
      this.modelId = this.platformModels.length > 0 ? this.platformModels[0].id : undefined
    }
  }
}
</script>

<style scoped>
.ai-image-form {
  padding-right: 8px;
}

.ai-image-form__field {
  margin-bottom: 30px;
}

.ai-image-form__label {
  margin-bottom: 12px;
}

.ai-image-form__hint {
  margin: 6px 0 12px;
  color: #909399;
  font-size: 12px;
}

.ai-image-form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-image-form__select {
  width: 100%;
}

.ai-image-form__size-row {
  display: flex;
  gap: 10px;
}

.ai-image-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
