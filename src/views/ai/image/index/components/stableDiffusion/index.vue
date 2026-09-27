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
          v-for="hotWord in ImageHotEnglishWords"
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
      <div class="ai-image-form__label"><strong>采样方法</strong></div>
      <el-select v-model="sampler" placeholder="请选择采样方法" class="ai-image-form__select">
        <el-option
          v-for="item in StableDiffusionSamplers"
          :key="item.key"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>CLIP</strong></div>
      <el-select v-model="clipGuidancePreset" placeholder="请选择 CLIP" class="ai-image-form__select">
        <el-option
          v-for="item in StableDiffusionClipGuidancePresets"
          :key="item.key"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>风格</strong></div>
      <el-select v-model="stylePreset" placeholder="请选择风格" class="ai-image-form__select">
        <el-option
          v-for="item in StableDiffusionStylePresets"
          :key="item.key"
          :label="item.name"
          :value="item.key"
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

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>迭代步数</strong></div>
      <el-input v-model="steps" type="number" placeholder="Please input" />
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>引导系数</strong></div>
      <el-input v-model="scale" type="number" placeholder="Please input" />
    </div>

    <div class="ai-image-form__field">
      <div class="ai-image-form__label"><strong>随机因子</strong></div>
      <el-input v-model="seed" type="number" placeholder="Please input" />
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
import { hasChinese } from '@/views/ai/utils/utils'
import {
  AiPlatformEnum,
  ImageHotEnglishWords,
  StableDiffusionClipGuidancePresets,
  StableDiffusionSamplers,
  StableDiffusionStylePresets
} from '@/views/ai/utils/constants'

export default {
  name: 'ImageStableDiffusion',
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
      ImageHotEnglishWords,
      StableDiffusionSamplers,
      StableDiffusionClipGuidancePresets,
      StableDiffusionStylePresets,
      drawIn: false,
      selectHotWord: '',
      prompt: '',
      width: 512,
      height: 512,
      sampler: 'DDIM',
      steps: 20,
      seed: 42,
      scale: 7.5,
      clipGuidancePreset: 'NONE',
      stylePreset: '3d-model'
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
      const selectModel = 'stable-diffusion-v1-6'
      const matchedModel = this.models.find(item => {
        return item.model === selectModel && item.platform === AiPlatformEnum.STABLE_DIFFUSION
      })
      if (!matchedModel) {
        this.$modal.msgError('该模型不可用，请选择其它模型')
        return
      }
      if (hasChinese(this.prompt)) {
        this.$modal.msgWarning('暂不支持中文！')
        return
      }
      await this.$modal.confirm('确认生成内容?')
      try {
        this.drawIn = true
        this.$emit('onDrawStart', AiPlatformEnum.STABLE_DIFFUSION)
        await ImageApi.drawImage({
          modelId: matchedModel.id,
          prompt: this.prompt,
          width: this.width,
          height: this.height,
          options: {
            seed: this.seed,
            steps: this.steps,
            scale: this.scale,
            sampler: this.sampler,
            clipGuidancePreset: this.clipGuidancePreset,
            stylePreset: this.stylePreset
          }
        })
      } finally {
        this.$emit('onDrawComplete', AiPlatformEnum.STABLE_DIFFUSION)
        this.drawIn = false
      }
    },
    settingValues(detail) {
      this.prompt = detail.prompt
      this.width = detail.width
      this.height = detail.height
      this.seed = detail.options && detail.options.seed
      this.steps = detail.options && detail.options.steps
      this.scale = detail.options && detail.options.scale
      this.sampler = detail.options && detail.options.sampler
      this.clipGuidancePreset = detail.options && detail.options.clipGuidancePreset
      this.stylePreset = detail.options && detail.options.stylePreset
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
