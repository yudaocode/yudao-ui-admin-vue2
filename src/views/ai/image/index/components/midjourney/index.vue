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
      <div class="ai-image-form__label"><strong>尺寸</strong></div>
      <div class="ai-image-sizes">
        <div
          v-for="imageSize in MidjourneySizeList"
          :key="imageSize.key"
          class="ai-image-sizes__item"
          :class="{ 'is-active': selectSize === imageSize.key }"
          @click="handleSizeClick(imageSize)"
        >
          <div class="ai-image-sizes__ratio">{{ imageSize.key }}</div>
          <div class="ai-image-sizes__meta">{{ imageSize.width }} x {{ imageSize.height }}</div>
        </div>
      </div>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>模型</strong></div>
      <div class="ai-image-models">
        <div
          v-for="model in MidjourneyModels"
          :key="model.key"
          class="ai-image-models__item"
          :class="{ 'is-active': selectModel === model.key }"
          @click="handleModelClick(model)"
        >
          <div class="ai-image-models__name">{{ model.name }}</div>
        </div>
      </div>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>版本</strong></div>
      <el-select v-model="selectVersion" class="ai-image-form__select" clearable placeholder="请选择版本">
        <el-option
          v-for="item in versionList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>参考图</strong></div>
      <UploadImg v-model="referImageUrl" height="120px" width="120px" />
    </div>

    <div class="ai-image-form__submit">
      <el-button type="primary" round :disabled="!prompt" @click="handleGenerateImage">
        {{ drawIn ? '生成中' : '生成内容' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { ImageApi } from '@/api/ai/image'
import {
  AiPlatformEnum,
  ImageHotWords,
  MidjourneyModels,
  MidjourneySizeList,
  MidjourneyVersions,
  NijiVersionList
} from '@/views/ai/utils/constants'

export default {
  name: 'ImageMidjourney',
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
      AiPlatformEnum,
      ImageHotWords,
      MidjourneyModels,
      MidjourneySizeList,
      MidjourneyVersions,
      NijiVersionList,
      drawIn: false,
      selectHotWord: '',
      prompt: '',
      referImageUrl: '',
      selectModel: 'midjourney',
      selectSize: '1:1',
      selectVersion: '6.0',
      versionList: MidjourneyVersions
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
    handleSizeClick(imageSize) {
      this.selectSize = imageSize.key
    },
    handleModelClick(model) {
      this.selectModel = model.key
      this.versionList = model.key === 'niji' ? NijiVersionList : MidjourneyVersions
      this.selectVersion = this.versionList.length > 0 ? this.versionList[0].value : undefined
    },
    async handleGenerateImage() {
      const matchedModel = this.models.find(item => {
        return item.model === this.selectModel && item.platform === AiPlatformEnum.MIDJOURNEY
      })
      if (!matchedModel) {
        this.$modal.msgError('该模型不可用，请选择其它模型')
        return
      }

      await this.$modal.confirm('确认生成内容?')
      try {
        this.drawIn = true
        this.$emit('onDrawStart', AiPlatformEnum.MIDJOURNEY)
        const imageSize = MidjourneySizeList.find(item => this.selectSize === item.key)
        await ImageApi.midjourneyImagine({
          prompt: this.prompt,
          modelId: matchedModel.id,
          base64Array: [],
          width: imageSize.width,
          height: imageSize.height,
          version: this.selectVersion,
          referImageUrl: this.referImageUrl
        })
      } finally {
        this.$emit('onDrawComplete', AiPlatformEnum.MIDJOURNEY)
        this.drawIn = false
      }
    },
    settingValues(detail) {
      this.prompt = detail.prompt
      const imageSize = MidjourneySizeList.find(item => item.key === `${detail.width}:${detail.height}`)
      if (imageSize) {
        this.selectSize = imageSize.key
      }
      const model = MidjourneyModels.find(item => item.key === detail.options.model)
      if (model) {
        this.handleModelClick(model)
      }
      if (detail.options && detail.options.version) {
        this.selectVersion = detail.options.version
      }
      this.referImageUrl = detail.options && detail.options.referImageUrl
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

.ai-image-form__chips,
.ai-image-models,
.ai-image-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-image-models__item,
.ai-image-sizes__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}

.ai-image-models__item.is-active,
.ai-image-sizes__item.is-active {
  border-color: #409eff;
}

.ai-image-models__name {
  color: #3e3e3e;
  font-weight: 600;
}

.ai-image-sizes__ratio {
  font-weight: 600;
}

.ai-image-sizes__meta {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.ai-image-form__select {
  width: 100%;
}

.ai-image-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
