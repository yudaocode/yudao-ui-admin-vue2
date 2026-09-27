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
      <div class="ai-image-form__label"><strong>模型选择</strong></div>
      <div class="ai-image-models">
        <div
          v-for="model in Dall3Models"
          :key="model.key"
          class="ai-image-models__item"
          :class="{ 'is-active': selectModel === model.key }"
        >
          <el-image
            class="ai-image-models__image"
            :src="model.image"
            fit="contain"
            @click="handleModelClick(model)"
          />
          <div class="ai-image-models__name">{{ model.name }}</div>
        </div>
      </div>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>风格选择</strong></div>
      <div class="ai-image-models">
        <div
          v-for="imageStyle in Dall3StyleList"
          :key="imageStyle.key"
          class="ai-image-models__item"
          :class="{ 'is-active': style === imageStyle.key }"
        >
          <el-image
            class="ai-image-models__image"
            :src="imageStyle.image"
            fit="contain"
            @click="handleStyleClick(imageStyle)"
          />
          <div class="ai-image-models__name">{{ imageStyle.name }}</div>
        </div>
      </div>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>画面比例</strong></div>
      <div class="ai-image-sizes">
        <div
          v-for="imageSize in Dall3SizeList"
          :key="imageSize.key"
          class="ai-image-sizes__item"
          :class="{ 'is-active': selectSize === imageSize.key }"
          @click="handleSizeClick(imageSize)"
        >
          <div class="ai-image-sizes__ratio">{{ imageSize.name }}</div>
          <div class="ai-image-sizes__meta">{{ imageSize.width }} x {{ imageSize.height }}</div>
        </div>
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
import {
  AiPlatformEnum,
  Dall3Models,
  Dall3SizeList,
  Dall3StyleList,
  ImageHotWords
} from '@/views/ai/utils/constants'

export default {
  name: 'ImageDall3',
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
      Dall3Models,
      Dall3StyleList,
      Dall3SizeList,
      ImageHotWords,
      prompt: '',
      drawIn: false,
      selectHotWord: '',
      selectModel: 'dall-e-3',
      selectSize: '1024x1024',
      style: 'vivid'
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
    handleModelClick(model) {
      this.selectModel = model.key
      this.style = model.key === 'dall-e-2' ? 'natural' : 'vivid'
      const recommendedSize = Dall3SizeList.find(size => {
        return (model.key === 'dall-e-3' && size.key === '1024x1024') ||
          (model.key === 'dall-e-2' && size.key === '512x512')
      })
      if (recommendedSize) {
        this.selectSize = recommendedSize.key
      }
    },
    handleStyleClick(imageStyle) {
      this.style = imageStyle.key
    },
    handleSizeClick(imageSize) {
      this.selectSize = imageSize.key
    },
    async handleGenerateImage() {
      const matchedModel = this.models.find(item => {
        return item.model === this.selectModel && item.platform === AiPlatformEnum.OPENAI
      })
      if (!matchedModel) {
        this.$modal.msgError('该模型不可用，请选择其它模型')
        return
      }

      await this.$modal.confirm('确认生成内容?')
      try {
        this.drawIn = true
        this.$emit('onDrawStart', AiPlatformEnum.OPENAI)
        const imageSize = Dall3SizeList.find(item => item.key === this.selectSize)
        await ImageApi.drawImage({
          platform: AiPlatformEnum.OPENAI,
          prompt: this.prompt,
          modelId: matchedModel.id,
          style: this.style,
          width: Number(imageSize.width),
          height: Number(imageSize.height),
          options: {
            style: this.style
          }
        })
      } finally {
        this.$emit('onDrawComplete', AiPlatformEnum.OPENAI)
        this.drawIn = false
      }
    },
    settingValues(detail) {
      this.prompt = detail.prompt
      this.selectModel = detail.model
      this.style = detail.options && detail.options.style
      const imageSize = Dall3SizeList.find(item => item.key === `${detail.width}x${detail.height}`)
      if (imageSize) {
        this.handleSizeClick(imageSize)
      }
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
  min-width: 110px;
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

.ai-image-models__image {
  width: 110px;
  height: 62px;
}

.ai-image-sizes__ratio {
  font-weight: 600;
}

.ai-image-sizes__meta {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.ai-image-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
